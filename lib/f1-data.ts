// F1 2026 Season Static Data

export interface Team {
  id: number;
  name: string;
  shortName: string;
  color: string; // hex color for UI
  logoUrl: string;
}

export interface Driver {
  id: number;
  code: string;
  firstName: string;
  lastName: string;
  teamId: number;
  number: number;
  imageUrl: string;
}

// F1 media CDN helpers — Cloudinary-based URLs
function driverImg(year: number, teamSlug: string, driverCode: string): string {
  return `https://media.formula1.com/image/upload/c_thumb,g_face,w_200,h_200/q_auto/v1740000000/common/f1/${year}/${teamSlug}/${driverCode}/${year}${teamSlug}${driverCode}right.webp`;
}
function teamLogo(teamSlug: string): string {
  return `https://media.formula1.com/image/upload/c_lfill,w_48/q_auto/v1740000000/common/f1/2026/${teamSlug}/2026${teamSlug}logowhite.webp`;
}

export interface Round {
  id: number;
  name: string;
  location: string;
  country: string;
  flag: string; // emoji flag
  qualifyingDate: string; // ISO date (Saturday for GP qualifying)
  raceDate: string;
  isSprint: boolean;
  sprintDate: string | null;
  sprintQualifyingDate: string | null; // Friday (sprint shootout day)
}

export const TEAMS: Team[] = [
  { id: 1,  name: 'Red Bull Racing',  shortName: 'Red Bull',      color: '#3671C6', logoUrl: teamLogo('redbullracing') },
  { id: 2,  name: 'McLaren',          shortName: 'McLaren',       color: '#FF8000', logoUrl: teamLogo('mclaren') },
  { id: 3,  name: 'Ferrari',          shortName: 'Ferrari',       color: '#E8002D', logoUrl: teamLogo('ferrari') },
  { id: 4,  name: 'Mercedes',         shortName: 'Mercedes',      color: '#27F4D2', logoUrl: teamLogo('mercedes') },
  { id: 5,  name: 'Aston Martin',     shortName: 'Aston Martin',  color: '#229971', logoUrl: teamLogo('astonmartin') },
  { id: 6,  name: 'Williams',         shortName: 'Williams',      color: '#64C4FF', logoUrl: teamLogo('williams') },
  { id: 7,  name: 'Alpine',           shortName: 'Alpine',        color: '#0093CC', logoUrl: teamLogo('alpine') },
  { id: 8,  name: 'Racing Bulls',     shortName: 'RB',            color: '#6692FF', logoUrl: teamLogo('racingbulls') },
  { id: 9,  name: 'Haas',             shortName: 'Haas',          color: '#B6BABD', logoUrl: teamLogo('haasf1team') },
  { id: 10, name: 'Audi',             shortName: 'Audi',          color: '#FF0000', logoUrl: teamLogo('audi') },
  { id: 11, name: 'Cadillac',         shortName: 'Cadillac',      color: '#1E3D2F', logoUrl: teamLogo('cadillac') },
];

