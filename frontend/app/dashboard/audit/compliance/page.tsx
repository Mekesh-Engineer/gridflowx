'use client';

import React from 'react';
import { ShieldCheck, CheckCircle2, FileText, Download } from 'lucide-react';
import { toast } from 'sonner';

const CLAUSES = [
  { ref: 'SOC2-CC6.1', name: 'Logical Access Controls (RBAC Enforced)', status: 'PASS', score: '100%' },
  { ref: 'SOC2-CC6.8', name: 'Software Update & Firmware Deployment', status: 'PASS', score: '98%' },
  { ref: 'GDPR-Art32', name: 'Security of Processing & Data Encryption', status: 'PASS', score: '100%' },
  { ref: 'ISO-50001-6.3', name: 'Energy Review & Baseline Calculation', status: 'PASS', score: '94%' },
];

export default function ComplianceCenterPage() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-[1800px] mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Regulatory Compliance Center</h1>
          <p className="text-xs text-[var(--text-muted)]">SOC2 Type II, GDPR, NERC CIP & ISO 50001 readiness scorecards</p>
        </div>

        <button onClick={() => toast.success('Compliance evidence package downloaded')} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white text-xs font-semibold hover:opacity-90 transition-opacity">
          <Download className="w-4 h-4" /> Download Evidence ZIP
        </button>
      </div>

      <div className="space-y-3">
        {CLAUSES.map(c => (
          <div key={c.ref} className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 flex items-center justify-between">
            <div>
              <span className="text-xs font-mono font-bold text-[var(--color-primary)]">{c.ref}</span>
              <h3 className="text-sm font-bold text-[var(--text-primary)] mt-0.5">{c.name}</h3>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-xs font-bold font-mono text-emerald-400">{c.score}</span>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> {c.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
