import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  insertQualifyingResults,
  insertRaceResults,
  insertSprintResults,
  getQualifyingResults,
  getRaceResults,
  getSprintResults,
  calculateScoresForRound,
} from '@/lib/db/queries/results';
import { ROUNDS, DRIVERS } from '@/lib/f1-data';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ round: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { round } = await params;
  const roundId = parseInt(round);
  const roundData = ROUNDS.find(r => r.id === roundId);
  if (!roundData) {
    return NextResponse.json({ error: 'Round not found' }, { status: 404 });
  }

  const qualifying = await getQualifyingResults(roundId);
  const race = await getRaceResults(roundId);
  const sprint = await getSprintResults(roundId);

  return NextResponse.json({
    qualifying: qualifying ? [qualifying.p1, qualifying.p2, qualifying.p3] : null,
    race: race ? {
      positions: [race.p1, race.p2, race.p3, race.p4, race.p5, race.p6, race.p7, race.p8, race.p9, race.p10],
      numFinishers: race.num_finishers,
    } : null,
    sprint: sprint ? [sprint.p1, sprint.p2, sprint.p3, sprint.p4, sprint.p5] : null,
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ round: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check admin cookie
  const adminCookie = request.cookies.get('admin_verified');
  if (!adminCookie || adminCookie.value !== 'true') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const { round } = await params;
  const roundId = parseInt(round);
  const roundData = ROUNDS.find(r => r.id === roundId);
  if (!roundData) {
    return NextResponse.json({ error: 'Round not found' }, { status: 404 });
  }

  const body = await request.json();
  const driverIds = new Set(DRIVERS.map(d => d.id));

  // Validate and insert qualifying results
  if (body.qualifying) {
    const q = body.qualifying as number[];
    if (q.length !== 3 || !q.every(id => driverIds.has(id))) {
      return NextResponse.json({ error: 'Invalid qualifying results' }, { status: 400 });
    }
    await insertQualifyingResults(roundId, q[0], q[1], q[2]);
  }

  // Validate and insert race results
  if (body.race) {
    const positions = body.race.positions as number[];
    const numFinishers = body.race.numFinishers as number;
    if (positions.length !== 10 || !positions.every(id => driverIds.has(id))) {
      return NextResponse.json({ error: 'Invalid race results' }, { status: 400 });
    }
    if (typeof numFinishers !== 'number' || numFinishers < 0 || numFinishers > 22) {
      return NextResponse.json({ error: 'Invalid number of finishers' }, { status: 400 });
    }
    await insertRaceResults(roundId, positions, numFinishers);
  }

  // Validate and insert sprint results
  if (body.sprint) {
    const s = body.sprint as number[];
    if (s.length !== 5 || !s.every(id => driverIds.has(id))) {
      return NextResponse.json({ error: 'Invalid sprint results' }, { status: 400 });
    }
    if (!roundData.isSprint) {
      return NextResponse.json({ error: 'This round has no sprint' }, { status: 400 });
    }
    await insertSprintResults(roundId, s);
  }

  // Calculate scores for all users for this round
  await calculateScoresForRound(roundId);

  return NextResponse.json({ success: true });
}
