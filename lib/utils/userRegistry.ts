/**
 * Simulated-mode user registry.
 * Maps email addresses to their workspace data so returning users
 * can sign back in and find their workspace.
 *
 * This is stored in a separate localStorage key that is NOT cleared
 * on sign-out, so the data persists across sessions.
 */

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

/** All GDC team members — seeded so any of them can sign in and land in the workspace. */
const GDC_WORKSPACE = {
  id: 'ws-gdc-product-features',
  name: 'GDC Product Features',
  slug: 'gdc-product-features',
  createdBy: 'u7',
  createdAt: '2025-01-01T00:00:00.000Z',
};

const GDC_SEED_USERS: Array<{ email: string; userId: string; name: string }> = [
  { email: 'dean.ryan@gdcgroup.com',        userId: 'u1', name: 'Dean Ryan' },
  { email: 'gabriel.cornoiu@gdcgroup.com',   userId: 'u2', name: 'Gabriel Cornoiu' },
  { email: 'chloe.christie@gdcgroup.com',    userId: 'u3', name: 'Chloe Christie' },
  { email: 'colin.brannigan@gdcgroup.com',   userId: 'u4', name: 'Colin Brannigan' },
  { email: 'jessica.dordevic@gdcgroup.com',  userId: 'u5', name: 'Jessica Dordevic Cioffi' },
  { email: 'miguel.migneco@gdcgroup.com',    userId: 'u6', name: 'Miguel Migneco' },
  { email: 'michael.pett@gdcgroup.com',      userId: 'u7', name: 'Mike Pett' },
  { email: 'ciara.carroll@gdcgroup.com',     userId: 'u8', name: 'Ciara Carroll' },
  { email: 'victoria.dadson@gdcgroup.com',   userId: 'u9', name: 'Vic Dadson' },
];

/** Seed known users so returning sign-ins work even if registry wasn't populated yet. */
export function seedRegistryIfEmpty() {
  if (typeof window === 'undefined') return;
  const registry = getRegistry();
  let changed = false;

  for (const user of GDC_SEED_USERS) {
    const key = user.email.toLowerCase();
    if (!registry[key]) {
      registry[key] = {
        userId: user.userId,
        email: key,
        name: user.name,
        workspaces: [GDC_WORKSPACE],
      };
      changed = true;
    } else if (registry[key].userId === 'user-gdc-founder') {
      // Migrate old Michael Pett entry to consistent u7 ID
      registry[key].userId = 'u7';
      registry[key].name = 'Mike Pett';
      registry[key].workspaces = registry[key].workspaces.map(ws =>
        ws.id === 'ws-gdc-product-features' ? { ...ws, createdBy: 'u7' } : ws
      );
      changed = true;
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
