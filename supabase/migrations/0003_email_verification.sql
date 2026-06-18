-- Ventora Idea Check — Phase 5 (Email verification) schema
-- Run against your Supabase project (SQL editor or `supabase db push`).

-- Short-lived 6-digit codes that gate the full report. Codes are stored hashed
-- (HMAC), never in plaintext. One active (unconsumed, unexpired) row per email
-- is enforced in code by invalidating prior codes on each new request.
create table if not exists public.email_verifications (
  id          uuid primary key default gen_random_uuid(),
  email       text not null,
  code_hash   text not null,
  expires_at  timestamptz not null,
  attempts    int not null default 0,
  consumed_at timestamptz,
  created_at  timestamptz not null default now()
);

-- Lookups are always by email (latest active code, recent-request counting).
create index if not exists email_verifications_email_idx
  on public.email_verifications (email);

-- RLS on: all access goes through the server with the service-role key, which
-- bypasses RLS. No client-side policies are granted, so the anon key sees nothing.
alter table public.email_verifications enable row level security;
