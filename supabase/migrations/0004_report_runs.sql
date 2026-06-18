-- Ventora Idea Check — Phase 6 (Usage limits) schema
-- Run against your Supabase project (SQL editor or `supabase db push`).

-- Append-only log of generated full reports. Used to enforce a rolling
-- per-email cap (3 reports / 7 days). Distinct from leads.report, which only
-- holds the latest report per email and can't represent usage history.
create table if not exists public.report_runs (
  id         uuid primary key default gen_random_uuid(),
  email      text not null,
  idea_hash  text not null,
  created_at timestamptz not null default now()
);

-- The limit check counts recent rows per email; index for that access pattern.
create index if not exists report_runs_email_created_idx
  on public.report_runs (email, created_at desc);

-- RLS on: all access goes through the server with the service-role key, which
-- bypasses RLS. No client-side policies are granted, so the anon key sees nothing.
alter table public.report_runs enable row level security;
