/**
 * ============================================================================
 * GridFlowX Device Registry & Hardware State Service — Supabase PostgreSQL
 * ============================================================================
 * Manages microgrid controller registration, calibration synchronization,
 * and live heartbeat subscription via Supabase `devices` table.
 * Real-time subscription uses Supabase Realtime (postgres_changes).
 */

import { supabase } from '@/lib/supabase/client';
import {
  MicrogridDevice,
  DeviceCalibration,
  DEFAULT_DEVICE_CALIBRATION,
  DeviceStatus,
} from '@/types/device.types';

export const INITIAL_MICROGRID_DEVICES: MicrogridDevice[] = [
  {
    id: 'GFX-ESP32-MASTER-01',
    name: 'Master Microgrid Controller Node A',
    type: 'ESP32_MASTER',
    status: 'ONLINE',
    location: 'North Substation — Bay 1',
    siteId: 'SITE-KEC-CAMPUS-01',
    ipAddress: '192.168.1.104',
    macAddress: '24:6F:28:B1:A2:5C',
    firmwareVersion: 'v3.0.4-release',
    hardwareRevision: 'ESP32-WROOM-32D',
    lastHeartbeat: new Date().toISOString(),
    isOnline: true,
    pingLatencyMs: 14.2,
    calibration: DEFAULT_DEVICE_CALIBRATION,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'GFX-MEGA-SLAVE-01',
    name: 'Actuator & Relay Driver Matrix',
    type: 'MEGA_SLAVE',
    status: 'ONLINE',
    location: 'North Substation — Control Panel',
    siteId: 'SITE-KEC-CAMPUS-01',
    ipAddress: 'UART2 (115200 bps)',
    firmwareVersion: 'v2.8.1-opt',
    hardwareRevision: 'ATmega2560-16AU',
    lastHeartbeat: new Date().toISOString(),
    isOnline: true,
    pingLatencyMs: 4.8,
    calibration: DEFAULT_DEVICE_CALIBRATION,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'GFX-INVERTER-BAY-01',
    name: 'Solar MPPT & Inverter Gateway',
    type: 'INVERTER',
    status: 'ONLINE',
    location: 'Rooftop Array 1',
    siteId: 'SITE-KEC-CAMPUS-01',
    ipAddress: '192.168.1.108',
    firmwareVersion: 'v1.4.0',
    hardwareRevision: 'Victron-SmartSolar-150',
    lastHeartbeat: new Date().toISOString(),
    isOnline: true,
    pingLatencyMs: 22.1,
    calibration: DEFAULT_DEVICE_CALIBRATION,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'GFX-WEATHER-STATION-01',
    name: 'Solar Irradiance & Ambient Met Station',
    type: 'WEATHER_STATION',
    status: 'ONLINE',
    location: 'Meteorological Tower North',
    siteId: 'SITE-KEC-CAMPUS-01',
    ipAddress: '192.168.1.115',
    firmwareVersion: 'v2.1.0',
    hardwareRevision: 'Davis-VantagePro2',
    lastHeartbeat: new Date().toISOString(),
    isOnline: true,
    pingLatencyMs: 18.6,
    calibration: DEFAULT_DEVICE_CALIBRATION,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

/**
 * Fetches all registered microgrid devices, seeding defaults if the table is empty.
 */
export async function fetchAllDevices(): Promise<MicrogridDevice[]> {
  try {
    const { data, error } = await supabase
      .from('devices')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;

    if (!data || data.length === 0) {
      await seedDefaultDevices();
      return INITIAL_MICROGRID_DEVICES;
    }

    return data.map(mapDbDevice);
  } catch (error) {
    console.warn('Failed to fetch devices from Supabase, returning initial devices:', error);
    return INITIAL_MICROGRID_DEVICES;
  }
}

/**
 * Seeds default hardware inventory if `devices` table is empty
 */
export async function seedDefaultDevices(): Promise<void> {
  try {
    const rows = INITIAL_MICROGRID_DEVICES.map((d) => ({
      id: d.id,
      name: d.name,
      type: d.type,
      status: d.status,
      location: d.location,
      site_id: d.siteId,
      ip_address: d.ipAddress,
      mac_address: d.macAddress,
      firmware_version: d.firmwareVersion,
      hardware_revision: d.hardwareRevision,
      last_heartbeat: d.lastHeartbeat,
      is_online: d.isOnline,
      ping_latency_ms: d.pingLatencyMs,
      calibration: d.calibration,
      created_at: d.createdAt,
      updated_at: d.updatedAt,
    }));
    const { error } = await supabase.from('devices').upsert(rows, { onConflict: 'id' });
    if (error) throw error;
  } catch (error) {
    console.warn('Error seeding initial devices in Supabase:', error);
  }
}

/**
 * Subscribes to real-time device updates via Supabase Realtime
 */
export function subscribeToDevices(
  onUpdate: (devices: MicrogridDevice[]) => void,
  onError?: (err: Error) => void
): () => void {
  // Initial load
  fetchAllDevices().then(onUpdate).catch((err) => onError?.(err));

  const channel = supabase
    .channel('devices-realtime')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'devices' },
      () => {
        fetchAllDevices().then(onUpdate).catch((err) => onError?.(new Error(String(err))));
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Updates a device's online status and heartbeat timestamp
 */
export async function updateDeviceHeartbeat(
  deviceId: string,
  status: DeviceStatus,
  latencyMs: number
): Promise<void> {
  try {
    const { error } = await supabase
      .from('devices')
      .update({
        status,
        is_online: status === 'ONLINE',
        ping_latency_ms: latencyMs,
        last_heartbeat: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', deviceId);
    if (error) throw error;
  } catch (error) {
    console.error(`Failed to update heartbeat for device ${deviceId}:`, error);
  }
}

/**
 * Updates calibration constants for a specific hardware controller
 */
export async function updateDeviceCalibration(
  deviceId: string,
  calibration: Partial<DeviceCalibration>,
  actorUid: string
): Promise<void> {
  try {
    // Read existing calibration first
    const { data: existing } = await supabase
      .from('devices')
      .select('calibration')
      .eq('id', deviceId)
      .single();

    const merged = {
      ...(existing?.calibration || {}),
      ...calibration,
      lastCalibratedAt: new Date().toISOString(),
      calibratedByUid: actorUid,
    };

    const { error } = await supabase
      .from('devices')
      .update({
        calibration: merged,
        updated_at: new Date().toISOString(),
      })
      .eq('id', deviceId);
    if (error) throw error;
  } catch (error) {
    console.error(`Failed to update calibration for ${deviceId}:`, error);
    throw error;
  }
}

function mapDbDevice(row: any): MicrogridDevice {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    status: row.status,
    location: row.location,
    siteId: row.site_id,
    ipAddress: row.ip_address,
    macAddress: row.mac_address,
    firmwareVersion: row.firmware_version,
    hardwareRevision: row.hardware_revision,
    lastHeartbeat: row.last_heartbeat,
    isOnline: row.is_online,
    pingLatencyMs: row.ping_latency_ms,
    calibration: row.calibration || DEFAULT_DEVICE_CALIBRATION,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
