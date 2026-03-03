import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  getLeagueById,
  isLeagueMember,
  deleteLeague,
  getLeagueLeaderboard,
  getLeagueMemberCount,
} from '@/lib/db/queries/leagues';

// GET /api/leagues/[id] — league info + leaderboard
export async function GET(
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

  // Must be a member to view
  if (!isLeagueMember(leagueId, userId)) {
    return NextResponse.json({ error: 'You are not a member of this league' }, { status: 403 });
  }

  const leaderboard = getLeagueLeaderboard(leagueId);
  const memberCount = getLeagueMemberCount(leagueId);

  return NextResponse.json({
    league: {
      ...league,
      member_count: memberCount,
    },
    leaderboard,
  });
}

// DELETE /api/leagues/[id] — delete league (creator only)
export async function DELETE(
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

  if (league.created_by !== userId) {
    return NextResponse.json({ error: 'Only the league creator can delete it' }, { status: 403 });
  }

  deleteLeague(leagueId);
  return NextResponse.json({ success: true });
}
