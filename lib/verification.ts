import "server-only";

import { verificationCode } from "@/lib/email/templates";
import {
  CODE_TTL_MS,
  MAX_ATTEMPTS,
  MAX_CODES_PER_HOUR,
  RESEND_COOLDOWN_MS,
  generateCode,
  hashCode,
  verifyCodeHash,
} from "@/lib/otp";
import { sendNurtureEmail } from "@/lib/resend";
import {
  consumeVerification,
  consumeVerificationsForEmail,
  countRecentVerifications,
  getLastVerificationTime,
  getLatestVerification,
  insertVerification,
  setVerificationAttempts,
} from "@/lib/supabase";

export type RequestCodeResult =
  | { ok: true }
  | { ok: false; error: "cooldown" | "rate_limited" };

export type VerifyResult =
  | { ok: true }
  | {
      ok: false;
      error: "code_invalid" | "code_expired" | "too_many_attempts";
    };

const HOUR_MS = 60 * 60 * 1000;

/**
 * Issues a fresh code: enforces a per-email resend cooldown and an hourly cap,
 * invalidates any outstanding codes, stores the new hash, and emails it.
 */
export async function requestCode(email: string): Promise<RequestCodeResult> {
  const last = await getLastVerificationTime(email);
  if (last !== null && Date.now() - last < RESEND_COOLDOWN_MS) {
    return { ok: false, error: "cooldown" };
  }

  const sinceIso = new Date(Date.now() - HOUR_MS).toISOString();
  const recent = await countRecentVerifications(email, sinceIso);
  if (recent >= MAX_CODES_PER_HOUR) {
    return { ok: false, error: "rate_limited" };
  }

  const code = generateCode();
  await consumeVerificationsForEmail(email);
  await insertVerification({
    email,
    codeHash: hashCode(email, code),
    expiresAt: new Date(Date.now() + CODE_TTL_MS).toISOString(),
  });

  const isDev = process.env.NODE_ENV !== "production";
  if (isDev) {
    console.log(`[otp] verification code for ${email}: ${code}`);
  }

  const tpl = verificationCode(code);
  try {
    await sendNurtureEmail({
      to: email,
      subject: tpl.subject,
      html: tpl.html,
      text: tpl.text,
    });
  } catch (err) {
    // In dev (no verified Resend domain) the code is already logged above, so a
    // delivery failure shouldn't block testing. In production it's a real error.
    if (!isDev) throw err;
    console.warn("[otp] email send failed (dev) — use the logged code", err);
  }

  return { ok: true };
}

/**
 * Checks a submitted code against the latest active row, counting attempts and
 * honoring expiry. Consumes the code on success so it can't be replayed.
 */
export async function verifyCode(
  email: string,
  code: string,
): Promise<VerifyResult> {
  const row = await getLatestVerification(email);
  if (!row) return { ok: false, error: "code_expired" };

  if (new Date(row.expiresAt).getTime() < Date.now()) {
    await consumeVerification(row.id);
    return { ok: false, error: "code_expired" };
  }

  if (row.attempts >= MAX_ATTEMPTS) {
    await consumeVerification(row.id);
    return { ok: false, error: "too_many_attempts" };
  }

  if (!verifyCodeHash(email, code, row.codeHash)) {
    const attempts = row.attempts + 1;
    await setVerificationAttempts(row.id, attempts);
    if (attempts >= MAX_ATTEMPTS) {
      await consumeVerification(row.id);
      return { ok: false, error: "too_many_attempts" };
    }
    return { ok: false, error: "code_invalid" };
  }

  await consumeVerification(row.id);
  return { ok: true };
}
