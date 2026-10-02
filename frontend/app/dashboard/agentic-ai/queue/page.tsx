'use client';

import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, XCircle, Clock, AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { PermissionGuard } from '@/components/providers/PermissionGuard';
import { fetchFromAIService } from '@/lib/ai';
import { useAuth } from '@/hooks/use-auth';
import { recordAuditEvent } from '@/services/audit.service';

const INITIAL_QUEUE_ITEMS = [
  { id: 'ACT-OVR-001', agent: 'LoadShedderAgent', action: 'Shed Tier 3 loads across SITE-03', risk: 'LOW', rationale: 'BESS SoC below 40% with high peak tariffs expected in 30 mins.', time: '3m ago' },
  { id: 'ACT-OVR-002', agent: 'BatteryOptimizerAgent', action: 'Discharge BESS at 4.5A overnight', risk: 'MEDIUM', rationale: 'Grid arbitrage opportunity based on spot market price spike.', time: '8m ago' },
  { id: 'ACT-OVR-003', agent: 'FaultRecoveryAgent', action: 'Isolate Node 7 from DC bus', risk: 'HIGH', rationale: 'Detected 0.4V ground variance anomaly on Feeder 2.', time: '12m ago' },
];

export default function AgenticQueuePage() {
  const { user } = useAuth();
  const [queue, setQueue] = useState(INITIAL_QUEUE_ITEMS);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const handleAction = async (id: string, approve: boolean) => {
    setActionLoadingId(id);
    const token = user?.uid ? `dev-${user.role.toLowerCase()}` : 'dev-supervisor';

    try {
      // 1. Dispatch HITL authorization request to FastAPI agent gateway
      await fetchFromAIService('/api/v1/agent/actions/approve', {
        method: 'POST',
        body: {
          actionId: id,
          authorized: approve,
          reason: approve ? 'Authorized by supervisor in Agentic Queue' : 'Rejected by supervisor',
        },
        token,
      });

      // 2. Record immutable compliance record in Supabase audit ledger
      try {
        await recordAuditEvent({
          actorUid: user?.uid || 'SUPERVISOR',
          actorEmail: user?.email || 'supervisor@gridflowx.io',
          actorRole: user?.role || 'supervisor',
          action: approve ? 'AI_ACTION_AUTHORIZED' : 'AI_ACTION_REJECTED',
          severity: approve ? 'WARNING' : 'INFO',
          status: 'SUCCESS',
          resource: `agentic/actions/${id}`,
          details: { actionId: id, authorized: approve },
        });
      } catch (auditErr) {
        console.warn('Audit ledger logging standby:', auditErr);
      }

      setQueue((prev) => prev.filter((i) => i.id !== id));
      toast.success(
        approve
          ? `Action ${id} authorized and dispatched to hardware microgrid controller.`
          : `Action ${id} rejected and cancelled.`
      );
    } catch (err: any) {
      toast.error(`Authorization failed: ${err?.message || 'Server error'}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-[1800px] mx-auto w-full">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Human Approval Queue</h1>
        <p className="text-xs text-[var(--text-muted)]">
          High-impact autonomous AI actions requiring human-in-the-loop validation
        </p>
      </div>

      <div className="space-y-4">
        {queue.length === 0 ? (
          <div className="p-8 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 text-center text-xs text-[var(--text-muted)] space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <p className="font-semibold text-sm text-[var(--text-primary)]">All Approval Items Cleared</p>
            <p>No high-risk autonomous actions currently pending supervisor review.</p>
          </div>
        ) : (
          queue.map((item) => {
            const isLoading = actionLoadingId === item.id;
            return (
              <div
                key={item.id}
                className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-[var(--color-primary)]">{item.id}</span>
                    <span className="text-xs font-semibold text-[var(--text-muted)]">({item.agent})</span>
                  </div>
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                      item.risk === 'HIGH'
                        ? 'bg-red-500/15 text-red-400 border-red-500/30'
                        : item.risk === 'MEDIUM'
                        ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                        : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                    }`}
                  >
                    {item.risk} RISK
                  </span>
                </div>

                <h3 className="text-base font-bold text-[var(--text-primary)]">{item.action}</h3>
                <p className="text-xs text-[var(--text-muted)] bg-[var(--bg-base)] p-3 rounded-lg border border-[var(--border-primary)]/20 italic">
                  &ldquo;{item.rationale}&rdquo;
                </p>

                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <span className="text-xs text-[var(--text-muted)] font-mono flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Requested {item.time}
                  </span>

                  <PermissionGuard resource="agent-approvals" action="approve">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAction(item.id, true)}
                        disabled={isLoading}
                        className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
                      >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                        Approve Action
                      </button>
                      <button
                        onClick={() => handleAction(item.id, false)}
                        disabled={isLoading}
                        className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold hover:bg-red-500/20 transition-all disabled:opacity-50"
                      >
                        <XCircle className="w-4 h-4" /> Reject
                      </button>
                    </div>
                  </PermissionGuard>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
