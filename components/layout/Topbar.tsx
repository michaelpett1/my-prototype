'use client';
import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Bell, Search, Sun, Moon, ChevronRight, Settings, LogOut } from 'lucide-react';
import { useSettingsStore } from '@/lib/store/settingsStore';
import { useActivityStore } from '@/lib/store/activityStore';
import { useAuthStore } from '@/lib/store/authStore';
import { SearchPalette } from '@/components/ui/SearchPalette';
import { formatRelative } from '@/lib/utils/dateUtils';

const BREADCRUMBS: Record<string, string[]> = {
  '/dashboard': ['Dashboard'],
  '/timelines': ['Timelines'],
  '/roadmap': ['Visual Roadmap'],
  '/okrs': ['OKRs'],
  '/suggestions': ['Suggestions'],
  '/settings': ['Settings'],
};

export function Topbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, updateTheme, profile } = useSettingsStore();
  const { signOut } = useAuthStore();
  const crumbs = BREADCRUMBS[pathname] ?? [pathname.slice(1)];
  const isDark = theme === 'dark';

  async function handleSignOut() {
    await signOut();
    router.push('/sign-in');
  }

  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);

  const activities = useActivityStore((s) => s.events);
  const readCount = useActivityStore((s) => s.readCount);
  const markAllRead = useActivityStore((s) => s.markAllRead);
  const unreadCount = Math.max(0, activities.length - readCount);

  // ⌘K to open search
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) setAvatarOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <>
      <header
        className="topbar glass h-[48px] flex items-center gap-3 px-4 shrink-0"
        style={{
          backgroundColor: 'rgba(255,255,255,0.75)',
          borderBottom: '1px solid var(--border)',
          position: 'sticky',
          top: 0,
          zIndex: 20,
        }}
      >
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-[13px] flex-1 min-w-0">
          <Link
            href="/dashboard"
            className="shrink-0 hover:opacity-80 transition-opacity duration-150 flex items-center gap-1.5"
          >
            <img src="/assets/northstar-icon.svg" alt="Northstar" className="w-[18px] h-[18px] rounded-[3px]" />
            <span className="text-[#6B7280] font-medium">Northstar</span>
          </Link>
          {crumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1 shrink-0">
              <ChevronRight size={12} className="text-[#D1D5DB]" />
              <span className={
                i === crumbs.length - 1
                  ? 'font-semibold text-[#1C1917] breadcrumb-active'
                  : 'text-[#6B7280]'
              }>
                {crumb}
              </span>
            </span>
          ))}
        </nav>

        {/* Search */}
        <button
          onClick={() => setSearchOpen(true)}
          className="flex items-center gap-2 rounded-full transition-all duration-150 ease-out"
          style={{
            padding: '5px 14px',
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border)',
            color: 'var(--text-muted)',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(79,70,229,0.3)';
            (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 0 3px rgba(79,70,229,0.06)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)';
            (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
          }}
        >
          <Search size={13} />
          <span className="text-[12px]">Search</span>
          <kbd
            className="text-[11px] font-mono ml-1 rounded"
            style={{
              padding: '1px 5px',
              background: 'var(--border-row)',
              color: 'var(--text-muted)',
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
        <div ref={notifRef} style={{ position: 'relative' }}>
          <button
            onClick={() => { setNotifOpen(!notifOpen); setAvatarOpen(false); }}
            aria-label="Notifications"
            className="relative rounded-[5px] transition-all duration-150 ease-out text-[#9CA3AF] hover:text-[#6B7280]"
            style={{ padding: '6px' }}
          >
            <Bell size={15} />
            {unreadCount > 0 && (
              <span
                className="absolute top-[3px] right-[3px] flex items-center justify-center rounded-full text-[8px] font-bold"
                style={{
                  background: '#EF4444',
                  color: '#FFFFFF',
                  minWidth: 14,
                  height: 14,
                  padding: '0 3px',
                  boxShadow: '0 0 0 1.5px var(--bg-primary)',
                }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: 6,
                width: 320,
                background: 'var(--bg-primary)',
                borderRadius: 7,
                border: '1px solid var(--border)',
                boxShadow: '0 8px 24px var(--border-medium)',
                zIndex: 100,
                overflow: 'hidden',
              }}
            >
              <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border-row)', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>Notifications</span>
                {activities.length > 0 && (
                  <button
                    onClick={() => markAllRead()}
                    style={{
                      fontSize: 11,
                      fontWeight: 500,
                      color: 'var(--app-accent, #2563EB)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.7'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div style={{ maxHeight: 280, overflowY: 'auto' }}>
                {activities.length === 0 ? (
                  <div style={{ padding: '24px 14px', textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
                    No recent activity
                  </div>
                ) : (
                  (() => {
                    // Deduplicate consecutive progress spam for same item
                    const PROGRESS_ITEM = /^"(.+)" progress (?:updated|reached)/;
                    const seen = new Set<string>();
                    return activities.filter(e => {
                      const match = e.text.match(PROGRESS_ITEM);
                      if (match) {
                        const key = match[1];
                        if (seen.has(key)) return false;
                        seen.add(key);
                      }
                      return true;
                    }).slice(0, 12);
                  })().map((evt, idx) => {
                    const isRead = idx < readCount;
                    return (
                      <div
                        key={evt.id}
                        style={{
                          padding: '8px 14px',
                          borderBottom: '1px solid var(--bg-subtle)',
                          fontSize: 12,
                          color: isRead ? 'var(--text-muted)' : 'var(--text-secondary)',
                          background: isRead ? 'transparent' : 'var(--bg-tertiary)',
                        }}
                      >
                        <p style={{ margin: 0, fontWeight: isRead ? 400 : 500 }}>{evt.text}</p>
                        <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--text-muted)', fontFamily: 'ui-monospace, monospace' }}>
                          {formatRelative(evt.timestamp)}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Avatar */}
        <div ref={avatarRef} style={{ position: 'relative' }}>
          <button
            onClick={() => { setAvatarOpen(!avatarOpen); setNotifOpen(false); }}
            className="rounded-full transition-opacity duration-150 hover:opacity-80"
            aria-label="Your profile"
          >
            <img
              src={profile.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || 'User')}&size=40`}
              alt={profile.name || 'User'}
              className="w-[28px] h-[28px] rounded-full"
              style={{ boxShadow: '0 0 0 2px rgba(0,0,0,0.08)' }}
            />
          </button>

          {avatarOpen && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: 6,
                width: 200,
                background: 'var(--bg-primary)',
                borderRadius: 7,
                border: '1px solid var(--border)',
                boxShadow: '0 8px 24px var(--border-medium)',
                zIndex: 100,
                overflow: 'hidden',
              }}
            >
              {/* User info */}
              <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border-row)' }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{profile.name || 'User'}</p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '2px 0 0' }}>{profile.email || 'No email'}</p>
              </div>
              <div style={{ padding: '4px 0' }}>
                <button
                  onClick={() => { router.push('/settings'); setAvatarOpen(false); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    width: '100%',
                    padding: '8px 14px',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    fontSize: 13,
                    color: 'var(--text-secondary)',
                    textAlign: 'left',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-tertiary)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                >
                  <Settings size={14} style={{ color: 'var(--text-muted)' }} />
                  Settings
                </button>
              </div>
              <div style={{ borderTop: '1px solid var(--border-row)', padding: '4px 0' }}>
                <button
                  onClick={() => { setAvatarOpen(false); handleSignOut(); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    width: '100%',
                    padding: '8px 14px',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    fontSize: 13,
                    color: '#DC2626',
                    textAlign: 'left',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--danger-bg)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                >
                  <LogOut size={14} style={{ color: '#DC2626' }} />
                  Log out
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      <SearchPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
