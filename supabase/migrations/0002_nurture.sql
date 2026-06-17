-- Ventora Idea Check — Phase 4 (Nurture) schema
-- Run against your Supabase project (SQL editor or `supabase db push`).

-- Persist the generated advanced report so the day-0 recap email can reference
-- it and so users don't lose it on refresh.
alter table public.leads
  add column if not exists report jsonb;

-- Resend email IDs for the scheduled day-2 / day-5 follow-ups, kept so we can
-- cancel pending sends when a lead unsubscribes.
alter table public.leads
  add column if not exists scheduled_email_ids text[];

-- Set when a lead opts out via one-click unsubscribe.
alter table public.leads
  add column if not exists unsubscribed_at timestamptz;
