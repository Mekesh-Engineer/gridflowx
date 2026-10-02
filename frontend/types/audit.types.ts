/**
 * ============================================================================
 * GridFlowX Immutable Security Audit Log Type Definitions
 * ============================================================================
 * Single source of truth for regulatory compliance (SOC2 / ISO 50001 / IEC 62443)
 * tracking all security, operational, and AI actions in RTDB (`audit_logs/{eventId}`).
 */

import { UserRole } from './roles';

export type AuditAction =
  // Authentication & Identity
  | 'AUTH_LOGIN'
  | 'AUTH_LOGOUT'
  | 'AUTH_PASSWORD_RESET'
  | 'AUTH_TOKEN_REFRESH'
  | 'AUTH_UNAUTHORIZED_ACCESS_ATTEMPT'

  // Actuator & Relay Controls
  | 'RELAY_OVERRIDE_APPLIED'
  | 'RELAY_OVERRIDE_REVERTED'
  | 'EMERGENCY_STOP_TRIGGERED'
  | 'EMERGENCY_RECOVERY_AUTHORIZED'
  | 'LOAD_SHEDDING_AUTOMATED_TRIGGER'

  // Hardware Calibration & Safety
  | 'CALIBRATION_UPDATED'
  | 'SAFETY_THRESHOLD_MODIFIED'
  | 'FIRMWARE_OTA_DISPATCHED'
  | 'HARDWARE_FAILSAFE_TRIPPED'

  // User & Tenant Governance
  | 'USER_ROLE_UPDATED'
  | 'USER_INVITED'
  | 'USER_DEACTIVATED'
  | 'API_KEY_GENERATED'
  | 'API_KEY_REVOKED'

  // AI & Autonomous Decisions
  | 'AI_OPTIMIZATION_ACCEPTED'
  | 'AI_OPTIMIZATION_REJECTED'
  | 'AI_ACTION_AUTHORIZED'
  | 'AI_ACTION_REJECTED'
  | 'AI_MODEL_RETRAINED'
  | 'AI_ANOMALY_DETECTED';

export type AuditSeverity = 'INFO' | 'WARNING' | 'CRITICAL' | 'SECURITY';

export type AuditStatus = 'SUCCESS' | 'DENIED' | 'FAILED';

/**
 * Immutable Audit Event Document in RTDB (`audit_logs/{id}`)
 */
export interface AuditEvent {
  id: string;
  timestamp: string; // ISO 8601 UTC
  actorUid: string;
  actorEmail: string;
  actorRole: UserRole | string;

  action: AuditAction;
  severity: AuditSeverity;
  status: AuditStatus;

  /** Target domain/resource (e.g. 'relays/ch0', 'devices/GFX-ESP32-01', 'users/u123') */
  resource: string;

  /** Free-form structured metadata specific to the action */
  details: Record<string, any>;

  /** Network context */
  ipAddress?: string;
  userAgent?: string;

  /** Cryptographic tamper-evident hash (HMAC-SHA256 of previous hash + event content) */
  hash?: string;
}

export interface AuditLogQueryParams {
  startDate?: string;
  endDate?: string;
  actorUid?: string;
  action?: AuditAction;
  severity?: AuditSeverity;
  limitCount?: number;
}
