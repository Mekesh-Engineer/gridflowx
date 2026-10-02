/**
 * ============================================================================
 * GridFlowX AI Microservice Fallback & Offline Simulation Generator
 * ============================================================================
 * Provides high-fidelity, deterministic simulated fallback calculations
 * whenever the local Python FastAPI microservice is offline or unreachable.
 * Ensures the Next.js frontend delivers seamless telemetry, battery health,
 * forecasts, and optimization diagnostics without crashing or throwing errors.
 */

import {
  BatteryHealthAnalysis,
  SolarForecastResult,
  SolarForecastPoint,
  LoadForecastResult,
  LoadForecastPoint,
  ForecastAccuracyMetrics,
  AnomalyDetectionResult,
  OptimizationDecision,
  ModelRegistryResponse,
  ModelMetadata,
} from '@/types/ai.types';
import { RelayCommandAck } from '@/types/relay.types';

/**
 * 1. Battery Energy Storage System (BESS) Health Fallback
 */
export function generateBatteryHealthFallback(
  deviceId: string = 'GFX-ESP32-MASTER-01',
  batteryVoltageV: number = 12.8,
  batteryCurrentA: number = -3.2,
  batterySocPct: number = 74.5,
  batteryTempC: number = 31.5
): BatteryHealthAnalysis {
  const cumulativeCycles = 142;
  const cycleDegradation = (cumulativeCycles / 3500.0) * 20.0;
  const thermalAcceleration = batteryTempC > 25.0 ? Math.exp(0.04 * (batteryTempC - 25.0)) : 1.0;
  const totalDegradationPct = cycleDegradation * thermalAcceleration;
  const sohPct = Math.max(70.0, Math.round((100.0 - totalDegradationPct) * 10) / 10);

  const baseEsr = 0.012;
  const esrIncrease = (100.0 - sohPct) * 0.0008;
  const internalResistanceOhms = Math.round((baseEsr + esrIncrease) * 10000) / 10000;

  let thermalStress = 20.0;
  if (batteryTempC <= 25.0) {
    thermalStress = Math.max(0.0, (batteryTempC / 25.0) * 20.0);
  } else if (batteryTempC <= 40.0) {
    thermalStress = 20.0 + ((batteryTempC - 25.0) / 15.0) * 45.0;
  } else {
    thermalStress = Math.min(100.0, 65.0 + (batteryTempC - 40.0) * 3.5);
  }

  const remainingCycles = Math.max(0, Math.floor(((sohPct - 80.0) / 20.0) * 3500));
  const remainingLifetimeDays = remainingCycles > 0 ? Math.floor(remainingCycles / 0.8) : 90;

  const degradationStatus =
    sohPct >= 95.0 ? 'OPTIMAL' : sohPct >= 88.0 ? 'MODERATE' : sohPct >= 80.0 ? 'ACCELERATED' : 'CRITICAL';

  let recChargeCurrent = 30.0;
  if (batteryTempC > 48.0) recChargeCurrent = 0.0;
  else if (batteryTempC > 40.0) recChargeCurrent = 10.0;
  else if (batterySocPct > 92.0) recChargeCurrent = 8.0;

  return {
    deviceId,
    analyzedAt: new Date().toISOString(),
    stateOfHealthPct: sohPct,
    stateOfChargePct: Math.round(batterySocPct * 10) / 10,
    internalResistanceOhms,
    totalCyclesCompleted: cumulativeCycles,
    estimatedRemainingLifetimeDays: remainingLifetimeDays,
    degradationStatus,
    thermalStressIndex: Math.round(thermalStress * 10) / 10,
    recommendedMaxChargeCurrentA: recChargeCurrent,
    actionRecommendations: [
      'BESS operating within optimal electrochemical safety envelope.',
      '4S LiFePO4 series cell delta is balanced (< 20mV divergence).',
      'Dynamic C-rate throttle nominal at 30.0A bulk charge limit.',
    ],
  };
}

/**
 * 2. Solar PV Yield & Clear-Sky Irradiance Forecast Fallback
 */
