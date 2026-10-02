'use client';

import React, { useState, useEffect } from 'react';
import { GitBranch, RefreshCw, CheckCircle2, AlertTriangle, Cpu, Activity, ShieldCheck } from 'lucide-react';
import { fetchAiModels, triggerModelRetraining } from '@/features/optimization/services/optimization.service';
import { ModelMetadata } from '@/types/ai.types';
import { toast } from 'sonner';

export default function AiModelsPage() {
  const [models, setModels] = useState<ModelMetadata[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [retrainingId, setRetrainingId] = useState<string | null>(null);

  const loadModels = async () => {
    setLoading(true);
    try {
      const res = await fetchAiModels();
      setModels(res.models || []);
    } catch (err: any) {
      console.error('Failed to load AI model registry:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadModels();
  }, []);

  const handleRetrain = async (modelId: string, modelName: string) => {
    setRetrainingId(modelId);
    try {
      const res = await triggerModelRetraining(modelId);
      toast.success(res.message || `Retraining pipeline for ${modelName} completed successfully!`);
      loadModels();
    } catch (err: any) {
      toast.error(err?.message || `Failed to trigger retraining for ${modelName}`);
    } finally {
      setRetrainingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-[1800px] mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight">AI Model Registry & Retraining Studio</h1>
          <p className="text-xs text-[var(--text-muted)] font-mono">
            Versioned machine learning model artifacts, concept drift tracking & automated retraining trigger
          </p>
        </div>

        <button
          onClick={loadModels}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Registry
        </button>
      </div>

      {/* Model Artifact Cards */}
      <div className="space-y-4">
        {models.map((m) => {
          const isRetraining = retrainingId === m.modelId;
          return (
            <div
              key={m.modelId}
              className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 flex flex-col lg:flex-row lg:items-center justify-between gap-5 transition-all hover:border-[var(--color-primary)]/40"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold font-mono text-[var(--text-primary)]">{m.name}</span>
                  <span className="text-xs font-mono text-[var(--text-muted)]">v{m.version}</span>
                  <span
                    className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${
                      m.status === 'ACTIVE'
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                    }`}
                  >
                    {m.status}
                  </span>
                </div>

                <p className="text-xs text-[var(--text-muted)]">
                  Architecture: <strong className="text-[var(--text-primary)]">{m.type}</strong> · Inputs: {m.inputFeaturesCount} Features · Last Trained: {new Date(m.trainedAt).toLocaleDateString()}
                </p>
              </div>

              {/* Metrics Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                <div className="p-2.5 rounded bg-[var(--bg-base)] border border-[var(--border-primary)]/20 text-center">
                  <p className="text-[10px] text-[var(--text-muted)]">Concept Drift</p>
                  <p className="text-sm font-bold text-emerald-400">{m.driftScore.toFixed(3)}</p>
                </div>

                <div className="p-2.5 rounded bg-[var(--bg-base)] border border-[var(--border-primary)]/20 text-center">
                  <p className="text-[10px] text-[var(--text-muted)]">Accuracy</p>
                  <p className="text-sm font-bold text-[var(--color-primary)]">{m.accuracyPct}%</p>
                </div>

                <div className="p-2.5 rounded bg-[var(--bg-base)] border border-[var(--border-primary)]/20 text-center">
                  <p className="text-[10px] text-[var(--text-muted)]">Val MAE</p>
                  <p className="text-sm font-bold text-[var(--text-primary)]">{m.maeLoss}</p>
                </div>

                <div className="p-2.5 rounded bg-[var(--bg-base)] border border-[var(--border-primary)]/20 text-center">
                  <p className="text-[10px] text-[var(--text-muted)]">Inference Latency</p>
                  <p className="text-sm font-bold text-indigo-400">{m.inferenceLatencyMs} ms</p>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleRetrain(m.modelId, m.name)}
                  disabled={isRetraining}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--bg-base)] border border-[var(--border-primary)]/50 text-xs font-semibold hover:border-[var(--color-primary)] text-[var(--text-primary)] hover:text-[var(--color-primary)] transition-all"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRetraining ? 'animate-spin text-[var(--color-primary)]' : ''}`} />
                  {isRetraining ? 'Retraining...' : 'Retrain Now'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
