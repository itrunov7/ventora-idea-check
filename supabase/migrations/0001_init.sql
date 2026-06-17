-- Ventora Idea Check — Phase 2 schema
-- Run against your Supabase project (SQL editor or `supabase db push`).

-- Captured leads. One free run per email is enforced by the UNIQUE constraint.
create table if not exists public.leads (
  id          uuid primary key default gen_random_uuid(),
  email       text not null unique,
  idea        text not null,
  verdict     jsonb,
  created_at  timestamptz not null default now()
);

-- Image cache keyed by idea-hash so identical ideas never re-bill Higgsfield.
create table if not exists public.previews (
  idea_hash   text primary key,
  image_url   text,
  status      text,
  created_at  timestamptz not null default now()
);

-- RLS on: all access goes through the server with the service-role key, which
-- bypasses RLS. No client-side policies are granted, so the anon key sees nothing.
alter table public.leads enable row level security;
alter table public.previews enable row level security;
