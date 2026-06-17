import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Verdict } from "@/lib/types";

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
