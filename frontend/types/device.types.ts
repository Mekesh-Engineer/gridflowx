/**
 * ============================================================================
 * GridFlowX Edge Device & Hardware Inventory Type Definitions
 * ============================================================================
 * Single source of truth for microgrid controller nodes, calibration parameters,
 * and device lifecycle tracking in RTDB (`devices/{deviceId}`).
 */

export type DeviceType =
  | 'ESP32_MASTER'
  | 'MEGA_SLAVE'
  | 'INVERTER'
  | 'WEATHER_STATION'
  | 'BATTERY_BMS';

export type DeviceStatus =
  | 'ONLINE'
  | 'OFFLINE'
  | 'FAULT'
  | 'CALIBRATING'
  | 'MAINTENANCE';

/**
 * Sensor Calibration Parameters stored on device and synchronized with cloud
 */
export interface DeviceCalibration {
  /** Resistor divider ratio multiplier for solar PV voltage (default: 7.6667) */
  solarVoltageRatio: number;
  /** Resistor divider ratio multiplier for AC grid voltage (default: 5.5455) */
  gridVoltageRatio: number;
  /** Resistor divider ratio multiplier for battery voltage (default: 4.5946) */
  batteryVoltageRatio: number;

  /** ACS712 current probe sensitivity (Volts per Ampere, default: 0.100 for 20A model) */
  acs712SensitivityVpA: number;
  /** ACS712 zero-current voltage offset (Volts, default: 1.650V for 3.3V supply) */
  acs712ZeroOffsetV: number;

  /** Enclosure thermal warning threshold (°C, default: 50.0°C) */
  thermalWarningThresholdC: number;
  /** Enclosure thermal emergency cutoff threshold (°C, default: 65.0°C) */
  thermalCutoffThresholdC: number;

  /** Minimum battery voltage before mandatory load shedding (Volts, default: 11.5V) */
  minBatteryCutoffV: number;
  /** Maximum safe battery charging target voltage (Volts, default: 14.4V) */
  maxBatteryChargeV: number;

  /** ISO timestamp of last calibration */
  lastCalibratedAt: string;
  /** UID of operator/engineer who performed the calibration */
  calibratedByUid: string;
}

export const DEFAULT_DEVICE_CALIBRATION: DeviceCalibration = {
  solarVoltageRatio: (100.0 + 15.0) / 15.0, // 7.6667
  gridVoltageRatio: (100.0 + 22.0) / 22.0,  // 5.5455
  batteryVoltageRatio: (13.3 + 3.7) / 3.7,  // 4.5946
  acs712SensitivityVpA: 0.100,
  acs712ZeroOffsetV: 1.650,
  thermalWarningThresholdC: 50.0,
  thermalCutoffThresholdC: 65.0,
  minBatteryCutoffV: 11.5,
  maxBatteryChargeV: 14.4,
  lastCalibratedAt: new Date().toISOString(),
  calibratedByUid: 'SYSTEM_DEFAULT',
};

/**
 * Registered Microgrid Hardware Node Document
 */
export interface MicrogridDevice {
  /** Unique Device ID (e.g. 'GFX-ESP32-NODE-01') */
  id: string;
  name: string;
  type: DeviceType;
  status: DeviceStatus;
  location: string;
  siteId: string;

  /** Network connectivity */
  ipAddress?: string;
  macAddress?: string;
  firmwareVersion: string;
  hardwareRevision: string;

  /** Heartbeat & telemetry tracking */
  lastHeartbeat: string;
  isOnline: boolean;
  pingLatencyMs: number;

  /** Active sensor calibration profile */
  calibration: DeviceCalibration;

  createdAt: string;
  updatedAt: string;
}
