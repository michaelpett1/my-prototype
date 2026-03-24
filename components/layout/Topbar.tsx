'use client';
import { usePathname } from 'next/navigation';
import { Bell, Search, Sun, Moon } from 'lucide-react';
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
    <header className="h-12 flex items-center gap-3 px-4 border-b border-slate-200 bg-white shrink-0">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm flex-1">
        <span className="text-slate-400">Northstar</span>
        {crumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-1.5">
            <span className="text-slate-300">/</span>
            <span className={i === crumbs.length - 1 ? 'font-medium text-slate-800' : 'text-slate-500'}>
              {crumb}
            </span>
          </span>
        ))}
      </nav>

      {/* Search */}
      <button className="flex items-center gap-2 px-2.5 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-500 text-xs transition-colors">
        <Search size={13} />
        <span>Search</span>
        <kbd className="ml-1 text-slate-400 font-mono">⌘K</kbd>
      </button>

      {/* Theme toggle */}
      <button
        onClick={() => updateTheme(isDark ? 'light' : 'dark')}
        className="p-1.5 rounded hover:bg-slate-100 text-slate-500 transition-colors"
        aria-label="Toggle theme"
      >
        {isDark ? <Sun size={16} /> : <Moon size={16} />}
      </button>

      {/* Notification bell */}
      <button className="p-1.5 rounded hover:bg-slate-100 text-slate-500 relative transition-colors" aria-label="Notifications">
        <Bell size={16} />
        <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-blue-500 rounded-full" />
      </button>

      {/* Avatar */}
      <img
        src={profile.avatarUrl}
        alt={profile.name}
        className="w-7 h-7 rounded-full cursor-pointer"
      />
    </header>
  );
}
