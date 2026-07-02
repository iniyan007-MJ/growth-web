-- ============================================================
--  SUPABASE SQL SETUP — Daily Growth App v5
--  Run in: Supabase → SQL Editor → New Query → Run All
-- ============================================================

-- 1. profiles (NO email column — fixes schema cache error)
create table if not exists profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  username   text,
  gender     text default 'female',
  created_at timestamptz default now()
);

-- ✅ FIX 4: Drop email col if previously added (fixes the error)
alter table profiles drop column if exists email;

-- 2. daily_entries
create table if not exists daily_entries (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references profiles(id) on delete cascade,
  entry_date   date not null,
  answers      jsonb default '{}',
  comments     jsonb default '{}',
  score        int default 0,
  mood_journal text,
  saved_at     timestamptz,
  created_at   timestamptz default now(),
  unique(user_id, entry_date)
);

-- 3. tasks
create table if not exists tasks (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references profiles(id) on delete cascade,
  entry_date date not null,
  name       text not null,
  category   text default 'other',
  done       boolean default false,
  created_at timestamptz default now()
);

-- 4. RLS
alter table profiles      enable row level security;
alter table daily_entries enable row level security;
alter table tasks         enable row level security;

-- Profiles
drop policy if exists "profiles_select_all" on profiles;
drop policy if exists "profiles_insert_own" on profiles;
drop policy if exists "profiles_update_own" on profiles;
create policy "profiles_select_all" on profiles for select using (true);
create policy "profiles_insert_own" on profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on profiles for update using (auth.uid() = id);

-- Daily entries
drop policy if exists "entries_own_all"  on daily_entries;
drop policy if exists "entries_read_all" on daily_entries;
create policy "entries_own_all"  on daily_entries for all    using (auth.uid() = user_id);
create policy "entries_read_all" on daily_entries for select using (true);

-- Tasks
drop policy if exists "tasks_all_own" on tasks;
create policy "tasks_all_own" on tasks for all using (auth.uid() = user_id);

-- Done!
