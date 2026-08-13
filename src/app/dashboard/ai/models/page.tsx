'use client';

import React from 'react';
import { GitBranch, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

const MODELS = [
  { name: 'GridBrain-v2.4', type: 'LSTM + XGBoost Ensemble', status: 'ACTIVE', drift: '0.02 (Low)', trained: '2026-07-28' },
  { name: 'SolarNet-v3.1', type: 'Conv1D Irradiance Net', status: 'ACTIVE', drift: '0.01 (Low)', trained: '2026-07-25' },
  { name: 'LoadShedder-v1.9', type: 'Reinforcement Q-Learner', status: 'STAGING', drift: '0.08 (Moderate)', trained: '2026-07-20' },
];

export default function AiModelsPage() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-[1800px] mx-auto w-full">
      <div>
        <h1 className="text-xl font-bold tracking-tight">AI Model Registry & Retraining Studio</h1>
        <p className="text-xs text-[var(--text-muted)] font-mono">Versioned machine learning model artifacts, concept drift tracking & automated retraining trigger</p>
      </div>

      <div className="space-y-4">
        {MODELS.map(m => (
          <div key={m.name} className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold font-mono text-[var(--text-primary)]">{m.name}</span>
                <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${
                  m.status === 'ACTIVE' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                }`}>
                  {m.status}
                </span>
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-1">{m.type} · Trained: {m.trained}</p>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-xs text-[var(--text-muted)]">Drift: <strong className="text-[var(--text-primary)] font-mono">{m.drift}</strong></span>
              <button onClick={() => toast.success(`Triggered retraining pipeline for ${m.name}`)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg-base)] border border-[var(--border-primary)]/50 text-xs font-semibold hover:border-[var(--color-primary)] transition-all">
                <RefreshCw className="w-3.5 h-3.5" /> Retrain Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
