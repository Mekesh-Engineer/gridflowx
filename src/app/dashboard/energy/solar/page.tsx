'use client';

import React from 'react';
import { Sun, Zap, Activity } from 'lucide-react';

export default function SolarPage() {
  const strings = [
    { name: 'String Inverter A1', power: '180.2 W', eff: '98.4%', status: 'OPTIMAL' },
    { name: 'String Inverter A2', power: '162.3 W', eff: '97.1%', status: 'OPTIMAL' },
  ];

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-[1800px] mx-auto w-full">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Solar PV Yield & MPPT Tracking</h1>
        <p className="text-xs text-[var(--text-muted)]">String inverter power output, MPPT tracking efficiency & daily generation metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {strings.map(s => (
          <div key={s.name} className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[var(--text-primary)]">{s.name}</h3>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full border bg-emerald-500/15 text-emerald-400 border-emerald-500/30">
                {s.status}
              </span>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div>
                <p className="text-[10px] text-[var(--text-muted)]">Generation</p>
                <p className="text-2xl font-extrabold text-yellow-400">{s.power}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-[var(--text-muted)]">MPPT Efficiency</p>
                <p className="text-xl font-bold text-emerald-400">{s.eff}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
