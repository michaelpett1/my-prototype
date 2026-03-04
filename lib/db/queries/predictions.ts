import getSupabase from '../index';

// Qualifying predictions
export async function getQualifyingPrediction(userId: number, roundId: number) {
  const supabase = getSupabase();
  const { data } = await supabase
    .from('qualifying_predictions')
    .select('p1, p2, p3')
    .eq('user_id', userId)
    .eq('round_id', roundId)
    .maybeSingle();

  return data as { p1: number; p2: number; p3: number } | null;
}

export async function upsertQualifyingPrediction(userId: number, roundId: number, p1: number, p2: number, p3: number) {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('qualifying_predictions')
    .upsert(
      {
        user_id: userId,
        round_id: roundId,
        p1,
        p2,
        p3,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,round_id' }
    );
  if (error) {
    console.error('upsertQualifyingPrediction error:', error);
    throw new Error(`Failed to save qualifying prediction: ${error.message}`);
  }
}

// Race predictions
export async function getRacePrediction(userId: number, roundId: number) {
  const supabase = getSupabase();
  const { data } = await supabase
    .from('race_predictions')
    .select('p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, num_finishers')
    .eq('user_id', userId)
    .eq('round_id', roundId)
    .maybeSingle();

  return data as {
    p1: number; p2: number; p3: number; p4: number; p5: number;
    p6: number; p7: number; p8: number; p9: number; p10: number;
    num_finishers: number;
  } | null;
}

export async function upsertRacePrediction(
  userId: number, roundId: number,
  positions: number[], numFinishers: number
) {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('race_predictions')
    .upsert(
      {
        user_id: userId,
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
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,round_id' }
    );
  if (error) {
    console.error('upsertRacePrediction error:', error);
    throw new Error(`Failed to save race prediction: ${error.message}`);
  }
}

// Sprint predictions
export async function getSprintPrediction(userId: number, roundId: number) {
  const supabase = getSupabase();
  const { data } = await supabase
    .from('sprint_predictions')
    .select('p1, p2, p3, p4, p5')
    .eq('user_id', userId)
    .eq('round_id', roundId)
    .maybeSingle();

  return data as { p1: number; p2: number; p3: number; p4: number; p5: number } | null;
}

export async function upsertSprintPrediction(userId: number, roundId: number, positions: number[]) {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('sprint_predictions')
    .upsert(
      {
        user_id: userId,
        round_id: roundId,
        p1: positions[0],
        p2: positions[1],
        p3: positions[2],
        p4: positions[3],
        p5: positions[4],
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,round_id' }
    );
  if (error) {
    console.error('upsertSprintPrediction error:', error);
    throw new Error(`Failed to save sprint prediction: ${error.message}`);
  }
}

// Teammate predictions
export async function getTeammatePredictions(userId: number) {
  const supabase = getSupabase();
  const { data } = await supabase
    .from('teammate_predictions')
    .select('team_id, winner_driver_id')
    .eq('user_id', userId);

  return (data ?? []) as { team_id: number; winner_driver_id: number }[];
}

export async function upsertTeammatePredictions(userId: number, picks: { teamId: number; driverId: number }[]) {
  const supabase = getSupabase();
  for (const pick of picks) {
    const { error } = await supabase
      .from('teammate_predictions')
      .upsert(
        {
          user_id: userId,
          team_id: pick.teamId,
          winner_driver_id: pick.driverId,
        },
        { onConflict: 'user_id,team_id' }
      );
    if (error) {
      console.error('upsertTeammatePrediction error:', error);
      throw new Error(`Failed to save teammate prediction: ${error.message}`);
    }
  }
}

// Season predictions
export async function getSeasonPrediction(userId: number, windowNumber: number) {
  const supabase = getSupabase();
  const { data } = await supabase
    .from('season_predictions')
    .select('drivers_champion_id, constructors_champion_id, window_number')
    .eq('user_id', userId)
    .eq('window_number', windowNumber)
    .maybeSingle();

  return data as {
    drivers_champion_id: number;
    constructors_champion_id: number;
    window_number: number;
  } | null;
}

export async function getSeasonPredictionCount(userId: number) {
  const supabase = getSupabase();
  const { count } = await supabase
    .from('season_predictions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  return count ?? 0;
}

export async function upsertSeasonPrediction(
  userId: number, windowNumber: number,
  driversChampionId: number, constructorsChampionId: number
) {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('season_predictions')
    .upsert(
      {
        user_id: userId,
        window_number: windowNumber,
        drivers_champion_id: driversChampionId,
        constructors_champion_id: constructorsChampionId,
      },
      { onConflict: 'user_id,window_number' }
    );
  if (error) {
    console.error('upsertSeasonPrediction error:', error);
    throw new Error(`Failed to save season prediction: ${error.message}`);
  }
}
