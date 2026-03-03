import getDb from '../index';

// Qualifying predictions
export function getQualifyingPrediction(userId: number, roundId: number) {
  const db = getDb();
  return db.prepare(
    'SELECT * FROM qualifying_predictions WHERE user_id = ? AND round_id = ?'
  ).get(userId, roundId) as { p1: number; p2: number; p3: number } | undefined;
}

export function upsertQualifyingPrediction(userId: number, roundId: number, p1: number, p2: number, p3: number) {
  const db = getDb();
  db.prepare(`
    INSERT INTO qualifying_predictions (user_id, round_id, p1, p2, p3, updated_at)
    VALUES (?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(user_id, round_id) DO UPDATE SET
      p1 = excluded.p1, p2 = excluded.p2, p3 = excluded.p3, updated_at = datetime('now')
  `).run(userId, roundId, p1, p2, p3);
}

// Race predictions
export function getRacePrediction(userId: number, roundId: number) {
  const db = getDb();
  return db.prepare(
    'SELECT * FROM race_predictions WHERE user_id = ? AND round_id = ?'
  ).get(userId, roundId) as {
    p1: number; p2: number; p3: number; p4: number; p5: number;
    p6: number; p7: number; p8: number; p9: number; p10: number;
    num_finishers: number;
  } | undefined;
}

export function upsertRacePrediction(
  userId: number, roundId: number,
  positions: number[], numFinishers: number
) {
  const db = getDb();
  db.prepare(`
    INSERT INTO race_predictions (user_id, round_id, p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, num_finishers, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(user_id, round_id) DO UPDATE SET
      p1 = excluded.p1, p2 = excluded.p2, p3 = excluded.p3, p4 = excluded.p4, p5 = excluded.p5,
      p6 = excluded.p6, p7 = excluded.p7, p8 = excluded.p8, p9 = excluded.p9, p10 = excluded.p10,
      num_finishers = excluded.num_finishers, updated_at = datetime('now')
  `).run(userId, roundId, ...positions, numFinishers);
}

// Sprint predictions
export function getSprintPrediction(userId: number, roundId: number) {
  const db = getDb();
  return db.prepare(
    'SELECT * FROM sprint_predictions WHERE user_id = ? AND round_id = ?'
  ).get(userId, roundId) as { p1: number; p2: number; p3: number; p4: number; p5: number } | undefined;
}

export function upsertSprintPrediction(userId: number, roundId: number, positions: number[]) {
  const db = getDb();
  db.prepare(`
    INSERT INTO sprint_predictions (user_id, round_id, p1, p2, p3, p4, p5, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(user_id, round_id) DO UPDATE SET
      p1 = excluded.p1, p2 = excluded.p2, p3 = excluded.p3, p4 = excluded.p4, p5 = excluded.p5,
      updated_at = datetime('now')
  `).run(userId, roundId, ...positions);
}

// Teammate predictions
export function getTeammatePredictions(userId: number) {
  const db = getDb();
  return db.prepare(
    'SELECT team_id, winner_driver_id FROM teammate_predictions WHERE user_id = ?'
  ).all(userId) as { team_id: number; winner_driver_id: number }[];
}

export function upsertTeammatePredictions(userId: number, picks: { teamId: number; driverId: number }[]) {
  const db = getDb();
  const insert = db.prepare(`
    INSERT INTO teammate_predictions (user_id, team_id, winner_driver_id)
    VALUES (?, ?, ?)
    ON CONFLICT(user_id, team_id) DO UPDATE SET winner_driver_id = excluded.winner_driver_id
  `);
  const tx = db.transaction(() => {
    for (const pick of picks) {
      insert.run(userId, pick.teamId, pick.driverId);
    }
  });
  tx();
}

// Season predictions
export function getSeasonPrediction(userId: number, windowNumber: number) {
  const db = getDb();
  return db.prepare(
    'SELECT * FROM season_predictions WHERE user_id = ? AND window_number = ?'
  ).get(userId, windowNumber) as {
    drivers_champion_id: number;
    constructors_champion_id: number;
    window_number: number;
  } | undefined;
}

export function getSeasonPredictionCount(userId: number) {
  const db = getDb();
  const result = db.prepare(
    'SELECT COUNT(*) as count FROM season_predictions WHERE user_id = ?'
  ).get(userId) as { count: number };
  return result.count;
}

export function upsertSeasonPrediction(
  userId: number, windowNumber: number,
  driversChampionId: number, constructorsChampionId: number
) {
  const db = getDb();
  db.prepare(`
    INSERT INTO season_predictions (user_id, window_number, drivers_champion_id, constructors_champion_id)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(user_id, window_number) DO UPDATE SET
      drivers_champion_id = excluded.drivers_champion_id,
      constructors_champion_id = excluded.constructors_champion_id
  `).run(userId, windowNumber, driversChampionId, constructorsChampionId);
}
