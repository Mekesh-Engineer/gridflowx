/**
 * ============================================================================
 * GridFlowX Relay & Actuator Type Definitions
 * ============================================================================
 * Single source of truth for 8-channel relay switching, manual overrides,
 * safety-critical emergency stops, and hardware acknowledgements.
 */

import { UserRole } from './roles';

/**
 * Standard 8-Channel Relay Matrix Assignments
 */
export enum RelayChannel {
  TIER_1_CRITICAL = 0,   // Critical Medical & Safety Loads (100% uptime SLA)
  TIER_2_IMPORTANT = 1,  // Communications & Edge Gateway
  TIER_3_FLEXIBLE = 2,   // HVAC / Non-Essential Appliances (First to shed)
  MPPT_SOLAR = 3,        // Solar PV MPPT Charger Connect/Disconnect
  GRID_INTERCONNECT = 4, // Utility Grid AC Bidirectional Switch
  INVERTER_MAIN = 5,     // DC-to-AC Main Inverter Contactor
  AUX_CHARGER = 6,       // Auxiliary Backup Generator / Rapid Charger
  SAFETY_ISOLATION = 7,  // Master Battery DC Safety Isolation Contactor
}

export interface RelayMetadata {
  channel: RelayChannel;
  name: string;
  loadTier: 'CRITICAL' | 'IMPORTANT' | 'FLEXIBLE' | 'SOURCE' | 'ISOLATION';
  description: string;
  nominalVoltageV: number;
  maxCurrentRatingA: number;
  failsafeDefaultState: boolean; // Safe state on power loss (true = closed/on, false = open/off)
}

export const RELAY_CHANNEL_METADATA: Record<RelayChannel, RelayMetadata> = {
  [RelayChannel.TIER_1_CRITICAL]: {
    channel: RelayChannel.TIER_1_CRITICAL,
    name: 'Tier 1 — Critical Infrastructure',
    loadTier: 'CRITICAL',
    description: 'Life-safety, emergency lighting, and MCU controllers',
    nominalVoltageV: 12.0,
    maxCurrentRatingA: 10.0,
    failsafeDefaultState: true,
  },
  [RelayChannel.TIER_2_IMPORTANT]: {
    channel: RelayChannel.TIER_2_IMPORTANT,
    name: 'Tier 2 — Important Systems',
    loadTier: 'IMPORTANT',
    description: 'Telemetry gateways, surveillance, and networking',
    nominalVoltageV: 12.0,
    maxCurrentRatingA: 10.0,
    failsafeDefaultState: true,
  },
  [RelayChannel.TIER_3_FLEXIBLE]: {
    channel: RelayChannel.TIER_3_FLEXIBLE,
    name: 'Tier 3 — Flexible / Sheddable Loads',
    loadTier: 'FLEXIBLE',
    description: 'Air conditioning, auxiliary heating, and non-essential appliances',
    nominalVoltageV: 12.0,
    maxCurrentRatingA: 10.0,
    failsafeDefaultState: false,
  },
  [RelayChannel.MPPT_SOLAR]: {
    channel: RelayChannel.MPPT_SOLAR,
    name: 'Solar MPPT Charger Enable',
    loadTier: 'SOURCE',
    description: 'Solar array connection to buck-boost MPPT stage',
    nominalVoltageV: 24.0,
    maxCurrentRatingA: 20.0,
    failsafeDefaultState: true,
  },
  [RelayChannel.GRID_INTERCONNECT]: {
    channel: RelayChannel.GRID_INTERCONNECT,
    name: 'Utility Grid Interconnect',
    loadTier: 'SOURCE',
    description: 'AC grid synchronization and power exchange relay',
    nominalVoltageV: 230.0,
    maxCurrentRatingA: 16.0,
    failsafeDefaultState: false,
  },
  [RelayChannel.INVERTER_MAIN]: {
    channel: RelayChannel.INVERTER_MAIN,
    name: 'Main DC/AC Inverter',
    loadTier: 'SOURCE',
    description: 'Primary microgrid pure sine wave inverter output',
    nominalVoltageV: 230.0,
    maxCurrentRatingA: 16.0,
    failsafeDefaultState: true,
  },
  [RelayChannel.AUX_CHARGER]: {
    channel: RelayChannel.AUX_CHARGER,
    name: 'Auxiliary Charger / Generator',
    loadTier: 'SOURCE',
    description: 'Backup diesel/gas generator transfer contactor',
    nominalVoltageV: 230.0,
    maxCurrentRatingA: 16.0,
    failsafeDefaultState: false,
  },
  [RelayChannel.SAFETY_ISOLATION]: {
    channel: RelayChannel.SAFETY_ISOLATION,
    name: 'Master Battery Safety Isolation',
    loadTier: 'ISOLATION',
    description: 'Hardware emergency disconnect for battery pack',
    nominalVoltageV: 48.0,
    maxCurrentRatingA: 30.0,
    failsafeDefaultState: true,
  },
};

/**
 * Manual Relay Override Command Payload
 */
export interface RelayOverrideCommand {
  deviceId: string;
  channel: RelayChannel;
  targetState: boolean;
  reason: string;
  durationMinutes?: number; // Optional auto-revert timer
  requestedByUid: string;
  requestedByRole: UserRole;
  timestamp: string;
}

/**
 * Safety-Critical Emergency Stop Command Payload
 */
export interface EmergencyStopCommand {
  deviceId: string;
  reason: string;
  requestedByUid: string;
  requestedByRole: UserRole;
  timestamp: string;
}

/**
 * Emergency Recovery Authorization Payload
 */
export interface RelayRecoveryCommand {
  deviceId: string;
  reason: string;
  authorizedByUid: string;
  authorizedByRole: UserRole;
  timestamp: string;
}

/**
 * Hardware Command Acknowledgement returned by FastAPI / ESP32
 */
export interface RelayCommandAck {
  commandId: string;
  deviceId: string;
  success: boolean;
  message: string;
  currentRelayStates: boolean[];
  executedAt: string;
  latencyMs: number;
}

/**
 * Persistent Relay State Document in RTDB (`relay_states/{deviceId}`)
 */
export interface RelayStateDocument {
  deviceId: string;
  states: boolean[];
  activeOverrides: {
    [channel: number]: {
      targetState: boolean;
      requestedByUid: string;
      reason: string;
      expiresAt?: string;
    };
  };
  lastModifiedAt: string;
  lastModifiedByUid: string;
  emergencyStopActive: boolean;
}