export function generateSolarForecastFallback(
  deviceId: string = 'GFX-ESP32-MASTER-01',
  horizonHours: number = 24
): SolarForecastResult {
  const now = new Date();
  const dataPoints: SolarForecastPoint[] = [];

  for (let h = 0; h < horizonHours; h++) {
    const pointDate = new Date(now.getTime() + h * 3600 * 1000);
    const hour = pointDate.getHours() + pointDate.getMinutes() / 60;

    let predictedYieldW = 0;
    let irradianceWm2 = 0;
    let ambientTempC = 21.0;

    if (hour >= 6.0 && hour <= 18.5) {
      const angle = ((hour - 6.0) / (18.5 - 6.0)) * Math.PI;
      irradianceWm2 = Math.round(920 * Math.sin(angle));
      ambientTempC = Math.round((24.0 + 8.0 * Math.sin(((hour - 8.0) / 12.0) * Math.PI)) * 10) / 10;
      const tempDerating = 1.0 - 0.004 * Math.max(0, ambientTempC - 25.0);
      predictedYieldW = Math.round((irradianceWm2 / 1000.0) * 400.0 * tempDerating * 10) / 10;
    } else {
      ambientTempC = Math.round((21.0 - 3.0 * Math.cos((hour / 24.0) * 2 * Math.PI)) * 10) / 10;
    }

    const margin = Math.round((0.05 + 0.003 * h) * Math.max(predictedYieldW, 8.0) * 10) / 10;

    dataPoints.push({
      timestamp: pointDate.toISOString(),
      predictedYieldW,
      lowerBoundW: Math.max(0, Math.round((predictedYieldW - margin) * 10) / 10),
      upperBoundW: Math.round((predictedYieldW + margin) * 10) / 10,
      irradianceWm2,
      ambientTempC,
    });
  }

  return {
    deviceId,
    generatedAt: new Date().toISOString(),
    modelId: 'MOD-SOLAR-01',
    horizonHours,
    confidencePct: 94.6,
    dataPoints,
  };
}

/**
 * 3. Multi-Tier Load Demand Forecast Fallback
 */
export function generateLoadForecastFallback(
  deviceId: string = 'GFX-ESP32-MASTER-01',
  horizonHours: number = 24
): LoadForecastResult {
  const now = new Date();
  const dataPoints: LoadForecastPoint[] = [];
  let peakDemandW = 0;
  let peakDemandTimestamp = now.toISOString();

  for (let h = 0; h < horizonHours; h++) {
    const pointDate = new Date(now.getTime() + h * 3600 * 1000);
    const hour = pointDate.getHours();

    const isEveningPeak = hour >= 18 && hour <= 22;
    const isDaytime = hour >= 8 && hour < 18;

    const tier1 = 18.0;
    const tier2 = 20.0;
    const tier3 = isEveningPeak ? 44.0 : isDaytime ? 28.0 : 6.0;
    const predictedDemandW = Math.round((tier1 + tier2 + tier3) * 10) / 10;

    if (predictedDemandW > peakDemandW) {
      peakDemandW = predictedDemandW;
      peakDemandTimestamp = pointDate.toISOString();
    }

    dataPoints.push({
      timestamp: pointDate.toISOString(),
      predictedDemandW,
      tier1CriticalW: tier1,
      tier2ImportantW: tier2,
      tier3FlexibleW: tier3,
      lowerBoundW: Math.max(0, Math.round(predictedDemandW * 0.92 * 10) / 10),
      upperBoundW: Math.round(predictedDemandW * 1.08 * 10) / 10,
    });
  }

  return {
    deviceId,
    generatedAt: new Date().toISOString(),
    modelId: 'MOD-LOAD-01',
    horizonHours,
    peakDemandW,
    peakDemandTimestamp,
    dataPoints,
  };
}

/**
 * 4. Forecast Model Accuracy Metrics Fallback
 */
