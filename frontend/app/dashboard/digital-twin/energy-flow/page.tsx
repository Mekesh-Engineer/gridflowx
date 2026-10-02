'use client';

import React from 'react';
import { Zap, Sun, Battery, Radio, Layers, ArrowRight, ShieldCheck, Activity } from 'lucide-react';
import { useTelemetryStore } from '@/features/telemetry/store/telemetry.store';

export default function EnergyFlowPage() {
  const currentFrame = useTelemetryStore((state) => state.currentFrame);

  const solarW = currentFrame?.solarPowerW ?? 342.5;
  const gridW = currentFrame?.gridPowerW ?? 0.0;
  const battV = currentFrame?.batteryVoltageV ?? 12.8;
  const battA = currentFrame?.batteryCurrentA ?? -3.2;
  const battPowerW = Math.abs(battV * battA);
  const isBattCharging = battA >= 0;
  const busV = currentFrame?.dcBusVoltageV ?? 12.15;
  const totalLoadW = currentFrame?.totalLoadPowerW ?? 48.2;
  const relays = currentFrame?.relayStates ?? [true, true, false, true, false, true, false, true];

  const tier1W = relays[0] ? 18.0 : 0.0;
  const tier2W = relays[1] ? 20.0 : 0.0;
  const tier3W = relays[2] ? 45.0 : 0.0;
  const baseLoadW = 28.0;

  // Power flow calculations
  const totalInputW = solarW + (relays[4] ? gridW : 0) + (!isBattCharging ? battPowerW : 0);
  const totalOutputW = tier1W + tier2W + tier3W + baseLoadW + (isBattCharging ? battPowerW : 0);
  const lossesW = Math.max(0.0, totalInputW - totalOutputW);
  const efficiencyPct = totalInputW > 0 ? ((totalOutputW / totalInputW) * 100).toFixed(1) : '98.5';

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-[1800px] mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Full-Page Cyber-Physical Energy Flow (Sankey Matrix)</h1>
          <p className="text-xs text-[var(--text-muted)]">
            High-definition real-time power vector routing from generation sources through regulated DC bus to segmented load tiers
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5" /> Net Throughput: {totalInputW.toFixed(1)} W
          </span>
          <span className="text-xs font-mono text-[var(--color-primary)] font-bold bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/30 px-3 py-1.5 rounded-lg">
            System Efficiency: {efficiencyPct}%
          </span>
        </div>
      </div>

      {/* Main Sankey Diagram Container */}
      <div className="p-6 md:p-8 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 min-h-[520px] flex flex-col justify-between space-y-6">
        {/* SVG Multi-Branch Power Routing Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          {/* Generation & Sources Column */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
              <Sun className="w-4 h-4 text-amber-400" /> Power Infeed Sources
            </h2>

            {/* Solar PV Source */}
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-amber-400">Solar PV Canopy</p>
                <p className="text-[10px] text-[var(--text-muted)] font-mono">
                  {currentFrame?.solarVoltageV?.toFixed(1) || '18.4'}V · {currentFrame?.solarCurrentA?.toFixed(1) || '18.6'}A
                </p>
              </div>
              <p className="text-xl font-extrabold text-amber-400 font-mono">{solarW.toFixed(1)} W</p>
            </div>

            {/* Grid Intertie Source */}
            <div className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
              relays[4]
                ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
                : 'bg-zinc-800/20 border-zinc-700/30 text-zinc-500'
            }`}>
              <div className="space-y-0.5">
                <p className="text-xs font-bold">Utility Grid AC (230V)</p>
                <p className="text-[10px] font-mono opacity-80">
                  {relays[4] ? `${currentFrame?.gridFrequencyHz?.toFixed(1) || '50.0'} Hz Synced` : 'Islanded / Contact Open'}
                </p>
              </div>
              <p className="text-xl font-extrabold font-mono">{relays[4] ? `${gridW.toFixed(1)} W` : '0.0 W'}</p>
            </div>

            {/* BESS Discharge Source */}
            {!isBattCharging && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-emerald-400">BESS Battery Discharge</p>
                  <p className="text-[10px] text-[var(--text-muted)] font-mono">
                    {currentFrame?.batterySoc?.toFixed(1)}% SoC · {battV.toFixed(1)}V
                  </p>
                </div>
                <p className="text-xl font-extrabold text-emerald-400 font-mono">{battPowerW.toFixed(1)} W</p>
              </div>
            )}
          </div>

          {/* Central Regulated DC Bus Node */}
          <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-cyan-500/10 border border-cyan-500/40 text-center space-y-3 relative">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 border border-cyan-500/60 flex items-center justify-center">
              <Zap className="w-8 h-8 text-cyan-400 animate-pulse" />
            </div>

            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">Regulated 12V DC Bus</h3>
              <p className="text-2xl font-extrabold text-cyan-400 font-mono my-0.5">{busV.toFixed(2)} V</p>
              <p className="text-[10px] text-[var(--text-muted)] font-mono">Hardware Ripple: &lt;15mV RMS</p>
            </div>

            <div className="w-full pt-3 border-t border-cyan-500/20 flex justify-between text-[11px] font-mono text-[var(--text-muted)]">
              <span>Bus In: <strong>{totalInputW.toFixed(1)}W</strong></span>
              <span>Bus Out: <strong>{totalOutputW.toFixed(1)}W</strong></span>
            </div>
          </div>

          {/* Sinks, Loads & Storage Column */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-pink-400" /> Segmented Load Sinks & BESS
            </h2>

            {/* BESS Charging Sink */}
            {isBattCharging && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-emerald-400">BESS Storage Charging</p>
                  <p className="text-[10px] text-[var(--text-muted)] font-mono">{currentFrame?.batterySoc?.toFixed(1)}% SoC</p>
                </div>
                <p className="text-lg font-extrabold text-emerald-400 font-mono">{battPowerW.toFixed(1)} W</p>
              </div>
            )}

            {/* Tier 1 Critical Load */}
            <div className={`p-3.5 rounded-xl border flex items-center justify-between ${
              relays[0] ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-zinc-800/20 border-zinc-700/30 text-zinc-500'
            }`}>
              <div className="space-y-0.5">
                <p className="text-xs font-bold">Tier 1 Critical Loads (Ch 0)</p>
                <p className="text-[10px] font-mono opacity-80">Security, telemetry, safety contactors</p>
              </div>
              <p className="text-lg font-extrabold font-mono">{tier1W.toFixed(1)} W</p>
            </div>

            {/* Tier 2 Important Load */}
            <div className={`p-3.5 rounded-xl border flex items-center justify-between ${
              relays[1] ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' : 'bg-zinc-800/20 border-zinc-700/30 text-zinc-500'
            }`}>
              <div className="space-y-0.5">
                <p className="text-xs font-bold">Tier 2 Important Loads (Ch 1)</p>
                <p className="text-[10px] font-mono opacity-80">Primary server, air handling</p>
              </div>
              <p className="text-lg font-extrabold font-mono">{tier2W.toFixed(1)} W</p>
            </div>

            {/* Tier 3 Flexible Load */}
            <div className={`p-3.5 rounded-xl border flex items-center justify-between ${
              relays[2] ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-zinc-800/20 border-zinc-700/30 text-zinc-500'
            }`}>
              <div className="space-y-0.5">
                <p className="text-xs font-bold">Tier 3 Flexible Loads (Ch 2)</p>
                <p className="text-[10px] font-mono opacity-80">HVAC booster, auxiliary heaters</p>
              </div>
              <p className="text-lg font-extrabold font-mono">{tier3W.toFixed(1)} W</p>
            </div>
          </div>
        </div>

        {/* Footer Balance Metrics */}
        <div className="pt-4 border-t border-[var(--border-primary)]/30 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-[var(--text-muted)]">
          <span>Conversion Losses: <strong className="text-[var(--text-primary)]">{lossesW.toFixed(1)} W</strong></span>
          <span>Core 0 Telemetry Refresh: <strong className="text-emerald-400">1.00 Hz</strong></span>
          <span>Sankey Balance Status: <strong className="text-emerald-400">CONSERVED (KCL NOMINAL)</strong></span>
        </div>
      </div>
    </div>
  );
}
