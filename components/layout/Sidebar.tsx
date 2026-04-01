'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard,
  GitBranch,
  Map,
  Target,
  Lightbulb,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  ChevronDown,
  Check,
  Plus,
} from 'lucide-react';
import { useSettingsStore } from '@/lib/store/settingsStore';
import { useSuggestionsStore } from '@/lib/store/suggestionsStore';
import { useAuthStore } from '@/lib/store/authStore';
import { clsx } from '@/lib/utils/clsx';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/timelines', label: 'Timelines', icon: GitBranch },
  { href: '/roadmap', label: 'Visual Roadmap', icon: Map },
  { href: '/okrs', label: 'OKRs', icon: Target },
  { href: '/suggestions', label: 'Suggestions', icon: Lightbulb },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { sidebarCompact, toggleSidebarCompact, profile } = useSettingsStore();
  const { user, currentWorkspace, workspaces, setCurrentWorkspace, signOut } = useAuthStore();
  const [showWsSwitcher, setShowWsSwitcher] = useState(false);
  const pendingSuggestions = useSuggestionsStore((s) => {
    let count = 0;
    for (const sg of s.suggestions) { if (sg.status === 'pending') count++; }
    return count;
  });

  async function handleSignOut() {
    await signOut();
    router.push('/sign-in');
  }

  const displayName = user?.user_metadata?.full_name ?? profile.name;
  const displayEmail = user?.email ?? profile.email;
  const displayRole = profile.role;

  return (
    <aside
      className={clsx(
        'flex flex-col h-screen shrink-0 z-30',
        'transition-all duration-200 ease-out',
        sidebarCompact ? 'w-[52px]' : 'w-[220px]'
      )}
      style={{ backgroundColor: '#0f172a', borderRight: '1px solid rgba(255,255,255,0.05)' }}
    >
      {/* Wordmark + workspace */}
      <div
        className={clsx(
          'flex items-center gap-2.5 h-[48px] shrink-0',
          sidebarCompact ? 'px-3.5 justify-center' : 'px-4'
        )}
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
      >
        {/* Logo mark */}
        <img
          src="/assets/northstar-icon.svg"
          alt="Northstar"
          className="w-[26px] h-[26px] rounded-[5px] shrink-0"
        />
        {!sidebarCompact && (
          <div className="flex-1 min-w-0">
            {currentWorkspace ? (
              <button
                onClick={() => setShowWsSwitcher(!showWsSwitcher)}
                className="flex items-center gap-1 truncate max-w-full"
                style={{
                  color: '#F9FAFB',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  padding: '3px 8px',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: '-0.01em',
                }}
              >
                <span className="truncate">{currentWorkspace.name}</span>
                <ChevronDown size={12} style={{ transform: showWsSwitcher ? 'rotate(180deg)' : 'none', transition: 'transform 150ms' }} />
              </button>
            ) : (
              <span className="text-[14px] font-bold tracking-[-0.01em] block" style={{ color: '#F9FAFB' }}>
                Northstar
              </span>
            )}
          </div>
        )}
      </div>

      {/* Workspace switcher dropdown */}
      {showWsSwitcher && !sidebarCompact && (
        <div
          style={{
            background: '#1F2937',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            padding: '6px 8px',
          }}
        >
          {workspaces.map(ws => (
            <button
              key={ws.id}
              onClick={() => {
                if (ws.id !== currentWorkspace?.id) {
                  setCurrentWorkspace(ws);
                  router.push('/dashboard');
                }
                setShowWsSwitcher(false);
              }}
              className="flex items-center gap-2 w-full rounded-[4px] px-2 py-1.5 text-left transition-colors"
              style={{
                color: ws.id === currentWorkspace?.id ? '#FFFFFF' : '#9CA3AF',
                background: ws.id === currentWorkspace?.id ? 'rgba(59,130,246,0.15)' : 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: 12,
              }}
            >
              <span className="truncate flex-1">{ws.name}</span>
              {ws.id === currentWorkspace?.id && <Check size={12} />}
            </button>
          ))}
          <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '4px 0' }} />
          <button
            onClick={() => {
              setShowWsSwitcher(false);
              router.push('/onboarding?new=1');
            }}
            className="flex items-center gap-2 w-full rounded-[4px] px-2 py-1.5 text-left transition-colors"
            style={{
              color: '#9CA3AF',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: 12,
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#FFFFFF'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#9CA3AF'; e.currentTarget.style.background = 'transparent'; }}
          >
            <Plus size={12} />
            <span>Create New Workspace</span>
          </button>
        </div>
      )}

      {/* Nav */}
      <nav className={clsx('flex-1 py-3', sidebarCompact ? 'px-2' : 'px-2.5')} role="navigation">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              title={sidebarCompact ? label : undefined}
              className={clsx(
                'flex items-center gap-2.5 rounded-[5px] mb-[1px] relative',
                'transition-all duration-150 ease-out',
                sidebarCompact ? 'justify-center px-0 py-[7px]' : 'px-2.5 py-[7px]',
                active
                  ? 'text-white'
                  : 'text-[#9CA3AF] hover:text-[#E5E7EB]'
              )}
              style={active ? {
                background: `linear-gradient(135deg, rgba(79,70,229,0.15) 0%, rgba(124,58,237,0.1) 100%)`,
                boxShadow: `inset 0 0 0 1px rgba(124,58,237,0.15)`,
              } : {}}
            >
              {active && (
                <span
                  className="absolute left-0 top-1 bottom-1 rounded-r"
                  style={{ width: 3, background: '#7c3aed' }}
                />
              )}
              <Icon size={15} className="shrink-0" strokeWidth={active ? 2.2 : 1.8} />
              {!sidebarCompact && (
                <>
                  <span className={clsx('text-[13px] truncate flex-1', active ? 'font-semibold' : 'font-normal')}>
                    {label}
                  </span>
                  {(href === '/suggestions' || href === '/timelines') && pendingSuggestions > 0 && (
                    <span
                      className="inline-flex items-center justify-center rounded-full text-[10px] font-semibold shrink-0"
                      style={{
                        minWidth: 18,
                        height: 18,
                        padding: '0 5px',
                        background: '#EF4444',
                        color: '#FFFFFF',
                      }}
                    >
                      {pendingSuggestions}
                    </span>
                  )}
                </>
              )}
              {sidebarCompact && (href === '/suggestions' || href === '/timelines') && pendingSuggestions > 0 && (
                <span
                  className="absolute rounded-full"
                  style={{
                    top: 4,
                    right: 4,
                    width: 7,
                    height: 7,
                    background: '#EF4444',
                  }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div
        className={clsx('py-3', sidebarCompact ? 'px-2' : 'px-2.5')}
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
      >
        {/* Settings */}
        <Link
          href="/settings"
          title={sidebarCompact ? 'Settings' : undefined}
          className={clsx(
            'flex items-center gap-2.5 rounded-[5px] mb-[1px] transition-all duration-150 ease-out',
            sidebarCompact ? 'justify-center px-0 py-[7px]' : 'px-2.5 py-[7px]',
            pathname === '/settings'
              ? 'text-white'
              : 'text-[#6B7280] hover:text-[#E5E7EB]'
          )}
          style={pathname === '/settings' ? { background: `color-mix(in srgb, var(--app-accent, #3B82F6) 18%, transparent)` } : {}}
        >
          <Settings size={15} strokeWidth={1.8} className="shrink-0" />
          {!sidebarCompact && <span className="text-[13px]">Settings</span>}
        </Link>

        {/* User row */}
        {!sidebarCompact && (
          <div className="flex items-center gap-2 px-2.5 py-2 mt-1 rounded-[5px]">
            <div
              className="w-[24px] h-[24px] rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold"
              style={{
                background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
                color: '#FFFFFF',
              }}
            >
              {(displayName ?? 'U').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-semibold text-[#E5E7EB] truncate leading-none">
                {displayName ?? 'User'}
              </p>
              <p className="text-[11px] text-[#6B7280] truncate mt-[2px] leading-none">
                {displayEmail ?? displayRole}
              </p>
            </div>
          </div>
        )}

        {/* Log out */}
        <button
          onClick={handleSignOut}
          title={sidebarCompact ? 'Log out' : undefined}
          className={clsx(
            'flex items-center gap-2.5 w-full rounded-[5px] transition-all duration-150 ease-out text-[#6B7280] hover:text-[#F87171] mt-1',
            sidebarCompact ? 'justify-center px-0 py-[7px]' : 'px-2.5 py-[7px]'
          )}
        >
          <LogOut size={14} className="shrink-0" strokeWidth={1.8} />
          {!sidebarCompact && <span className="text-[12px]">Log out</span>}
        </button>

        {/* Collapse toggle */}
        <button
          onClick={toggleSidebarCompact}
          aria-label={sidebarCompact ? 'Expand sidebar' : 'Collapse sidebar'}
          className={clsx(
            'flex items-center gap-2.5 w-full rounded-[5px] transition-all duration-150 ease-out text-[#4B5563] hover:text-[#9CA3AF] mt-1',
            sidebarCompact ? 'justify-center px-0 py-[7px]' : 'px-2.5 py-[7px]'
          )}
        >
          {sidebarCompact ? <PanelLeftOpen size={14} /> : (
            <>
              <PanelLeftClose size={14} />
              <span className="text-[12px]">Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
