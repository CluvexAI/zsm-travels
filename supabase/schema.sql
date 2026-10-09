-- ZSM Travel — backend storage for bookings, leads, escalations and metadata.
-- Run once in the Supabase SQL Editor (https://supabase.com/dashboard → SQL).
-- The frontend writes these tables with the anon key, so each table is locked
-- behind RLS with a permissive anon policy.

create table if not exists public.zsm_bookings (
  id         text primary key,
  data       jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.zsm_leads (
  id         text primary key,
  data       jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.zsm_escalations (
  id         text primary key,
  data       jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.zsm_key_value (
  key        text primary key,
  value      jsonb,
  updated_at timestamptz not null default now()
);

alter table public.zsm_bookings    enable row level security;
alter table public.zsm_leads       enable row level security;
alter table public.zsm_escalations enable row level security;
alter table public.zsm_key_value   enable row level security;

drop policy if exists "anon all bookings"    on public.zsm_bookings;
drop policy if exists "anon all leads"       on public.zsm_leads;
drop policy if exists "anon all escalations" on public.zsm_escalations;
drop policy if exists "anon all key value"   on public.zsm_key_value;

create policy "anon all bookings"    on public.zsm_bookings    for all to anon using (true) with check (true);
create policy "anon all leads"       on public.zsm_leads       for all to anon using (true) with check (true);
create policy "anon all escalations" on public.zsm_escalations for all to anon using (true) with check (true);
create policy "anon all key value"   on public.zsm_key_value   for all to anon using (true) with check (true);

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.zsm_bookings    to anon, authenticated;
grant select, insert, update, delete on public.zsm_leads       to anon, authenticated;
grant select, insert, update, delete on public.zsm_escalations to anon, authenticated;
grant select, insert, update, delete on public.zsm_key_value   to anon, authenticated;
