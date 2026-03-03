import getSupabase from '../index';
import { scoreQualifying, scoreRace, scoreSprint, scoreFinishers } from '../../scoring';

// Insert actual results
export async function insertQualifyingResults(roundId: number, p1: number, p2: number, p3: number) {
  const supabase = getSupabase();
  await supabase
    .from('actual_qualifying')
    .upsert(
      { round_id: roundId, p1, p2, p3 },
      { onConflict: 'round_id' }
    );
}

export async function insertRaceResults(roundId: number, positions: number[], numFinishers: number) {
  const supabase = getSupabase();
  await supabase
    .from('actual_race')
    .upsert(
      {
        round_id: roundId,
        p1: positions[0],
        p2: positions[1],
        p3: positions[2],
        p4: positions[3],
        p5: positions[4],
        p6: positions[5],
        p7: positions[6],
        p8: positions[7],
        p9: positions[8],
        p10: positions[9],
        num_finishers: numFinishers,
      },
      { onConflict: 'round_id' }
    );
}

export async function insertSprintResults(roundId: number, positions: number[]) {
  const supabase = getSupabase();
  await supabase
    .from('actual_sprint')
    .upsert(
      {
        round_id: roundId,
        p1: positions[0],
        p2: positions[1],
        p3: positions[2],
        p4: positions[3],
        p5: positions[4],
      },
      { onConflict: 'round_id' }
    );
}

// Get actual results
export async function getQualifyingResults(roundId: number) {
  const supabase = getSupabase();
  const { data } = await supabase
    .from('actual_qualifying')
    .select('p1, p2, p3')
    .eq('round_id', roundId)
    .maybeSingle();

  return data as { p1: number; p2: number; p3: number } | null;
}

export async function getRaceResults(roundId: number) {
  const supabase = getSupabase();
  const { data } = await supabase
    .from('actual_race')
    .select('p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, num_finishers')
    .eq('round_id', roundId)
    .maybeSingle();

  return data as {
    p1: number; p2: number; p3: number; p4: number; p5: number;
    p6: number; p7: number; p8: number; p9: number; p10: number;
    num_finishers: number;
  } | null;
}

export async function getSprintResults(roundId: number) {
  const supabase = getSupabase();
  const { data } = await supabase
    .from('actual_sprint')
    .select('p1, p2, p3, p4, p5')
    .eq('round_id', roundId)
    .maybeSingle();

  return data as { p1: number; p2: number; p3: number; p4: number; p5: number } | null;
}

// Calculate and store scores for all users for a round
export async function calculateScoresForRound(roundId: number) {
  const supabase = getSupabase();

  const qualResults = await getQualifyingResults(roundId);
  const raceResults = await getRaceResults(roundId);
  const sprintResults = await getSprintResults(roundId);

  if (!qualResults && !raceResults && !sprintResults) return;

  // Get all users with predictions for this round
  const userIds = new Set<number>();

  const { data: qualUsers } = await supabase
    .from('qualifying_predictions')
    .select('user_id')
    .eq('round_id', roundId);

  const { data: raceUsers } = await supabase
    .from('race_predictions')
    .select('user_id')
    .eq('round_id', roundId);

  const { data: sprintUsers } = await supabase
    .from('sprint_predictions')
    .select('user_id')
    .eq('round_id', roundId);

  (qualUsers ?? []).forEach((r: { user_id: number }) => userIds.add(r.user_id));
  (raceUsers ?? []).forEach((r: { user_id: number }) => userIds.add(r.user_id));
  (sprintUsers ?? []).forEach((r: { user_id: number }) => userIds.add(r.user_id));

  for (const userId of userIds) {
    let qualPts = 0, qualBonus = 0;
    let racePts = 0, raceBonus = 0;
    let sprintPts = 0, sprintBonus = 0;
    let finisherPts = 0;

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
        const score = scoreQualifying([pred.p1, pred.p2, pred.p3], actual);
        qualPts = score.subtotal;
        qualBonus = score.bonus;
      }
    }

    // Score race
    if (raceResults) {
      const { data: pred } = await supabase
        .from('race_predictions')
        .select('p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, num_finishers')
        .eq('user_id', userId)
        .eq('round_id', roundId)
        .maybeSingle();

      if (pred) {
        const actual = [
          raceResults.p1, raceResults.p2, raceResults.p3, raceResults.p4, raceResults.p5,
          raceResults.p6, raceResults.p7, raceResults.p8, raceResults.p9, raceResults.p10,
        ];
        const predicted = [
          pred.p1, pred.p2, pred.p3, pred.p4, pred.p5,
          pred.p6, pred.p7, pred.p8, pred.p9, pred.p10,
        ];
        const score = scoreRace(predicted, actual);
        racePts = score.subtotal;
        raceBonus = score.bonus;
        finisherPts = scoreFinishers(pred.num_finishers, raceResults.num_finishers);
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
        const actual = [
          sprintResults.p1, sprintResults.p2, sprintResults.p3,
          sprintResults.p4, sprintResults.p5,
        ];
        const score = scoreSprint([pred.p1, pred.p2, pred.p3, pred.p4, pred.p5], actual);
        sprintPts = score.subtotal;
        sprintBonus = score.bonus;
      }
    }

    const total = qualPts + qualBonus + racePts + raceBonus + sprintPts + sprintBonus + finisherPts;

    await supabase
      .from('scores')
      .upsert(
        {
          user_id: userId,
          round_id: roundId,
          qualifying_pts: qualPts,
          qualifying_bonus: qualBonus,
          race_pts: racePts,
          race_bonus: raceBonus,
          sprint_pts: sprintPts,
          sprint_bonus: sprintBonus,
          finisher_pts: finisherPts,
          total,
          computed_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,round_id' }
      );
  }
}
