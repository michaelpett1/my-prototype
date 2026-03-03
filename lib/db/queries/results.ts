import getDb from '../index';
import { scoreQualifying, scoreRace, scoreSprint, scoreFinishers } from '../../scoring';

// Insert actual results
export function insertQualifyingResults(roundId: number, p1: number, p2: number, p3: number) {
  const db = getDb();
  db.prepare(`
    INSERT INTO actual_qualifying (round_id, p1, p2, p3)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(round_id) DO UPDATE SET p1 = excluded.p1, p2 = excluded.p2, p3 = excluded.p3
  `).run(roundId, p1, p2, p3);
}

export function insertRaceResults(roundId: number, positions: number[], numFinishers: number) {
  const db = getDb();
  db.prepare(`
    INSERT INTO actual_race (round_id, p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, num_finishers)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(round_id) DO UPDATE SET
      p1=excluded.p1, p2=excluded.p2, p3=excluded.p3, p4=excluded.p4, p5=excluded.p5,
      p6=excluded.p6, p7=excluded.p7, p8=excluded.p8, p9=excluded.p9, p10=excluded.p10,
      num_finishers=excluded.num_finishers
  `).run(roundId, ...positions, numFinishers);
}

export function insertSprintResults(roundId: number, positions: number[]) {
  const db = getDb();
  db.prepare(`
    INSERT INTO actual_sprint (round_id, p1, p2, p3, p4, p5)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(round_id) DO UPDATE SET
      p1=excluded.p1, p2=excluded.p2, p3=excluded.p3, p4=excluded.p4, p5=excluded.p5
  `).run(roundId, ...positions);
}

// Get actual results
export function getQualifyingResults(roundId: number) {
  const db = getDb();
  return db.prepare('SELECT * FROM actual_qualifying WHERE round_id = ?').get(roundId) as {
    p1: number; p2: number; p3: number;
  } | undefined;
}

export function getRaceResults(roundId: number) {
  const db = getDb();
  return db.prepare('SELECT * FROM actual_race WHERE round_id = ?').get(roundId) as {
    p1: number; p2: number; p3: number; p4: number; p5: number;
    p6: number; p7: number; p8: number; p9: number; p10: number;
    num_finishers: number;
  } | undefined;
}

export function getSprintResults(roundId: number) {
  const db = getDb();
  return db.prepare('SELECT * FROM actual_sprint WHERE round_id = ?').get(roundId) as {
    p1: number; p2: number; p3: number; p4: number; p5: number;
  } | undefined;
}

// Calculate and store scores for all users for a round
export function calculateScoresForRound(roundId: number) {
  const db = getDb();

  const qualResults = getQualifyingResults(roundId);
  const raceResults = getRaceResults(roundId);
  const sprintResults = getSprintResults(roundId);

  if (!qualResults && !raceResults && !sprintResults) return;

  // Get all users with predictions for this round
  const userIds = new Set<number>();

  const qualPreds = db.prepare('SELECT DISTINCT user_id FROM qualifying_predictions WHERE round_id = ?').all(roundId) as { user_id: number }[];
  const racePreds = db.prepare('SELECT DISTINCT user_id FROM race_predictions WHERE round_id = ?').all(roundId) as { user_id: number }[];
  const sprintPreds = db.prepare('SELECT DISTINCT user_id FROM sprint_predictions WHERE round_id = ?').all(roundId) as { user_id: number }[];

  qualPreds.forEach(r => userIds.add(r.user_id));
  racePreds.forEach(r => userIds.add(r.user_id));
  sprintPreds.forEach(r => userIds.add(r.user_id));

  const upsertScore = db.prepare(`
    INSERT INTO scores (user_id, round_id, qualifying_pts, qualifying_bonus, race_pts, race_bonus, sprint_pts, sprint_bonus, finisher_pts, total)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(user_id, round_id) DO UPDATE SET
      qualifying_pts=excluded.qualifying_pts, qualifying_bonus=excluded.qualifying_bonus,
      race_pts=excluded.race_pts, race_bonus=excluded.race_bonus,
      sprint_pts=excluded.sprint_pts, sprint_bonus=excluded.sprint_bonus,
      finisher_pts=excluded.finisher_pts, total=excluded.total,
      computed_at=datetime('now')
  `);

  const tx = db.transaction(() => {
    for (const userId of userIds) {
      let qualPts = 0, qualBonus = 0;
      let racePts = 0, raceBonus = 0;
      let sprintPts = 0, sprintBonus = 0;
      let finisherPts = 0;

      // Score qualifying
      if (qualResults) {
        const pred = db.prepare('SELECT p1, p2, p3 FROM qualifying_predictions WHERE user_id = ? AND round_id = ?').get(userId, roundId) as { p1: number; p2: number; p3: number } | undefined;
        if (pred) {
          const actual = [qualResults.p1, qualResults.p2, qualResults.p3];
          const score = scoreQualifying([pred.p1, pred.p2, pred.p3], actual);
          qualPts = score.subtotal;
          qualBonus = score.bonus;
        }
      }

      // Score race
      if (raceResults) {
        const pred = db.prepare('SELECT * FROM race_predictions WHERE user_id = ? AND round_id = ?').get(userId, roundId) as {
          p1: number; p2: number; p3: number; p4: number; p5: number;
          p6: number; p7: number; p8: number; p9: number; p10: number;
          num_finishers: number;
        } | undefined;
        if (pred) {
          const actual = [raceResults.p1, raceResults.p2, raceResults.p3, raceResults.p4, raceResults.p5, raceResults.p6, raceResults.p7, raceResults.p8, raceResults.p9, raceResults.p10];
          const predicted = [pred.p1, pred.p2, pred.p3, pred.p4, pred.p5, pred.p6, pred.p7, pred.p8, pred.p9, pred.p10];
          const score = scoreRace(predicted, actual);
          racePts = score.subtotal;
          raceBonus = score.bonus;
          finisherPts = scoreFinishers(pred.num_finishers, raceResults.num_finishers);
        }
      }

      // Score sprint
      if (sprintResults) {
        const pred = db.prepare('SELECT p1, p2, p3, p4, p5 FROM sprint_predictions WHERE user_id = ? AND round_id = ?').get(userId, roundId) as { p1: number; p2: number; p3: number; p4: number; p5: number } | undefined;
        if (pred) {
          const actual = [sprintResults.p1, sprintResults.p2, sprintResults.p3, sprintResults.p4, sprintResults.p5];
          const score = scoreSprint([pred.p1, pred.p2, pred.p3, pred.p4, pred.p5], actual);
          sprintPts = score.subtotal;
          sprintBonus = score.bonus;
        }
      }

      const total = qualPts + qualBonus + racePts + raceBonus + sprintPts + sprintBonus + finisherPts;
      upsertScore.run(userId, roundId, qualPts, qualBonus, racePts, raceBonus, sprintPts, sprintBonus, finisherPts, total);
    }
  });

  tx();
}
