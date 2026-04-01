-- ─────────────────────────────────────────────────────────────────────────────
-- SaaS Persistence Fixes
-- Adds missing columns, tables, and indexes for full Supabase persistence
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Add workspace_role column to team_members (was missing)
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS workspace_role workspace_role NOT NULL DEFAULT 'member';

-- 2. Timeline groups table (groups were only in localStorage)
CREATE TABLE IF NOT EXISTS timeline_groups (
  id            text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name          text NOT NULL,
  color         text NOT NULL DEFAULT '#2563EB',
  sort_order    integer NOT NULL DEFAULT 0,
  workspace_id  text REFERENCES workspaces(id) ON DELETE CASCADE,
  created_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE timeline_groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_all_timeline_groups" ON timeline_groups FOR ALL USING (true) WITH CHECK (true);
CREATE INDEX IF NOT EXISTS idx_timeline_groups_ws ON timeline_groups(workspace_id);

-- 3. Add sort_order to timeline_items so reorder persists
ALTER TABLE timeline_items ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0;

-- 4. Workspace settings table (vision, default periods, preferences)
CREATE TABLE IF NOT EXISTS workspace_settings (
  id                      text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  workspace_id            text NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE UNIQUE,
  vision                  text NOT NULL DEFAULT '',
  default_okr_period      text NOT NULL DEFAULT '2026-Q1',
  default_timeline_view   text NOT NULL DEFAULT 'gantt',
  default_gantt_scale     text NOT NULL DEFAULT 'week',
  okr_password_protection boolean NOT NULL DEFAULT true,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE workspace_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_all_workspace_settings" ON workspace_settings FOR ALL USING (true) WITH CHECK (true);
CREATE INDEX IF NOT EXISTS idx_workspace_settings_ws ON workspace_settings(workspace_id);

DROP TRIGGER IF EXISTS workspace_settings_updated_at ON workspace_settings;
CREATE TRIGGER workspace_settings_updated_at
  BEFORE UPDATE ON workspace_settings
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

-- 5. Roadmap projects table (projects list was only in localStorage)
CREATE TABLE IF NOT EXISTS roadmap_projects (
  id            text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name          text NOT NULL,
  workspace_id  text REFERENCES workspaces(id) ON DELETE CASCADE,
  created_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE roadmap_projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_all_roadmap_projects" ON roadmap_projects FOR ALL USING (true) WITH CHECK (true);
CREATE INDEX IF NOT EXISTS idx_roadmap_projects_ws ON roadmap_projects(workspace_id);
