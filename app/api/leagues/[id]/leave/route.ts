import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getLeagueById, isLeagueMember, leaveLeague } from '@/lib/db/queries/leagues';

// POST /api/leagues/[id]/leave — leave a league
export async function POST(
  _request: Request,
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

  const league = getLeagueById(leagueId);
  if (!league) {
    return NextResponse.json({ error: 'League not found' }, { status: 404 });
  }

  if (!isLeagueMember(leagueId, userId)) {
    return NextResponse.json({ error: 'You are not a member of this league' }, { status: 400 });
  }

  // Creator cannot leave — they must delete the league
  if (league.created_by === userId) {
    return NextResponse.json(
      { error: 'As the league creator, you cannot leave. Delete the league instead.' },
      { status: 403 }
    );
  }

  leaveLeague(leagueId, userId);
  return NextResponse.json({ success: true });
}
