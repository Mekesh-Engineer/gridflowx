'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { UserRole } from '@/lib/constants';
import { ROLE_DASHBOARDS } from '@/routes/routes.config';
import { Loader2, ShieldAlert } from 'lucide-react';

const PUBLIC_PATHS = [
  '/',
  '/about',
  '/contact',
  '/developers',
  '/explorer',
  '/features',
  '/how-it-works',
];

const GUEST_ONLY_PATHS = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
];

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, role, isInitialized } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isPublicPath = PUBLIC_PATHS.includes(pathname);
  const isGuestPath = GUEST_ONLY_PATHS.includes(pathname);
  const isDashboardPath = pathname.startsWith('/dashboard');

  useEffect(() => {
    if (!isInitialized) return;

    if (isAuthenticated) {
      // 1. If user is authenticated but email is not verified, redirect to verify-email
      // Exclude verification check on the verify-email page itself
      if (user && !user.emailVerified && pathname !== '/verify-email' && !isPublicPath) {
        router.push('/verify-email');
        return;
      }

      // 2. If user is verified and on verify-email, redirect to dashboard
      if (user?.emailVerified && pathname === '/verify-email') {
        const dest = ROLE_DASHBOARDS[role as UserRole] || '/dashboard';
        router.push(dest);
        return;
      }

      // 3. If authenticated user attempts to visit guest-only path (login/register etc)
      if (isGuestPath) {
        const dest = ROLE_DASHBOARDS[role as UserRole] || '/dashboard';
        router.push(dest);
        return;
      }

      // 4. Role-based route guard redirects for dashboard subpaths
      if (isDashboardPath) {
        if (pathname.startsWith('/dashboard/admin') && role !== UserRole.ADMIN) {
          router.push(ROLE_DASHBOARDS[role as UserRole] || '/dashboard');
        } else if (pathname.startsWith('/dashboard/supervisor') && role !== UserRole.SUPERVISOR && role !== UserRole.ADMIN) {
          router.push(ROLE_DASHBOARDS[role as UserRole] || '/dashboard');
        } else if (pathname.startsWith('/dashboard/audit') && role !== UserRole.AUDITOR && role !== UserRole.ADMIN) {
          router.push(ROLE_DASHBOARDS[role as UserRole] || '/dashboard');
        }
      }
    } else {
      // Unauthenticated state redirects
      if (!isPublicPath && !isGuestPath && pathname !== '/verify-email') {
        const redirectTo = encodeURIComponent(pathname);
        router.push(`/login?redirectTo=${redirectTo}`);
      }
    }
  }, [isInitialized, isAuthenticated, role, pathname, router, isPublicPath, isGuestPath, isDashboardPath, user]);

  // Loading / Booting screen
  if (!isInitialized) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[var(--bg-base)] text-[var(--text-primary)]">
        <div className="relative flex flex-col items-center gap-4">
          <div className="relative">
            <Loader2 className="h-10 w-10 animate-spin text-[var(--color-primary)]" />
            <div className="absolute inset-0 h-10 w-10 rounded-full border border-dashed border-[var(--color-primary)] animate-[spin_6s_linear_infinite]" />
          </div>
          <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] animate-pulse">
            Booting GridFlowX Auth...
          </div>
        </div>
      </div>
    );
  }

  // Prevent flash of protected page content while redirecting unauthenticated users
  if (!isAuthenticated && !isPublicPath && !isGuestPath && pathname !== '/verify-email') {
    return null;
  }

  // Prevent flash of dashboard pages if role access doesn't match
  if (isAuthenticated && isDashboardPath) {
    if (pathname.startsWith('/dashboard/admin') && role !== UserRole.ADMIN) {
      return null;
    }
    if (pathname.startsWith('/dashboard/supervisor') && role !== UserRole.SUPERVISOR && role !== UserRole.ADMIN) {
      return null;
    }
    if (pathname.startsWith('/dashboard/audit') && role !== UserRole.AUDITOR && role !== UserRole.ADMIN) {
      return null;
    }
  }

  // Prevent flash of guest paths for already authenticated users
  if (isAuthenticated && isGuestPath) {
    return null;
  }

  // Prevent flash of verify-email for verified users
  if (isAuthenticated && user?.emailVerified && pathname === '/verify-email') {
    return null;
  }

  return <>{children}</>;
}
