/**
 * TENANT CONFIGURATION
 * ─────────────────────────────────────────────────────────────────────────────
 * This is the single file to edit when white-labelling Northstar for a new
 * client. All client-specific identifiers, users, departments, workspace
 * structure, and branding live here. Nothing else in the codebase should
 * hard-code client-specific values.
 *
 * To white-label for a new client:
 *  1. Update WORKSPACE with the client's workspace details
 *  2. Replace USERS with the client's team
 *  3. Update DEPARTMENTS to match the client's structure
 *  4. Adjust TIMELINE_GROUPS and ROADMAP_PROJECTS as needed
 *  5. Set SIMULATED_PASSWORD (shared password for demo/simulated auth)
 *  6. Bump SEED_KEYS version strings to force a fresh seed on first load
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type { Department, TeamMember, TimelineGroup } from '@/lib/types';

// ─── Workspace ────────────────────────────────────────────────────────────────

export const WORKSPACE = {
  id: 'ws-gdc-product-features',
  name: 'GDC Product Features',
  slug: 'gdc-product-features',
  /** userId of the workspace creator — must match a USERS entry */
  createdBy: 'u7',
  createdAt: '2025-01-01T00:00:00.000Z',
} as const;

// ─── Simulated Auth ───────────────────────────────────────────────────────────

/** Shared password used for all accounts in simulated (non-Supabase) mode */
export const SIMULATED_PASSWORD = 'P@ssword!123';

// ─── Users ────────────────────────────────────────────────────────────────────

interface TenantUser {
  id: string;
  name: string;
  email: string;
  /** Job title shown in the Members list */
  jobTitle: string;
  /** Tailwind-style hex colour used to generate the avatar background */
  avatarColor: string;
  workspaceRole: TeamMember['workspaceRole'];
}

export const USERS: TenantUser[] = [
  { id: 'u1',  name: 'Dean Ryan',                email: 'dean.ryan@gdcgroup.com',        jobTitle: 'Senior Director Content Marketing',  avatarColor: '#3B82F6', workspaceRole: 'member' },
  { id: 'u2',  name: 'Gabriel Cornoiu',          email: 'gabriel.cornoiu@gdcgroup.com',   jobTitle: 'Senior Director Product Development', avatarColor: '#8B5CF6', workspaceRole: 'admin'  },
  { id: 'u3',  name: 'Chloe Christie',           email: 'chloe.christie@gdcgroup.com',    jobTitle: 'Product Owner',                      avatarColor: '#10B981', workspaceRole: 'admin'  },
  { id: 'u4',  name: 'Colin Brannigan',          email: 'colin.brannigan@gdcgroup.com',   jobTitle: 'SVP GDC Core',                       avatarColor: '#F59E0B', workspaceRole: 'member' },
  { id: 'u5',  name: 'Jessica Dordevic Cioffi',  email: 'jessica.dordevic@gdcgroup.com',  jobTitle: 'Product Designer',                   avatarColor: '#EC4899', workspaceRole: 'member' },
  { id: 'u6',  name: 'Miguel Migneco',           email: 'miguel.migneco@gdcgroup.com',    jobTitle: 'Senior Product Designer',            avatarColor: '#6366F1', workspaceRole: 'member' },
  { id: 'u7',  name: 'Mike Pett',                email: 'michael.pett@gdcgroup.com',      jobTitle: 'Product Manager',                    avatarColor: '#2563EB', workspaceRole: 'owner'  },
  { id: 'u8',  name: 'Ciara Carroll',            email: 'ciara.carroll@gdcgroup.com',     jobTitle: 'Head of Design',                     avatarColor: '#14B8A6', workspaceRole: 'member' },
  { id: 'u9',  name: 'Vic Dadson',               email: 'victoria.dadson@gdcgroup.com',   jobTitle: 'Web Analyst',                        avatarColor: '#F97316', workspaceRole: 'member' },
  { id: 'u10', name: 'Joshua Smith',             email: 'joshua.smith@gdcgroup.com',      jobTitle: 'Member',                             avatarColor: '#059669', workspaceRole: 'member' },
];

/** Converts tenant users to the TeamMember shape used across the app */
export function getTenantTeamMembers(): TeamMember[] {
  return USERS.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.jobTitle,
    avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=${u.avatarColor.replace('#', '')}&color=fff&size=40`,
    workspaceRole: u.workspaceRole,
  }));
}

// ─── Departments ──────────────────────────────────────────────────────────────

export const DEPARTMENTS: Department[] = [
  { id: 'dept-1', name: 'GDC Product Led Growth', color: '#22C55E', password: 'PLG2026!'       },
  { id: 'dept-2', name: 'Design',                  color: '#F97316', password: 'Design2026!'    },
  { id: 'dept-3', name: 'Web Analysts',            color: '#3B82F6', password: 'Analytics2026!' },
];

// ─── Timeline Groups ──────────────────────────────────────────────────────────

export const TIMELINE_GROUPS: TimelineGroup[] = [
  { id: 'grp-1', name: 'New Features',                  color: '#2563EB' },
  { id: 'grp-2', name: 'Existing Product Improvements', color: '#22C55E' },
  { id: 'grp-3', name: 'Hygiene Improvements',          color: '#EC4899' },
  { id: 'grp-4', name: 'Free to Play',                  color: '#F59E0B' },
];

// ─── Sprint Schedule ─────────────────────────────────────────────────────────
// Sprints are 2 weeks long, ending at a specific time every second Thursday.
// Adjust `baseDate` so Sprint 1 starts on the correct Thursday for this client.

export const SPRINT_CONFIG = {
  /** ISO date for the first day of Sprint 1 (must be a Thursday) */
  baseDate: '2025-12-25',
  /** Hour (0-23) on the transition Thursday when the old sprint ends and the new one begins */
  transitionHour: 16, // 4 PM
  /** Number of calendar days per sprint */
  sprintLengthDays: 14,
  /** Total sprints to generate (covers ~1 year at 2-week cadence) */
  totalSprints: 26,
} as const;

// ─── Roadmap Projects ─────────────────────────────────────────────────────────

export const ROADMAP_PROJECTS: string[] = [
  'Design Hygiene',
  'Genesis',
  'IUJs',
  'Existing Product Enhancements',
  'Existing Product Improvements',
  'Hygiene Improvements',
  'Promo Campaigns',
  'New Features',
  'Free to Play',
];

// ─── LocalStorage Seed Keys ───────────────────────────────────────────────────
// Bump the version suffix (e.g. -v3 → -v4) to force a fresh seed on first load.

export const SEED_KEYS = {
  /** Set after GDC mock data has been seeded to localStorage */
  initialSeed: 'northstar-gdc-initial-seed-v3',
  /** Set after seed data has been pushed to Supabase */
  supabaseSync: 'northstar-gdc-supabase-synced-v4',
  /** Set after the team members list has been seeded */
  teamSeeded: 'northstar-team-seeded',
  /** Set after current localStorage state has been pushed to Supabase (one-time migration) */
  stateSync: 'northstar-state-sync-v1',
} as const;
