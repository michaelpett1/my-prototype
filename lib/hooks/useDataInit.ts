'use client';
import { useEffect, useRef } from 'react';
import { useProjectsStore } from '@/lib/store/projectsStore';
import { useOKRsStore } from '@/lib/store/okrsStore';
import { useSettingsStore } from '@/lib/store/settingsStore';
import { useAuthStore } from '@/lib/store/authStore';
import { useRoadmapStore } from '@/lib/store/roadmapStore';
import { useSuggestionsStore } from '@/lib/store/suggestionsStore';
import { useActivityStore } from '@/lib/store/activityStore';
import { TIMELINE_ITEMS, OBJECTIVES, GDC_SEED_ROADMAP_TASKS } from '@/lib/data/mockData';
import { WORKSPACE, TIMELINE_GROUPS, SEED_KEYS } from '@/lib/config/tenant';
import {
  upsertTimelineItem,
  upsertObjective,
  upsertKeyResult,
  upsertRoadmapTask,
  upsertTimelineGroup,
  upsertTeamMember,
  upsertDepartment,
  upsertRoadmapProject,
  upsertSprintCapacity,
  upsertSuggestion as dbUpsertSuggestion,
} from '@/lib/supabase/queries';

const hasSupabase = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// All tenant-specific identifiers now come from lib/config/tenant.ts
const GDC_WS_ID = WORKSPACE.id;
const GDC_INITIAL_SEED_KEY = SEED_KEYS.initialSeed;
const DEFAULT_GROUPS = TIMELINE_GROUPS;

/**
 * One-time seed for the GDC demo workspace.
 * Only runs if this browser has NEVER been seeded before.
 * Seeds localStorage only — Supabase gets data via write-through.
 */
function seedGDCOnce() {
  if (typeof window === 'undefined') return;
  if (localStorage.getItem(GDC_INITIAL_SEED_KEY)) return;

  // Seed projects / timelines
  if (useProjectsStore.getState().items.length === 0) {
    useProjectsStore.setState({ items: TIMELINE_ITEMS, groups: DEFAULT_GROUPS });
  }

  // Seed OKRs
  if (useOKRsStore.getState().objectives.length === 0) {
    useOKRsStore.setState({ objectives: OBJECTIVES });
  }

  // Seed visual roadmap (normalise any legacy boolean priorities)
  if (useRoadmapStore.getState().tasks.length === 0) {
    useRoadmapStore.setState({
      tasks: GDC_SEED_ROADMAP_TASKS.map(t => ({
        ...t,
        priority: typeof t.priority === 'boolean'
          ? (t.priority ? 'p0' : 'p2')
          : (t.priority ?? 'p2'),
      })) as typeof GDC_SEED_ROADMAP_TASKS,
    });
  }

  // Mark as done — never re-seed
  localStorage.setItem(GDC_INITIAL_SEED_KEY, '1');
}

/**
 * Push the CURRENT Zustand store state to Supabase.
 * Runs once per browser when Supabase is available and the store has local data.
 * This ensures new users/browsers can pull shared data from Supabase.
 *
 * KEY DESIGN: This only WRITES to Supabase. It never reads back or overwrites
 * local state. The read-on-empty pattern in each store handles reads.
 */
async function syncStateToSupabase(wsId: string) {
  if (typeof window === 'undefined') return;
  if (localStorage.getItem(SEED_KEYS.stateSync)) return;

  console.log('[useDataInit] Syncing current state to Supabase (write-only, no overwrite)...');

  try {
    // Push current roadmap tasks
    const tasks = useRoadmapStore.getState().tasks;
    for (const task of tasks) {
      await upsertRoadmapTask(task, wsId).catch(err =>
        console.warn('[sync] upsertRoadmapTask failed:', task.id, err?.message)
      );
    }

    // Push sprint capacities
    const caps = useRoadmapStore.getState().sprintCapacities;
    for (const [sprintStr, cap] of Object.entries(caps)) {
      await upsertSprintCapacity(Number(sprintStr), cap.dev, cap.ux, wsId).catch(err =>
        console.warn('[sync] upsertSprintCapacity failed:', sprintStr, err?.message)
      );
    }

    // Push timeline items
    const items = useProjectsStore.getState().items;
    for (const item of items) {
      await upsertTimelineItem(item, wsId).catch(err =>
        console.warn('[sync] upsertTimelineItem failed:', item.id, err?.message)
      );
    }

    // Push timeline groups
    const groups = useProjectsStore.getState().groups;
    for (let i = 0; i < groups.length; i++) {
      await upsertTimelineGroup(groups[i], i, wsId).catch(err =>
        console.warn('[sync] upsertTimelineGroup failed:', groups[i].id, err?.message)
      );
    }

    // Push objectives + key results
    const objectives = useOKRsStore.getState().objectives;
    for (const obj of objectives) {
      await upsertObjective(obj, wsId).catch(err =>
        console.warn('[sync] upsertObjective failed:', obj.id, err?.message)
      );
      for (const kr of obj.keyResults) {
        await upsertKeyResult(kr, wsId).catch(err =>
          console.warn('[sync] upsertKeyResult failed:', kr.id, err?.message)
        );
      }
    }

    // Push team members
    const teamMembers = useSettingsStore.getState().teamMembers;
    for (const member of teamMembers) {
      await upsertTeamMember(member, wsId).catch(err =>
        console.warn('[sync] upsertTeamMember failed:', member.id, err?.message)
      );
    }

    // Push departments
    const departments = useSettingsStore.getState().departments;
    for (const dept of departments) {
      await upsertDepartment(dept, wsId).catch(err =>
        console.warn('[sync] upsertDepartment failed:', dept.id, err?.message)
      );
    }

    // Push roadmap projects
    const projects = useRoadmapStore.getState().projects;
    for (const name of projects) {
      await upsertRoadmapProject(name, wsId).catch(err =>
        console.warn('[sync] upsertRoadmapProject failed:', name, err?.message)
      );
    }

    // Push suggestions
    const suggestions = useSuggestionsStore.getState().suggestions;
    for (const s of suggestions) {
      await dbUpsertSuggestion(s, wsId).catch(err =>
        console.warn('[sync] upsertSuggestion failed:', s.id, err?.message)
      );
    }

    // NOTE: We intentionally do NOT read back from Supabase here.
    // Local state is the truth. Supabase is the shared copy.
    localStorage.setItem(SEED_KEYS.stateSync, '1');
    console.log('[useDataInit] State synced to Supabase successfully (no overwrite)');
  } catch (err) {
    console.error('[useDataInit] State sync to Supabase failed:', err);
  }
}

