'use client';

import { useAuth } from '@/hooks/use-auth';
import { UserRole } from '@/types/roles';
import {
  hasPermission,
  PERMISSION_MATRIX,
  type PermissionAction,
  type PermissionResource,
} from '@/config/permissions.config';
import type { UsePermissionReturn, PermissionCheck } from '@/types/permissions.types';

// ============================================================================
// usePermission — Client-Side RBAC Guard Hook
// ============================================================================

/**
 * Provides permission-checking utilities based on the current user's role.
 * Reads role from auth store and validates against permissions.config.ts.
 *
 * @example
 * const { can, cannot, isRole } = usePermission();
 *
 * // Gate a UI element
 * if (cannot('override', 'relays')) return <Button disabled>Override Locked</Button>;
 *
 * // Gate a section
 * if (isRole(UserRole.ADMIN, UserRole.SUPERVISOR)) return <ApprovalQueue />;
 */
export function usePermission(): UsePermissionReturn {
  const { role } = useAuth();

  const normalizedRole = role
    ? (String(role).toLowerCase() as UserRole)
    : null;

  function can(action: PermissionAction, resource: PermissionResource): boolean {
    if (!normalizedRole) return false;
    return hasPermission(normalizedRole, resource, action);
  }

  function cannot(action: PermissionAction, resource: PermissionResource): boolean {
    return !can(action, resource);
  }

  function canAny(checks: PermissionCheck[]): boolean {
    return checks.some(({ action, resource }) => can(action, resource));
  }

  function canAll(checks: PermissionCheck[]): boolean {
    return checks.every(({ action, resource }) => can(action, resource));
  }

  function isRole(...roles: UserRole[]): boolean {
    if (!normalizedRole) return false;
    return roles.includes(normalizedRole);
  }

  return {
    can,
    cannot,
    canAny,
    canAll,
    role: normalizedRole,
    isRole,
  };
}
