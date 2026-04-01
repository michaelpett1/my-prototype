-- ─────────────────────────────────────────────────────────────────────────────
-- Workspace-based access control
-- ─────────────────────────────────────────────────────────────────────────────

-- ── New tables ───────────────────────────────────────────────────────────────

create table if not exists workspaces (
  id          text primary key default gen_random_uuid()::text,
  name        text not null,
  slug        text not null unique,
  created_by  uuid references auth.users(id) on delete set null,
  created_at  timestamptz not null default now()
);

create type workspace_role as enum ('owner', 'admin', 'member', 'viewer');

create table if not exists workspace_members (
  id            text primary key default gen_random_uuid()::text,
  workspace_id  text not null references workspaces(id) on delete cascade,
  user_id       uuid not null references auth.users(id) on delete cascade,
  role          workspace_role not null default 'member',
  invited_by    uuid references auth.users(id) on delete set null,
  created_at    timestamptz not null default now(),
  unique(workspace_id, user_id)
);

create table if not exists workspace_invitations (
  id            text primary key default gen_random_uuid()::text,
  workspace_id  text not null references workspaces(id) on delete cascade,
  email         text not null,
  role          workspace_role not null default 'member',
  token         text not null unique default gen_random_uuid()::text,
  invited_by    uuid references auth.users(id) on delete set null,
  accepted_at   timestamptz,
  expires_at    timestamptz not null default (now() + interval '7 days'),
  created_at    timestamptz not null default now()
);

-- ── Add workspace_id to all existing tables ──────────────────────────────────

alter table team_members     add column if not exists workspace_id text references workspaces(id) on delete cascade;
alter table timeline_items   add column if not exists workspace_id text references workspaces(id) on delete cascade;
alter table objectives       add column if not exists workspace_id text references workspaces(id) on delete cascade;
alter table key_results      add column if not exists workspace_id text references workspaces(id) on delete cascade;
alter table check_ins        add column if not exists workspace_id text references workspaces(id) on delete cascade;
alter table activity_events  add column if not exists workspace_id text references workspaces(id) on delete cascade;

-- ── Indexes ──────────────────────────────────────────────────────────────────

create index if not exists idx_workspace_members_user     on workspace_members(user_id);
create index if not exists idx_workspace_members_ws       on workspace_members(workspace_id);
create index if not exists idx_workspace_invitations_email on workspace_invitations(email);
create index if not exists idx_workspace_invitations_token on workspace_invitations(token);
create index if not exists idx_team_members_ws            on team_members(workspace_id);
create index if not exists idx_timeline_items_ws          on timeline_items(workspace_id);
create index if not exists idx_objectives_ws              on objectives(workspace_id);
create index if not exists idx_key_results_ws             on key_results(workspace_id);
create index if not exists idx_check_ins_ws               on check_ins(workspace_id);
create index if not exists idx_activity_events_ws         on activity_events(workspace_id);

-- ── RLS on new tables ────────────────────────────────────────────────────────

alter table workspaces             enable row level security;
alter table workspace_members      enable row level security;
alter table workspace_invitations  enable row level security;

-- Helper: check if auth user is a member of a workspace
create or replace function is_workspace_member(ws_id text)
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from workspace_members
    where workspace_id = ws_id and user_id = auth.uid()
  );
$$;

-- Helper: check if auth user is admin/owner of a workspace
create or replace function is_workspace_admin(ws_id text)
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from workspace_members
    where workspace_id = ws_id
      and user_id = auth.uid()
      and role in ('owner', 'admin')
  );
$$;

-- Workspaces: members can read their workspaces; authenticated users can create
create policy "ws_select"  on workspaces for select using (is_workspace_member(id));
create policy "ws_insert"  on workspaces for insert with check (auth.uid() is not null);
create policy "ws_update"  on workspaces for update using (is_workspace_admin(id));
create policy "ws_delete"  on workspaces for delete using (
  exists (
    select 1 from workspace_members
    where workspace_id = id and user_id = auth.uid() and role = 'owner'
  )
);

