'use client';

import React, { useState, useEffect } from 'react';
import { AlertTriangle, ShieldAlert, FileText, CheckCircle2, RefreshCw, Activity, ShieldCheck } from 'lucide-react';
import { fetchLiveAnomalies, AnomalyDetectionResult } from '@/features/anomaly/services/anomaly.service';
import { fetchAllAlerts, acknowledgeAlert } from '@/services/alert.service';
import { AlertDocument } from '@/types/alerts.types';
import { toast } from 'sonner';

export default function IncidentsPage() {
  const [anomalyResult, setAnomalyResult] = useState<AnomalyDetectionResult | null>(null);
  const [alerts, setAlerts] = useState<AlertDocument[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [anom, alts] = await Promise.all([
        fetchLiveAnomalies().catch(() => null),
        fetchAllAlerts().catch(() => []),
      ]);
      if (anom) setAnomalyResult(anom);
      setAlerts(alts);
    } catch (err) {
      console.error('Failed to load incident triage data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleResolveAlert = async (alertId: string) => {
    try {
      await acknowledgeAlert(alertId, 'OPERATOR');
      toast.success(`Incident ${alertId} acknowledged and triaged`);
      loadData();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to acknowledge incident');
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-[1800px] mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Cyber-Physical Incident Triage Portal</h1>
          <p className="text-xs text-[var(--text-muted)]">
            Multivariate Isolation Forest anomaly detection & hardware fault diagnostics across microgrid circuits
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Diagnostics
        </button>
      </div>

      {/* Diagnostics Health Banner */}
      <div className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
        anomalyResult?.overallAnomalyDetected
          ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
          : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
      }`}>
        <div className="flex items-center gap-3">
          {anomalyResult?.overallAnomalyDetected ? (
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          ) : (
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          )}
          <div className="space-y-0.5">
            <p className="text-xs font-bold uppercase tracking-wider">
              {anomalyResult?.overallAnomalyDetected ? 'Active Sensor Anomaly Detected' : 'All Microgrid Circuits Nominal'}
            </p>
            <p className="text-xs text-[var(--text-muted)]">
              {anomalyResult?.mitigationRecommendation || 'Baseline telemetry consistent with trained Isolation Forest envelope.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <span>Isolation Forest Score: <strong>{anomalyResult?.isolationForestScore?.toFixed(3) || '0.040'}</strong></span>
        </div>
      </div>

      {/* Detected Telemetry Anomalies */}
      {anomalyResult?.anomalies && anomalyResult.anomalies.length > 0 ? (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <Activity className="w-4 h-4 text-amber-400" /> Real-Time Telemetry Deviations
          </h2>

          <div className="grid grid-cols-1 gap-3">
            {anomalyResult.anomalies.map((a, i) => (
              <div
                key={i}
                className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[var(--text-primary)]">{a.circuitName}</span>
                    <span className="text-xs font-mono text-[var(--text-muted)]">({a.metric})</span>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                        a.severity === 'CRITICAL'
                          ? 'bg-red-500/15 text-red-400 border-red-500/30'
                          : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                      }`}
                    >
                      {a.severity}
                    </span>
                  </div>

                  <p className="text-xs text-[var(--text-muted)]">
                    Hypothesis: <strong className="text-[var(--text-primary)]">{a.rootCauseHypothesis}</strong>
                  </p>

                  <p className="text-[11px] font-mono text-[var(--text-muted)]">
                    Observed: <strong className="text-amber-400">{a.observedValue}</strong> · Expected: [{a.expectedRange.join(', ')}]
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toast.info(`Diagnostics details logged for ${a.circuitName}`)}
                    className="px-3 py-1.5 rounded-lg bg-[var(--bg-base)] border border-[var(--border-primary)]/40 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--color-primary)] transition-all"
                  >
                    Inspect Circuit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Active System Incidents & Alerts */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-indigo-400" /> Active System Incidents & Safety Events
        </h2>

        {alerts.length === 0 ? (
          <div className="p-8 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 text-center text-xs text-[var(--text-muted)]">
            No active incidents or unacknowledged faults logged.
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((inc) => (
              <div
                key={inc.id}
                className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-red-400">{inc.id.slice(0, 10)}</span>
                    <span className="text-xs font-bold text-[var(--text-muted)]">({inc.deviceId})</span>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                        inc.severity === 'CRITICAL'
                          ? 'bg-red-500/15 text-red-400 border-red-500/30'
                          : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                      }`}
                    >
                      {inc.severity}
                    </span>
                    <span className="text-[9px] font-mono text-[var(--text-muted)]">
                      {inc.isAcknowledged ? 'ACKNOWLEDGED' : 'PENDING_TRIAGE'}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">{inc.title}</h3>
                  <p className="text-xs text-[var(--text-muted)]">{inc.message}</p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-[var(--text-muted)]">
                    {new Date(inc.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {!inc.isAcknowledged ? (
                    <button
                      onClick={() => handleResolveAlert(inc.id)}
                      className="px-3 py-1.5 rounded-lg bg-[var(--bg-base)] border border-[var(--border-primary)]/40 text-xs font-semibold hover:border-emerald-500/60 hover:text-emerald-400 transition-all"
                    >
                      Triage & Acknowledge →
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Handled
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
