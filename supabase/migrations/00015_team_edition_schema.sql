-- Phase 1: Team Edition schema foundation
-- Adds teams table, pipeline_role to profiles, team_id + created_by to deals

-- 1. Teams table
create table if not exists teams (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  created_at timestamptz not null default now()
);

-- RLS: authenticated users can read teams (needed for join queries later)
alter table teams enable row level security;

create policy "Authenticated users can read teams"
  on teams for select
  to authenticated
  using (true);

-- 2. Add pipeline_role to profiles (separate from existing app role)
alter table profiles
  add column if not exists pipeline_role text check (pipeline_role in ('rep', 'manager'));

-- 3. Add team_id and created_by to profiles
alter table profiles
  add column if not exists team_id uuid references teams(id) on delete set null;

-- 4. Add team_id and created_by to deals
alter table deals
  add column if not exists team_id    uuid references teams(id) on delete set null,
  add column if not exists created_by uuid references profiles(id) on delete set null;

-- 5. Seed a default team and assign existing deals + profiles to it
do $$
declare
  default_team_id uuid;
begin
  insert into teams (name) values ('Default Team')
  returning id into default_team_id;

  -- Assign all existing deals to the default team
  update deals set team_id = default_team_id where team_id is null;

  -- Assign all existing profiles to the default team
  update profiles set team_id = default_team_id where team_id is null;
end $$;

-- 6. Backfill created_by from user_id for existing deals
update deals set created_by = user_id where created_by is null;