export const DRIVERS: Driver[] = [
  // Red Bull (Ford)
  { id: 1,  code: 'VER', firstName: 'Max',       lastName: 'Verstappen',  teamId: 1,  number: 1,  imageUrl: driverImg(2025, 'redbullracing', 'maxver01') },
  { id: 2,  code: 'HAD', firstName: 'Isack',     lastName: 'Hadjar',      teamId: 1,  number: 6,  imageUrl: driverImg(2026, 'redbullracing', 'isahad01') },
  // McLaren (Mercedes)
  { id: 3,  code: 'NOR', firstName: 'Lando',     lastName: 'Norris',      teamId: 2,  number: 4,  imageUrl: driverImg(2025, 'mclaren', 'lannor01') },
  { id: 4,  code: 'PIA', firstName: 'Oscar',     lastName: 'Piastri',     teamId: 2,  number: 81, imageUrl: driverImg(2025, 'mclaren', 'oscpia01') },
  // Ferrari
  { id: 5,  code: 'HAM', firstName: 'Lewis',     lastName: 'Hamilton',    teamId: 3,  number: 44, imageUrl: driverImg(2025, 'ferrari', 'lewham01') },
  { id: 6,  code: 'LEC', firstName: 'Charles',   lastName: 'Leclerc',     teamId: 3,  number: 16, imageUrl: driverImg(2025, 'ferrari', 'chalec01') },
  // Mercedes
  { id: 7,  code: 'RUS', firstName: 'George',    lastName: 'Russell',     teamId: 4,  number: 63, imageUrl: driverImg(2025, 'mercedes', 'georus01') },
  { id: 8,  code: 'ANT', firstName: 'Kimi',      lastName: 'Antonelli',   teamId: 4,  number: 12, imageUrl: driverImg(2025, 'mercedes', 'andant01') },
  // Aston Martin (Honda)
  { id: 9,  code: 'ALO', firstName: 'Fernando',  lastName: 'Alonso',      teamId: 5,  number: 14, imageUrl: driverImg(2026, 'astonmartin', 'feralo01') },
  { id: 10, code: 'STR', firstName: 'Lance',     lastName: 'Stroll',      teamId: 5,  number: 18, imageUrl: driverImg(2026, 'astonmartin', 'lanstr01') },
  // Williams (Mercedes)
  { id: 11, code: 'SAI', firstName: 'Carlos',    lastName: 'Sainz',       teamId: 6,  number: 55, imageUrl: driverImg(2025, 'williams', 'carsai01') },
  { id: 12, code: 'ALB', firstName: 'Alexander', lastName: 'Albon',       teamId: 6,  number: 23, imageUrl: driverImg(2025, 'williams', 'alealb01') },
  // Alpine (Mercedes)
  { id: 13, code: 'GAS', firstName: 'Pierre',    lastName: 'Gasly',       teamId: 7,  number: 10, imageUrl: driverImg(2026, 'alpine', 'piegas01') },
  { id: 14, code: 'COL', firstName: 'Franco',    lastName: 'Colapinto',   teamId: 7,  number: 43, imageUrl: driverImg(2026, 'alpine', 'fracol01') },
  // Racing Bulls (Ford)
  { id: 15, code: 'LAW', firstName: 'Liam',      lastName: 'Lawson',      teamId: 8,  number: 30, imageUrl: driverImg(2025, 'racingbulls', 'lialaw01') },
  { id: 16, code: 'LIN', firstName: 'Arvid',     lastName: 'Lindblad',    teamId: 8,  number: 40, imageUrl: driverImg(2026, 'racingbulls', 'arvlin01') },
  // Haas (Ferrari)
  { id: 17, code: 'BEA', firstName: 'Oliver',    lastName: 'Bearman',     teamId: 9,  number: 87, imageUrl: driverImg(2025, 'haasf1team', 'olibea01') },
  { id: 18, code: 'OCO', firstName: 'Esteban',   lastName: 'Ocon',        teamId: 9,  number: 31, imageUrl: driverImg(2025, 'haasf1team', 'estoco01') },
  // Audi
  { id: 19, code: 'HUL', firstName: 'Nico',      lastName: 'Hülkenberg',  teamId: 10, number: 27, imageUrl: driverImg(2026, 'audi', 'nichul01') },
  { id: 20, code: 'BOR', firstName: 'Gabriel',   lastName: 'Bortoleto',   teamId: 10, number: 5,  imageUrl: driverImg(2026, 'audi', 'gabbor01') },
  // Cadillac (Ferrari)
  { id: 21, code: 'PER', firstName: 'Sergio',    lastName: 'Pérez',       teamId: 11, number: 11, imageUrl: driverImg(2026, 'cadillac', 'serper01') },
  { id: 22, code: 'BOT', firstName: 'Valtteri',  lastName: 'Bottas',      teamId: 11, number: 77, imageUrl: driverImg(2026, 'cadillac', 'valbot01') },
];

