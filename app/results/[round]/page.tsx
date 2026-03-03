'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import NavBar from '@/components/NavBar';
import DriverAvatar from '@/components/DriverAvatar';
import { ROUNDS, DRIVERS, TEAMS } from '@/lib/f1-data';
import type { PositionScore, QualifyingScore, SprintScore } from '@/lib/scoring';

interface RaceScoreData {
  positions: PositionScore[];
  subtotal: number;
  bonus: number;
  finisherPoints: number;
  total: number;
}

interface FinisherData {
  predicted: number;
  actual: number;
  points: number;
}

interface ScoreData {
  roundId: number;
  qualifying: QualifyingScore | null;
  race: RaceScoreData | null;
  sprint: SprintScore | null;
  finisher: FinisherData | null;
  total: number;
}

function PositionResult({ score }: { score: PositionScore }) {
  const predictedDriver = DRIVERS.find(d => d.id === score.predictedDriverId);
  const actualDriver = DRIVERS.find(d => d.id === score.actualDriverId);
  const predictedTeam = predictedDriver ? TEAMS.find(t => t.id === predictedDriver.teamId) : null;
  const actualTeam = actualDriver ? TEAMS.find(t => t.id === actualDriver.teamId) : null;

  const statusColors = {
    exact: { bg: 'bg-[--color-success]/15', border: 'border-[--color-success]/40', text: 'text-[--color-success]', badge: 'bg-[--color-success]' },
    partial: { bg: 'bg-[--color-warning]/15', border: 'border-[--color-warning]/40', text: 'text-[--color-warning]', badge: 'bg-[--color-warning]' },
    miss: { bg: 'bg-[--color-bg-secondary]', border: 'border-[--color-border]', text: 'text-[--color-text-muted]', badge: 'bg-[--color-text-muted]' },
  };

  const colors = statusColors[score.status];

  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg border ${colors.bg} ${colors.border}`}>
      {/* Position */}
      <span className="w-8 h-8 rounded-full bg-[--color-bg-secondary] flex items-center justify-center text-sm font-bold text-[--color-text-muted]">
        P{score.position}
      </span>

      {/* Your pick */}
      <div className="flex-1">
        <div className="flex items-center gap-2">
          {predictedDriver && (
            <DriverAvatar src={predictedDriver.imageUrl} code={predictedDriver.code} teamColor={predictedTeam?.color || '#666'} size={28} />
          )}
          <span
            className="w-1 h-6 rounded-full"
            style={{ backgroundColor: predictedTeam?.color }}
          />
          <span className="font-semibold text-sm">{predictedDriver?.code}</span>
          <span className="text-xs text-[--color-text-muted]">{predictedDriver?.lastName}</span>
        </div>
      </div>

      {/* Arrow showing actual */}
      {score.status !== 'exact' && (
        <>
          <span className="text-xs text-[--color-text-muted]">&rarr;</span>
          <div className="flex items-center gap-2">
            {actualDriver && (
              <DriverAvatar src={actualDriver.imageUrl} code={actualDriver.code} teamColor={actualTeam?.color || '#666'} size={28} />
            )}
            <span
              className="w-1 h-6 rounded-full"
              style={{ backgroundColor: actualTeam?.color }}
            />
            <span className="font-semibold text-sm">{actualDriver?.code}</span>
          </div>
        </>
      )}

      {/* Points badge */}
      <span className={`px-2 py-0.5 rounded-full text-xs font-bold text-white ${colors.badge}`}>
        +{score.points}
      </span>
    </div>
  );
}

function ScoreSection({
  title,
  positions,
  subtotal,
  bonus,
  bonusLabel,
}: {
  title: string;
  positions: PositionScore[];
  subtotal: number;
  bonus: number;
  bonusLabel: string;
}) {
  return (
    <div className="bg-gradient-card rounded-xl p-6 mb-6">
      <h3 className="text-lg font-bold mb-4">{title}</h3>
      <div className="space-y-2 mb-4">
        {positions.map((p, i) => (
          <PositionResult key={i} score={p} />
        ))}
      </div>
      <div className="flex justify-between items-center pt-3 border-t border-[--color-border]">
        <div className="text-sm text-[--color-text-secondary]">
          <span>Subtotal: <strong>{subtotal}</strong></span>
          {bonus > 0 && (
            <span className="ml-3 text-[--color-success]">{bonusLabel}: <strong>+{bonus}</strong></span>
          )}
        </div>
        <span className="text-lg font-bold text-[--color-accent-blue]">{subtotal + bonus} pts</span>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  const params = useParams();
  const roundId = parseInt(params.round as string);
  const round = ROUNDS.find(r => r.id === roundId);

  const [data, setData] = useState<ScoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/scores/${roundId}`)
      .then(res => {
        if (!res.ok) throw new Error('No results available');
        return res.json();
      })
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [roundId]);

  if (!round) {
    return (
      <div className="min-h-screen bg-gradient-main flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Round Not Found</h1>
          <Link href="/" className="text-[--color-accent-blue] hover:underline">Back to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-main">
      <NavBar />

      <main className="max-w-3xl mx-auto px-4 py-8">
        <Link href="/" className="text-sm text-[--color-text-muted] hover:text-[--color-text-secondary] mb-2 inline-block">
          &larr; Back to Home
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <span className="text-sm text-[--color-accent-blue] font-semibold">R{round.id}</span>
          <h1 className="text-2xl font-bold">{round.flag} {round.name}</h1>
        </div>

        {loading ? (
          <div className="text-center py-12 text-[--color-text-muted]">Loading results...</div>
        ) : error ? (
          <div className="bg-gradient-card rounded-xl p-8 text-center">
            <p className="text-[--color-text-secondary] mb-4">Results not yet available for this round.</p>
            <Link href={`/predict/${roundId}`} className="text-[--color-accent-blue] hover:underline text-sm">
              Make your predictions &rarr;
            </Link>
          </div>
        ) : data ? (
          <>
            {/* Total Score */}
            <div className="bg-gradient-card rounded-xl p-6 mb-6 text-center glow-blue">
              <p className="text-sm text-[--color-text-secondary] uppercase tracking-wider mb-1">Your Round Score</p>
              <p className="text-5xl font-bold text-gradient">{data.total}</p>
              <p className="text-sm text-[--color-text-muted] mt-1">points</p>
            </div>

            {/* Qualifying Breakdown */}
            {data.qualifying && (
              <ScoreSection
                title="Qualifying (Top 3)"
                positions={data.qualifying.positions}
                subtotal={data.qualifying.subtotal}
                bonus={data.qualifying.bonus}
                bonusLabel="Perfect Bonus"
              />
            )}

            {/* Race Breakdown */}
            {data.race && (
              <>
                <ScoreSection
                  title="Race (Top 10)"
                  positions={data.race.positions}
                  subtotal={data.race.subtotal}
                  bonus={data.race.bonus}
                  bonusLabel="Perfect Bonus"
                />

                {/* Finisher prediction */}
                {data.finisher && (
                  <div className="bg-gradient-card rounded-xl p-6 mb-6">
                    <h3 className="text-lg font-bold mb-3">Number of Finishers</h3>
                    <div className={`flex items-center justify-between p-3 rounded-lg border ${
                      data.finisher.points > 0
                        ? 'bg-[--color-success]/15 border-[--color-success]/40'
                        : 'bg-[--color-bg-secondary] border-[--color-border]'
                    }`}>
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-xs text-[--color-text-muted]">Your Pick</p>
                          <p className="text-xl font-bold">{data.finisher.predicted}</p>
                        </div>
                        <span className="text-[--color-text-muted]">&rarr;</span>
                        <div>
                          <p className="text-xs text-[--color-text-muted]">Actual</p>
                          <p className="text-xl font-bold">{data.finisher.actual}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-bold text-white ${
                        data.finisher.points > 0 ? 'bg-[--color-success]' : 'bg-[--color-text-muted]'
                      }`}>
                        +{data.finisher.points}
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Sprint Breakdown */}
            {data.sprint && (
              <ScoreSection
                title="Sprint (Top 5)"
                positions={data.sprint.positions}
                subtotal={data.sprint.subtotal}
                bonus={data.sprint.bonus}
                bonusLabel="Perfect Bonus"
              />
            )}

            {/* No predictions warning */}
            {!data.qualifying && !data.race && !data.sprint && (
              <div className="bg-gradient-card rounded-xl p-8 text-center">
                <p className="text-[--color-text-secondary]">You didn&apos;t make predictions for this round.</p>
              </div>
            )}
          </>
        ) : null}
      </main>
    </div>
  );
}
