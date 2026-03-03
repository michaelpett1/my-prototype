import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSupabase } from '@/lib/db';
import { ROUNDS, DRIVERS, TEAMS, SEASON_PREDICTION_WINDOWS } from '@/lib/f1-data';
import {
  getQualifyingPrediction,
  getRacePrediction,
  getSprintPrediction,
} from '@/lib/db/queries/predictions';
import HowToPlay from '@/components/HowToPlay';
import NavBar from '@/components/NavBar';

function getNextRound() {
  const now = new Date().toISOString().split('T')[0];
  return ROUNDS.find(r => r.raceDate >= now) || ROUNDS[ROUNDS.length - 1];
}

async function getUserScores(userId: number) {
  const supabase = getSupabase();
  const { data } = await supabase
    .from('scores')
    .select('total')
    .eq('user_id', userId);
  const rows = data || [];
  return {
    totalPoints: rows.reduce((sum: number, r: any) => sum + (r.total || 0), 0),
    roundsPlayed: rows.length,
  };
}

async function getUserRank(userId: number) {
  const supabase = getSupabase();
  const { data } = await supabase.rpc('get_global_leaderboard');
  const rows = data || [];
  const idx = rows.findIndex((r: any) => r.user_id === userId);
  return idx >= 0 ? idx + 1 : null;
}

