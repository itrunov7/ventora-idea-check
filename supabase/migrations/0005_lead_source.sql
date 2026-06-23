-- Ventora Idea Check — Phase F0 (Finder wire-in) schema
-- Run against your Supabase project (SQL editor or `supabase db push`).

-- Which funnel captured the lead: 'check' (Idea Check) or 'find' (Idea Finder).
-- Lets us measure each funnel separately. Defaults to 'check' so existing rows
-- and any legacy writes stay attributed to the original funnel.
alter table public.leads
  add column if not exists source text not null default 'check';
