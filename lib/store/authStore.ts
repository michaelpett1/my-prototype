'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createClient } from '@/lib/supabase/client';
import { registerUser } from '@/lib/utils/userRegistry';
import type { User } from '@supabase/supabase-js';

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  createdBy: string | null;
  createdAt: string;
}

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  userId: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  createdAt: string;
}

export interface WorkspaceInvitation {
  id: string;
  workspaceId: string;
  email: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  token: string;
  invitedBy: string | null;
  acceptedAt: string | null;
  expiresAt: string;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  currentWorkspace: Workspace | null;
  workspaces: Workspace[];
  members: WorkspaceMember[];
  invitations: WorkspaceInvitation[];
  isLoading: boolean;
  isInitialized: boolean;

  initialize: () => Promise<void>;
  setCurrentWorkspace: (ws: Workspace) => void;
  createWorkspace: (name: string, slug: string) => Promise<Workspace>;
  fetchWorkspaces: () => Promise<Workspace[]>;
  fetchMembers: () => Promise<void>;
  fetchInvitations: () => Promise<void>;
  inviteMember: (email: string, role: 'admin' | 'member' | 'viewer') => Promise<WorkspaceInvitation>;
  revokeInvitation: (id: string) => Promise<void>;
  resendInvitation: (id: string) => Promise<void>;
  removeMember: (memberId: string) => Promise<void>;
  acceptInvitation: (token: string) => Promise<Workspace>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      currentWorkspace: null,
      workspaces: [],
      members: [],
      invitations: [],
      isLoading: true,
      isInitialized: false,

      initialize: async () => {
        const hasSupabase = !!(
          process.env.NEXT_PUBLIC_SUPABASE_URL &&
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        );

        if (!hasSupabase) {
          // Simulated mode — preserve user if already set (e.g. from sign-up),
          // otherwise restore from persisted workspace
          const existingUser = get().user;
          const current = get().currentWorkspace;
          const workspaces = get().workspaces;

          if (existingUser) {
            // User was set by sign-up/sign-in — keep them
            set({
              workspaces,
              currentWorkspace: current,
              isLoading: false,
              isInitialized: true,
            });
          } else {
            // No user in memory — restore from persisted workspace or stay null
            set({
              user: current ? { id: 'local-user', email: 'local@northstar.app' } as unknown as User : null,
              workspaces,
              currentWorkspace: current,
              isLoading: false,
              isInitialized: true,
            });
          }
          return;
        }

        try {
          const supabase = createClient();
          const { data: { user } } = await supabase.auth.getUser();

          if (!user) {
            set({ user: null, currentWorkspace: null, workspaces: [], isLoading: false, isInitialized: true });
            return;
          }

          set({ user });

          // Fetch workspaces the user belongs to
          let workspaces: Workspace[] = [];
          try {
            workspaces = await get().fetchWorkspaces();
          } catch {
            // Workspace tables may not exist yet — continue gracefully
          }

          if (workspaces.length === 0) {
            set({ isLoading: false, isInitialized: true });
            return;
          }

          // If currentWorkspace is already set and still valid, keep it
          const current = get().currentWorkspace;
          const stillValid = current && workspaces.some(ws => ws.id === current.id);

          if (!stillValid) {
            set({ currentWorkspace: workspaces[0] });
          }

          set({ isLoading: false, isInitialized: true });
        } catch {
          set({ user: null, currentWorkspace: null, workspaces: [], isLoading: false, isInitialized: true });
        }
      },

      setCurrentWorkspace: (ws) => set({ currentWorkspace: ws }),

      fetchWorkspaces: async () => {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('workspace_members')
          .select('workspace_id, workspaces(id, name, slug, created_by, created_at)')
          .eq('user_id', get().user?.id ?? '');

        if (error || !data) {
          set({ workspaces: [] });
          return [];
        }

        const workspaces: Workspace[] = data
          .filter((row: Record<string, unknown>) => row.workspaces)
          .map((row: Record<string, unknown>) => {
            const ws = row.workspaces as Record<string, unknown>;
            return {
              id: ws.id as string,
              name: ws.name as string,
              slug: ws.slug as string,
              createdBy: ws.created_by as string | null,
              createdAt: ws.created_at as string,
            };
          });

        set({ workspaces });
        return workspaces;
      },

