'use client';

import React from 'react';
import { Layers, ToggleLeft, ShieldAlert } from 'lucide-react';
import { PermissionGuard } from '@/components/providers/PermissionGuard';

const TIERS = [
  { tier: 'Tier 1 — Critical', desc: 'Life support, emergency lighting & security', power: '22.0 W', priority: 1, status: 'PROTECTED (ON)' },
  { tier: 'Tier 2 — Important', desc: 'Water pumps, refrigeration & comms', power: '18.2 W', priority: 2, status: 'ONLINE (ON)' },
  { tier: 'Tier 3 — Flexible / Sheddable', desc: 'HVAC, water heaters & non-essential AC', power: '8.0 W', priority: 3, status: 'SHEDDABLE (OFF)' },
];

export default function LoadsPage() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-[1800px] mx-auto w-full">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Circuit Load Tier Management</h1>
        <p className="text-xs text-[var(--text-muted)]">3-tier circuit load shedding configuration & relay group assignments</p>
      </div>

      <div className="space-y-4">
        {TIERS.map(t => (
          <div key={t.tier} className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono font-bold text-[var(--color-primary)]">Priority Level {t.priority}</span>
              <h3 className="text-base font-bold text-[var(--text-primary)] mt-0.5">{t.tier}</h3>
              <p className="text-xs text-[var(--text-muted)] mt-1">{t.desc}</p>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-[var(--text-muted)]">Current Load</p>
                <p className="text-lg font-bold text-[var(--text-primary)]">{t.power}</p>
              </div>

              <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                t.priority === 1 ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' :
                t.priority === 2 ? 'bg-blue-500/15 text-blue-400 border-blue-500/30' :
                'bg-amber-500/15 text-amber-400 border-amber-500/30'
              }`}>
                {t.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
