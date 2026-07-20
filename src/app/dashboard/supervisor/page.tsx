'use client';

import React, { useState } from 'react';
import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Cpu,
  Layers,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';

interface AlertItem {
  id: string;
  sector: string;
  title: string;
  description: string;
  time: string;
  severity: 'critical' | 'warning' | 'info';
  acknowledged: boolean;
}

export default function SupervisorDashboardPage() {
  const [alerts, setAlerts] = useState<AlertItem[]>([
    {
      id: 'ALT-109',
      sector: 'Sector 4 (North Substation)',
      title: 'Transient Voltage Harmonic Spike',
      description: 'Telemetry reported 12.4% harmonic distortion above baseline during peak solar ramp.',
      time: '4 minutes ago',
      severity: 'critical',
      acknowledged: false,
    },
    {
      id: 'ALT-108',
      sector: 'Sector 2 (Battery Storage Bank B)',
      title: 'Thermal Drift Detected',
      description: 'Module cell temperature reaches 64.2°C, approaching warning threshold of 65°C.',
      time: '22 minutes ago',
      severity: 'warning',
      acknowledged: false,
    },
    {
      id: 'ALT-107',
      sector: 'Sector 1 (Main Inverter Array)',
      title: 'Frequency Synchronization Complete',
      description: 'Grid-tie phase angle locked to 60.01Hz with zero droop error.',
      time: '1 hour ago',
      severity: 'info',
      acknowledged: true,
    },
  ]);

  const handleAcknowledge = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, acknowledged: true } : a))
    );
    toast.success(`Alert ${id} acknowledged and logged in supervisor queue.`);
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
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-amber-500/15 via-[var(--bg-surface)] to-[var(--bg-surface)] border border-[var(--border-primary)]/50 shadow-sm">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 text-xs font-extrabold tracking-wider uppercase rounded-md bg-amber-500 text-white">
                  Supervisor Fleet Oversight
                </span>
                <span className="text-sm text-[var(--text-muted)] font-mono">Realtime Telemetry</span>
              </div>
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">
                Active Fleet & Alert Management Center
              </h1>
              <p className="text-sm text-[var(--text-muted)]">
                Monitor multi-sector microgrid telemetry, acknowledge anomalies, and oversee operator control activities.
              </p>
            </div>
          </div>

          {/* Fleet Status Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { label: 'Fleet Output Power', value: '42.8 MW', sub: '+3.2% vs yesterday', icon: Zap, color: 'text-[var(--color-primary)]' },
              { label: 'Active Relays Online', value: '64 / 64', sub: '100% nominal availability', icon: Layers, color: 'text-emerald-500' },
              { label: 'Pending Alert Queue', value: `${alerts.filter((a) => !a.acknowledged).length} Alerts`, sub: 'Requires supervisor sign-off', icon: AlertTriangle, color: 'text-amber-500' },
              { label: 'Grid Frequency Stability', value: '60.01 Hz', sub: 'Phase locked nominal', icon: Activity, color: 'text-[var(--color-primary)]' },
            ].map(({ label, value, sub, icon: Icon, color }, i) => (
              <div key={i} className="rounded-2xl border border-[var(--border-primary)]/50 bg-[var(--bg-surface)] p-5 space-y-2 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">{label}</span>
                  <Icon className={`size-5 ${color}`} />
                </div>
                <div className="text-2xl font-extrabold text-[var(--text-primary)] font-mono">{value}</div>
                <div className="text-xs text-[var(--text-muted)]">{sub}</div>
              </div>
            ))}
          </div>

          {/* Active Alert Queue */}
          <div className="rounded-2xl border border-[var(--border-primary)]/50 bg-[var(--bg-surface)] p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[var(--text-primary)]">Supervisor Alert Queue</h2>
                  <p className="text-xs text-[var(--text-muted)]">Review and clear telemetry anomalies across all sectors</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    alert.acknowledged
                      ? 'bg-[var(--bg-base)]/40 border-[var(--border-primary)]/30 opacity-70'
                      : alert.severity === 'critical'
                      ? 'bg-red-500/[0.04] border-red-500/30'
                      : 'bg-amber-500/[0.04] border-amber-500/30'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[var(--text-muted)]">{alert.id}</span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-[var(--bg-base)] text-[var(--text-primary)] border border-[var(--border-primary)]">
                        {alert.sector}
                      </span>
                      {alert.acknowledged && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-500">
                          <CheckCircle2 size={12} /> Acknowledged
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-base text-[var(--text-primary)]">{alert.title}</h3>
                    <p className="text-xs text-[var(--text-muted)] max-w-2xl leading-relaxed">{alert.description}</p>
                    <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] pt-1">
                      <Clock size={12} /> Logged {alert.time}
                    </div>
                  </div>

                  {!alert.acknowledged && (
                    <button
                      onClick={() => handleAcknowledge(alert.id)}
                      className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[var(--text-primary)] text-[var(--bg-base)] hover:opacity-90 transition-opacity cursor-pointer shrink-0 self-start md:self-center uppercase tracking-wider"
                    >
                      Acknowledge Alert
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
