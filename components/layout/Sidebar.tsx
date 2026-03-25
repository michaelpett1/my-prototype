'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  GitBranch,
  Map,
  Target,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  Zap,
} from 'lucide-react';
import { useSettingsStore } from '@/lib/store/settingsStore';
import { clsx } from '@/lib/utils/clsx';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/timelines', label: 'Timelines', icon: GitBranch },
  { href: '/roadmap', label: 'Roadmap', icon: Map },
  { href: '/okrs', label: 'OKRs', icon: Target },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCompact, toggleSidebarCompact, profile } = useSettingsStore();

  return (
    <aside
      className={clsx(
        'flex flex-col h-screen shrink-0 z-30',
        'transition-all duration-200 ease-out',
        sidebarCompact ? 'w-[52px]' : 'w-[220px]'
      )}
      style={{ backgroundColor: '#111827', borderRight: '1px solid rgba(255,255,255,0.05)' }}
    >
      {/* Wordmark */}
      <div
        className={clsx(
          'flex items-center gap-2.5 h-[48px] shrink-0',
          sidebarCompact ? 'px-3.5 justify-center' : 'px-4'
        )}
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
      >
        {/* Logo mark — clean geometric */}
        <div className="flex items-center justify-center w-[26px] h-[26px] rounded-[5px] shrink-0"
          style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)' }}>
          <Zap size={13} className="text-white" strokeWidth={2.5} />
        </div>
        {!sidebarCompact && (
          <span className="text-[13px] font-semibold tracking-[-0.01em]" style={{ color: '#F9FAFB' }}>
            Northstar
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className={clsx('flex-1 py-3', sidebarCompact ? 'px-2' : 'px-2.5')} role="navigation">
        {/* Design decision: label + tight 32px row height. Linear-style: no background on hover until needed */}
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              title={sidebarCompact ? label : undefined}
              className={clsx(
                'flex items-center gap-2.5 rounded-[5px] mb-[1px]',
                'transition-all duration-150 ease-out',
                sidebarCompact ? 'justify-center px-0 py-[7px]' : 'px-2.5 py-[7px]',
                active
                  ? 'text-white'
                  : 'text-[#9CA3AF] hover:text-[#E5E7EB]'
              )}
              style={active ? {
                background: 'rgba(59,130,246,0.18)',
                boxShadow: 'inset 0 0 0 1px rgba(59,130,246,0.25)',
              } : {}}
            >
              <Icon size={15} className="shrink-0" strokeWidth={active ? 2.2 : 1.8} />
              {!sidebarCompact && (
                <span className={clsx('text-[13px] truncate', active ? 'font-semibold' : 'font-normal')}>
                  {label}
                </span>
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
          style={pathname === '/settings' ? { background: 'rgba(59,130,246,0.18)' } : {}}
        >
          <Settings size={15} strokeWidth={1.8} className="shrink-0" />
          {!sidebarCompact && <span className="text-[13px]">Settings</span>}
        </Link>

        {/* User row — only in expanded mode */}
        {!sidebarCompact && (
          <div className="flex items-center gap-2 px-2.5 py-2 mt-1 rounded-[5px]">
            <img
              src={profile.avatarUrl}
              alt={profile.name}
              className="w-[24px] h-[24px] rounded-full shrink-0"
            />
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-semibold text-[#E5E7EB] truncate leading-none">{profile.name}</p>
              <p className="text-[11px] text-[#6B7280] truncate mt-[2px] leading-none">{profile.role}</p>
            </div>
          </div>
        )}

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
