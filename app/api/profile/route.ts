import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import getSupabase from '@/lib/db';

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = parseInt(session.user.id!);
  const supabase = getSupabase();

  // Get user info
  const { data: user } = await supabase
    .from('users')
    .select('id, username, email, created_at')
    .eq('id', userId)
    .single();

  // Get scores per round with round info
  const { data: scores } = await supabase
    .from('scores')
    .select('*, rounds!inner(name, race_date, is_sprint)')
    .eq('user_id', userId)
    .order('round_id');

  // Map joined fields to match the old response shape
  const mappedScores = (scores || []).map((s: Record<string, unknown>) => {
    const round = s.rounds as { name: string; race_date: string; is_sprint: number } | null;
    return {
      round_id: s.round_id,
      qualifying_pts: s.qualifying_pts,
      qualifying_bonus: s.qualifying_bonus,
      race_pts: s.race_pts,
      race_bonus: s.race_bonus,
      sprint_pts: s.sprint_pts,
      sprint_bonus: s.sprint_bonus,
      finisher_pts: s.finisher_pts,
      total: s.total,
      round_name: round?.name,
      race_date: round?.race_date,
      is_sprint: round?.is_sprint,
    };
  });

  // Get overall rank via RPC leaderboard
  const { data: rankings } = await supabase.rpc('get_global_leaderboard');

  const rankingsList = rankings || [];
  const userRanking = rankingsList.find((r: { user_id: number }) => r.user_id === userId);
  const rank = rankingsList.findIndex((r: { user_id: number }) => r.user_id === userId) + 1;
  const totalUsers = rankingsList.length;
  const totalPoints = userRanking?.total_points || 0;

  // Count predictions made
  const { count: qualCount } = await supabase
    .from('qualifying_predictions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  const { count: raceCount } = await supabase
    .from('race_predictions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  const { count: sprintCount } = await supabase
    .from('sprint_predictions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  return NextResponse.json({
    user: {
      username: user?.username,
      email: user?.email,
      createdAt: user?.created_at,
    },
    stats: {
      totalPoints,
      rank: rank || '-',
      totalUsers,
      roundsPlayed: mappedScores.length,
      predictionsCount: (qualCount || 0) + (raceCount || 0) + (sprintCount || 0),
    },
    roundScores: mappedScores,
  });
}
