'use client';

import React, { useState, useEffect } from 'react';
import {
  Bell,
  Plus,
  ToggleRight,
  ToggleLeft,
  Sliders,
  ShieldAlert,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import { PermissionGuard } from '@/components/providers/PermissionGuard';
import { AlertRule } from '@/types/alerts.types';
import {
  fetchAllAlertRules,
  updateAlertRule,
} from '@/services/alert.service';

export default function NotificationRulesPage() {
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRules() {
      try {
        const list = await fetchAllAlertRules();
        setRules(list);
      } catch (err) {
        console.warn('Failed to load rules:', err);
      } finally {
        setLoading(false);
      }
    }
    loadRules();
  }, []);

  const handleToggle = async (rule: AlertRule) => {
    const updatedRule = { ...rule, isEnabled: !rule.isEnabled };
    try {
      await updateAlertRule(updatedRule);
      setRules((prev) => prev.map((r) => (r.id === rule.id ? updatedRule : r)));
      toast.success(
        `Rule '${rule.name}' is now ${updatedRule.isEnabled ? 'ACTIVE' : 'DISABLED'}`
      );
    } catch {
      toast.error('Failed to update rule state');
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-[1800px] mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Alert & Escalation Rules</h1>
          <p className="text-xs text-[var(--text-muted)]">
            Configure telemetry threshold rules and automated safety actions in RTDB
          </p>
        </div>

        <PermissionGuard resource="alert-rules" action="create">
          <button
            onClick={() =>
              toast.info('Rule Builder: Select metric, threshold condition, and automated escalation trigger.')
            }
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white text-xs font-semibold hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" /> Create Alert Rule
          </button>
        </PermissionGuard>
      </div>

      {loading ? (
        <div className="p-12 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-[var(--color-primary)]" />
          <p className="text-xs text-[var(--text-muted)]">Loading Configured Alert Rules...</p>
        </div>
      ) : (
        <div className="space-y-3">
          {rules.map((r) => (
            <div
              key={r.id}
              className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-[var(--color-primary)]">{r.id}</span>
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                      r.severity === 'CRITICAL'
                        ? 'bg-red-500/15 text-red-400 border-red-500/30'
                        : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                    }`}
                  >
                    {r.severity}
                  </span>
                  <span className="text-[9px] font-mono text-[var(--text-muted)] bg-[var(--bg-base)] px-2 py-0.5 rounded-full">
                    {r.category}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-[var(--text-primary)]">{r.name}</h3>
                <p className="text-xs text-[var(--text-muted)]">
                  Condition: Trigger when{' '}
                  <span className="font-mono text-[var(--text-primary)] font-semibold">
                    {r.metric} {r.operator} {r.thresholdValue}
                  </span>{' '}
                  ➔ Action:{' '}
                  <span className="font-mono text-[var(--color-primary)] font-semibold">
                    {r.actionRequired}
                  </span>
                </p>
              </div>

              <div className="flex items-center gap-4">
                <PermissionGuard resource="alert-rules" action="update">
                  <button
                    onClick={() => handleToggle(r)}
                    className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border transition-all ${
                      r.isEnabled
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25'
                        : 'bg-[var(--bg-base)] text-[var(--text-muted)] border-[var(--border-primary)]/40 hover:border-[var(--border-primary)]'
                    }`}
                  >
                    {r.isEnabled ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                    {r.isEnabled ? 'ACTIVE' : 'DISABLED'}
                  </button>
                </PermissionGuard>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
