'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import NavBar from '@/components/NavBar';
import { ROUNDS, DRIVERS, TEAMS } from '@/lib/f1-data';

interface League {
  id: number;
  name: string;
  join_code: string;
  created_by: number;
  member_count: number;
}

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

interface MemberPrediction {
  user_id: number;
  username: string;
  qualifying: number[] | null;
  race: { positions: number[]; numFinishers: number } | null;
  sprint: number[] | null;
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <span className="text-2xl">🥇</span>;
  if (rank === 2) return <span className="text-2xl">🥈</span>;
  if (rank === 3) return <span className="text-2xl">🥉</span>;
  return (
    <span className="w-8 h-8 rounded-full bg-[--color-bg-secondary] flex items-center justify-center text-sm font-bold text-[--color-text-muted]">
      {rank}
    </span>
  );
}

function getDriverInfo(driverId: number) {
  const d = DRIVERS.find(dr => dr.id === driverId);
  if (!d) return null;
  const t = TEAMS.find(tm => tm.id === d.teamId);
  return { code: d.code, color: t?.color || '#666', imageUrl: d.imageUrl };
}

function DriverChip({ driverId, position }: { driverId: number; position: number }) {
  const info = getDriverInfo(driverId);
  if (!info) return null;
  return (
    <div
      className="flex items-center gap-1.5 px-2 py-1 rounded text-xs"
      style={{ backgroundColor: `${info.color}15`, borderLeft: `2px solid ${info.color}` }}
    >
      <img src={info.imageUrl} alt={info.code} className="w-5 h-5 rounded-full object-cover bg-[--color-bg-secondary]" />
      <span className="text-[--color-text-muted]">P{position}</span>
      <span className="font-semibold">{info.code}</span>
    </div>
  );
}

// Get rounds where qualifying has already started (predictions locked)
function getLockedRounds() {
  const today = new Date().toISOString().slice(0, 10);
  return ROUNDS.filter(r => r.qualifyingDate <= today);
}

type PageTab = 'standings' | 'predictions';

