/**
 * ============================================================================
 * GridFlowX Alerts & Notification Rule Type Definitions
 * ============================================================================
 * Single source of truth for real-time fault notifications and configurable
 * threshold trigger rules in RTDB (`alerts/{alertId}`).
 */

export type AlertSeverity = 'CRITICAL' | 'WARNING' | 'INFO' | 'SUCCESS';

export type AlertCategory =
  | 'THERMAL'
  | 'VOLTAGE'
  | 'OVERCURRENT'
  | 'COMMUNICATION'
  | 'BATTERY_SOC'
  | 'HARDWARE_FAILSAFE'
  | 'AI_ANOMALY'
  | 'SYSTEM';

/**
 * System Fault / Notification Alert Document in RTDB (`alerts/{id}`)
 */
export interface AlertDocument {
  id: string;
  deviceId: string;
  severity: AlertSeverity;
  category: AlertCategory;
  title: string;
  message: string;
  timestamp: string; // ISO 8601 UTC

  /** Operator acknowledgement workflow */
  isAcknowledged: boolean;
  acknowledgedByUid?: string;
  acknowledgedAt?: string;

  /** Auto-clearing state */
  isAutoResolved: boolean;
  resolvedAt?: string;

  /** Snapshot of sensor conditions when the fault tripped */
  sensorSnapshot?: {
    solarPowerW?: number;
    batterySoc?: number;
    batteryTempC?: number;
    dcBusVoltageV?: number;
    core0FailsafeActive?: boolean;
  };
}

/**
 * Threshold-Based Automated Alert Trigger Rule
 */
export interface AlertRule {
  id: string;
  name: string;
  category: AlertCategory;
  metric: 'batteryTempC' | 'batterySoc' | 'dcBusVoltageV' | 'solarPowerW' | 'totalLoadPowerW';
  operator: '>' | '<' | '>=' | '<=' | '==';
  thresholdValue: number;
  severity: AlertSeverity;
  actionRequired: 'LOG_ONLY' | 'DISPATCH_EMAIL' | 'TRIGGER_LOAD_SHED' | 'EMERGENCY_STOP';
  isEnabled: boolean;
  hysteresisBand?: number; // Noise buffer before re-triggering
}

export const DEFAULT_ALERT_RULES: AlertRule[] = [
  {
    id: 'RULE-BATT-TEMP-CRITICAL',
    name: 'Battery High Temperature Cutoff',
    category: 'THERMAL',
    metric: 'batteryTempC',
    operator: '>=',
    thresholdValue: 55.0,
    severity: 'CRITICAL',
    actionRequired: 'EMERGENCY_STOP',
    isEnabled: true,
  },
  {
    id: 'RULE-BATT-SOC-LOW',
    name: 'Battery Deep Discharge Protection',
    category: 'BATTERY_SOC',
    metric: 'batterySoc',
    operator: '<=',
    thresholdValue: 20.0,
    severity: 'WARNING',
    actionRequired: 'TRIGGER_LOAD_SHED',
    isEnabled: true,
  },
  {
    id: 'RULE-BUS-VOLTAGE-UNDER',
    name: 'DC Bus Undervoltage Warning',
    category: 'VOLTAGE',
    metric: 'dcBusVoltageV',
    operator: '<',
    thresholdValue: 11.2,
    severity: 'WARNING',
    actionRequired: 'TRIGGER_LOAD_SHED',
    isEnabled: true,
  },
];
