-- Run in Supabase SQL Editor after schema.sql
-- Stores trip plans from the Pre-Planning Hub

create table if not exists public.trip_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  destination text,
  travel_style text,
  duration integer not null default 7,
  travelers integer not null default 1,
  budget_total integer,
  accommodation text,
  transport text,
  start_date timestamptz,
  plan_data jsonb not null default '{}'::jsonb,
  budget_breakdown jsonb,
  share_token text unique not null default encode(gen_random_bytes(9), 'hex'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists trip_plans_user_created_idx
  on public.trip_plans (user_id, created_at desc);

create index if not exists trip_plans_share_token_idx
  on public.trip_plans (share_token);

alter table public.trip_plans enable row level security;