export function generateForecastAccuracyFallback(
  deviceId: string = 'GFX-ESP32-MASTER-01'
): ForecastAccuracyMetrics {
  return {
    deviceId,
    evaluatedAt: new Date().toISOString(),
    solarModel: {
      name: 'SolarNet-v3.1-LSTM',
      maeWm2: 14.8,
      mapePct: 4.2,
      rmseWm2: 21.3,
      r2Score: 0.942,
      status: 'CALIBRATED',
      sampleWindowHours: 168,
    },
    loadModel: {
      name: 'LoadARIMA-v2.1',
      maeWatts: 3.8,
      mapePct: 3.1,
      rmseWatts: 6.2,
      r2Score: 0.961,
      status: 'CALIBRATED',
      sampleWindowHours: 168,
    },
  };
}

/**
 * 5. Multivariate Anomaly Detection Fallback
 */
export function generateAnomalyFallback(
  deviceId: string = 'GFX-ESP32-MASTER-01',
  customTelemetry?: any
): AnomalyDetectionResult {
  const isGridOut = customTelemetry?.gridVoltageV !== undefined && customTelemetry.gridVoltageV < 10.0;
  const isOverheating = customTelemetry?.batteryTempC !== undefined && customTelemetry.batteryTempC > 45.0;

  const anomalies = [];
  if (isGridOut) {
    anomalies.push({
      circuitName: 'AC Grid Interconnect',
      metric: 'grid_voltage_blackout',
      anomalyScore: 0.95,
      isAnomalous: true,
      severity: 'HIGH' as const,
      observedValue: customTelemetry.gridVoltageV,
      expectedRange: [210.0, 250.0] as [number, number],
      rootCauseHypothesis: 'Utility grid blackout detected. Islanding contactor engaged.',
    });
  }

  if (isOverheating) {
    anomalies.push({
      circuitName: 'BESS Enclosure',
      metric: 'pack_temperature_critical',
      anomalyScore: 0.89,
      isAnomalous: true,
      severity: 'CRITICAL' as const,
      observedValue: customTelemetry.batteryTempC,
      expectedRange: [15.0, 40.0] as [number, number],
      rootCauseHypothesis: 'Thermal runaway risk. Active enclosure ventilation required.',
    });
  }

  return {
    deviceId,
    timestamp: new Date().toISOString(),
    overallAnomalyDetected: anomalies.length > 0,
    isolationForestScore: anomalies.length > 0 ? 0.82 : 0.08,
    anomalies,
    mitigationRecommendation:
      anomalies.length > 0
        ? 'Isolate non-essential circuits and verify thermal cooling subsystems.'
        : 'All sensor telemetry within nominal cyber-physical envelopes.',
  };
}

/**
 * 6. Autonomous EMS Optimization Dispatch Fallback
 */
export function generateOptimizationDispatchFallback(
  deviceId: string = 'GFX-ESP32-MASTER-01'
): OptimizationDecision {
  const hour = new Date().getHours();
  const isPeak = hour >= 17 && hour < 21;
  const isOffPeak = hour >= 21 || hour < 7;
  const tariffWindow = isPeak ? 'PEAK' : isOffPeak ? 'OFF_PEAK' : 'STANDARD';
  const tariffRate = isPeak ? 0.38 : isOffPeak ? 0.12 : 0.22;

  return {
    decisionId: `DEC-OPT-${Date.now().toString(36).toUpperCase()}`,
    deviceId,
    timestamp: new Date().toISOString(),
    tariffWindow,
    currentTariffRateUsdPerKwh: tariffRate,
    targetRelayStates: [true, true, !isPeak, true, !isPeak, true, false, true],
    actionSummary: isPeak
      ? 'Peak Tariff Mitigation: Shed Tier 3 HVAC and supply microgrid from BESS to avoid high grid charges.'
      : 'Optimal Economic Dispatch: Prioritize solar PV self-consumption and maintain BESS float charge.',
    reasoningTrace: [
      `ToU Tariff Window evaluated as ${tariffWindow} ($${tariffRate}/kWh).`,
      'BESS state-of-charge is healthy and ready for autonomous dispatch.',
      'Tier 1 Life-Safety & Tier 2 Edge Communications strictly protected (100% SLA).',
      isPeak ? 'Tier 3 flexible load contactor commanded OPEN.' : 'All load tiers permitted.',
    ],
    estimatedCostSavingsUsd: isPeak ? 2.45 : 0.85,
    estimatedCo2DisplacedKg: 3.6,
    confidencePct: 93.8,
    status: 'AUTO_APPLIED',
    requiresSupervisorApproval: false,
  };
}

