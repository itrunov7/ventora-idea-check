import "server-only";

import { createHmac, randomInt, timingSafeEqual } from "node:crypto";

export const CODE_LENGTH = 6;
export const CODE_TTL_MS = 10 * 60 * 1000;
export const MAX_ATTEMPTS = 5;
export const RESEND_COOLDOWN_MS = 30 * 1000;
export const MAX_CODES_PER_HOUR = 5;

// Full-report generation cap per confirmed email, on a rolling window.
export const REPORTS_PER_WINDOW = 3;
export const REPORT_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

function otpSecret(): string {
  const secret = process.env.OTP_SECRET;
  if (!secret) {
    throw new Error("OTP signing is not configured. Set OTP_SECRET.");
  }
  return secret;
}

/** Cryptographically-random zero-padded 6-digit code. */
export function generateCode(): string {
  return randomInt(0, 10 ** CODE_LENGTH)
    .toString()
    .padStart(CODE_LENGTH, "0");
}

/** HMAC of the code bound to the email, so a stolen DB row can't be reversed. */
export function hashCode(email: string, code: string): string {
  return createHmac("sha256", otpSecret())
    .update(`${email.trim().toLowerCase()}:${code}`)
    .digest("hex");
}

/** Constant-time comparison of a submitted code against a stored hash. */
export function verifyCodeHash(
  email: string,
  code: string,
  storedHash: string,
): boolean {
  const expected = Buffer.from(hashCode(email, code));
  const actual = Buffer.from(storedHash);
  if (expected.length !== actual.length) return false;
  return timingSafeEqual(expected, actual);
}
