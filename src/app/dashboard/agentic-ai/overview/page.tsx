'use client';

import React from 'react';
import { Bot, Zap, ShieldCheck, Activity, CheckCircle2 } from 'lucide-react';

const AGENTS = [
  { name: 'LoadShedderAgent', role: 'Dynamic Load Balancer', status: 'ACTIVE', executions: 342, lastAction: 'Shed Tier 3 loads at SITE-03' },
  { name: 'BatteryOptimizerAgent', role: 'BESS Arbitrage Manager', status: 'ACTIVE', executions: 1205, lastAction: 'Scheduled 3.2A discharge' },
  { name: 'FaultRecoveryAgent', role: 'Emergency Islanding Agent', status: 'STANDBY', executions: 14, lastAction: 'System self-check nominal' },
];

export default function AgenticOverviewPage() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-[1800px] mx-auto w-full">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Agent Orchestration Dashboard</h1>
        <p className="text-xs text-[var(--text-muted)]">Autonomous agentic AI workflows, agent state machines & execution counts</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {AGENTS.map(a => (
          <div key={a.name} className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-[var(--color-primary)] font-bold">{a.role}</span>
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                a.status === 'ACTIVE' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 'bg-[var(--bg-base)] text-[var(--text-muted)] border-[var(--border-primary)]/30'
              }`}>
                {a.status}
              </span>
            </div>

            <h3 className="text-base font-bold text-[var(--text-primary)]">{a.name}</h3>
            <p className="text-xs text-[var(--text-muted)]">Last Action: <span className="text-[var(--text-primary)]">{a.lastAction}</span></p>

            <div className="pt-2 border-t border-[var(--border-primary)]/20 flex justify-between text-xs text-[var(--text-muted)]">
              <span>Total Executions:</span>
              <span className="font-mono font-bold text-[var(--text-primary)]">{a.executions}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