-- Workspace members: members can read; admins can insert/update/delete
create policy "wm_select" on workspace_members for select using (is_workspace_member(workspace_id));
create policy "wm_insert" on workspace_members for insert with check (
  is_workspace_admin(workspace_id) or user_id = auth.uid()
);
create policy "wm_update" on workspace_members for update using (is_workspace_admin(workspace_id));
create policy "wm_delete" on workspace_members for delete using (is_workspace_admin(workspace_id));

-- Workspace invitations: members can read; admins can insert/update/delete; invited user can read by email
create policy "wi_select_member" on workspace_invitations for select using (is_workspace_member(workspace_id));
create policy "wi_select_invitee" on workspace_invitations for select using (
  email = (select email from auth.users where id = auth.uid())
);
create policy "wi_insert" on workspace_invitations for insert with check (is_workspace_admin(workspace_id));
create policy "wi_update" on workspace_invitations for update using (
  is_workspace_admin(workspace_id) or email = (select email from auth.users where id = auth.uid())
);
create policy "wi_delete" on workspace_invitations for delete using (is_workspace_admin(workspace_id));

-- ── Drop old permissive policies and replace with workspace-scoped ───────────

drop policy if exists "allow_all_team_members"   on team_members;
drop policy if exists "allow_all_timeline_items" on timeline_items;
drop policy if exists "allow_all_objectives"     on objectives;
drop policy if exists "allow_all_key_results"    on key_results;
drop policy if exists "allow_all_check_ins"      on check_ins;
drop policy if exists "allow_all_activity"       on activity_events;

-- Team members
create policy "tm_select" on team_members for select using (is_workspace_member(workspace_id));
create policy "tm_insert" on team_members for insert with check (is_workspace_member(workspace_id));
create policy "tm_update" on team_members for update using (is_workspace_member(workspace_id));
create policy "tm_delete" on team_members for delete using (is_workspace_admin(workspace_id));

-- Timeline items
create policy "ti_select" on timeline_items for select using (is_workspace_member(workspace_id));
create policy "ti_insert" on timeline_items for insert with check (is_workspace_member(workspace_id));
create policy "ti_update" on timeline_items for update using (is_workspace_member(workspace_id));
create policy "ti_delete" on timeline_items for delete using (is_workspace_member(workspace_id));

-- Objectives
create policy "obj_select" on objectives for select using (is_workspace_member(workspace_id));
create policy "obj_insert" on objectives for insert with check (is_workspace_member(workspace_id));
create policy "obj_update" on objectives for update using (is_workspace_member(workspace_id));
create policy "obj_delete" on objectives for delete using (is_workspace_admin(workspace_id));

-- Key results
create policy "kr_select" on key_results for select using (is_workspace_member(workspace_id));
create policy "kr_insert" on key_results for insert with check (is_workspace_member(workspace_id));
create policy "kr_update" on key_results for update using (is_workspace_member(workspace_id));
create policy "kr_delete" on key_results for delete using (is_workspace_member(workspace_id));

-- Check-ins
create policy "ci_select" on check_ins for select using (is_workspace_member(workspace_id));
create policy "ci_insert" on check_ins for insert with check (is_workspace_member(workspace_id));
create policy "ci_update" on check_ins for update using (is_workspace_member(workspace_id));
create policy "ci_delete" on check_ins for delete using (is_workspace_member(workspace_id));

-- Activity events
create policy "ae_select" on activity_events for select using (is_workspace_member(workspace_id));
create policy "ae_insert" on activity_events for insert with check (is_workspace_member(workspace_id));

-- ── Migration helper: create default workspace for existing data ─────────────

do $$
declare
  default_ws_id text;
begin
  -- Only run if there are existing rows without a workspace_id
  if exists (select 1 from team_members where workspace_id is null limit 1) then
    default_ws_id := gen_random_uuid()::text;

    insert into workspaces (id, name, slug, created_at)
    values (default_ws_id, 'Default Workspace', 'default', now());

    -- Backfill all existing records
    update team_members    set workspace_id = default_ws_id where workspace_id is null;
    update timeline_items  set workspace_id = default_ws_id where workspace_id is null;
    update objectives      set workspace_id = default_ws_id where workspace_id is null;
    update key_results     set workspace_id = default_ws_id where workspace_id is null;
    update check_ins       set workspace_id = default_ws_id where workspace_id is null;
    update activity_events set workspace_id = default_ws_id where workspace_id is null;
  end if;
end;
$$;
