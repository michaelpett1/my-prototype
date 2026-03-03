'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import NavBar from '@/components/NavBar';
import { ROUNDS } from '@/lib/f1-data';

interface ProfileData {
  user: {
    username: string;
    email: string;
    createdAt: string;
  };
  stats: {
    totalPoints: number;
    rank: number | string;
    totalUsers: number;
    roundsPlayed: number;
    predictionsCount: number;
  };
  roundScores: {
    round_id: number;
    qualifying_pts: number;
    qualifying_bonus: number;
    race_pts: number;
    race_bonus: number;
    sprint_pts: number;
    sprint_bonus: number;
    finisher_pts: number;
    total: number;
    round_name: string;
    race_date: string;
    is_sprint: number;
  }[];
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-gradient-card rounded-xl p-4 text-center">
      <p className="text-xs text-[--color-text-muted] uppercase tracking-wider mb-1">{label}</p>
      <p className="text-2xl font-bold text-gradient">{value}</p>
      {sub && <p className="text-xs text-[--color-text-muted] mt-0.5">{sub}</p>}
    </div>
  );
}

export default function ProfilePage() {
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/profile')
      .then(res => res.json())
      .then(d => {
        setData(d);
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

        {loading ? (
          <div className="text-center py-12 text-[--color-text-muted]">Loading profile...</div>
        ) : !data ? (
          <div className="text-center py-12 text-[--color-text-muted]">Failed to load profile</div>
        ) : (
          <>
            {/* Profile Header */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-14 h-14 rounded-full bg-gradient-accent flex items-center justify-center text-xl font-bold">
                  {data.user.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{data.user.username}</h1>
                  <p className="text-sm text-[--color-text-muted]">
                    Member since {new Date(data.user.createdAt).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
              <StatCard label="Total Points" value={data.stats.totalPoints} />
              <StatCard
                label="Rank"
                value={`#${data.stats.rank}`}
                sub={`of ${data.stats.totalUsers} player${data.stats.totalUsers !== 1 ? 's' : ''}`}
              />
              <StatCard label="Rounds Scored" value={data.stats.roundsPlayed} sub="of 24" />
              <StatCard label="Predictions" value={data.stats.predictionsCount} />
            </div>

            {/* Round-by-Round History */}
            <h2 className="text-lg font-bold mb-4">Round History</h2>
            {data.roundScores.length === 0 ? (
              <div className="bg-gradient-card rounded-xl p-6 text-center">
                <p className="text-[--color-text-secondary]">No scored rounds yet.</p>
                <p className="text-sm text-[--color-text-muted] mt-1">Your scores will appear here after results are entered.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {data.roundScores.map(score => (
                  <Link
                    key={score.round_id}
                    href={`/results/${score.round_id}`}
                    className="flex items-center gap-4 p-4 bg-[--color-bg-card] border border-[--color-border] rounded-xl hover:border-[--color-border-bright] transition-colors"
                  >
                    <span className="text-sm text-[--color-accent-blue] font-semibold w-8">R{score.round_id}</span>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{ROUNDS.find(r => r.id === score.round_id)?.flag} {score.round_name}</p>
                      <div className="flex gap-3 mt-1 text-xs text-[--color-text-muted]">
                        <span>Q: {score.qualifying_pts + score.qualifying_bonus}</span>
                        <span>R: {score.race_pts + score.race_bonus}</span>
                        {score.is_sprint ? <span>S: {score.sprint_pts + score.sprint_bonus}</span> : null}
                        <span>F: {score.finisher_pts}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-[--color-accent-blue]">{score.total}</p>
                      <p className="text-xs text-[--color-text-muted]">pts</p>
                    </div>
                    <span className="text-[--color-text-muted] text-sm">&rarr;</span>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
