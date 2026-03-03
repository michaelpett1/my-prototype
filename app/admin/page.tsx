'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ROUNDS, DRIVERS, TEAMS, type Driver } from '@/lib/f1-data';

function DriverSelect({
  label,
  value,
  onChange,
  excludeIds,
}: {
  label: string;
  value: number | null;
  onChange: (id: number | null) => void;
  excludeIds: number[];
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-semibold text-[--color-text-muted] w-8">{label}</span>
      <select
        value={value ?? ''}
        onChange={e => onChange(e.target.value ? parseInt(e.target.value) : null)}
        className="flex-1 px-3 py-2 bg-[--color-bg-input] border border-[--color-border] rounded-lg text-[--color-text-primary] text-sm"
      >
        <option value="">Select driver...</option>
        {TEAMS.map(team => {
          const teamDrivers = DRIVERS.filter(d => d.teamId === team.id);
          return teamDrivers.map(driver => (
            <option
              key={driver.id}
              value={driver.id}
              disabled={excludeIds.includes(driver.id) && driver.id !== value}
            >
              {driver.code} - {driver.firstName} {driver.lastName} ({team.shortName})
            </option>
          ));
        })}
      </select>
    </div>
  );
}

export default function AdminPage() {
  const [pin, setPin] = useState('');
  const [verified, setVerified] = useState(false);
  const [pinError, setPinError] = useState('');
  const [selectedRound, setSelectedRound] = useState(ROUNDS[0].id);
  const [activeTab, setActiveTab] = useState<'qualifying' | 'race' | 'sprint'>('qualifying');

  // Qualifying results
  const [qualPicks, setQualPicks] = useState<(number | null)[]>([null, null, null]);

  // Race results
  const [racePicks, setRacePicks] = useState<(number | null)[]>(Array(10).fill(null));
  const [numFinishers, setNumFinishers] = useState(20);

  // Sprint results
  const [sprintPicks, setSprintPicks] = useState<(number | null)[]>(Array(5).fill(null));

  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const round = ROUNDS.find(r => r.id === selectedRound)!;

  // Load existing results when round changes
  useEffect(() => {
    if (!verified) return;
    setLoading(true);
    fetch(`/api/results/${selectedRound}`)
      .then(res => res.json())
      .then(data => {
        if (data.qualifying) {
          setQualPicks(data.qualifying);
        } else {
          setQualPicks([null, null, null]);
        }
        if (data.race) {
          setRacePicks(data.race.positions);
          setNumFinishers(data.race.numFinishers);
        } else {
          setRacePicks(Array(10).fill(null));
          setNumFinishers(20);
        }
        if (data.sprint) {
          setSprintPicks(data.sprint);
        } else {
          setSprintPicks(Array(5).fill(null));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [selectedRound, verified]);

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');

    const res = await fetch('/api/admin/verify-pin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin }),
    });

    if (res.ok) {
      setVerified(true);
    } else {
      setPinError('Invalid PIN');
    }
  };

  const handleSaveResults = async () => {
    setSaving(true);
    setSaveMessage('');

    const payload: Record<string, unknown> = {};

    if (qualPicks.every(p => p !== null)) {
      payload.qualifying = qualPicks;
    }

    if (racePicks.every(p => p !== null)) {
      payload.race = { positions: racePicks, numFinishers };
    }

    if (round.isSprint && sprintPicks.every(p => p !== null)) {
      payload.sprint = sprintPicks;
    }

    if (Object.keys(payload).length === 0) {
      setSaveMessage('No complete results to save');
      setSaving(false);
      return;
    }

    try {
      const res = await fetch(`/api/results/${selectedRound}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSaveMessage('Results saved and scores calculated!');
      } else {
        const data = await res.json();
        setSaveMessage(`Error: ${data.error}`);
      }
    } catch {
      setSaveMessage('Failed to save results');
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMessage(''), 5000);
    }
  };

  const getSelectedIds = (picks: (number | null)[]) =>
    picks.filter((p): p is number => p !== null);

  if (!verified) {
    return (
      <div className="min-h-screen bg-gradient-main flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gradient">Admin Panel</h1>
            <p className="text-sm text-[--color-text-secondary] mt-1">Enter PIN to access</p>
          </div>
          <div className="bg-gradient-card rounded-xl p-8 glow-violet">
            <form onSubmit={handlePinSubmit} className="space-y-4">
              {pinError && (
                <div className="p-3 bg-[--color-error]/10 border border-[--color-error]/30 rounded-lg text-[--color-error] text-sm">
                  {pinError}
                </div>
              )}
              <input
                type="password"
                value={pin}
                onChange={e => setPin(e.target.value)}
                placeholder="Enter admin PIN"
                className="w-full px-4 py-3 bg-[--color-bg-input] border border-[--color-border] rounded-lg text-[--color-text-primary] text-center text-2xl tracking-[0.5em] placeholder:text-sm placeholder:tracking-normal"
                maxLength={10}
                autoFocus
              />
              <button
                type="submit"
                className="w-full py-3 bg-gradient-accent rounded-lg font-semibold uppercase tracking-wider hover:opacity-90 transition-opacity"
              >
                Verify
              </button>
            </form>
            <div className="mt-4 text-center">
              <Link href="/" className="text-sm text-[--color-text-muted] hover:text-[--color-text-secondary]">
                &larr; Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const tabs: { key: typeof activeTab; label: string }[] = [
    { key: 'qualifying', label: 'Qualifying' },
    { key: 'race', label: 'Race' },
    ...(round.isSprint ? [{ key: 'sprint' as const, label: 'Sprint' }] : []),
  ];

  const currentPicks = activeTab === 'qualifying' ? qualPicks : activeTab === 'race' ? racePicks : sprintPicks;
  const setCurrentPicks = (picks: (number | null)[]) => {
    if (activeTab === 'qualifying') setQualPicks(picks);
    else if (activeTab === 'race') setRacePicks(picks);
    else setSprintPicks(picks);
  };
  const positions = activeTab === 'qualifying' ? 3 : activeTab === 'race' ? 10 : 5;

  return (
    <div className="min-h-screen bg-gradient-main">
      <nav className="border-b border-[--color-border] px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-gradient">F1 PREDICTOR</Link>
          <span className="px-3 py-1 bg-[--color-accent-violet]/20 text-[--color-accent-violet] rounded-full text-xs font-semibold uppercase">Admin</span>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/" className="text-sm text-[--color-text-muted] hover:text-[--color-text-secondary] mb-2 inline-block">
            &larr; Back to Home
          </Link>
          <h1 className="text-2xl font-bold mb-4">Enter Race Results</h1>

          {/* Round Selector */}
          <select
            value={selectedRound}
            onChange={e => setSelectedRound(parseInt(e.target.value))}
            className="w-full max-w-md px-4 py-3 bg-[--color-bg-input] border border-[--color-border] rounded-lg text-[--color-text-primary]"
          >
            {ROUNDS.map(r => (
              <option key={r.id} value={r.id}>
                {r.flag} R{r.id} - {r.name} ({r.raceDate}){r.isSprint ? ' [Sprint]' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[--color-border] mb-6">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`px-6 py-3 text-sm font-semibold transition-colors relative ${
                activeTab === t.key
                  ? 'text-[--color-accent-violet]'
                  : 'text-[--color-text-muted] hover:text-[--color-text-secondary]'
              }`}
            >
              {t.label}
              {activeTab === t.key && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[--color-accent-violet]" />
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12 text-[--color-text-muted]">Loading existing results...</div>
        ) : (
          <div className="max-w-2xl">
            <h3 className="text-sm font-semibold text-[--color-text-secondary] mb-3 uppercase tracking-wider">
              {activeTab === 'qualifying' ? 'Top 3 Qualifying Results' : activeTab === 'race' ? 'Top 10 Race Results' : 'Top 5 Sprint Results'}
            </h3>

            <div className="space-y-2">
              {Array.from({ length: positions }, (_, i) => (
                <DriverSelect
                  key={`${activeTab}-${i}`}
                  label={`P${i + 1}`}
                  value={currentPicks[i]}
                  onChange={val => {
                    const newPicks = [...currentPicks];
                    newPicks[i] = val;
                    setCurrentPicks(newPicks);
                  }}
                  excludeIds={getSelectedIds(currentPicks)}
                />
              ))}
            </div>

            {/* Number of finishers (race tab) */}
            {activeTab === 'race' && (
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
                    className="flex-1 accent-[--color-accent-violet]"
                  />
                  <span className="text-2xl font-bold text-[--color-accent-violet] w-10 text-center">{numFinishers}</span>
                </div>
              </div>
            )}

            {/* Save button */}
            <div className="mt-6">
              <button
                onClick={handleSaveResults}
                disabled={saving}
                className="w-full py-3 bg-[--color-accent-violet] text-white rounded-lg font-semibold uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {saving ? 'Saving & Calculating...' : 'Save Results & Calculate Scores'}
              </button>
              {saveMessage && (
                <p className={`text-sm mt-2 text-center ${saveMessage.startsWith('Error') ? 'text-[--color-error]' : 'text-[--color-success]'}`}>
                  {saveMessage}
                </p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
