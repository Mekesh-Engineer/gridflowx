'use client';

import React, { useState, useEffect } from 'react';
import {
  ToggleLeft,
  Clock,
  AlertTriangle,
  ShieldCheck,
  RotateCcw,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { toggleRelayOverride } from '@/features/relay/services/relay.service';
import { queryAuditLogs } from '@/services/audit.service';
import { AuditEvent } from '@/types/audit.types';
import { PermissionGuard } from '@/components/providers/PermissionGuard';

export default function OverridesPage() {
  const { user } = useAuth();
  const [overrideLogs, setOverrideLogs] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOverrideLogs() {
      try {
        const logs = await queryAuditLogs({ limitCount: 50 });
        const filtered = logs.filter(
          (event) =>
            event.action === 'RELAY_OVERRIDE_APPLIED' ||
            event.action === 'EMERGENCY_STOP_TRIGGERED'
        );
        setOverrideLogs(filtered);
      } catch (err) {
        console.warn('Failed to load override audit logs:', err);
      } finally {
        setLoading(false);
      }
    }
    loadOverrideLogs();
  }, []);

  const handleRevert = async (relayIndex: number, channelName: string) => {
    try {
      await toggleRelayOverride(
        relayIndex,
        true, // nominal safe state
        'Reverting manual override to nominal state',
        user
      );
      toast.success(`Override reverted for ${channelName}`);
    } catch {
      toast.error(`Failed to revert override for ${channelName}`);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-[1800px] mx-auto w-full">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Manual Relay Override Log</h1>
        <p className="text-xs text-[var(--text-muted)]">
          Active hardware relay overrides, safety countdown timers and operator audit rationales
        </p>
      </div>

      {loading ? (
        <div className="p-12 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-[var(--color-primary)]" />
          <p className="text-xs text-[var(--text-muted)]">Loading Active Override Logs...</p>
        </div>
      ) : overrideLogs.length === 0 ? (
        <div className="p-8 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 text-center space-y-2">
          <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto" />
          <p className="text-sm font-semibold">No active relay overrides in session</p>
          <p className="text-xs text-[var(--text-muted)]">
            All 8 microgrid relay channels are operating under autonomous AI energy management.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {overrideLogs.map((ovr) => {
            const ch = ovr.details?.relayIndex ?? 0;
            const state = ovr.details?.newState;
            return (
              <div
                key={ovr.id}
                className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-[var(--color-primary)]">
                      {ovr.id}
                    </span>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full border bg-amber-500/15 text-amber-400 border-amber-500/30">
                      OVERRIDE ACTIVE
                    </span>
                    <span className="text-[9px] font-mono text-[var(--text-muted)] bg-[var(--bg-base)] px-2 py-0.5 rounded-full">
                      Channel {ch}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">
                    Target State: {state ? 'FORCE ON' : 'FORCE ISOLATED / OFF'}
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] italic">
                    "{ovr.details?.reason || 'Manual override'}" — by {ovr.actorEmail} ({ovr.actorRole})
                  </p>
                  <p className="text-[10px] text-[var(--text-muted)] font-mono flex items-center gap-1 pt-0.5">
                    <Clock className="w-3 h-3" />
                    Applied at: {new Date(ovr.timestamp).toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <PermissionGuard resource="relays" action="override">
                    <button
                      onClick={() => handleRevert(ch, `Channel ${ch}`)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg-base)] border border-[var(--border-primary)]/40 text-xs font-semibold hover:border-[var(--color-primary)] transition-all"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Revert to Nominal
                    </button>
                  </PermissionGuard>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
