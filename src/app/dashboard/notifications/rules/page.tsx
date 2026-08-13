'use client';

import React from 'react';
import { Bell, Plus, ToggleRight } from 'lucide-react';
import { toast } from 'sonner';
import { PermissionGuard } from '@/components/providers/PermissionGuard';

const RULES = [
  { id: 'RULE-01', name: 'BESS SoC Critical Below 20%', channel: 'SMS + Webhook', trigger: 'Telemetry &lt; 20%', status: 'ACTIVE' },
  { id: 'RULE-02', name: 'Thermal Warning Temp &gt; 35°C', channel: 'Email + In-App', trigger: 'Temp &gt; 35°C', status: 'ACTIVE' },
];

export default function NotificationRulesPage() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-[1800px] mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Alert & Escalation Rules</h1>
          <p className="text-xs text-[var(--text-muted)]">Configure telemetry threshold alert rules and multi-channel delivery escalation</p>
        </div>

        <PermissionGuard resource="alert-rules" action="create">
          <button onClick={() => toast.info('New alert rule modal triggered')} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white text-xs font-semibold hover:opacity-90 transition-opacity">
            <Plus className="w-4 h-4" /> Create Alert Rule
          </button>
        </PermissionGuard>
      </div>

      <div className="space-y-3">
        {RULES.map(r => (
          <div key={r.id} className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono font-bold text-[var(--color-primary)]">{r.id}</span>
              <h3 className="text-sm font-bold text-[var(--text-primary)] mt-0.5">{r.name}</h3>
              <p className="text-xs text-[var(--text-muted)] mt-1">Channel: <strong className="text-[var(--text-primary)]">{r.channel}</strong></p>
            </div>

            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              {r.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
