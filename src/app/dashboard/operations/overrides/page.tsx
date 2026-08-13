'use client';

import React from 'react';
import { ToggleLeft, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';

const OVERRIDES = [
  { id: 'OVR-101', relay: 'Tier 3 Flexible Load Breaker', operator: 'Operator Jane', rationale: 'Local panel maintenance', remaining: '18m 42s', status: 'ACTIVE' },
  { id: 'OVR-100', relay: 'Grid Fallback Switch', operator: 'Supervisor Davis', rationale: 'Peak grid demand response', remaining: 'Expired', status: 'EXPIRED' },
];

export default function OverridesPage() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-[1800px] mx-auto w-full">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Manual Relay Override Log</h1>
        <p className="text-xs text-[var(--text-muted)]">Active 30-minute safety overrides, countdown timers and operator audit rationales</p>
      </div>

      <div className="space-y-3">
        {OVERRIDES.map(ovr => (
          <div key={ovr.id} className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-[var(--color-primary)]">{ovr.id}</span>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                  ovr.status === 'ACTIVE' ? 'bg-amber-500/15 text-amber-400 border-amber-500/30 animate-pulse' : 'bg-[var(--bg-base)] text-[var(--text-muted)] border-[var(--border-primary)]/30'
                }`}>
                  {ovr.status}
                </span>
              </div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">{ovr.relay}</h3>
              <p className="text-xs text-[var(--text-muted)] italic">"{ovr.rationale}" — by {ovr.operator}</p>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400">
              <Clock className="w-4 h-4" /> Remaining: {ovr.remaining}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
