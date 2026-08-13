'use client';

import React from 'react';
import { FileText, Download, Eye, Calendar } from 'lucide-react';
import { toast } from 'sonner';

const ARCHIVED = [
  { id: 'REP-2026-06', title: 'Monthly Executive Energy Report (June 2026)', date: '2026-07-01', size: '2.4 MB', format: 'PDF' },
  { id: 'REP-2026-05', title: 'Monthly Executive Energy Report (May 2026)', date: '2026-06-01', size: '2.1 MB', format: 'PDF' },
  { id: 'REP-SOC2-Q2', title: 'Q2 2026 SOC2 Audit Evidence Archive', date: '2026-06-30', size: '14.8 MB', format: 'ZIP' },
];

export default function ReportArchivePage() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-[1800px] mx-auto w-full">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Historical Report Archive</h1>
        <p className="text-xs text-[var(--text-muted)]">Archived compliance, audit evidence & monthly executive summary documents</p>
      </div>

      <div className="space-y-3">
        {ARCHIVED.map(r => (
          <div key={r.id} className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-[var(--color-primary)]">{r.id}</span>
                <span className="text-xs font-semibold text-[var(--text-muted)]">({r.format} · {r.size})</span>
              </div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">{r.title}</h3>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-[var(--text-muted)] font-mono">{r.date}</span>
              <button onClick={() => toast.success(`Downloading ${r.id}...`)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg-base)] border border-[var(--border-primary)]/40 text-xs font-semibold hover:border-[var(--color-primary)] transition-all">
                <Download className="w-3.5 h-3.5" /> Download
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
