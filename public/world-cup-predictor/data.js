// World Cup Predictor — sample data (aligned to PF Spec, GDCU-8935)
// Scoring: 3 pts exact score · 1 pt correct W/D/L · 0 miss
// Outrights: Winner 10 · 2nd 5 · 3rd 3 · Golden Boot 10
// Tiebreaker: combined closeness to Total Tournament Goals + Total Tournament Cards
// Prize pool: £10,000 — £5k / £2k / £1k / £500×2 / £200×5

const TEAMS = {
  ENG: { name: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', short: 'ENG', form: 'WWDLW' },
  USA: { name: 'USA', flag: '🇺🇸', short: 'USA', form: 'WLWWD' },
  ARG: { name: 'Argentina', flag: '🇦🇷', short: 'ARG', form: 'WWWLW' },
  BRA: { name: 'Brazil', flag: '🇧🇷', short: 'BRA', form: 'WDWWW' },
  FRA: { name: 'France', flag: '🇫🇷', short: 'FRA', form: 'WWLWW' },
  GER: { name: 'Germany', flag: '🇩🇪', short: 'GER', form: 'DWLWW' },
  ESP: { name: 'Spain', flag: '🇪🇸', short: 'ESP', form: 'WWWWD' },
  POR: { name: 'Portugal', flag: '🇵🇹', short: 'POR', form: 'WWLWD' },
  NED: { name: 'Netherlands', flag: '🇳🇱', short: 'NED', form: 'WDWLW' },
  BEL: { name: 'Belgium', flag: '🇧🇪', short: 'BEL', form: 'DLWWW' },
  CRO: { name: 'Croatia', flag: '🇭🇷', short: 'CRO', form: 'LWDWW' },
  MEX: { name: 'Mexico', flag: '🇲🇽', short: 'MEX', form: 'WWLDW' },
  CAN: { name: 'Canada', flag: '🇨🇦', short: 'CAN', form: 'DWLWL' },
  JPN: { name: 'Japan', flag: '🇯🇵', short: 'JPN', form: 'WWDWL' },
  MAR: { name: 'Morocco', flag: '🇲🇦', short: 'MAR', form: 'WDWLW' },
  KSA: { name: 'Saudi Arabia', flag: '🇸🇦', short: 'KSA', form: 'LDWWL' },
  URU: { name: 'Uruguay', flag: '🇺🇾', short: 'URU', form: 'WLWDW' },
  COL: { name: 'Colombia', flag: '🇨🇴', short: 'COL', form: 'WWDLW' },
  SEN: { name: 'Senegal', flag: '🇸🇳', short: 'SEN', form: 'WLDWW' },
  KOR: { name: 'S. Korea', flag: '🇰🇷', short: 'KOR', form: 'DLWWD' },
  ITA: { name: 'Italy', flag: '🇮🇹', short: 'ITA', form: 'WWWDL' },
  DEN: { name: 'Denmark', flag: '🇩🇰', short: 'DEN', form: 'LWDWW' },
  SUI: { name: 'Switzerland', flag: '🇨🇭', short: 'SUI', form: 'WDWLW' },
  POL: { name: 'Poland', flag: '🇵🇱', short: 'POL', form: 'DWLDW' },
  AUS: { name: 'Australia', flag: '🇦🇺', short: 'AUS', form: 'WLDWL' },
  IRN: { name: 'Iran', flag: '🇮🇷', short: 'IRN', form: 'DWLWD' },
  NOR: { name: 'Norway', flag: '🇳🇴', short: 'NOR', form: 'WWLDW' },
  CHL: { name: 'Chile', flag: '🇨🇱', short: 'CHL', form: 'LDWWL' },
  AUT: { name: 'Austria', flag: '🇦🇹', short: 'AUT', form: 'WDWLW' },
  EGY: { name: 'Egypt', flag: '🇪🇬', short: 'EGY', form: 'WLWDW' },
  SRB: { name: 'Serbia', flag: '🇷🇸', short: 'SRB', form: 'DWWLW' },
  GHA: { name: 'Ghana', flag: '🇬🇭', short: 'GHA', form: 'LWDWL' },
};

// Group stage fixtures — full 48-match schedule (8 groups of 4 × 6 matches).
// Mix of finished / live / open states so scoring + interactions can be demoed.
const FIXTURES = [
  // ───────── Group A — MEX, CAN, GER, POL ─────────
  { id: 'm-A-1', group: 'A', md: 1, kickoff: 'Final', date: 'Yesterday', home: 'GER', away: 'POL', myPick: { h: 2, a: 1 }, actual: { h: 2, a: 1 }, status: 'final', earned: 3, rule: 'exact' },
  { id: 'm-A-2', group: 'A', md: 1, kickoff: "LIVE · 67'", date: 'Today',   home: 'MEX', away: 'CAN', live: { h: 1, a: 1 }, status: 'live' },
  { id: 'm-A-3', group: 'A', md: 2, kickoff: 'Sat 14:00', date: 'Saturday', home: 'MEX', away: 'GER', status: 'open' },
  { id: 'm-A-4', group: 'A', md: 2, kickoff: 'Sat 17:00', date: 'Saturday', home: 'POL', away: 'CAN', status: 'open' },
  { id: 'm-A-5', group: 'A', md: 3, kickoff: 'Wed 20:00', date: 'Wed',      home: 'MEX', away: 'POL', status: 'open' },
  { id: 'm-A-6', group: 'A', md: 3, kickoff: 'Wed 20:00', date: 'Wed',      home: 'CAN', away: 'GER', status: 'open' },

  // ───────── Group B — USA, KSA, SUI, DEN ─────────
  { id: 'm-B-1', group: 'B', md: 1, kickoff: 'Final',     date: 'Yesterday', home: 'SUI', away: 'DEN', myPick: { h: 2, a: 0 }, actual: { h: 1, a: 1 }, status: 'final', earned: 0, rule: 'miss' },
  { id: 'm-B-2', group: 'B', md: 1, kickoff: '20:00 ET',  date: 'Today',     home: 'USA', away: 'KSA', status: 'open' },
  { id: 'm-B-3', group: 'B', md: 2, kickoff: 'Sat 12:00', date: 'Saturday',  home: 'USA', away: 'SUI', status: 'open' },
  { id: 'm-B-4', group: 'B', md: 2, kickoff: 'Sat 15:00', date: 'Saturday',  home: 'DEN', away: 'KSA', status: 'open' },
  { id: 'm-B-5', group: 'B', md: 3, kickoff: 'Thu 20:00', date: 'Thu',       home: 'USA', away: 'DEN', status: 'open' },
  { id: 'm-B-6', group: 'B', md: 3, kickoff: 'Thu 20:00', date: 'Thu',       home: 'KSA', away: 'SUI', status: 'open' },

  // ───────── Group C — ENG, JPN, ESP, ITA ─────────
  { id: 'm-C-1', group: 'C', md: 1, kickoff: 'Final',     date: 'Thurs',     home: 'ESP', away: 'ITA', myPick: { h: 1, a: 0 }, actual: { h: 2, a: 1 }, status: 'final', earned: 1, rule: 'result' },
  { id: 'm-C-2', group: 'C', md: 1, kickoff: '14:00 ET',  date: 'Tomorrow',  home: 'ENG', away: 'JPN', status: 'open' },
  { id: 'm-C-3', group: 'C', md: 2, kickoff: 'Sun 14:00', date: 'Sunday',    home: 'ENG', away: 'ESP', status: 'open' },
  { id: 'm-C-4', group: 'C', md: 2, kickoff: 'Sun 17:00', date: 'Sunday',    home: 'JPN', away: 'ITA', status: 'open' },
  { id: 'm-C-5', group: 'C', md: 3, kickoff: 'Fri 20:00', date: 'Fri',       home: 'ENG', away: 'ITA', status: 'open' },
  { id: 'm-C-6', group: 'C', md: 3, kickoff: 'Fri 20:00', date: 'Fri',       home: 'JPN', away: 'ESP', status: 'open' },

  // ───────── Group D — ARG, POR, COL, URU ─────────
  { id: 'm-D-1', group: 'D', md: 1, kickoff: 'Final',     date: 'Thurs',     home: 'COL', away: 'URU', myPick: { h: 1, a: 1 }, actual: { h: 1, a: 1 }, status: 'final', earned: 3, rule: 'exact' },
  { id: 'm-D-2', group: 'D', md: 1, kickoff: '17:00 ET',  date: 'Tomorrow',  home: 'ARG', away: 'POR', status: 'open' },
  { id: 'm-D-3', group: 'D', md: 2, kickoff: 'Mon 14:00', date: 'Monday',    home: 'ARG', away: 'COL', status: 'open' },
  { id: 'm-D-4', group: 'D', md: 2, kickoff: 'Mon 17:00', date: 'Monday',    home: 'POR', away: 'URU', status: 'open' },
  { id: 'm-D-5', group: 'D', md: 3, kickoff: 'Sat 20:00', date: 'Sat',       home: 'ARG', away: 'URU', status: 'open' },
  { id: 'm-D-6', group: 'D', md: 3, kickoff: 'Sat 20:00', date: 'Sat',       home: 'POR', away: 'COL', status: 'open' },

  // ───────── Group E — FRA, CRO, AUS, IRN ─────────
  { id: 'm-E-1', group: 'E', md: 1, kickoff: 'Sun 14:00', date: 'Sunday',    home: 'FRA', away: 'CRO', myPick: { h: 2, a: 1 }, status: 'open' },
  { id: 'm-E-2', group: 'E', md: 1, kickoff: 'Sun 17:00', date: 'Sunday',    home: 'AUS', away: 'IRN', status: 'open' },
  { id: 'm-E-3', group: 'E', md: 2, kickoff: 'Tue 14:00', date: 'Tuesday',   home: 'FRA', away: 'AUS', status: 'open' },
  { id: 'm-E-4', group: 'E', md: 2, kickoff: 'Tue 17:00', date: 'Tuesday',   home: 'IRN', away: 'CRO', status: 'open' },
  { id: 'm-E-5', group: 'E', md: 3, kickoff: 'Sun 20:00', date: 'Sun',       home: 'FRA', away: 'IRN', status: 'open' },
  { id: 'm-E-6', group: 'E', md: 3, kickoff: 'Sun 20:00', date: 'Sun',       home: 'CRO', away: 'AUS', status: 'open' },

  // ───────── Group F — BRA, SEN, NOR, CHL ─────────
  { id: 'm-F-1', group: 'F', md: 1, kickoff: 'Sun 17:00', date: 'Sunday',    home: 'BRA', away: 'SEN', myPick: { h: 3, a: 0 }, status: 'open' },
  { id: 'm-F-2', group: 'F', md: 1, kickoff: 'Sun 20:00', date: 'Sunday',    home: 'NOR', away: 'CHL', status: 'open' },
  { id: 'm-F-3', group: 'F', md: 2, kickoff: 'Wed 14:00', date: 'Wed',       home: 'BRA', away: 'NOR', status: 'open' },
  { id: 'm-F-4', group: 'F', md: 2, kickoff: 'Wed 17:00', date: 'Wed',       home: 'CHL', away: 'SEN', status: 'open' },
  { id: 'm-F-5', group: 'F', md: 3, kickoff: 'Mon 20:00', date: 'Mon',       home: 'BRA', away: 'CHL', status: 'open' },
  { id: 'm-F-6', group: 'F', md: 3, kickoff: 'Mon 20:00', date: 'Mon',       home: 'SEN', away: 'NOR', status: 'open' },

  // ───────── Group G — BEL, MAR, AUT, EGY ─────────
  { id: 'm-G-1', group: 'G', md: 1, kickoff: 'Mon 14:00', date: 'Monday',    home: 'BEL', away: 'MAR', myPick: { h: 2, a: 0 }, status: 'open' },
  { id: 'm-G-2', group: 'G', md: 1, kickoff: 'Mon 17:00', date: 'Monday',    home: 'AUT', away: 'EGY', status: 'open' },
  { id: 'm-G-3', group: 'G', md: 2, kickoff: 'Thu 14:00', date: 'Thursday',  home: 'BEL', away: 'AUT', status: 'open' },
  { id: 'm-G-4', group: 'G', md: 2, kickoff: 'Thu 17:00', date: 'Thursday',  home: 'EGY', away: 'MAR', status: 'open' },
  { id: 'm-G-5', group: 'G', md: 3, kickoff: 'Tue 20:00', date: 'Tue',       home: 'BEL', away: 'EGY', status: 'open' },
  { id: 'm-G-6', group: 'G', md: 3, kickoff: 'Tue 20:00', date: 'Tue',       home: 'MAR', away: 'AUT', status: 'open' },

  // ───────── Group H — NED, KOR, SRB, GHA ─────────
  { id: 'm-H-1', group: 'H', md: 1, kickoff: 'Mon 17:00', date: 'Monday',    home: 'NED', away: 'KOR', status: 'open' },
  { id: 'm-H-2', group: 'H', md: 1, kickoff: 'Mon 20:00', date: 'Monday',    home: 'SRB', away: 'GHA', status: 'open' },
  { id: 'm-H-3', group: 'H', md: 2, kickoff: 'Fri 14:00', date: 'Friday',    home: 'NED', away: 'SRB', status: 'open' },
  { id: 'm-H-4', group: 'H', md: 2, kickoff: 'Fri 17:00', date: 'Friday',    home: 'GHA', away: 'KOR', status: 'open' },
  { id: 'm-H-5', group: 'H', md: 3, kickoff: 'Wed 20:00', date: 'Wed',       home: 'NED', away: 'GHA', status: 'open' },
  { id: 'm-H-6', group: 'H', md: 3, kickoff: 'Wed 20:00', date: 'Wed',       home: 'KOR', away: 'SRB', status: 'open' },
];

// Knockout bracket — sequential unlock states
// states: open (predict now), locked (round not unlocked), tbd (teams not confirmed), final
const KNOCKOUT = {
  R32: {
    label: 'Round of 32',
    state: 'open',           // unlocked, predict now
    unlockedAfter: 'Group stage',
    matches: [
      { id: 'k32-1', home: 'ARG', away: 'KSA', kickoff: 'Sat 12:00', myPick: { h: 2, a: 0 }, status: 'open' },
      { id: 'k32-2', home: 'BRA', away: 'KOR', kickoff: 'Sat 16:00', myPick: { h: 3, a: 1 }, status: 'open' },
      { id: 'k32-3', home: 'ENG', away: 'SEN', kickoff: 'Sun 12:00', myPick: { h: 2, a: 0 }, status: 'open' },
      { id: 'k32-4', home: 'FRA', away: 'POL', kickoff: 'Sun 16:00', status: 'open' },
      { id: 'k32-5', home: 'NED', away: 'USA', kickoff: 'Mon 12:00', myPick: { h: 2, a: 1 }, status: 'open' },
      { id: 'k32-6', home: 'ESP', away: 'JPN', kickoff: 'Mon 16:00', status: 'open' },
      { id: 'k32-7', home: 'POR', away: 'SUI', kickoff: 'Tue 12:00', status: 'open' },
      { id: 'k32-8', home: 'CRO', away: 'BEL', kickoff: 'Tue 16:00', myPick: { h: 1, a: 2 }, status: 'open' },
    ],
  },
  R16: {
    label: 'Round of 16',
    state: 'tbd',            // teams not yet known
    unlockedAfter: 'Round of 32',
    matches: [
      { id: 'k16-1', home: null, away: null, slot: 'Winner k32-1 vs k32-2', kickoff: 'TBD' },
      { id: 'k16-2', home: null, away: null, slot: 'Winner k32-3 vs k32-4', kickoff: 'TBD' },
      { id: 'k16-3', home: null, away: null, slot: 'Winner k32-5 vs k32-6', kickoff: 'TBD' },
      { id: 'k16-4', home: null, away: null, slot: 'Winner k32-7 vs k32-8', kickoff: 'TBD' },
    ],
  },
  QF: {
    label: 'Quarter-finals',
    state: 'locked',
    unlockedAfter: 'Round of 16',
    matches: [
      { id: 'qf-1', slot: 'Winner R16-1 vs R16-2' },
      { id: 'qf-2', slot: 'Winner R16-3 vs R16-4' },
    ],
  },
  SF: {
    label: 'Semi-finals',
    state: 'locked',
    unlockedAfter: 'Quarter-finals',
    matches: [
      { id: 'sf-1', slot: 'Winner QF-1 vs QF-2' },
    ],
  },
  F:  {
    label: 'Final',
    state: 'locked',
    unlockedAfter: 'Semi-finals',
    matches: [
      { id: 'f-1', slot: 'World Cup Final' },
    ],
  },
};

// Outrights — locked at first kick-off of tournament
const OUTRIGHTS = {
  winner:    { teamCode: 'ARG', odds: '+450', pts: 10 },
  second:    { teamCode: 'FRA', odds: '+650', pts: 5 },
  third:     { teamCode: 'BRA', odds: '+550', pts: 3 },
  goldenBoot:{ player: 'Lionel Messi', team: 'ARG', odds: '+1200', pts: 10 },
  tiebreakGoals: 168,
  tiebreakCards: 234,
  topScorers: [
    { name: 'Kylian Mbappé', team: 'FRA', odds: '+650' },
    { name: 'Erling Haaland', team: 'NOR', odds: '+700' },
    { name: 'Lionel Messi', team: 'ARG', odds: '+1200' },
    { name: 'Harry Kane', team: 'ENG', odds: '+800' },
    { name: 'Vinicius Jr.', team: 'BRA', odds: '+900' },
    { name: 'Jude Bellingham', team: 'ENG', odds: '+1400' },
    { name: 'Lautaro Martínez', team: 'ARG', odds: '+1600' },
  ],
};

// Leaderboard — designed to show prize cutoff lines (3rd / 5th / 10th)
const LEADERBOARD = [
  { rank: 1,   name: 'GambleKing94',   loc: 'London, UK',     pts: 247, trend: 'up',   prize: '£5,000' },
  { rank: 2,   name: 'PunditPete',     loc: 'Manchester, UK', pts: 241, trend: 'up',   prize: '£2,000' },
  { rank: 3,   name: 'OddsBoss',       loc: 'Madrid, ES',     pts: 235, trend: 'down', prize: '£1,000' },
  { rank: 4,   name: 'BettingBlue',    loc: 'Toronto, CA',    pts: 229, trend: 'up',   prize: '£500' },
  { rank: 5,   name: 'StrikerStu',     loc: 'Dublin, IE',     pts: 224, trend: 'flat', prize: '£500' },
  { rank: 6,   name: 'CornerKick',     loc: 'Berlin, DE',     pts: 218, trend: 'down', prize: '£200' },
  { rank: 7,   name: 'GoalDigger',     loc: 'New York, US',   pts: 214, trend: 'up',   prize: '£200' },
  { rank: 8,   name: 'ShotCaller',     loc: 'Sydney, AU',     pts: 210, trend: 'up',   prize: '£200' },
  { rank: 9,   name: 'GroupSeed',      loc: 'Lisbon, PT',     pts: 206, trend: 'flat', prize: '£200' },
  { rank: 10,  name: 'KnockoutPete',   loc: 'Paris, FR',      pts: 201, trend: 'down', prize: '£200' },
  // surrounding ranks for "You" anchor
  { rank: 245, name: 'BoltOn',         loc: 'Bristol, UK',    pts: 144, trend: 'flat' },
  { rank: 246, name: 'KitOff',         loc: 'Amsterdam, NL',  pts: 143, trend: 'up' },
  { rank: 247, name: 'You',            loc: 'Cardiff, UK',    pts: 142, trend: 'up', me: true },
  { rank: 248, name: 'PenaltyPaul',    loc: 'Glasgow, UK',    pts: 141, trend: 'down' },
  { rank: 249, name: 'OffsideOlly',    loc: 'Munich, DE',     pts: 140, trend: 'flat' },
];

// Private leagues — invite-link based
const LEAGUES = [
  { id: 'l1', name: 'The Office Sweepstake', members: 14, pos: 3, total: 14, icon: 'O', invite: 'gamb.ly/wcp/office-94k' },
  { id: 'l2', name: 'Pub Quiz Predictors',   members: 8,  pos: 1, total: 8,  icon: 'P', invite: 'gamb.ly/wcp/pub-quiz-7q', winning: true },
  { id: 'l3', name: 'Family World Cup 2026', members: 22, pos: 11, total: 22, icon: 'F', invite: 'gamb.ly/wcp/fam-2026' },
];

// Prize tiers — £10,000 pool per spec
const PRIZES = [
  { rank: '1st',     val: '£5,000', total: 5000, desc: 'Outright winner of the tournament' },
  { rank: '2nd',     val: '£2,000', total: 2000, desc: 'Runner-up' },
  { rank: '3rd',     val: '£1,000', total: 1000, desc: 'Third place' },
  { rank: '4th–5th', val: '£500',   total: 1000, desc: '£500 each · 2 winners' },
  { rank: '6th–10th',val: '£200',   total: 1000, desc: '£200 each · 5 winners' },
];

// Daily Acca CTA — end-of-matchday module
// 4-fold from yesterday's results: shows what £10 would have returned
const DAILY_ACCA = {
  date: 'Yesterday · Matchday 6',
  stake: 10,
  totalOdds: 28.74,
  return: 287.40,
  legs: [
    { home: 'GER', away: 'POL', score: '2–1', selection: 'Germany win',     odds: 1.55 },
    { home: 'SUI', away: 'DEN', score: '1–1', selection: 'Draw',            odds: 3.40 },
    { home: 'ESP', away: 'ITA', score: '2–1', selection: 'Spain win',       odds: 2.10 },
    { home: 'COL', away: 'URU', score: '1–1', selection: 'Both teams score',odds: 2.60 },
  ],
  operator: { name: 'BetMGM', cta: 'Open BetMGM', tagline: '18+ · T&Cs apply · BeGambleAware.org' },
};

// User state — points, rank, predictions tally
const ME = {
  pts: 142,
  rank: 247,
  prizeGap: 'Outside top 10 by 59 pts',
  groupPicks: { done: 9, total: 12 },
  knockoutPicks: { done: 5, total: 8, label: 'R32 unlocked' },
  outrightsDone: true,
  accuracy: { exact: 4, result: 6, miss: 7 }, // 4×3 + 6×1 = 18 from these matches
  trend: '+12 places this week',
};

window.WC_DATA = { TEAMS, FIXTURES, KNOCKOUT, OUTRIGHTS, LEADERBOARD, LEAGUES, PRIZES, DAILY_ACCA, ME };
