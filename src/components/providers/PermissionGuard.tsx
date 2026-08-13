'use client';

import React from 'react';
import { usePermission } from '@/hooks/use-permission';
import type { PermissionGuardProps } from '@/types/permissions.types';

// ============================================================================
// PermissionGuard — Declarative JSX Permission Guard Component
// ============================================================================

/**
 * Conditionally renders children based on the current user's RBAC permissions.
 * Falls back to the `fallback` prop (default: null) when permission is denied.
 *
 * @example
 * // Gate a page section
 * <PermissionGuard resource="billing" action="read">
 *   <BillingSection />
 * </PermissionGuard>
 *
 * // Gate with custom fallback
 * <PermissionGuard resource="relays" action="override" fallback={<LockedBanner />}>
 *   <RelayControls />
 * </PermissionGuard>
 */
export function PermissionGuard({
  resource,
  action,
  children,
  fallback = null,
}: PermissionGuardProps) {
  const { can } = usePermission();

  if (!can(action, resource)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// ============================================================================
// RoleGuard — Role-based conditional rendering shorthand
// ============================================================================

interface RoleGuardProps {
  /** Roles that are allowed to see the children */
  roles: import('@/types/roles').UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Renders children only when the user's role matches one of the allowed roles.
 *
 * @example
 * <RoleGuard roles={[UserRole.ADMIN]}>
 *   <AdminOnlyButton />
 * </RoleGuard>
 */
export function RoleGuard({ roles, children, fallback = null }: RoleGuardProps) {
  const { isRole } = usePermission();

  if (!isRole(...roles)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
