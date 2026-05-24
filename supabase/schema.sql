create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  telegram_id text unique,
  username text,
  first_name text,
  last_name text,
  avatar_url text,
  plan text not null default 'free',
  plus_expires_at timestamptz,
  plus_source text,
  plus_updated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.users add column if not exists plan text not null default 'free';
alter table public.users add column if not exists plus_expires_at timestamptz;
alter table public.users add column if not exists plus_source text;
alter table public.users add column if not exists plus_updated_at timestamptz;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'users_plan_check'
  ) then
    alter table public.users
      add constraint users_plan_check check (plan in ('free', 'plus'));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'users_plus_source_check'
  ) then
    alter table public.users
      add constraint users_plus_source_check check (
        plus_source is null or plus_source in ('manual', 'telegram_stars', 'click', 'payme', 'atmos', 'stripe', 'google_play')
      );
  end if;
end $$;

create table if not exists public.user_progress (
  user_id uuid primary key references public.users(id) on delete cascade,
  progress jsonb not null default '{}'::jsonb,
  xp integer not null default 0,
  streak integer not null default 0,
  feathers integer not null default 0,
  completed_lessons text[] not null default '{}',
  achievements text[] not null default '{}',
  last_chest_claim text,
  settings jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  provider text not null,
  provider_payment_id text,
  amount numeric not null default 0,
  currency text not null default 'USD',
  status text not null default 'pending',
  plan text not null default 'plus_monthly',
  period_days integer not null default 30,
  created_at timestamptz not null default now(),
  paid_at timestamptz,
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists payments_provider_payment_id_idx
  on public.payments(provider, provider_payment_id);

create index if not exists payments_user_created_at_idx
  on public.payments(user_id, created_at desc);

create table if not exists public.user_lessons (
  id bigserial primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  lesson_id text not null,
  completed boolean not null default false,
  current_exercise_index integer not null default 0,
  correct integer not null default 0,
  incorrect integer not null default 0,
  updated_at timestamptz not null default now(),
  unique(user_id, lesson_id)
);

create table if not exists public.user_achievements (
  id bigserial primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  achievement_id text not null,
  unlocked_at timestamptz not null default now(),
  unique(user_id, achievement_id)
);

create table if not exists public.daily_rewards (
  id bigserial primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  reward_date text not null,
  rewards jsonb not null default '[]'::jsonb,
  claimed_at timestamptz not null default now(),
  unique(user_id, reward_date)
);

create table if not exists public.streak_data (
  user_id uuid primary key references public.users(id) on delete cascade,
  streak integer not null default 0,
  max_streak integer not null default 0,
  streak_freezes integer not null default 0,
  last_active_date text,
  updated_at timestamptz not null default now()
);

alter table public.users enable row level security;
alter table public.user_progress enable row level security;
alter table public.payments enable row level security;
alter table public.user_lessons enable row level security;
alter table public.user_achievements enable row level security;
alter table public.daily_rewards enable row level security;
alter table public.streak_data enable row level security;

drop policy if exists "Users can read own profile" on public.users;
drop policy if exists "Users can insert own profile" on public.users;
drop policy if exists "Users can update own profile" on public.users;
drop policy if exists "Users can manage own progress" on public.user_progress;
drop policy if exists "Users can read own payments" on public.payments;
drop policy if exists "Users can manage own lessons" on public.user_lessons;
drop policy if exists "Users can manage own achievements" on public.user_achievements;
drop policy if exists "Users can manage own daily rewards" on public.daily_rewards;
drop policy if exists "Users can manage own streak data" on public.streak_data;

create policy "Users can read own profile" on public.users
  for select using (auth.uid() = id);

create policy "Users can insert own profile" on public.users
  for insert with check (auth.uid() = id);

create policy "Users can update own profile" on public.users
  for update using (auth.uid() = id);

create policy "Users can manage own progress" on public.user_progress
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can read own payments" on public.payments
  for select using (auth.uid() = user_id);

create policy "Users can manage own lessons" on public.user_lessons
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can manage own achievements" on public.user_achievements
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can manage own daily rewards" on public.daily_rewards
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can manage own streak data" on public.streak_data
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
