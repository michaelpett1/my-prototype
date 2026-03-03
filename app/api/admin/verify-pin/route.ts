import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

const ADMIN_PIN = '1234';

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { pin } = await request.json();

  if (pin !== ADMIN_PIN) {
    return NextResponse.json({ error: 'Invalid PIN' }, { status: 403 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set('admin_verified', 'true', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 4, // 4 hours
    path: '/',
  });

  return response;
}