/**
 * Call once at the app shell level. Loads all remote data on mount.
 *
 * ARCHITECTURE (read-on-empty + write-through):
 * ─────────────────────────────────────────────
 * 1. Stores rehydrate from localStorage (Zustand persist middleware).
 * 2. Each store's load() checks if local data exists:
 *    - YES: Skip Supabase fetch. Local data is the truth.
 *    - NO:  Fetch from Supabase (new browser gets shared data).
 * 3. All writes (add/update/delete) go to BOTH local state AND Supabase.
 * 4. First user's syncStateToSupabase() pushes local state so others can read it.
 *
 * This prevents Supabase from EVER overwriting existing local edits.
 */
export function useDataInit() {
  const currentWorkspaceId = useRef<string | null>(null);
  const loadProjects = useProjectsStore((s) => s.load);
  const loadOKRs = useOKRsStore((s) => s.load);
  const loadTeam = useSettingsStore((s) => s.loadTeamMembers);
  const seedDepts = useSettingsStore((s) => s.seedDepartmentsIfEmpty);
  const seedRoadmap = useRoadmapStore((s) => s.seedIfEmpty);
  const loadRoadmap = useRoadmapStore((s) => s.load);
  const loadSuggestions = useSuggestionsStore((s) => s.load);
  const loadActivity = useActivityStore((s) => s.load);
  const currentWorkspace = useAuthStore((s) => s.currentWorkspace);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    const wsId = currentWorkspace?.id ?? null;

    // Skip if no workspace or if already initialized with same workspace
    if (!wsId) return;
    if (currentWorkspaceId.current === wsId) return;

    currentWorkspaceId.current = wsId;

    const doInit = async () => {
      // ── Step 1: Load all stores ──
      // Each store uses read-on-empty: keeps local data if present,
      // fetches from Supabase only if localStorage is empty.
      await Promise.all([
        loadProjects(wsId),
        loadOKRs(wsId),
        loadTeam(wsId),
        loadRoadmap(wsId),
        loadSuggestions(wsId),
        loadActivity(wsId),
      ]);

      // ── Step 2: One-time local seed (first ever app use) ──
      if (wsId === GDC_WS_ID) {
        seedGDCOnce();
      }

      // Seed workspace-specific data if empty
      seedRoadmap(wsId);
      seedDepts(wsId);

      // ── Step 3: Push local state to Supabase (write-only, one-time) ──
      // This runs AFTER seeding so Supabase gets the full dataset.
      // It never reads back or overwrites local state.
      if (hasSupabase && !localStorage.getItem(SEED_KEYS.stateSync)) {
        syncStateToSupabase(wsId);
      }

      // ── Step 4: Ensure current user is in team members ──
      if (user?.email) {
        const settings = useSettingsStore.getState();
        const alreadyExists = settings.teamMembers.some(
          m => m.email.toLowerCase() === user.email!.toLowerCase()
        );
        if (!alreadyExists) {
          const userName = (user as unknown as Record<string, Record<string, string>>).user_metadata?.full_name ?? user.email.split('@')[0];
          const isCreator = currentWorkspace?.createdBy === user.id;
          settings.addTeamMember({
            id: user.id,
            name: userName,
            email: user.email,
            role: isCreator ? 'Workspace Creator' : 'Member',
            avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=2563EB&color=fff&size=40`,
            workspaceRole: isCreator ? 'owner' : 'member',
          });
        }
      }
    };

    doInit().catch((err) => {
      console.error('[useDataInit] init failed:', err);
    });
  }, [loadProjects, loadOKRs, loadTeam, seedDepts, seedRoadmap, loadRoadmap, loadSuggestions, loadActivity, currentWorkspace, user]);
}
