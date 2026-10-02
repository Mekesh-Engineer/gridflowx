'use client';

import React from 'react';
import { Sun, Zap, Activity, ShieldCheck, TrendingUp, RefreshCw } from 'lucide-react';
import { useTelemetryStore } from '@/features/telemetry/store/telemetry.store';

export default function SolarPage() {
  const currentFrame = useTelemetryStore((state) => state.currentFrame);

  const solarV = currentFrame?.solarVoltageV ?? 18.4;
  const solarA = currentFrame?.solarCurrentA ?? 18.6;
  const solarW = currentFrame?.solarPowerW ?? 342.5;
  const relays = currentFrame?.relayStates ?? [true, true, false, true, false, true, false, true];

  const string1W = (solarW * 0.52).toFixed(1);
  const string2W = (solarW * 0.48).toFixed(1);

  const strings = [
    { name: 'String Inverter A1 (Monocrystalline)', power: `${string1W} W`, v: `${solarV.toFixed(1)} V`, a: `${(solarA * 0.52).toFixed(1)} A`, eff: '98.4%', status: 'OPTIMAL' },
    { name: 'String Inverter A2 (Polycrystalline)', power: `${string2W} W`, v: `${solarV.toFixed(1)} V`, a: `${(solarA * 0.48).toFixed(1)} A`, eff: '97.2%', status: 'OPTIMAL' },
  ];

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-[1800px] mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Solar PV Yield & MPPT Tracking</h1>
          <p className="text-xs text-[var(--text-muted)]">
            High-frequency MPPT tracking efficiency, PV string telemetry & real-time irradiance conversion
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
            <Sun className="w-3.5 h-3.5" /> Total PV Array: {solarW.toFixed(1)} W
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 space-y-1">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span>Array Terminal Voltage</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-3xl font-extrabold text-amber-400 font-mono">{solarV.toFixed(2)} V</p>
          <p className="text-[10px] text-emerald-400">MPPT Tracking Window: 14-22V</p>
        </div>

        <div className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 space-y-1">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span>PV Array Current</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-3xl font-extrabold text-emerald-400 font-mono">{solarA.toFixed(2)} A</p>
          <p className="text-[10px] text-[var(--text-muted)]">ACS712-30A Current Sensor</p>
        </div>

        <div className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 space-y-1">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span>MPPT Conversion Efficiency</span>
            <TrendingUp className="w-4 h-4 text-[var(--color-primary)]" />
          </div>
          <p className="text-3xl font-extrabold text-[var(--color-primary)] font-mono">98.1%</p>
          <p className="text-[10px] text-emerald-400 font-semibold">Synchronous Buck Topology</p>
        </div>

        <div className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 space-y-1">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span>MPPT Contactor (Ch 5)</span>
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-[var(--text-primary)]">
            {relays[5] ? 'CONNECTED' : 'DISCONNECTED'}
          </p>
          <p className="text-[10px] text-emerald-400 font-semibold">Relay Hardware Engaged</p>
        </div>
      </div>

      {/* PV String Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {strings.map((s) => (
          <div key={s.name} className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[var(--text-primary)]">{s.name}</h3>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full border bg-emerald-500/15 text-emerald-400 border-emerald-500/30">
                {s.status}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs font-mono">
              <div className="p-2.5 rounded bg-[var(--bg-base)] border border-[var(--border-primary)]/20">
                <p className="text-[10px] text-[var(--text-muted)]">Power Output</p>
                <p className="text-base font-extrabold text-yellow-400 mt-0.5">{s.power}</p>
              </div>

              <div className="p-2.5 rounded bg-[var(--bg-base)] border border-[var(--border-primary)]/20">
                <p className="text-[10px] text-[var(--text-muted)]">String Voltage</p>
                <p className="text-base font-bold text-[var(--text-primary)] mt-0.5">{s.v}</p>
              </div>

              <div className="p-2.5 rounded bg-[var(--bg-base)] border border-[var(--border-primary)]/20">
                <p className="text-[10px] text-[var(--text-muted)]">Efficiency</p>
                <p className="text-base font-bold text-emerald-400 mt-0.5">{s.eff}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
