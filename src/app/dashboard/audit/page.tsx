'use client';

import React, { useState } from 'react';
import {
  FileText, CheckCircle2, Download, Search, ShieldCheck,
  Lock, Database, Calendar, Shield, AlertTriangle, Eye,
  ArrowUpRight, Clock, Filter, FileSpreadsheet, FileCheck,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

// ============================================================================
// Mock Audit Log Data
// ============================================================================

const MOCK_AUDIT_LOGS = [
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
    timestamp: '2026-07-18 01:11:09 UTC',
    actor: 'system.ai@gridflowx.com',
    action: 'AUTONOMOUS_LOAD_SHED',
    target: 'Tier 3 Flexible Loads / Site 03',
    severity: 'CRITICAL',
    hash: 'fa019...44e2',
  },
];

const COMPLIANCE_SCORES = [
  { standard: 'SOC2 Type II', score: 98, status: 'Compliant' },
  { standard: 'GDPR Compliance', score: 100, status: 'Compliant' },
  { standard: 'ISO 50001 Energy Mgmt', score: 94, status: 'Compliant' },
  { standard: 'NERC CIP Cyber Standard', score: 96, status: 'Compliant' },
];

const OVERRIDE_VARIANCES = [
  { id: 'VAR-101', operator: 'Operator Jane', node: 'Relay 04', aiRec: 'OFF', actual: 'ON', rationale: 'Local maintenance in progress', ts: '45m ago' },
  { id: 'VAR-102', operator: 'Supervisor Davis', node: 'BESS Discharge', aiRec: '3.0A', actual: '5.0A', rationale: 'Emergency grid peak request', ts: '3h ago' },
];

// ============================================================================
// Auditor KPI Header
// ============================================================================

