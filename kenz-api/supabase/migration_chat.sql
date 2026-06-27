-- Run in Supabase SQL Editor if you already created the users table:
-- https://supabase.com/dashboard/project/zynadcpqsmxulhkcwzrl/sql

-- Usage limits for free tier
alter table public.users
  add column if not exists llm_calls_used integer not null default 0,
  add column if not exists llm_call_limit integer not null default 50;

-- Persist chat history per user
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
