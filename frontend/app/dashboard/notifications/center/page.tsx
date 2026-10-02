'use client';

import React, { useState, useEffect } from 'react';
import {
  Bell,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldAlert,
  Loader2,
  RefreshCw,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { AlertDocument, AlertSeverity } from '@/types/alerts.types';
import {
  fetchAllAlerts,
  subscribeToAlerts,
  acknowledgeAlert,
  INITIAL_ALERTS,
} from '@/services/alert.service';

export default function NotificationsCenterPage() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<AlertDocument[]>(INITIAL_ALERTS);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');

  useEffect(() => {
    const unsubscribe = subscribeToAlerts(
      (list) => {
        setAlerts(list);
        setLoading(false);
      },
      (err) => {
        console.warn('Realtime alert subscription failed, falling back:', err);
        fetchAllAlerts().then((a) => {
          setAlerts(a);
          setLoading(false);
        });
      }
    );

    return () => unsubscribe();
  }, []);

  const handleAcknowledge = async (alertId: string) => {
    try {
      await acknowledgeAlert(alertId, user?.uid || 'OPERATOR');
      toast.success(`Alert ${alertId} acknowledged`);
    } catch {
      toast.error('Failed to acknowledge alert');
    }
  };

  const filtered = alerts.filter((a) => {
    if (severityFilter === 'ALL') return true;
    return a.severity === severityFilter;
  });

  const getSeverityStyle = (severity: AlertSeverity) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-500/15 text-red-400 border-red-500/30';
      case 'WARNING':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'INFO':
        return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
      case 'SUCCESS':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-[1800px] mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Notification Center</h1>
          <p className="text-xs text-[var(--text-muted)]">
            Central alert feed, real-time hardware telemetry fault events and operator acknowledgements
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 text-xs focus:outline-none focus:border-[var(--color-primary)]"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical Only</option>
            <option value="WARNING">Warnings</option>
            <option value="INFO">Info</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="p-12 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-[var(--color-primary)]" />
          <p className="text-xs text-[var(--text-muted)]">Loading Real-Time Notification Feed...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 text-center text-xs text-[var(--text-muted)]">
          No matching notifications in event stream.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((n) => (
            <div
              key={n.id}
              className={`p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                n.isAcknowledged ? 'opacity-70' : 'opacity-100 border-l-4 border-l-[var(--color-primary)]'
              }`}
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-[var(--text-primary)] truncate">{n.title}</h3>
                  <span
                    className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${getSeverityStyle(
                      n.severity
                    )}`}
                  >
                    {n.severity}
                  </span>
                  <span className="text-[9px] font-mono text-[var(--text-muted)] bg-[var(--bg-base)] px-2 py-0.5 rounded-full">
                    {n.category}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-muted)]">{n.message}</p>
                <p className="text-[10px] text-[var(--text-muted)] font-mono flex items-center gap-1 pt-0.5">
                  <Clock className="w-3 h-3" />
                  {new Date(n.timestamp).toLocaleString()} · Node: {n.deviceId}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {n.isAcknowledged ? (
                  <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">
                    <Check className="w-3.5 h-3.5" /> Acknowledged
                  </span>
                ) : (
                  <button
                    onClick={() => handleAcknowledge(n.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--color-primary)] text-white text-xs font-semibold hover:opacity-90 transition-opacity"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Acknowledge
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
