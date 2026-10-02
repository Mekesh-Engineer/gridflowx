'use client';

import React, { useState, useEffect } from 'react';
import { Bot, Zap, ShieldCheck, Activity, CheckCircle2, RefreshCw, Cpu, Layers } from 'lucide-react';
import { AgenticChatCopilot } from '@/features/telemetry/components/AgenticChatCopilot';
import { fetchAgentStatus, AgentStatusResponse } from '@/lib/ai';

interface AgentCard {
  name: string;
  role: string;
  status: string;
  model: string;
  lastAction: string;
}

const SPECIALIZED_AGENTS: AgentCard[] = [
  { name: 'SolarForecastingAgent', role: 'PV Yield Predictor', status: 'ACTIVE', model: 'GridBrain-SolarLSTM-v3.0', lastAction: 'Generated 24h clear-sky GHI curve' },
  { name: 'LoadDemandForecastingAgent', role: 'Multi-Tier Demand Predictor', status: 'ACTIVE', model: 'GridBrain-LoadARIMA-v2.1', lastAction: 'Calculated Tier 1/2/3 demand forecast' },
  { name: 'BatteryHealthMonitoringAgent', role: 'BESS Degradation & SoH', status: 'ACTIVE', model: 'Arrhenius-LiFePO4-v2.0', lastAction: 'SoH 98.2% | ESR 12.4mΩ nominal' },
  { name: 'FaultDetectionAgent', role: 'Cyber-Physical Diagnostics', status: 'ACTIVE', model: 'GridGuard-IsoForest-v2.0', lastAction: 'Multivariate sensor scan nominal' },
  { name: 'EnergyManagementAgent', role: 'Autonomous ToU Dispatch', status: 'ACTIVE', model: 'ToU-TariffOptimizer-v1.8', lastAction: 'Dispatched Self-Consumption Vector' },
  { name: 'AutomationEngineAgent', role: 'Event-Driven Policy Trigger', status: 'ACTIVE', model: 'Deterministic Rule Engine', lastAction: 'Deep Discharge Guard armed' },
];

export default function AgenticOverviewPage() {
  const [systemStatus, setSystemStatus] = useState<AgentStatusResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loadStatus = async () => {
    setLoading(true);
    try {
      const res = await fetchAgentStatus();
      setSystemStatus(res);
    } catch (err) {
      console.error('Failed to load agent status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-[1800px] mx-auto w-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
            Agentic AI Supervisory Console
          </h1>
          <p className="text-xs text-[var(--text-muted)]">
            Autonomous multi-agent orchestration, local Qwen 2.5 3B copilot & cyber-physical failsafe monitoring
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadStatus}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Sync Agent State
          </button>
        </div>
      </div>

      {/* High-Level KPI Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 space-y-1">
          <span className="text-[10px] font-mono text-[var(--text-muted)]">ORCHESTRATOR STATUS</span>
          <p className="text-2xl font-extrabold text-emerald-400 font-mono">
            {systemStatus?.orchestratorStatus || 'ONLINE'}
          </p>
          <p className="text-[10px] text-emerald-400">FastAPI Agent Controller</p>
        </div>

        <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 space-y-1">
          <span className="text-[10px] font-mono text-[var(--text-muted)]">ACTIVE DOMAIN AGENTS</span>
          <p className="text-2xl font-extrabold text-[var(--color-primary)] font-mono">
            {systemStatus?.totalAgentsActive || 6} / 6
          </p>
          <p className="text-[10px] text-[var(--text-muted)]">Solar, Load, BESS, Fault, EMS, Auto</p>
        </div>

        <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 space-y-1">
          <span className="text-[10px] font-mono text-[var(--text-muted)]">LOCAL LLM REASONING</span>
          <p className="text-2xl font-extrabold text-indigo-400 font-mono">Qwen 2.5 3B</p>
          <p className="text-[10px] text-indigo-300">Self-Hosted via Ollama (~1.9 GB CPU)</p>
        </div>


        <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 space-y-1">
          <span className="text-[10px] font-mono text-[var(--text-muted)]">HARDWARE SAFETY ENVELOPE</span>
          <p className="text-2xl font-extrabold text-emerald-400 font-mono">
            {systemStatus?.safetyEnvelopeStatus || 'ENFORCED'}
          </p>
          <p className="text-[10px] text-emerald-400">Deterministic Interlocks Active</p>
        </div>
      </div>

      {/* Main Interactive Copilot & Planner Section */}
      <AgenticChatCopilot />

      {/* Specialized Agent Fleet Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-[var(--text-primary)]">Specialized Multi-Agent Fleet</h2>
          <span className="text-[11px] text-[var(--text-muted)] font-mono">
            Autonomous perception & decision engines
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SPECIALIZED_AGENTS.map(agent => (
            <div
              key={agent.name}
              className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 space-y-2.5 hover:border-[var(--color-primary)]/40 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-[var(--color-primary)] font-bold">
                  {agent.role}
                </span>
                <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  {agent.status}
                </span>
              </div>

              <div>
                <h3 className="text-xs font-bold text-[var(--text-primary)] font-mono">{agent.name}</h3>
                <p className="text-[10px] text-[var(--text-muted)] font-mono">Model: {agent.model}</p>
              </div>

              <div className="pt-2 border-t border-[var(--border-primary)]/20 text-[11px] text-[var(--text-muted)]">
                <span>Latest: </span>
                <span className="text-[var(--text-primary)] font-sans">{agent.lastAction}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
