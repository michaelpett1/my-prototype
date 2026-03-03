-- ============================================================
-- F1 Predictor 2026 — PostgreSQL Schema for Supabase
-- Run this in the Supabase SQL Editor
-- ============================================================

-- Users
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  onboarded BOOLEAN NOT NULL DEFAULT FALSE
);

-- Reference data (explicit IDs from seed)
CREATE TABLE IF NOT EXISTS rounds (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  country TEXT NOT NULL,
  qualifying_date TEXT NOT NULL,
  race_date TEXT NOT NULL,
  is_sprint BOOLEAN NOT NULL DEFAULT FALSE,
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

-- Predictions
CREATE TABLE IF NOT EXISTS qualifying_predictions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  round_id INTEGER NOT NULL REFERENCES rounds(id),
  p1 INTEGER NOT NULL REFERENCES drivers(id),
  p2 INTEGER NOT NULL REFERENCES drivers(id),
  p3 INTEGER NOT NULL REFERENCES drivers(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, round_id)
);

CREATE TABLE IF NOT EXISTS race_predictions (
  id SERIAL PRIMARY KEY,
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
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, round_id)
);

CREATE TABLE IF NOT EXISTS sprint_predictions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  round_id INTEGER NOT NULL REFERENCES rounds(id),
  p1 INTEGER NOT NULL REFERENCES drivers(id),
  p2 INTEGER NOT NULL REFERENCES drivers(id),
  p3 INTEGER NOT NULL REFERENCES drivers(id),
  p4 INTEGER NOT NULL REFERENCES drivers(id),
  p5 INTEGER NOT NULL REFERENCES drivers(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, round_id)
);

CREATE TABLE IF NOT EXISTS teammate_predictions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  team_id INTEGER NOT NULL REFERENCES teams(id),
  winner_driver_id INTEGER NOT NULL REFERENCES drivers(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, team_id)
);

CREATE TABLE IF NOT EXISTS season_predictions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  window_number INTEGER NOT NULL,
  drivers_champion_id INTEGER NOT NULL REFERENCES drivers(id),
  constructors_champion_id INTEGER NOT NULL REFERENCES teams(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, window_number)
);

