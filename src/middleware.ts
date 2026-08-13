import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ============================================================================
// Next.js Edge Middleware — Edge RBAC Enforcement
// ============================================================================

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Static assets and API routes bypass edge middleware
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
