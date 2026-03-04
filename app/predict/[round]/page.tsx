'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import NavBar from '@/components/NavBar';
import DriverAvatar from '@/components/DriverAvatar';
import TeamLogo from '@/components/TeamLogo';
import { ROUNDS, DRIVERS, TEAMS, type Driver, isPredictionLocked, getLockDate } from '@/lib/f1-data';
import HowToPlay from '@/components/HowToPlay';

type Tab = 'qualifying' | 'race' | 'sprint';

function DriverPill({
  driver,
  selected,
  onClick,
}: {
  driver: Driver;
  selected: boolean;
  onClick: () => void;
}) {
  const team = TEAMS.find(t => t.id === driver.teamId);
  return (
    <button
      onClick={onClick}
      disabled={selected}
      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
        selected
          ? 'opacity-30 cursor-not-allowed'
          : 'hover:scale-105 hover:shadow-lg cursor-pointer'
      }`}
      style={{
        backgroundColor: selected ? 'rgba(75,85,99,0.3)' : `${team?.color}22`,
        borderLeft: `3px solid ${team?.color || '#666'}`,
        color: selected ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
      }}
    >
      <DriverAvatar src={driver.imageUrl} code={driver.code} teamColor={team?.color || '#666'} size={24} />
      <span className="font-bold">{driver.code}</span>
      <span className="text-[--color-text-secondary] text-xs hidden sm:inline">{driver.lastName}</span>
    </button>
  );
}

function PositionSlot({
  position,
  driver,
  onClear,
  highlight,
}: {
  position: number;
  driver: Driver | null;
  onClear: () => void;
  highlight?: boolean;
}) {
  const team = driver ? TEAMS.find(t => t.id === driver.teamId) : null;
  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
        driver
          ? 'border-[--color-border-bright] bg-[--color-bg-card]'
          : highlight
          ? 'border-[--color-accent-blue] bg-[--color-accent-blue]/5 animate-pulse-glow'
          : 'border-dashed border-[--color-border] bg-[--color-bg-input]'
      }`}
    >
      <span className="w-8 h-8 rounded-full bg-[--color-bg-secondary] flex items-center justify-center text-sm font-bold text-[--color-text-muted]">
        P{position}
      </span>
      {driver ? (
        <div className="flex-1 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DriverAvatar src={driver.imageUrl} code={driver.code} teamColor={team?.color || '#666'} size={32} />
            <span
              className="w-1 h-6 rounded-full"
              style={{ backgroundColor: team?.color }}
            />
            <span className="font-semibold">{driver.firstName} {driver.lastName}</span>
            <span className="text-xs text-[--color-text-muted]">{team?.shortName}</span>
          </div>
          <button
            onClick={onClear}
            className="text-[--color-text-muted] hover:text-[--color-error] transition-colors p-1"
            aria-label={`Remove ${driver.lastName}`}
          >
            &times;
          </button>
        </div>
      ) : (
        <span className="text-sm text-[--color-text-muted]">Select a driver</span>
      )}
    </div>
  );
}