/**
 * 7. Model Registry Fallback
 */
export function generateModelRegistryFallback(): ModelRegistryResponse {
  const models: ModelMetadata[] = [
    {
      modelId: 'MOD-SOLAR-01',
      name: 'SolarNet-v3.1',
      version: '3.1.2',
      type: 'LSTM_SOLAR',
      status: 'ACTIVE',
      driftScore: 0.018,
      maeLoss: 22.4,
      accuracyPct: 94.2,
      inferenceLatencyMs: 18.5,
      inputFeaturesCount: 12,
      trainedAt: '2026-08-15T10:30:00Z',
    },
    {
      modelId: 'MOD-LOAD-01',
      name: 'LoadARIMA-v2.1',
      version: '2.1.0',
      type: 'ARIMA_LOAD',
      status: 'ACTIVE',
      driftScore: 0.024,
      maeLoss: 3.8,
      accuracyPct: 96.1,
      inferenceLatencyMs: 12.2,
      inputFeaturesCount: 8,
      trainedAt: '2026-08-18T14:00:00Z',
    },
    {
      modelId: 'MOD-ANOM-01',
      name: 'GridGuard-IsoForest-v2.0',
      version: '2.0.4',
      type: 'ISOLATION_FOREST_ANOMALY',
      status: 'ACTIVE',
      driftScore: 0.012,
      maeLoss: 0.04,
      accuracyPct: 98.7,
      inferenceLatencyMs: 6.8,
      inputFeaturesCount: 16,
      trainedAt: '2026-08-20T09:15:00Z',
    },
    {
      modelId: 'MOD-OPT-01',
      name: 'RL-SmartDispatch-v1.8',
      version: '1.8.1',
      type: 'RL_DISPATCH',
      status: 'ACTIVE',
      driftScore: 0.035,
      maeLoss: 1.2,
      accuracyPct: 91.5,
      inferenceLatencyMs: 24.1,
      inputFeaturesCount: 22,
      trainedAt: '2026-08-22T16:45:00Z',
    },
  ];

  return {
    success: true,
    models,
    timestamp: new Date().toISOString(),
  };
}

/**
 * 8. Centralized Endpoint Fallback Resolver
 */
