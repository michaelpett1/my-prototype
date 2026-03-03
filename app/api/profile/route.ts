import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import getDb from '@/lib/db';

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = parseInt(session.user.id!);
  const db = getDb();

  // Get user info
  const user = db.prepare('SELECT id, username, email, created_at FROM users WHERE id = ?').get(userId) as {
    id: number;
    username: string;
    email: string;
    created_at: string;
  };

  // Get scores per round
  const scores = db.prepare(`
    SELECT s.*, r.name as round_name, r.race_date, r.is_sprint
    FROM scores s
    JOIN rounds r ON s.round_id = r.id
    WHERE s.user_id = ?
    ORDER BY s.round_id ASC
  `).all(userId) as {
    round_id: number;
    qualifying_pts: number;
    qualifying_bonus: number;
    race_pts: number;
    race_bonus: number;
    sprint_pts: number;
    sprint_bonus: number;
    finisher_pts: number;
    total: number;
    round_name: string;
    race_date: string;
    is_sprint: number;
  }[];

  // Get overall rank
  const rankings = db.prepare(`
    SELECT user_id, SUM(total) as total_points
    FROM scores
    GROUP BY user_id
    ORDER BY total_points DESC
  `).all() as { user_id: number; total_points: number }[];

  const rank = rankings.findIndex(r => r.user_id === userId) + 1;
  const totalUsers = rankings.length;
  const totalPoints = rankings.find(r => r.user_id === userId)?.total_points || 0;

  // Count predictions made
  const qualCount = (db.prepare('SELECT COUNT(*) as count FROM qualifying_predictions WHERE user_id = ?').get(userId) as { count: number }).count;
  const raceCount = (db.prepare('SELECT COUNT(*) as count FROM race_predictions WHERE user_id = ?').get(userId) as { count: number }).count;
  const sprintCount = (db.prepare('SELECT COUNT(*) as count FROM sprint_predictions WHERE user_id = ?').get(userId) as { count: number }).count;

  return NextResponse.json({
    user: {
      username: user.username,
      email: user.email,
      createdAt: user.created_at,
    },
    stats: {
      totalPoints,
      rank: rank || '-',
      totalUsers,
      roundsPlayed: scores.length,
      predictionsCount: qualCount + raceCount + sprintCount,
    },
    roundScores: scores,
  });
}
