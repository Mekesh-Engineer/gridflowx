'use client';

import React, { useState } from 'react';
import {
  Layers, Brain, ShieldCheck, AlertTriangle, TrendingUp,
  Activity, CheckCircle2, Clock, ArrowUpRight, Leaf,
  BarChart3, RefreshCw, XCircle, Eye, Zap,
} from 'lucide-react';
import Link from 'next/link';
import { usePermission } from '@/hooks/use-permission';

// ============================================================================
// Mock Data
// ============================================================================

const MOCK_SITES = [
  { id: 'SITE-01', name: 'North Campus',   status: 'ONLINE',   soc: 78, solar: 340, load: 55 },
  { id: 'SITE-02', name: 'Industrial A',   status: 'ONLINE',   soc: 62, solar: 280, load: 120 },
  { id: 'SITE-03', name: 'Residential B',  status: 'DEGRADED', soc: 41, solar: 95,  load: 38 },
  { id: 'SITE-04', name: 'Storage Node C', status: 'OFFLINE',  soc: 22, solar: 0,   load: 0 },
];

const MOCK_PENDING = [
  { id: 'AGT-001', agent: 'LoadShedderAgent',    action: 'Shed Tier 3 loads across SITE-03', risk: 'LOW',    ts: '3m ago' },
  { id: 'AGT-002', agent: 'BatteryOptimizerAgent', action: 'Discharge BESS at 4.5A overnight', risk: 'MEDIUM', ts: '8m ago' },
  { id: 'AGT-003', agent: 'FaultRecoveryAgent',  action: 'Isolate Node 7 from DC bus',       risk: 'HIGH',   ts: '12m ago' },
];

const FORECAST_ACCURACY = { mae: 24.3, mape: 8.7, trend: +1.2 };

const INCIDENTS = [
  { id: 'INC-088', site: 'SITE-03', type: 'Thermal Fault',    severity: 'critical', status: 'OPEN',      age: '2h ago' },
  { id: 'INC-087', site: 'SITE-04', type: 'Battery Offline',  severity: 'critical', status: 'IN REVIEW',  age: '6h ago' },
  { id: 'INC-086', site: 'SITE-01', type: 'MPPT Low Yield',   severity: 'warning',  status: 'MONITORING', age: '1d ago' },
];

// ============================================================================
// Fleet KPI Banner
// ============================================================================

