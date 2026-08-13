'use client';

import React from 'react';
import { Leaf, TrendingUp, Award } from 'lucide-react';

export default function CarbonAnalyticsPage() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-[1800px] mx-auto w-full">
      <div>
        <h1 className="text-xl font-bold tracking-tight">ESG Carbon Footprint & Reduction</h1>
        <p className="text-xs text-[var(--text-muted)]">Scope 1 & 2 carbon offset tracking, renewable energy ratio & carbon credit accumulation</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 text-center space-y-1">
          <p className="text-xs text-[var(--text-muted)]">CO₂ Avoided (YTD)</p>
          <p className="text-3xl font-extrabold text-emerald-400">18.4 Tons</p>
          <p className="text-[10px] text-emerald-400">Equivalent to planting 840 trees</p>
        </div>

        <div className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 text-center space-y-1">
          <p className="text-xs text-[var(--text-muted)]">Renewable Fraction</p>
          <p className="text-3xl font-extrabold text-yellow-400">84.2%</p>
          <p className="text-[10px] text-[var(--text-muted)]">Solar + Battery ratio</p>
        </div>

        <div className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 text-center space-y-1">
          <p className="text-xs text-[var(--text-muted)] font-mono">Carbon Credits</p>
          <p className="text-3xl font-extrabold text-[var(--color-primary)]">184 Cr</p>
          <p className="text-[10px] text-emerald-400 font-semibold">Verified for offset market</p>
        </div>
      </div>
    </div>
  );
}