      createWorkspace: async (name, slug) => {
        const hasSupabase = !!(
          process.env.NEXT_PUBLIC_SUPABASE_URL &&
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        );

        if (hasSupabase) {
          const supabase = createClient();
          const user = get().user;
          if (!user) throw new Error('Not authenticated');

          const { data: wsData, error: wsErr } = await supabase
            .from('workspaces')
            .insert({ name, slug, created_by: user.id })
            .select()
            .single();

          if (wsErr || !wsData) throw new Error(wsErr?.message ?? 'Failed to create workspace');

          const ws: Workspace = {
            id: (wsData as Record<string, unknown>).id as string,
            name: (wsData as Record<string, unknown>).name as string,
            slug: (wsData as Record<string, unknown>).slug as string,
            createdBy: (wsData as Record<string, unknown>).created_by as string | null,
            createdAt: (wsData as Record<string, unknown>).created_at as string,
          };

          await supabase
            .from('workspace_members')
            .insert({ workspace_id: ws.id, user_id: user.id, role: 'owner' });

          set(s => ({
            workspaces: [...s.workspaces, ws],
            currentWorkspace: ws,
          }));

          return ws;
        }

        // Simulated mode — create workspace locally
        const currentUser = get().user;
        const ws: Workspace = {
          id: `ws-${Date.now()}`,
          name,
          slug,
          createdBy: currentUser?.id ?? null,
          createdAt: new Date().toISOString(),
        };

        set(s => ({
          workspaces: [...s.workspaces, ws],
          currentWorkspace: ws,
        }));

        // Auto-set workspace creator as owner in settings store
        if (currentUser?.email) {
          try {
            const { useSettingsStore } = await import('./settingsStore');
            const settings = useSettingsStore.getState();
            const selfMember = settings.teamMembers.find(
              m => m.email?.toLowerCase() === currentUser.email?.toLowerCase()
            );
            if (selfMember) {
              settings.updateTeamMember(selfMember.id, { workspaceRole: 'owner' });
            }
          } catch { /* settings store may not be loaded */ }
        }

        // Register in user registry so returning sign-ins restore this workspace
        if (currentUser?.email) {
          registerUser(
            currentUser.email,
            currentUser.id,
            (currentUser as unknown as Record<string, Record<string, string>>).user_metadata?.full_name ?? currentUser.email.split('@')[0],
            { id: ws.id, name: ws.name, slug: ws.slug, createdBy: ws.createdBy, createdAt: ws.createdAt }
          );
        }

        return ws;
      },

      fetchMembers: async () => {
        const hasSupabase = !!(
          process.env.NEXT_PUBLIC_SUPABASE_URL &&
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        );
        if (!hasSupabase) return; // Simulated mode — members managed via settingsStore

        const supabase = createClient();
        const ws = get().currentWorkspace;
        if (!ws) return;

        const { data, error } = await supabase
          .from('workspace_members')
          .select('*')
          .eq('workspace_id', ws.id)
          .order('created_at');

        if (error || !data) return;

        const members: WorkspaceMember[] = data.map((row: Record<string, unknown>) => ({
          id: row.id as string,
          workspaceId: row.workspace_id as string,
          userId: row.user_id as string,
          role: row.role as WorkspaceMember['role'],
          createdAt: row.created_at as string,
        }));

        set({ members });
      },

      fetchInvitations: async () => {
        const hasSupabase = !!(
          process.env.NEXT_PUBLIC_SUPABASE_URL &&
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        );
        if (!hasSupabase) return; // Simulated mode — invitations managed locally

        const supabase = createClient();
        const ws = get().currentWorkspace;
        if (!ws) return;

        const { data, error } = await supabase
          .from('workspace_invitations')
          .select('*')
          .eq('workspace_id', ws.id)
          .is('accepted_at', null)
          .order('created_at', { ascending: false });

        if (error || !data) return;

        const invitations: WorkspaceInvitation[] = data.map((row: Record<string, unknown>) => ({
          id: row.id as string,
          workspaceId: row.workspace_id as string,
          email: row.email as string,
          role: row.role as WorkspaceInvitation['role'],
          token: row.token as string,
          invitedBy: row.invited_by as string | null,
          acceptedAt: row.accepted_at as string | null,
          expiresAt: row.expires_at as string,
          createdAt: row.created_at as string,
        }));

        set({ invitations });
      },

      inviteMember: async (email, role) => {
        const ws = get().currentWorkspace;
        const user = get().user;
        if (!ws || !user) throw new Error('No workspace selected');

        const hasSupabase = !!(
          process.env.NEXT_PUBLIC_SUPABASE_URL &&
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        );

        if (!hasSupabase) {
          // Simulated mode — create invitation locally
          const invitation: WorkspaceInvitation = {
            id: `inv-${Date.now()}`,
            workspaceId: ws.id,
            email,
            role,
            token: `tok-${Math.random().toString(36).slice(2, 10)}`,
            invitedBy: user.id,
            acceptedAt: null,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            createdAt: new Date().toISOString(),
          };
          set(s => ({ invitations: [invitation, ...s.invitations] }));
          return invitation;
        }

        const supabase = createClient();
        const { data, error } = await supabase
          .from('workspace_invitations')
          .insert({
            workspace_id: ws.id,
            email,
            role,
            invited_by: user.id,
          })
          .select()
          .single();

        if (error || !data) throw new Error(error?.message ?? 'Failed to create invitation');

        const row = data as Record<string, unknown>;
        const invitation: WorkspaceInvitation = {
          id: row.id as string,
          workspaceId: row.workspace_id as string,
          email: row.email as string,
          role: row.role as WorkspaceInvitation['role'],
          token: row.token as string,
          invitedBy: row.invited_by as string | null,
          acceptedAt: null,
          expiresAt: row.expires_at as string,
          createdAt: row.created_at as string,
        };

        set(s => ({ invitations: [invitation, ...s.invitations] }));
        return invitation;
      },

