'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { ROUNDS } from '@/lib/f1-data';
import F1Logo from '@/components/F1Logo';

function getNextRoundId() {
  const now = new Date().toISOString().split('T')[0];
  const next = ROUNDS.find(r => r.raceDate >= now);
  return next ? next.id : ROUNDS[ROUNDS.length - 1].id;
}

export default function NavBar() {
  const pathname = usePathname();
  const nextRoundId = getNextRoundId();

  const NAV_ITEMS = [
    { href: `/predict/${nextRoundId}`, label: 'Predict', match: '/predict' },
    { href: '/leaderboard', label: 'Leaderboard', match: '/leaderboard' },
    { href: '/leagues', label: 'Leagues', match: '/leagues' },
    { href: '/special', label: 'Season', match: '/special' },
    { href: '/profile', label: 'Profile', match: '/profile' },
  ];

  return (
    <nav className="border-b border-[--color-border] px-4 py-3">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <F1Logo width={46} />
          <span className="text-[13px] font-bold tracking-wider text-[--color-text-secondary] hidden sm:inline uppercase">Predictor</span>
        </Link>
        <div className="flex items-center gap-3">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.label}
              href={item.href}
              className={`text-[13px] py-1 rounded transition-colors ${
                pathname.startsWith(item.match)
                  ? 'text-[--color-accent-blue] font-semibold'
                  : 'text-[--color-text-secondary] hover:text-[--color-text-primary]'
              }`}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/admin"
            className={`text-[13px] py-1 rounded transition-colors ${
              pathname.startsWith('/admin')
                ? 'text-[--color-accent-blue] font-semibold'
                : 'text-[--color-text-secondary] hover:text-[--color-text-primary]'
            }`}
          >
            Admin
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="text-[13px] py-1 rounded text-[--color-text-secondary] hover:text-[--color-error] transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </nav>
  );
}
