/**
 * ============================================================================
 * GridFlowX Centralized API Route Configuration
 * ============================================================================
 * Defines canonical API endpoints for Next.js API Routes & FastAPI AI Microservice.
 */

export const API_ROUTES = {
  // Telemetry & Real-Time Ingestion
  TELEMETRY_LIVE: '/api/v1/telemetry/live',
  TELEMETRY_HISTORY: '/api/v1/telemetry/history',
  TELEMETRY_STATS: '/api/v1/telemetry/stats',

  // Relay Switching & Hardware Safety
  RELAY_OVERRIDE: '/api/v1/relays/override',
  RELAY_EMERGENCY_STOP: '/api/v1/relays/emergency-stop',
  RELAY_RECOVERY: '/api/v1/relays/recovery',
  RELAY_STATES: '/api/v1/relays/states',

  // Edge Hardware & Calibration
  DEVICES: '/api/v1/devices',
  DEVICE_CALIBRATION: '/api/v1/devices/calibration',
  DEVICE_OTA_FLASH: '/api/v1/devices/ota-flash',

  // AI / ML Forecasting & Health Analytics
  AI_FORECAST_SOLAR: '/api/v1/ai/forecast/solar',
  AI_FORECAST_LOAD: '/api/v1/ai/forecast/load',
  AI_BATTERY_HEALTH: '/api/v1/ai/battery/health',
  AI_ANOMALY_DETECT: '/api/v1/ai/anomaly/detect',
  AI_OPTIMIZATION_DISPATCH: '/api/v1/ai/optimization/dispatch',
  AI_MODEL_REGISTRY: '/api/v1/ai/models',
  AI_MODEL_RETRAIN: '/api/v1/ai/models/retrain',

  // Alerts & Notification Rules
  ALERTS: '/api/v1/alerts',
  ALERT_RULES: '/api/v1/alerts/rules',
  ALERT_ACKNOWLEDGE: '/api/v1/alerts/acknowledge',

  // Compliance & Audit Logging
  AUDIT_LOGS: '/api/v1/audit/logs',

  // Support & Ticketing
  SUPPORT_TICKETS: '/api/support/ticket',
} as const;

export const WS_ROUTES = {
  TELEMETRY_STREAM: '/ws/telemetry',
  CLIENT_DASHBOARD: '/ws/client',
} as const;