function getSeasonPredictionWindowInfo() {
  const today = new Date().toISOString().slice(0, 10);

  // Find which window is currently open
  // A window N is open if:
  // - today < qualifying date of SEASON_PREDICTION_WINDOWS[N-1]
  // - AND either it's the first window, or today >= qualifying date of the PREVIOUS window round
  for (let i = 0; i < SEASON_PREDICTION_WINDOWS.length; i++) {
    const windowRound = ROUNDS.find(r => r.id === SEASON_PREDICTION_WINDOWS[i]);
    if (!windowRound) continue;

    if (today < windowRound.qualifyingDate) {
      // Check if this is the correct window (not a future one)
      // If it's window 1, it's always the right one if we're before R1 qualifying
      // Otherwise, we should be past the previous window's round qualifying
      if (i === 0) {
        // Window 1: always open before R1 qualifying
        const daysLeft = Math.ceil(
          (new Date(windowRound.qualifyingDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );
        return { windowNumber: 1, isOpen: true, closesDate: windowRound.qualifyingDate, closesRound: windowRound, daysLeft };
      }
      // For windows 2-4: open only if we're past the previous window's closing round qualifying
      const prevWindowRound = ROUNDS.find(r => r.id === SEASON_PREDICTION_WINDOWS[i - 1]);
      if (prevWindowRound && today >= prevWindowRound.qualifyingDate) {
        const daysLeft = Math.ceil(
          (new Date(windowRound.qualifyingDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );
        return { windowNumber: i + 1, isOpen: true, closesDate: windowRound.qualifyingDate, closesRound: windowRound, daysLeft };
      }
      // We're before this window's round qualifying but haven't reached the gap yet — window not yet open
      break;
    }
  }
  return { windowNumber: null, isOpen: false, closesDate: null, closesRound: null, daysLeft: 0 };
}

function getDriverLabel(driverId: number) {
  const d = DRIVERS.find(dr => dr.id === driverId);
  if (!d) return '???';
  const t = TEAMS.find(tm => tm.id === d.teamId);
  return { code: d.code, name: `${d.firstName} ${d.lastName}`, color: t?.color || '#666', imageUrl: d.imageUrl };
}

export default async function HomePage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const userId = parseInt(session.user.id!);
  const nextRound = getNextRound();
  const stats = await getUserScores(userId);
  const rank = await getUserRank(userId);

  // Check if user has predictions for next round
  const supabase = getSupabase();
  const { data: hasPrediction } = await supabase
    .from('qualifying_predictions')
    .select('id')
    .eq('user_id', userId)
    .eq('round_id', nextRound.id)
    .maybeSingle();

  const qualPrediction = await getQualifyingPrediction(userId, nextRound.id);
  const racePrediction = await getRacePrediction(userId, nextRound.id);
  const sprintPrediction = nextRound.isSprint ? await getSprintPrediction(userId, nextRound.id) : null;

  const daysUntilRace = Math.ceil(
    (new Date(nextRound.raceDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  const seasonWindow = getSeasonPredictionWindowInfo();

  return (
    <div className="min-h-screen bg-gradient-main">
      {/* Nav — shared across all pages */}
      <NavBar />

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Welcome */}
        <div className="animate-fade-in">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-1">
                Welcome back, <span className="text-gradient">{session.user.name}</span>
              </h1>
              <p className="text-[--color-text-secondary]">2026 Formula 1 Season</p>
            </div>
            <HowToPlay variant="home" />
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="bg-gradient-card rounded-xl p-6">
            <p className="text-sm text-[--color-text-muted] mb-1">Total Points</p>
            <p className="text-3xl font-bold text-[--color-accent-blue]">{stats.totalPoints}</p>
          </div>
          <div className="bg-gradient-card rounded-xl p-6">
            <p className="text-sm text-[--color-text-muted] mb-1">Rank</p>
            <p className="text-3xl font-bold text-[--color-accent-violet]">
              {rank ? `#${rank}` : '--'}
            </p>
          </div>
          <div className="bg-gradient-card rounded-xl p-6">
            <p className="text-sm text-[--color-text-muted] mb-1">Rounds Played</p>
            <p className="text-3xl font-bold text-[--color-accent-teal]">{stats.roundsPlayed}</p>
          </div>
        </div>

        {/* Season Predictions Window Banner */}
        {seasonWindow.isOpen && (
          <Link
            href="/special"
            className="block animate-slide-up"
            style={{ animationDelay: '0.15s' }}
          >
            <div className="bg-gradient-to-r from-[--color-accent-violet]/15 to-[--color-accent-blue]/15 rounded-xl p-5 border border-[--color-accent-violet]/30 hover:border-[--color-accent-violet]/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🏆</span>
                  <div>
                    <p className="font-semibold text-[--color-text-primary]">
                      Season Predictions Window {seasonWindow.windowNumber} Open
                    </p>
                    <p className="text-sm text-[--color-text-secondary]">
                      Pick your Drivers&apos; &amp; Constructors&apos; Champions — closes before R{seasonWindow.closesRound!.id} qualifying
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right hidden sm:block">
                    <p className="text-xl font-bold text-[--color-accent-violet]">{seasonWindow.daysLeft}d</p>
                    <p className="text-xs text-[--color-text-muted]">remaining</p>
                  </div>
                  <span className="text-[--color-accent-violet] font-semibold text-sm">
                    Predict →
                  </span>
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* Next Race Card */}
        <div className="bg-gradient-card rounded-xl p-8 glow-blue animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs text-[--color-accent-blue] uppercase tracking-wider font-semibold mb-1">
                Round {nextRound.id} of 24
                {nextRound.isSprint && (
                  <span className="ml-2 px-2 py-0.5 bg-[--color-accent-violet]/20 text-[--color-accent-violet] rounded text-xs">
                    Sprint
                  </span>
                )}
              </p>
              <h2 className="text-2xl font-bold">{nextRound.flag} {nextRound.name}</h2>
              <p className="text-[--color-text-secondary] mt-1">{nextRound.location}, {nextRound.country}</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-[--color-accent-blue]">{daysUntilRace}</p>
              <p className="text-xs text-[--color-text-muted]">days away</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <Link
              href={`/predict/${nextRound.id}`}
              className="flex-1 text-center py-3 bg-gradient-accent rounded-lg font-semibold uppercase tracking-wider hover:opacity-90 transition-opacity"
            >
              {hasPrediction ? 'Edit Predictions' : 'Make Predictions'}
            </Link>
            {nextRound.id > 1 && (
              <Link
                href={`/results/${nextRound.id - 1}`}
                className="flex-1 text-center py-3 border border-[--color-border-bright] rounded-lg font-semibold text-[--color-text-secondary] uppercase tracking-wider hover:bg-[--color-bg-card-hover] transition-colors"
              >
                Last Results
              </Link>
            )}
          </div>
        </div>

        {/* Prediction Summary */}
        {(qualPrediction || racePrediction || sprintPrediction) && (
          <div className="bg-gradient-card rounded-xl p-6 animate-slide-up" style={{ animationDelay: '0.25s' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Your Predictions — R{nextRound.id}</h3>
              <Link
                href={`/predict/${nextRound.id}`}
                className="text-sm text-[--color-accent-blue] hover:underline"
              >
                Edit →
              </Link>
            </div>

            <div className="space-y-4">
              {/* Qualifying Summary */}
              {qualPrediction && (
                <div>
                  <p className="text-xs text-[--color-text-muted] uppercase tracking-wider font-semibold mb-2">Qualifying Top 3</p>
                  <div className="flex gap-2 flex-wrap">
                    {[qualPrediction.p1, qualPrediction.p2, qualPrediction.p3].map((dId, i) => {
                      const info = getDriverLabel(dId);
                      if (typeof info === 'string') return null;
                      return (
                        <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm" style={{ backgroundColor: `${info.color}15`, borderLeft: `3px solid ${info.color}` }}>
                          <img src={info.imageUrl} alt={info.code} className="w-6 h-6 rounded-full object-cover bg-[--color-bg-secondary]" />
                          <span className="text-[--color-text-muted] text-xs">P{i + 1}</span>
                          <span className="font-semibold">{info.code}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Race Summary */}
              {racePrediction && (
                <div>
                  <p className="text-xs text-[--color-text-muted] uppercase tracking-wider font-semibold mb-2">Race Top 10</p>
                  <div className="flex gap-2 flex-wrap">
                    {[racePrediction.p1, racePrediction.p2, racePrediction.p3, racePrediction.p4, racePrediction.p5,
                      racePrediction.p6, racePrediction.p7, racePrediction.p8, racePrediction.p9, racePrediction.p10].map((dId, i) => {
                      const info = getDriverLabel(dId);
                      if (typeof info === 'string') return null;
                      return (
                        <div key={i} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-sm" style={{ backgroundColor: `${info.color}15`, borderLeft: `3px solid ${info.color}` }}>
                          <img src={info.imageUrl} alt={info.code} className="w-5 h-5 rounded-full object-cover bg-[--color-bg-secondary]" />
                          <span className="text-[--color-text-muted] text-xs">P{i + 1}</span>
                          <span className="font-semibold">{info.code}</span>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-xs text-[--color-text-muted] mt-2">Finishers predicted: <span className="font-semibold text-[--color-text-secondary]">{racePrediction.num_finishers}</span></p>
                </div>
              )}

              {/* Sprint Summary */}
              {sprintPrediction && (
                <div>
                  <p className="text-xs text-[--color-text-muted] uppercase tracking-wider font-semibold mb-2">Sprint Top 5</p>
                  <div className="flex gap-2 flex-wrap">
                    {[sprintPrediction.p1, sprintPrediction.p2, sprintPrediction.p3, sprintPrediction.p4, sprintPrediction.p5].map((dId, i) => {
                      const info = getDriverLabel(dId);
                      if (typeof info === 'string') return null;
                      return (
                        <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm" style={{ backgroundColor: `${info.color}15`, borderLeft: `3px solid ${info.color}` }}>
                          <img src={info.imageUrl} alt={info.code} className="w-6 h-6 rounded-full object-cover bg-[--color-bg-secondary]" />
                          <span className="text-[--color-text-muted] text-xs">P{i + 1}</span>
                          <span className="font-semibold">{info.code}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Status indicators */}
              <div className="flex gap-3 pt-2 border-t border-[--color-border]">
                <span className={`text-xs font-medium px-2 py-1 rounded ${qualPrediction ? 'bg-[--color-success]/15 text-[--color-success]' : 'bg-[--color-bg-secondary] text-[--color-text-muted]'}`}>
                  {qualPrediction ? '✓ Qualifying' : '○ Qualifying'}
                </span>
                <span className={`text-xs font-medium px-2 py-1 rounded ${racePrediction ? 'bg-[--color-success]/15 text-[--color-success]' : 'bg-[--color-bg-secondary] text-[--color-text-muted]'}`}>
                  {racePrediction ? '✓ Race' : '○ Race'}
                </span>
                {nextRound.isSprint && (
                  <span className={`text-xs font-medium px-2 py-1 rounded ${sprintPrediction ? 'bg-[--color-success]/15 text-[--color-success]' : 'bg-[--color-bg-secondary] text-[--color-text-muted]'}`}>
                    {sprintPrediction ? '✓ Sprint' : '○ Sprint'}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Calendar preview */}
        <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <h3 className="text-lg font-semibold mb-4">Upcoming Rounds</h3>
          <div className="space-y-2">
            {ROUNDS.filter(r => r.raceDate >= new Date().toISOString().split('T')[0])
              .slice(0, 5)
              .map(round => (
                <Link
                  key={round.id}
                  href={`/predict/${round.id}`}
                  className="flex items-center justify-between p-4 bg-[--color-bg-card]/50 hover:bg-[--color-bg-card-hover] rounded-lg border border-[--color-border] transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-[--color-text-muted] w-6">R{round.id}</span>
                    <div>
                      <p className="font-medium">{round.flag} {round.name}</p>
                      <p className="text-sm text-[--color-text-muted]">{round.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {round.isSprint && (
                      <span className="px-2 py-0.5 bg-[--color-accent-violet]/20 text-[--color-accent-violet] rounded text-xs font-medium">
                        Sprint
                      </span>
                    )}
                    <span className="text-sm text-[--color-text-secondary]">
                      {new Date(round.raceDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </main>
    </div>
  );
}