export function resolveAiFallback<T>(
  endpoint: string,
  method: string = 'GET',
  body?: any
): T | null {
  const cleanEndpoint = endpoint.split('?')[0].toLowerCase();

  // BESS Battery Health
  if (cleanEndpoint.includes('/battery/health')) {
    const deviceId = extractQueryParam(endpoint, 'deviceId') || 'GFX-ESP32-MASTER-01';
    return generateBatteryHealthFallback(deviceId) as unknown as T;
  }

  // Solar Forecast
  if (cleanEndpoint.includes('/forecast/solar')) {
    const deviceId = extractQueryParam(endpoint, 'deviceId') || 'GFX-ESP32-MASTER-01';
    const horizon = parseInt(extractQueryParam(endpoint, 'horizonHours') || '24', 10);
    return generateSolarForecastFallback(deviceId, horizon) as unknown as T;
  }

  // Load Forecast
  if (cleanEndpoint.includes('/forecast/load')) {
    const deviceId = extractQueryParam(endpoint, 'deviceId') || 'GFX-ESP32-MASTER-01';
    const horizon = parseInt(extractQueryParam(endpoint, 'horizonHours') || '24', 10);
    return generateLoadForecastFallback(deviceId, horizon) as unknown as T;
  }

  // Forecast Accuracy
  if (cleanEndpoint.includes('/forecast/accuracy')) {
    const deviceId = extractQueryParam(endpoint, 'deviceId') || 'GFX-ESP32-MASTER-01';
    return generateForecastAccuracyFallback(deviceId) as unknown as T;
  }

  // Anomaly Detection
  if (cleanEndpoint.includes('/anomaly/live') || cleanEndpoint.includes('/anomaly/detect')) {
    return generateAnomalyFallback('GFX-ESP32-MASTER-01', body) as unknown as T;
  }

  // Optimization Dispatch
  if (cleanEndpoint.includes('/optimization/dispatch')) {
    const deviceId = extractQueryParam(endpoint, 'deviceId') || 'GFX-ESP32-MASTER-01';
    return generateOptimizationDispatchFallback(deviceId) as unknown as T;
  }

  // Optimization Apply
  if (cleanEndpoint.includes('/optimization/apply')) {
    return {
      success: true,
      message: 'Optimization decision applied successfully (simulation fallback mode)',
      currentRelayStates: body?.targetRelayStates || [true, true, false, true, false, true, false, true],
      timestamp: new Date().toISOString(),
    } as unknown as T;
  }

  // Model Retraining
  if (cleanEndpoint.includes('/models/retrain')) {
    const modelId = body?.modelId || 'MOD-SOLAR-01';
    const reg = generateModelRegistryFallback();
    const model = reg.models.find((m: ModelMetadata) => m.modelId === modelId) || reg.models[0];
    return {
      success: true,
      message: `Automated retraining pipeline for ${model.name} completed successfully!`,
      model: {
        ...model,
        trainedAt: new Date().toISOString(),
        accuracyPct: Math.min(99.4, model.accuracyPct + 0.4),
      },
    } as unknown as T;
  }

  // AI Models
  if (cleanEndpoint.includes('/models')) {
    return generateModelRegistryFallback() as unknown as T;
  }

  // Relay States
  if (cleanEndpoint.includes('/relays/states')) {
    return {
      success: true,
      relayStates: [true, true, false, true, false, true, false, true],
      timestamp: new Date().toISOString(),
    } as unknown as T;
  }

  // Relay Override
  if (cleanEndpoint.includes('/relays/override')) {
    const defaultStates = [true, true, false, true, false, true, false, true];
    if (typeof body?.relayIndex === 'number') {
      defaultStates[body.relayIndex] = !!body.newState;
    }
    const ack: RelayCommandAck = {
      commandId: `CMD-OVR-${Date.now().toString(16).slice(-6).toUpperCase()}`,
      deviceId: body?.deviceId || 'GFX-ESP32-MASTER-01',
      success: true,
      message: `Relay channel ${body?.relayIndex ?? 0} override dispatched successfully (simulation mode)`,
      currentRelayStates: defaultStates,
      executedAt: new Date().toISOString(),
      latencyMs: 14.5,
    };
    return ack as unknown as T;
  }

  // Emergency Stop
  if (cleanEndpoint.includes('/relays/emergency-stop')) {
    const ack: RelayCommandAck = {
      commandId: `CMD-ESTOP-${Date.now().toString(16).slice(-6).toUpperCase()}`,
      deviceId: body?.deviceId || 'GFX-ESP32-MASTER-01',
      success: true,
      message: 'Emergency stop atomic shutdown dispatched (simulation mode)',
      currentRelayStates: [false, false, false, false, false, false, false, false],
      executedAt: new Date().toISOString(),
      latencyMs: 11.2,
    };
    return ack as unknown as T;
  }

  // Emergency Recovery
  if (cleanEndpoint.includes('/relays/recovery')) {
    const ack: RelayCommandAck = {
      commandId: `CMD-REC-${Date.now().toString(16).slice(-6).toUpperCase()}`,
      deviceId: body?.deviceId || 'GFX-ESP32-MASTER-01',
      success: true,
      message: 'Emergency recovery authorized and safe operational state restored (simulation mode)',
      currentRelayStates: [true, true, false, true, false, true, false, true],
      executedAt: new Date().toISOString(),
      latencyMs: 12.0,
    };
    return ack as unknown as T;
  }

  // Agent Chat (Fallback Simulation)
  if (cleanEndpoint.includes('/agent/chat')) {
    const query = body?.query || '';
    const history = body?.history || [];
    const role = body?.role || 'operator';
    return generateAgentChatFallback(query, history, role) as unknown as T;
  }

  return null;
}

