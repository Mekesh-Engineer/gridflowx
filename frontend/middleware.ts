import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ============================================================================
// Next.js Edge Middleware — Edge Security & Route Shielding
// ============================================================================

const PUBLIC_EXACT_PATHS = new Set([
  '/',
  '/about',
  '/contact',
  '/developers',
  '/explorer',
  '/features',
  '/how-it-works',
  '/pricing',
  '/status',
  '/privacy',
  '/terms',
]);

const GUEST_ONLY_PATHS = new Set([
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
]);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Static assets and internal next routes bypass edge middleware
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // 2. Prepare response with security headers
  const response = NextResponse.next();
  
  // Security Headers (OWASP Top 10 hardening)
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self)');

  // 3. Check for session cookie if present
  const sessionCookie = request.cookies.get('__session')?.value || request.cookies.get('gridflowx_session')?.value;

  const isPublicPath = PUBLIC_EXACT_PATHS.has(pathname);
  const isGuestPath = GUEST_ONLY_PATHS.has(pathname);
  const isProtectedPath = pathname.startsWith('/dashboard') ||
                          pathname.startsWith('/admin') ||
                          pathname.startsWith('/operator') ||
                          pathname.startsWith('/supervisor') ||
                          pathname.startsWith('/profile') ||
                          pathname.startsWith('/settings') ||
                          pathname.startsWith('/my-tickets');

  // If authenticated user visits guest-only path (/login, /register), redirect to dashboard
  if (isGuestPath && sessionCookie && sessionCookie !== 'unauthenticated') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // If session cookie is explicitly empty or unauthenticated on a protected path, redirect to login
  if (isProtectedPath && sessionCookie === 'unauthenticated') {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}


export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icon.svg).*)',
  ],
};
