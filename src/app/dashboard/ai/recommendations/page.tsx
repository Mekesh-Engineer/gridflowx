'use client';

import React from 'react';
import { Brain, CheckCircle2, XCircle, ArrowUpRight } from 'lucide-react';
import { toast } from 'sonner';

const RECS = [
  { id: 'REC-301', title: 'Pre-charge Battery Storage at 03:00', conf: 88, impact: 'High Savings ($45)', status: 'PROPOSED' },
  { id: 'REC-302', title: 'Shed Tier 3 Load due to expected cloud cover', conf: 76, impact: 'Grid Stability', status: 'PROPOSED' },
];

export default function AiRecommendationsPage() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-[1800px] mx-auto w-full">
      <div>
        <h1 className="text-xl font-bold tracking-tight">AI Action Recommendations</h1>
        <p className="text-xs text-[var(--text-muted)]">Autonomous energy optimization proposals ranked by confidence & financial impact</p>
      </div>

      <div className="space-y-3">
        {RECS.map(r => (
          <div key={r.id} className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-[var(--color-primary)] font-bold">{r.id}</span>
                <span className="text-xs text-emerald-400 font-bold">{r.conf}% Confidence</span>
                <span className="text-xs text-[var(--text-muted)] font-semibold">({r.impact})</span>
              </div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">{r.title}</h3>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={() => toast.success(`Recommendation ${r.id} approved`)} className="px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-bold hover:bg-emerald-500/25 transition-all">
                Accept Recommendation
              </button>
              <button onClick={() => toast.info(`Recommendation ${r.id} dismissed`)} className="px-3 py-1.5 rounded-lg bg-[var(--bg-base)] border border-[var(--border-primary)]/40 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all">
                Dismiss
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
