import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSeasonPrediction, getSeasonPredictionCount, upsertSeasonPrediction } from '@/lib/db/queries/predictions';
import { DRIVERS, TEAMS, SEASON_PREDICTION_WINDOWS, ROUNDS } from '@/lib/f1-data';

function getCurrentWindow(): number | null {
  const today = new Date().toISOString().slice(0, 10);

  // Find which window we're in: before the first qualifying date of the next window round
  for (let i = SEASON_PREDICTION_WINDOWS.length - 1; i >= 0; i--) {
    const windowRound = ROUNDS.find(r => r.id === SEASON_PREDICTION_WINDOWS[i]);
    if (windowRound && today < windowRound.qualifyingDate) {
      return i + 1; // window number (1-indexed)
    }
  }
  return null; // all windows passed
}

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = parseInt(session.user.id!);
  const currentWindow = getCurrentWindow();

  // Get all predictions
  const predictions: Record<number, { driversChampionId: number; constructorsChampionId: number } | null> = {};
  for (let w = 1; w <= SEASON_PREDICTION_WINDOWS.length; w++) {
    const pred = getSeasonPrediction(userId, w);
    predictions[w] = pred ? {
      driversChampionId: pred.drivers_champion_id,
      constructorsChampionId: pred.constructors_champion_id,
    } : null;
  }

  const changeCount = getSeasonPredictionCount(userId);

  return NextResponse.json({
    currentWindow,
    predictions,
    changeCount,
    windows: SEASON_PREDICTION_WINDOWS,
  });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = parseInt(session.user.id!);
  const body = await request.json();
  const { driversChampionId, constructorsChampionId } = body;

  const currentWindow = getCurrentWindow();
  if (!currentWindow) {
    return NextResponse.json({ error: 'No prediction window open' }, { status: 400 });
  }

  // Validate
  const driver = DRIVERS.find(d => d.id === driversChampionId);
  const team = TEAMS.find(t => t.id === constructorsChampionId);
  if (!driver || !team) {
    return NextResponse.json({ error: 'Invalid driver or team' }, { status: 400 });
  }

  upsertSeasonPrediction(userId, currentWindow, driversChampionId, constructorsChampionId);

  return NextResponse.json({ success: true });
}
