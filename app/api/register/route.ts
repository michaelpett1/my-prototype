import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import getSupabase from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { email, username, password } = await request.json();

    // Validate inputs
    if (!email || !username || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (username.length < 3 || username.length > 20) {
      return NextResponse.json({ error: 'Username must be 3-20 characters' }, { status: 400 });
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return NextResponse.json({ error: 'Username can only contain letters, numbers, and underscores' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    const supabase = getSupabase();

    // Check if email already exists
    const { data: existingEmail, error: emailCheckErr } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .maybeSingle();
    if (emailCheckErr) {
      console.error('Email check error:', emailCheckErr);
      return NextResponse.json({ error: `Registration failed: ${emailCheckErr.message}` }, { status: 500 });
    }
    if (existingEmail) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    // Check if username already exists
    const { data: existingUsername, error: usernameCheckErr } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .maybeSingle();
    if (usernameCheckErr) {
      console.error('Username check error:', usernameCheckErr);
      return NextResponse.json({ error: `Registration failed: ${usernameCheckErr.message}` }, { status: 500 });
    }
    if (existingUsername) {
      return NextResponse.json({ error: 'Username already taken' }, { status: 409 });
    }

    // Hash password and create user
    const passwordHash = await bcrypt.hash(password, 12);
    const { data, error } = await supabase
      .from('users')
      .insert({ username, email: email.toLowerCase(), password_hash: passwordHash })
      .select('id, username, email')
      .single();

    if (error) {
      console.error('Supabase insert error:', JSON.stringify(error, null, 2));
      return NextResponse.json({ error: `Registration failed: ${error.message}` }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      user: { id: data.id, username, email },
    }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
