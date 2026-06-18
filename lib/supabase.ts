import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Evaluation, Verdict } from "@/lib/types";

let client: SupabaseClient | null = null;

/**
 * Service-role Supabase client. Server-only — the service role key bypasses RLS
 * and must never reach the browser. Lazily created so missing env during build
 * doesn't crash module evaluation.
 */
function getClient(): SupabaseClient {
  if (client) return client;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}

export async function getLeadByEmail(email: string): Promise<boolean> {
  const { data, error } = await getClient()
    .from("leads")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (error) throw error;
  return data !== null;
}

export type LeadRecord = {
  idea: string;
  verdict: Verdict | null;
  report: Evaluation | null;
  scheduledEmailIds: string[];
};

/** Full lead row needed to decide whether to reuse a saved report. Null if unknown. */
export async function getLeadRecord(
  email: string,
): Promise<LeadRecord | null> {
  const { data, error } = await getClient()
    .from("leads")
    .select("idea, verdict, report, scheduled_email_ids")
    .eq("email", email)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return {
    idea: data.idea,
    verdict: (data.verdict as Verdict | null) ?? null,
    report: (data.report as Evaluation | null) ?? null,
    scheduledEmailIds: data.scheduled_email_ids ?? [],
  };
}

/** Postgres unique-violation code, surfaced when the same email races two inserts. */
export const UNIQUE_VIOLATION = "23505";

export async function insertLead(input: {
  email: string;
  idea: string;
  verdict: Verdict;
}): Promise<{ ok: true } | { ok: false; duplicate: boolean }> {
  const { error } = await getClient().from("leads").insert({
    email: input.email,
    idea: input.idea,
    verdict: input.verdict,
  });

  if (error) {
    return { ok: false, duplicate: error.code === UNIQUE_VIOLATION };
  }
  return { ok: true };
}

/**
 * Insert or update a lead with the latest idea/verdict/report. Used after a
 * verified unlock so returning users (who pass the email gate again) can re-run.
 */
export async function upsertLeadReport(input: {
  email: string;
  idea: string;
  verdict: Verdict;
  report: Evaluation;
}): Promise<void> {
  const { error } = await getClient()
    .from("leads")
    .upsert(
      {
        email: input.email,
        idea: input.idea,
        verdict: input.verdict,
        report: input.report,
      },
      { onConflict: "email" },
    );
  if (error) throw error;
}

/** Persist the generated evaluation + scheduled Resend ids for a captured lead. */
export async function updateLeadNurture(
  email: string,
  input: { evaluation: Evaluation; scheduledEmailIds: string[] },
): Promise<void> {
  const { error } = await getClient()
    .from("leads")
    .update({
      report: input.evaluation,
      scheduled_email_ids: input.scheduledEmailIds,
    })
    .eq("email", email);
  if (error) throw error;
}

// --- Email verification (OTP) -------------------------------------------------

export type VerificationRow = {
  id: string;
  codeHash: string;
  expiresAt: string;
  attempts: number;
};

export async function insertVerification(input: {
  email: string;
  codeHash: string;
  expiresAt: string;
}): Promise<void> {
  const { error } = await getClient().from("email_verifications").insert({
    email: input.email,
    code_hash: input.codeHash,
    expires_at: input.expiresAt,
  });
  if (error) throw error;
}

/** Latest unconsumed code for an email (may be expired — caller checks). */
export async function getLatestVerification(
  email: string,
): Promise<VerificationRow | null> {
  const { data, error } = await getClient()
    .from("email_verifications")
    .select("id, code_hash, expires_at, attempts")
    .eq("email", email)
    .is("consumed_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return {
    id: data.id,
    codeHash: data.code_hash,
    expiresAt: data.expires_at,
    attempts: data.attempts,
  };
}

export async function setVerificationAttempts(
  id: string,
  attempts: number,
): Promise<void> {
  const { error } = await getClient()
    .from("email_verifications")
    .update({ attempts })
    .eq("id", id);
  if (error) throw error;
}

export async function consumeVerification(id: string): Promise<void> {
  const { error } = await getClient()
    .from("email_verifications")
    .update({ consumed_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

/** Invalidate all of an email's outstanding codes (called before issuing a new one). */
export async function consumeVerificationsForEmail(
  email: string,
): Promise<void> {
  const { error } = await getClient()
    .from("email_verifications")
    .update({ consumed_at: new Date().toISOString() })
    .eq("email", email)
    .is("consumed_at", null);
  if (error) throw error;
}

/** Count codes issued to an email since `sinceIso` (mail-bomb cap). */
export async function countRecentVerifications(
  email: string,
  sinceIso: string,
): Promise<number> {
  const { count, error } = await getClient()
    .from("email_verifications")
    .select("id", { count: "exact", head: true })
    .eq("email", email)
    .gte("created_at", sinceIso);

  if (error) throw error;
  return count ?? 0;
}

/** Created_at of the most recent code for an email (for the resend cooldown). */
export async function getLastVerificationTime(
  email: string,
): Promise<number | null> {
  const { data, error } = await getClient()
    .from("email_verifications")
    .select("created_at")
    .eq("email", email)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return new Date(data.created_at).getTime();
}

export type LeadUnsubState = {
  scheduledEmailIds: string[];
  unsubscribedAt: string | null;
};

/** Lead fields needed to process an unsubscribe. Null if the email is unknown. */
export async function getLeadForUnsub(
  email: string,
): Promise<LeadUnsubState | null> {
  const { data, error } = await getClient()
    .from("leads")
    .select("scheduled_email_ids, unsubscribed_at")
    .eq("email", email)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return {
    scheduledEmailIds: data.scheduled_email_ids ?? [],
    unsubscribedAt: data.unsubscribed_at ?? null,
  };
}

export async function markUnsubscribed(email: string): Promise<void> {
  const { error } = await getClient()
    .from("leads")
    .update({ unsubscribed_at: new Date().toISOString() })
    .eq("email", email);
  if (error) throw error;
}

export async function getPreview(ideaHash: string): Promise<string | null> {
  const { data, error } = await getClient()
    .from("previews")
    .select("image_url")
    .eq("idea_hash", ideaHash)
    .maybeSingle();

  if (error) throw error;
  return data?.image_url ?? null;
}

export async function savePreview(
  ideaHash: string,
  imageUrl: string,
): Promise<void> {
  const { error } = await getClient()
    .from("previews")
    .upsert(
      { idea_hash: ideaHash, image_url: imageUrl, status: "completed" },
      { onConflict: "idea_hash" },
    );
  if (error) throw error;
}

// --- Report usage limits ------------------------------------------------------

/** Count full reports generated for an email since `sinceIso` (weekly cap). */
export async function countReportRunsSince(
  email: string,
  sinceIso: string,
): Promise<number> {
  const { count, error } = await getClient()
    .from("report_runs")
    .select("id", { count: "exact", head: true })
    .eq("email", email)
    .gte("created_at", sinceIso);

  if (error) throw error;
  return count ?? 0;
}

/** Log one generated full report against an email (append-only usage record). */
export async function insertReportRun(
  email: string,
  ideaHash: string,
): Promise<void> {
  const { error } = await getClient().from("report_runs").insert({
    email,
    idea_hash: ideaHash,
  });
  if (error) throw error;
}
