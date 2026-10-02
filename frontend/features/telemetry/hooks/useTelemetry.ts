'use client';

/**
 * ============================================================================
 * GridFlowX Live Telemetry Hook
 * ============================================================================
 * Subscribes the React component lifecycle to the FastAPI WebSocket telemetry
 * stream and synchronizes incoming frames with the global Zustand store.
 */

import { useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useTelemetryStore } from '../store/telemetry.store';
import { initializeWebSocket, disconnectWebSocket } from '@/lib/websocket';
import { TelemetryFrame } from '@/types/telemetry.types';

export function useTelemetry() {
  const { user, isAuthenticated } = useAuth();
  const {
    currentFrame,
    history,
    isWsConnected,
    lastReceivedAt,
    pingLatencyMs,
    ingestFrame,
    setWsConnected,
  } = useTelemetryStore();

  const isSubscribedRef = useRef(false);

  useEffect(() => {
    // We connect using client token or dev bypass token
    const token = user?.uid ? `user-${user.uid}` : 'dev-operator';

    initializeWebSocket(token, {
      onMessage: (type: string, payload: any) => {
        if (type === 'telemetry_update' || type === 'telemetry_initial') {
          ingestFrame(payload as Partial<TelemetryFrame>);
        }
      },
      onStatusChange: (online: boolean) => {
        setWsConnected(online);
      },
    });

    isSubscribedRef.current = true;

    return () => {
      // Optional: keep global connection persistent or close on full app unmount
    };
  }, [user, isAuthenticated, ingestFrame, setWsConnected]);

  return {
    currentFrame,
    history,
    isWsConnected,
    lastReceivedAt,
    pingLatencyMs,
    solarPowerW: currentFrame.solarPowerW,
    solarVoltageV: currentFrame.solarVoltageV,
    solarCurrentA: currentFrame.solarCurrentA,
    gridPowerW: currentFrame.gridPowerW,
    gridVoltageV: currentFrame.gridVoltageV,
    batteryVoltageV: currentFrame.batteryVoltageV,
    batteryCurrentA: currentFrame.batteryCurrentA,
    batterySoc: currentFrame.batterySoc,
    batterySoh: currentFrame.batterySoh,
    batteryTempC: currentFrame.batteryTempC,
    dcBusVoltageV: currentFrame.dcBusVoltageV,
    totalLoadPowerW: currentFrame.totalLoadPowerW,
    relayStates: currentFrame.relayStates,
    core0FailsafeActive: currentFrame.core0FailsafeActive,
    deviceId: currentFrame.deviceId,
  };
}
