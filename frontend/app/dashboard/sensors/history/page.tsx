'use client';

import React, { useState } from 'react';
import { BarChart3, Calendar, Download, Filter, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function SensorHistoryPage() {
  const [sensor, setSensor] = useState('SEN-VOLT-01');
  const [range, setRange] = useState('24h');

  const mockPoints = [
    { time: '00:00', val: 12.10 }, { time: '04:00', val: 12.08 },
    { time: '08:00', val: 12.18 }, { time: '12:00', val: 12.25 },
    { time: '16:00', val: 12.20 }, { time: '20:00', val: 12.14 },
  ];

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-[1800px] mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Sensor Telemetry History</h1>
          <p className="text-xs text-[var(--text-muted)]">Historical time-series explorer with downsampled metrics & CSV export</p>
        </div>

        <button onClick={() => toast.success('Telemetry history exported as CSV')} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white text-xs font-semibold hover:opacity-90 transition-opacity">
          <Download className="w-4 h-4" /> Export CSV Data
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <select value={sensor} onChange={e => setSensor(e.target.value)} className="px-3 py-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 text-xs focus:outline-none focus:border-[var(--color-primary)]">
          <option value="SEN-VOLT-01">SEN-VOLT-01 — Bus DC Voltage (V)</option>
          <option value="SEN-CURR-01">SEN-CURR-01 — Solar PV Current (A)</option>
          <option value="SEN-TEMP-01">SEN-TEMP-01 — BESS Cell Temp (°C)</option>
        </select>

        <select value={range} onChange={e => setRange(e.target.value)} className="px-3 py-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 text-xs focus:outline-none focus:border-[var(--color-primary)]">
          <option value="1h">Last 1 Hour</option>
          <option value="24h">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
        </select>
      </div>

      <div className="p-6 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[var(--color-primary)]" /> Time-Series Trend ({sensor})
          </p>
          <span className="text-xs text-[var(--text-muted)] font-mono">Range: {range}</span>
        </div>

        <div className="h-64 flex items-end justify-between gap-4 pt-8 px-4 bg-[var(--bg-base)]/50 rounded-lg border border-[var(--border-primary)]/20">
          {mockPoints.map((pt, i) => (
            <div key={i} className="flex flex-col items-center gap-2 flex-1 h-full justify-end">
              <span className="text-[10px] font-mono text-[var(--color-primary)] font-bold">{pt.val}V</span>
              <div className="w-full bg-[var(--color-primary)]/30 border-t border-[var(--color-primary)] rounded-t-sm transition-all" style={{ height: `${((pt.val - 11.5) / 1.5) * 100}%` }} />
              <span className="text-[10px] text-[var(--text-muted)] font-mono">{pt.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