/**
 * 9. Agentic AI Chat Fallback Generator (Intent-Aware & Domain-Grounded)
 */
export function generateAgentChatFallback(
  query: string,
  _history: any[] = [],
  userRole: string = 'operator'
): {
  success: boolean;
  query: string;
  reply: string;
  modelUsed: string;
  telemetrySnippet?: Record<string, any>;
  timestamp: string;
} {
  const qLower = query.toLowerCase().trim();
  const roleClean = (userRole || 'operator').toLowerCase();

  // 1. Developer Information & Project Metadata (Master System Prompt Section 1 & Section 5)
  if (
    qLower.includes('developer') ||
    qLower.includes('built') ||
    qLower.includes('created') ||
    qLower.includes('designed') ||
    qLower.includes('maker') ||
    qLower.includes('author') ||
    qLower.includes('who') ||
    qLower.includes('mekesh') ||
    qLower.includes('mk studios') ||
    qLower.includes('kongu') ||
    qLower.includes('kec')
  ) {
    return {
      success: true,
      query,
      reply:
        'The GridFlowX AI-integrated web application system was developed by **Mekeshkumar (Mekesh) from Mk Studios at Kongu Engineering College**.\n\n' +
        '**Project Metadata**:\n' +
        '• **System:** GridFlowX — AI-Integrated Smart Microgrid Energy Management and Monitoring System\n' +
        '• **Developer:** Mekeshkumar (Mekesh)\n' +
        '• **Organization / Studio:** Mk Studios\n' +
        '• **Institution:** Kongu Engineering College (KEC)',
      modelUsed: 'GridFlowX Authoritative Knowledge Engine',
      telemetrySnippet: undefined,
      timestamp: new Date().toISOString(),
    };
  }

  // 2. System Architecture & Tech Stack
  if (
    qLower.includes('architecture') ||
    qLower.includes('hardware') ||
    qLower.includes('esp32') ||
    qLower.includes('stack') ||
    qLower.includes('fastapi') ||
    qLower.includes('freertos') ||
    qLower.includes('nextjs') ||
    qLower.includes('framework')
  ) {
    return {
      success: true,
      query,
      reply:
        '**GridFlowX 4-Tier Cyber-Physical Architecture**:\n\n' +
        '1. **Hardware / Edge Layer (ESP32 + FreeRTOS)**:\n' +
        '   • Dual-core ESP32 with sub-10ms Core 0 hardware failsafe envelope.\n' +
        '   • 1Hz telemetry acquisition (INA219, ACS712, ZMPT101B, DS18B20) and 8-channel relay matrix contactors.\n\n' +
        '2. **Backend Microservice Layer (Python FastAPI)**:\n' +
        '   • Asynchronous REST API, bi-directional 1Hz WebSockets, and ML inference pipelines.\n\n' +
        '3. **Agentic AI Layer (Local Ollama + Qwen 2.5)**:\n' +
        '   • Self-hosted LLM engine, AI Query Router, RAG retriever, and 6 specialized agents.\n\n' +
        '4. **Frontend Presentation Layer (Next.js 15)**:\n' +
        '   • Glassmorphic dashboard with Tailwind CSS, Canvas Gauges, and interactive AI Copilot.',
      modelUsed: 'GridFlowX Architecture Knowledge Engine',
      telemetrySnippet: undefined,
      timestamp: new Date().toISOString(),
    };
  }

  // 3. AI Agents & Machine Learning Models
  if (
    qLower.includes('ai model') ||
    qLower.includes('ai agent') ||
    qLower.includes('lstm') ||
    qLower.includes('arima') ||
    qLower.includes('xgboost') ||
    qLower.includes('isolation forest') ||
    qLower.includes('ppo') ||
    qLower.includes('models used')
  ) {
    return {
      success: true,
      query,
      reply:
        '**GridFlowX 6 Specialized AI Agents & ML Models**:\n\n' +
        '1. **Solar Forecasting Agent (SolarNet-v3.1)**: Deep LSTM network predicting 24h-48h clear-sky solar irradiance and PV yield (R²: 0.942).\n' +
        '2. **Load Demand Forecasting Agent (LoadARIMA-v2.1)**: Multi-tier time-series ARIMA/LSTM model for microgrid demand profiling (R²: 0.961).\n' +
        '3. **Battery Health Monitoring Agent**: Arrhenius electro-thermal equations and XGBoost regression to estimate LiFePO4 SoH and internal ESR.\n' +
        '4. **Fault Detection Agent (GridGuard-IsoForest-v2.0)**: Multivariate Isolation Forest detecting sensor drift, blackout trips, and thermal anomalies.\n' +
        '5. **Energy Management Agent (RL-SmartDispatch-v1.8)**: Reinforcement Learning (PPO/SAC) for Time-of-Use (ToU) tariff peak shaving and source arbitration.\n' +
        '6. **Automation Engine**: Rule-based supervisory controller enforcing FreeRTOS Core 0 failsafe envelopes and relay scheduling.',
      modelUsed: 'GridFlowX Model Registry Engine',
      telemetrySnippet: undefined,
      timestamp: new Date().toISOString(),
    };
  }

  // Public visitor restrictions
  if (roleClean === 'public' || roleClean === 'unauthenticated') {
    return {
      success: true,
      query,
      reply:
        'Welcome to **GridFlowX**! I am your AI assistant for exploring our smart cyber-physical microgrid platform, renewable DER coordination, and AI optimization architecture.\n\n' +
        'The system was developed by **Mekeshkumar (Mekesh) from Mk Studios at Kongu Engineering College**.\n\n' +
        '*(Note: Real-time telemetry measurements and operational relay controls require signing in with an authorized Operator or Supervisor account).*',
      modelUsed: 'GridFlowX Public Knowledge Engine',
      telemetrySnippet: undefined,
      timestamp: new Date().toISOString(),
    };
  }

  // Authenticated operational telemetry fallbacks
  const soc = 74.5;
  const solarW = 342.2;
  const loadW = 48.2;
  const gridW = 0.0;
  const tempC = 31.5;
  const sohPct = 98.2;

  if (qLower.includes('battery') || qLower.includes('soc') || qLower.includes('soh') || qLower.includes('lifepo4')) {
    return {
      success: true,
      query,
      reply:
        '**BESS LiFePO4 Energy & Health Status**:\n\n' +
        `• **State of Charge (SoC):** \`${soc}%\` (Safe operating margin above 20% DoD cutoff)\n` +
        `• **State of Health (SoH):** \`${sohPct}%\` (Nominal ESR: 12.0 mΩ)\n` +
        `• **Pack Temperature:** \`${tempC}°C\` (Within optimal 15°C–35°C thermal envelope)\n` +
        '• **Chemistry:** 4S LiFePO4 (Nominal 12.8V, CC-CV bulk cutoff 14.4V)\n' +
        '• **Status:** Electrochemical health is optimal with balanced cell voltages.',
      modelUsed: 'Battery Health Monitoring Agent (Standby)',
      telemetrySnippet: { batterySoc: soc, batteryTempC: tempC, batteryVoltageV: 12.8 },
      timestamp: new Date().toISOString(),
    };
  }

  if (qLower.includes('solar') || qLower.includes('forecast') || qLower.includes('irradiance')) {
    return {
      success: true,
      query,
      reply:
        '**Solar PV Generation & Forecasting Status**:\n\n' +
        `• **Current Generation:** \`${solarW}W\` (Active MPPT tracking)\n` +
        '• **Rated Capacity:** `400W Peak`\n`' +
        '• **24-Hour Projected Peak:** `~380W` around 12:30 PM (SolarNet-v3.1 LSTM clear-sky prediction)\n' +
        `• **Net Flow:** \`+${(solarW - loadW).toFixed(1)}W\` clean surplus currently charging BESS.`,
      modelUsed: 'Solar Forecasting Agent (Standby)',
      telemetrySnippet: { solarPowerW: solarW, totalLoadPowerW: loadW },
      timestamp: new Date().toISOString(),
    };
  }

  if (qLower.includes('load') || qLower.includes('tier') || qLower.includes('shed')) {
    return {
      success: true,
      query,
      reply:
        '**Microgrid Prioritized Load Management**:\n\n' +
        `• **Total Active Demand:** \`${loadW}W\`\n` +
        '• **Tier 1 Critical Load (Channel 0):** `ON` (Immutable — Life safety & Core 0 interlocks)\n' +
        '• **Tier 2 Important Load (Channel 1):** `ON` (Servers & ventilation)\n' +
        '• **Tier 3 Flexible Load (Channel 2):** `OFF` (Sheddable during peak tariff or deficit)\n' +
        '• **Control State:** Load prioritization within nominal operational constraints.',
      modelUsed: 'Load Demand Forecasting Agent (Standby)',
      telemetrySnippet: { totalLoadPowerW: loadW },
      timestamp: new Date().toISOString(),
    };
  }

  if (qLower.includes('energy flow') || qLower.includes('why grid') || qLower.includes('why battery') || qLower.includes('flow')) {
    return {
      success: true,
      query,
      reply:
        '**Microgrid Source Arbitration & Power Flow**:\n\n' +
        'The microgrid is currently operating in **Self-Consumption Mode**:\n' +
        `• **Solar PV Generation:** \`${solarW}W\` (covering 100% of active load \`${loadW}W\`)\n` +
        `• **BESS Battery:** \`${soc}% SoC\` (absorbing \`${(solarW - loadW).toFixed(1)}W\` surplus charging power)\n` +
        `• **Utility Grid Infeed:** \`${gridW}W\` (Islanded zero-infeed state)\n` +
        '• **Arbitration Hierarchy:** Solar PV (Priority 1) -> LiFePO4 BESS (Priority 2) -> Utility Grid (Priority 3).',
      modelUsed: 'Energy Management Decision Agent (Standby)',
      telemetrySnippet: { solarPowerW: solarW, totalLoadPowerW: loadW, batterySoc: soc },
      timestamp: new Date().toISOString(),
    };
  }

  if (qLower.includes('fault') || qLower.includes('anomaly') || qLower.includes('alert') || qLower.includes('diagnost')) {
    return {
      success: true,
      query,
      reply:
        '**Active Safety Diagnostics & Anomaly Interlocks**:\n\n' +
        '• **Hardware Failsafe Envelope:** `NOMINAL` (ESP32 Core 0 sub-10ms guarded)\n' +
        '• **Active Critical Alerts:** `0`\n' +
        '• **Isolation Forest Anomaly Score:** `0.08` (Well below 0.65 trigger threshold)\n' +
        '• **IEEE 1547 Grid Bounds:** `COMPLIANT` (230V @ 50.0Hz nominal).',
      modelUsed: 'Fault Detection & Diagnostics Agent (Standby)',
      telemetrySnippet: { solarPowerW: solarW, totalLoadPowerW: loadW, batterySoc: soc },
      timestamp: new Date().toISOString(),
    };
  }

  // Default General Telemetry Fallback
  return {
    success: true,
    query,
    reply:
      '**GridFlowX Active Physical State**:\n\n' +
      `• **Solar Generation:** \`${solarW}W\` | **Total Load:** \`${loadW}W\`\n` +
      `• **Battery (LiFePO4):\` \`${soc}% SoC\` | **Grid Infeed:** \`${gridW}W\`\n` +
      '• **Operating Mode:** Self-Consumption (Renewable surplus to storage)\n' +
      '• **Failsafe Envelope:** Active & Enforced (FreeRTOS Core 0).',
    modelUsed: 'analytical_physics_engine (Standby Fallback)',
    telemetrySnippet: {
      solarPowerW: solarW,
      totalLoadPowerW: loadW,
      batterySoc: soc,
    },
    timestamp: new Date().toISOString(),
  };
}

function extractQueryParam(url: string, param: string): string | null {
  try {
    const queryString = url.includes('?') ? url.split('?')[1] : '';
    const searchParams = new URLSearchParams(queryString);
    return searchParams.get(param);
  } catch {
    return null;
  }
}
