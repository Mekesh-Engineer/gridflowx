'use client';

import React from 'react';
import { Battery, Zap, Thermometer, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function BessPage() {
  const cells = [
    { id: 'Cell 1', v: 3.32, temp: 31.2, soh: 98 },
    { id: 'Cell 2', v: 3.31, temp: 31.5, soh: 98 },
    { id: 'Cell 3', v: 3.29, temp: 34.2, soh: 94 }, // warning temp
    { id: 'Cell 4', v: 3.32, temp: 31.1, soh: 99 },
  ];

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-[1800px] mx-auto w-full">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Battery Energy Storage System (BESS)</h1>
        <p className="text-xs text-[var(--text-muted)]">LiFePO4 battery pack state-of-charge, state-of-health, cell voltage balance & thermal limits</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 text-center space-y-1">
          <p className="text-xs text-[var(--text-muted)]">State of Charge (SoC)</p>
          <p className="text-3xl font-extrabold text-emerald-400">72.3%</p>
          <p className="text-[10px] text-emerald-400">Discharging @ 3.2A</p>
        </div>

        <div className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 text-center space-y-1">
          <p className="text-xs text-[var(--text-muted)]">State of Health (SoH)</p>
          <p className="text-3xl font-extrabold text-[var(--color-primary)]">97.2%</p>
          <p className="text-[10px] text-[var(--text-muted)]">142 Cycles</p>
        </div>

        <div className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 text-center space-y-1">
          <p className="text-xs text-[var(--text-muted)]">Max Cell Temp</p>
          <p className="text-3xl font-extrabold text-amber-400">34.2°C</p>
          <p className="text-[10px] text-amber-400">Cell 3 Thermal Alert</p>
        </div>
      </div>

      <div className="p-6 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 space-y-4">
        <h2 className="text-sm font-semibold flex items-center gap-2">
          <Battery className="w-4 h-4 text-emerald-400" /> Cell Voltage Balance & Temperature
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {cells.map(c => (
            <div key={c.id} className="p-3.5 rounded-lg bg-[var(--bg-base)] border border-[var(--border-primary)]/30 space-y-1">
              <p className="text-xs font-bold text-[var(--text-primary)]">{c.id}</p>
              <div className="flex justify-between text-xs text-[var(--text-muted)]">
                <span>Voltage:</span>
                <span className="font-mono text-[var(--text-primary)] font-bold">{c.v}V</span>
              </div>
              <div className="flex justify-between text-xs text-[var(--text-muted)]">
                <span>Temp:</span>
                <span className={`font-mono font-bold ${c.temp > 33 ? 'text-amber-400' : 'text-emerald-400'}`}>{c.temp}°C</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
