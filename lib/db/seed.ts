import type Database from 'better-sqlite3';
import { TEAMS, DRIVERS, ROUNDS } from '../f1-data';

export function seedData(db: Database.Database) {
  // Check if data already exists
  const teamCount = db.prepare('SELECT COUNT(*) as count FROM teams').get() as { count: number };
  if (teamCount.count > 0) return;

  const insertTeam = db.prepare(
    'INSERT OR IGNORE INTO teams (id, name, short_name, color) VALUES (?, ?, ?, ?)'
  );
  const insertDriver = db.prepare(
    'INSERT OR IGNORE INTO drivers (id, code, first_name, last_name, team_id, number) VALUES (?, ?, ?, ?, ?, ?)'
  );
  const insertRound = db.prepare(
    'INSERT OR IGNORE INTO rounds (id, name, location, country, qualifying_date, race_date, is_sprint, sprint_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  );

  const seedAll = db.transaction(() => {
    for (const team of TEAMS) {
      insertTeam.run(team.id, team.name, team.shortName, team.color);
    }
    for (const driver of DRIVERS) {
      insertDriver.run(driver.id, driver.code, driver.firstName, driver.lastName, driver.teamId, driver.number);
    }
    for (const round of ROUNDS) {
      insertRound.run(round.id, round.name, round.location, round.country, round.qualifyingDate, round.raceDate, round.isSprint ? 1 : 0, round.sprintDate);
    }
  });

  seedAll();
}
