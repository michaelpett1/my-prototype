'use client';
import { usePathname } from 'next/navigation';
import { Bell, Search, Sun, Moon, ChevronRight } from 'lucide-react';
import { useSettingsStore } from '@/lib/store/settingsStore';

const BREADCRUMBS: Record<string, string[]> = {
  '/dashboard': ['Dashboard'],
  '/timelines': ['Timelines'],
  '/roadmap': ['Roadmap'],
  '/okrs': ['OKRs'],
  '/settings': ['Settings'],
};

export function Topbar() {
  const pathname = usePathname();
  const { theme, updateTheme, profile } = useSettingsStore();
  const crumbs = BREADCRUMBS[pathname] ?? [pathname.slice(1)];
  const isDark = theme === 'dark';

  return (
    <header
      className="h-[48px] flex items-center gap-3 px-4 shrink-0"
      style={{
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid rgba(0,0,0,0.07)',
        /* Subtle shadow to lift content above topbar */
      }}
    >
      {/* Breadcrumb — the nav context cue */}
      <nav className="flex items-center gap-1 text-[13px] flex-1 min-w-0">
        <span className="text-[#9CA3AF] font-normal shrink-0">Northstar</span>
        {crumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-1 shrink-0">
            <ChevronRight size={12} className="text-[#D1D5DB]" />
            <span className={
              i === crumbs.length - 1
                ? 'font-semibold text-[#1C1917]'
                : 'text-[#6B7280]'
            }>
              {crumb}
            </span>
          </span>
        ))}
      </nav>

      {/* Search — command palette trigger */}
      {/* Design decision: look like a real search field, not just a button */}
      <button
        className="flex items-center gap-2 rounded-[5px] transition-all duration-150 ease-out"
        style={{
          padding: '5px 10px',
          background: '#F5F4F2',
          border: '1px solid rgba(0,0,0,0.07)',
          color: '#9CA3AF',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(0,0,0,0.14)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(0,0,0,0.07)';
        }}
      >
        <Search size={13} />
        <span className="text-[12px]">Search</span>
        <kbd
          className="text-[11px] font-mono ml-1 rounded"
          style={{
            padding: '1px 5px',
            background: 'rgba(0,0,0,0.06)',
            color: '#9CA3AF',
            fontFamily: 'ui-monospace, monospace',
          }}
        >⌘K</kbd>
      </button>

      {/* Theme toggle */}
      <button
        onClick={() => updateTheme(isDark ? 'light' : 'dark')}
        aria-label="Toggle theme"
        className="rounded-[5px] transition-all duration-150 ease-out text-[#9CA3AF] hover:text-[#6B7280]"
        style={{ padding: '6px' }}
      >
        {isDark ? <Sun size={15} /> : <Moon size={15} />}
      </button>

      {/* Notifications */}
      <button
        aria-label="Notifications"
        className="relative rounded-[5px] transition-all duration-150 ease-out text-[#9CA3AF] hover:text-[#6B7280]"
        style={{ padding: '6px' }}
      >
        <Bell size={15} />
        {/* Notification dot — small but purposeful */}
        <span
          className="absolute top-[5px] right-[5px] w-[6px] h-[6px] rounded-full"
          style={{ background: '#2563EB', boxShadow: '0 0 0 1.5px #fff' }}
        />
      </button>

      {/* Avatar — clickable, leads to profile settings */}
      <button className="rounded-full transition-opacity duration-150 hover:opacity-80" aria-label="Your profile">
        <img
          src={profile.avatarUrl}
          alt={profile.name}
          className="w-[28px] h-[28px] rounded-full"
          style={{ boxShadow: '0 0 0 2px rgba(0,0,0,0.08)' }}
        />
      </button>
    </header>
  );
}
