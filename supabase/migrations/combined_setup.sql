-- ─────────────────────────────────────────────────────────────────────────────
-- Northstar — Combined setup for Supabase (permissive RLS for prototype)
-- Paste this entire script into the SQL Editor at:
-- https://supabase.com/dashboard/project/wupzqgxdfaqsbtodjssm/sql
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ── Enums ─────────────────────────────────────────────────────────────────────

DO $$ BEGIN
  create type item_type       as enum ('project', 'milestone', 'task');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  create type item_status     as enum ('not_started', 'in_progress', 'at_risk', 'complete');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  create type priority_level  as enum ('p0', 'p1', 'p2', 'p3');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  create type okr_status      as enum ('on_track', 'at_risk', 'off_track');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  create type metric_type     as enum ('number', 'percentage', 'currency', 'binary');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  create type activity_type   as enum ('status_change', 'progress', 'created', 'checkin');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  create type workspace_role  as enum ('owner', 'admin', 'member', 'viewer');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- ── Workspaces ──────────────────────────────────────────────────────────────

create table if not exists workspaces (
  id          text primary key default gen_random_uuid()::text,
  name        text not null,
  slug        text not null unique,
  created_by  text,
  created_at  timestamptz not null default now()
);

-- ── Team members ──────────────────────────────────────────────────────────────

create table if not exists team_members (
  id            text primary key default gen_random_uuid()::text,
  name          text not null,
  email         text not null,
  avatar_url    text not null default '',
  role          text not null default 'Member',
  workspace_id  text references workspaces(id) on delete cascade,
  created_at    timestamptz not null default now()
);

-- ── Timeline items ────────────────────────────────────────────────────────────