-- Actual results
CREATE TABLE IF NOT EXISTS actual_qualifying (
  round_id INTEGER PRIMARY KEY REFERENCES rounds(id),
  p1 INTEGER NOT NULL REFERENCES drivers(id),
  p2 INTEGER NOT NULL REFERENCES drivers(id),
  p3 INTEGER NOT NULL REFERENCES drivers(id),
  entered_at TIMESTAMPTZ NOT NULL DEFAULT now()
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
  entered_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS actual_sprint (
  round_id INTEGER PRIMARY KEY REFERENCES rounds(id),
  p1 INTEGER NOT NULL REFERENCES drivers(id),
  p2 INTEGER NOT NULL REFERENCES drivers(id),
  p3 INTEGER NOT NULL REFERENCES drivers(id),
  p4 INTEGER NOT NULL REFERENCES drivers(id),
  p5 INTEGER NOT NULL REFERENCES drivers(id),
  entered_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS actual_champions (
  id INTEGER PRIMARY KEY DEFAULT 1,
  drivers_champion_id INTEGER REFERENCES drivers(id),
  constructors_champion_id INTEGER REFERENCES teams(id),
  entered_at TIMESTAMPTZ
);

-- Scores
CREATE TABLE IF NOT EXISTS scores (
  id SERIAL PRIMARY KEY,
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
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, round_id)
);

-- Leagues
CREATE TABLE IF NOT EXISTS leagues (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  join_code TEXT NOT NULL UNIQUE,
  created_by INTEGER NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS league_members (
  league_id INTEGER NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (league_id, user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_scores_user ON scores(user_id);
CREATE INDEX IF NOT EXISTS idx_scores_round ON scores(round_id);
CREATE INDEX IF NOT EXISTS idx_qual_pred ON qualifying_predictions(user_id, round_id);
CREATE INDEX IF NOT EXISTS idx_race_pred ON race_predictions(user_id, round_id);
CREATE INDEX IF NOT EXISTS idx_sprint_pred ON sprint_predictions(user_id, round_id);
CREATE INDEX IF NOT EXISTS idx_leagues_code ON leagues(join_code);
CREATE INDEX IF NOT EXISTS idx_league_members_user ON league_members(user_id);
CREATE INDEX IF NOT EXISTS idx_league_members_league ON league_members(league_id);

-- ============================================================
-- Seed Data
-- ============================================================

-- Teams
INSERT INTO teams (id, name, short_name, color) VALUES
  (1,  'Red Bull Racing',  'Red Bull',      '#3671C6'),
  (2,  'McLaren',          'McLaren',       '#FF8000'),
  (3,  'Ferrari',          'Ferrari',       '#E8002D'),
  (4,  'Mercedes',         'Mercedes',      '#27F4D2'),
  (5,  'Aston Martin',     'Aston Martin',  '#229971'),
  (6,  'Williams',         'Williams',      '#64C4FF'),
  (7,  'Alpine',           'Alpine',        '#0093CC'),
  (8,  'Racing Bulls',     'RB',            '#6692FF'),
  (9,  'Haas',             'Haas',          '#B6BABD'),
  (10, 'Audi',             'Audi',          '#FF0000'),
  (11, 'Cadillac',         'Cadillac',      '#1E3D2F')
ON CONFLICT (id) DO NOTHING;

-- Drivers
INSERT INTO drivers (id, code, first_name, last_name, team_id, number) VALUES
  (1,  'VER', 'Max',       'Verstappen',  1,  1),
  (2,  'HAD', 'Isack',     'Hadjar',      1,  6),
  (3,  'NOR', 'Lando',     'Norris',      2,  4),
  (4,  'PIA', 'Oscar',     'Piastri',     2,  81),
  (5,  'HAM', 'Lewis',     'Hamilton',    3,  44),
  (6,  'LEC', 'Charles',   'Leclerc',     3,  16),
  (7,  'RUS', 'George',    'Russell',     4,  63),
  (8,  'ANT', 'Kimi',      'Antonelli',   4,  12),
  (9,  'ALO', 'Fernando',  'Alonso',      5,  14),
  (10, 'STR', 'Lance',     'Stroll',      5,  18),
  (11, 'SAI', 'Carlos',    'Sainz',       6,  55),
  (12, 'ALB', 'Alexander', 'Albon',       6,  23),
  (13, 'GAS', 'Pierre',    'Gasly',       7,  10),
  (14, 'COL', 'Franco',    'Colapinto',   7,  43),
  (15, 'LAW', 'Liam',      'Lawson',      8,  30),
  (16, 'LIN', 'Arvid',     'Lindblad',    8,  40),
  (17, 'BEA', 'Oliver',    'Bearman',     9,  87),
  (18, 'OCO', 'Esteban',   'Ocon',        9,  31),
  (19, 'HUL', 'Nico',      'Hülkenberg',  10, 27),
  (20, 'BOR', 'Gabriel',   'Bortoleto',   10, 5),
  (21, 'PER', 'Sergio',    'Pérez',       11, 11),
  (22, 'BOT', 'Valtteri',  'Bottas',      11, 77)
ON CONFLICT (id) DO NOTHING;

-- Rounds
INSERT INTO rounds (id, name, location, country, qualifying_date, race_date, is_sprint, sprint_date) VALUES
  (1,  'Australian Grand Prix',          'Melbourne',     'Australia',      '2026-03-07', '2026-03-08', FALSE, NULL),
  (2,  'Chinese Grand Prix',             'Shanghai',      'China',          '2026-03-14', '2026-03-15', TRUE,  '2026-03-14'),
  (3,  'Japanese Grand Prix',            'Suzuka',        'Japan',          '2026-03-28', '2026-03-29', FALSE, NULL),
  (4,  'Bahrain Grand Prix',             'Sakhir',        'Bahrain',        '2026-04-11', '2026-04-12', FALSE, NULL),
  (5,  'Saudi Arabian Grand Prix',       'Jeddah',        'Saudi Arabia',   '2026-04-18', '2026-04-19', FALSE, NULL),
  (6,  'Miami Grand Prix',               'Miami',         'USA',            '2026-05-02', '2026-05-03', TRUE,  '2026-05-02'),
  (7,  'Canadian Grand Prix',            'Montreal',      'Canada',         '2026-05-23', '2026-05-24', TRUE,  '2026-05-23'),
  (8,  'Monaco Grand Prix',              'Monaco',        'Monaco',         '2026-06-06', '2026-06-07', FALSE, NULL),
  (9,  'Barcelona-Catalunya Grand Prix', 'Barcelona',     'Spain',          '2026-06-13', '2026-06-14', FALSE, NULL),
  (10, 'Austrian Grand Prix',            'Spielberg',     'Austria',        '2026-06-27', '2026-06-28', FALSE, NULL),
  (11, 'British Grand Prix',             'Silverstone',   'United Kingdom', '2026-07-04', '2026-07-05', TRUE,  '2026-07-04'),
  (12, 'Belgian Grand Prix',             'Spa',           'Belgium',        '2026-07-18', '2026-07-19', FALSE, NULL),
  (13, 'Hungarian Grand Prix',           'Budapest',      'Hungary',        '2026-07-25', '2026-07-26', FALSE, NULL),
  (14, 'Dutch Grand Prix',               'Zandvoort',     'Netherlands',    '2026-08-22', '2026-08-23', TRUE,  '2026-08-22'),
  (15, 'Italian Grand Prix',             'Monza',         'Italy',          '2026-09-05', '2026-09-06', FALSE, NULL),
  (16, 'Spanish Grand Prix',             'Madrid',        'Spain',          '2026-09-12', '2026-09-13', FALSE, NULL),
  (17, 'Azerbaijan Grand Prix',          'Baku',          'Azerbaijan',     '2026-09-25', '2026-09-26', FALSE, NULL),
  (18, 'Singapore Grand Prix',           'Singapore',     'Singapore',      '2026-10-10', '2026-10-11', TRUE,  '2026-10-10'),
  (19, 'United States Grand Prix',       'Austin',        'USA',            '2026-10-24', '2026-10-25', FALSE, NULL),
  (20, 'Mexico City Grand Prix',         'Mexico City',   'Mexico',         '2026-10-31', '2026-11-01', FALSE, NULL),
  (21, 'São Paulo Grand Prix',           'São Paulo',     'Brazil',         '2026-11-07', '2026-11-08', FALSE, NULL),
  (22, 'Las Vegas Grand Prix',           'Las Vegas',     'USA',            '2026-11-20', '2026-11-21', FALSE, NULL),
  (23, 'Qatar Grand Prix',               'Lusail',        'Qatar',          '2026-11-28', '2026-11-29', FALSE, NULL),
  (24, 'Abu Dhabi Grand Prix',           'Yas Marina',    'UAE',            '2026-12-05', '2026-12-06', FALSE, NULL)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- RPC Functions
-- ============================================================

-- Global leaderboard
CREATE OR REPLACE FUNCTION get_global_leaderboard()
RETURNS TABLE (
  user_id INTEGER,
  username TEXT,
  qualifying_pts BIGINT,
  qualifying_bonus BIGINT,
  race_pts BIGINT,
  race_bonus BIGINT,
  sprint_pts BIGINT,
  sprint_bonus BIGINT,
  finisher_pts BIGINT,
  total_points BIGINT,
  rounds_played BIGINT
) AS $$
  SELECT
    u.id as user_id, u.username,
    COALESCE(SUM(s.qualifying_pts), 0),
    COALESCE(SUM(s.qualifying_bonus), 0),
    COALESCE(SUM(s.race_pts), 0),
    COALESCE(SUM(s.race_bonus), 0),
    COALESCE(SUM(s.sprint_pts), 0),
    COALESCE(SUM(s.sprint_bonus), 0),
    COALESCE(SUM(s.finisher_pts), 0),
    COALESCE(SUM(s.total), 0),
    COUNT(s.round_id)
  FROM users u
  LEFT JOIN scores s ON u.id = s.user_id
  GROUP BY u.id, u.username
  HAVING COALESCE(SUM(s.total), 0) > 0 OR COUNT(s.round_id) > 0
  ORDER BY COALESCE(SUM(s.total), 0) DESC;
$$ LANGUAGE sql STABLE;

-- League leaderboard
CREATE OR REPLACE FUNCTION get_league_leaderboard(p_league_id INTEGER)
RETURNS TABLE (
  user_id INTEGER,
  username TEXT,
  qualifying_pts BIGINT,
  qualifying_bonus BIGINT,
  race_pts BIGINT,
  race_bonus BIGINT,
  sprint_pts BIGINT,
  sprint_bonus BIGINT,
  finisher_pts BIGINT,
  total_points BIGINT,
  rounds_played BIGINT
) AS $$
  SELECT
    u.id as user_id, u.username,
    COALESCE(SUM(s.qualifying_pts), 0),
    COALESCE(SUM(s.qualifying_bonus), 0),
    COALESCE(SUM(s.race_pts), 0),
    COALESCE(SUM(s.race_bonus), 0),
    COALESCE(SUM(s.sprint_pts), 0),
    COALESCE(SUM(s.sprint_bonus), 0),
    COALESCE(SUM(s.finisher_pts), 0),
    COALESCE(SUM(s.total), 0),
    COUNT(s.round_id)
  FROM league_members lm
  JOIN users u ON u.id = lm.user_id
  LEFT JOIN scores s ON u.id = s.user_id
  WHERE lm.league_id = p_league_id
  GROUP BY u.id, u.username
  ORDER BY COALESCE(SUM(s.total), 0) DESC;
$$ LANGUAGE sql STABLE;

-- User leagues with metadata
CREATE OR REPLACE FUNCTION get_user_leagues(p_user_id INTEGER)
RETURNS TABLE (
  id INTEGER,
  name TEXT,
  join_code TEXT,
  created_by INTEGER,
  created_at TIMESTAMPTZ,
  creator_username TEXT,
  member_count BIGINT
) AS $$
  SELECT
    l.id, l.name, l.join_code, l.created_by, l.created_at,
    u.username as creator_username,
    (SELECT COUNT(*) FROM league_members WHERE league_id = l.id) as member_count
  FROM leagues l
  JOIN league_members lm ON lm.league_id = l.id AND lm.user_id = p_user_id
  JOIN users u ON u.id = l.created_by
  ORDER BY l.created_at DESC;
$$ LANGUAGE sql STABLE;
