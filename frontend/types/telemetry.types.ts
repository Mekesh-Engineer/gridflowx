/**
 * ============================================================================
 * GridFlowX Telemetry Type Definitions
 * ============================================================================
 * Single source of truth for 1Hz real-time telemetry frames, historical records,
 * and time-series aggregation payloads across ESP32, FastAPI, RTDB, and Next.js.
 */

/**
 * Real-time 1Hz Telemetry Frame emitted by ESP32 edge controller and relayed via WebSocket.
 */
export interface TelemetryFrame {
  /** Unique hardware identifier of the reporting edge controller (e.g. 'GFX-ESP32-01') */
  deviceId: string;
  /** ISO 8601 UTC timestamp of packet acquisition */
  timestamp: string;
  /** Monotonically increasing sequence index to detect frame drops */
  sequenceNumber: number;

  // --- Solar Photovoltaic Subsystem ---
  /** Solar PV input voltage from precision divider (Volts) */
  solarVoltageV: number;
  /** Solar PV input current from ACS712 sensor (Amperes) */
  solarCurrentA: number;
  /** Instantaneous solar generation (Watts = V * A) */
  solarPowerW: number;

  // --- Utility Grid Subsystem ---
  /** Grid AC root-mean-square voltage (Volts) */
  gridVoltageV: number;
  /** Grid AC line frequency (Hz, nominal 50.0 / 60.0) */
  gridFrequencyHz: number;
  /** Instantaneous grid import (+) or export (-) power (Watts) */
  gridPowerW: number;

  // --- Battery Energy Storage System (BESS) ---
  /** Pack terminal DC voltage (Volts, 12V / 48V nominal) */
  batteryVoltageV: number;
  /** Pack charge (+) or discharge (-) current (Amperes) */
  batteryCurrentA: number;
  /** State of Charge percentage (0.0% to 100.0%) */
  batterySoc: number;
  /** State of Health estimation percentage (0.0% to 100.0%) */
  batterySoh: number;
  /** Battery pack enclosure temperature from DS18B20 1-Wire probe (°C) */
  batteryTempC: number;

  // --- DC Distribution Bus & Loads ---
  /** Common DC Bus regulated voltage (Volts) */
  dcBusVoltageV: number;
  /** Aggregated load consumption power across all active tiers (Watts) */
  totalLoadPowerW: number;

  // --- Actuator & Safety Loop State ---
  /** 8-channel relay output state matrix [ch0..ch7] */
  relayStates: boolean[];
  /** Flag indicating whether the FreeRTOS Core 0 hardware failsafe cutoff is currently tripped */
  core0FailsafeActive: boolean;
}

/**
 * Historical Telemetry Record stored in Supabase PostgreSQL (`telemetry` table).
 */
export interface TelemetryRecord extends TelemetryFrame {
  /** Unique database key */
  id: string;
  /** Server ingestion timestamp */
  ingestedAt: string;
}

/**
 * Query parameters for historical telemetry filtering
 */
export interface TelemetryQueryParams {
  deviceId: string;
  startDate?: string;
  endDate?: string;
  limitCount?: number;
  resolution?: 'raw' | '1m' | '5m' | '1h' | '1d';
}

/**
 * Aggregated Telemetry Statistics for KPI summaries and analytics reporting
 */
export interface TelemetryAggregatedStats {
  deviceId: string;
  timeRangeStart: string;
  timeRangeEnd: string;
  sampleCount: number;

  // Solar Aggregates
  avgSolarPowerW: number;
  peakSolarPowerW: number;
  totalSolarEnergyKwh: number;

  // Load Aggregates
  avgLoadPowerW: number;
  peakLoadPowerW: number;
  totalLoadEnergyKwh: number;

  // Grid Aggregates
  totalGridImportKwh: number;
  totalGridExportKwh: number;
  netGridCostEstimateUsd: number;

  // Battery Aggregates
  minBatterySoc: number;
  maxBatterySoc: number;
  avgBatterySoc: number;
  avgBatteryTempC: number;
  maxBatteryTempC: number;

  // System Reliability
  systemUptimeSeconds: number;
  failsafeTripsCount: number;
}