export default function LeagueDetailPage() {
  const params = useParams();
  const router = useRouter();
  const leagueId = params.id as string;

  const [league, setLeague] = useState<League | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedUser, setExpandedUser] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [leaving, setLeaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Predictions tab state
  const [pageTab, setPageTab] = useState<PageTab>('standings');
  const [selectedRound, setSelectedRound] = useState<number | null>(null);
  const [memberPredictions, setMemberPredictions] = useState<MemberPrediction[]>([]);
  const [predictionsLoading, setPredictionsLoading] = useState(false);

  const lockedRounds = getLockedRounds();

  useEffect(() => {
    fetch(`/api/leagues/${leagueId}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load league');
        return res.json();
      })
      .then(data => {
        setLeague(data.league);
        setLeaderboard(data.leaderboard || []);
        setLoading(false);
      })
      .catch(() => {
        setError('League not found or you are not a member.');
        setLoading(false);
      });

    fetch('/api/auth/session')
      .then(res => res.json())
      .then(data => {
        if (data?.user?.id) setCurrentUserId(parseInt(data.user.id));
      })
      .catch(() => {});
  }, [leagueId]);

  // Load predictions when round is selected
  useEffect(() => {
    if (!selectedRound || pageTab !== 'predictions') return;
    setPredictionsLoading(true);
    fetch(`/api/leagues/${leagueId}/predictions?round=${selectedRound}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed');
        return res.json();
      })
      .then(data => {
        setMemberPredictions(data.predictions || []);
        setPredictionsLoading(false);
      })
      .catch(() => {
        setMemberPredictions([]);
        setPredictionsLoading(false);
      });
  }, [leagueId, selectedRound, pageTab]);

  // Auto-select most recent locked round when switching to predictions tab
  useEffect(() => {
    if (pageTab === 'predictions' && !selectedRound && lockedRounds.length > 0) {
      setSelectedRound(lockedRounds[lockedRounds.length - 1].id);
    }
  }, [pageTab, selectedRound, lockedRounds]);

  const handleCopyCode = () => {
    if (!league) return;
    navigator.clipboard.writeText(league.join_code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleShare = async () => {
    if (!league) return;
    const shareText = `Join my F1 Predictor league "${league.name}"!\n\nUse code: ${league.join_code}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: `Join ${league.name}`, text: shareText });
      } catch {
        // User cancelled
      }
    } else {
      navigator.clipboard.writeText(shareText).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const handleLeave = async () => {
    if (!confirm('Are you sure you want to leave this league?')) return;
    setLeaving(true);
    try {
      const res = await fetch(`/api/leagues/${leagueId}/leave`, { method: 'POST' });
      if (res.ok) {
        router.push('/leagues');
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to leave league');
      }
    } catch {
      setError('Failed to leave league');
    } finally {
      setLeaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this league? All members will be removed.')) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/leagues/${leagueId}`, { method: 'DELETE' });
      if (res.ok) {
        router.push('/leagues');
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to delete league');
      }
    } catch {
      setError('Failed to delete league');
    } finally {
      setDeleting(false);
    }
  };

  const isCreator = league && currentUserId === league.created_by;
  const selectedRoundData = selectedRound ? ROUNDS.find(r => r.id === selectedRound) : null;

  return (
    <div className="min-h-screen bg-gradient-main">
      <NavBar />

      <main className="max-w-3xl mx-auto px-4 py-8">
        <Link href="/leagues" className="text-sm text-[--color-text-muted] hover:text-[--color-text-secondary] mb-2 inline-block">
          &larr; Back to Leagues
        </Link>

        {loading ? (
          <div className="text-center py-12 text-[--color-text-muted]">Loading league...</div>
        ) : error ? (
          <div className="bg-gradient-card rounded-xl p-8 text-center">
            <p className="text-[--color-error] mb-4">{error}</p>
            <Link href="/leagues" className="text-[--color-accent-blue] hover:underline">
              Back to Leagues
            </Link>
          </div>
        ) : league ? (
          <>
            {/* League Header */}
            <div className="bg-gradient-card rounded-xl p-6 mb-6 glow-blue">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold mb-1">{league.name}</h1>
                  <p className="text-sm text-[--color-text-muted]">
                    {league.member_count} member{league.member_count !== 1 ? 's' : ''}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xs text-[--color-text-muted] uppercase tracking-wider mb-1">Join Code</p>
                  <button
                    onClick={handleCopyCode}
                    className="flex items-center gap-2 px-4 py-2 bg-[--color-bg-secondary] rounded-lg font-mono text-lg tracking-widest hover:bg-[--color-bg-card-hover] transition-colors"
                    title="Copy join code"
                  >
                    {league.join_code}
                    <span className="text-sm">{copied ? '✓' : '📋'}</span>
                  </button>
                </div>
              </div>

              {/* Share invite */}
              <button
                onClick={handleShare}
                className="mt-4 w-full p-3 bg-[--color-accent-violet]/10 rounded-lg border border-[--color-accent-violet]/20 hover:bg-[--color-accent-violet]/20 transition-colors flex items-center justify-center gap-2"
              >
                <span>📤</span>
                <span className="text-sm font-semibold text-[--color-accent-violet]">Share Invite</span>
              </button>
            </div>

            {/* Page Tabs: Standings / Predictions */}
            <div className="flex border-b border-[--color-border] mb-6">
              <button
                onClick={() => setPageTab('standings')}
                className={`px-6 py-3 text-sm font-semibold transition-colors relative ${
                  pageTab === 'standings' ? 'text-[--color-accent-blue]' : 'text-[--color-text-muted] hover:text-[--color-text-secondary]'
                }`}
              >
                Standings
                {pageTab === 'standings' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[--color-accent-blue]" />}
              </button>
              <button
                onClick={() => setPageTab('predictions')}
                className={`px-6 py-3 text-sm font-semibold transition-colors relative ${
                  pageTab === 'predictions' ? 'text-[--color-accent-blue]' : 'text-[--color-text-muted] hover:text-[--color-text-secondary]'
                }`}
              >
                Predictions
                {pageTab === 'predictions' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[--color-accent-blue]" />}
              </button>
            </div>

            {/* Standings Tab */}
            {pageTab === 'standings' && (
              <>
                {leaderboard.length === 0 ? (
                  <div className="bg-gradient-card rounded-xl p-8 text-center">
                    <p className="text-[--color-text-secondary] mb-2">No scores yet</p>
                    <p className="text-sm text-[--color-text-muted]">
                      Scores will appear here once results are entered for the first round.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 mb-8">
                    {leaderboard.map((entry, i) => {
                      const rank = i + 1;
                      const isExpanded = expandedUser === entry.user_id;
                      const isMe = entry.user_id === currentUserId;

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
                                {isMe && (
                                  <span className="ml-2 text-xs text-[--color-accent-blue] font-normal">(you)</span>
                                )}
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
              </>
            )}

            {/* Predictions Tab */}
            {pageTab === 'predictions' && (
              <>
                {lockedRounds.length === 0 ? (
                  <div className="bg-gradient-card rounded-xl p-8 text-center">
                    <p className="text-[--color-text-secondary] mb-2">No locked predictions yet</p>
                    <p className="text-sm text-[--color-text-muted]">
                      Predictions become visible once qualifying starts for each round.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Round selector */}
                    <div className="mb-6">
                      <label className="text-xs text-[--color-text-muted] uppercase tracking-wider font-semibold mb-2 block">
                        Select Round
                      </label>
                      <select
                        value={selectedRound ?? ''}
                        onChange={e => setSelectedRound(parseInt(e.target.value))}
                        className="w-full px-4 py-3 bg-[--color-bg-input] border border-[--color-border] rounded-lg text-[--color-text-primary]"
                      >
                        {lockedRounds.map(r => (
                          <option key={r.id} value={r.id}>
                            R{r.id} — {r.flag} {r.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {predictionsLoading ? (
                      <div className="text-center py-8 text-[--color-text-muted]">Loading predictions...</div>
                    ) : memberPredictions.length === 0 ? (
                      <div className="bg-gradient-card rounded-xl p-8 text-center">
                        <p className="text-sm text-[--color-text-muted]">No predictions submitted for this round.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {memberPredictions.map(member => {
                          const isMe = member.user_id === currentUserId;
                          return (
                            <div
                              key={member.user_id}
                              className={`bg-gradient-card rounded-xl p-5 border ${
                                isMe ? 'border-[--color-accent-blue]/40' : 'border-[--color-border]'
                              }`}
                            >
                              <p className="font-semibold mb-3">
                                {member.username}
                                {isMe && <span className="ml-2 text-xs text-[--color-accent-blue] font-normal">(you)</span>}
                              </p>

                              {/* Qualifying */}
                              {member.qualifying && (
                                <div className="mb-3">
                                  <p className="text-xs text-[--color-text-muted] uppercase tracking-wider font-semibold mb-1.5">Qualifying</p>
                                  <div className="flex gap-1.5 flex-wrap">
                                    {member.qualifying.map((dId, i) => (
                                      <DriverChip key={i} driverId={dId} position={i + 1} />
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Race */}
                              {member.race && (
                                <div className="mb-3">
                                  <p className="text-xs text-[--color-text-muted] uppercase tracking-wider font-semibold mb-1.5">Race</p>
                                  <div className="flex gap-1.5 flex-wrap">
                                    {member.race.positions.map((dId, i) => (
                                      <DriverChip key={i} driverId={dId} position={i + 1} />
                                    ))}
                                  </div>
                                  <p className="text-xs text-[--color-text-muted] mt-1">
                                    Finishers: <span className="font-semibold">{member.race.numFinishers}</span>
                                  </p>
                                </div>
                              )}

                              {/* Sprint */}
                              {selectedRoundData?.isSprint && member.sprint && (
                                <div>
                                  <p className="text-xs text-[--color-text-muted] uppercase tracking-wider font-semibold mb-1.5">Sprint</p>
                                  <div className="flex gap-1.5 flex-wrap">
                                    {member.sprint.map((dId, i) => (
                                      <DriverChip key={i} driverId={dId} position={i + 1} />
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* No predictions */}
                              {!member.qualifying && !member.race && !member.sprint && (
                                <p className="text-sm text-[--color-text-muted] italic">No predictions submitted</p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
              </>
            )}

            {/* Leave / Delete */}
            <div className="mt-8 pt-6 border-t border-[--color-border]">
              {isCreator ? (
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-4 py-2 text-sm text-[--color-error] border border-[--color-error]/30 rounded-lg hover:bg-[--color-error]/10 transition-colors disabled:opacity-50"
                >
                  {deleting ? 'Deleting...' : 'Delete League'}
                </button>
              ) : (
                <button
                  onClick={handleLeave}
                  disabled={leaving}
                  className="px-4 py-2 text-sm text-[--color-text-muted] border border-[--color-border] rounded-lg hover:text-[--color-error] hover:border-[--color-error]/30 transition-colors disabled:opacity-50"
                >
                  {leaving ? 'Leaving...' : 'Leave League'}
                </button>
              )}
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
}
