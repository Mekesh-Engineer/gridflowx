'use client';

import React, { useState } from 'react';
import {
  Users, Shield, Settings, AlertTriangle, CreditCard,
  BarChart3, Activity, Key, CheckCircle2, TrendingUp,
  ArrowUpRight, ArrowDownRight, RefreshCw, Eye, Zap,
  UserCheck, UserX, Server, Cpu, Lock,
} from 'lucide-react';
import Link from 'next/link';
import { fetchAllUsers, updateUserRole, type UserProfileDocument } from '@/services/user.service';
import { UserRole } from '@/types/roles';
import { toast } from 'sonner';

// ============================================================================
// Mock Data
// ============================================================================

const MOCK_STATS = {
  totalUsers:     24,
  activeSeats:    18,
  totalSeats:     30,
  apiCallsToday:  12847,
  apiLimit:       50000,
  securityEvents: 3,
  uptimePercent:  99.97,
};

const MOCK_SECURITY_EVENTS = [
  { id: 'SE-001', type: 'Failed Login',    actor: 'unknown@external.com', ip: '45.33.12.x',   ts: '5m ago',  severity: 'warning' },
  { id: 'SE-002', type: 'Role Changed',    actor: 'admin@gridflowx.com',  ip: '192.168.1.10', ts: '2h ago',  severity: 'info' },
  { id: 'SE-003', type: 'API Key Rotated', actor: 'system',               ip: '10.0.0.1',     ts: '6h ago',  severity: 'info' },
];

const USER_ROLE_DIST = [
  { role: 'Admin',      count: 2,  color: 'bg-[var(--color-primary)]' },
  { role: 'Supervisor', count: 4,  color: 'bg-indigo-500' },
  { role: 'Operator',   count: 14, color: 'bg-emerald-500' },
  { role: 'Auditor',    count: 4,  color: 'bg-amber-500' },
];

const MOCK_API_DAILY = [28, 35, 42, 55, 48, 62, 51];
const API_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// ============================================================================
// Executive KPI Cards
// ============================================================================

