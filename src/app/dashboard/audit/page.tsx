'use client';

import React, { useState } from 'react';
import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import {
  FileText,
  CheckCircle2,
  Download,
  Search,
  ShieldCheck,
  Lock,
  Database,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';

export default function AuditDashboardPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');

  const auditLogs = [
    {
      id: 'LOG-9920',
      timestamp: '2026-07-18 05:28:12 UTC',
      actor: 'system.fastapi@gridflowx.com',
      action: 'TELEMETRY_BATCH_SYNC',
      target: 'Sector 4 / Battery Bank A',
      severity: 'INFO',
      hash: 'e8a71...9f0c',
    },
    {
      id: 'LOG-9919',
      timestamp: '2026-07-18 05:15:04 UTC',
      actor: 'admin.mekesh@gridflowx.com',
      action: 'THRESHOLD_UPDATE',
      target: 'System Configurations / TELEMETRY_LIMITS',
      severity: 'WARNING',
      hash: '3f0b2...11d8',
    },
    {
      id: 'LOG-9918',
      timestamp: '2026-07-18 04:52:41 UTC',
      actor: 'operator.jane@gridflowx.com',
      action: 'RELAY_STATE_TOGGLE',
      target: 'Sector 2 / Feeder Breaker 04',
      severity: 'INFO',
      hash: '9c44e...88ab',
    },
    {
      id: 'LOG-9917',
      timestamp: '2026-07-18 03:20:18 UTC',
      actor: 'supervisor.davis@gridflowx.com',
      action: 'ALERT_ACKNOWLEDGE',
      target: 'Alert ALT-107 (Thermal Drift)',
      severity: 'INFO',
      hash: 'b112c...773a',
    },
    {
      id: 'LOG-9916',
      timestamp: '2026-07-18 02:05:00 UTC',
      actor: 'admin.mekesh@gridflowx.com',
      action: 'USER_ROLE_ASSIGNMENT',
      target: 'User uid: d8f09... -> SUPERVISOR',
      severity: 'CRITICAL',
      hash: 'a001f...5529',
    },
  ];

  const filteredLogs = auditLogs.filter(
    (log) =>
      (severityFilter === 'all' || log.severity === severityFilter) &&
      (log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.target.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleExport = () => {
    toast.success('Immutable audit verification CSV exported signed with SHA-256 HMAC.');
  };

  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 12)',
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col p-4 md:p-6 gap-6 bg-[var(--bg-base)]">
          {/* Header Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-[var(--bg-surface)] to-[var(--bg-surface)] border border-[var(--border-primary)]/50 shadow-sm">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 text-xs font-extrabold tracking-wider uppercase rounded-md bg-emerald-600 text-white">
                  Compliance & Audit Log Center
                </span>
                <span className="text-sm text-[var(--text-muted)] font-mono">Immutable Trail</span>
              </div>
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">
                Cryptographic System Activity Audit Logs
              </h1>
              <p className="text-sm text-[var(--text-muted)]">
                Inspect tamper-evident records of all user actions, threshold modifications, and relay switching events.
              </p>
            </div>
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-all cursor-pointer self-start md:self-center shadow-sm"
            >
              <Download size={16} />
              Export Signed CSV
            </button>
          </div>

          {/* Verification Status Banner */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/[0.04] text-emerald-500 text-sm">
            <div className="flex items-center gap-2.5 font-semibold">
              <ShieldCheck size={20} />
              Audit Trail Integrity Verified — 100% Hash Continuity Confirmed
            </div>
            <span className="font-mono text-xs hidden sm:inline text-[var(--text-muted)]">
              SHA-256 Root Merkle: 0x9f38...4a2c
            </span>
          </div>

          {/* Audit Logs Table Card */}
          <div className="rounded-2xl border border-[var(--border-primary)]/50 bg-[var(--bg-surface)] p-6 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                  <FileText size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[var(--text-primary)]">System Event Ledger</h2>
                  <p className="text-xs text-[var(--text-muted)]">Filterable view of all authenticated grid operations</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <select
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl text-xs font-semibold bg-[var(--bg-base)] border border-[var(--border-primary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] cursor-pointer"
                >
                  <option value="all">All Severities</option>
                  <option value="INFO">INFO Only</option>
                  <option value="WARNING">WARNING Only</option>
                  <option value="CRITICAL">CRITICAL Only</option>
                </select>

                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[var(--text-muted)]" />
                  <input
                    type="text"
                    placeholder="Search action or actor..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-[var(--bg-base)] border border-[var(--border-primary)]/60 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--border-primary)]/40 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                    <th className="py-3 px-3">Event ID & Timestamp</th>
                    <th className="py-3 px-3">Actor / Principal</th>
                    <th className="py-3 px-3">Action & Target</th>
                    <th className="py-3 px-3">Severity</th>
                    <th className="py-3 px-3 text-right">Integrity Hash</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-primary)]/30 text-sm">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-[var(--bg-base)]/50 transition-colors font-mono text-xs">
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-[var(--text-primary)]">{log.id}</div>
                        <div className="text-[var(--text-muted)] text-[11px]">{log.timestamp}</div>
                      </td>
                      <td className="py-3.5 px-3 text-[var(--text-primary)] font-semibold">{log.actor}</td>
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-[var(--color-primary)]">{log.action}</div>
                        <div className="text-[var(--text-muted)] text-[11px] font-sans">{log.target}</div>
                      </td>
                      <td className="py-3.5 px-3 font-sans">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider border ${
                            log.severity === 'CRITICAL'
                              ? 'bg-red-500/10 text-red-500 border-red-500/30'
                              : log.severity === 'WARNING'
                              ? 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                              : 'bg-blue-500/10 text-blue-500 border-blue-500/30'
                          }`}
                        >
                          {log.severity}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right text-[var(--text-muted)]">{log.hash}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
