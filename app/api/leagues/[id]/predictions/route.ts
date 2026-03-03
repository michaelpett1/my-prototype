import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { ROUNDS } from '@/lib/f1-data';
import {
  getLeagueById,
  isLeagueMember,
  getLeagueMemberPredictions,
} from '@/lib/db/queries/leagues';

// GET /api/leagues/[id]/predictions?round=N — get members' predictions for a locked round
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const userId = parseInt(session.user.id);
  const leagueId = parseInt(id);

  if (isNaN(leagueId)) {
    return NextResponse.json({ error: 'Invalid league ID' }, { status: 400 });
  }

  const league = await getLeagueById(leagueId);
  if (!league) {
    return NextResponse.json({ error: 'League not found' }, { status: 404 });
  }

  if (!await isLeagueMember(leagueId, userId)) {
    return NextResponse.json({ error: 'You are not a member of this league' }, { status: 403 });
  }

  // Parse round query param
  const url = new URL(request.url);
  const roundParam = url.searchParams.get('round');
  if (!roundParam) {
    return NextResponse.json({ error: 'Round parameter required' }, { status: 400 });
  }

  const roundId = parseInt(roundParam);
  const round = ROUNDS.find(r => r.id === roundId);
  if (!round) {
    return NextResponse.json({ error: 'Invalid round' }, { status: 400 });
  }

  // Check if the round is locked (qualifying has started)
  const today = new Date().toISOString().slice(0, 10);
  if (today < round.qualifyingDate) {
    return NextResponse.json(
      { error: 'Predictions are not yet locked for this round' },
      { status: 403 }
    );
  }

  const predictions = await getLeagueMemberPredictions(leagueId, roundId);

  return NextResponse.json({ predictions });
}
