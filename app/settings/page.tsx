'use client';
import { useState } from 'react';
import { Sun, Moon, Monitor, Trash2, Plus, Download, Upload, Check } from 'lucide-react';
import { useSettingsStore } from '@/lib/store/settingsStore';
import { Button } from '@/components/ui/Button';
import type { Theme, TeamMember } from '@/lib/types';
import { clsx } from '@/lib/utils/clsx';

const SECTIONS = [
  { id: 'appearance', label: 'Appearance' },
  { id: 'profile',    label: 'Profile' },
  { id: 'workspace',  label: 'Workspace' },
  { id: 'team',       label: 'Team Members' },
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

/* ── Reusable settings field ─────────────────────────────────────── */
function SettingsField({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label
        className="block text-[12px] font-semibold mb-1"
        style={{ color: '#374151' }}
      >
        {label}
      </label>
      {hint && <p className="text-[12px] mb-1.5" style={{ color: '#9CA3AF' }}>{hint}</p>}
      {children}
    </div>
  );
}

const inputCls = 'w-full rounded-[5px] text-[13px] transition-all duration-150 ease-out focus:outline-none';
const inputStyle = {
  padding: '7px 10px',
  border: '1px solid rgba(0,0,0,0.12)',
  color: '#1C1917',
  background: '#FFFFFF',
};

/* ── Section heading ─────────────────────────────────────────────── */
function SectionHead({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-[16px] font-semibold" style={{ color: '#1C1917', letterSpacing: '-0.01em' }}>{title}</h2>
      {sub && <p className="text-[13px] mt-0.5" style={{ color: '#9CA3AF' }}>{sub}</p>}
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
    addTeamMember, removeTeamMember,
  } = useSettingsStore();

  const [newMember, setNewMember]       = useState({ name: '', email: '', role: '' });
  const [showAddMember, setShowAddMember] = useState(false);

  const handleAddMember = () => {
    if (!newMember.name || !newMember.email) return;
    addTeamMember({
      id: `u-${Date.now()}`,
      name: newMember.name,
      email: newMember.email,
      role: newMember.role || 'Member',
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(newMember.name)}&background=2563EB&color=fff&size=40`,
    });
    setNewMember({ name: '', email: '', role: '' });
    setShowAddMember(false);
  };

  return (
    <div className="flex h-full">
      {/* Settings nav */}
      <div
        className="w-[192px] shrink-0 p-3"
        style={{ backgroundColor: '#FFFFFF', borderRight: '1px solid rgba(0,0,0,0.07)' }}
      >
        <p
          className="text-[10px] font-semibold uppercase tracking-widest px-2.5 mb-2"
          style={{ color: '#9CA3AF', letterSpacing: '0.09em' }}
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
                ? { background: '#EFF6FF', color: '#1D4ED8', fontWeight: 600 }
                : { color: '#6B7280', fontWeight: 400 }
              }
              onMouseEnter={e => {
                if (active !== id) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,0,0,0.03)';
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
        <div className="max-w-[480px]">

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
                        onClick={() => updateTheme(value)}
                        className="flex-1 flex flex-col items-center gap-2 py-3 rounded-[7px] transition-all duration-150 ease-out text-[12px]"
                        style={theme === value ? {
                          border: '1.5px solid #2563EB',
                          color: '#1D4ED8',
                          background: '#EFF6FF',
                          fontWeight: 600,
                        } : {
                          border: '1px solid rgba(0,0,0,0.10)',
                          color: '#6B7280',
                          background: '#FFFFFF',
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
                        onClick={() => updateAccentColor(color)}
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
                  style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}
                >
                  <div>
                    <p className="text-[13px] font-semibold" style={{ color: '#1C1917' }}>Compact sidebar</p>
                    <p className="text-[12px] mt-0.5" style={{ color: '#9CA3AF' }}>Icons only — more horizontal space</p>
                  </div>
                  {/* Toggle */}
                  <button
                    onClick={toggleSidebarCompact}
                    className="relative rounded-full transition-all duration-200 ease-out shrink-0"
                    style={{
                      width: 36, height: 20,
                      background: sidebarCompact ? '#2563EB' : 'rgba(0,0,0,0.12)',
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

          {/* ── Profile ── */}
          {active === 'profile' && (
            <>
              <SectionHead title="Profile" sub="Your personal details across Northstar." />

              {/* Avatar preview */}
              <div
                className="flex items-center gap-3 p-3 rounded-[7px] mb-5"
                style={{ background: '#F5F4F2', border: '1px solid rgba(0,0,0,0.06)' }}
              >
                <img src={profile.avatarUrl} alt={profile.name} className="w-12 h-12 rounded-full" />
                <div>
                  <p className="text-[14px] font-semibold" style={{ color: '#1C1917' }}>{profile.name}</p>
                  <p className="text-[12px] mt-0.5" style={{ color: '#9CA3AF' }}>{profile.role}</p>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  { label: 'Display Name', key: 'name' as const, value: profile.name },
                  { label: 'Email',        key: 'email' as const, value: profile.email },
                  { label: 'Role',         key: 'role' as const, value: profile.role },
                  { label: 'Avatar URL',   key: 'avatarUrl' as const, value: profile.avatarUrl },
                ].map(({ label, key, value }) => (
                  <SettingsField key={key} label={label}>
                    <input
                      type="text"
                      defaultValue={value}
                      onBlur={e => updateProfile({ [key]: e.target.value })}
                      className={inputCls}
                      style={inputStyle}
                      onFocus={e => { (e.target as HTMLInputElement).style.borderColor = '#2563EB'; (e.target as HTMLInputElement).style.boxShadow = '0 0 0 2px rgba(37,99,235,0.12)'; }}
                      onBlurCapture={e => { (e.target as HTMLInputElement).style.borderColor = 'rgba(0,0,0,0.12)'; (e.target as HTMLInputElement).style.boxShadow = 'none'; }}
                    />
                  </SettingsField>
                ))}
              </div>
            </>
          )}

          {/* ── Workspace ── */}
          {active === 'workspace' && (
            <>
              <SectionHead title="Workspace" sub="Global defaults for your team." />
              <div className="space-y-4">
                <SettingsField label="Workspace Name">
                  <input
                    type="text"
                    defaultValue={workspace.name}
                    onBlur={e => updateWorkspace({ name: e.target.value })}
                    className={inputCls}
                    style={inputStyle}
                    onFocus={e => { (e.target as HTMLInputElement).style.borderColor = '#2563EB'; }}
                    onBlurCapture={e => { (e.target as HTMLInputElement).style.borderColor = 'rgba(0,0,0,0.12)'; }}
                  />
                </SettingsField>

                <SettingsField label="Default OKR Period">
                  <select
                    value={workspace.defaultOKRPeriod}
                    onChange={e => updateWorkspace({ defaultOKRPeriod: e.target.value })}
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
                    value={workspace.defaultTimelineView}
                    onChange={e => updateWorkspace({ defaultTimelineView: e.target.value as 'gantt' | 'table' | 'board' })}
                    className={inputCls}
                    style={inputStyle}
                  >
                    <option value="gantt">Gantt Chart</option>
                    <option value="table">Table</option>
                    <option value="board">Board</option>
                  </select>
                </SettingsField>
              </div>
            </>
          )}

          {/* ── Team Members ── */}
          {active === 'team' && (
            <>
              <div className="flex items-start justify-between mb-6">
                <SectionHead title="Team Members" sub={`${teamMembers.length} members`} />
                <Button variant="primary" size="sm" onClick={() => setShowAddMember(true)}>
                  <Plus size={13} /> Add
                </Button>
              </div>

              <div className="space-y-2">
                {teamMembers.map(member => (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 p-3 bg-white rounded-[7px] group"
                    style={{ border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}
                  >
                    <img src={member.avatarUrl} alt={member.name} className="w-8 h-8 rounded-full shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold truncate" style={{ color: '#1C1917' }}>{member.name}</p>
                      <p className="text-[11px] font-mono truncate" style={{ color: '#9CA3AF' }}>{member.email} · {member.role}</p>
                    </div>
                    <button
                      onClick={() => removeTeamMember(member.id)}
                      className="p-1.5 rounded-[4px] opacity-0 group-hover:opacity-100 transition-all duration-150 ease-out"
                      style={{ color: '#9CA3AF' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#DC2626'; (e.currentTarget as HTMLButtonElement).style.background = '#FEF2F2'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#9CA3AF'; (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                      aria-label={`Remove ${member.name}`}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>

              {showAddMember && (
                <div
                  className="mt-4 p-4 rounded-[7px] space-y-3"
                  style={{ background: '#FAFAF9', border: '1px solid rgba(0,0,0,0.07)' }}
                >
                  <p className="text-[13px] font-semibold" style={{ color: '#1C1917' }}>Add Member</p>
                  {[
                    { label: 'Name',  key: 'name'  as const, ph: 'Full name' },
                    { label: 'Email', key: 'email' as const, ph: 'email@company.com' },
                    { label: 'Role',  key: 'role'  as const, ph: 'e.g. Engineer' },
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
                    iconBg: '#EFF6FF',
                    iconColor: '#2563EB',
                    title: 'Export Data',
                    desc: 'Download all workspace data as JSON.',
                    action: 'Export JSON',
                    variant: 'secondary' as const,
                  },
                  {
                    icon: Upload,
                    iconBg: '#F0FDF4',
                    iconColor: '#16A34A',
                    title: 'Import Data',
                    desc: 'Restore from a previously exported JSON file.',
                    action: 'Import JSON',
                    variant: 'secondary' as const,
                  },
                ].map(row => (
                  <div
                    key={row.title}
                    className="flex items-center gap-4 p-4 bg-white rounded-[7px]"
                    style={{ border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}
                  >
                    <div className="w-9 h-9 rounded-[7px] flex items-center justify-center shrink-0" style={{ background: row.iconBg }}>
                      <row.icon size={16} style={{ color: row.iconColor }} />
                    </div>
                    <div className="flex-1">
                      <p className="text-[13px] font-semibold" style={{ color: '#1C1917' }}>{row.title}</p>
                      <p className="text-[12px] mt-0.5" style={{ color: '#9CA3AF' }}>{row.desc}</p>
                    </div>
                    <Button variant={row.variant} size="sm">{row.action}</Button>
                  </div>
                ))}

                {/* Danger zone */}
                <div
                  className="flex items-center gap-4 p-4 rounded-[7px]"
                  style={{ border: '1px solid rgba(220,38,38,0.20)', background: '#FEF2F2' }}
                >
                  <div className="w-9 h-9 rounded-[7px] flex items-center justify-center shrink-0" style={{ background: '#FECACA' }}>
                    <Trash2 size={16} style={{ color: '#DC2626' }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[13px] font-semibold" style={{ color: '#991B1B' }}>Reset All Data</p>
                    <p className="text-[12px] mt-0.5" style={{ color: '#B91C1C' }}>
                      Permanently delete all projects, OKRs, and settings. This cannot be undone.
                    </p>
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
