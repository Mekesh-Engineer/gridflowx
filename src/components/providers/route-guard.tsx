'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { UserRole } from '@/lib/constants';
import { ROLE_DASHBOARDS, roleCanAccessRoute } from '@/config/routes.config';
import { Loader2 } from 'lucide-react';

const PUBLIC_PATHS = [
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
];

const GUEST_ONLY_PATHS = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
];

function FullScreenLoader() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[var(--bg-base)] text-[var(--text-primary)]">
      <div className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 shadow-xl">
        <div className="relative flex items-center justify-center">
          <div className="w-12 h-12 rounded-xl bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/30 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-[var(--color-primary)]" />
          </div>
        </div>
        <div className="text-center space-y-1">
          <p className="text-sm font-bold tracking-tight">Authenticating Session...</p>
          <p className="text-xs text-[var(--text-muted)] font-mono">GridFlowX Security Gateway</p>
        </div>
      </div>
    </div>
  );
}

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, role, isInitialized } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const normalizedRole = (role ? String(role).toLowerCase() : '') as UserRole;

  const isPublicPath = PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'));
  const isGuestPath = GUEST_ONLY_PATHS.includes(pathname);
  const isDashboardPath = pathname.startsWith('/dashboard');

  // Role can access the current dashboard route?
  const roleHasRouteAccess = normalizedRole
    ? roleCanAccessRoute(normalizedRole, pathname)
    : false;

  useEffect(() => {
    if (!isInitialized) return;

    if (isAuthenticated) {
      // 1. Email not verified — redirect to verify-email
      if (user && !user.emailVerified && pathname !== '/verify-email' && !isPublicPath) {
        router.push('/verify-email');
        return;
      }

      // 2. Verified + on verify-email page — redirect to role dashboard
      if (user?.emailVerified && pathname === '/verify-email') {
        const dest = ROLE_DASHBOARDS[normalizedRole] || '/dashboard';
        router.push(dest);
        return;
      }

      // 3. Authenticated user on guest-only path — redirect to role dashboard
      if (isGuestPath) {
        const dest = ROLE_DASHBOARDS[normalizedRole] || '/dashboard';
        router.push(dest);
        return;
      }

      // 4. Base /dashboard redirects — Supervisors and Admins have dedicated home dashboards
      if (pathname === '/dashboard' && normalizedRole && ROLE_DASHBOARDS[normalizedRole] && ROLE_DASHBOARDS[normalizedRole] !== '/dashboard') {
        router.push(ROLE_DASHBOARDS[normalizedRole]);
        return;
      }

      // 5. Role-based access control for all dashboard sub-routes
      if (isDashboardPath && pathname !== '/dashboard' && !roleHasRouteAccess) {
        router.push('/unauthorized');
        return;
      }
    } else {
      // Unauthenticated — redirect to login with return URL
      if (!isPublicPath && !isGuestPath && pathname !== '/verify-email' && pathname !== '/unauthorized') {
        const redirectTo = encodeURIComponent(pathname);
        router.push(`/login?redirectTo=${redirectTo}`);
      }
    }
  }, [isInitialized, isAuthenticated, normalizedRole, pathname, router, isPublicPath, isGuestPath, isDashboardPath, roleHasRouteAccess, user]);

  // Show loader while auth is initializing on protected paths
  if (!isInitialized) {
    if (isPublicPath || isGuestPath || pathname === '/verify-email' || pathname === '/unauthorized') {
      return <>{children}</>;
    }
    return <FullScreenLoader />;
  }

  // Prevent flash of protected page content while redirecting unauthenticated users
  if (!isAuthenticated && !isPublicPath && !isGuestPath && pathname !== '/verify-email' && pathname !== '/unauthorized') {
    return <FullScreenLoader />;
  }

  // Prevent flash of unauthorized dashboard pages before redirect fires
  if (isAuthenticated && isDashboardPath && pathname !== '/dashboard' && !roleHasRouteAccess) {
    return <FullScreenLoader />;
  }

  // Prevent flash of base /dashboard when role has a different home
  if (isAuthenticated && pathname === '/dashboard' && normalizedRole && ROLE_DASHBOARDS[normalizedRole] !== '/dashboard') {
    return <FullScreenLoader />;
  }

  // Prevent flash of guest paths for already authenticated users
  if (isAuthenticated && isGuestPath) {
    return <FullScreenLoader />;
  }

  // Prevent flash of verify-email for verified users
  if (isAuthenticated && user?.emailVerified && pathname === '/verify-email') {
    return <FullScreenLoader />;
  }

  return <>{children}</>;
}