export const ROUNDS: Round[] = [
  // Sprint weekends: R2 Chinese, R6 Miami, R7 Canadian, R11 British, R14 Dutch, R18 Singapore
  // Standard weekend: Qualifying = Saturday, Race = Sunday
  // Sprint weekend: Sprint Qualifying = Friday, Sprint = Saturday, Qualifying = Saturday, Race = Sunday
  // Azerbaijan: Race on Saturday (Remembrance Day accommodation)
  { id: 1,  name: 'Australian Grand Prix',          location: 'Melbourne',       country: 'Australia',      flag: '🇦🇺', qualifyingDate: '2026-03-07', raceDate: '2026-03-08', isSprint: false, sprintDate: null, sprintQualifyingDate: null },
  { id: 2,  name: 'Chinese Grand Prix',             location: 'Shanghai',        country: 'China',          flag: '🇨🇳', qualifyingDate: '2026-03-14', raceDate: '2026-03-15', isSprint: true,  sprintDate: '2026-03-14', sprintQualifyingDate: '2026-03-13' },
  { id: 3,  name: 'Japanese Grand Prix',            location: 'Suzuka',          country: 'Japan',          flag: '🇯🇵', qualifyingDate: '2026-03-28', raceDate: '2026-03-29', isSprint: false, sprintDate: null, sprintQualifyingDate: null },
  { id: 4,  name: 'Bahrain Grand Prix',             location: 'Sakhir',          country: 'Bahrain',        flag: '🇧🇭', qualifyingDate: '2026-04-11', raceDate: '2026-04-12', isSprint: false, sprintDate: null, sprintQualifyingDate: null },
  { id: 5,  name: 'Saudi Arabian Grand Prix',       location: 'Jeddah',          country: 'Saudi Arabia',   flag: '🇸🇦', qualifyingDate: '2026-04-18', raceDate: '2026-04-19', isSprint: false, sprintDate: null, sprintQualifyingDate: null },
  { id: 6,  name: 'Miami Grand Prix',               location: 'Miami',           country: 'USA',            flag: '🇺🇸', qualifyingDate: '2026-05-02', raceDate: '2026-05-03', isSprint: true,  sprintDate: '2026-05-02', sprintQualifyingDate: '2026-05-01' },
  { id: 7,  name: 'Canadian Grand Prix',            location: 'Montreal',        country: 'Canada',         flag: '🇨🇦', qualifyingDate: '2026-05-23', raceDate: '2026-05-24', isSprint: true,  sprintDate: '2026-05-23', sprintQualifyingDate: '2026-05-22' },
  { id: 8,  name: 'Monaco Grand Prix',              location: 'Monaco',          country: 'Monaco',         flag: '🇲🇨', qualifyingDate: '2026-06-06', raceDate: '2026-06-07', isSprint: false, sprintDate: null, sprintQualifyingDate: null },
  { id: 9,  name: 'Barcelona-Catalunya Grand Prix', location: 'Barcelona',       country: 'Spain',          flag: '🇪🇸', qualifyingDate: '2026-06-13', raceDate: '2026-06-14', isSprint: false, sprintDate: null, sprintQualifyingDate: null },
  { id: 10, name: 'Austrian Grand Prix',            location: 'Spielberg',       country: 'Austria',        flag: '🇦🇹', qualifyingDate: '2026-06-27', raceDate: '2026-06-28', isSprint: false, sprintDate: null, sprintQualifyingDate: null },
  { id: 11, name: 'British Grand Prix',             location: 'Silverstone',     country: 'United Kingdom', flag: '🇬🇧', qualifyingDate: '2026-07-04', raceDate: '2026-07-05', isSprint: true,  sprintDate: '2026-07-04', sprintQualifyingDate: '2026-07-03' },
  { id: 12, name: 'Belgian Grand Prix',             location: 'Spa',             country: 'Belgium',        flag: '🇧🇪', qualifyingDate: '2026-07-18', raceDate: '2026-07-19', isSprint: false, sprintDate: null, sprintQualifyingDate: null },
  { id: 13, name: 'Hungarian Grand Prix',           location: 'Budapest',        country: 'Hungary',        flag: '🇭🇺', qualifyingDate: '2026-07-25', raceDate: '2026-07-26', isSprint: false, sprintDate: null, sprintQualifyingDate: null },
  { id: 14, name: 'Dutch Grand Prix',               location: 'Zandvoort',       country: 'Netherlands',    flag: '🇳🇱', qualifyingDate: '2026-08-22', raceDate: '2026-08-23', isSprint: true,  sprintDate: '2026-08-22', sprintQualifyingDate: '2026-08-21' },
  { id: 15, name: 'Italian Grand Prix',             location: 'Monza',           country: 'Italy',          flag: '🇮🇹', qualifyingDate: '2026-09-05', raceDate: '2026-09-06', isSprint: false, sprintDate: null, sprintQualifyingDate: null },
  { id: 16, name: 'Spanish Grand Prix',             location: 'Madrid',          country: 'Spain',          flag: '🇪🇸', qualifyingDate: '2026-09-12', raceDate: '2026-09-13', isSprint: false, sprintDate: null, sprintQualifyingDate: null },
  { id: 17, name: 'Azerbaijan Grand Prix',          location: 'Baku',            country: 'Azerbaijan',     flag: '🇦🇿', qualifyingDate: '2026-09-25', raceDate: '2026-09-26', isSprint: false, sprintDate: null, sprintQualifyingDate: null },
  { id: 18, name: 'Singapore Grand Prix',           location: 'Singapore',       country: 'Singapore',      flag: '🇸🇬', qualifyingDate: '2026-10-10', raceDate: '2026-10-11', isSprint: true,  sprintDate: '2026-10-10', sprintQualifyingDate: '2026-10-09' },
  { id: 19, name: 'United States Grand Prix',       location: 'Austin',          country: 'USA',            flag: '🇺🇸', qualifyingDate: '2026-10-24', raceDate: '2026-10-25', isSprint: false, sprintDate: null, sprintQualifyingDate: null },
  { id: 20, name: 'Mexico City Grand Prix',         location: 'Mexico City',     country: 'Mexico',         flag: '🇲🇽', qualifyingDate: '2026-10-31', raceDate: '2026-11-01', isSprint: false, sprintDate: null, sprintQualifyingDate: null },
  { id: 21, name: 'São Paulo Grand Prix',           location: 'São Paulo',       country: 'Brazil',         flag: '🇧🇷', qualifyingDate: '2026-11-07', raceDate: '2026-11-08', isSprint: false, sprintDate: null, sprintQualifyingDate: null },
  { id: 22, name: 'Las Vegas Grand Prix',           location: 'Las Vegas',       country: 'USA',            flag: '🇺🇸', qualifyingDate: '2026-11-20', raceDate: '2026-11-21', isSprint: false, sprintDate: null, sprintQualifyingDate: null },
  { id: 23, name: 'Qatar Grand Prix',               location: 'Lusail',          country: 'Qatar',          flag: '🇶🇦', qualifyingDate: '2026-11-28', raceDate: '2026-11-29', isSprint: false, sprintDate: null, sprintQualifyingDate: null },
  { id: 24, name: 'Abu Dhabi Grand Prix',           location: 'Yas Marina',      country: 'UAE',            flag: '🇦🇪', qualifyingDate: '2026-12-05', raceDate: '2026-12-06', isSprint: false, sprintDate: null, sprintQualifyingDate: null },
];