      revokeInvitation: async (id) => {
        const hasSupabase = !!(
          process.env.NEXT_PUBLIC_SUPABASE_URL &&
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        );

        if (!hasSupabase) {
          set(s => ({ invitations: s.invitations.filter(i => i.id !== id) }));
          return;
        }

        const supabase = createClient();
        const { error } = await supabase
          .from('workspace_invitations')
          .delete()
          .eq('id', id);

        if (error) throw new Error(error.message);
        set(s => ({ invitations: s.invitations.filter(i => i.id !== id) }));
      },

      resendInvitation: async (id) => {
        const hasSupabase = !!(
          process.env.NEXT_PUBLIC_SUPABASE_URL &&
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        );

        const newExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

        if (!hasSupabase) {
          set(s => ({
            invitations: s.invitations.map(i =>
              i.id === id ? { ...i, expiresAt: newExpiry } : i
            ),
          }));
          return;
        }

        const supabase = createClient();
        const { error } = await supabase
          .from('workspace_invitations')
          .update({ expires_at: newExpiry })
          .eq('id', id);

        if (error) throw new Error(error.message);

        set(s => ({
          invitations: s.invitations.map(i =>
            i.id === id ? { ...i, expiresAt: newExpiry } : i
          ),
        }));
      },

      removeMember: async (memberId) => {
        const supabase = createClient();
        const { error } = await supabase
          .from('workspace_members')
          .delete()
          .eq('id', memberId);

        if (error) throw new Error(error.message);
        set(s => ({ members: s.members.filter(m => m.id !== memberId) }));
      },

      acceptInvitation: async (token) => {
        const supabase = createClient();
        const user = get().user;
        if (!user) throw new Error('Not authenticated');

        // Find the invitation
        const { data: invData, error: invErr } = await supabase
          .from('workspace_invitations')
          .select('*, workspaces(id, name, slug, created_by, created_at)')
          .eq('token', token)
          .is('accepted_at', null)
          .single();

        if (invErr || !invData) throw new Error('Invalid or expired invitation');

        const row = invData as Record<string, unknown>;
        const expiresAt = new Date(row.expires_at as string);
        if (expiresAt < new Date()) throw new Error('Invitation has expired');

        const wsRow = row.workspaces as Record<string, unknown>;

        // Add user as member
        await supabase
          .from('workspace_members')
          .insert({
            workspace_id: row.workspace_id as string,
            user_id: user.id,
            role: row.role as 'owner' | 'admin' | 'member' | 'viewer',
            invited_by: row.invited_by as string,
          });

        // Mark invitation as accepted
        await supabase
          .from('workspace_invitations')
          .update({ accepted_at: new Date().toISOString() })
          .eq('id', row.id as string);

        const ws: Workspace = {
          id: wsRow.id as string,
          name: wsRow.name as string,
          slug: wsRow.slug as string,
          createdBy: wsRow.created_by as string | null,
          createdAt: wsRow.created_at as string,
        };

        set(s => ({
          workspaces: [...s.workspaces, ws],
          currentWorkspace: ws,
        }));

        return ws;
      },

      signOut: async () => {
        const hasSupabase = !!(
          process.env.NEXT_PUBLIC_SUPABASE_URL &&
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        );
        if (hasSupabase) {
          try {
            const supabase = createClient();
            await supabase.auth.signOut();
          } catch {
            // Supabase sign-out failed — still clear local state
          }
        }

        // Save current user's profile into a per-user cache so it can be
        // restored when they sign back in (prevents next user from inheriting it).
        if (typeof window !== 'undefined') {
          const currentUser = get().user;
          if (currentUser?.email) {
            try {
              const settingsRaw = localStorage.getItem('northstar-settings');
              if (settingsRaw) {
                const settingsData = JSON.parse(settingsRaw);
                const profile = settingsData?.state?.profile;
                if (profile) {
                  localStorage.setItem(
                    `northstar-profile-${currentUser.email.toLowerCase()}`,
                    JSON.stringify(profile)
                  );
                }
              }
            } catch {
              // Non-critical — profile cache save failed
            }
          }
          localStorage.removeItem('northstar-auth');
        }

        // Reset auth state in memory
        set({
          user: null,
          currentWorkspace: null,
          workspaces: [],
          members: [],
          invitations: [],
          isLoading: false,
          isInitialized: false,
        });
      },
    }),
    {
      name: 'northstar-auth',
      partialize: (state) => ({
        user: state.user,
        currentWorkspace: state.currentWorkspace,
        workspaces: state.workspaces,
      }),
    }
  )
);
