-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/zynadcpqsmxulhkcwzrl/sql
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  username text unique,
  name text not null,
  picture text,
  auth_provider text not null check (auth_provider in ('google', 'email')),
  password_hash text,
  google_sub text unique,
  created_at timestamptz not null default now(),
  last_login_at timestamptz not null default now(),
  llm_calls_used integer not null default 0,
  llm_call_limit integer not null default 25
);

create index if not exists users_email_idx on public.users (email);
create index if not exists users_username_idx on public.users (username);

alter table public.users enable row level security;

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists chat_messages_user_created_idx
  on public.chat_messages (user_id, created_at);

alter table public.chat_messages enable row level security;

-- Backend uses service role key; no public policies required for now.
