'use client';

import React from 'react';
import { Clock, GitBranch, CheckCircle2, Bot } from 'lucide-react';

const STEPS = [
  { step: '01', tool: 'telemetry_read', input: 'SITE-03 Battery Bank', result: 'SoC: 38.2%, Temp: 34.2°C', time: '05:28:10' },
  { step: '02', tool: 'forecast_query', input: 'Irradiance Next 2h', result: 'Cloud Cover: 65%, Irrad: 210 W/m²', time: '05:28:11' },
  { step: '03', tool: 'propose_action', input: 'Shed Tier 3 Loads', result: 'Submitted to Human Approval Queue (AGT-001)', time: '05:28:12' },
];

export default function AgenticTimelinePage() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-[1800px] mx-auto w-full">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Agent Execution Timeline & DAG Trace</h1>
        <p className="text-xs text-[var(--text-muted)] font-mono">Step-by-step reasoning trace, memory state retrieval & tool invocation audit</p>
      </div>

      <div className="p-6 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-[var(--color-primary)]">Trace ID: TRC-9920-LOAD-SHED</span>
          <span className="text-xs font-semibold text-[var(--text-muted)] font-mono">Execution time: 2.1s</span>
        </div>

        <div className="space-y-3 relative before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-[var(--border-primary)]/40">
          {STEPS.map(s => (
            <div key={s.step} className="flex items-start gap-4 relative pl-8">
              <div className="w-6 h-6 rounded-full bg-[var(--color-primary)]/20 border border-[var(--color-primary)] text-[var(--color-primary)] text-xs font-bold flex items-center justify-center absolute left-0 top-0.5">
                {s.step}
              </div>
              <div className="flex-1 p-3 rounded-lg bg-[var(--bg-base)] border border-[var(--border-primary)]/30 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-mono font-bold text-[var(--color-primary)]">Tool: {s.tool}</span>
                  <span className="text-[var(--text-muted)] font-mono">{s.time}</span>
                </div>
                <p className="text-xs text-[var(--text-muted)]">Input: <span className="text-[var(--text-primary)] font-mono">{s.input}</span></p>
                <p className="text-xs text-emerald-400 font-mono">Output: {s.result}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
