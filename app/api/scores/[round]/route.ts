import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import getDb from '@/lib/db';
import { ROUNDS } from '@/lib/f1-data';
import {
  getQualifyingResults,
  getRaceResults,
  getSprintResults,
} from '@/lib/db/queries/results';
import {
  scoreQualifying,
  scoreRace,
  scoreSprint,
  scoreFinishers,
} from '@/lib/scoring';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ round: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { round } = await params;
  const roundId = parseInt(round);
  const roundData = ROUNDS.find(r => r.id === roundId);
  if (!roundData) {
    return NextResponse.json({ error: 'Round not found' }, { status: 404 });
  }

  const userId = parseInt(session.user.id!);
  const db = getDb();

  const qualResults = getQualifyingResults(roundId);
  const raceResults = getRaceResults(roundId);
  const sprintResults = getSprintResults(roundId);

  if (!qualResults && !raceResults && !sprintResults) {
    return NextResponse.json({ error: 'No results yet for this round' }, { status: 404 });
  }

  let qualifyingBreakdown = null;
  let raceBreakdown = null;
  let sprintBreakdown = null;
  let finisherResult = null;

  // Score qualifying
  if (qualResults) {
    const pred = db.prepare('SELECT p1, p2, p3 FROM qualifying_predictions WHERE user_id = ? AND round_id = ?').get(userId, roundId) as { p1: number; p2: number; p3: number } | undefined;
    if (pred) {
      const actual = [qualResults.p1, qualResults.p2, qualResults.p3];
      qualifyingBreakdown = scoreQualifying([pred.p1, pred.p2, pred.p3], actual);
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
      const actual = [raceResults.p1, raceResults.p2, raceResults.p3, raceResults.p4, raceResults.p5,
        raceResults.p6, raceResults.p7, raceResults.p8, raceResults.p9, raceResults.p10];
      const predicted = [pred.p1, pred.p2, pred.p3, pred.p4, pred.p5, pred.p6, pred.p7, pred.p8, pred.p9, pred.p10];
      raceBreakdown = scoreRace(predicted, actual);
      finisherResult = {
        predicted: pred.num_finishers,
        actual: raceResults.num_finishers,
        points: scoreFinishers(pred.num_finishers, raceResults.num_finishers),
      };
    }
  }

  // Score sprint
  if (sprintResults) {
    const pred = db.prepare('SELECT p1, p2, p3, p4, p5 FROM sprint_predictions WHERE user_id = ? AND round_id = ?').get(userId, roundId) as { p1: number; p2: number; p3: number; p4: number; p5: number } | undefined;
    if (pred) {
      const actual = [sprintResults.p1, sprintResults.p2, sprintResults.p3, sprintResults.p4, sprintResults.p5];
      sprintBreakdown = scoreSprint([pred.p1, pred.p2, pred.p3, pred.p4, pred.p5], actual);
    }
  }

  // Get stored total
  const storedScore = db.prepare('SELECT total FROM scores WHERE user_id = ? AND round_id = ?').get(userId, roundId) as { total: number } | undefined;

  return NextResponse.json({
    roundId,
    qualifying: qualifyingBreakdown,
    race: raceBreakdown,
    sprint: sprintBreakdown,
    finisher: finisherResult,
    total: storedScore?.total || 0,
  });
}
