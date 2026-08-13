'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Zap, Battery, Sun, Activity, ToggleLeft, ToggleRight,
  AlertTriangle, Brain, ArrowUpRight, ArrowDownRight,
  Thermometer, Radio, RefreshCw, CheckCircle2, Clock,
  ShieldAlert, Loader2,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { PermissionGuard } from '@/components/providers/PermissionGuard';

// ============================================================================
// Mock data — replace with WebSocket/API hooks
// ============================================================================

const MOCK_TELEMETRY = {
  solarGen:    { value: 342.5, unit: 'W',   trend: +5.2,  status: 'normal' },
  loadUse:     { value: 48.2,  unit: 'W',   trend: -1.8,  status: 'normal' },
  battSoC:     { value: 72.3,  unit: '%',   trend: +2.3,  status: 'normal' },
  busVoltage:  { value: 12.15, unit: 'V',   trend: 0,     status: 'normal' },
};

const MOCK_ALERTS = [
  { id: 'A1', severity: 'warning', message: 'SoC below 40% threshold',   time: '2m ago'  },
  { id: 'A2', severity: 'info',    message: 'AI model retrained (v2.4)',  time: '15m ago' },
  { id: 'A3', severity: 'critical',message: 'Thermal warning — Cell 3',  time: '1h ago'  },
];

const MOCK_AI = {
  decision:    'Discharging battery at 3.2A to balance load',
  confidence:  82,
  latency:     22.8,
  model:       'GridBrain-v2.4',
};

// ============================================================================
// KPI Card
// ============================================================================

interface KpiCardProps {
  label:  string;
  value:  number;
  unit:   string;
  trend:  number;
  icon:   React.ReactNode;
  color:  string;
}

function KpiCard({ label, value, unit, trend, icon, color }: KpiCardProps) {
  const isUp = trend > 0;
  const isNeutral = trend === 0;
  return (
    <div className="flex flex-col gap-3 p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 hover:border-[var(--border-primary)] transition-colors">
      <div className="flex items-center justify-between">
        <p className="text-xs text-[var(--text-muted)] font-medium truncate">{label}</p>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
          {icon}
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold tabular-nums">
          {value.toFixed(1)}<span className="text-sm text-[var(--text-muted)] ml-1">{unit}</span>
        </p>
        {!isNeutral && (
          <p className={`text-xs mt-1 flex items-center gap-0.5 font-medium ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
            {isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {Math.abs(trend)}% from last interval
          </p>
        )}
        {isNeutral && <p className="text-xs text-[var(--text-muted)] mt-1 flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-400" />Normal</p>}
      </div>
    </div>
  );
}

// ============================================================================
// Relay Control Panel
// ============================================================================

interface RelayState {
  tier1: boolean; tier2: boolean; tier3: boolean;
  mppt: boolean; gridFallback: boolean;
}

function RelayControlPanel() {
  const [relays, setRelays] = useState<RelayState>({
    tier1: true, tier2: true, tier3: false, mppt: true, gridFallback: false,
  });

  const toggle = (key: keyof RelayState) => {
    setRelays(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const relayItems = [
    { key: 'tier1',       label: 'Tier 1 — Critical',  description: 'Medical / Safety' },
    { key: 'tier2',       label: 'Tier 2 — Important', description: 'Comms / Data' },
    { key: 'tier3',       label: 'Tier 3 — Flexible',  description: 'AC / Appliances' },
    { key: 'mppt',        label: 'MPPT Enable',         description: 'Solar charger' },
    { key: 'gridFallback',label: 'Grid Fallback',       description: 'Utility import' },
  ] as const;

  return (
    <div className="flex flex-col gap-3 p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 h-full">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold flex items-center gap-2">
          <ToggleLeft className="w-4 h-4 text-[var(--color-primary)]" />Relay Control Panel
        </p>
        <span className="text-[10px] font-mono text-[var(--text-muted)] bg-[var(--bg-base)] px-2 py-0.5 rounded-full">LIVE</span>
      </div>

      <div className="space-y-2">
        {relayItems.map(({ key, label, description }) => {
          const on = relays[key];
          return (
            <div key={key} className="flex items-center justify-between py-1.5">
              <div>
                <p className="text-xs font-medium">{label}</p>
                <p className="text-[10px] text-[var(--text-muted)]">{description}</p>
              </div>
              <PermissionGuard resource="relays" action="override" fallback={
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${on ? 'text-emerald-400 bg-emerald-400/10' : 'text-[var(--text-muted)] bg-[var(--bg-base)]'}`}>
                  {on ? 'ON' : 'OFF'}
                </span>
              }>
                <button
                  onClick={() => toggle(key)}
                  className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full border transition-all ${on ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25' : 'bg-[var(--bg-base)] text-[var(--text-muted)] border-[var(--border-primary)]/40 hover:border-[var(--border-primary)]'}`}
                >
                  {on ? <ToggleRight className="w-3 h-3" /> : <ToggleLeft className="w-3 h-3" />}
                  {on ? 'ON' : 'OFF'}
                </button>
              </PermissionGuard>
            </div>
          );
        })}
      </div>

      <PermissionGuard resource="relays" action="override">
        <button className="mt-2 w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold hover:bg-red-500/20 transition-colors">
          <ShieldAlert className="w-4 h-4" />⚠ EMERGENCY STOP ALL
        </button>
      </PermissionGuard>
    </div>
  );
}

