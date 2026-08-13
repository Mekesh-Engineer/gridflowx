'use client';

import React from 'react';
import { TrendingUp, BarChart3, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function ForecastAccuracyPage() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-[1800px] mx-auto w-full">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Forecast Model Accuracy (MAE / MAPE)</h1>
        <p className="text-xs text-[var(--text-muted)] font-mono">Actual vs Predicted Solar Irradiance Error Analysis</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 text-center space-y-1">
          <p className="text-xs text-[var(--text-muted)]">Mean Absolute Error (MAE)</p>
          <p className="text-3xl font-extrabold text-emerald-400">24.3 W/m²</p>
          <p className="text-[10px] text-emerald-400">▲ 1.2% improvement vs last week</p>
        </div>

        <div className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 text-center space-y-1">
          <p className="text-xs text-[var(--text-muted)]">Mean Absolute Percentage Error (MAPE)</p>
          <p className="text-3xl font-extrabold text-[var(--color-primary)]">8.7%</p>
          <p className="text-[10px] text-[var(--text-muted)]">Target: &lt;10.0%</p>
        </div>

        <div className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 text-center space-y-1">
          <p className="text-xs text-[var(--text-muted)] font-mono">Model Version</p>
          <p className="text-2xl font-bold text-[var(--text-primary)] font-mono">SolarNet-v3.1</p>
          <p className="text-[10px] text-emerald-400 font-semibold">Active & High-Confidence</p>
        </div>
      </div>
    </div>
  );
}
