import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  getQualifyingPrediction,
  getRacePrediction,
  getSprintPrediction,
} from '@/lib/db/queries/predictions';
import { ROUNDS } from '@/lib/f1-data';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ round: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { round: roundStr } = await params;
  const roundId = parseInt(roundStr);
  const userId = parseInt(session.user.id);

  const round = ROUNDS.find(r => r.id === roundId);
  if (!round) {
    return NextResponse.json({ error: 'Invalid round' }, { status: 400 });
  }

  const qualifying = getQualifyingPrediction(userId, roundId);
  const race = getRacePrediction(userId, roundId);
  const sprint = round.isSprint ? getSprintPrediction(userId, roundId) : null;

  return NextResponse.json({
    roundId,
    qualifying: qualifying ? [qualifying.p1, qualifying.p2, qualifying.p3] : null,
    race: race ? {
      positions: [race.p1, race.p2, race.p3, race.p4, race.p5, race.p6, race.p7, race.p8, race.p9, race.p10],
      numFinishers: race.num_finishers,
    } : null,
    sprint: sprint ? [sprint.p1, sprint.p2, sprint.p3, sprint.p4, sprint.p5] : null,
  });
}