export default function PredictPage() {
  const params = useParams();
  const router = useRouter();
  const roundId = parseInt(params.round as string);
  const round = ROUNDS.find(r => r.id === roundId);

  const locked = round ? isPredictionLocked(round) : false;
  const lockDate = round ? getLockDate(round) : '';

  // Sprint weekends start on Sprint tab; normal weekends start on Qualifying
  const [tab, setTab] = useState<Tab>(round?.isSprint ? 'sprint' : 'qualifying');
  const [qualPicks, setQualPicks] = useState<(number | null)[]>([null, null, null]);
  const [racePicks, setRacePicks] = useState<(number | null)[]>(Array(10).fill(null));
  const [sprintPicks, setSprintPicks] = useState<(number | null)[]>(Array(5).fill(null));
  const [numFinishers, setNumFinishers] = useState(20);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load existing predictions
  useEffect(() => {
    fetch(`/api/predictions/${roundId}`)
      .then(res => res.json())
      .then(data => {
        if (data.qualifying) setQualPicks(data.qualifying);
        if (data.race) {
          setRacePicks(data.race.positions);
          setNumFinishers(data.race.numFinishers);
        }
        if (data.sprint) setSprintPicks(data.sprint);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [roundId]);

  const getCurrentPicks = useCallback(() => {
    if (tab === 'qualifying') return qualPicks;
    if (tab === 'race') return racePicks;
    return sprintPicks;
  }, [tab, qualPicks, racePicks, sprintPicks]);

  const setCurrentPicks = useCallback((picks: (number | null)[]) => {
    if (tab === 'qualifying') setQualPicks(picks);
    else if (tab === 'race') setRacePicks(picks);
    else setSprintPicks(picks);
  }, [tab]);

  const handleDriverClick = (driverId: number) => {
    if (locked) return;
    const picks = getCurrentPicks();
    const nextEmpty = picks.indexOf(null);
    if (nextEmpty === -1) return;
    const newPicks = [...picks];
    newPicks[nextEmpty] = driverId;
    setCurrentPicks(newPicks);
  };

  const handleClearSlot = (index: number) => {
    if (locked) return;
    const picks = getCurrentPicks();
    const newPicks = [...picks];
    newPicks[index] = null;
    setCurrentPicks(newPicks);
  };

  const selectedDriverIds = new Set([
    ...getCurrentPicks().filter(Boolean),
  ] as number[]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);

    const payload: Record<string, unknown> = { roundId };

    // Only include the current tab's data in the save
    if (tab === 'qualifying' && qualPicks.every(p => p !== null)) {
      payload.qualifying = qualPicks;
    } else if (tab === 'race' && racePicks.every(p => p !== null)) {
      payload.race = { positions: racePicks, numFinishers };
    } else if (tab === 'sprint' && round?.isSprint && sprintPicks.every(p => p !== null)) {
      payload.sprint = sprintPicks;
    }

    try {
      const res = await fetch('/api/predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSaved(true);

        // Auto-advance through tabs, then home when done
        // Sprint weekend order: Sprint → Qualifying → Race → Home
        // Normal weekend order: Qualifying → Race → Home
        if (round?.isSprint) {
          if (tab === 'sprint') {
            setTimeout(() => { setSaved(false); setTab('qualifying'); }, 800);
          } else if (tab === 'qualifying') {
            setTimeout(() => { setSaved(false); setTab('race'); }, 800);
          } else if (tab === 'race') {
            setTimeout(() => { router.push('/'); }, 800);
          }
        } else {
          if (tab === 'qualifying') {
            setTimeout(() => { setSaved(false); setTab('race'); }, 800);
          } else if (tab === 'race') {
            setTimeout(() => { router.push('/'); }, 800);
          }
        }
      }
    } catch {
      // Error handling
    } finally {
      setSaving(false);
    }
  };

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

  // Sprint weekends: Sprint → Qualifying → Race
  // Normal weekends: Qualifying → Race
  const tabs: { key: Tab; label: string }[] = round.isSprint
    ? [
        { key: 'sprint', label: 'Sprint' },
        { key: 'qualifying', label: 'Qualifying' },
        { key: 'race', label: 'Race' },
      ]
    : [
        { key: 'qualifying', label: 'Qualifying' },
        { key: 'race', label: 'Race' },
      ];

  const positions = tab === 'qualifying' ? 3 : tab === 'race' ? 10 : 5;
  const picks = getCurrentPicks();

  return (
    <div className="min-h-screen bg-gradient-main">
      <NavBar />

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <button onClick={() => router.back()} className="text-sm text-[--color-text-muted] hover:text-[--color-text-secondary] mb-2">
            &larr; Back
          </button>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm text-[--color-accent-blue] font-semibold">R{round.id}</span>
              <h1 className="text-2xl font-bold">{round.flag} {round.name}</h1>
              {round.isSprint && (
                <span className="px-2 py-0.5 bg-[--color-accent-violet]/20 text-[--color-accent-violet] rounded text-xs font-medium">
                  Sprint Weekend
                </span>
              )}
            </div>
            <HowToPlay variant="predict" />
          </div>
          <p className="text-[--color-text-secondary] mt-1">{round.location}, {round.country}</p>
          {!locked && (
            <p className="text-xs text-[--color-text-muted] mt-2">
              🔓 Predictions lock on {new Date(lockDate).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' })}
              {round.isSprint ? ' (sprint qualifying day)' : ' (qualifying day)'}
            </p>
          )}
        </div>

        {/* Locked banner */}
        {locked && (
          <div className="mb-6 p-4 bg-[--color-error]/10 border border-[--color-error]/30 rounded-xl flex items-center gap-3">
            <span className="text-2xl">🔒</span>
            <div>
              <p className="font-semibold text-[--color-error]">Predictions Locked</p>
              <p className="text-sm text-[--color-text-secondary]">
                {round.isSprint
                  ? 'Sprint qualifying has started — predictions are now locked for this round.'
                  : 'Qualifying has started — predictions are now locked for this round.'}
              </p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-[--color-border] mb-6">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-6 py-3 text-sm font-semibold transition-colors relative ${
                tab === t.key
                  ? 'text-[--color-accent-blue]'
                  : 'text-[--color-text-muted] hover:text-[--color-text-secondary]'
              }`}
            >
              {t.label}
              {tab === t.key && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[--color-accent-blue]" />
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12 text-[--color-text-muted]">Loading predictions...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Position Slots */}
            <div>
              <h3 className="text-sm font-semibold text-[--color-text-secondary] mb-3 uppercase tracking-wider">
                {tab === 'qualifying' ? 'Top 3 Qualifying' : tab === 'race' ? 'Top 10 Race Finish' : 'Top 5 Sprint'}
              </h3>
              <div className="space-y-2">
                {Array.from({ length: positions }, (_, i) => (
                  <PositionSlot
                    key={i}
                    position={i + 1}
                    driver={picks[i] ? DRIVERS.find(d => d.id === picks[i]) || null : null}
                    onClear={() => handleClearSlot(i)}
                    highlight={picks[i] === null && picks.indexOf(null) === i}
                  />
                ))}
              </div>

              {/* Number of finishers (race tab only) */}
              {tab === 'race' && (
                <div className="mt-6 p-4 bg-gradient-card rounded-lg">
                  <label className="block text-sm font-semibold text-[--color-text-secondary] mb-2">
                    Number of Finishers
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min={0}
                      max={22}
                      value={numFinishers}
                      onChange={e => setNumFinishers(parseInt(e.target.value))}
                      disabled={locked}
                      className="flex-1 accent-[--color-accent-blue] disabled:opacity-50"
                    />
                    <span className="text-2xl font-bold text-[--color-accent-blue] w-10 text-center">{numFinishers}</span>
                  </div>
                  <p className="text-xs text-[--color-text-muted] mt-1">Predict how many drivers will finish the race (5 pts for exact)</p>
                </div>
              )}

              {/* Save button */}
              <div className="mt-6 flex gap-3">
                {locked ? (
                  <div className="flex-1 py-3 bg-[--color-bg-secondary] rounded-lg font-semibold uppercase tracking-wider text-center text-[--color-text-muted] opacity-60">
                    🔒 Locked
                  </div>
                ) : (
                  <button
                    onClick={handleSave}
                    disabled={saving || getCurrentPicks().some(p => p === null)}
                    className="flex-1 py-3 bg-gradient-accent rounded-lg font-semibold uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {saving
                      ? 'Saving...'
                      : saved
                      ? (() => {
                          if (round?.isSprint) {
                            if (tab === 'sprint') return '✓ Saved — Opening Qualifying...';
                            if (tab === 'qualifying') return '✓ Saved — Opening Race...';
                            return '✓ Saved — Going Home...';
                          }
                          if (tab === 'qualifying') return '✓ Saved — Opening Race...';
                          return '✓ Saved — Going Home...';
                        })()
                      : (() => {
                          if (round?.isSprint) {
                            if (tab === 'sprint') return 'Save & Continue to Qualifying →';
                            if (tab === 'qualifying') return 'Save & Continue to Race →';
                            return 'Save & Finish';
                          }
                          if (tab === 'qualifying') return 'Save & Continue to Race →';
                          return 'Save & Finish';
                        })()}
                  </button>
                )}
              </div>
              {saved && !locked && (
                <p className="text-sm text-[--color-success] mt-2 text-center">
                  {(() => {
                    if (round?.isSprint) {
                      if (tab === 'sprint') return 'Sprint saved! Moving to qualifying...';
                      if (tab === 'qualifying') return 'Qualifying saved! Moving to race...';
                      return 'All predictions saved!';
                    }
                    if (tab === 'qualifying') return 'Qualifying saved! Moving to race predictions...';
                    return 'All predictions saved!';
                  })()}
                </p>
              )}
            </div>

            {/* Driver Pool */}
            <div>
              <h3 className="text-sm font-semibold text-[--color-text-secondary] mb-3 uppercase tracking-wider">
                Driver Pool
              </h3>
              <div className="space-y-4">
                {TEAMS.map(team => {
                  const teamDrivers = DRIVERS.filter(d => d.teamId === team.id);
                  return (
                    <div key={team.id}>
                      <p className="text-xs text-[--color-text-muted] mb-1.5 flex items-center gap-2">
                        <TeamLogo src={team.logoUrl} name={team.name} color={team.color} size={20} />
                        {team.name}
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        {teamDrivers.map(driver => (
                          <DriverPill
                            key={driver.id}
                            driver={driver}
                            selected={selectedDriverIds.has(driver.id)}
                            onClick={() => handleDriverClick(driver.id)}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
