import { NextResponse } from 'next/server';
import getSupabase from '@/lib/db';

export async function GET() {
  const supabase = getSupabase();

  const { data: leaderboard } = await supabase.rpc('get_global_leaderboard');

  return NextResponse.json({ leaderboard: leaderboard || [] });
}
