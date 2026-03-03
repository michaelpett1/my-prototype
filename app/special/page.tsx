'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import NavBar from '@/components/NavBar';
import DriverAvatar from '@/components/DriverAvatar';
import TeamLogo from '@/components/TeamLogo';
import { TEAMS, DRIVERS } from '@/lib/f1-data';
import HowToPlay from '@/components/HowToPlay';

type Tab = 'teammates' | 'season';

function TeammateBattleCard({
  teamId,
  selectedDriverId,
  onSelect,
}: {
  teamId: number;
  selectedDriverId: number | null;
  onSelect: (driverId: number) => void;
}) {
  const team = TEAMS.find(t => t.id === teamId)!;
  const drivers = DRIVERS.filter(d => d.teamId === teamId);

  return (
    <div className="bg-gradient-card rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <TeamLogo src={team.logoUrl} name={team.name} color={team.color} size={22} />
        <span className="text-sm font-semibold text-[--color-text-secondary]">{team.name}</span>
      </div>
      <div className="flex gap-2">
        {drivers.map(driver => (
          <button
            key={driver.id}
            onClick={() => onSelect(driver.id)}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all flex flex-col items-center gap-2 ${
              selectedDriverId === driver.id
                ? 'border-2 scale-105'
                : 'border border-[--color-border] hover:border-[--color-border-bright]'
            }`}
            style={{
              borderColor: selectedDriverId === driver.id ? team.color : undefined,
              backgroundColor: selectedDriverId === driver.id ? `${team.color}22` : 'var(--color-bg-input)',
            }}
          >
            <DriverAvatar src={driver.imageUrl} code={driver.code} teamColor={team.color} size={40} />
            <span className="block text-lg">{driver.code}</span>
            <span className="block text-xs text-[--color-text-muted]">{driver.lastName}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function SpecialPredictionsPage() {
  const [tab, setTab] = useState<Tab>('teammates');

  // Teammate state
  const [teammatePicks, setTeammatePicks] = useState<Record<number, number>>({});
  const [teammateLoading, setTeammateLoading] = useState(true);
  const [teammateSaving, setTeammateSaving] = useState(false);
  const [teammateSaved, setTeammateSaved] = useState(false);

  // Season state
  const [driversChampion, setDriversChampion] = useState<number | null>(null);
  const [constructorsChampion, setConstructorsChampion] = useState<number | null>(null);
  const [seasonLoading, setSeasonLoading] = useState(true);
  const [seasonSaving, setSeasonSaving] = useState(false);
  const [seasonSaved, setSeasonSaved] = useState(false);
  const [currentWindow, setCurrentWindow] = useState<number | null>(null);
  const [changeCount, setChangeCount] = useState(0);

  // Load teammate predictions
  useEffect(() => {
    fetch('/api/teammates')
      .then(res => res.json())
      .then(data => {
        if (data.picks) setTeammatePicks(data.picks);
        setTeammateLoading(false);
      })
      .catch(() => setTeammateLoading(false));
  }, []);

  // Load season predictions
  useEffect(() => {
    fetch('/api/season')
      .then(res => res.json())
      .then(data => {
        setCurrentWindow(data.currentWindow);
        setChangeCount(data.changeCount);
        if (data.currentWindow && data.predictions[data.currentWindow]) {
          setDriversChampion(data.predictions[data.currentWindow].driversChampionId);
          setConstructorsChampion(data.predictions[data.currentWindow].constructorsChampionId);
        }
        setSeasonLoading(false);
      })
      .catch(() => setSeasonLoading(false));
  }, []);

  const handleTeammateSave = async () => {
    setTeammateSaving(true);
    setTeammateSaved(false);
    try {
      const res = await fetch('/api/teammates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ picks: teammatePicks }),
      });
      if (res.ok) {
        setTeammateSaved(true);
        setTimeout(() => {
          setTeammateSaved(false);
          setTab('season');
        }, 1000);
      }
    } catch { /* */ }
    setTeammateSaving(false);
  };

  const handleSeasonSave = async () => {
    if (!driversChampion || !constructorsChampion) return;
    setSeasonSaving(true);
    setSeasonSaved(false);
    try {
      const res = await fetch('/api/season', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driversChampionId: driversChampion, constructorsChampionId: constructorsChampion }),
      });
      if (res.ok) {
        setSeasonSaved(true);
        setTimeout(() => setSeasonSaved(false), 3000);
      }
    } catch { /* */ }
    setSeasonSaving(false);
  };

  return (
    <div className="min-h-screen bg-gradient-main">
      <NavBar />

      <main className="max-w-3xl mx-auto px-4 py-8">
        <Link href="/" className="text-sm text-[--color-text-muted] hover:text-[--color-text-secondary] mb-2 inline-block">
          &larr; Back to Home
        </Link>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Season Predictions</h1>
          <HowToPlay variant="season" />
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[--color-border] mb-6">
          <button
            onClick={() => setTab('teammates')}
            className={`px-6 py-3 text-sm font-semibold transition-colors relative ${
              tab === 'teammates' ? 'text-[--color-accent-blue]' : 'text-[--color-text-muted] hover:text-[--color-text-secondary]'
            }`}
          >
            Teammate Battles
            {tab === 'teammates' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[--color-accent-blue]" />}
          </button>
          <button
            onClick={() => setTab('season')}
            className={`px-6 py-3 text-sm font-semibold transition-colors relative ${
              tab === 'season' ? 'text-[--color-accent-blue]' : 'text-[--color-text-muted] hover:text-[--color-text-secondary]'
            }`}
          >
            Season Champions
            {tab === 'season' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[--color-accent-blue]" />}
          </button>
        </div>

        {/* Teammate Battles Tab */}
        {tab === 'teammates' && (
          teammateLoading ? (
            <div className="text-center py-12 text-[--color-text-muted]">Loading...</div>
          ) : (
            <>
              <p className="text-sm text-[--color-text-secondary] mb-4">
                For each team, predict which driver will finish higher in the championship. 5 points per correct pick at season end.
              </p>
              <div className="space-y-3">
                {TEAMS.map(team => (
                  <TeammateBattleCard
                    key={team.id}
                    teamId={team.id}
                    selectedDriverId={teammatePicks[team.id] ?? null}
                    onSelect={driverId => setTeammatePicks(prev => ({ ...prev, [team.id]: driverId }))}
                  />
                ))}
              </div>
              <button
                onClick={handleTeammateSave}
                disabled={teammateSaving}
                className="w-full mt-6 py-3 bg-gradient-accent rounded-lg font-semibold uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {teammateSaving ? 'Saving...' : teammateSaved ? '✓ Saved — Opening Champions...' : 'Save & Continue to Champions →'}
              </button>
              {teammateSaved && (
                <p className="text-sm text-[--color-success] mt-2 text-center">Teammate picks saved! Moving to Season Champions...</p>
              )}
            </>
          )
        )}

        {/* Season Champions Tab */}
        {tab === 'season' && (
          seasonLoading ? (
            <div className="text-center py-12 text-[--color-text-muted]">Loading...</div>
          ) : !currentWindow ? (
            <div className="bg-gradient-card rounded-xl p-8 text-center">
              <p className="text-[--color-text-secondary]">No prediction window currently open.</p>
              <p className="text-sm text-[--color-text-muted] mt-1">Windows open before rounds 1, 7, 13, and 19.</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-[--color-text-secondary] mb-2">
                Predict the 2026 Drivers&apos; and Constructors&apos; Champions. Base points: 20pts, reduced by 25% per change window used.
              </p>
              <p className="text-xs text-[--color-text-muted] mb-6">
                Window {currentWindow} of 4 &middot; Changes made: {changeCount}
              </p>

              {/* Drivers Champion */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-[--color-text-secondary] mb-3 uppercase tracking-wider">
                  Drivers&apos; Champion
                </h3>
                <select
                  value={driversChampion ?? ''}
                  onChange={e => setDriversChampion(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-4 py-3 bg-[--color-bg-input] border border-[--color-border] rounded-lg text-[--color-text-primary]"
                >
                  <option value="">Select driver...</option>
                  {DRIVERS.map(driver => {
                    const team = TEAMS.find(t => t.id === driver.teamId);
                    return (
                      <option key={driver.id} value={driver.id}>
                        {driver.firstName} {driver.lastName} ({team?.shortName})
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Constructors Champion */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-[--color-text-secondary] mb-3 uppercase tracking-wider">
                  Constructors&apos; Champion
                </h3>
                <select
                  value={constructorsChampion ?? ''}
                  onChange={e => setConstructorsChampion(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-4 py-3 bg-[--color-bg-input] border border-[--color-border] rounded-lg text-[--color-text-primary]"
                >
                  <option value="">Select team...</option>
                  {TEAMS.map(team => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleSeasonSave}
                disabled={seasonSaving || !driversChampion || !constructorsChampion}
                className="w-full py-3 bg-gradient-accent rounded-lg font-semibold uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {seasonSaving ? 'Saving...' : seasonSaved ? 'Saved!' : 'Save Season Predictions'}
              </button>
              {seasonSaved && (
                <p className="text-sm text-[--color-success] mt-2 text-center">Season predictions saved!</p>
              )}
            </>
          )
        )}
      </main>
    </div>
  );
}
