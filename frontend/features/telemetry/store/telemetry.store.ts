/**
 * ============================================================================
 * GridFlowX Real-Time Telemetry Zustand Store
 * ============================================================================
 * Centralized client store holding live 1Hz telemetry frames, recent time-series
 * circular buffer for real-time charts, WebSocket connection health, and relay states.
 */

import { create } from 'zustand';
import { TelemetryFrame } from '@/types/telemetry.types';

export const DEFAULT_INITIAL_TELEMETRY: TelemetryFrame = {
  deviceId: 'GFX-ESP32-MASTER-01',
  timestamp: new Date().toISOString(),
  sequenceNumber: 0,
  solarVoltageV: 18.4,
  solarCurrentA: 18.6,
  solarPowerW: 342.5,
  gridVoltageV: 230.2,
  gridFrequencyHz: 50.0,
  gridPowerW: 0.0,
  batteryVoltageV: 12.8,
  batteryCurrentA: -3.2,
  batterySoc: 74.5,
  batterySoh: 98.2,
  batteryTempC: 31.5,
  dcBusVoltageV: 12.15,
  totalLoadPowerW: 48.2,
  relayStates: [true, true, false, true, false, true, false, true],
  core0FailsafeActive: false,
};

const MAX_HISTORY_BUFFER = 60; // Retain last 60 seconds of frames for live sparklines

interface TelemetryState {
  currentFrame: TelemetryFrame;
  history: TelemetryFrame[];
  isWsConnected: boolean;
  lastReceivedAt: string | null;
  pingLatencyMs: number;
  activeOverridesCount: number;

  // Actions
  ingestFrame: (frame: Partial<TelemetryFrame>) => void;
  setWsConnected: (connected: boolean) => void;
  setPingLatency: (latency: number) => void;
  resetTelemetry: () => void;
}

export const useTelemetryStore = create<TelemetryState>()((set) => ({
  currentFrame: DEFAULT_INITIAL_TELEMETRY,
  history: [DEFAULT_INITIAL_TELEMETRY],
  isWsConnected: false,
  lastReceivedAt: null,
  pingLatencyMs: 0,
  activeOverridesCount: 0,

  ingestFrame: (incoming) =>
    set((state) => {
      const fullFrame: TelemetryFrame = {
        ...state.currentFrame,
        ...incoming,
        timestamp: incoming.timestamp || new Date().toISOString(),
      };

      const updatedHistory =
        state.history.length >= MAX_HISTORY_BUFFER
          ? [...state.history.slice(1), fullFrame]
          : [...state.history, fullFrame];

      return {
        currentFrame: fullFrame,
        history: updatedHistory,
        lastReceivedAt: new Date().toISOString(),
      };
    }),

  setWsConnected: (connected) =>
    set({
      isWsConnected: connected,
    }),

  setPingLatency: (latency) =>
    set({
      pingLatencyMs: latency,
    }),

  resetTelemetry: () =>
    set({
      currentFrame: DEFAULT_INITIAL_TELEMETRY,
      history: [DEFAULT_INITIAL_TELEMETRY],
      isWsConnected: false,
      lastReceivedAt: null,
    }),
}));
