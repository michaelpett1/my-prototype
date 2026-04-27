/**
 * Simulated-mode user registry.
 * Maps email addresses to their workspace data so returning users
 * can sign back in and find their workspace.
 *
 * This is stored in a separate localStorage key that is NOT cleared
 * on sign-out, so the data persists across sessions.
 *
 * User data comes from lib/config/tenant.ts — edit that file to
 * add/remove users or change workspace details.
 */

import { WORKSPACE, USERS } from '@/lib/config/tenant';

const REGISTRY_KEY = 'northstar-user-registry';

interface UserRecord {
  userId: string;
  email: string;
  name: string;
  workspaces: Array<{
    id: string;
    name: string;
    slug: string;
    createdBy: string | null;
    createdAt: string;
  }>;
}

function getRegistry(): Record<string, UserRecord> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(REGISTRY_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveRegistry(registry: Record<string, UserRecord>) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(REGISTRY_KEY, JSON.stringify(registry));
}

/** Look up a user by email. Returns null if not found. */
export function lookupUser(email: string): UserRecord | null {
  const registry = getRegistry();
  const key = email.toLowerCase().trim();
  return registry[key] ?? null;
}

/**
 * Seed all tenant users so any of them can sign in and land in the workspace.
 * Reads from lib/config/tenant.ts — no GDC-specific values here.
 */
export function seedRegistryIfEmpty() {
  if (typeof window === 'undefined') return;
  const registry = getRegistry();
  let changed = false;

  for (const user of USERS) {
    const key = user.email.toLowerCase();
    if (!registry[key]) {
      registry[key] = {
        userId: user.id,
        email: key,
        name: user.name,
        workspaces: [WORKSPACE],
      };
      changed = true;
    } else if (registry[key].userId === 'user-gdc-founder') {
      // Migrate legacy founder ID to the consistent tenant user ID
      const tenantUser = USERS.find(u => u.email.toLowerCase() === key);
      if (tenantUser) {
        registry[key].userId = tenantUser.id;
        registry[key].name = tenantUser.name;
        registry[key].workspaces = registry[key].workspaces.map(ws =>
          ws.id === WORKSPACE.id ? { ...ws, createdBy: WORKSPACE.createdBy } : ws
        );
        changed = true;
      }
    }
  }

  if (changed) saveRegistry(registry);
}

/** Register or update a user's workspace data. */
export function registerUser(
  email: string,
  userId: string,
  name: string,
  workspace: UserRecord['workspaces'][0]
) {
  const registry = getRegistry();
  const key = email.toLowerCase().trim();
  const existing = registry[key];

  if (existing) {
    // Update: add workspace if not already present
    const hasWs = existing.workspaces.some(ws => ws.id === workspace.id);
    if (!hasWs) {
      existing.workspaces.push(workspace);
    } else {
      existing.workspaces = existing.workspaces.map(ws =>
        ws.id === workspace.id ? workspace : ws
      );
    }
    existing.userId = userId;
    existing.name = name;
    registry[key] = existing;
  } else {
    registry[key] = {
      userId,
      email: key,
      name,
      workspaces: [workspace],
    };
  }

  saveRegistry(registry);
}
