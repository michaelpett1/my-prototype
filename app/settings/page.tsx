'use client';
import { useState } from 'react';
import { Sun, Moon, Monitor, Trash2, Plus, Download, Upload } from 'lucide-react';
import { useSettingsStore } from '@/lib/store/settingsStore';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import type { Theme, TeamMember } from '@/lib/types';
import { clsx } from '@/lib/utils/clsx';

const SETTINGS_SECTIONS = [
  { id: 'appearance', label: 'Appearance' },
  { id: 'profile', label: 'Profile' },
  { id: 'workspace', label: 'Workspace' },
  { id: 'team', label: 'Team Members' },
  { id: 'data', label: 'Data' },
];

const ACCENT_COLORS = [
  { color: '#3B82F6', label: 'Blue' },
  { color: '#8B5CF6', label: 'Violet' },
  { color: '#10B981', label: 'Emerald' },
  { color: '#F59E0B', label: 'Amber' },
  { color: '#EF4444', label: 'Red' },
  { color: '#EC4899', label: 'Pink' },
];

const THEME_OPTIONS: Array<{ value: Theme; label: string; icon: React.ElementType }> = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('appearance');
  const {
    theme, accentColor, sidebarCompact,
    profile, workspace, teamMembers,
    updateTheme, updateAccentColor, toggleSidebarCompact,
    updateProfile, updateWorkspace,
    addTeamMember, removeTeamMember,
  } = useSettingsStore();

  const [newMember, setNewMember] = useState({ name: '', email: '', role: '' });
  const [showAddMember, setShowAddMember] = useState(false);

  const handleAddMember = () => {
    if (!newMember.name || !newMember.email) return;
    const member: TeamMember = {
      id: `u-${Date.now()}`,
      name: newMember.name,
      email: newMember.email,
      role: newMember.role || 'Member',
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(newMember.name)}&background=3B82F6&color=fff&size=40`,
    };
    addTeamMember(member);
    setNewMember({ name: '', email: '', role: '' });
    setShowAddMember(false);
  };

  return (
    <div className="flex h-full">
      {/* Settings sidebar */}
      <div className="w-48 shrink-0 border-r border-slate-200 bg-white p-3">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide px-2 mb-2">Settings</p>
        <nav className="space-y-0.5">
          {SETTINGS_SECTIONS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              className={clsx(
                'w-full text-left px-2.5 py-2 rounded text-sm transition-colors',
                activeSection === id ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-600 hover:bg-slate-100'
              )}
            >
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Settings content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-lg space-y-8">

          {/* Appearance */}
          {activeSection === 'appearance' && (
            <>
              <div>
                <h2 className="text-base font-semibold text-slate-800 mb-1">Appearance</h2>
                <p className="text-sm text-slate-500">Customise the look and feel of Northstar.</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">Theme</label>
                  <div className="flex gap-2">
                    {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
                      <button
                        key={value}
                        onClick={() => updateTheme(value)}
                        className={clsx(
                          'flex-1 flex flex-col items-center gap-2 py-3 rounded-lg border-2 transition-all text-sm font-medium',
                          theme === value
                            ? 'border-blue-600 text-blue-700 bg-blue-50'
                            : 'border-slate-200 text-slate-600 hover:border-slate-300 bg-white'
                        )}
                      >
                        <Icon size={18} />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">Accent Colour</label>
                  <div className="flex gap-2">
                    {ACCENT_COLORS.map(({ color, label }) => (
                      <button
                        key={color}
                        onClick={() => updateAccentColor(color)}
                        title={label}
                        className={clsx(
                          'w-8 h-8 rounded-full transition-all',
                          accentColor === color ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : 'hover:scale-105'
                        )}
                        style={{ backgroundColor: color }}
                        aria-label={`${label} accent`}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between py-3 border-t border-slate-200">
                  <div>
                    <p className="text-sm font-medium text-slate-700">Compact sidebar</p>
                    <p className="text-xs text-slate-500">Show icons only in the sidebar</p>
                  </div>
                  <button
                    onClick={toggleSidebarCompact}
                    className={clsx(
                      'relative inline-flex h-5 w-9 items-center rounded-full transition-colors',
                      sidebarCompact ? 'bg-blue-600' : 'bg-slate-200'
                    )}
                  >
                    <span
                      className={clsx(
                        'inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform',
                        sidebarCompact ? 'translate-x-4.5' : 'translate-x-0.5'
                      )}
                    />
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Profile */}
          {activeSection === 'profile' && (
            <>
              <div>
                <h2 className="text-base font-semibold text-slate-800 mb-1">Profile</h2>
                <p className="text-sm text-slate-500">Your personal details.</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <img src={profile.avatarUrl} alt={profile.name} className="w-14 h-14 rounded-full" />
                  <div>
                    <p className="text-sm font-medium text-slate-700">{profile.name}</p>
                    <p className="text-xs text-slate-400">{profile.role}</p>
                  </div>
                </div>

                {[
                  { label: 'Display Name', key: 'name', value: profile.name },
                  { label: 'Email', key: 'email', value: profile.email },
                  { label: 'Role', key: 'role', value: profile.role },
                  { label: 'Avatar URL', key: 'avatarUrl', value: profile.avatarUrl },
                ].map(({ label, key, value }) => (
                  <div key={key}>
                    <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
                    <input
                      type="text"
                      defaultValue={value}
                      onBlur={(e) => updateProfile({ [key]: e.target.value })}
                      className="w-full border border-slate-200 rounded px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Workspace */}
          {activeSection === 'workspace' && (
            <>
              <div>
                <h2 className="text-base font-semibold text-slate-800 mb-1">Workspace</h2>
                <p className="text-sm text-slate-500">Configure workspace-level defaults.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Workspace Name</label>
                  <input
                    type="text"
                    defaultValue={workspace.name}
                    onBlur={(e) => updateWorkspace({ name: e.target.value })}
                    className="w-full border border-slate-200 rounded px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Default OKR Period</label>
                  <select
                    value={workspace.defaultOKRPeriod}
                    onChange={(e) => updateWorkspace({ defaultOKRPeriod: e.target.value })}
                    className="w-full border border-slate-200 rounded px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-blue-500"
                  >
                    {['2026-Q1', '2026-Q2', '2026-Q3', '2026-Q4', '2027-Q1'].map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Default Timeline View</label>
                  <select
                    value={workspace.defaultTimelineView}
                    onChange={(e) => updateWorkspace({ defaultTimelineView: e.target.value as 'gantt' | 'table' | 'board' })}
                    className="w-full border border-slate-200 rounded px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-blue-500"
                  >
                    <option value="gantt">Gantt Chart</option>
                    <option value="table">Table</option>
                    <option value="board">Board</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {/* Team Members */}
          {activeSection === 'team' && (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-slate-800 mb-1">Team Members</h2>
                  <p className="text-sm text-slate-500">{teamMembers.length} members</p>
                </div>
                <Button variant="primary" size="sm" onClick={() => setShowAddMember(true)}>
                  <Plus size={14} /> Add Member
                </Button>
              </div>

              <div className="space-y-2">
                {teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200">
                    <img src={member.avatarUrl} alt={member.name} className="w-8 h-8 rounded-full" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700">{member.name}</p>
                      <p className="text-xs text-slate-400">{member.email} · {member.role}</p>
                    </div>
                    <button
                      onClick={() => removeTeamMember(member.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                      aria-label={`Remove ${member.name}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>

              {showAddMember && (
                <div className="bg-slate-50 rounded-lg border border-slate-200 p-4 space-y-3">
                  <p className="text-sm font-medium text-slate-700">Add Team Member</p>
                  {[
                    { label: 'Name', key: 'name' as const, placeholder: 'Full name' },
                    { label: 'Email', key: 'email' as const, placeholder: 'email@company.com' },
                    { label: 'Role', key: 'role' as const, placeholder: 'e.g. Engineer' },
                  ].map(({ label, key, placeholder }) => (
                    <div key={key}>
                      <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
                      <input
                        type="text"
                        value={newMember[key]}
                        onChange={(e) => setNewMember((prev) => ({ ...prev, [key]: e.target.value }))}
                        placeholder={placeholder}
                        className="w-full border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Button variant="primary" size="sm" onClick={handleAddMember}>Add</Button>
                    <Button variant="ghost" size="sm" onClick={() => setShowAddMember(false)}>Cancel</Button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Data */}
          {activeSection === 'data' && (
            <>
              <div>
                <h2 className="text-base font-semibold text-slate-800 mb-1">Data</h2>
                <p className="text-sm text-slate-500">Export, import, or reset your workspace data.</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-4 p-4 bg-white rounded-lg border border-slate-200">
                  <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                    <Download size={16} className="text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-700">Export Data</p>
                    <p className="text-xs text-slate-500 mt-0.5">Download all workspace data as a JSON file.</p>
                  </div>
                  <Button variant="secondary" size="sm">Export JSON</Button>
                </div>

                <div className="flex items-start gap-4 p-4 bg-white rounded-lg border border-slate-200">
                  <div className="w-9 h-9 bg-emerald-50 rounded-lg flex items-center justify-center shrink-0">
                    <Upload size={16} className="text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-700">Import Data</p>
                    <p className="text-xs text-slate-500 mt-0.5">Import from a previously exported JSON file.</p>
                  </div>
                  <Button variant="secondary" size="sm">Import JSON</Button>
                </div>

                <div className="flex items-start gap-4 p-4 bg-white rounded-lg border border-red-200 bg-red-50">
                  <div className="w-9 h-9 bg-red-100 rounded-lg flex items-center justify-center shrink-0">
                    <Trash2 size={16} className="text-red-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-700">Reset All Data</p>
                    <p className="text-xs text-red-500 mt-0.5">Permanently delete all projects, OKRs, and settings. Cannot be undone.</p>
                  </div>
                  <Button variant="danger" size="sm">Reset</Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
