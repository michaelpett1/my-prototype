'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  GitBranch,
  Map,
  Target,
  Settings,
  ChevronLeft,
  ChevronRight,
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
        'flex flex-col h-screen bg-[#0F172A] text-white shrink-0 transition-all duration-200 z-30',
        sidebarCompact ? 'w-14' : 'w-56'
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-3 py-4 border-b border-[#1E293B]">
        <div className="flex items-center justify-center w-7 h-7 bg-blue-500 rounded shrink-0">
          <Zap size={14} className="text-white" />
        </div>
        {!sidebarCompact && (
          <span className="text-sm font-semibold tracking-tight text-white">Northstar</span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2 space-y-0.5">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              title={sidebarCompact ? label : undefined}
              className={clsx(
                'flex items-center gap-2.5 px-2.5 py-2 rounded text-sm transition-colors',
                active
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-[#1E293B]'
              )}
            >
              <Icon size={16} className="shrink-0" />
              {!sidebarCompact && <span className="truncate">{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t border-[#1E293B] px-2 py-3 space-y-0.5">
        <Link
          href="/settings"
          title={sidebarCompact ? 'Settings' : undefined}
          className={clsx(
            'flex items-center gap-2.5 px-2.5 py-2 rounded text-sm transition-colors',
            pathname === '/settings'
              ? 'bg-blue-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-[#1E293B]'
          )}
        >
          <Settings size={16} className="shrink-0" />
          {!sidebarCompact && <span>Settings</span>}
        </Link>

        {/* User */}
        {!sidebarCompact && (
          <div className="flex items-center gap-2 px-2.5 py-2 mt-1">
            <img src={profile.avatarUrl} alt={profile.name} className="w-6 h-6 rounded-full shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-medium text-white truncate">{profile.name}</p>
              <p className="text-xs text-slate-500 truncate">{profile.role}</p>
            </div>
          </div>
        )}

        {/* Collapse toggle */}
        <button
          onClick={toggleSidebarCompact}
          className="flex items-center gap-2.5 px-2.5 py-2 w-full rounded text-slate-400 hover:text-white hover:bg-[#1E293B] text-sm transition-colors"
          aria-label={sidebarCompact ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCompact ? <ChevronRight size={16} /> : (
            <>
              <ChevronLeft size={16} />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
