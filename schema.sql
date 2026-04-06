-- Music Maestro — Supabase Schema
-- Safe to run multiple times (uses IF NOT EXISTS / OR REPLACE)

-- ── Profiles (one per user) ──────────────────────────────────────
create table if not exists public.profiles (
  id              uuid references auth.users(id) on delete cascade primary key,
  name            text,
  grade           int default 1,
  exam_board      text default 'ameb',
  is_unlocked     boolean default false,
  is_admin        boolean default false,
  stripe_customer_id text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

alter table public.profiles enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename='profiles' and policyname='Users can read own profile') then
    create policy "Users can read own profile"   on public.profiles for select using (auth.uid() = id);
  end if;
  if not exists (select 1 from pg_policies where tablename='profiles' and policyname='Users can update own profile') then
    create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
  end if;
  if not exists (select 1 from pg_policies where tablename='profiles' and policyname='Users can insert own profile') then
    create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);
  end if;
end $$;

-- ── Concept mastery ───────────────────────────────────────────────
create table if not exists public.progress (
  id        uuid default gen_random_uuid() primary key,
  user_id   uuid references auth.users(id) on delete cascade,
  module    text not null,
  concept   text not null,
  correct   int default 0,
  wrong     int default 0,
  last_seen timestamptz default now(),
  unique(user_id, module, concept)
);

alter table public.progress enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename='progress' and policyname='Users can manage own progress') then
    create policy "Users can manage own progress" on public.progress for all using (auth.uid() = user_id);
  end if;
end $$;

-- ── Daily challenges ──────────────────────────────────────────────
create table if not exists public.daily_challenges (
  id        uuid default gen_random_uuid() primary key,
  user_id   uuid references auth.users(id) on delete cascade,
  date      date not null,
  score     int default 0,
  completed boolean default false,
  created_at timestamptz default now(),
  unique(user_id, date)
);

alter table public.daily_challenges enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename='daily_challenges' and policyname='Users can manage own daily challenges') then
    create policy "Users can manage own daily challenges" on public.daily_challenges for all using (auth.uid() = user_id);
  end if;
end $$;

-- ── Auto-create profile on signup ─────────────────────────────────
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name)
  values (new.id, new.raw_user_meta_data->>'name')
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── Updated_at trigger ────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at before update on public.profiles
  for each row execute procedure public.set_updated_at();
