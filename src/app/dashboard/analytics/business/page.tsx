'use client';

import React from 'react';
import { BarChart3, TrendingUp, DollarSign, Download } from 'lucide-react';

export default function BusinessAnalyticsPage() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-[1800px] mx-auto w-full">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Business & Financial Analytics</h1>
        <p className="text-xs text-[var(--text-muted)]">Cost avoidance metrics, peak demand reduction & ROI tracking</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 text-center space-y-1">
          <p className="text-xs text-[var(--text-muted)]">Total Cost Avoided (YTD)</p>
          <p className="text-3xl font-extrabold text-emerald-400">$14,280</p>
          <p className="text-[10px] text-emerald-400">▲ 14.2% vs last year</p>
        </div>

        <div className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 text-center space-y-1">
          <p className="text-xs text-[var(--text-muted)]">Peak Charge Savings</p>
          <p className="text-3xl font-extrabold text-[var(--color-primary)]">$4,850</p>
          <p className="text-[10px] text-[var(--text-muted)]">Peak demand shaving active</p>
        </div>

        <div className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 text-center space-y-1">
          <p className="text-xs text-[var(--text-muted)]">Projected ROI Period</p>
          <p className="text-3xl font-extrabold text-indigo-400">2.4 Years</p>
          <p className="text-[10px] text-[var(--text-muted)]">Original est: 3.5 years</p>
        </div>
      </div>
    </div>
  );
}
