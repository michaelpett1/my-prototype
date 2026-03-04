import getSupabase from '../index';

// Characters that avoid confusion (no O/0/I/1/L)
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

function generateJoinCode(): string {
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return code;
}

export interface League {
  id: number;
  name: string;
  join_code: string;
  created_by: number;
  created_at: string;
}

export interface LeagueWithMeta extends League {
  member_count: number;
  creator_username: string;
}

export async function createLeague(name: string, userId: number): Promise<League> {
  const supabase = getSupabase();

  // Generate a unique join code (retry if collision)
  let joinCode: string = '';
  let attempts = 0;
  while (attempts < 10) {
    joinCode = generateJoinCode();
    const { data: existing } = await supabase
      .from('leagues')
      .select('id')
      .eq('join_code', joinCode)
      .maybeSingle();
    if (!existing) break;
    attempts++;
  }

  if (attempts >= 10) {
    throw new Error('Failed to generate unique join code');
  }

  const { data: league, error: leagueError } = await supabase
    .from('leagues')
    .insert({ name, join_code: joinCode, created_by: userId })
    .select()
    .single();

  if (leagueError) {
    console.error('createLeague insert error:', leagueError);
    throw new Error(`Failed to create league: ${leagueError.message}`);
  }

  if (!league) {
    throw new Error('Failed to create league: no data returned');
  }

  // Auto-add creator as member
  const { error: memberError } = await supabase
    .from('league_members')
    .insert({ league_id: league.id, user_id: userId });

  if (memberError) {
    console.error('createLeague add member error:', memberError);
  }

  return league as League;
}

export async function getLeagueByCode(code: string): Promise<League | null> {
  const supabase = getSupabase();
  const { data } = await supabase
    .from('leagues')
    .select('*')
    .eq('join_code', code.toUpperCase())
    .maybeSingle();

  return data as League | null;
}

export async function getLeagueById(id: number): Promise<League | null> {
  const supabase = getSupabase();
  const { data } = await supabase
    .from('leagues')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  return data as League | null;
}

export async function deleteLeague(leagueId: number): Promise<void> {
  const supabase = getSupabase();
  await supabase
    .from('leagues')
    .delete()
    .eq('id', leagueId);
}

export async function joinLeague(leagueId: number, userId: number): Promise<boolean> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('league_members')
    .insert({ league_id: leagueId, user_id: userId });

  if (error) {
    // Duplicate entry — already a member (unique constraint violation)
    return false;
  }
  return true;
}

export async function leaveLeague(leagueId: number, userId: number): Promise<void> {
  const supabase = getSupabase();
  await supabase
    .from('league_members')
    .delete()
    .eq('league_id', leagueId)
    .eq('user_id', userId);
}

export async function isLeagueMember(leagueId: number, userId: number): Promise<boolean> {
  const supabase = getSupabase();
  const { data } = await supabase
    .from('league_members')
    .select('league_id')
    .eq('league_id', leagueId)
    .eq('user_id', userId)
    .maybeSingle();

  return !!data;
}

export async function getUserLeagues(userId: number): Promise<LeagueWithMeta[]> {
  const supabase = getSupabase();
  const { data } = await supabase
    .rpc('get_user_leagues', { p_user_id: userId });

  return (data ?? []) as LeagueWithMeta[];
}

export async function getLeagueLeaderboard(leagueId: number) {
  const supabase = getSupabase();
  const { data } = await supabase
    .rpc('get_league_leaderboard', { p_league_id: leagueId });

  return (data ?? []) as {
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
}

export async function getLeagueMemberCount(leagueId: number): Promise<number> {
  const supabase = getSupabase();
  const { count } = await supabase
    .from('league_members')
    .select('*', { count: 'exact', head: true })
    .eq('league_id', leagueId);

  return count ?? 0;
}

export interface LeagueMemberPrediction {
  user_id: number;
  username: string;
  qualifying: number[] | null;
  race: { positions: number[]; numFinishers: number } | null;
  sprint: number[] | null;
}

export async function getLeagueMemberPredictions(leagueId: number, roundId: number): Promise<LeagueMemberPrediction[]> {
  const supabase = getSupabase();

  // Get all members
  const { data: members } = await supabase
    .from('league_members')
    .select('user_id, users!inner(username)')
    .eq('league_id', leagueId);

  if (!members || members.length === 0) return [];

  const memberIds = members.map((m: { user_id: number }) => m.user_id);

  // Batch-fetch all predictions for these members and round
  const { data: qualRows } = await supabase
    .from('qualifying_predictions')
    .select('user_id, p1, p2, p3')
    .eq('round_id', roundId)
    .in('user_id', memberIds);

  const { data: raceRows } = await supabase
    .from('race_predictions')
    .select('user_id, p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, num_finishers')
    .eq('round_id', roundId)
    .in('user_id', memberIds);

  const { data: sprintRows } = await supabase
    .from('sprint_predictions')
    .select('user_id, p1, p2, p3, p4, p5')
    .eq('round_id', roundId)
    .in('user_id', memberIds);

  // Build lookup maps
  const qualMap = new Map<number, { p1: number; p2: number; p3: number }>();
  (qualRows ?? []).forEach((r: { user_id: number; p1: number; p2: number; p3: number }) => {
    qualMap.set(r.user_id, r);
  });

  const raceMap = new Map<number, {
    p1: number; p2: number; p3: number; p4: number; p5: number;
    p6: number; p7: number; p8: number; p9: number; p10: number;
    num_finishers: number;
  }>();
  (raceRows ?? []).forEach((r: {
    user_id: number;
    p1: number; p2: number; p3: number; p4: number; p5: number;
    p6: number; p7: number; p8: number; p9: number; p10: number;
    num_finishers: number;
  }) => {
    raceMap.set(r.user_id, r);
  });

  const sprintMap = new Map<number, { p1: number; p2: number; p3: number; p4: number; p5: number }>();
  (sprintRows ?? []).forEach((r: { user_id: number; p1: number; p2: number; p3: number; p4: number; p5: number }) => {
    sprintMap.set(r.user_id, r);
  });

  // Build results
  return members.map((member: any) => {
    const qualRow = qualMap.get(member.user_id);
    const raceRow = raceMap.get(member.user_id);
    const sprintRow = sprintMap.get(member.user_id);

    // Supabase returns joined relations as arrays; extract first element
    const usersData = Array.isArray(member.users) ? member.users[0] : member.users;

    return {
      user_id: member.user_id,
      username: usersData?.username ?? 'Unknown',
      qualifying: qualRow ? [qualRow.p1, qualRow.p2, qualRow.p3] : null,
      race: raceRow ? {
        positions: [
          raceRow.p1, raceRow.p2, raceRow.p3, raceRow.p4, raceRow.p5,
          raceRow.p6, raceRow.p7, raceRow.p8, raceRow.p9, raceRow.p10,
        ],
        numFinishers: raceRow.num_finishers,
      } : null,
      sprint: sprintRow ? [sprintRow.p1, sprintRow.p2, sprintRow.p3, sprintRow.p4, sprintRow.p5] : null,
    };
  });
}
