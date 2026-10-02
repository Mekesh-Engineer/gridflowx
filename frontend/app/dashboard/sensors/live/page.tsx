'use client';

import React from 'react';
import { Activity, Radio, Zap, Battery, Sun, Thermometer, ShieldCheck, AlertTriangle, Wifi, WifiOff } from 'lucide-react';
import { useTelemetry } from '@/features/telemetry/hooks/useTelemetry';

export default function LiveSensorsPage() {
  const {
    currentFrame,
    history,
    isWsConnected,
    lastReceivedAt,
    solarPowerW,
    solarVoltageV,
    solarCurrentA,
    gridVoltageV,
    gridPowerW,
    batteryVoltageV,
    batteryCurrentA,
    batterySoc,
    batteryTempC,
    dcBusVoltageV,
    totalLoadPowerW,
    core0FailsafeActive,
    deviceId,
  } = useTelemetry();

  // Extract real recent sparklines from the last 5 frames in telemetry history
  const recentFrames = history.slice(-5);
  const getSparkline = (extractor: (f: typeof currentFrame) => number) => {
    if (recentFrames.length === 0) return [extractor(currentFrame)];
    return recentFrames.map(extractor);
  };

  const sensors = [
    {
      id: 'SEN-VOLT-01',
      name: 'DC Bus Voltage',
      value: dcBusVoltageV.toFixed(2),
      unit: 'V',
      status: dcBusVoltageV >= 11.5 && dcBusVoltageV <= 13.0 ? 'NORMAL' : 'WARNING',
      spark: getSparkline((f) => Number((f.dcBusVoltageV ?? 12.15).toFixed(2))),
      icon: <Zap className="w-4 h-4 text-[var(--color-primary)]" />,
      nominal: '12.0V – 12.8V',
    },
    {
      id: 'SEN-SOLAR-01',
      name: 'Solar PV Yield Power',
      value: solarPowerW.toFixed(1),
      unit: 'W',
      status: solarPowerW > 0 ? 'NORMAL' : 'STANDBY',
      spark: getSparkline((f) => Number((f.solarPowerW ?? 0).toFixed(1))),
      icon: <Sun className="w-4 h-4 text-amber-400" />,
      nominal: `${solarVoltageV.toFixed(1)}V @ ${solarCurrentA.toFixed(1)}A`,
    },
    {
      id: 'SEN-LOAD-01',
      name: 'Total Microgrid Load Demand',
      value: totalLoadPowerW.toFixed(1),
      unit: 'W',
      status: totalLoadPowerW < 250 ? 'NORMAL' : 'HIGH_LOAD',
      spark: getSparkline((f) => Number((f.totalLoadPowerW ?? 0).toFixed(1))),
      icon: <Activity className="w-4 h-4 text-indigo-400" />,
      nominal: 'Tiers 1, 2 & 3 Combined',
    },
    {
      id: 'SEN-BATT-01',
      name: 'BESS State of Charge (SoC)',
      value: batterySoc.toFixed(1),
      unit: '%',
      status: batterySoc >= 20.0 ? 'NORMAL' : 'LOW_SOC',
      spark: getSparkline((f) => Number((f.batterySoc ?? 74.5).toFixed(1))),
      icon: <Battery className="w-4 h-4 text-emerald-400" />,
      nominal: `${batteryVoltageV.toFixed(2)}V (${batteryCurrentA >= 0 ? '+' : ''}${batteryCurrentA.toFixed(1)}A)`,
    },
    {
      id: 'SEN-TEMP-01',
      name: 'LiFePO4 Cell Temperature',
      value: batteryTempC.toFixed(1),
      unit: '°C',
      status: batteryTempC < 45.0 ? 'NORMAL' : 'CRITICAL',
      spark: getSparkline((f) => Number((f.batteryTempC ?? 31.5).toFixed(1))),
      icon: <Thermometer className="w-4 h-4 text-red-400" />,
      nominal: 'Safe limit < 45.0°C',
    },
    {
      id: 'SEN-GRID-01',
      name: 'Grid Infeed / Frequency',
      value: gridVoltageV.toFixed(1),
      unit: 'V',
      status: gridVoltageV >= 210 && gridVoltageV <= 250 ? 'NORMAL' : 'FAULT',
      spark: getSparkline((f) => Number((f.gridVoltageV ?? 230).toFixed(1))),
      icon: <Radio className="w-4 h-4 text-cyan-400" />,
      nominal: `${gridPowerW.toFixed(1)}W (50.0 Hz)`,
    },
  ];

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-[1800px] mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight">Live Telemetry Stream</h1>
            <span className="text-xs font-mono text-[var(--text-muted)]">[{deviceId}]</span>
          </div>
          <p className="text-xs text-[var(--text-muted)]">
            High-frequency cyber-physical sensor telemetry streamed via 1Hz WebSocket connection
          </p>
        </div>

        <div className="flex items-center gap-3">
          {core0FailsafeActive && (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-500/15 text-red-400 border border-red-500/30">
              <AlertTriangle className="w-3.5 h-3.5" /> CORE 0 FAILSAFE ACTIVE
            </span>
          )}

          <span
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
              isWsConnected
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/25'
            }`}
          >
            {isWsConnected ? (
              <>
                <Wifi className="w-3.5 h-3.5 animate-pulse" /> LIVE STREAM (1Hz)
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5" /> WS STANDBY / RECONNECTING
              </>
            )}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {sensors.map((s) => (
          <div
            key={s.id}
            className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 flex flex-col justify-between space-y-4 hover:border-[var(--color-primary)]/30 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-[var(--bg-base)] border border-[var(--border-primary)]/30">
                  {s.icon}
                </div>
                <div>
                  <p className="text-[10px] font-mono text-[var(--text-muted)]">{s.id}</p>
                  <h3 className="text-sm font-bold text-[var(--text-primary)] mt-0.5">{s.name}</h3>
                </div>
              </div>
              <span
                className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                  s.status === 'NORMAL'
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                    : s.status === 'STANDBY'
                    ? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                    : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                }`}
              >
                {s.status}
              </span>
            </div>

            <div>
              <p className="text-3xl font-extrabold tabular-nums tracking-tight font-mono text-[var(--text-primary)]">
                {s.value}
                <span className="text-sm font-normal text-[var(--text-muted)] ml-1.5">{s.unit}</span>
              </p>
              <p className="text-xs text-[var(--text-muted)] mt-1 font-mono">{s.nominal}</p>
            </div>

            <div className="pt-2 border-t border-[var(--border-primary)]/20 flex items-center justify-between text-[10px] text-[var(--text-muted)] font-mono">
              <span>Telemetry Sparkline:</span>
              <span className="text-[var(--color-primary)] font-semibold">
                {s.spark.join(' → ')}
              </span>
            </div>
          </div>
        ))}
      </div>

      {lastReceivedAt && (
        <p className="text-[10px] text-[var(--text-muted)] font-mono text-right">
          Last frame ingested: {new Date(lastReceivedAt).toLocaleTimeString()}
        </p>
      )}
    </div>
  );
}
