import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getLeagueByCode, joinLeague, isLeagueMember } from '@/lib/db/queries/leagues';

// POST /api/leagues/join — join a league by code
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = parseInt(session.user.id);
  const body = await request.json();
  const { code } = body;

  if (!code || typeof code !== 'string' || code.trim().length === 0) {
    return NextResponse.json({ error: 'Join code is required' }, { status: 400 });
  }

  const normalizedCode = code.trim().toUpperCase();

  const league = await getLeagueByCode(normalizedCode);
  if (!league) {
    return NextResponse.json({ error: 'League not found. Check the code and try again.' }, { status: 404 });
  }

  // Check if already a member
  if (await isLeagueMember(league.id, userId)) {
    return NextResponse.json({ error: 'You are already a member of this league' }, { status: 409 });
  }

  const success = await joinLeague(league.id, userId);
  if (!success) {
    return NextResponse.json({ error: 'You are already a member of this league' }, { status: 409 });
  }

  return NextResponse.json({ league });
}