function AuditorKpiBanner() {
  const cards = [
    { label: 'Audit Trail Entries', value: '48,291', sub: 'Tamper-evident logs', icon: <Database className="w-4 h-4" />, color: 'bg-emerald-500/10 text-emerald-400' },
    { label: 'Overall Compliance', value: '97.0%', sub: 'Across 4 standards', icon: <ShieldCheck className="w-4 h-4" />, color: 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]' },
    { label: 'Manual Overrides', value: '14', sub: 'Last 30 days', icon: <FileText className="w-4 h-4" />, color: 'bg-amber-500/10 text-amber-400' },
    { label: 'Integrity Status', value: 'VERIFIED', sub: 'SHA-256 Merkle Root OK', icon: <Lock className="w-4 h-4" />, color: 'bg-indigo-500/10 text-indigo-400' },
  ];

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((c) => (
        <div key={c.label} className="flex flex-col gap-3 p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40">
          <div className="flex items-center justify-between">
            <p className="text-xs text-[var(--text-muted)] font-medium">{c.label}</p>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${c.color}`}>
              {c.icon}
            </div>
          </div>
          <p className="text-2xl font-bold tabular-nums">{c.value}</p>
          <p className="text-[10px] text-[var(--text-muted)]">{c.sub}</p>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// Compliance Scorecard
// ============================================================================

function ComplianceScorecard() {
  return (
    <div className="flex flex-col gap-4 p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 h-full">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[var(--color-primary)]" />Compliance Scorecard
        </p>
        <Link href="/dashboard/audit/compliance" className="text-xs text-[var(--color-primary)] hover:underline flex items-center gap-1">
          Details <Eye className="w-3 h-3" />
        </Link>
      </div>

      <div className="space-y-3">
        {COMPLIANCE_SCORES.map((cs) => (
          <div key={cs.standard} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-[var(--text-primary)]">{cs.standard}</span>
              <span className="text-emerald-400 font-bold">{cs.score}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-[var(--bg-base)] overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${cs.score}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto pt-2 border-t border-[var(--border-primary)]/30 flex items-center justify-between text-xs text-[var(--text-muted)]">
        <span>Last Audit: June 2026</span>
        <span className="text-emerald-400 font-semibold flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" /> Passed
        </span>
      </div>
    </div>
  );
}

// ============================================================================
// Override Variance Feed
// ============================================================================

function OverrideVarianceFeed() {
  return (
    <div className="flex flex-col gap-4 p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 h-full">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />Override Variance Feed
        </p>
        <Link href="/dashboard/operations/overrides" className="text-xs text-[var(--color-primary)] hover:underline">
          All Overrides →
        </Link>
      </div>

      <div className="space-y-2.5">
        {OVERRIDE_VARIANCES.map((v) => (
          <div key={v.id} className="p-3 rounded-lg bg-[var(--bg-base)] border border-[var(--border-primary)]/30 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[var(--text-primary)]">{v.node}</span>
              <span className="text-[10px] text-[var(--text-muted)] font-mono">{v.ts}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[var(--text-muted)]">AI Rec: <span className="font-mono text-blue-400">{v.aiRec}</span></span>
              <span className="text-[var(--text-muted)]">→</span>
              <span className="text-[var(--text-muted)]">Operator: <span className="font-mono text-amber-400 font-bold">{v.actual}</span></span>
            </div>
            <p className="text-[11px] text-[var(--text-muted)] italic">"{v.rationale}"</p>
            <p className="text-[10px] text-[var(--text-muted)] font-mono">By {v.operator}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Audit Log Table
// ============================================================================

const SEVERITY_CONFIG = {
  INFO:     'bg-blue-500/10 text-blue-400 border-blue-500/25',
  WARNING:  'bg-amber-500/10 text-amber-400 border-amber-500/25',
  CRITICAL: 'bg-red-500/10 text-red-400 border-red-500/25',
};

function AuditLogTable() {
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');

  const filteredLogs = MOCK_AUDIT_LOGS.filter((log) => {
    const matchesSearch =
      log.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity = severityFilter === 'all' || log.severity.toLowerCase() === severityFilter.toLowerCase();
    return matchesSearch && matchesSeverity;
  });

  const handleExport = (type: string) => {
    toast.success(`Exporting audit log as ${type.toUpperCase()}...`);
  };

  return (
    <div className="flex flex-col gap-4 p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-sm font-semibold flex items-center gap-2">
          <FileText className="w-4 h-4 text-[var(--color-primary)]" />Cryptographic Audit Ledger
        </p>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport('csv')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg-base)] border border-[var(--border-primary)]/40 text-xs font-medium hover:bg-[var(--bg-hover)] transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
          <button
            onClick={() => handleExport('pdf')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--color-primary)] text-white text-xs font-medium hover:opacity-90 transition-opacity"
          >
            <FileCheck className="w-3.5 h-3.5" /> PDF Report
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search by actor, action, target or Log ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-[var(--bg-base)] border border-[var(--border-primary)]/40 text-xs focus:outline-none focus:border-[var(--color-primary)]"
          />
        </div>

        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="px-3 py-2 rounded-lg bg-[var(--bg-base)] border border-[var(--border-primary)]/40 text-xs focus:outline-none focus:border-[var(--color-primary)]"
        >
          <option value="all">All Severities</option>
          <option value="info font-semibold">INFO</option>
          <option value="warning font-semibold">WARNING</option>
          <option value="critical font-semibold">CRITICAL</option>
        </select>
      </div>

      {/* Log Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[var(--text-muted)] text-[10px] uppercase tracking-wider border-b border-[var(--border-primary)]/30">
              <th className="text-left py-2 pr-4 font-medium">Log ID</th>
              <th className="text-left py-2 pr-4 font-medium">Timestamp</th>
              <th className="text-left py-2 pr-4 font-medium">Actor</th>
              <th className="text-left py-2 pr-4 font-medium">Action</th>
              <th className="text-left py-2 pr-4 font-medium">Target</th>
              <th className="text-center py-2 pr-4 font-medium">Severity</th>
              <th className="text-right py-2 font-medium">Merkle Hash</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-primary)]/20">
            {filteredLogs.map((log) => (
              <tr key={log.id} className="hover:bg-[var(--bg-hover)] transition-colors">
                <td className="py-2.5 pr-4 font-mono text-xs font-semibold text-[var(--color-primary)]">{log.id}</td>
                <td className="py-2.5 pr-4 text-xs text-[var(--text-muted)] font-mono">{log.timestamp}</td>
                <td className="py-2.5 pr-4 text-xs font-medium truncate max-w-[160px]">{log.actor}</td>
                <td className="py-2.5 pr-4 text-xs font-mono text-[var(--text-primary)]">{log.action}</td>
                <td className="py-2.5 pr-4 text-xs text-[var(--text-muted)] truncate max-w-[200px]">{log.target}</td>
                <td className="py-2.5 pr-4 text-center">
                  <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${SEVERITY_CONFIG[log.severity as keyof typeof SEVERITY_CONFIG]}`}>
                    {log.severity}
                  </span>
                </td>
                <td className="py-2.5 text-right font-mono text-[10px] text-[var(--text-muted)]">{log.hash}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================================================
// Auditor Compliance Console
// ============================================================================

export default function AuditDashboardPage() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-[1800px] mx-auto w-full">

      {/* Header Bar */}
      <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 text-xs">
        <span className="flex items-center gap-1.5 font-semibold text-emerald-400">
          <Lock className="w-3.5 h-3.5" /> Tamper-Evident Ledger Active
        </span>
        <span className="text-[var(--text-muted)]">·</span>
        <span className="text-[var(--text-muted)]">Audit Scope: <span className="text-[var(--text-primary)] font-semibold">Full System</span></span>
        <span className="text-[var(--text-muted)]">·</span>
        <span className="text-[var(--text-muted)]">Chain Integrity: <span className="text-emerald-400 font-bold">100% VERIFIED</span></span>
        <span className="ml-auto text-[var(--text-muted)] font-mono">GridFlowX Auditor Compliance Console</span>
      </div>

      {/* KPI Banner */}
      <AuditorKpiBanner />

      {/* Middle row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ComplianceScorecard />
        <OverrideVarianceFeed />
      </div>

      {/* Audit Log Table */}
      <AuditLogTable />
    </div>
  );
}