create table if not exists timeline_items (
  id            text primary key default gen_random_uuid()::text,
  title         text not null,
  description   text not null default '',
  type          item_type not null default 'task',
  parent_id     text references timeline_items(id) on delete set null,
  status        item_status not null default 'not_started',
  priority      priority_level not null default 'p2',
  owner_id      text,
  start_date    date not null,
  end_date      date not null,
  progress      integer not null default 0 check (progress between 0 and 100),
  dependencies  text[] not null default '{}',
  tags          text[] not null default '{}',
  group_id      text not null default '',
  workspace_id  text references workspaces(id) on delete cascade,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

DROP TRIGGER IF EXISTS timeline_items_updated_at ON timeline_items;
create trigger timeline_items_updated_at
  before update on timeline_items
  for each row execute procedure update_updated_at();

-- ── Objectives ────────────────────────────────────────────────────────────────

create table if not exists objectives (
  id          text primary key default gen_random_uuid()::text,
  title       text not null,
  description text not null default '',
  owner_id    text,
  period      text not null,
  period_type text not null default 'quarterly',
  department  text not null default '',
  is_draft    boolean not null default false,
  status      okr_status not null default 'on_track',
  workspace_id text references workspaces(id) on delete cascade,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

DROP TRIGGER IF EXISTS objectives_updated_at ON objectives;
create trigger objectives_updated_at
  before update on objectives
  for each row execute procedure update_updated_at();

-- ── Key results ───────────────────────────────────────────────────────────────

create table if not exists key_results (
  id              text primary key default gen_random_uuid()::text,
  objective_id    text not null references objectives(id) on delete cascade,
  title           text not null,
  owner_id        text,
  metric_type     metric_type not null default 'number',
  start_value     numeric not null default 0,
  current_value   numeric not null default 0,
  target_value    numeric not null default 100,
  confidence      okr_status not null default 'on_track',
  weight          numeric not null default 0,
  workspace_id    text references workspaces(id) on delete cascade,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

DROP TRIGGER IF EXISTS key_results_updated_at ON key_results;
create trigger key_results_updated_at
  before update on key_results
  for each row execute procedure update_updated_at();

-- ── Check-ins ─────────────────────────────────────────────────────────────────

create table if not exists check_ins (
  id              text primary key default gen_random_uuid()::text,
  key_result_id   text not null references key_results(id) on delete cascade,
  value           numeric not null,
  note            text not null default '',
  workspace_id    text references workspaces(id) on delete cascade,
  created_at      timestamptz not null default now()
);

-- ── Activity events ───────────────────────────────────────────────────────────

create table if not exists activity_events (
  id          text primary key default gen_random_uuid()::text,
  text        text not null,
  type        activity_type not null default 'created',
  workspace_id text references workspaces(id) on delete cascade,
  created_at  timestamptz not null default now()
);

-- ── Roadmap tasks ─────────────────────────────────────────────────────────────

create table if not exists roadmap_tasks (
  id                text primary key default gen_random_uuid()::text,
  title             text not null,
  type              text not null default 'dev',
  project           text not null default '',
  jira_url          text not null default '',
  assignee_id       text,
  start_sprint      integer not null default 0,
  end_sprint        integer not null default 0,
  priority          boolean not null default false,
  timeline_item_id  text,
  workspace_id      text references workspaces(id) on delete cascade,
  created_at        timestamptz not null default now()
);

-- ── Suggestions ───────────────────────────────────────────────────────────────

create table if not exists suggestions (
  id                    text primary key default gen_random_uuid()::text,
  title                 text not null,
  description           text not null default '',
  source                jsonb not null default '{}',
  suggested_priority    text not null default 'p2',
  suggested_type        text not null default 'task',
  suggested_group_id    text not null default '',
  relevance_score       integer not null default 0,
  duplicate_of_id       text,
  duplicate_confidence  numeric not null default 0,
  status                text not null default 'pending',
  deferred_until        timestamptz,
  reviewed_at           timestamptz,
  scanned_at            timestamptz not null default now(),
  tags                  text[] not null default '{}',
  workspace_id          text references workspaces(id) on delete cascade,
  created_at            timestamptz not null default now()
);

-- ── Departments ───────────────────────────────────────────────────────────────

create table if not exists departments (
  id            text primary key default gen_random_uuid()::text,
  name          text not null,
  color         text not null default '#2563EB',
  password      text,
  workspace_id  text references workspaces(id) on delete cascade,
  created_at    timestamptz not null default now()
);

-- ── Sprint capacities ─────────────────────────────────────────────────────────

create table if not exists sprint_capacities (
  id              text primary key default gen_random_uuid()::text,
  sprint_number   integer not null,
  dev             integer not null default 7,
  ux              integer not null default 5,
  workspace_id    text references workspaces(id) on delete cascade,
  unique(sprint_number, workspace_id)
);

-- ── Workspace members (for future real auth) ─────────────────────────────────

create table if not exists workspace_members (
  id            text primary key default gen_random_uuid()::text,
  workspace_id  text not null references workspaces(id) on delete cascade,
  user_id       text not null,
  role          workspace_role not null default 'member',
  invited_by    text,
  created_at    timestamptz not null default now(),
  unique(workspace_id, user_id)
);

create table if not exists workspace_invitations (
  id            text primary key default gen_random_uuid()::text,
  workspace_id  text not null references workspaces(id) on delete cascade,
  email         text not null,
  role          workspace_role not null default 'member',
  token         text not null unique default gen_random_uuid()::text,
  invited_by    text,
  accepted_at   timestamptz,
  expires_at    timestamptz not null default (now() + interval '7 days'),
  created_at    timestamptz not null default now()
);

-- ── Indexes ───────────────────────────────────────────────────────────────────

create index if not exists idx_timeline_items_parent   on timeline_items(parent_id);
create index if not exists idx_timeline_items_owner    on timeline_items(owner_id);
create index if not exists idx_timeline_items_status   on timeline_items(status);
create index if not exists idx_key_results_obj         on key_results(objective_id);
create index if not exists idx_check_ins_kr            on check_ins(key_result_id);
create index if not exists idx_activity_events_ts      on activity_events(created_at desc);
create index if not exists idx_workspace_members_user  on workspace_members(user_id);
create index if not exists idx_workspace_members_ws    on workspace_members(workspace_id);
create index if not exists idx_team_members_ws         on team_members(workspace_id);
create index if not exists idx_timeline_items_ws       on timeline_items(workspace_id);
create index if not exists idx_objectives_ws           on objectives(workspace_id);
create index if not exists idx_key_results_ws          on key_results(workspace_id);
create index if not exists idx_check_ins_ws            on check_ins(workspace_id);
create index if not exists idx_activity_events_ws      on activity_events(workspace_id);
create index if not exists idx_roadmap_tasks_ws        on roadmap_tasks(workspace_id);
create index if not exists idx_suggestions_ws          on suggestions(workspace_id);
create index if not exists idx_departments_ws          on departments(workspace_id);
create index if not exists idx_sprint_capacities_ws    on sprint_capacities(workspace_id);

-- ── Row Level Security (permissive for prototype) ────────────────────────────
-- Using open policies with anon key. Tighten when real auth is added.

alter table workspaces             enable row level security;
alter table team_members           enable row level security;
alter table timeline_items         enable row level security;
alter table objectives             enable row level security;
alter table key_results            enable row level security;
alter table check_ins              enable row level security;
alter table activity_events        enable row level security;
alter table roadmap_tasks          enable row level security;
alter table suggestions            enable row level security;
alter table departments            enable row level security;
alter table sprint_capacities      enable row level security;
alter table workspace_members      enable row level security;
alter table workspace_invitations  enable row level security;

-- Permissive policies — allow all operations via anon key
create policy "anon_all_workspaces"     on workspaces             for all using (true) with check (true);
create policy "anon_all_team_members"   on team_members           for all using (true) with check (true);
create policy "anon_all_timeline"       on timeline_items         for all using (true) with check (true);
create policy "anon_all_objectives"     on objectives             for all using (true) with check (true);
create policy "anon_all_key_results"    on key_results            for all using (true) with check (true);
create policy "anon_all_check_ins"      on check_ins              for all using (true) with check (true);
create policy "anon_all_activity"       on activity_events        for all using (true) with check (true);
create policy "anon_all_roadmap"        on roadmap_tasks          for all using (true) with check (true);
create policy "anon_all_suggestions"    on suggestions            for all using (true) with check (true);
create policy "anon_all_departments"    on departments            for all using (true) with check (true);
create policy "anon_all_sprint_caps"    on sprint_capacities      for all using (true) with check (true);
create policy "anon_all_ws_members"     on workspace_members      for all using (true) with check (true);
create policy "anon_all_ws_invitations" on workspace_invitations  for all using (true) with check (true);
