-- Live sessions, exams, and exam attempts persistence

create extension if not exists "pgcrypto";

create table if not exists public.live_sessions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  meeting_link text not null default '',
  scheduled_date text not null default '',
  scheduled_time text not null default '',
  status text not null default 'upcoming' check (status in ('upcoming', 'live', 'completed')),
  created_at timestamptz not null default now()
);

create table if not exists public.exams (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  total_time_minutes integer not null default 60,
  time_per_question_seconds integer,
  passing_score integer not null default 70,
  max_attempts integer not null default 1,
  randomize_questions boolean not null default false,
  randomize_answers boolean not null default false,
  show_answers_after boolean not null default false,
  questions jsonb not null default '[]'::jsonb,
  assigned_to jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.exam_attempts (
  id uuid primary key default gen_random_uuid(),
  exam_id uuid not null references public.exams(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  answers jsonb not null default '{}'::jsonb,
  score numeric,
  passed boolean,
  status text not null default 'in_progress' check (status in ('in_progress', 'submitted', 'expired'))
);

create index if not exists exam_attempts_user_id_idx on public.exam_attempts(user_id);
create index if not exists exam_attempts_exam_id_idx on public.exam_attempts(exam_id);

-- RLS
alter table public.live_sessions enable row level security;
alter table public.exams enable row level security;
alter table public.exam_attempts enable row level security;

-- Helper to check if the requester is an active admin
create or replace function public.is_active_admin() returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.users
    where id = auth.uid()
      and role = 'admin'
      and status = 'active'
  );
$$;

-- live_sessions: any authenticated user can read; only admins can write
drop policy if exists "live_sessions read" on public.live_sessions;
create policy "live_sessions read" on public.live_sessions
  for select using (auth.role() = 'authenticated');

drop policy if exists "live_sessions admin write" on public.live_sessions;
create policy "live_sessions admin write" on public.live_sessions
  for all using (public.is_active_admin())
  with check (public.is_active_admin());

-- exams: any authenticated user can read; only admins can write
drop policy if exists "exams read" on public.exams;
create policy "exams read" on public.exams
  for select using (auth.role() = 'authenticated');

drop policy if exists "exams admin write" on public.exams;
create policy "exams admin write" on public.exams
  for all using (public.is_active_admin())
  with check (public.is_active_admin());

-- exam_attempts: users see their own, admins see all
drop policy if exists "exam_attempts user read" on public.exam_attempts;
create policy "exam_attempts user read" on public.exam_attempts
  for select using (user_id = auth.uid() or public.is_active_admin());

-- users can insert their own attempts (still no answer-key access — questions are filtered server-side)
drop policy if exists "exam_attempts user insert" on public.exam_attempts;
create policy "exam_attempts user insert" on public.exam_attempts
  for insert with check (user_id = auth.uid());

-- only the owner (or admin) can update an attempt (e.g. submit answers)
drop policy if exists "exam_attempts user update" on public.exam_attempts;
create policy "exam_attempts user update" on public.exam_attempts
  for update using (user_id = auth.uid() or public.is_active_admin())
  with check (user_id = auth.uid() or public.is_active_admin());

drop policy if exists "exam_attempts admin delete" on public.exam_attempts;
create policy "exam_attempts admin delete" on public.exam_attempts
  for delete using (public.is_active_admin());