function FleetKpiBanner() {
  const onlineSites = MOCK_SITES.filter(s => s.status === 'ONLINE').length;
  const avgSoc = Math.round(MOCK_SITES.reduce((a, s) => a + s.soc, 0) / MOCK_SITES.length);
  const totalSolar = MOCK_SITES.reduce((a, s) => a + s.solar, 0);
  const openIncidents = INCIDENTS.filter(i => i.status === 'OPEN').length;

  const cards = [
    { label: 'Sites Online',       value: `${onlineSites}/${MOCK_SITES.length}`, icon: <Layers className="w-4 h-4" />,         color: 'bg-emerald-500/10 text-emerald-400' },
    { label: 'Fleet Avg SoC',      value: `${avgSoc}%`,                          icon: <Activity className="w-4 h-4" />,        color: 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]' },
    { label: 'Total Solar Gen',    value: `${totalSolar} W`,                     icon: <Zap className="w-4 h-4" />,             color: 'bg-yellow-500/10 text-yellow-400' },
    { label: 'Open Incidents',     value: String(openIncidents),                  icon: <AlertTriangle className="w-4 h-4" />,   color: openIncidents > 0 ? 'bg-red-500/10 text-red-400' : 'bg-[var(--bg-base)] text-[var(--text-muted)]' },
  ];

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((c) => (
        <div key={c.label} className="flex items-center gap-3 p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${c.color}`}>
            {c.icon}
          </div>
          <div>
            <p className="text-xs text-[var(--text-muted)]">{c.label}</p>
            <p className="text-xl font-bold tabular-nums">{c.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// Site Fleet Table
// ============================================================================

const STATUS_CONFIG = {
  ONLINE:   'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  DEGRADED: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  OFFLINE:  'bg-red-500/15 text-red-400 border-red-500/30',
};

function SiteFleetTable() {
  return (
    <div className="flex flex-col gap-3 p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40">
      <p className="text-sm font-semibold flex items-center gap-2">
        <Layers className="w-4 h-4 text-[var(--color-primary)]" />Multi-Site Fleet Overview
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[var(--text-muted)] text-[10px] uppercase tracking-wider border-b border-[var(--border-primary)]/30">
              <th className="text-left py-2 pb-2 pr-4 font-medium">Site</th>
              <th className="text-left py-2 pr-4 font-medium">Status</th>
              <th className="text-right py-2 pr-4 font-medium">SoC</th>
              <th className="text-right py-2 pr-4 font-medium">Solar (W)</th>
              <th className="text-right py-2 font-medium">Load (W)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-primary)]/20">
            {MOCK_SITES.map((site) => (
              <tr key={site.id} className="hover:bg-[var(--bg-hover)] transition-colors">
                <td className="py-2.5 pr-4">
                  <p className="font-medium text-[var(--text-primary)]">{site.name}</p>
                  <p className="text-[10px] text-[var(--text-muted)] font-mono">{site.id}</p>
                </td>
                <td className="py-2.5 pr-4">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_CONFIG[site.status as keyof typeof STATUS_CONFIG]}`}>
                    {site.status}
                  </span>
                </td>
                <td className="py-2.5 pr-4 text-right tabular-nums font-medium">{site.soc}%</td>
                <td className="py-2.5 pr-4 text-right tabular-nums text-yellow-400">{site.solar}</td>
                <td className="py-2.5 text-right tabular-nums text-[var(--text-muted)]">{site.load}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================================================
// Approval Queue Card
// ============================================================================

const RISK_STYLES = {
  LOW:    'text-emerald-400 bg-emerald-500/10 border-emerald-500/25',
  MEDIUM: 'text-amber-400   bg-amber-500/10   border-amber-500/25',
  HIGH:   'text-red-400     bg-red-500/10     border-red-500/25',
};

function ApprovalQueueCard() {
  const [items, setItems] = useState(MOCK_PENDING);
  const { can } = usePermission();
  const canApprove = can('approve', 'agent-approvals');

  const handleApprove = (id: string) => setItems(p => p.filter(i => i.id !== id));
  const handleReject  = (id: string) => setItems(p => p.filter(i => i.id !== id));

  return (
    <div className="flex flex-col gap-3 p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[var(--color-primary)]" />Human Approval Queue
          {items.length > 0 && <span className="ml-1 min-w-[20px] h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1">{items.length}</span>}
        </p>
        <Link href="/dashboard/agentic-ai/queue" className="text-xs text-[var(--color-primary)] hover:underline flex items-center gap-1">
          Full Queue <Eye className="w-3 h-3" />
        </Link>
      </div>
      <div className="space-y-2">
        {items.length === 0 && (
          <div className="py-6 text-center text-xs text-[var(--text-muted)] flex flex-col items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            No pending approvals
          </div>
        )}
        {items.map((item) => (
          <div key={item.id} className="p-3 rounded-lg bg-[var(--bg-base)] border border-[var(--border-primary)]/30 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[10px] font-mono text-[var(--text-muted)]">{item.agent}</p>
                <p className="text-xs font-medium text-[var(--text-primary)] mt-0.5">{item.action}</p>
              </div>
              <span className={`shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${RISK_STYLES[item.risk as keyof typeof RISK_STYLES]}`}>
                {item.risk}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-[var(--text-muted)] flex items-center gap-1"><Clock className="w-3 h-3" />{item.ts}</span>
              {canApprove && (
                <div className="flex gap-2">
                  <button onClick={() => handleApprove(item.id)} className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 transition-colors">
                    <CheckCircle2 className="w-3 h-3 inline mr-1" />Approve
                  </button>
                  <button onClick={() => handleReject(item.id)} className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/25 hover:bg-red-500/20 transition-colors">
                    <XCircle className="w-3 h-3 inline mr-1" />Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// AI Forecast Accuracy Card
// ============================================================================

function ForecastAccuracyCard() {
  return (
    <div className="flex flex-col gap-3 p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40">
      <p className="text-sm font-semibold flex items-center gap-2">
        <Brain className="w-4 h-4 text-[var(--color-primary)]" />AI Forecast Accuracy
      </p>
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-lg bg-[var(--bg-base)] text-center">
          <p className="text-[10px] text-[var(--text-muted)] mb-1">MAE (W)</p>
          <p className="text-2xl font-bold">{FORECAST_ACCURACY.mae}</p>
          <p className="text-[10px] text-emerald-400 flex items-center justify-center gap-0.5 mt-1">
            <ArrowUpRight className="w-3 h-3" />+{FORECAST_ACCURACY.trend}% this week
          </p>
        </div>
        <div className="p-3 rounded-lg bg-[var(--bg-base)] text-center">
          <p className="text-[10px] text-[var(--text-muted)] mb-1">MAPE (%)</p>
          <p className="text-2xl font-bold">{FORECAST_ACCURACY.mape}%</p>
          <p className="text-[10px] text-[var(--text-muted)] mt-1">7-day rolling avg</p>
        </div>
      </div>
      <div className="mt-1">
        {/* Simple accuracy bar */}
        <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] mb-1">
          <span>Accuracy</span><span>{(100 - FORECAST_ACCURACY.mape).toFixed(1)}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-[var(--bg-base)] overflow-hidden">
          <div
            className="h-full rounded-full bg-[var(--color-primary)] transition-all duration-500"
            style={{ width: `${100 - FORECAST_ACCURACY.mape}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Incident Triage Summary
// ============================================================================

const INC_SEVERITY = {
  critical: 'text-red-400 bg-red-500/10',
  warning:  'text-amber-400 bg-amber-500/10',
};

function IncidentTriageSummary() {
  return (
    <div className="flex flex-col gap-3 p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />Incident Triage
        </p>
        <Link href="/dashboard/operations/incidents" className="text-xs text-[var(--color-primary)] hover:underline">
          Full View →
        </Link>
      </div>
      <div className="space-y-2">
        {INCIDENTS.map((inc) => (
          <div key={inc.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-[var(--bg-base)]">
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${INC_SEVERITY[inc.severity as keyof typeof INC_SEVERITY]}`}>
              {inc.severity.toUpperCase()}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{inc.type}</p>
              <p className="text-[10px] text-[var(--text-muted)] font-mono">{inc.id} · {inc.site}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[10px] text-[var(--text-muted)]">{inc.status}</p>
              <p className="text-[10px] text-[var(--text-muted)] font-mono">{inc.age}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Carbon & Energy Trends
// ============================================================================

function CarbonEnergyCard() {
  const bars = [68, 74, 72, 80, 76, 82, 79];
  const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const max = Math.max(...bars);

  return (
    <div className="flex flex-col gap-3 p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40">
      <p className="text-sm font-semibold flex items-center gap-2">
        <Leaf className="w-4 h-4 text-emerald-400" />Carbon Offset & Yield (kWh)
      </p>
      <div className="flex items-end justify-between gap-1 h-20 pt-2">
        {bars.map((v, i) => (
          <div key={i} className="flex flex-col items-center gap-1 flex-1">
            <div
              className="w-full rounded-t-sm bg-emerald-500/30 border-t border-emerald-500/50 hover:bg-emerald-500/50 transition-colors"
              style={{ height: `${(v / max) * 100}%` }}
              title={`${v} kWh`}
            />
            <span className="text-[9px] text-[var(--text-muted)]">{labels[i]}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-[var(--text-muted)]">This week</span>
        <span className="text-emerald-400 font-bold flex items-center gap-1">
          <TrendingUp className="w-3 h-3" />531 kWh generated
        </span>
      </div>
    </div>
  );
}

// ============================================================================
// Supervisor Fleet Console
// ============================================================================

export default function SupervisorDashboardPage() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-[1800px] mx-auto w-full">

      {/* Connection Status Bar */}
      <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 text-xs">
        <span className="flex items-center gap-1.5 font-semibold text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />All Systems Nominal
        </span>
        <span className="text-[var(--text-muted)]">·</span>
        <span className="text-[var(--text-muted)]">Fleet: <span className="text-[var(--text-primary)] font-semibold">4 Sites</span></span>
        <span className="text-[var(--text-muted)]">·</span>
        <span className="text-[var(--text-muted)]">Pending Approvals: <span className="text-red-400 font-bold">3</span></span>
        <span className="ml-auto text-[var(--text-muted)] font-mono">GridFlowX Supervisor Fleet Console</span>
      </div>

      {/* Fleet KPI Banner */}
      <FleetKpiBanner />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Site Fleet Table — 2 cols */}
        <div className="lg:col-span-2">
          <SiteFleetTable />
        </div>
        {/* Approval Queue */}
        <ApprovalQueueCard />
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ForecastAccuracyCard />
        <IncidentTriageSummary />
        <CarbonEnergyCard />
      </div>
    </div>
  );
}
