'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Download, Eye, Calendar, RefreshCw } from 'lucide-react';
import { fetchAllReports, downloadReportCsv, OperationalReport } from '@/features/reports/services/report.service';
import { toast } from 'sonner';

export default function ReportArchivePage() {
  const [reports, setReports] = useState<OperationalReport[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadReports = async () => {
    setLoading(true);
    try {
      const data = await fetchAllReports();
      setReports(data);
    } catch (err: any) {
      console.error('Failed to load report archive:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-[1800px] mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Historical Operational Report Archive</h1>
          <p className="text-xs text-[var(--text-muted)]">
            Archived compliance logs, energy audit evidence & executive operational summary documents
          </p>
        </div>

        <button
          onClick={loadReports}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Archive
        </button>
      </div>

      <div className="space-y-3">
        {reports.map((r) => (
          <div
            key={r.id}
            className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-[var(--color-primary)]/40"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-[var(--color-primary)]">{r.id}</span>
                <span className="text-xs font-mono text-[var(--text-muted)]">({r.period})</span>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full border bg-emerald-500/15 text-emerald-400 border-emerald-500/30">
                  {r.status}
                </span>
              </div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">{r.title}</h3>
              <p className="text-xs text-[var(--text-muted)] font-mono">
                Solar: {r.totalSolarGeneratedKwh} kWh · Load: {r.totalLoadConsumedKwh} kWh · Savings: ${r.totalFinancialSavingsUsd} · CO₂: {r.co2DisplacedKg} kg
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-[var(--text-muted)] font-mono">
                {new Date(r.generatedAt).toLocaleDateString()}
              </span>
              <button
                onClick={() => {
                  downloadReportCsv(r);
                  toast.success(`Exported ${r.id}`);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg-base)] border border-[var(--border-primary)]/40 text-xs font-semibold hover:border-[var(--color-primary)] transition-all"
              >
                <Download className="w-3.5 h-3.5" /> Download CSV
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
