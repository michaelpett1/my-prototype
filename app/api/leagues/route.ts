import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createLeague, getUserLeagues } from '@/lib/db/queries/leagues';

// GET /api/leagues — list user's leagues
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = parseInt(session.user.id);
  const leagues = await getUserLeagues(userId);

  return NextResponse.json({ leagues });
}

// POST /api/leagues — create a new league
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = parseInt(session.user.id);
  const body = await request.json();
  const { name } = body;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return NextResponse.json({ error: 'League name is required' }, { status: 400 });
  }

  if (name.trim().length > 50) {
    return NextResponse.json({ error: 'League name must be 50 characters or less' }, { status: 400 });
  }

  try {
    const league = await createLeague(name.trim(), userId);
    return NextResponse.json({ league });
  } catch (error) {
    console.error('Create league error:', error);
    return NextResponse.json({ error: 'Failed to create league' }, { status: 500 });
  }
}