// Season standings prediction windows (before these rounds)
export const SEASON_PREDICTION_WINDOWS = [1, 7, 13, 19];

// Sprint round IDs for quick lookup
export const SPRINT_ROUNDS = ROUNDS.filter(r => r.isSprint).map(r => r.id);

// Helper: get driver's full name
export function driverFullName(driver: Driver): string {
  return `${driver.firstName} ${driver.lastName}`;
}

// Helper: get team by ID
export function getTeam(teamId: number): Team | undefined {
  return TEAMS.find(t => t.id === teamId);
}

// Helper: get driver by ID
export function getDriver(driverId: number): Driver | undefined {
  return DRIVERS.find(d => d.id === driverId);
}

// Helper: get drivers for a team
export function getTeamDrivers(teamId: number): Driver[] {
  return DRIVERS.filter(d => d.teamId === teamId);
}

// Helper: get the date predictions lock for a round
// Sprint weekends: lock when sprint qualifying starts (Friday)
// Normal weekends: lock when qualifying starts (Saturday)
export function getLockDate(round: Round): string {
  if (round.isSprint && round.sprintQualifyingDate) {
    return round.sprintQualifyingDate;
  }
  return round.qualifyingDate;
}

// Helper: check if predictions are locked for a round
export function isPredictionLocked(round: Round): boolean {
  const today = new Date().toISOString().split('T')[0];
  return today >= getLockDate(round);
}
