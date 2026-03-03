import { NextResponse, type NextRequest } from 'next/server';

// Simple cookie-based auth check for Edge Runtime
// Full session validation happens in server components via auth()
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public paths - no auth required
  const publicPaths = ['/login', '/register', '/leaderboard', '/onboarding'];
  const isPublicPath = publicPaths.some(p => pathname.startsWith(p));
  const isApiAuth = pathname.startsWith('/api/auth');
  const isPublicApi = pathname.startsWith('/api/scores') || pathname.startsWith('/api/register');
  const isStaticAsset = pathname.startsWith('/_next') || pathname.startsWith('/favicon') || pathname.includes('.');

  if (isPublicPath || isApiAuth || isPublicApi || isStaticAsset) {
    return NextResponse.next();
  }

  // Check for session cookie (authjs.session-token or __Secure-authjs.session-token)
  const hasSession =
    request.cookies.has('authjs.session-token') ||
    request.cookies.has('__Secure-authjs.session-token');

  if (!hasSession) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
