'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import NavBar from '@/components/NavBar';

interface League {
  id: number;
  name: string;
  join_code: string;
  created_by: number;
  created_at: string;
  member_count: number;
  creator_username: string;
}

export default function LeaguesPage() {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  const fetchLeagues = () => {
    fetch('/api/leagues')
      .then(res => res.json())
      .then(data => {
        setLeagues(data.leagues || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchLeagues();
    // Get current user ID from session
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(data => {
        if (data?.user?.id) setCurrentUserId(parseInt(data.user.id));
      })
      .catch(() => {});
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setCreating(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/leagues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim() }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess(`League created! Share code: ${data.league.join_code}`);
        setNewName('');
        fetchLeagues();
      } else {
        setError(data.error || 'Failed to create league');
      }
    } catch {
      setError('Failed to create league');
    } finally {
      setCreating(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;

    setJoining(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/leagues/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: joinCode.trim() }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess(`Joined "${data.league.name}" successfully!`);
        setJoinCode('');
        fetchLeagues();
      } else {
        setError(data.error || 'Failed to join league');
      }
    } catch {
      setError('Failed to join league');
    } finally {
      setJoining(false);
    }
  };

  const handleCopy = (code: string, leagueId: number) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedId(leagueId);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const handleShare = async (league: League) => {
    const shareText = `Join my F1 Predictor league "${league.name}"!\n\nUse code: ${league.join_code}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: `Join ${league.name}`, text: shareText });
      } catch {
        // User cancelled or share failed
      }
    } else {
      navigator.clipboard.writeText(shareText).then(() => {
        setCopiedId(league.id);
        setTimeout(() => setCopiedId(null), 2000);
      });
    }
  };

  const handleDelete = async (leagueId: number) => {
    if (!confirm('Are you sure you want to delete this league? All members will be removed.')) return;

    setDeletingId(leagueId);
    try {
      const res = await fetch(`/api/leagues/${leagueId}`, { method: 'DELETE' });
      if (res.ok) {
        setSuccess('League deleted');
        fetchLeagues();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to delete league');
      }
    } catch {
      setError('Failed to delete league');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-main">
      <NavBar />

      <main className="max-w-3xl mx-auto px-4 py-8">
        <Link href="/" className="text-sm text-[--color-text-muted] hover:text-[--color-text-secondary] mb-2 inline-block">
          &larr; Back to Home
        </Link>
        <h1 className="text-2xl font-bold mb-6">Leagues</h1>

        {/* Messages */}
        {error && (
          <div className="mb-4 p-3 bg-[--color-error]/10 border border-[--color-error]/30 rounded-lg text-sm text-[--color-error]">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-[--color-success]/10 border border-[--color-success]/30 rounded-lg text-sm text-[--color-success]">
            {success}
          </div>
        )}

        {/* Create & Join */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {/* Create League */}
          <form onSubmit={handleCreate} className="bg-gradient-card rounded-xl p-6">
            <h2 className="text-sm font-semibold text-[--color-text-secondary] uppercase tracking-wider mb-3">
              Create a League
            </h2>
            <div className="flex gap-2">
              <input
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="League name"
                maxLength={50}
                className="flex-1 px-3 py-2 bg-[--color-bg-input] border border-[--color-border] rounded-lg text-sm focus:outline-none focus:border-[--color-accent-blue]"
              />
              <button
                type="submit"
                disabled={creating || !newName.trim()}
                className="px-4 py-2 bg-gradient-accent rounded-lg text-sm font-semibold uppercase hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {creating ? '...' : 'Create'}
              </button>
            </div>
          </form>

          {/* Join League */}
          <form onSubmit={handleJoin} className="bg-gradient-card rounded-xl p-6">
            <h2 className="text-sm font-semibold text-[--color-text-secondary] uppercase tracking-wider mb-3">
              Join a League
            </h2>
            <div className="flex gap-2">
              <input
                type="text"
                value={joinCode}
                onChange={e => setJoinCode(e.target.value.toUpperCase())}
                placeholder="Enter code"
                maxLength={6}
                className="flex-1 px-3 py-2 bg-[--color-bg-input] border border-[--color-border] rounded-lg text-sm font-mono tracking-widest uppercase focus:outline-none focus:border-[--color-accent-blue]"
              />
              <button
                type="submit"
                disabled={joining || !joinCode.trim()}
                className="px-4 py-2 bg-[--color-accent-violet] rounded-lg text-sm font-semibold uppercase hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {joining ? '...' : 'Join'}
              </button>
            </div>
          </form>
        </div>

        {/* My Leagues */}
        <h2 className="text-lg font-semibold mb-4">My Leagues</h2>

        {loading ? (
          <div className="text-center py-12 text-[--color-text-muted]">Loading leagues...</div>
        ) : leagues.length === 0 ? (
          <div className="bg-gradient-card rounded-xl p-8 text-center">
            <p className="text-[--color-text-secondary] mb-2">No leagues yet</p>
            <p className="text-sm text-[--color-text-muted]">
              Create a league and share the code with friends, or join one with a code.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {leagues.map(league => {
              const isCreator = currentUserId === league.created_by;

              return (
                <div
                  key={league.id}
                  className="bg-gradient-card rounded-xl p-5 border border-[--color-border] hover:border-[--color-border-bright] transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Link
                          href={`/leagues/${league.id}`}
                          className="text-lg font-semibold hover:text-[--color-accent-blue] transition-colors truncate"
                        >
                          {league.name}
                        </Link>
                        {isCreator && (
                          <span className="flex-shrink-0 px-1.5 py-0.5 text-[10px] font-semibold uppercase bg-[--color-accent-blue]/15 text-[--color-accent-blue] rounded">
                            Creator
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-[--color-text-muted]">
                        <span>{league.member_count} member{league.member_count !== 1 ? 's' : ''}</span>
                        <span>·</span>
                        <span>by {league.creator_username}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* Join Code */}
                      <button
                        onClick={() => handleCopy(league.join_code, league.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[--color-bg-secondary] rounded-lg text-sm font-mono tracking-widest hover:bg-[--color-bg-card-hover] transition-colors"
                        title="Copy join code"
                      >
                        <span>{league.join_code}</span>
                        <span className="text-xs">
                          {copiedId === league.id ? '✓' : '📋'}
                        </span>
                      </button>

                      {/* Share */}
                      <button
                        onClick={() => handleShare(league)}
                        className="px-3 py-1.5 bg-[--color-accent-violet]/10 text-[--color-accent-violet] rounded-lg text-sm font-semibold hover:bg-[--color-accent-violet]/20 transition-colors"
                        title="Share league invite"
                      >
                        Share
                      </button>

                      {/* View */}
                      <Link
                        href={`/leagues/${league.id}`}
                        className="px-3 py-1.5 bg-[--color-accent-blue]/10 text-[--color-accent-blue] rounded-lg text-sm font-semibold hover:bg-[--color-accent-blue]/20 transition-colors"
                      >
                        View
                      </Link>

                      {/* Delete (creator only) */}
                      {isCreator && (
                        <button
                          onClick={() => handleDelete(league.id)}
                          disabled={deletingId === league.id}
                          className="px-2 py-1.5 text-[--color-text-muted] hover:text-[--color-error] transition-colors text-sm disabled:opacity-50"
                          title="Delete league"
                        >
                          🗑
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
