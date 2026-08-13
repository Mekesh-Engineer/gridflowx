'use client';

import React from 'react';
import { Zap, Activity, Sun, Battery, Radio } from 'lucide-react';

export default function EnergyFlowPage() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-[1800px] mx-auto w-full">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Full-Page Live Energy Flow (Sankey)</h1>
        <p className="text-xs text-[var(--text-muted)]">Real-time animated Sankey power flow mapping (Solar → Bus → Storage → Loads)</p>
      </div>

      <div className="p-8 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 min-h-[450px] flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1">
            <Zap className="w-4 h-4" /> Live Flow Rate: 342.5 W Net Generation
          </span>
          <span className="text-xs text-[var(--text-muted)] font-mono">Sampling: 100ms</span>
        </div>

        <div className="my-8 flex items-center justify-around gap-4 text-center">
          <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 space-y-1">
            <Sun className="w-8 h-8 mx-auto" />
            <p className="text-xs font-bold">Solar Array</p>
            <p className="text-lg font-extrabold">342.5 W</p>
          </div>
          <div className="text-xl text-[var(--color-primary)] font-bold animate-pulse">⟶</div>
          <div className="p-4 rounded-xl bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/30 text-[var(--color-primary)] space-y-1">
            <Zap className="w-8 h-8 mx-auto" />
            <p className="text-xs font-bold">DC Bus</p>
            <p className="text-lg font-extrabold">12.15 V</p>
          </div>
          <div className="text-xl text-emerald-400 font-bold animate-pulse">⟶</div>
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 space-y-1">
            <Battery className="w-8 h-8 mx-auto" />
            <p className="text-xs font-bold">BESS Bank</p>
            <p className="text-lg font-extrabold">72.3%</p>
          </div>
        </div>

        <div className="pt-4 border-t border-[var(--border-primary)]/20 text-center text-xs text-[var(--text-muted)] font-mono">
          System Losses: 1.8W (&lt;0.5%) · Bus Balance: NOMINAL
        </div>
      </div>
    </div>
  );
}
