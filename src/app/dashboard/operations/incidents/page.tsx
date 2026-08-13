'use client';

import React from 'react';
import { AlertTriangle, ShieldAlert, FileText, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const INCIDENTS = [
  { id: 'INC-088', site: 'SITE-03', title: 'BESS Cell 3 Thermal Overheat', severity: 'CRITICAL', status: 'INVESTIGATING', time: '2h ago' },
  { id: 'INC-087', site: 'SITE-04', title: 'Gateway Connection Lost', severity: 'CRITICAL', status: 'RESOLVED', time: '6h ago' },
  { id: 'INC-086', site: 'SITE-01', title: 'Solar PV String 2 Low Output', severity: 'WARNING', status: 'OPEN', time: '1d ago' },
];

export default function IncidentsPage() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-[1800px] mx-auto w-full">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Incident Triage Portal</h1>
        <p className="text-xs text-[var(--text-muted)]">Real-time hardware anomalies, thermal alerts and critical fault triage</p>
      </div>

      <div className="space-y-3">
        {INCIDENTS.map(inc => (
          <div key={inc.id} className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-red-400">{inc.id}</span>
                <span className="text-xs font-bold text-[var(--text-muted)]">({inc.site})</span>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                  inc.severity === 'CRITICAL' ? 'bg-red-500/15 text-red-400 border-red-500/30' : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                }`}>
                  {inc.severity}
                </span>
              </div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">{inc.title}</h3>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-[var(--text-muted)]">{inc.time}</span>
              <button onClick={() => toast.info(`Viewing details for ${inc.id}`)} className="px-3 py-1.5 rounded-lg bg-[var(--bg-base)] border border-[var(--border-primary)]/40 text-xs font-semibold hover:border-[var(--color-primary)] transition-all">
                Triage Incident →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
