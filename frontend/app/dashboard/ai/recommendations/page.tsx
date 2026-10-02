'use client';

import React, { useState, useEffect } from 'react';
import { Brain, CheckCircle2, XCircle, ArrowUpRight, RefreshCw, DollarSign, Leaf, Zap, ShieldCheck } from 'lucide-react';
import {
  fetchOptimalDispatch,
  applyOptimizationDecision,
  OptimizationDecision,
} from '@/features/optimization/services/optimization.service';
import { RELAY_CHANNEL_METADATA } from '@/types/relay.types';
import { toast } from 'sonner';

export default function AiRecommendationsPage() {
  const [decision, setDecision] = useState<OptimizationDecision | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [applying, setApplying] = useState<boolean>(false);

  const loadDecision = async () => {
    setLoading(true);
    try {
      const data = await fetchOptimalDispatch('GFX-ESP32-MASTER-01');
      setDecision(data);
    } catch (err: any) {
      console.error('Failed to load AI optimization decision:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDecision();
  }, []);

  const handleAccept = async () => {
    if (!decision) return;
    setApplying(true);
    try {
      const res = await applyOptimizationDecision(
        decision.decisionId,
        decision.targetRelayStates
      );
      toast.success(res.message || `Optimization recommendation ${decision.decisionId} dispatched to microgrid!`);
      loadDecision();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to apply optimization decision');
    } finally {
      setApplying(false);
    }
  };

  const handleDismiss = () => {
    toast.info(`Recommendation ${decision?.decisionId} dismissed for current interval`);
    loadDecision();
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-[1800px] mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight">AI Autonomous Energy Optimization & Dispatch</h1>
          <p className="text-xs text-[var(--text-muted)]">
            Cyber-Physical Energy Management System (EMS) decision solver for Time-of-Use tariffs & renewable maximization
          </p>
        </div>

        <button
          onClick={loadDecision}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Re-evaluate Optimization
        </button>
      </div>

      {/* Primary Decision Card */}
      {decision ? (
        <div className="p-6 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-primary)]/30 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-[var(--color-primary)]" />
                <span className="text-sm font-mono font-bold text-[var(--text-primary)]">{decision.decisionId}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  decision.tariffWindow === 'PEAK'
                    ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                    : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                }`}>
                  {decision.tariffWindow} TARIFF (${decision.currentTariffRateUsdPerKwh}/kWh)
                </span>
              </div>
              <p className="text-base font-bold text-[var(--text-primary)]">{decision.actionSummary}</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right text-xs">
                <p className="text-[var(--text-muted)]">Confidence</p>
                <p className="text-emerald-400 font-extrabold font-mono text-sm">{decision.confidencePct}%</p>
              </div>
            </div>
          </div>

          {/* Economic & Environmental Impact */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-[var(--bg-base)] border border-[var(--border-primary)]/30 space-y-1 text-center">
              <div className="flex items-center justify-center gap-1.5 text-xs text-[var(--text-muted)]">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span>Projected Savings</span>
              </div>
              <p className="text-2xl font-extrabold text-emerald-400 font-mono">
                +${decision.estimatedCostSavingsUsd.toFixed(2)}
              </p>
              <p className="text-[10px] text-[var(--text-muted)]">vs Baseline Tariff Infeed</p>
            </div>

            <div className="p-4 rounded-lg bg-[var(--bg-base)] border border-[var(--border-primary)]/30 space-y-1 text-center">
              <div className="flex items-center justify-center gap-1.5 text-xs text-[var(--text-muted)]">
                <Leaf className="w-4 h-4 text-emerald-400" />
                <span>CO2 Emissions Avoided</span>
              </div>
              <p className="text-2xl font-extrabold text-emerald-400 font-mono">
                {decision.estimatedCo2DisplacedKg.toFixed(2)} kg
              </p>
              <p className="text-[10px] text-[var(--text-muted)]">Clean Solar Displaced</p>
            </div>

            <div className="p-4 rounded-lg bg-[var(--bg-base)] border border-[var(--border-primary)]/30 space-y-1 text-center">
              <div className="flex items-center justify-center gap-1.5 text-xs text-[var(--text-muted)]">
                <ShieldCheck className="w-4 h-4 text-[var(--color-primary)]" />
                <span>Execution Status</span>
              </div>
              <p className="text-lg font-bold text-[var(--text-primary)] font-mono">
                {decision.status}
              </p>
              <p className="text-[10px] text-[var(--text-muted)]">
                {decision.requiresSupervisorApproval ? 'Supervisor Auth Required' : 'Operator Pre-Authorized'}
              </p>
            </div>
          </div>

          {/* Explainability Reasoning Trace */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
              AI Explainability & Reasoning Trace
            </h3>
            <div className="p-3.5 rounded-lg bg-[var(--bg-base)] border border-[var(--border-primary)]/30 space-y-1.5 text-xs">
              {decision.reasoningTrace.map((step, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-[var(--color-primary)] font-mono font-bold">[{i + 1}]</span>
                  <span className="text-[var(--text-primary)]">{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Target Relay Actuation Preview */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Target 8-Channel Relay Actuation Vector
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
              {decision.targetRelayStates.map((state, idx) => {
                const meta = RELAY_CHANNEL_METADATA[idx as keyof typeof RELAY_CHANNEL_METADATA];
                return (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-lg text-center border transition-all ${
                      state
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                        : 'bg-zinc-800/30 border-zinc-700/40 text-[var(--text-muted)]'
                    }`}
                  >
                    <p className="text-[10px] font-mono font-bold">CH {idx}</p>
                    <p className="text-xs font-extrabold my-0.5">{state ? 'ON' : 'OFF'}</p>
                    <p className="text-[9px] truncate text-[var(--text-muted)]">{meta?.name || `Relay ${idx}`}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border-primary)]/30">
            <button
              onClick={handleDismiss}
              className="px-4 py-2 rounded-lg bg-[var(--bg-base)] border border-[var(--border-primary)]/50 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all"
            >
              Dismiss
            </button>
            <button
              onClick={handleAccept}
              disabled={applying}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-bold hover:bg-emerald-500/30 transition-all shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              {applying ? 'Dispatching...' : 'Accept & Apply Relay Dispatch'}
            </button>
          </div>
        </div>
      ) : (
        <div className="p-12 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 text-center text-xs text-[var(--text-muted)]">
          {loading ? 'Evaluating microgrid optimization model...' : 'No optimization decision available.'}
        </div>
      )}
    </div>
  );
}
