/**
 * ============================================================================
 * GridFlowX Alert & Notification Rule Service — Supabase PostgreSQL
 * ============================================================================
 * Manages fault notifications, automated threshold evaluations, and operator
 * acknowledgement workflows via Supabase `alerts` and `system_configurations` tables.
 * Real-time subscription uses Supabase Realtime (postgres_changes).
 */

import { supabase } from '@/lib/supabase/client';
import {
  AlertDocument,
  AlertRule,
  DEFAULT_ALERT_RULES,
} from '@/types/alerts.types';

export const INITIAL_ALERTS: AlertDocument[] = [
  {
    id: 'ALT-1001',
    deviceId: 'GFX-ESP32-MASTER-01',
    severity: 'INFO',
    category: 'HARDWARE_FAILSAFE',
    title: 'FreeRTOS Hardware Safety Loop Nominal',
    message: 'Core 0 deterministic safety loop executing @ 100 Hz. All sensor interrupts cleared.',
    timestamp: new Date().toISOString(),
    isAcknowledged: true,
    isAutoResolved: false,
  },
  {
    id: 'ALT-1002',
    deviceId: 'GFX-ESP32-MASTER-01',
    severity: 'WARNING',
    category: 'BATTERY_SOC',
    title: 'Peak Tariff Optimization Window Active',
    message: 'Dispatched BESS discharge to offset peak utility tariff pricing ($0.34/kWh).',
    timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
    isAcknowledged: false,
    isAutoResolved: false,
  },
  {
    id: 'ALT-1003',
    deviceId: 'GFX-ESP32-MASTER-01',
    severity: 'INFO',
    category: 'SYSTEM',
    title: 'AI Solar Forecast Engine Synchronized',
    message: '1-Hour and 24-Hour PV generation predictions updated with ambient irradiance model.',
    timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
    isAcknowledged: true,
    isAutoResolved: false,
  },
];

/**
 * Fetches all alerts from Supabase, seeding defaults if the table is empty
 */
export async function fetchAllAlerts(): Promise<AlertDocument[]> {
  try {
    const { data, error } = await supabase
      .from('alerts')
      .select('*')
      .order('timestamp', { ascending: false });

    if (error) throw error;

    if (!data || data.length === 0) {
      await seedInitialAlerts();
      return INITIAL_ALERTS;
    }

    return data.map(mapDbAlert);
  } catch (error) {
    console.warn('Failed to fetch alerts from Supabase, returning initial alerts:', error);
    return INITIAL_ALERTS;
  }
}

/**
 * Seeds initial alerts if the table is empty
 */
export async function seedInitialAlerts(): Promise<void> {
  try {
    const rows = INITIAL_ALERTS.map((a) => ({
      id: a.id,
      device_id: a.deviceId,
      severity: a.severity,
      category: a.category,
      title: a.title,
      message: a.message,
      timestamp: a.timestamp,
      is_acknowledged: a.isAcknowledged,
      is_auto_resolved: a.isAutoResolved,
    }));
    const { error } = await supabase.from('alerts').upsert(rows, { onConflict: 'id' });
    if (error) throw error;
  } catch (error) {
    console.warn('Failed to seed alerts in Supabase:', error);
  }
}

/**
 * Subscribes to real-time alerts via Supabase Realtime postgres_changes
 */
export function subscribeToAlerts(
  onUpdate: (alerts: AlertDocument[]) => void,
  onError?: (err: Error) => void
): () => void {
  // Initial load
  fetchAllAlerts().then(onUpdate).catch((err) => onError?.(err));

  const channel = supabase
    .channel('alerts-realtime')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'alerts' },
      () => {
        fetchAllAlerts().then(onUpdate).catch((err) => onError?.(new Error(String(err))));
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Acknowledges an active alert
 */
export async function acknowledgeAlert(
  alertId: string,
  actorUid: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('alerts')
      .update({
        is_acknowledged: true,
        acknowledged_by_uid: actorUid,
        acknowledged_at: new Date().toISOString(),
      })
      .eq('id', alertId);
    if (error) throw error;
  } catch (error) {
    console.error(`Failed to acknowledge alert ${alertId}:`, error);
    throw error;
  }
}

/**
 * Fetches all configurable alert trigger rules from system_configurations
 */
export async function fetchAllAlertRules(): Promise<AlertRule[]> {
  try {
    const { data, error } = await supabase
      .from('system_configurations')
      .select('config_value')
      .eq('config_key', 'alert_rules')
      .single();

    if (error || !data) {
      await upsertAlertRules(DEFAULT_ALERT_RULES);
      return DEFAULT_ALERT_RULES;
    }

    return (data.config_value as AlertRule[]) || DEFAULT_ALERT_RULES;
  } catch (error) {
    console.warn('Failed to fetch alert rules, returning defaults:', error);
    return DEFAULT_ALERT_RULES;
  }
}

/**
 * Updates alert trigger rules in system_configurations
 */
export async function updateAlertRule(rule: AlertRule): Promise<void> {
  try {
    const current = await fetchAllAlertRules();
    const updated = current.map((r) => (r.id === rule.id ? rule : r));
    if (!current.find((r) => r.id === rule.id)) updated.push(rule);
    await upsertAlertRules(updated);
  } catch (error) {
    console.error(`Failed to update alert rule ${rule.id}:`, error);
    throw error;
  }
}

async function upsertAlertRules(rules: AlertRule[]): Promise<void> {
  await supabase.from('system_configurations').upsert({
    config_key: 'alert_rules',
    config_value: rules,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'config_key' });
}

function mapDbAlert(row: any): AlertDocument {
  return {
    id: row.id,
    deviceId: row.device_id,
    severity: row.severity,
    category: row.category,
    title: row.title,
    message: row.message,
    timestamp: row.timestamp,
    isAcknowledged: row.is_acknowledged,
    isAutoResolved: row.is_auto_resolved,
    acknowledgedByUid: row.acknowledged_by_uid,
    acknowledgedAt: row.acknowledged_at,
  };
}
