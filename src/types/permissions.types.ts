import { UserRole } from '@/types/roles';
import type { PermissionAction, PermissionResource } from '@/config/permissions.config';

// ============================================================================
// Core Permission Types
// ============================================================================

export type { PermissionAction, PermissionResource };

export interface PermissionCheck {
  resource: PermissionResource;
  action: PermissionAction;
}

export interface UsePermissionReturn {
  /** Check if the current user can perform an action on a resource */
  can: (action: PermissionAction, resource: PermissionResource) => boolean;
  /** Negated check — more readable in guard conditions */
  cannot: (action: PermissionAction, resource: PermissionResource) => boolean;
  /** Check if user has any of the given permissions */
  canAny: (checks: PermissionCheck[]) => boolean;
  /** Check if user has all of the given permissions */
  canAll: (checks: PermissionCheck[]) => boolean;
  /** Current user's role */
  role: UserRole | null;
  /** Whether user is one of the given roles */
  isRole: (...roles: UserRole[]) => boolean;
}

// ============================================================================
// PermissionGuard Component Props
// ============================================================================

export interface PermissionGuardProps {
  /** The resource to check against */
  resource: PermissionResource;
  /** The action required */
  action: PermissionAction;
  /** Content to render when permission is granted */
  children: React.ReactNode;
  /** Optional fallback when permission is denied (default: null) */
  fallback?: React.ReactNode;
}

// ============================================================================
// Route Permission Types
// ============================================================================

export interface RoutePermissionConfig {
  path: string;
  allowedRoles: UserRole[];
  redirectTo?: string;
}

// ============================================================================
// Feature Flag Types
// ============================================================================

export interface RoleFeatureFlags {
  showAuditLogs: boolean;
  showBilling: boolean;
  showUserManagement: boolean;
  showAgenticAI: boolean;
  showFirmwareUpdate: boolean;
  showComplianceCenter: boolean;
  canApproveOverrides: boolean;
  canOverrideRelays: boolean;
  canExportReports: boolean;
  canManageAlertRules: boolean;
  canTriggerSimulation: boolean;
  canAccessAdminSettings: boolean;
}

export const ROLE_FEATURE_FLAGS: Record<UserRole, RoleFeatureFlags> = {
  [UserRole.OPERATOR]: {
    showAuditLogs:           false,
    showBilling:             false,
    showUserManagement:      false,
    showAgenticAI:           false,
    showFirmwareUpdate:      false,
    showComplianceCenter:    false,
    canApproveOverrides:     false,
    canOverrideRelays:       true,   // 30-min window
    canExportReports:        false,
    canManageAlertRules:     false,
    canTriggerSimulation:    false,
    canAccessAdminSettings:  false,
  },
  [UserRole.SUPERVISOR]: {
    showAuditLogs:           true,
    showBilling:             false,
    showUserManagement:      false,
    showAgenticAI:           true,
    showFirmwareUpdate:      false,
    showComplianceCenter:    true,
    canApproveOverrides:     true,
    canOverrideRelays:       true,
    canExportReports:        true,
    canManageAlertRules:     true,
    canTriggerSimulation:    true,
    canAccessAdminSettings:  false,
  },
  [UserRole.ADMIN]: {
    showAuditLogs:           true,
    showBilling:             true,
    showUserManagement:      true,
    showAgenticAI:           true,
    showFirmwareUpdate:      true,
    showComplianceCenter:    true,
    canApproveOverrides:     true,
    canOverrideRelays:       true,
    canExportReports:        true,
    canManageAlertRules:     true,
    canTriggerSimulation:    true,
    canAccessAdminSettings:  true,
  },
  [UserRole.AUDITOR]: {
    showAuditLogs:           true,
    showBilling:             false,
    showUserManagement:      false,
    showAgenticAI:           false,
    showFirmwareUpdate:      false,
    showComplianceCenter:    true,
    canApproveOverrides:     false,
    canOverrideRelays:       false,
    canExportReports:        true,
    canManageAlertRules:     false,
    canTriggerSimulation:    false,
    canAccessAdminSettings:  false,
  },
};
