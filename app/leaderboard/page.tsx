'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import NavBar from '@/components/NavBar';

interface LeaderboardEntry {
  user_id: number;
  username: string;
  qualifying_pts: number;
  qualifying_bonus: number;
  race_pts: number;
  race_bonus: number;
  sprint_pts: number;
  sprint_bonus: number;
  finisher_pts: number;
  total_points: number;
  rounds_played: number;
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <span className="text-2xl">🥇</span>;
  if (rank === 2) return <span className="text-2xl">🥈</span>;
  if (rank === 3) return <span className="text-2xl">🥉</span>;
  return <span className="w-8 h-8 rounded-full bg-[--color-bg-secondary] flex items-center justify-center text-sm font-bold text-[--color-text-muted]">{rank}</span>;
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedUser, setExpandedUser] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/scores')
      .then(res => res.json())
      .then(data => {
        setLeaderboard(data.leaderboard || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-main">
      <NavBar />

      <main className="max-w-3xl mx-auto px-4 py-8">
        <Link href="/" className="text-sm text-[--color-text-muted] hover:text-[--color-text-secondary] mb-2 inline-block">
          &larr; Back to Home
        </Link>
        <h1 className="text-2xl font-bold mb-6">Leaderboard</h1>

        {loading ? (
          <div className="text-center py-12 text-[--color-text-muted]">Loading leaderboard...</div>
        ) : leaderboard.length === 0 ? (
          <div className="bg-gradient-card rounded-xl p-8 text-center">
            <p className="text-[--color-text-secondary] mb-2">No scores yet</p>
            <p className="text-sm text-[--color-text-muted]">Scores will appear here once results are entered for the first round.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {leaderboard.map((entry, i) => {
              const rank = i + 1;
              const isExpanded = expandedUser === entry.user_id;

              return (
                <div key={entry.user_id}>
                  <button
                    onClick={() => setExpandedUser(isExpanded ? null : entry.user_id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all ${
                      rank <= 3
                        ? 'bg-gradient-card border border-[--color-border-bright] glow-blue'
                        : 'bg-[--color-bg-card] border border-[--color-border] hover:border-[--color-border-bright]'
                    }`}
                  >
                    <RankBadge rank={rank} />

                    <div className="flex-1 text-left">
                      <p className={`font-semibold ${rank <= 3 ? 'text-lg' : ''}`}>
                        {entry.username}
                      </p>
                      <p className="text-xs text-[--color-text-muted]">
                        {entry.rounds_played} round{entry.rounds_played !== 1 ? 's' : ''} played
                      </p>
                    </div>

                    <div className="text-right">
                      <p className={`font-bold ${rank <= 3 ? 'text-2xl text-gradient' : 'text-xl text-[--color-accent-blue]'}`}>
                        {entry.total_points}
                      </p>
                      <p className="text-xs text-[--color-text-muted]">points</p>
                    </div>

                    <span className={`text-[--color-text-muted] transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                      ▼
                    </span>
                  </button>

                  {/* Expanded breakdown */}
                  {isExpanded && (
                    <div className="mt-1 ml-12 mr-4 p-4 bg-[--color-bg-secondary] rounded-lg border border-[--color-border]">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                        <div>
                          <p className="text-[--color-text-muted] text-xs">Qualifying</p>
                          <p className="font-semibold">{entry.qualifying_pts + entry.qualifying_bonus}</p>
                        </div>
                        <div>
                          <p className="text-[--color-text-muted] text-xs">Race</p>
                          <p className="font-semibold">{entry.race_pts + entry.race_bonus}</p>
                        </div>
                        <div>
                          <p className="text-[--color-text-muted] text-xs">Sprint</p>
                          <p className="font-semibold">{entry.sprint_pts + entry.sprint_bonus}</p>
                        </div>
                        <div>
                          <p className="text-[--color-text-muted] text-xs">Finishers</p>
                          <p className="font-semibold">{entry.finisher_pts}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
