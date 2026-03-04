import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { ROUNDS, DRIVERS, getLockDate } from '@/lib/f1-data';
import {
  upsertQualifyingPrediction,
  upsertRacePrediction,
  upsertSprintPrediction,
} from '@/lib/db/queries/predictions';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = parseInt(session.user.id);
  const body = await request.json();
  const { roundId, qualifying, race, sprint } = body;

  // Validate round exists
  const round = ROUNDS.find(r => r.id === roundId);
  if (!round) {
    return NextResponse.json({ error: 'Invalid round' }, { status: 400 });
  }

  // Check if round is locked (sprint qualifying for sprint weekends, qualifying for normal)
  const now = new Date();
  const lockDateStr = getLockDate(round);
  const lockDate = new Date(lockDateStr + 'T00:00:00Z');
  if (now >= lockDate) {
    return NextResponse.json({ error: 'Predictions are locked for this round' }, { status: 403 });
  }

  const driverIds = DRIVERS.map(d => d.id);
  const isValidDriver = (id: number) => driverIds.includes(id);

  try {
    // Save qualifying predictions (P1-P3)
    if (qualifying && qualifying.length === 3) {
      const [p1, p2, p3] = qualifying;
      if (!isValidDriver(p1) || !isValidDriver(p2) || !isValidDriver(p3)) {
        return NextResponse.json({ error: 'Invalid driver in qualifying prediction' }, { status: 400 });
      }
      if (new Set(qualifying).size !== 3) {
        return NextResponse.json({ error: 'Duplicate drivers in qualifying prediction' }, { status: 400 });
      }
      await upsertQualifyingPrediction(userId, roundId, p1, p2, p3);
    }

    // Save race predictions (P1-P10 + num_finishers)
    if (race && race.positions && race.positions.length === 10 && typeof race.numFinishers === 'number') {
      for (const id of race.positions) {
        if (!isValidDriver(id)) {
          return NextResponse.json({ error: 'Invalid driver in race prediction' }, { status: 400 });
        }
      }
      if (new Set(race.positions).size !== 10) {
        return NextResponse.json({ error: 'Duplicate drivers in race prediction' }, { status: 400 });
      }
      if (race.numFinishers < 0 || race.numFinishers > 22) {
        return NextResponse.json({ error: 'Invalid number of finishers' }, { status: 400 });
      }
      await upsertRacePrediction(userId, roundId, race.positions, race.numFinishers);
    }

    // Save sprint predictions (P1-P5) if sprint round
    if (sprint && sprint.length === 5 && round.isSprint) {
      for (const id of sprint) {
        if (!isValidDriver(id)) {
          return NextResponse.json({ error: 'Invalid driver in sprint prediction' }, { status: 400 });
        }
      }
      if (new Set(sprint).size !== 5) {
        return NextResponse.json({ error: 'Duplicate drivers in sprint prediction' }, { status: 400 });
      }
      await upsertSprintPrediction(userId, roundId, sprint);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Prediction save error:', errMsg, error);
    return NextResponse.json({ error: `Failed to save predictions: ${errMsg}` }, { status: 500 });
  }
}
