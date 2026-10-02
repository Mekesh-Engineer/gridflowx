/**
 * ============================================================================
 * GridFlowX Relay & Safety Control Service — Supabase Audit Integration
 * ============================================================================
 * Dispatches relay commands to FastAPI and records audit logs in Supabase.
 */

import { fetchFromAIService } from '@/lib/ai';
import { API_ROUTES } from '@/config/api.config';
import { RelayCommandAck } from '@/types/relay.types';
import { supabase } from '@/lib/supabase/client';
import { AuthUser } from '@/store/auth.store';

async function logAuditRecord(
  action: string,
  severity: 'INFO' | 'WARNING' | 'CRITICAL',
  resource: string,
  user: AuthUser | null,
  details: Record<string, any>
): Promise<void> {
  try {
    const eventId = `LOG-RELAY-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    await supabase.from('audit_logs').insert({
      id: eventId,
      timestamp: new Date().toISOString(),
      actor_uid: user?.uid || 'SYSTEM_OPERATOR',
      actor_email: user?.email || 'operator@gridflowx.io',
      actor_role: user?.role || 'operator',
      action,
      severity,
      status: 'SUCCESS',
      resource,
      details,
    });
  } catch (err) {
    console.warn('Failed to write relay audit log to Supabase:', err);
  }
}

export async function toggleRelayOverride(
  relayIndex: number,
  newState: boolean,
  reason: string,
  user: AuthUser | null,
  deviceId = 'GFX-ESP32-MASTER-01',
  durationMinutes?: number
): Promise<RelayCommandAck> {
  const token = user?.uid ? `dev-${user.role.toLowerCase()}` : 'dev-operator';

  const response = await fetchFromAIService<RelayCommandAck>(API_ROUTES.RELAY_OVERRIDE, {
    method: 'POST',
    body: { deviceId, relayIndex, newState, reason, durationMinutes, requestedByUid: user?.uid, requestedByRole: user?.role },
    token,
  });

  await logAuditRecord('RELAY_OVERRIDE_APPLIED', 'INFO', `devices/${deviceId}/relays/ch${relayIndex}`, user, {
    relayIndex, newState, reason, durationMinutes, commandId: response.commandId, latencyMs: response.latencyMs,
  });

  return response;
}

export async function triggerEmergencyStop(
  reason: string,
  user: AuthUser | null,
  deviceId = 'GFX-ESP32-MASTER-01'
): Promise<RelayCommandAck> {
  const token = user?.uid ? `dev-${user.role.toLowerCase()}` : 'dev-operator';

  const response = await fetchFromAIService<RelayCommandAck>(API_ROUTES.RELAY_EMERGENCY_STOP, {
    method: 'POST',
    body: { deviceId, reason, requestedByUid: user?.uid, requestedByRole: user?.role },
    token,
  });

  await logAuditRecord('EMERGENCY_STOP_TRIGGERED', 'CRITICAL', `devices/${deviceId}/relays/all`, user, {
    reason, commandId: response.commandId, latencyMs: response.latencyMs,
  });

  return response;
}

export async function triggerEmergencyRecovery(
  reason: string,
  user: AuthUser | null,
  deviceId = 'GFX-ESP32-MASTER-01'
): Promise<RelayCommandAck> {
  const token = user?.uid ? `dev-${user.role.toLowerCase()}` : 'dev-supervisor';

  const response = await fetchFromAIService<RelayCommandAck>(API_ROUTES.RELAY_RECOVERY, {
    method: 'POST',
    body: { deviceId, reason, authorizedByUid: user?.uid, authorizedByRole: user?.role },
    token,
  });

  await logAuditRecord('EMERGENCY_RECOVERY_AUTHORIZED', 'WARNING', `devices/${deviceId}/relays/all`, user, {
    reason, commandId: response.commandId, latencyMs: response.latencyMs,
  });

  return response;
}

export async function fetchRelayStates(token?: string): Promise<{ success: boolean; relayStates: boolean[] }> {
  return fetchFromAIService<{ success: boolean; relayStates: boolean[] }>(API_ROUTES.RELAY_STATES, {
    method: 'GET',
    token,
  });
}
