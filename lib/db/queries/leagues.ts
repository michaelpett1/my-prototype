import getDb from '../index';

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

export function createLeague(name: string, userId: number): League {
  const db = getDb();

  // Generate a unique join code (retry if collision)
  let joinCode: string;
  let attempts = 0;
  do {
    joinCode = generateJoinCode();
    const existing = db.prepare('SELECT id FROM leagues WHERE join_code = ?').get(joinCode);
    if (!existing) break;
    attempts++;
  } while (attempts < 10);

  if (attempts >= 10) {
    throw new Error('Failed to generate unique join code');
  }

  const result = db.prepare(
    'INSERT INTO leagues (name, join_code, created_by) VALUES (?, ?, ?)'
  ).run(name, joinCode, userId);

  const leagueId = result.lastInsertRowid as number;

  // Auto-add creator as member
  db.prepare(
    'INSERT INTO league_members (league_id, user_id) VALUES (?, ?)'
  ).run(leagueId, userId);

  return {
    id: leagueId,
    name,
    join_code: joinCode,
    created_by: userId,
    created_at: new Date().toISOString(),
  };
}

export function getLeagueByCode(code: string): League | undefined {
  const db = getDb();
  return db.prepare(
    'SELECT * FROM leagues WHERE join_code = ?'
  ).get(code.toUpperCase()) as League | undefined;
}

export function getLeagueById(id: number): League | undefined {
  const db = getDb();
  return db.prepare(
    'SELECT * FROM leagues WHERE id = ?'
  ).get(id) as League | undefined;
}

export function deleteLeague(leagueId: number): void {
  const db = getDb();
  db.prepare('DELETE FROM leagues WHERE id = ?').run(leagueId);
}

export function joinLeague(leagueId: number, userId: number): boolean {
  const db = getDb();
  try {
    db.prepare(
      'INSERT INTO league_members (league_id, user_id) VALUES (?, ?)'
    ).run(leagueId, userId);
    return true;
  } catch {
    // Duplicate entry — already a member
    return false;
  }
}

export function leaveLeague(leagueId: number, userId: number): void {
  const db = getDb();
  db.prepare(
    'DELETE FROM league_members WHERE league_id = ? AND user_id = ?'
  ).run(leagueId, userId);
}

export function isLeagueMember(leagueId: number, userId: number): boolean {
  const db = getDb();
  const row = db.prepare(
    'SELECT 1 FROM league_members WHERE league_id = ? AND user_id = ?'
  ).get(leagueId, userId);
  return !!row;
}

export function getUserLeagues(userId: number): LeagueWithMeta[] {
  const db = getDb();
  return db.prepare(`
    SELECT
      l.*,
      u.username as creator_username,
      (SELECT COUNT(*) FROM league_members WHERE league_id = l.id) as member_count
    FROM leagues l
    JOIN league_members lm ON lm.league_id = l.id AND lm.user_id = ?
    JOIN users u ON u.id = l.created_by
    ORDER BY l.created_at DESC
  `).all(userId) as LeagueWithMeta[];
}

export function getLeagueLeaderboard(leagueId: number) {
  const db = getDb();
  return db.prepare(`
    SELECT
      u.id as user_id,
      u.username,
      COALESCE(SUM(s.qualifying_pts), 0) as qualifying_pts,
      COALESCE(SUM(s.qualifying_bonus), 0) as qualifying_bonus,
      COALESCE(SUM(s.race_pts), 0) as race_pts,
      COALESCE(SUM(s.race_bonus), 0) as race_bonus,
      COALESCE(SUM(s.sprint_pts), 0) as sprint_pts,
      COALESCE(SUM(s.sprint_bonus), 0) as sprint_bonus,
      COALESCE(SUM(s.finisher_pts), 0) as finisher_pts,
      COALESCE(SUM(s.total), 0) as total_points,
      COUNT(s.round_id) as rounds_played
    FROM league_members lm
    JOIN users u ON u.id = lm.user_id
    LEFT JOIN scores s ON u.id = s.user_id
    WHERE lm.league_id = ?
    GROUP BY u.id
    ORDER BY total_points DESC
  `).all(leagueId) as {
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

export function getLeagueMemberCount(leagueId: number): number {
  const db = getDb();
  const result = db.prepare(
    'SELECT COUNT(*) as count FROM league_members WHERE league_id = ?'
  ).get(leagueId) as { count: number };
  return result.count;
}

export interface LeagueMemberPrediction {
  user_id: number;
  username: string;
  qualifying: number[] | null;
  race: { positions: number[]; numFinishers: number } | null;
  sprint: number[] | null;
}

export function getLeagueMemberPredictions(leagueId: number, roundId: number): LeagueMemberPrediction[] {
  const db = getDb();

  const members = db.prepare(`
    SELECT lm.user_id, u.username
    FROM league_members lm
    JOIN users u ON u.id = lm.user_id
    WHERE lm.league_id = ?
    ORDER BY u.username
  `).all(leagueId) as { user_id: number; username: string }[];

  return members.map(member => {
    const qualRow = db.prepare(
      'SELECT p1, p2, p3 FROM qualifying_predictions WHERE user_id = ? AND round_id = ?'
    ).get(member.user_id, roundId) as { p1: number; p2: number; p3: number } | undefined;

    const raceRow = db.prepare(
      'SELECT p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, num_finishers FROM race_predictions WHERE user_id = ? AND round_id = ?'
    ).get(member.user_id, roundId) as {
      p1: number; p2: number; p3: number; p4: number; p5: number;
      p6: number; p7: number; p8: number; p9: number; p10: number;
      num_finishers: number;
    } | undefined;

    const sprintRow = db.prepare(
      'SELECT p1, p2, p3, p4, p5 FROM sprint_predictions WHERE user_id = ? AND round_id = ?'
    ).get(member.user_id, roundId) as { p1: number; p2: number; p3: number; p4: number; p5: number } | undefined;

    return {
      user_id: member.user_id,
      username: member.username,
      qualifying: qualRow ? [qualRow.p1, qualRow.p2, qualRow.p3] : null,
      race: raceRow ? {
        positions: [raceRow.p1, raceRow.p2, raceRow.p3, raceRow.p4, raceRow.p5,
                    raceRow.p6, raceRow.p7, raceRow.p8, raceRow.p9, raceRow.p10],
        numFinishers: raceRow.num_finishers,
      } : null,
      sprint: sprintRow ? [sprintRow.p1, sprintRow.p2, sprintRow.p3, sprintRow.p4, sprintRow.p5] : null,
    };
  });
}
