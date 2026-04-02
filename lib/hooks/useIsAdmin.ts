'use client';
import { useAuthStore } from '@/lib/store/authStore';
import { useSettingsStore } from '@/lib/store/settingsStore';

/**
 * Returns true if the current user is an owner or admin of the current workspace.
 * In simulated mode (no Supabase), checks teamMember.workspaceRole.
 */
export function useIsAdmin(): boolean {
  const user = useAuthStore((s) => s.user);
  const members = useAuthStore((s) => s.members);
  const currentWorkspace = useAuthStore((s) => s.currentWorkspace);
  const teamMembers = useSettingsStore((s) => s.teamMembers);

  if (!user || !currentWorkspace) return false;

  const hasSupabase = !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  if (!hasSupabase) {
    // Simulated mode — check workspaceRole on team member matching user email
    const teamMember = teamMembers.find(
      (m) => m.email.toLowerCase() === user.email?.toLowerCase()
    );
    if (teamMember?.workspaceRole) {
      return teamMember.workspaceRole === 'owner' || teamMember.workspaceRole === 'admin';
    }
    // Fallback: workspace creator is owner
    return currentWorkspace.createdBy === null || currentWorkspace.createdBy === user.id;
  }

  // Supabase mode — check membership role
  const membership = members.find((m) => m.userId === user.id && m.workspaceId === currentWorkspace.id);
  if (membership) {
    return membership.role === 'owner' || membership.role === 'admin';
  }

  // Fallback: if members haven't been fetched yet, check if user created the workspace
  if (currentWorkspace.createdBy === user.id) return true;

  // Also check teamMembers as a secondary fallback
  const teamMember = teamMembers.find(
    (m) => m.email.toLowerCase() === user.email?.toLowerCase()
  );
  if (teamMember?.workspaceRole) {
    return teamMember.workspaceRole === 'owner' || teamMember.workspaceRole === 'admin';
  }

  return false;
}
