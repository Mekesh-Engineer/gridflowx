'use client';

import React from 'react';
import { Radio, ArrowUpRight, ArrowDownRight, ShieldCheck } from 'lucide-react';

export default function GridPage() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-[1800px] mx-auto w-full">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Utility Grid Interconnection</h1>
        <p className="text-xs text-[var(--text-muted)]">Import / export net metering, grid frequency stability & peak shaving status</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 text-center space-y-1">
          <p className="text-xs text-[var(--text-muted)]">Net Import Power</p>
          <p className="text-3xl font-extrabold text-indigo-400">0.0 W</p>
          <p className="text-[10px] text-emerald-400">Self-sufficient island mode</p>
        </div>

        <div className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 text-center space-y-1">
          <p className="text-xs text-[var(--text-muted)]">Grid Frequency</p>
          <p className="text-3xl font-extrabold text-[var(--text-primary)]">50.02 Hz</p>
          <p className="text-[10px] text-[var(--text-muted)]">Grid Synced</p>
        </div>

        <div className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 text-center space-y-1">
          <p className="text-xs text-[var(--text-muted)] font-mono">Peak Shaving</p>
          <p className="text-2xl font-bold text-emerald-400">ACTIVE</p>
          <p className="text-[10px] text-[var(--text-muted)]">Avoided $420 in tariff charges</p>
        </div>
      </div>
    </div>
  );
}
