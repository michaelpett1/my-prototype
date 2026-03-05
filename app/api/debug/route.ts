import { NextResponse } from 'next/server';
import getSupabase from '@/lib/db';

export async function GET() {
  const results: Record<string, unknown> = {};

  try {
    const supabase = getSupabase();

    // Check env vars are set
    results.envCheck = {
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      urlPrefix: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...',
      hasKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      keyPrefix: process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 20) + '...',
    };

    // Test: read rounds (seed data)
    const { data: rounds, error: roundsErr } = await supabase
      .from('rounds')
      .select('id, name')
      .limit(3);
    results.rounds = { data: rounds, error: roundsErr?.message ?? null, count: rounds?.length ?? 0 };

    // Test: read drivers (seed data)
    const { data: drivers, error: driversErr } = await supabase
      .from('drivers')
      .select('id, code')
      .limit(3);
    results.drivers = { data: drivers, error: driversErr?.message ?? null, count: drivers?.length ?? 0 };

    // Test: read users
    const { data: users, error: usersErr } = await supabase
      .from('users')
      .select('id, username, email, created_at')
      .limit(10);
    results.users = { data: users, error: usersErr?.message ?? null, count: users?.length ?? 0 };

    // Test: read qualifying_predictions
    const { data: preds, error: predsErr } = await supabase
      .from('qualifying_predictions')
      .select('*')
      .limit(10);
    results.qualifyingPredictions = { data: preds, error: predsErr?.message ?? null, count: preds?.length ?? 0 };

    // Test: read race_predictions
    const { data: racePreds, error: racePredsErr } = await supabase
      .from('race_predictions')
      .select('*')
      .limit(10);
    results.racePredictions = { data: racePreds, error: racePredsErr?.message ?? null, count: racePreds?.length ?? 0 };

    // Test: try a simple insert and delete (canary test)
    const { error: insertErr } = await supabase
      .from('users')
      .insert({ username: '__canary_test__', email: '__canary@test.com', password_hash: 'test' });
    results.canaryInsert = { error: insertErr?.message ?? null, success: !insertErr };

    // Clean up canary
    if (!insertErr) {
      const { error: deleteErr } = await supabase
        .from('users')
        .delete()
        .eq('username', '__canary_test__');
      results.canaryDelete = { error: deleteErr?.message ?? null, success: !deleteErr };
    }

    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json({
      ...results,
      fatalError: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}
