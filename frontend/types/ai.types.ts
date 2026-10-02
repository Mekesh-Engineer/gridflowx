/**
 * ============================================================================
 * GridFlowX AI / ML Subsystem Type Definitions
 * ============================================================================
 * Single source of truth for ML models, solar/load forecasting, battery health
 * estimation, anomaly detection, and autonomous energy routing optimization.
 */

export type ModelType =
  | 'LSTM_SOLAR'
  | 'ARIMA_LOAD'
  | 'ISOLATION_FOREST_ANOMALY'
  | 'RL_DISPATCH'
  | 'XGBOOST_ENSEMBLE';

export type ModelStatus = 'ACTIVE' | 'STAGING' | 'TRAINING' | 'OFFLINE';

export interface ModelMetadata {
  modelId: string;
  name: string;
  version: string;
  type: ModelType;
  status: ModelStatus;
  driftScore: number;       // Concept drift metric (0.0 to 1.0)
  maeLoss: number;          // Mean Absolute Error on validation set
  accuracyPct: number;      // Empirical accuracy percentage
  inferenceLatencyMs: number;
  inputFeaturesCount: number;
  trainedAt: string;
  checkpointUri?: string;
}

export interface ModelRegistryResponse {
  success: boolean;
  models: ModelMetadata[];
  timestamp: string;
}

// ============================================================================
// 1. Solar PV & Load Demand Forecasting Contracts
// ============================================================================

export interface SolarForecastPoint {
  timestamp: string;        // ISO 8601 UTC
  predictedYieldW: number;  // Expected PV generation in Watts
  lowerBoundW: number;      // 10th percentile confidence interval
  upperBoundW: number;      // 90th percentile confidence interval
  irradianceWm2: number;    // Estimated solar irradiance (W/m²)
  ambientTempC: number;     // Estimated ambient temperature (°C)
}

export interface SolarForecastResult {
  deviceId: string;
  generatedAt: string;
  modelId: string;
  horizonHours: number;     // 1 to 72 hours
  confidencePct: number;
  dataPoints: SolarForecastPoint[];
}

export interface LoadForecastPoint {
  timestamp: string;
  predictedDemandW: number;
  tier1CriticalW: number;
  tier2ImportantW: number;
  tier3FlexibleW: number;
  lowerBoundW: number;
  upperBoundW: number;
}

export interface LoadForecastResult {
  deviceId: string;
  generatedAt: string;
  modelId: string;
  horizonHours: number;
  peakDemandW: number;
  peakDemandTimestamp: string;
  dataPoints: LoadForecastPoint[];
}

export interface ForecastAccuracyMetrics {
  deviceId: string;
  evaluatedAt: string;
  solarModel: {
    name: string;
    maeWm2: number;
    mapePct: number;
    rmseWm2: number;
    r2Score: number;
    status: string;
    sampleWindowHours: number;
  };
  loadModel: {
    name: string;
    maeWatts: number;
    mapePct: number;
    rmseWatts: number;
    r2Score: number;
    status: string;
    sampleWindowHours: number;
  };
}

// ============================================================================
// 2. Battery Energy Storage System (BESS) Health & Degradation Contracts
// ============================================================================

export type CellDegradationStatus = 'OPTIMAL' | 'MODERATE' | 'ACCELERATED' | 'CRITICAL';

export interface BatteryHealthAnalysis {
  deviceId: string;
  analyzedAt: string;
  stateOfHealthPct: number;             // Percentage capacity vs nominal (0-100%)
  stateOfChargePct: number;             // Current SoC
  internalResistanceOhms: number;       // Estimated DC internal resistance (ESR)
  totalCyclesCompleted: number;         // Cumulative equivalent full cycles
  estimatedRemainingLifetimeDays: number;
  degradationStatus: CellDegradationStatus;
  thermalStressIndex: number;           // Normalized thermal stress exposure (0-100)
  recommendedMaxChargeCurrentA: number; // Dynamic charge rate throttle
  actionRecommendations: string[];
}

// ============================================================================
// 3. Sensor & Hardware Anomaly Detection Contracts
// ============================================================================

export interface AnomalyItem {
  circuitName: string;
  metric: string;                       // e.g. 'battery_temperature', 'solar_current'
  anomalyScore: number;                 // Normalized anomaly score (0.0 normal -> 1.0 extreme fault)
  isAnomalous: boolean;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  observedValue: number;
  expectedRange: [number, number];      // [minExpected, maxExpected]
  rootCauseHypothesis: string;
}

export interface AnomalyDetectionResult {
  deviceId: string;
  timestamp: string;
  overallAnomalyDetected: boolean;
  isolationForestScore: number;         // Raw decision function output
  anomalies: AnomalyItem[];
  mitigationRecommendation?: string;
}

// ============================================================================
// 4. Energy Management System (EMS) Autonomous Decision Contracts
// ============================================================================

export type TariffWindow = 'OFF_PEAK' | 'STANDARD' | 'PEAK' | 'CRITICAL_PEAK';
export type DecisionStatus = 'PENDING_APPROVAL' | 'AUTO_APPLIED' | 'REJECTED' | 'EXPIRED';

export interface OptimizationDecision {
  decisionId: string;
  deviceId: string;
  timestamp: string;
  tariffWindow: TariffWindow;
  currentTariffRateUsdPerKwh: number;

  /** Recommended 8-channel relay output state */
  targetRelayStates: boolean[];
  /** Human-readable explanation of why this action was decided */
  actionSummary: string;
  reasoningTrace: string[];

  /** Expected economic & carbon benefits */
  estimatedCostSavingsUsd: number;
  estimatedCo2DisplacedKg: number;

  confidencePct: number;
  status: DecisionStatus;
  requiresSupervisorApproval: boolean;
}