function ExecutiveKpiBanner() {
  const seatPct = Math.round((MOCK_STATS.activeSeats / MOCK_STATS.totalSeats) * 100);
  const apiPct  = Math.round((MOCK_STATS.apiCallsToday / MOCK_STATS.apiLimit) * 100);

  const cards = [
    {
      label: 'Active Users',
      value: `${MOCK_STATS.activeSeats}/${MOCK_STATS.totalSeats}`,
      sub: `${seatPct}% seat utilization`,
      icon: <Users className="w-4 h-4" />,
      color: 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]',
      pct: seatPct,
      barColor: 'bg-[var(--color-primary)]',
    },
    {
      label: 'API Calls Today',
      value: MOCK_STATS.apiCallsToday.toLocaleString(),
      sub: `${apiPct}% of limit`,
      icon: <Activity className="w-4 h-4" />,
      color: 'bg-indigo-500/10 text-indigo-400',
      pct: apiPct,
      barColor: 'bg-indigo-500',
    },
    {
      label: 'Security Events',
      value: String(MOCK_STATS.securityEvents),
      sub: 'Last 24 hours',
      icon: <Shield className="w-4 h-4" />,
      color: MOCK_STATS.securityEvents > 0 ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400',
      pct: null,
      barColor: '',
    },
    {
      label: 'System Uptime',
      value: `${MOCK_STATS.uptimePercent}%`,
      sub: 'Last 30 days',
      icon: <Server className="w-4 h-4" />,
      color: 'bg-emerald-500/10 text-emerald-400',
      pct: MOCK_STATS.uptimePercent,
      barColor: 'bg-emerald-500',
    },
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
          <div className="space-y-1">
            {c.pct !== null && (
              <div className="h-1 rounded-full bg-[var(--bg-base)] overflow-hidden">
                <div className={`h-full rounded-full ${c.barColor}`} style={{ width: `${c.pct}%` }} />
              </div>
            )}
            <p className="text-[10px] text-[var(--text-muted)]">{c.sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// User Role Distribution Donut
// ============================================================================

function UserRoleDistribution() {
  const total = USER_ROLE_DIST.reduce((a, d) => a + d.count, 0);

  return (
    <div className="flex flex-col gap-4 p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 h-full">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold flex items-center gap-2">
          <Users className="w-4 h-4 text-[var(--color-primary)]" />User Role Distribution
        </p>
        <Link href="/dashboard/users" className="text-xs text-[var(--color-primary)] hover:underline flex items-center gap-1">
          Manage <Eye className="w-3 h-3" />
        </Link>
      </div>

      {/* Segmented bar */}
      <div className="h-4 rounded-full overflow-hidden flex gap-0.5">
        {USER_ROLE_DIST.map((d) => (
          <div
            key={d.role}
            className={`h-full ${d.color} transition-all duration-500`}
            style={{ width: `${(d.count / total) * 100}%` }}
            title={`${d.role}: ${d.count}`}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="space-y-2">
        {USER_ROLE_DIST.map((d) => (
          <div key={d.role} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${d.color}`} />
              <span className="text-[var(--text-secondary)]">{d.role}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold tabular-nums">{d.count}</span>
              <span className="text-[var(--text-muted)]">({Math.round((d.count / total) * 100)}%)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// API Usage Chart
// ============================================================================

function ApiUsageChart() {
  const max = Math.max(...MOCK_API_DAILY);
  return (
    <div className="flex flex-col gap-4 p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 h-full">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-[var(--color-primary)]" />API Usage Rate (k calls)
        </p>
        <Link href="/dashboard/admin/api-keys" className="text-xs text-[var(--color-primary)] hover:underline">
          Keys →
        </Link>
      </div>
      <div className="flex items-end justify-between gap-1.5 h-24 pt-2">
        {MOCK_API_DAILY.map((v, i) => (
          <div key={i} className="flex flex-col items-center gap-1 flex-1">
            <div
              className="w-full rounded-t bg-[var(--color-primary)]/30 border-t border-[var(--color-primary)]/50 hover:bg-[var(--color-primary)]/50 transition-colors"
              style={{ height: `${(v / max) * 100}%` }}
              title={`${v}k calls`}
            />
            <span className="text-[9px] text-[var(--text-muted)]">{API_DAYS[i]}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-[var(--text-muted)]">This week total</span>
        <span className="text-[var(--color-primary)] font-bold flex items-center gap-1">
          <TrendingUp className="w-3 h-3" />{MOCK_API_DAILY.reduce((a, v) => a + v, 0)}k calls
        </span>
      </div>
    </div>
  );
}

// ============================================================================
// Security Events Panel
// ============================================================================

const EVENT_SEVERITY = {
  warning: 'text-amber-400 bg-amber-500/10',
  info:    'text-blue-400  bg-blue-500/10',
  critical:'text-red-400   bg-red-500/10',
};

function SecurityEventsPanel() {
  return (
    <div className="flex flex-col gap-3 p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 h-full">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold flex items-center gap-2">
          <Lock className="w-4 h-4 text-amber-400" />Security Events
          <span className="text-[10px] font-mono text-[var(--text-muted)]">24h</span>
        </p>
        <Link href="/dashboard/audit/logs" className="text-xs text-[var(--color-primary)] hover:underline">
          Full Log →
        </Link>
      </div>
      <div className="space-y-2">
        {MOCK_SECURITY_EVENTS.map((evt) => (
          <div key={evt.id} className="p-2.5 rounded-lg bg-[var(--bg-base)] space-y-1">
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${EVENT_SEVERITY[evt.severity as keyof typeof EVENT_SEVERITY]}`}>
                {evt.type}
              </span>
              <span className="text-[10px] text-[var(--text-muted)] font-mono">{evt.ts}</span>
            </div>
            <p className="text-xs text-[var(--text-muted)] truncate">{evt.actor}</p>
            <p className="text-[10px] font-mono text-[var(--text-muted)]">IP: {evt.ip}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Billing Status Card
// ============================================================================

function BillingStatusCard() {
  const seatPct = Math.round((MOCK_STATS.activeSeats / MOCK_STATS.totalSeats) * 100);
  return (
    <div className="flex flex-col gap-4 p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 h-full">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-[var(--color-primary)]" />Billing & Subscription
        </p>
        <Link href="/dashboard/admin/billing" className="text-xs text-[var(--color-primary)] hover:underline">
          Manage →
        </Link>
      </div>
      <div className="p-3 rounded-lg bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/20">
        <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-1">Current Plan</p>
        <p className="text-base font-bold">Enterprise Pro</p>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">Billed annually · Next renewal Aug 2027</p>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[var(--text-muted)]">Seats used</span>
          <span className="font-bold">{MOCK_STATS.activeSeats} / {MOCK_STATS.totalSeats}</span>
        </div>
        <div className="h-1.5 rounded-full bg-[var(--bg-base)] overflow-hidden">
          <div className="h-full rounded-full bg-[var(--color-primary)]" style={{ width: `${seatPct}%` }} />
        </div>
        <p className="text-[10px] text-[var(--text-muted)]">{30 - MOCK_STATS.activeSeats} seats available</p>
      </div>
      <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
        <p className="text-xs text-emerald-400 font-medium">All invoices paid — no action needed</p>
      </div>
    </div>
  );
}

// ============================================================================
// Admin Executive Portal
// ============================================================================

export default function AdminDashboardPage() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-[1800px] mx-auto w-full">

      {/* Status Bar */}
      <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 text-xs">
        <span className="flex items-center gap-1.5 font-semibold text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />Platform Healthy
        </span>
        <span className="text-[var(--text-muted)]">·</span>
        <span className="text-[var(--text-muted)]">Uptime: <span className="text-[var(--text-primary)] font-semibold">{MOCK_STATS.uptimePercent}%</span></span>
        <span className="text-[var(--text-muted)]">·</span>
        <span className="text-[var(--text-muted)]">Users: <span className="text-[var(--text-primary)] font-semibold">{MOCK_STATS.totalUsers}</span></span>
        <span className="ml-auto text-[var(--text-muted)] font-mono">GridFlowX Admin Executive Portal</span>
      </div>

      {/* KPI Banner */}
      <ExecutiveKpiBanner />

      {/* Main 3-column grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <UserRoleDistribution />
        <ApiUsageChart />
        <SecurityEventsPanel />
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <BillingStatusCard />
        <div className="flex flex-col gap-3 p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40">
          <p className="text-sm font-semibold flex items-center gap-2">
            <Settings className="w-4 h-4 text-[var(--color-primary)]" />Quick Actions
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Manage Users',    href: '/dashboard/users',           icon: <Users className="w-4 h-4" /> },
              { label: 'RBAC Matrix',     href: '/dashboard/roles',           icon: <Shield className="w-4 h-4" /> },
              { label: 'API Keys',        href: '/dashboard/admin/api-keys',  icon: <Key className="w-4 h-4" /> },
              { label: 'Integrations',    href: '/dashboard/admin/integrations', icon: <Cpu className="w-4 h-4" /> },
            ].map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="flex items-center gap-2.5 p-3 rounded-lg bg-[var(--bg-base)] border border-[var(--border-primary)]/30 hover:border-[var(--color-primary)]/40 hover:bg-[var(--bg-hover)] transition-all text-sm font-medium"
              >
                <span className="text-[var(--color-primary)]">{action.icon}</span>
                {action.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
