'use client';
import { useState, useEffect } from 'react';
import { Sun, Moon, Monitor, Trash2, Plus, Download, Upload, Check, Pencil, Save, UserPlus, AlertTriangle, UserX, Building2, PlusCircle } from 'lucide-react';
import { useSettingsStore } from '@/lib/store/settingsStore';
import { useToastStore } from '@/lib/store/toastStore';
import { useAuthStore } from '@/lib/store/authStore';
import { useProjectsStore } from '@/lib/store/projectsStore';
import { useOKRsStore } from '@/lib/store/okrsStore';
import { useRoadmapStore } from '@/lib/store/roadmapStore';
import { Button } from '@/components/ui/Button';
import { InviteMemberModal } from '@/components/settings/InviteMemberModal';
import type { Theme, TeamMember, Department, GanttScale, WorkspaceRole } from '@/lib/types';
import { clsx } from '@/lib/utils/clsx';
import { useIsAdmin } from '@/lib/hooks/useIsAdmin';
import ProductTour from '@/components/ui/ProductTour';
import { SETTINGS_TOUR } from '@/lib/data/tourSteps';
import { useRouter } from 'next/navigation';

const WORKSPACE_ROLES: { value: WorkspaceRole; label: string; description: string; color: string; bg: string }[] = [
  { value: 'owner', label: 'Owner', description: 'Full access, can delete workspace', color: '#DC2626', bg: 'var(--danger-bg)' },
  { value: 'admin', label: 'Admin', description: 'Manage members, run scans, edit all', color: '#D97706', bg: 'var(--warning-bg)' },
  { value: 'member', label: 'Member', description: 'Create and edit their own items', color: '#2563EB', bg: '#EFF6FF' },
  { value: 'viewer', label: 'Viewer', description: 'View only, cannot edit', color: 'var(--text-tertiary)', bg: 'var(--bg-tertiary)' },
];

const SECTIONS = [
  { id: 'appearance', label: 'Appearance' },
  { id: 'profile',    label: 'Profile' },
  { id: 'workspace',  label: 'Workspace' },
  { id: 'members',    label: 'Members' },
  { id: 'roles',      label: 'Roles & Permissions' },
  { id: 'departments', label: 'Departments' },
  { id: 'okrs',       label: 'OKRs' },
  { id: 'data',       label: 'Data' },
];

const ACCENT_COLORS = [
  { color: '#2563EB', label: 'Blue' },
  { color: '#7C3AED', label: 'Violet' },
  { color: '#0891B2', label: 'Cyan' },
  { color: '#16A34A', label: 'Green' },
  { color: '#D97706', label: 'Amber' },
  { color: '#DC2626', label: 'Red' },
];

