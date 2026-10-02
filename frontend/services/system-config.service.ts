/**
 * ============================================================================
 * GridFlowX Tenant & Platform System Configuration Service — Supabase PostgreSQL
 * ============================================================================
 * Manages tenant safety limits, global microgrid cutoff thresholds, and platform
 * parameters in Supabase `system_configurations` table.
 * Automatically records immutable compliance records in `audit_logs`.
 */

import { supabase } from '@/lib/supabase/client';

export interface SystemConfiguration {
  minSocThresholdPct: number;
  maxCellTemperatureC: number;
  criticalLoadTier1Locked: boolean;
  minRelayDwellTimeSec: number;
  autoSheddingEnabled: boolean;
  peakTariffRateUsd: number;
  gridAntiIslandingThresholdV: number;
  updatedAt?: string;
  updatedBy?: string;
}

export const DEFAULT_SYSTEM_CONFIG: SystemConfiguration = {
  minSocThresholdPct: 20,
  maxCellTemperatureC: 45,
  criticalLoadTier1Locked: true,
  minRelayDwellTimeSec: 3.0,
  autoSheddingEnabled: true,
  peakTariffRateUsd: 0.38,
  gridAntiIslandingThresholdV: 230.0,
  updatedAt: new Date().toISOString(),
  updatedBy: 'SYSTEM_DEFAULT',
};

const CONFIG_KEY = 'system_configuration';

/**
 * Fetches tenant system configuration from Supabase, seeding defaults if empty
 */
export async function fetchSystemConfig(): Promise<SystemConfiguration> {
  try {
    const { data, error } = await supabase
      .from('system_configurations')
      .select('config_value')
      .eq('config_key', CONFIG_KEY)
      .single();

    if (error || !data) {
      await saveSystemConfig(DEFAULT_SYSTEM_CONFIG, 'SYSTEM_INIT');
      return DEFAULT_SYSTEM_CONFIG;
    }

    return data.config_value as SystemConfiguration;
  } catch (err) {
    console.warn('Failed to fetch system configurations from Supabase, using defaults:', err);
    return DEFAULT_SYSTEM_CONFIG;
  }
}

/**
 * Persists updated system configuration to Supabase and logs an audit trail event
 */
export async function saveSystemConfig(
  config: Partial<SystemConfiguration>,
  userUid: string = 'SYSTEM_ADMIN'
): Promise<SystemConfiguration> {
  const current = await fetchSystemConfig().catch(() => DEFAULT_SYSTEM_CONFIG);
  const updated: SystemConfiguration = {
    ...current,
    ...config,
    updatedAt: new Date().toISOString(),
    updatedBy: userUid,
  };

  const { error } = await supabase
    .from('system_configurations')
    .upsert(
      {
        config_key: CONFIG_KEY,
        config_value: updated,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'config_key' }
    );

  if (error) throw error;

  // Record audit log entry
  try {
    await supabase.from('audit_logs').insert({
      id: `LOG-SYSCFG-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor_uid: userUid,
      actor_email: `${userUid}@gridflowx.io`,
      actor_role: 'admin',
      action: 'SYSTEM_CONFIG_UPDATED',
      severity: 'WARNING',
      status: 'SUCCESS',
      resource: 'system_configurations',
      details: {
        minSoc: updated.minSocThresholdPct,
        maxTemp: updated.maxCellTemperatureC,
        autoShedding: updated.autoSheddingEnabled,
      },
    });
  } catch (auditErr) {
    console.warn('Failed to record system configuration update in audit log:', auditErr);
  }

  return updated;
}
