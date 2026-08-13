'use client';

import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { PermissionGuard } from '@/components/providers/PermissionGuard';

const ITEMS = [
  { id: 'AGT-001', agent: 'LoadShedderAgent', action: 'Shed Tier 3 loads across SITE-03', risk: 'LOW', rationale: 'BESS SoC below 40% with high peak tariffs expected in 30 mins.', time: '3m ago' },
  { id: 'AGT-002', agent: 'BatteryOptimizerAgent', action: 'Discharge BESS at 4.5A overnight', risk: 'MEDIUM', rationale: 'Grid arbitrage opportunity based on spot market price spike.', time: '8m ago' },
  { id: 'AGT-003', agent: 'FaultRecoveryAgent', action: 'Isolate Node 7 from DC bus', risk: 'HIGH', rationale: 'Detected 0.4V ground voltage variance anomaly on Feeder 2.', time: '12m ago' },
];

export default function AgenticQueuePage() {
  const [queue, setQueue] = useState(ITEMS);
  const [rationaleText, setRationaleText] = useState('');

  const handleAction = (id: string, approve: boolean) => {
    setQueue(prev => prev.filter(i => i.id !== id));
    toast.success(approve ? `Action ${id} approved by supervisor` : `Action ${id} rejected`);
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-[1800px] mx-auto w-full">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Human Approval Queue</h1>
        <p className="text-xs text-[var(--text-muted)]">High-impact autonomous AI actions requiring human-in-the-loop validation</p>
      </div>

      <div className="space-y-4">
        {queue.length === 0 ? (
          <div className="p-8 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 text-center text-xs text-[var(--text-muted)] space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <p className="font-semibold text-sm text-[var(--text-primary)]">All Approval Items Cleared</p>
            <p>No high-risk autonomous actions currently pending supervisor review.</p>
          </div>
        ) : (
          queue.map(item => (
            <div key={item.id} className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-[var(--color-primary)]">{item.id}</span>
                  <span className="text-xs font-semibold text-[var(--text-muted)]">({item.agent})</span>
                </div>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                  item.risk === 'HIGH' ? 'bg-red-500/15 text-red-400 border-red-500/30' :
                  item.risk === 'MEDIUM' ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' :
                  'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                }`}>
                  {item.risk} RISK
                </span>
              </div>

              <h3 className="text-base font-bold text-[var(--text-primary)]">{item.action}</h3>
              <p className="text-xs text-[var(--text-muted)] bg-[var(--bg-base)] p-3 rounded-lg border border-[var(--border-primary)]/20 italic">
                "{item.rationale}"
              </p>

              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="text-xs text-[var(--text-muted)] font-mono flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Requested {item.time}
                </span>

                <PermissionGuard resource="agent-approvals" action="approve">
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleAction(item.id, true)} className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-bold hover:opacity-90 transition-opacity">
                      <CheckCircle2 className="w-4 h-4" /> Approve Action
                    </button>
                    <button onClick={() => handleAction(item.id, false)} className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold hover:bg-red-500/20 transition-all">
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                  </div>
                </PermissionGuard>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