// ============================================================================
// AI Decision Panel
// ============================================================================

function AiDecisionPanel() {
  const [refreshed, setRefreshed] = useState(false);
  return (
    <div className="flex flex-col gap-3 p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 h-full">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold flex items-center gap-2">
          <Brain className="w-4 h-4 text-[var(--color-primary)]" />AI Decision Engine
        </p>
        <button onClick={() => setRefreshed(r => !r)} className="text-[var(--text-muted)] hover:text-[var(--color-primary)] transition-colors">
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="flex-1 space-y-3">
        <div className="p-3 rounded-lg bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/20">
          <p className="text-xs text-[var(--color-primary)] font-semibold mb-1">Current Decision</p>
          <p className="text-sm text-[var(--text-primary)]">"{MOCK_AI.decision}"</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2.5 rounded-lg bg-[var(--bg-base)] text-center">
            <p className="text-[10px] text-[var(--text-muted)] mb-1">Confidence</p>
            <p className="text-lg font-bold text-emerald-400">{MOCK_AI.confidence}%</p>
          </div>
          <div className="p-2.5 rounded-lg bg-[var(--bg-base)] text-center">
            <p className="text-[10px] text-[var(--text-muted)] mb-1">Latency</p>
            <p className="text-lg font-bold text-[var(--text-primary)]">{MOCK_AI.latency}ms</p>
          </div>
        </div>
        <p className="text-[10px] text-[var(--text-muted)] font-mono text-center">Model: {MOCK_AI.model}</p>
      </div>
    </div>
  );
}

// ============================================================================
// Alerts Feed
// ============================================================================

const SEVERITY_CONFIG = {
  critical: { color: 'text-red-400',    bg: 'bg-red-500/10',    border: 'border-l-red-500' },
  warning:  { color: 'text-amber-400',  bg: 'bg-amber-500/10',  border: 'border-l-amber-500' },
  info:     { color: 'text-blue-400',   bg: 'bg-blue-500/10',   border: 'border-l-blue-500' },
};

