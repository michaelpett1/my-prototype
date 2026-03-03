import type Database from 'better-sqlite3';

export function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      onboarded INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS rounds (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      location TEXT NOT NULL,
      country TEXT NOT NULL,
      qualifying_date TEXT NOT NULL,
      race_date TEXT NOT NULL,
      is_sprint INTEGER NOT NULL DEFAULT 0,
      sprint_date TEXT
    );

    CREATE TABLE IF NOT EXISTS teams (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      short_name TEXT NOT NULL,
      color TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS drivers (
      id INTEGER PRIMARY KEY,
      code TEXT NOT NULL UNIQUE,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      team_id INTEGER NOT NULL REFERENCES teams(id),
      number INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS qualifying_predictions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      round_id INTEGER NOT NULL REFERENCES rounds(id),
      p1 INTEGER NOT NULL REFERENCES drivers(id),
      p2 INTEGER NOT NULL REFERENCES drivers(id),
      p3 INTEGER NOT NULL REFERENCES drivers(id),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(user_id, round_id)
    );

    CREATE TABLE IF NOT EXISTS race_predictions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      round_id INTEGER NOT NULL REFERENCES rounds(id),
      p1 INTEGER NOT NULL REFERENCES drivers(id),
      p2 INTEGER NOT NULL REFERENCES drivers(id),
      p3 INTEGER NOT NULL REFERENCES drivers(id),
      p4 INTEGER NOT NULL REFERENCES drivers(id),
      p5 INTEGER NOT NULL REFERENCES drivers(id),
      p6 INTEGER NOT NULL REFERENCES drivers(id),
      p7 INTEGER NOT NULL REFERENCES drivers(id),
      p8 INTEGER NOT NULL REFERENCES drivers(id),
      p9 INTEGER NOT NULL REFERENCES drivers(id),
      p10 INTEGER NOT NULL REFERENCES drivers(id),
      num_finishers INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(user_id, round_id)
    );

    CREATE TABLE IF NOT EXISTS sprint_predictions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      round_id INTEGER NOT NULL REFERENCES rounds(id),
      p1 INTEGER NOT NULL REFERENCES drivers(id),
      p2 INTEGER NOT NULL REFERENCES drivers(id),
      p3 INTEGER NOT NULL REFERENCES drivers(id),
      p4 INTEGER NOT NULL REFERENCES drivers(id),
      p5 INTEGER NOT NULL REFERENCES drivers(id),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(user_id, round_id)
    );

    CREATE TABLE IF NOT EXISTS teammate_predictions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      team_id INTEGER NOT NULL REFERENCES teams(id),
      winner_driver_id INTEGER NOT NULL REFERENCES drivers(id),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(user_id, team_id)
    );

    CREATE TABLE IF NOT EXISTS season_predictions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      window_number INTEGER NOT NULL,
      drivers_champion_id INTEGER NOT NULL REFERENCES drivers(id),
      constructors_champion_id INTEGER NOT NULL REFERENCES teams(id),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(user_id, window_number)
    );

    CREATE TABLE IF NOT EXISTS actual_qualifying (
      round_id INTEGER PRIMARY KEY REFERENCES rounds(id),
      p1 INTEGER NOT NULL REFERENCES drivers(id),
      p2 INTEGER NOT NULL REFERENCES drivers(id),
      p3 INTEGER NOT NULL REFERENCES drivers(id),
      entered_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS actual_race (
      round_id INTEGER PRIMARY KEY REFERENCES rounds(id),
      p1 INTEGER NOT NULL REFERENCES drivers(id),
      p2 INTEGER NOT NULL REFERENCES drivers(id),
      p3 INTEGER NOT NULL REFERENCES drivers(id),
      p4 INTEGER NOT NULL REFERENCES drivers(id),
      p5 INTEGER NOT NULL REFERENCES drivers(id),
      p6 INTEGER NOT NULL REFERENCES drivers(id),
      p7 INTEGER NOT NULL REFERENCES drivers(id),
      p8 INTEGER NOT NULL REFERENCES drivers(id),
      p9 INTEGER NOT NULL REFERENCES drivers(id),
      p10 INTEGER NOT NULL REFERENCES drivers(id),
      num_finishers INTEGER NOT NULL,
      entered_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS actual_sprint (
      round_id INTEGER PRIMARY KEY REFERENCES rounds(id),
      p1 INTEGER NOT NULL REFERENCES drivers(id),
      p2 INTEGER NOT NULL REFERENCES drivers(id),
      p3 INTEGER NOT NULL REFERENCES drivers(id),
      p4 INTEGER NOT NULL REFERENCES drivers(id),
      p5 INTEGER NOT NULL REFERENCES drivers(id),
      entered_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS actual_champions (
      id INTEGER PRIMARY KEY DEFAULT 1,
      drivers_champion_id INTEGER REFERENCES drivers(id),
      constructors_champion_id INTEGER REFERENCES teams(id),
      entered_at TEXT
    );

    CREATE TABLE IF NOT EXISTS scores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      round_id INTEGER NOT NULL REFERENCES rounds(id),
      qualifying_pts INTEGER NOT NULL DEFAULT 0,
      qualifying_bonus INTEGER NOT NULL DEFAULT 0,
      race_pts INTEGER NOT NULL DEFAULT 0,
      race_bonus INTEGER NOT NULL DEFAULT 0,
      sprint_pts INTEGER NOT NULL DEFAULT 0,
      sprint_bonus INTEGER NOT NULL DEFAULT 0,
      finisher_pts INTEGER NOT NULL DEFAULT 0,
      total INTEGER NOT NULL DEFAULT 0,
      computed_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(user_id, round_id)
    );

    CREATE TABLE IF NOT EXISTS leagues (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      join_code TEXT NOT NULL UNIQUE,
      created_by INTEGER NOT NULL REFERENCES users(id),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS league_members (
      league_id INTEGER NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id),
      joined_at TEXT NOT NULL DEFAULT (datetime('now')),
      PRIMARY KEY (league_id, user_id)
    );

    CREATE INDEX IF NOT EXISTS idx_scores_user ON scores(user_id);
    CREATE INDEX IF NOT EXISTS idx_scores_round ON scores(round_id);
    CREATE INDEX IF NOT EXISTS idx_qual_pred ON qualifying_predictions(user_id, round_id);
    CREATE INDEX IF NOT EXISTS idx_race_pred ON race_predictions(user_id, round_id);
    CREATE INDEX IF NOT EXISTS idx_sprint_pred ON sprint_predictions(user_id, round_id);
    CREATE INDEX IF NOT EXISTS idx_leagues_code ON leagues(join_code);
    CREATE INDEX IF NOT EXISTS idx_league_members_user ON league_members(user_id);
    CREATE INDEX IF NOT EXISTS idx_league_members_league ON league_members(league_id);
  `);
}
