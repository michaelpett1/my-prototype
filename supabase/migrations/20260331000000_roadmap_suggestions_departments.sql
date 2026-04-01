-- ─────────────────────────────────────────────────────────────────────────────
-- Roadmap tasks, suggestions, departments, sprint capacities
-- + missing columns on existing tables
-- ─────────────────────────────────────────────────────────────────────────────

-- ── New tables ───────────────────────────────────────────────────────────────

create table if not exists roadmap_tasks (
  id                text primary key default gen_random_uuid()::text,
  title             text not null,
  type              text not null default 'dev',
  project           text not null default '',
  jira_url          text not null default '',
  assignee_id       text references team_members(id) on delete set null,
  start_sprint      integer not null default 0,
  end_sprint        integer not null default 0,
  priority          boolean not null default false,
  timeline_item_id  text references timeline_items(id) on delete set null,
  workspace_id      text references workspaces(id) on delete cascade,
  created_at        timestamptz not null default now()
);

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

create table if not exists departments (
  id            text primary key default gen_random_uuid()::text,
  name          text not null,
  color         text not null default '#2563EB',
  password      text,
  workspace_id  text references workspaces(id) on delete cascade,
  created_at    timestamptz not null default now()
);

create table if not exists sprint_capacities (
  id              text primary key default gen_random_uuid()::text,
  sprint_number   integer not null,
  dev             integer not null default 7,
  ux              integer not null default 5,
  workspace_id    text references workspaces(id) on delete cascade,
  unique(sprint_number, workspace_id)
);

-- ── Add missing columns to existing tables ──────────────────────────────────

alter table objectives    add column if not exists department  text not null default '';
alter table objectives    add column if not exists is_draft    boolean not null default false;
alter table objectives    add column if not exists period_type text not null default 'quarterly';
alter table key_results   add column if not exists weight      numeric not null default 0;
alter table timeline_items add column if not exists group_id   text not null default '';

-- ── Indexes ──────────────────────────────────────────────────────────────────

create index if not exists idx_roadmap_tasks_ws       on roadmap_tasks(workspace_id);
create index if not exists idx_suggestions_ws         on suggestions(workspace_id);
create index if not exists idx_departments_ws         on departments(workspace_id);
create index if not exists idx_sprint_capacities_ws   on sprint_capacities(workspace_id);

-- ── RLS ──────────────────────────────────────────────────────────────────────

alter table roadmap_tasks      enable row level security;
alter table suggestions        enable row level security;
alter table departments        enable row level security;
alter table sprint_capacities  enable row level security;

-- Roadmap tasks: members can CRUD
create policy "rt_select" on roadmap_tasks for select using (is_workspace_member(workspace_id));
create policy "rt_insert" on roadmap_tasks for insert with check (is_workspace_member(workspace_id));
create policy "rt_update" on roadmap_tasks for update using (is_workspace_member(workspace_id));
create policy "rt_delete" on roadmap_tasks for delete using (is_workspace_member(workspace_id));

-- Suggestions: members can CRUD
create policy "sg_select" on suggestions for select using (is_workspace_member(workspace_id));
create policy "sg_insert" on suggestions for insert with check (is_workspace_member(workspace_id));
create policy "sg_update" on suggestions for update using (is_workspace_member(workspace_id));
create policy "sg_delete" on suggestions for delete using (is_workspace_member(workspace_id));

-- Departments: members can read/insert/update; only admins can delete
create policy "dp_select" on departments for select using (is_workspace_member(workspace_id));
create policy "dp_insert" on departments for insert with check (is_workspace_member(workspace_id));
create policy "dp_update" on departments for update using (is_workspace_member(workspace_id));
create policy "dp_delete" on departments for delete using (is_workspace_admin(workspace_id));

-- Sprint capacities: members can CRUD
create policy "sc_select" on sprint_capacities for select using (is_workspace_member(workspace_id));
create policy "sc_insert" on sprint_capacities for insert with check (is_workspace_member(workspace_id));
create policy "sc_update" on sprint_capacities for update using (is_workspace_member(workspace_id));
create policy "sc_delete" on sprint_capacities for delete using (is_workspace_member(workspace_id));
