-- =========================================================
-- تطوير أعمالي — Supabase schema
-- Run in Supabase SQL Editor
-- =========================================================

-- 1) Enable UUID extension (usually already enabled)
create extension if not exists "uuid-ossp";

-- 2) Universal table creator for each collection
-- Each table has: id (text), user_id (uuid), data columns as jsonb-friendly fields.

-- ---------------------------
-- IDEAS
-- ---------------------------
create table if not exists public.ideas (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade,
  name text,
  description text,
  status text default 'idea',
  priority text default 'medium',
  rating int default 3,
  category text,
  archived boolean default false,
  converted_project_id text,
  created_at bigint,
  updated_at bigint
);
create index if not exists ideas_user_idx on public.ideas(user_id);
create index if not exists ideas_status_idx on public.ideas(status);

-- ---------------------------
-- PROJECTS
-- ---------------------------
create table if not exists public.projects (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade,
  name text,
  description text,
  status text default 'planning',
  priority text default 'medium',
  owner text,
  budget numeric default 0,
  budget_used numeric default 0,
  start_date date,
  end_date date,
  source_idea_id text,
  archived boolean default false,
  created_at bigint,
  updated_at bigint
);
create index if not exists projects_user_idx on public.projects(user_id);
create index if not exists projects_status_idx on public.projects(status);

-- ---------------------------
-- TASKS
-- ---------------------------
create table if not exists public.tasks (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade,
  project_id text,
  title text,
  assignee text,
  status text default 'todo',
  priority text default 'medium',
  due_date date,
  created_at bigint,
  updated_at bigint
);
create index if not exists tasks_user_idx on public.tasks(user_id);
create index if not exists tasks_project_idx on public.tasks(project_id);
create index if not exists tasks_status_idx on public.tasks(status);

-- ---------------------------
-- DEALS (Sales Pipeline)
-- ---------------------------
create table if not exists public.deals (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade,
  client text,
  value numeric default 0,
  stage text default 'lead',
  probability int default 0,
  expected_close date,
  owner text,
  notes text,
  created_at bigint,
  updated_at bigint
);
create index if not exists deals_user_idx on public.deals(user_id);
create index if not exists deals_stage_idx on public.deals(stage);

-- ---------------------------
-- SWOT
-- ---------------------------
create table if not exists public.swot (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade,
  quadrant text,
  text text,
  created_at bigint,
  updated_at bigint
);
create index if not exists swot_user_idx on public.swot(user_id);

-- ---------------------------
-- PESTEL
-- ---------------------------
create table if not exists public.pestel (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade,
  category text,
  text text,
  created_at bigint,
  updated_at bigint
);
create index if not exists pestel_user_idx on public.pestel(user_id);

-- ---------------------------
-- OKRs (Objectives & Key Results, self-referencing)
-- ---------------------------
create table if not exists public.okrs (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade,
  parent_id text,
  title text,
  type text,
  target numeric default 100,
  current numeric default 0,
  due_date date,
  status text default 'active',
  created_at bigint,
  updated_at bigint
);
create index if not exists okrs_user_idx on public.okrs(user_id);
create index if not exists okrs_parent_idx on public.okrs(parent_id);

-- ---------------------------
-- SDG
-- ---------------------------
create table if not exists public.sdg (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade,
  project_id text,
  number int,
  score int default 0,
  indicators text,
  created_at bigint,
  updated_at bigint
);
create index if not exists sdg_user_idx on public.sdg(user_id);

-- ---------------------------
-- ESG
-- ---------------------------
create table if not exists public.esg (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade,
  project_id text,
  pillar text,
  score int default 0,
  created_at bigint,
  updated_at bigint
);
create index if not exists esg_user_idx on public.esg(user_id);

-- ---------------------------
-- P5
-- ---------------------------
create table if not exists public.p5 (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade,
  pillar text,
  score int default 0,
  created_at bigint,
  updated_at bigint
);
create index if not exists p5_user_idx on public.p5(user_id);

-- ---------------------------
-- MEDDIC
-- ---------------------------
create table if not exists public.meddic (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade,
  deal_id text,
  key text,
  score int default 0,
  notes text,
  created_at bigint,
  updated_at bigint
);
create index if not exists meddic_user_idx on public.meddic(user_id);

-- ---------------------------
-- RISKS
-- ---------------------------
create table if not exists public.risks (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade,
  project_id text,
  title text,
  description text,
  severity text default 'med',
  created_at bigint,
  updated_at bigint
);
create index if not exists risks_user_idx on public.risks(user_id);
create index if not exists risks_project_idx on public.risks(project_id);

-- ---------------------------
-- MILESTONES
-- ---------------------------
create table if not exists public.milestones (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade,
  project_id text,
  title text,
  description text,
  date date,
  done boolean default false,
  created_at bigint,
  updated_at bigint
);
create index if not exists milestones_user_idx on public.milestones(user_id);
create index if not exists milestones_project_idx on public.milestones(project_id);

-- ---------------------------
-- FILES
-- ---------------------------
create table if not exists public.files (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade,
  project_id text,
  name text,
  url text,
  size bigint default 0,
  mime text,
  created_at bigint,
  updated_at bigint
);
create index if not exists files_user_idx on public.files(user_id);

-- ---------------------------
-- NOTES
-- ---------------------------
create table if not exists public.notes (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade,
  project_id text,
  text text,
  created_at bigint,
  updated_at bigint
);
create index if not exists notes_user_idx on public.notes(user_id);

-- ---------------------------
-- KPIS
-- ---------------------------
create table if not exists public.kpis (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade,
  project_id text,
  name text,
  target numeric default 0,
  current numeric default 0,
  unit text,
  created_at bigint,
  updated_at bigint
);
create index if not exists kpis_user_idx on public.kpis(user_id);

-- =========================================================
-- ROW LEVEL SECURITY — each user only sees their own rows
-- =========================================================
do $$
declare
  t text;
  tables text[] := array[
    'ideas','projects','tasks','deals','swot','pestel','okrs',
    'sdg','esg','p5','meddic','risks','milestones','files','notes','kpis'
  ];
begin
  foreach t in array tables loop
    execute format('alter table public.%I enable row level security;', t);

    -- Drop existing policies to avoid duplicates on re-run
    execute format('drop policy if exists "own_select" on public.%I;', t);
    execute format('drop policy if exists "own_insert" on public.%I;', t);
    execute format('drop policy if exists "own_update" on public.%I;', t);
    execute format('drop policy if exists "own_delete" on public.%I;', t);

    -- Create policies
    execute format(
      'create policy "own_select" on public.%I for select using (auth.uid() = user_id);', t
    );
    execute format(
      'create policy "own_insert" on public.%I for insert with check (auth.uid() = user_id);', t
    );
    execute format(
      'create policy "own_update" on public.%I for update using (auth.uid() = user_id) with check (auth.uid() = user_id);', t
    );
    execute format(
      'create policy "own_delete" on public.%I for delete using (auth.uid() = user_id);', t
    );
  end loop;
end $$;

-- =========================================================
-- DONE
-- Every table is now protected by RLS.
-- Users must sign in via the app (email/password) to sync data.
-- =========================================================