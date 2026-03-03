// Scoring Engine — Pure functions for calculating prediction scores

export interface PositionScore {
  position: number;
  predictedDriverId: number;
  actualDriverId: number;
  points: number;
  status: 'exact' | 'partial' | 'miss'; // green / amber / grey
}

export interface QualifyingScore {
  positions: PositionScore[];
  subtotal: number;
  bonus: number; // +5 for perfect
  total: number;
}

export interface RaceScore {
  positions: PositionScore[];
  subtotal: number;
  bonus: number; // +50 for perfect
  finisherPoints: number;
  total: number;
}

export interface SprintScore {
  positions: PositionScore[];
  subtotal: number;
  bonus: number; // +10 for perfect
  total: number;
}

function scorePosition(
  predicted: number,
  actual: number[],
  position: number, // 0-indexed
  topN: number,
  pointsExact: number,
  pointsPartial: number,
): PositionScore {
  const predictedDriverId = predicted;
  const actualDriverId = actual[position];

  if (predictedDriverId === actualDriverId) {
    return { position: position + 1, predictedDriverId, actualDriverId, points: pointsExact, status: 'exact' };
  }

  // Check if driver is in top N but wrong position
  const actualTopN = actual.slice(0, topN);
  if (actualTopN.includes(predictedDriverId)) {
    return { position: position + 1, predictedDriverId, actualDriverId, points: pointsPartial, status: 'partial' };
  }

  return { position: position + 1, predictedDriverId, actualDriverId, points: 0, status: 'miss' };
}

// Qualifying: P1-P3, 3pts exact, 1pt partial (in top 3), +5 bonus perfect
export function scoreQualifying(predicted: number[], actual: number[]): QualifyingScore {
  const positions: PositionScore[] = [];

  for (let i = 0; i < 3; i++) {
    positions.push(scorePosition(predicted[i], actual, i, 3, 3, 1));
  }

  const subtotal = positions.reduce((sum, p) => sum + p.points, 0);
  const allExact = positions.every(p => p.status === 'exact');
  const bonus = allExact ? 5 : 0;

  return { positions, subtotal, bonus, total: subtotal + bonus };
}

// Race: P1-P10, 3pts exact, 1pt partial (in top 10), +50 bonus perfect
export function scoreRace(predicted: number[], actual: number[]): Omit<RaceScore, 'finisherPoints'> & { finisherPoints: number } {
  const positions: PositionScore[] = [];

  for (let i = 0; i < 10; i++) {
    positions.push(scorePosition(predicted[i], actual, i, 10, 3, 1));
  }

  const subtotal = positions.reduce((sum, p) => sum + p.points, 0);
  const allExact = positions.every(p => p.status === 'exact');
  const bonus = allExact ? 50 : 0;

  return { positions, subtotal, bonus, finisherPoints: 0, total: subtotal + bonus };
}

// Sprint: P1-P5, 3pts exact, 1pt partial (in top 5), +10 bonus perfect
export function scoreSprint(predicted: number[], actual: number[]): SprintScore {
  const positions: PositionScore[] = [];

  for (let i = 0; i < 5; i++) {
    positions.push(scorePosition(predicted[i], actual, i, 5, 3, 1));
  }

  const subtotal = positions.reduce((sum, p) => sum + p.points, 0);
  const allExact = positions.every(p => p.status === 'exact');
  const bonus = allExact ? 10 : 0;

  return { positions, subtotal, bonus, total: subtotal + bonus };
}

// Finishers: 5pts if exact match
export function scoreFinishers(predicted: number, actual: number): number {
  return predicted === actual ? 5 : 0;
}

// Teammate battle: 5pts per correct pick
export function scoreTeammateBattle(
  predictedWinnerId: number,
  actualWinnerId: number
): number {
  return predictedWinnerId === actualWinnerId ? 5 : 0;
}

// Season standings: 20pts base, -25% per change window
export function seasonStandingsPoints(changeCount: number): number {
  const base = 20;
  const reduction = Math.pow(0.75, changeCount);
  return Math.round(base * reduction);
}