const THEME_OPTS: Array<{ value: Theme; label: string; icon: React.ElementType }> = [
  { value: 'light',  label: 'Light',  icon: Sun },
  { value: 'dark',   label: 'Dark',   icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
];

function SettingsField({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[12px] font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>{label}</label>
      {hint && <p className="text-[12px] mb-1.5" style={{ color: 'var(--text-muted)' }}>{hint}</p>}
      {children}
    </div>
  );
}

const inputCls = 'w-full rounded-[5px] text-[13px] transition-all duration-150 ease-out focus:outline-none';
const inputStyle = {
  padding: '7px 10px',
  border: '1px solid var(--input-border)',
  color: 'var(--text-primary)',
  background: 'var(--input-bg)',
};

function SectionHead({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-[16px] font-semibold dm-heading" style={{ color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>{title}</h2>
      {sub && <p className="text-[13px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{sub}</p>}
    </div>
  );
}

export default function SettingsPage() {
  const [active, setActive] = useState('appearance');
  const {
    theme, accentColor, sidebarCompact,
    profile, workspace, teamMembers,
    updateTheme, updateAccentColor, toggleSidebarCompact,
    updateProfile, updateWorkspace,
    addTeamMember, updateTeamMember, removeTeamMember,
    departments, addDepartment, updateDepartment, removeDepartment,
  } = useSettingsStore();
  const addToast = useToastStore(s => s.addToast);
  const { members, invitations, fetchMembers, fetchInvitations, removeMember: removeWsMember, currentWorkspace } = useAuthStore();
  const isAdmin = useIsAdmin();
  const [showInviteModal, setShowInviteModal] = useState(false);

  // Load workspace members & invitations when switching to members tab
  useEffect(() => {
    if (active === 'members' && currentWorkspace) {
      fetchMembers();
      fetchInvitations();
    }
  }, [active, currentWorkspace, fetchMembers, fetchInvitations]);

  const [newMember, setNewMember] = useState({ name: '', email: '', role: '' });
  const [showAddMember, setShowAddMember] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [editMemberForm, setEditMemberForm] = useState({ name: '', email: '', role: '' });

  // Bug #13: Profile form with explicit save
  const [profileForm, setProfileForm] = useState({
    name: profile.name,
    email: profile.email,
    role: profile.role,
    avatarUrl: profile.avatarUrl,
  });
  const [profileDirty, setProfileDirty] = useState(false);

  // Re-sync profile form after Zustand hydrates from localStorage
  useEffect(() => {
    if (profile.name || profile.email || profile.role) {
      setProfileForm(prev => {
        // Only overwrite if the form hasn't been manually dirtied
        if (!profileDirty) {
          return { name: profile.name, email: profile.email, role: profile.role, avatarUrl: profile.avatarUrl };
        }
        return prev;
      });
    }
  }, [profile.name, profile.email, profile.role, profile.avatarUrl, profileDirty]);

  // Workspace form with explicit save
  const [wsDirty, setWsDirty] = useState(false);
  const [wsForm, setWsForm] = useState({
    name: workspace.name,
    vision: workspace.vision || '',
    defaultOKRPeriod: workspace.defaultOKRPeriod,
    defaultTimelineView: workspace.defaultTimelineView,
    defaultGanttScale: workspace.defaultGanttScale || 'week',
  });

  // Re-sync workspace form after Zustand hydrates from localStorage
  useEffect(() => {
    if (workspace.name || workspace.vision) {
      setWsForm(prev => {
        if (!wsDirty) {
          return {
            name: workspace.name,
            vision: workspace.vision || '',
            defaultOKRPeriod: workspace.defaultOKRPeriod,
            defaultTimelineView: workspace.defaultTimelineView,
            defaultGanttScale: workspace.defaultGanttScale || 'week',
          };
        }
        return prev;
      });
    }
  }, [workspace.name, workspace.vision, workspace.defaultOKRPeriod, workspace.defaultTimelineView, workspace.defaultGanttScale, wsDirty]);

  const [newDept, setNewDept] = useState({ name: '', color: '#3B82F6' });
  const [showAddDept, setShowAddDept] = useState(false);
  const router = useRouter();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [showDeleteWorkspace, setShowDeleteWorkspace] = useState(false);
  const [transferOwnerTo, setTransferOwnerTo] = useState<string | null>(null);
  const signOut = useAuthStore(s => s.signOut);
  const user = useAuthStore(s => s.user);
  const workspaces = useAuthStore(s => s.workspaces);

  const handleAddMember = () => {
    if (!newMember.name || !newMember.email) return;
    addTeamMember({
      id: `u-${Date.now()}`,
      name: newMember.name,
      email: newMember.email,
      role: newMember.role || 'Member',
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(newMember.name)}&background=2563EB&color=fff&size=40`,
      workspaceRole: 'member',
    });
    addToast(`Added ${newMember.name} to team`, 'success');
    setNewMember({ name: '', email: '', role: '' });
    setShowAddMember(false);
  };

  const handleSaveProfile = () => {
    updateProfile(profileForm);
    setProfileDirty(false);
    addToast('Profile saved', 'success');
  };

  const handleSaveWorkspace = () => {
    updateWorkspace(wsForm);
    setWsDirty(false);
    addToast('Workspace settings saved', 'success');
  };

  const handleResetAllData = () => {
    // Clear only timelines, OKRs, and roadmap data — keep workspace, members, departments, settings
    useProjectsStore.setState({ items: [], groups: [], selectedItemId: null });
    useOKRsStore.setState({ objectives: [], selectedObjectiveId: null });
    useRoadmapStore.setState({ tasks: [] });

    setShowResetConfirm(false);
    addToast('All project data has been reset', 'success');
  };

  const handleDeleteAccount = () => {
    if (typeof window !== 'undefined') {
      const userEmail = user?.email?.toLowerCase();

      // If transferring ownership, update the target member's role
      if (transferOwnerTo && currentWorkspace) {
        const targetMember = teamMembers.find(m => m.id === transferOwnerTo);
        if (targetMember) {
          updateTeamMember(targetMember.id, { workspaceRole: 'owner' });
        }
      }

      // Check if user is the only member — if so, also remove the workspace from registry
      const otherMembers = teamMembers.filter(m => m.email?.toLowerCase() !== userEmail);
      if (otherMembers.length === 0 && userEmail) {
        // Only member — clean up workspace from registry
        try {
          const regRaw = localStorage.getItem('northstar-user-registry');
          if (regRaw) {
            const reg = JSON.parse(regRaw);
            if (reg[userEmail]) {
              delete reg[userEmail];
              localStorage.setItem('northstar-user-registry', JSON.stringify(reg));
            }
          }
        } catch { /* ignore */ }
      } else if (userEmail) {
        // Remove user from registry
        try {
          const regRaw = localStorage.getItem('northstar-user-registry');
          if (regRaw) {
            const reg = JSON.parse(regRaw);
            if (reg[userEmail]) {
              delete reg[userEmail];
              localStorage.setItem('northstar-user-registry', JSON.stringify(reg));
            }
          }
        } catch { /* ignore */ }
      }

      // Remove user from team members
      const selfMember = teamMembers.find(m => m.email?.toLowerCase() === userEmail);
      if (selfMember) {
        removeTeamMember(selfMember.id);
      }

      // Clear all northstar data
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('northstar-')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
    }

    signOut().then(() => {
      router.push('/sign-in');
    });
  };

  const handleDeleteWorkspace = () => {
    if (typeof window !== 'undefined' && currentWorkspace) {
      const userEmail = user?.email?.toLowerCase();

      // Remove this workspace from the user's registry
      if (userEmail) {
        try {
          const regRaw = localStorage.getItem('northstar-user-registry');
          if (regRaw) {
            const reg = JSON.parse(regRaw);
            if (reg[userEmail]) {
              reg[userEmail].workspaces = reg[userEmail].workspaces.filter(
                (ws: { id: string }) => ws.id !== currentWorkspace.id
              );
              localStorage.setItem('northstar-user-registry', JSON.stringify(reg));
            }
          }
        } catch { /* ignore */ }
      }

      // Clear all workspace data stores
      ['northstar-projects', 'northstar-okrs', 'northstar-roadmap', 'northstar-suggestions'].forEach(
        key => localStorage.removeItem(key)
      );
      localStorage.removeItem('northstar-settings');
      // Reset in-memory state
      useProjectsStore.setState({ items: [], groups: [], _loadedWorkspaceId: null });
      useOKRsStore.setState({ objectives: [], _loadedWorkspaceId: null });
      useRoadmapStore.setState({ tasks: [], _loadedWorkspaceId: null });

      // Remove workspace from auth store and switch to another if available
      const remaining = workspaces.filter(ws => ws.id !== currentWorkspace.id);
      if (remaining.length > 0) {
        useAuthStore.setState({
          workspaces: remaining,
          currentWorkspace: remaining[0],
        });
        setShowDeleteWorkspace(false);
        router.push('/dashboard');
      } else {
        useAuthStore.setState({
          workspaces: remaining,
          currentWorkspace: null,
        });
        setShowDeleteWorkspace(false);
        router.push('/onboarding?new=1');
      }
    }
  };

  const handleCreateNewWorkspace = () => {
    router.push('/onboarding?new=1');
  };

  // Determine if current user is the workspace owner
  const isWorkspaceOwner = (() => {
    const userEmail = user?.email?.toLowerCase();
    const selfMember = teamMembers.find(m => m.email?.toLowerCase() === userEmail);
    return selfMember?.workspaceRole === 'owner' || currentWorkspace?.createdBy === user?.id;
  })();

  const otherMembers = teamMembers.filter(m => m.email?.toLowerCase() !== user?.email?.toLowerCase());

  const startEditMember = (member: TeamMember) => {
    setEditingMemberId(member.id);
    setEditMemberForm({ name: member.name, email: member.email, role: member.role });
  };

  const saveEditMember = () => {
    if (editingMemberId && editMemberForm.name && editMemberForm.email) {
      updateTeamMember(editingMemberId, {
        name: editMemberForm.name,
        email: editMemberForm.email,
        role: editMemberForm.role,
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(editMemberForm.name)}&background=2563EB&color=fff&size=40`,
      });
      addToast(`Updated ${editMemberForm.name}`, 'success');
      setEditingMemberId(null);
    }
  };

  return (
    <div className="flex h-full">
      {/* Settings nav */}
      <div
        className="settings-nav w-[192px] shrink-0 p-3"
        style={{ backgroundColor: 'var(--bg-primary)', borderRight: '1px solid var(--border)' }}
      >
        <p
          className="text-[10px] font-semibold uppercase tracking-widest px-2.5 mb-2"
          style={{ color: 'var(--text-muted)', letterSpacing: '0.09em' }}
        >
          Settings
        </p>
        <nav className="space-y-[1px]">
          {SECTIONS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActive(id)}
              className="w-full text-left px-2.5 py-2 rounded-[5px] text-[13px] transition-all duration-150 ease-out"
              style={active === id
                ? { background: 'var(--app-accent-subtle, #EFF6FF)', color: 'var(--app-accent, #1D4ED8)', fontWeight: 600 }
                : { color: 'var(--text-tertiary)', fontWeight: 400 }
              }
              onMouseEnter={e => {
                if (active !== id) (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-hover)';
              }}
              onMouseLeave={e => {
                if (active !== id) (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
              }}
            >
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-8">
        <div className={(active === 'members' || active === 'roles') ? 'max-w-[720px]' : 'max-w-[480px]'}>

          {/* ── Appearance ── */}
          {active === 'appearance' && (
            <>
              <SectionHead title="Appearance" sub="Customise the look and feel of Northstar." />
              <div className="space-y-7">
                {/* Theme */}
                <SettingsField label="Theme">
                  <div className="flex gap-2">
                    {THEME_OPTS.map(({ value, label, icon: Icon }) => (
                      <button
                        key={value}
                        onClick={() => { updateTheme(value); addToast(`Theme set to ${label}`, 'success'); }}
                        className="flex-1 flex flex-col items-center gap-2 py-3 rounded-[7px] transition-all duration-150 ease-out text-[12px]"
                        style={theme === value ? {
                          border: `1.5px solid var(--app-accent, #2563EB)`,
                          color: 'var(--app-accent, #1D4ED8)',
                          background: 'var(--app-accent-subtle, #EFF6FF)',
                          fontWeight: 600,
                        } : {
                          border: '1px solid var(--border-medium)',
                          color: 'var(--text-tertiary)',
                          background: 'var(--bg-primary)',
                          fontWeight: 400,
                        }}
                      >
                        <Icon size={16} />
                        {label}
                      </button>
                    ))}
                  </div>
                </SettingsField>

                {/* Accent */}
                <SettingsField label="Accent Colour">
                  <div className="flex gap-2.5 flex-wrap">
                    {ACCENT_COLORS.map(({ color, label }) => (
                      <button
                        key={color}
                        onClick={() => { updateAccentColor(color); addToast(`Accent set to ${label}`, 'success'); }}
                        title={label}
                        aria-label={`${label} accent`}
                        className="relative w-[32px] h-[32px] rounded-full transition-transform duration-150 hover:scale-105"
                        style={{ background: color }}
                      >
                        {accentColor === color && (
                          <Check size={14} className="absolute inset-0 m-auto text-white" strokeWidth={2.5} />
                        )}
                      </button>
                    ))}
                  </div>
                </SettingsField>

                {/* Compact sidebar */}
                <div
                  className="flex items-center justify-between py-3"
                  style={{ borderTop: '1px solid var(--border-row)' }}
                >
                  <div>
                    <p className="text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>Compact sidebar</p>
                    <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-muted)' }}>Icons only — more horizontal space</p>
                  </div>
                  <button
                    onClick={() => { toggleSidebarCompact(); addToast(sidebarCompact ? 'Sidebar expanded' : 'Sidebar collapsed', 'success'); }}
                    className="relative rounded-full transition-all duration-200 ease-out shrink-0"
                    style={{
                      width: 36, height: 20,
                      background: sidebarCompact ? 'var(--app-accent, #2563EB)' : 'var(--border-strong)',
                    }}
                    role="switch"
                    aria-checked={sidebarCompact}
                  >
                    <span
                      className="absolute top-[2px] rounded-full bg-white transition-transform duration-200 ease-out"
                      style={{
                        width: 16, height: 16,
                        transform: sidebarCompact ? 'translateX(18px)' : 'translateX(2px)',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.20)',
                      }}
                    />
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ── Profile — Bug #13: Explicit save ── */}
          {active === 'profile' && (
            <>
              <SectionHead title="Profile" sub="Your personal details across Northstar." />
              <div
                className="flex items-center gap-3 p-3 rounded-[7px] mb-5"
                style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-row)' }}
              >
                <img src={profileForm.avatarUrl || profile.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(profileForm.name || 'U')}&size=40`} alt={profileForm.name} className="w-12 h-12 rounded-full" />
                <div>
                  <p className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>{profileForm.name || 'Your Name'}</p>
                  <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{profileForm.role || (isWorkspaceOwner ? 'Owner' : 'Member')}</p>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  { label: 'Display Name', key: 'name' as const, value: profileForm.name },
                  { label: 'Email',        key: 'email' as const, value: profileForm.email },
                  { label: 'Role',         key: 'role' as const, value: profileForm.role },
                  { label: 'Avatar URL',   key: 'avatarUrl' as const, value: profileForm.avatarUrl },
                ].map(({ label, key, value }) => (
                  <SettingsField key={key} label={label}>
                    <input
                      type="text"
                      value={value}
                      onChange={e => { setProfileForm(f => ({ ...f, [key]: e.target.value })); setProfileDirty(true); }}
                      className={inputCls}
                      style={inputStyle}
                      onFocus={e => { (e.target as HTMLInputElement).style.borderColor = 'var(--app-accent, #2563EB)'; (e.target as HTMLInputElement).style.boxShadow = '0 0 0 2px rgba(37,99,235,0.12)'; }}
                      onBlurCapture={e => { (e.target as HTMLInputElement).style.borderColor = 'var(--input-border)'; (e.target as HTMLInputElement).style.boxShadow = 'none'; }}
                    />
                  </SettingsField>
                ))}
              </div>

              <div className="mt-5 flex gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSaveProfile}
                  disabled={!profileDirty}
                >
                  <Save size={13} /> Save Profile
                </Button>
                {profileDirty && (
                  <p className="text-[12px] self-center" style={{ color: '#D97706' }}>Unsaved changes</p>
                )}
              </div>
            </>
          )}

          {/* ── Workspace — Bug #23: Explicit save ── */}
          {active === 'workspace' && (
            <>
              <SectionHead title="Workspace" sub="Global defaults for your team." />
              <div className="space-y-4">
                <SettingsField label="Workspace Name">
                  <input
                    type="text"
                    value={wsForm.name}
                    onChange={e => { setWsForm(f => ({ ...f, name: e.target.value })); setWsDirty(true); }}
                    className={inputCls}
                    style={inputStyle}
                  />
                </SettingsField>

                <SettingsField label="Company Vision" hint="Visible to all team members on every page.">
                  <textarea
                    value={wsForm.vision}
                    onChange={e => { setWsForm(f => ({ ...f, vision: e.target.value })); setWsDirty(true); }}
                    className={inputCls}
                    style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }}
                    placeholder="e.g., Our mission is to..."
                  />
                </SettingsField>

                <SettingsField label="Default OKR Period">
                  <select
                    value={wsForm.defaultOKRPeriod}
                    onChange={e => { setWsForm(f => ({ ...f, defaultOKRPeriod: e.target.value })); setWsDirty(true); }}
                    className={inputCls}
                    style={inputStyle}
                  >
                    {['2026-Q1','2026-Q2','2026-Q3','2026-Q4','2027-Q1'].map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </SettingsField>

                <SettingsField label="Default Timeline View">
                  <select
                    value={wsForm.defaultTimelineView}
                    onChange={e => { setWsForm(f => ({ ...f, defaultTimelineView: e.target.value as 'gantt' | 'table' | 'board' })); setWsDirty(true); }}
                    className={inputCls}
                    style={inputStyle}
                  >
                    <option value="gantt">Gantt Chart</option>
                    <option value="table">Table</option>
                    <option value="board">Board</option>
                  </select>
                </SettingsField>

                <SettingsField label="Default Gantt Scale" hint="Time scale used when opening the Gantt view.">
                  <select
                    value={wsForm.defaultGanttScale}
                    onChange={e => { setWsForm(f => ({ ...f, defaultGanttScale: e.target.value as GanttScale })); setWsDirty(true); }}
                    className={inputCls}
                    style={inputStyle}
                  >
                    <option value="week">Week</option>
                    <option value="month">Month</option>
                    <option value="quarter">Quarter</option>
                  </select>
                </SettingsField>
              </div>

              <div className="mt-5 flex gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSaveWorkspace}
                  disabled={!wsDirty}
                >
                  <Save size={13} /> Save Workspace
                </Button>
                {wsDirty && (
                  <p className="text-[12px] self-center" style={{ color: '#D97706' }}>Unsaved changes</p>
                )}
              </div>
            </>
          )}

          {/* ── Members (merged workspace + team) ── */}
          {active === 'members' && (
            <>
              <div className="flex items-start justify-between mb-6">
                <SectionHead title="Members" sub={`${teamMembers.length} members in ${currentWorkspace?.name ?? 'workspace'}`} />
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" onClick={() => setShowAddMember(true)}>
                    <Plus size={13} /> Add
                  </Button>
                  <Button variant="primary" size="sm" onClick={() => setShowInviteModal(true)}>
                    <UserPlus size={13} /> Invite
                  </Button>
                </div>
              </div>

              {/* Members list */}
              <div className="space-y-2">
                {teamMembers.map(member => (
                  <div
                    key={member.id}
                    className="card flex items-center gap-3 p-3 rounded-[7px] group"
                    style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', boxShadow: 'var(--card-shadow)' }}
                  >
                    {editingMemberId === member.id ? (
                      /* Inline edit form */
                      <div className="flex-1 space-y-2">
                        <input
                          type="text"
                          value={editMemberForm.name}
                          onChange={e => setEditMemberForm(f => ({ ...f, name: e.target.value }))}
                          className={inputCls}
                          style={{ ...inputStyle, marginBottom: 4 }}
                          placeholder="Name"
                          autoFocus
                        />
                        <input
                          type="text"
                          value={editMemberForm.email}
                          onChange={e => setEditMemberForm(f => ({ ...f, email: e.target.value }))}
                          className={inputCls}
                          style={{ ...inputStyle, marginBottom: 4 }}
                          placeholder="Email"
                        />
                        <input
                          type="text"
                          value={editMemberForm.role}
                          onChange={e => setEditMemberForm(f => ({ ...f, role: e.target.value }))}
                          className={inputCls}
                          style={inputStyle}
                          placeholder="Role / Job title"
                        />
                        <div className="flex gap-2 mt-2">
                          <Button variant="primary" size="sm" onClick={saveEditMember}>Save</Button>
                          <Button variant="ghost" size="sm" onClick={() => setEditingMemberId(null)}>Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <img src={member.avatarUrl} alt={member.name} className="w-8 h-8 rounded-full shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-[13px] font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{member.name}</p>
                            {/* Workspace role badge */}
                            {(() => {
                              const roleDef = WORKSPACE_ROLES.find(r => r.value === (member.workspaceRole ?? 'member'));
                              return roleDef ? (
                                <span
                                  className="text-[10px] font-semibold px-1.5 py-[1px] rounded"
                                  style={{ color: roleDef.color, background: roleDef.bg }}
                                >
                                  {roleDef.label}
                                </span>
                              ) : null;
                            })()}
                          </div>
                          <p className="text-[11px] font-mono truncate" style={{ color: 'var(--text-muted)' }}>{member.email} · {member.role}</p>
                        </div>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-150">
                          <button
                            onClick={() => startEditMember(member)}
                            className="p-1.5 rounded-[4px] transition-all duration-150 ease-out"
                            style={{ color: 'var(--text-muted)' }}
                            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--app-accent, #2563EB)'; (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-hover)'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'; (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                            aria-label={`Edit ${member.name}`}
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            onClick={() => { removeTeamMember(member.id); addToast(`Removed ${member.name}`, 'info'); }}
                            className="p-1.5 rounded-[4px] transition-all duration-150 ease-out"
                            style={{ color: 'var(--text-muted)' }}
                            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#DC2626'; (e.currentTarget as HTMLButtonElement).style.background = 'var(--danger-bg)'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'; (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                            aria-label={`Remove ${member.name}`}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>

              {/* Add member form */}
              {showAddMember && (
                <div
                  className="mt-4 p-4 rounded-[7px] space-y-3"
                  style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
                >
                  <p className="text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>Add Member</p>
                  {[
                    { label: 'Name',  key: 'name'  as const, ph: 'Full name' },
                    { label: 'Email', key: 'email' as const, ph: 'email@company.com' },
                    { label: 'Role',  key: 'role'  as const, ph: 'e.g. Product Manager' },
                  ].map(({ label, key, ph }) => (
                    <SettingsField key={key} label={label}>
                      <input
                        type="text"
                        value={newMember[key]}
                        onChange={e => setNewMember(p => ({ ...p, [key]: e.target.value }))}
                        placeholder={ph}
                        className={inputCls}
                        style={inputStyle}
                      />
                    </SettingsField>
                  ))}
                  <div className="flex gap-2 pt-1">
                    <Button variant="primary" size="sm" onClick={handleAddMember}>Add Member</Button>
                    <Button variant="ghost" size="sm" onClick={() => setShowAddMember(false)}>Cancel</Button>
                  </div>
                </div>
              )}

              {/* Pending invitations */}
              {invitations.filter(i => !i.acceptedAt).length > 0 && (
                <div className="mt-6">
                  <h3 className="text-[13px] font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>
                    Pending Invitations
                  </h3>
                  <div className="space-y-1">
                    {invitations.filter(i => !i.acceptedAt).map(inv => (
                      <div
                        key={inv.id}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg"
                        style={{ border: '1px solid var(--border-row)', background: 'var(--warning-bg)' }}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] truncate" style={{ color: 'var(--text-primary)' }}>{inv.email}</p>
                          <p className="text-[11px] capitalize" style={{ color: '#D97706' }}>
                            {inv.role} · Expires {new Date(inv.expiresAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <InviteMemberModal open={showInviteModal} onClose={() => setShowInviteModal(false)} />
            </>
          )}

          {/* ── Roles & Permissions ── */}
          {active === 'roles' && (
            <>
              <SectionHead title="Roles & Permissions" sub="Manage workspace roles and see what each role can do." />

              {!isAdmin && (
                <div
                  className="mb-6 p-4 rounded-lg"
                  style={{ background: 'var(--warning-bg)', border: '1px solid #FDE68A' }}
                >
                  <p className="text-[13px] font-medium" style={{ color: 'var(--warning-text)' }}>
                    Only admins and owners can change roles. Contact your workspace admin for changes.
                  </p>
                </div>
              )}

              {/* Permissions matrix */}
              <div className="mb-8">
                <h3 className="text-[13px] font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>Permission Matrix</h3>
                <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                  <table className="w-full text-[12px]">
                    <thead>
                      <tr style={{ background: 'var(--bg-tertiary)' }}>
                        <th className="text-left px-3 py-2.5 font-semibold" style={{ color: 'var(--text-tertiary)', borderBottom: '1px solid var(--border-row)' }}>Permission</th>
                        {WORKSPACE_ROLES.map(r => (
                          <th key={r.value} className="text-center px-3 py-2.5" style={{ borderBottom: '1px solid var(--border-row)' }}>
                            <span className="font-semibold px-1.5 py-[1px] rounded" style={{ color: r.color, background: r.bg }}>{r.label}</span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { perm: 'View timelines & roadmap', owner: true, admin: true, member: true, viewer: true },
                        { perm: 'Create & edit own items', owner: true, admin: true, member: true, viewer: false },
                        { perm: 'Edit all items', owner: true, admin: true, member: false, viewer: false },
                        { perm: 'Run scans', owner: true, admin: true, member: false, viewer: false },
                        { perm: 'Accept / dismiss suggestions', owner: true, admin: true, member: false, viewer: false },
                        { perm: 'Manage members', owner: true, admin: true, member: false, viewer: false },
                        { perm: 'Change member roles', owner: true, admin: true, member: false, viewer: false },
                        { perm: 'Manage departments', owner: true, admin: true, member: false, viewer: false },
                        { perm: 'Edit workspace settings', owner: true, admin: true, member: false, viewer: false },
                        { perm: 'Delete workspace', owner: true, admin: false, member: false, viewer: false },
                      ].map((row, i) => (
                        <tr key={row.perm} style={{ background: i % 2 === 0 ? 'var(--bg-primary)' : 'var(--bg-secondary)' }}>
                          <td className="px-3 py-2" style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--bg-subtle)' }}>{row.perm}</td>
                          {(['owner', 'admin', 'member', 'viewer'] as const).map(role => (
                            <td key={role} className="text-center px-3 py-2" style={{ borderBottom: '1px solid var(--bg-subtle)' }}>
                              {row[role]
                                ? <span style={{ color: '#16A34A' }}>✓</span>
                                : <span style={{ color: 'var(--text-disabled)' }}>—</span>
                              }
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Member role assignments */}
              <h3 className="text-[13px] font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>Member Roles</h3>
              <div className="space-y-1.5">
                {teamMembers.map(member => {
                  const roleDef = WORKSPACE_ROLES.find(r => r.value === (member.workspaceRole ?? 'member'));
                  return (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg"
                      style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)' }}
                    >
                      <img src={member.avatarUrl} alt={member.name} className="w-7 h-7 rounded-full shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium truncate" style={{ color: 'var(--text-primary)' }}>{member.name}</p>
                        <p className="text-[11px] truncate" style={{ color: 'var(--text-muted)' }}>{member.email}</p>
                      </div>
                      {isAdmin ? (
                        <select
                          value={member.workspaceRole ?? 'member'}
                          onChange={e => {
                            const newRole = e.target.value as WorkspaceRole;
                            updateTeamMember(member.id, { workspaceRole: newRole });
                            addToast(`${member.name} is now ${WORKSPACE_ROLES.find(r => r.value === newRole)?.label ?? newRole}`, 'success');
                          }}
                          className="rounded-md text-[12px] cursor-pointer focus:outline-none"
                          style={{
                            padding: '5px 24px 5px 8px',
                            border: '1px solid var(--input-border)',
                            color: roleDef?.color ?? 'var(--text-secondary)',
                            background: roleDef?.bg ?? 'var(--input-bg)',
                            fontWeight: 600,
                          }}
                          title={`Change role for ${member.name}`}
                        >
                          {WORKSPACE_ROLES.map(r => (
                            <option key={r.value} value={r.value}>{r.label}</option>
                          ))}
                        </select>
                      ) : (
                        <span
                          className="text-[11px] font-semibold px-2 py-1 rounded"
                          style={{ color: roleDef?.color ?? 'var(--text-tertiary)', background: roleDef?.bg ?? 'var(--bg-tertiary)' }}
                        >
                          {roleDef?.label ?? 'Member'}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* ── Departments ── */}
          {active === 'departments' && (
            <>
              <div className="flex items-start justify-between mb-6">
                <SectionHead title="Departments" sub="Organizational departments for OKRs and roadmaps." />
                <Button variant="primary" size="sm" onClick={() => setShowAddDept(true)}>
                  <Plus size={13} /> Add
                </Button>
              </div>

              <div className="space-y-2">
                {departments.map(dept => (
                  <div
                    key={dept.id}
                    className="card flex items-center gap-3 p-3 rounded-[7px] group"
                    style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', boxShadow: 'var(--card-shadow)' }}
                  >
                    <label className="relative w-5 h-5 rounded-full shrink-0 cursor-pointer" style={{ background: dept.color }}>
                      <input
                        type="color"
                        value={dept.color}
                        onChange={e => {
                          updateDepartment(dept.id, { color: e.target.value });
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        title="Change colour"
                      />
                    </label>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>{dept.name}</p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-150">
                      <button
                        onClick={() => { removeDepartment(dept.id); addToast(`Removed ${dept.name}`, 'info'); }}
                        className="p-1.5 rounded-[4px] transition-all duration-150 ease-out"
                        style={{ color: 'var(--text-muted)' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#DC2626'; (e.currentTarget as HTMLButtonElement).style.background = 'var(--danger-bg)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'; (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {showAddDept && (
                <div
                  className="mt-4 p-4 rounded-[7px] space-y-3"
                  style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
                >
                  <p className="text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>Add Department</p>
                  <SettingsField label="Name">
                    <input
                      type="text"
                      value={newDept.name}
                      onChange={e => setNewDept(p => ({ ...p, name: e.target.value }))}
                      placeholder="Department name"
                      className={inputCls}
                      style={inputStyle}
                      autoFocus
                    />
                  </SettingsField>
                  <SettingsField label="Color">
                    <div className="flex gap-2 flex-wrap">
                      {['#22C55E', '#F97316', '#3B82F6', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F59E0B'].map(c => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setNewDept(p => ({ ...p, color: c }))}
                          className="w-7 h-7 rounded-full relative transition-transform duration-150 hover:scale-110"
                          style={{ background: c }}
                        >
                          {newDept.color === c && (
                            <Check size={12} className="absolute inset-0 m-auto text-white" strokeWidth={2.5} />
                          )}
                        </button>
                      ))}
                    </div>
                  </SettingsField>
                  <div className="flex gap-2 pt-1">
                    <Button variant="primary" size="sm" onClick={() => {
                      if (!newDept.name.trim()) return;
                      addDepartment({ id: `dept-${Date.now()}`, name: newDept.name.trim(), color: newDept.color });
                      addToast(`Added ${newDept.name}`, 'success');
                      setNewDept({ name: '', color: '#3B82F6' });
                      setShowAddDept(false);
                    }}>
                      Add Department
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setShowAddDept(false)}>Cancel</Button>
                  </div>
                </div>
              )}
            </>
          )}


          {/* ── OKRs ── */}
          {active === 'okrs' && (
            <>
              <SectionHead title="OKRs" sub="Configure password protection per department." />

              {!isAdmin && (
                <div className="mb-4 p-3 rounded-lg" style={{ background: 'var(--warning-bg)', border: '1px solid rgba(234,179,8,0.25)' }}>
                  <p className="text-[12px] font-medium" style={{ color: 'var(--warning-text)' }}>
                    Only workspace owners and admins can change these settings.
                  </p>
                </div>
              )}

              {departments.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>
                    No departments configured. Add departments in the Departments section first.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {departments.map(dept => {
                    const hasPassword = !!dept.password;
                    return (
                      <div
                        key={dept.id}
                        className="card p-4 rounded-[7px]"
                        style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', boxShadow: 'var(--card-shadow)' }}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-3 h-3 rounded-full shrink-0" style={{ background: dept.color }} />
                          <p className="text-[13px] font-semibold flex-1" style={{ color: 'var(--text-primary)' }}>{dept.name}</p>
                          <button
                            onClick={() => {
                              if (!isAdmin) return;
                              if (hasPassword) {
                                updateDepartment(dept.id, { password: undefined });
                                addToast(`Password protection removed for ${dept.name}`, 'info');
                              } else {
                                updateDepartment(dept.id, { password: 'changeme' });
                                addToast(`Password protection enabled for ${dept.name}`, 'success');
                              }
                            }}
                            disabled={!isAdmin}
                            className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 shrink-0"
                            style={{
                              background: hasPassword ? 'var(--app-accent, #2563EB)' : 'var(--text-disabled)',
                              cursor: isAdmin ? 'pointer' : 'not-allowed',
                              opacity: isAdmin ? 1 : 0.5,
                            }}
                          >
                            <span
                              className="inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200"
                              style={{ transform: hasPassword ? 'translateX(22px)' : 'translateX(3px)' }}
                            />
                          </button>
                        </div>
                        {hasPassword && (
                          <div className="flex items-center gap-2">
                            <label className="text-[12px] font-medium shrink-0" style={{ color: 'var(--text-tertiary)' }}>Password:</label>
                            <div style={{ position: 'relative', maxWidth: 260 }}>
                              <input
                                type="password"
                                value={dept.password ?? ''}
                                onChange={e => {
                                  if (!isAdmin) return;
                                  updateDepartment(dept.id, { password: e.target.value });
                                }}
                                disabled={!isAdmin}
                                placeholder="Set department password"
                                className={inputCls}
                                style={{
                                  ...inputStyle,
                                  width: '100%',
                                  paddingRight: 36,
                                  opacity: isAdmin ? 1 : 0.5,
                                }}
                              />
                            </div>
                          </div>
                        )}
                        {!hasPassword && (
                          <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
                            No password — OKRs for this department are visible to all users.
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}


          {/* ── Data ── */}
          {active === 'data' && (
            <>
              <SectionHead title="Data" sub="Export, import, or reset workspace data." />
              <div className="space-y-3">
                {[
                  {
                    icon: Download,
                    iconBg: 'var(--bg-tertiary)',
                    iconColor: 'var(--app-accent, #2563EB)',
                    title: 'Export Data',
                    desc: 'Download all workspace data as JSON.',
                    action: 'Export JSON',
                    variant: 'secondary' as const,
                  },
                  {
                    icon: Upload,
                    iconBg: 'var(--success-bg)',
                    iconColor: '#16A34A',
                    title: 'Import Data',
                    desc: 'Restore from a previously exported JSON file.',
                    action: 'Import JSON',
                    variant: 'secondary' as const,
                  },
                ].map(row => (
                  <div
                    key={row.title}
                    className="card flex items-center gap-4 p-4 rounded-[7px]"
                    style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', boxShadow: 'var(--card-shadow)' }}
                  >
                    <div className="w-9 h-9 rounded-[7px] flex items-center justify-center shrink-0" style={{ background: row.iconBg }}>
                      <row.icon size={16} style={{ color: row.iconColor }} />
                    </div>
                    <div className="flex-1">
                      <p className="text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>{row.title}</p>
                      <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{row.desc}</p>
                    </div>
                    <Button variant={row.variant} size="sm">{row.action}</Button>
                  </div>
                ))}

                {/* Create New Workspace */}
                <div
                  className="card flex items-center gap-4 p-4 rounded-[7px]"
                  style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', boxShadow: 'var(--card-shadow)' }}
                >
                  <div className="w-9 h-9 rounded-[7px] flex items-center justify-center shrink-0" style={{ background: 'var(--success-bg)' }}>
                    <PlusCircle size={16} style={{ color: '#16A34A' }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>Create New Workspace</p>
                    <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-muted)' }}>Set up a new workspace for a different team or project.</p>
                  </div>
                  <Button variant="secondary" size="sm" onClick={handleCreateNewWorkspace}>Create</Button>
                </div>

                {/* Reset Data */}
                <div
                  className="flex items-center gap-4 p-4 rounded-[7px]"
                  style={{ border: '1px solid rgba(234,179,8,0.25)', background: 'var(--warning-bg)' }}
                >
                  <div className="w-9 h-9 rounded-[7px] flex items-center justify-center shrink-0" style={{ background: 'var(--warning-bg)' }}>
                    <Trash2 size={16} style={{ color: '#D97706' }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[13px] font-semibold" style={{ color: 'var(--warning-text)' }}>Reset Project Data</p>
                    <p className="text-[12px] mt-0.5" style={{ color: 'var(--warning-text)' }}>
                      Clear all timelines, OKRs, and roadmap items. Members, departments, and settings are kept.
                    </p>
                  </div>
                  <Button variant="danger" size="sm" onClick={() => setShowResetConfirm(true)}>Reset</Button>
                </div>

                {/* Delete Workspace — owner only */}
                {isWorkspaceOwner && (
                  <div
                    className="flex items-center gap-4 p-4 rounded-[7px]"
                    style={{ border: '1px solid rgba(220,38,38,0.20)', background: 'var(--danger-bg)' }}
                  >
                    <div className="w-9 h-9 rounded-[7px] flex items-center justify-center shrink-0" style={{ background: 'var(--danger-bg)' }}>
                      <Building2 size={16} style={{ color: '#DC2626' }} />
                    </div>
                    <div className="flex-1">
                      <p className="text-[13px] font-semibold" style={{ color: 'var(--danger-text)' }}>Delete Workspace</p>
                      <p className="text-[12px] mt-0.5" style={{ color: 'var(--danger-text)' }}>
                        Permanently delete this workspace and all its data. This cannot be undone.
                      </p>
                    </div>
                    <Button variant="danger" size="sm" onClick={() => setShowDeleteWorkspace(true)}>Delete</Button>
                  </div>
                )}

                {/* Delete Account */}
                <div
                  className="flex items-center gap-4 p-4 rounded-[7px]"
                  style={{ border: '1px solid rgba(220,38,38,0.20)', background: 'var(--danger-bg)' }}
                >
                  <div className="w-9 h-9 rounded-[7px] flex items-center justify-center shrink-0" style={{ background: 'var(--danger-bg)' }}>
                    <UserX size={16} style={{ color: '#DC2626' }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[13px] font-semibold" style={{ color: 'var(--danger-text)' }}>Delete Account</p>
                    <p className="text-[12px] mt-0.5" style={{ color: 'var(--danger-text)' }}>
                      Permanently delete your account and all associated data.
                    </p>
                  </div>
                  <Button variant="danger" size="sm" onClick={() => setShowDeleteAccount(true)}>Delete</Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Reset Project Data Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="rounded-xl p-6 w-full max-w-[420px] mx-4 shadow-2xl" style={{ background: 'var(--bg-primary)' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'var(--warning-bg)' }}>
                <AlertTriangle size={20} style={{ color: '#D97706' }} />
              </div>
              <div>
                <h3 className="text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>Reset Project Data?</h3>
                <p className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>This action cannot be undone</p>
              </div>
            </div>
            <p className="text-[13px] mb-5" style={{ color: 'var(--text-secondary)' }}>
              This will permanently delete all timelines, OKRs, and visual roadmap items. Your workspace settings, team members, departments, and roles will be kept.
            </p>
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" size="sm" onClick={() => setShowResetConfirm(false)}>Cancel</Button>
              <Button variant="danger" size="sm" onClick={handleResetAllData}>Yes, Reset Data</Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Workspace Confirmation Modal */}
      {showDeleteWorkspace && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="rounded-xl p-6 w-full max-w-[420px] mx-4 shadow-2xl" style={{ background: 'var(--bg-primary)' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'var(--danger-bg)' }}>
                <Building2 size={20} style={{ color: '#DC2626' }} />
              </div>
              <div>
                <h3 className="text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>Delete Workspace?</h3>
                <p className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>This action cannot be undone</p>
              </div>
            </div>
            <p className="text-[13px] mb-2" style={{ color: 'var(--text-secondary)' }}>
              This will permanently delete <strong>{currentWorkspace?.name}</strong> and all its data including projects, OKRs, roadmaps, members, and departments.
            </p>
            <p className="text-[13px] mb-5" style={{ color: 'var(--text-secondary)' }}>
              You will be redirected to create a new workspace.
            </p>
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" size="sm" onClick={() => setShowDeleteWorkspace(false)}>Cancel</Button>
              <Button variant="danger" size="sm" onClick={handleDeleteWorkspace}>Yes, Delete Workspace</Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="rounded-xl p-6 w-full max-w-[420px] mx-4 shadow-2xl" style={{ background: 'var(--bg-primary)' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'var(--danger-bg)' }}>
                <UserX size={20} style={{ color: '#DC2626' }} />
              </div>
              <div>
                <h3 className="text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>Delete Account?</h3>
                <p className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>This action cannot be undone</p>
              </div>
            </div>

            {isWorkspaceOwner && otherMembers.length > 0 ? (
              <>
                <p className="text-[13px] mb-3" style={{ color: 'var(--text-secondary)' }}>
                  You are the workspace owner. Before deleting your account, please transfer ownership to another member:
                </p>
                <div className="space-y-2 mb-4 max-h-[200px] overflow-y-auto">
                  {otherMembers.map(m => (
                    <button
                      key={m.id}
                      onClick={() => setTransferOwnerTo(m.id)}
                      className="w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all"
                      style={{
                        border: transferOwnerTo === m.id ? '2px solid #2563EB' : '1px solid var(--border)',
                        background: transferOwnerTo === m.id ? 'var(--bg-tertiary)' : 'var(--bg-primary)',
                      }}
                    >
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[12px] font-semibold shrink-0"
                        style={{ background: '#2563EB' }}>
                        {m.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium truncate" style={{ color: 'var(--text-primary)' }}>{m.name}</p>
                        <p className="text-[11px] truncate" style={{ color: 'var(--text-muted)' }}>{m.email}</p>
                      </div>
                      {transferOwnerTo === m.id && (
                        <Check size={16} style={{ color: '#2563EB' }} />
                      )}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="ghost" size="sm" onClick={() => { setShowDeleteAccount(false); setTransferOwnerTo(null); }}>Cancel</Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={handleDeleteAccount}
                    disabled={!transferOwnerTo}
                  >
                    Transfer & Delete
                  </Button>
                </div>
              </>
            ) : isWorkspaceOwner && otherMembers.length === 0 ? (
              <>
                <p className="text-[13px] mb-5" style={{ color: 'var(--text-secondary)' }}>
                  You are the only member of this workspace. Deleting your account will also permanently delete the workspace and all its data.
                </p>
                <div className="flex gap-2 justify-end">
                  <Button variant="ghost" size="sm" onClick={() => setShowDeleteAccount(false)}>Cancel</Button>
                  <Button variant="danger" size="sm" onClick={handleDeleteAccount}>Delete Account & Workspace</Button>
                </div>
              </>
            ) : (
              <>
                <p className="text-[13px] mb-5" style={{ color: 'var(--text-secondary)' }}>
                  Your account and all associated data will be permanently deleted. You will be removed from this workspace.
                </p>
                <div className="flex gap-2 justify-end">
                  <Button variant="ghost" size="sm" onClick={() => setShowDeleteAccount(false)}>Cancel</Button>
                  <Button variant="danger" size="sm" onClick={handleDeleteAccount}>Delete Account</Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <ProductTour tourKey="settings" steps={SETTINGS_TOUR} />
    </div>
  );
}
