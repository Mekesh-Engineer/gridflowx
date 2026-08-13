'use client';

import React from 'react';
import { CreditCard, CheckCircle2, Download } from 'lucide-react';
import { toast } from 'sonner';

const INVOICES = [
  { id: 'INV-2026-006', date: '2026-07-01', amount: '$499.00', status: 'PAID' },
  { id: 'INV-2026-005', date: '2026-06-01', amount: '$499.00', status: 'PAID' },
  { id: 'INV-2026-004', date: '2026-05-01', amount: '$499.00', status: 'PAID' },
];

export default function BillingPage() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-[1800px] mx-auto w-full">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Billing & Subscription Management</h1>
        <p className="text-xs text-[var(--text-muted)]">Subscription tier overview, seat allocations & PDF invoice payment history</p>
      </div>

      <div className="p-6 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-bold text-[var(--color-primary)]">CURRENT SUBSCRIPTION</span>
          <h2 className="text-xl font-extrabold text-[var(--text-primary)] mt-1">Enterprise Pro Plan</h2>
          <p className="text-xs text-[var(--text-muted)] mt-1">30 Managed Seats Included · High-Frequency Telemetry Enabled</p>
        </div>

        <div className="text-right">
          <p className="text-2xl font-extrabold text-[var(--text-primary)]">$499 <span className="text-xs font-normal text-[var(--text-muted)]">/ mo</span></p>
          <span className="text-xs font-bold text-emerald-400">Active (Auto-renew)</span>
        </div>
      </div>

      <div className="p-6 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 space-y-4">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-[var(--color-primary)]" /> Invoice Payment History
        </h3>

        <div className="space-y-2">
          {INVOICES.map(inv => (
            <div key={inv.id} className="p-3.5 rounded-lg bg-[var(--bg-base)] border border-[var(--border-primary)]/30 flex items-center justify-between">
              <div>
                <p className="text-xs font-mono font-bold text-[var(--text-primary)]">{inv.id}</p>
                <p className="text-[10px] text-[var(--text-muted)] font-mono">{inv.date}</p>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-[var(--text-primary)]">{inv.amount}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  {inv.status}
                </span>
                <button onClick={() => toast.success(`Downloaded invoice ${inv.id}`)} className="p-1.5 rounded bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
