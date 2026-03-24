'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppSettings, Theme } from '@/lib/types';
import { TEAM_MEMBERS } from '@/lib/data/mockData';
import type { TeamMember } from '@/lib/types';

interface SettingsState extends AppSettings {
  teamMembers: TeamMember[];
  updateTheme: (theme: Theme) => void;
  updateAccentColor: (color: string) => void;
  toggleSidebarCompact: () => void;
  updateProfile: (patch: Partial<AppSettings['profile']>) => void;
  updateWorkspace: (patch: Partial<AppSettings['workspace']>) => void;
  addTeamMember: (member: TeamMember) => void;
  removeTeamMember: (id: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'light',
      accentColor: '#3B82F6',
      sidebarCompact: false,
      profile: {
        name: 'Alex Rivera',
        email: 'alex@northstar.io',
        avatarUrl: 'https://ui-avatars.com/api/?name=Alex+Rivera&background=3B82F6&color=fff&size=40',
        role: 'Product Lead',
      },
      workspace: {
        name: 'Northstar HQ',
        defaultOKRPeriod: '2026-Q2',
        defaultTimelineView: 'gantt',
      },
      teamMembers: TEAM_MEMBERS,

      updateTheme: (theme) => set({ theme }),
      updateAccentColor: (accentColor) => set({ accentColor }),
      toggleSidebarCompact: () => set((s) => ({ sidebarCompact: !s.sidebarCompact })),
      updateProfile: (patch) => set((s) => ({ profile: { ...s.profile, ...patch } })),
      updateWorkspace: (patch) => set((s) => ({ workspace: { ...s.workspace, ...patch } })),
      addTeamMember: (member) => set((s) => ({ teamMembers: [...s.teamMembers, member] })),
      removeTeamMember: (id) => set((s) => ({ teamMembers: s.teamMembers.filter((m) => m.id !== id) })),
    }),
    { name: 'northstar-settings' }
  )
);
