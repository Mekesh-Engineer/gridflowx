'use client';

import React from 'react';
import { Brain, Cpu, Activity, Zap, ArrowUpRight } from 'lucide-react';

export default function AiOverviewPage() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-[1800px] mx-auto w-full">
      <div>
        <h1 className="text-xl font-bold tracking-tight">AI Intelligence Center</h1>
        <p className="text-xs text-[var(--text-muted)]">FastAPI high-frequency streaming inference engine status & real-time load predictions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 text-center space-y-1">
          <p className="text-xs text-[var(--text-muted)]">Inference Latency</p>
          <p className="text-3xl font-extrabold text-emerald-400">22.8 ms</p>
          <p className="text-[10px] text-emerald-400">FastAPI Async Engine</p>
        </div>

        <div className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 text-center space-y-1">
          <p className="text-xs text-[var(--text-muted)]">Model Confidence</p>
          <p className="text-3xl font-extrabold text-[var(--color-primary)]">82.4%</p>
          <p className="text-[10px] text-[var(--text-muted)]">XGBoost + LSTM ensemble</p>
        </div>

        <div className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 text-center space-y-1">
          <p className="text-xs text-[var(--text-muted)]">Predictions / Min</p>
          <p className="text-3xl font-extrabold text-indigo-400">1,240</p>
          <p className="text-[10px] text-[var(--text-muted)]">Active streaming</p>
        </div>
      </div>
    </div>
  );
}
