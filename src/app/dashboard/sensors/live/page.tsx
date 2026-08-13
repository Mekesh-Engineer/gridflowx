'use client';

import React, { useState, useEffect } from 'react';
import { Activity, Radio, RefreshCw, Zap, Battery, Sun, Thermometer } from 'lucide-react';

const INITIAL_SENSORS = [
  { id: 'SEN-VOLT-01', name: 'Bus DC Voltage', value: 12.15, unit: 'V', status: 'NORMAL', spark: [12.1, 12.12, 12.15, 12.14, 12.15] },
  { id: 'SEN-CURR-01', name: 'Solar PV Current', value: 28.2, unit: 'A', status: 'NORMAL', spark: [27.5, 27.9, 28.1, 28.0, 28.2] },
  { id: 'SEN-CURR-02', name: 'Load Current', value: 4.0, unit: 'A', status: 'NORMAL', spark: [4.2, 4.1, 3.9, 4.0, 4.0] },
  { id: 'SEN-TEMP-01', name: 'BESS Cell Temperature', value: 34.2, unit: '°C', status: 'WARNING', spark: [33.1, 33.5, 33.9, 34.0, 34.2] },
  { id: 'SEN-IRRAD-01', name: 'Solar Pyranometer', value: 845.0, unit: 'W/m²', status: 'NORMAL', spark: [820, 830, 840, 842, 845] },
];

export default function LiveSensorsPage() {
  const [sensors, setSensors] = useState(INITIAL_SENSORS);

  useEffect(() => {
    const timer = setInterval(() => {
      setSensors(prev => prev.map(s => {
        const delta = (Math.random() - 0.5) * 0.1;
        const newVal = Number((s.value + delta).toFixed(1));
        return {
          ...s,
          value: newVal,
          spark: [...s.spark.slice(1), newVal],
        };
      }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-[1800px] mx-auto w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Live Telemetry Stream</h1>
          <p className="text-xs text-[var(--text-muted)]">High-frequency real-time telemetry stream (1-second update interval)</p>
        </div>
        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
          <Activity className="w-3.5 h-3.5 animate-pulse" /> STREAMING 1000ms
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {sensors.map(s => (
          <div key={s.id} className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 flex flex-col justify-between space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-mono text-[var(--text-muted)]">{s.id}</p>
                <h3 className="text-sm font-bold text-[var(--text-primary)] mt-0.5">{s.name}</h3>
              </div>
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                s.status === 'NORMAL' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
              }`}>
                {s.status}
              </span>
            </div>

            <div>
              <p className="text-3xl font-extrabold tabular-nums tracking-tight">
                {s.value}<span className="text-sm font-normal text-[var(--text-muted)] ml-1.5">{s.unit}</span>
              </p>
            </div>

            <div className="pt-2 border-t border-[var(--border-primary)]/20 flex items-center justify-between text-[10px] text-[var(--text-muted)] font-mono">
              <span>Sparkline (last 5s):</span>
              <span className="text-[var(--color-primary)]">{s.spark.join(' → ')}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
