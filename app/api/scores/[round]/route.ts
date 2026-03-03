import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import getSupabase from '@/lib/db';
import { ROUNDS } from '@/lib/f1-data';
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
  const supabase = getSupabase();

  // Get actual results
  const { data: qualResults } = await supabase
    .from('actual_qualifying')
    .select('p1, p2, p3')
    .eq('round_id', roundId)
    .maybeSingle();

  const { data: raceResults } = await supabase
    .from('actual_race')
    .select('*')
    .eq('round_id', roundId)
    .maybeSingle();

  const { data: sprintResults } = await supabase
    .from('actual_sprint')
    .select('*')
    .eq('round_id', roundId)
    .maybeSingle();

  if (!qualResults && !raceResults && !sprintResults) {
    return NextResponse.json({ error: 'No results yet for this round' }, { status: 404 });
  }

  let qualifyingBreakdown = null;
  let raceBreakdown = null;
  let sprintBreakdown = null;
  let finisherResult = null;

  // Score qualifying
  if (qualResults) {
    const { data: pred } = await supabase
      .from('qualifying_predictions')
      .select('p1, p2, p3')
      .eq('user_id', userId)
      .eq('round_id', roundId)
      .maybeSingle();
    if (pred) {
      const actual = [qualResults.p1, qualResults.p2, qualResults.p3];
      qualifyingBreakdown = scoreQualifying([pred.p1, pred.p2, pred.p3], actual);
    }
  }

  // Score race
  if (raceResults) {
    const { data: pred } = await supabase
      .from('race_predictions')
      .select('*')
      .eq('user_id', userId)
      .eq('round_id', roundId)
      .maybeSingle();
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
    const { data: pred } = await supabase
      .from('sprint_predictions')
      .select('p1, p2, p3, p4, p5')
      .eq('user_id', userId)
      .eq('round_id', roundId)
      .maybeSingle();
    if (pred) {
      const actual = [sprintResults.p1, sprintResults.p2, sprintResults.p3, sprintResults.p4, sprintResults.p5];
      sprintBreakdown = scoreSprint([pred.p1, pred.p2, pred.p3, pred.p4, pred.p5], actual);
    }
  }

  // Get stored total
  const { data: storedScore } = await supabase
    .from('scores')
    .select('total')
    .eq('user_id', userId)
    .eq('round_id', roundId)
    .maybeSingle();

  return NextResponse.json({
    roundId,
    qualifying: qualifyingBreakdown,
    race: raceBreakdown,
    sprint: sprintBreakdown,
    finisher: finisherResult,
    total: storedScore?.total || 0,
  });
}
