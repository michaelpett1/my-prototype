import { NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function GET() {
  const db = getDb();

  // Aggregate scores per user across all rounds
  const leaderboard = db.prepare(`
    SELECT
      u.id as user_id,
      u.username,
      SUM(s.qualifying_pts) as qualifying_pts,
      SUM(s.qualifying_bonus) as qualifying_bonus,
      SUM(s.race_pts) as race_pts,
      SUM(s.race_bonus) as race_bonus,
      SUM(s.sprint_pts) as sprint_pts,
      SUM(s.sprint_bonus) as sprint_bonus,
      SUM(s.finisher_pts) as finisher_pts,
      SUM(s.total) as total_points,
      COUNT(s.round_id) as rounds_played
    FROM users u
    LEFT JOIN scores s ON u.id = s.user_id
    GROUP BY u.id
    HAVING total_points > 0 OR rounds_played > 0
    ORDER BY total_points DESC
  `).all() as {
    user_id: number;
    username: string;
    qualifying_pts: number;
    qualifying_bonus: number;
    race_pts: number;
    race_bonus: number;
    sprint_pts: number;
    sprint_bonus: number;
    finisher_pts: number;
    total_points: number;
    rounds_played: number;
  }[];

  return NextResponse.json({ leaderboard });
}