function AlertsFeed() {
  return (
    <div className="flex flex-col gap-3 p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 h-full">
      <p className="text-sm font-semibold flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-400" />Live Alerts
        <span className="ml-auto text-[10px] font-mono text-[var(--text-muted)] bg-[var(--bg-base)] px-2 py-0.5 rounded-full">WS</span>
      </p>
      <div className="space-y-2">
        {MOCK_ALERTS.map((alert) => {
          const cfg = SEVERITY_CONFIG[alert.severity as keyof typeof SEVERITY_CONFIG];
          return (
            <div key={alert.id} className={`flex items-start gap-3 p-2.5 rounded-lg border-l-2 ${cfg.bg} ${cfg.border}`}>
              <AlertTriangle className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${cfg.color}`} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-[var(--text-primary)] truncate">{alert.message}</p>
                <p className="text-[10px] text-[var(--text-muted)] mt-0.5 flex items-center gap-1">
                  <Clock className="w-3 h-3" />{alert.time}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// Power Flow Sankey (animated SVG stub)
// ============================================================================

function PowerFlowSankey() {
  return (
    <div className="flex flex-col gap-3 p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 h-full">
      <p className="text-sm font-semibold flex items-center gap-2">
        <Zap className="w-4 h-4 text-[var(--color-primary)]" />Sankey Power Flow
        <span className="ml-auto text-[10px] font-mono text-[var(--text-muted)]">LIVE</span>
      </p>
      <div className="flex-1 relative overflow-hidden rounded-lg bg-[var(--bg-base)] min-h-[180px]">
        <svg viewBox="0 0 400 200" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          {/* Solar → Bus */}
          <rect x="10" y="30" width="70" height="30" rx="6" fill="var(--color-primary)" fillOpacity="0.15" stroke="var(--color-primary)" strokeOpacity="0.4" strokeWidth="1"/>
          <text x="45" y="50" textAnchor="middle" fontSize="10" fill="var(--color-primary)" fontWeight="600">☀ Solar</text>
          {/* Grid → Bus */}
          <rect x="10" y="80" width="70" height="30" rx="6" fill="#6366f1" fillOpacity="0.15" stroke="#6366f1" strokeOpacity="0.4" strokeWidth="1"/>
          <text x="45" y="100" textAnchor="middle" fontSize="10" fill="#6366f1" fontWeight="600">⚡ Grid</text>
          {/* Battery ↔ Bus */}
          <rect x="10" y="130" width="70" height="30" rx="6" fill="#10b981" fillOpacity="0.15" stroke="#10b981" strokeOpacity="0.4" strokeWidth="1"/>
          <text x="45" y="150" textAnchor="middle" fontSize="10" fill="#10b981" fontWeight="600">🔋 BESS</text>
          {/* Bus */}
          <rect x="160" y="60" width="80" height="80" rx="8" fill="var(--bg-surface)" stroke="var(--color-primary)" strokeOpacity="0.5" strokeWidth="1.5"/>
          <text x="200" y="97" textAnchor="middle" fontSize="9" fill="var(--text-muted)" fontWeight="700">DC BUS</text>
          <text x="200" y="112" textAnchor="middle" fontSize="10" fill="var(--text-primary)" fontWeight="800">12.15V</text>
          {/* Load */}
          <rect x="320" y="60" width="70" height="30" rx="6" fill="#f59e0b" fillOpacity="0.15" stroke="#f59e0b" strokeOpacity="0.4" strokeWidth="1"/>
          <text x="355" y="80" textAnchor="middle" fontSize="10" fill="#f59e0b" fontWeight="600">Load</text>
          {/* MPPT */}
          <rect x="320" y="110" width="70" height="30" rx="6" fill="var(--color-primary)" fillOpacity="0.1" stroke="var(--color-primary)" strokeOpacity="0.3" strokeWidth="1"/>
          <text x="355" y="130" textAnchor="middle" fontSize="10" fill="var(--text-muted)" fontWeight="600">MPPT</text>
          {/* Connecting paths */}
          <path d="M80 45 Q120 45 160 100" stroke="var(--color-primary)" strokeWidth="2" strokeOpacity="0.6" fill="none" strokeDasharray="4,3">
            <animate attributeName="stroke-dashoffset" from="0" to="-14" dur="0.8s" repeatCount="indefinite"/>
          </path>
          <path d="M80 95 Q120 95 160 100" stroke="#6366f1" strokeWidth="1.5" strokeOpacity="0.4" fill="none" strokeDasharray="4,3">
            <animate attributeName="stroke-dashoffset" from="0" to="-14" dur="1.2s" repeatCount="indefinite"/>
          </path>
          <path d="M80 145 Q120 145 160 100" stroke="#10b981" strokeWidth="1.5" strokeOpacity="0.5" fill="none" strokeDasharray="4,3">
            <animate attributeName="stroke-dashoffset" from="0" to="14" dur="1s" repeatCount="indefinite"/>
          </path>
          <path d="M240 80 Q280 80 320 75" stroke="#f59e0b" strokeWidth="2" strokeOpacity="0.6" fill="none" strokeDasharray="4,3">
            <animate attributeName="stroke-dashoffset" from="0" to="-14" dur="0.9s" repeatCount="indefinite"/>
          </path>
          <path d="M240 120 Q280 120 320 125" stroke="var(--color-primary)" strokeWidth="1.5" strokeOpacity="0.4" fill="none" strokeDasharray="4,3">
            <animate attributeName="stroke-dashoffset" from="0" to="-14" dur="1.1s" repeatCount="indefinite"/>
          </path>
        </svg>
      </div>
    </div>
  );
}

// ============================================================================
// Operations Console (Operator Dashboard)
// ============================================================================

export default function OperatorDashboardPage() {
  const { user } = useAuth();
  const [lastUpdate, setLastUpdate] = useState<string>('just now');

  useEffect(() => {
    const interval = setInterval(() => setLastUpdate('just now'), 2000);
    return () => clearInterval(interval);
  }, []);

  const tel = MOCK_TELEMETRY;

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-[1800px] mx-auto w-full">

      {/* Connection Status Bar */}
      <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 text-xs">
        <span className="flex items-center gap-1.5 font-semibold text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />Connected
        </span>
        <span className="text-[var(--text-muted)]">·</span>
        <span className="text-[var(--text-muted)]">Last update: <span className="text-[var(--text-primary)] font-mono">{lastUpdate}</span></span>
        <span className="text-[var(--text-muted)]">·</span>
        <span className="text-[var(--text-muted)]">WS: <span className="text-emerald-400 font-bold">●</span></span>
        <span className="text-[var(--text-muted)]">AI: <span className="text-[var(--color-primary)] font-bold">●</span></span>
        <span className="ml-auto text-[var(--text-muted)] font-mono">GridFlowX Operations Console</span>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard label="Solar Generation"  value={tel.solarGen.value}   unit={tel.solarGen.unit}   trend={tel.solarGen.trend}   icon={<Sun className="w-4 h-4" />}          color="bg-yellow-500/10 text-yellow-400" />
        <KpiCard label="Load Consumption"  value={tel.loadUse.value}    unit={tel.loadUse.unit}    trend={tel.loadUse.trend}    icon={<Zap className="w-4 h-4" />}          color="bg-[var(--color-primary)]/10 text-[var(--color-primary)]" />
        <KpiCard label="Battery SoC"       value={tel.battSoC.value}    unit={tel.battSoC.unit}    trend={tel.battSoC.trend}    icon={<Battery className="w-4 h-4" />}      color="bg-emerald-500/10 text-emerald-400" />
        <KpiCard label="Bus Voltage"       value={tel.busVoltage.value} unit={tel.busVoltage.unit} trend={tel.busVoltage.trend} icon={<Radio className="w-4 h-4" />}        color="bg-indigo-500/10 text-indigo-400" />
      </div>

      {/* Main content area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Sankey takes 2 columns */}
        <div className="lg:col-span-2">
          <PowerFlowSankey />
        </div>
        {/* Relay controls */}
        <div>
          <RelayControlPanel />
        </div>
      </div>

      {/* Bottom Row: AI + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AiDecisionPanel />
        <AlertsFeed />
      </div>
    </div>
  );
}
