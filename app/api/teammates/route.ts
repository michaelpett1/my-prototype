import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getTeammatePredictions, upsertTeammatePredictions } from '@/lib/db/queries/predictions';
import { TEAMS, DRIVERS } from '@/lib/f1-data';

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = parseInt(session.user.id!);
  const predictions = await getTeammatePredictions(userId);

  // Convert to a map of teamId -> winnerDriverId
  const picks: Record<number, number> = {};
  for (const pred of predictions) {
    picks[pred.team_id] = pred.winner_driver_id;
  }

  return NextResponse.json({ picks });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = parseInt(session.user.id!);
  const body = await request.json();
  const { picks } = body as { picks: Record<string, number> };

  // Validate picks
  const teamIds = new Set(TEAMS.map(t => t.id));
  const driverIds = new Set(DRIVERS.map(d => d.id));

  const validPicks: { teamId: number; driverId: number }[] = [];

  for (const [teamIdStr, driverId] of Object.entries(picks)) {
    const teamId = parseInt(teamIdStr);
    if (!teamIds.has(teamId) || !driverIds.has(driverId)) continue;

    const driver = DRIVERS.find(d => d.id === driverId);
    if (!driver || driver.teamId !== teamId) continue;

    validPicks.push({ teamId, driverId });
  }

  await upsertTeammatePredictions(userId, validPicks);

  return NextResponse.json({ success: true });
}
