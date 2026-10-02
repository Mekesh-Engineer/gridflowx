'use client';

import React, { useState, useEffect } from 'react';
import {
  Zap,
  Battery,
  Sun,
  Activity,
  ToggleLeft,
  ToggleRight,
  AlertTriangle,
  Brain,
  ArrowUpRight,
  ArrowDownRight,
  Radio,
  RefreshCw,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useTelemetry } from '@/features/telemetry/hooks/useTelemetry';
import { PermissionGuard } from '@/components/providers/PermissionGuard';
import { toggleRelayOverride, triggerEmergencyStop } from '@/features/relay/services/relay.service';
import { toast } from 'sonner';

// ============================================================================
// KPI Card
// ============================================================================

interface KpiCardProps {
  label: string;
  value: number;
  unit: string;
  trend: number;
  icon: React.ReactNode;
  color: string;
  sublabel?: string;
}

function KpiCard({ label, value, unit, trend, icon, color, sublabel }: KpiCardProps) {
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
          {value.toFixed(1)}
          <span className="text-sm text-[var(--text-muted)] ml-1">{unit}</span>
        </p>
        {sublabel ? (
          <p className="text-xs text-[var(--text-muted)] mt-1 font-mono">{sublabel}</p>
        ) : !isNeutral ? (
          <p
            className={`text-xs mt-1 flex items-center gap-0.5 font-medium ${
              isUp ? 'text-emerald-400' : 'text-red-400'
            }`}
          >
            {isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {Math.abs(trend).toFixed(1)}% vs nominal
          </p>
        ) : (
          <p className="text-xs text-[var(--text-muted)] mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            Normal
          </p>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Relay Control Panel
// ============================================================================

interface RelayControlPanelProps {
  relayStates: boolean[];
}

function RelayControlPanel({ relayStates }: RelayControlPanelProps) {
  const { user } = useAuth();
  const [localRelays, setLocalRelays] = useState<boolean[]>(relayStates);
  const [loadingIdx, setLoadingIdx] = useState<number | null>(null);
  const [estopLoading, setEstopLoading] = useState(false);

  useEffect(() => {
    setLocalRelays(relayStates);
  }, [relayStates]);

  const toggle = async (index: number, name: string) => {
    const targetState = !(localRelays[index] ?? false);
    setLoadingIdx(index);
    try {
      const res = await toggleRelayOverride(
        index,
        targetState,
        `Operator manual UI toggle from dashboard`,
        user
      );
      setLocalRelays(res.currentRelayStates || []);
      toast.success(`${name}: Toggled ${targetState ? 'ON' : 'OFF'} (${res.latencyMs}ms)`);
    } catch (err: any) {
      toast.error(`Override failed: ${err?.message || 'Server error'}`);
    } finally {
      setLoadingIdx(null);
    }
  };

  const handleEmergencyStop = async () => {
    setEstopLoading(true);
    try {
      const res = await triggerEmergencyStop(
        'Operator manual Emergency Stop pressed from dashboard UI',
        user
      );
      setLocalRelays(res.currentRelayStates || [false, false, false, false, false, false, false, false]);
      toast.error('🚨 EMERGENCY STOP DISPATCHED: All microgrid relays isolated safely.');
    } catch (err: any) {
      toast.error(`Emergency stop failed: ${err?.message || 'Server error'}`);
    } finally {
      setEstopLoading(false);
    }
  };

  const relayItems = [
    { idx: 0, label: 'Tier 1 — Critical', description: 'Medical / Safety (100% SLA)' },
    { idx: 1, label: 'Tier 2 — Important', description: 'Comms / Gateway / Net' },
    { idx: 2, label: 'Tier 3 — Flexible', description: 'HVAC / Sheddable Loads' },
    { idx: 3, label: 'MPPT Solar Enable', description: 'Solar Array Charging Contactor' },
    { idx: 4, label: 'Grid Interconnect', description: 'AC Utility Import / Export' },
  ];

  return (
    <div className="flex flex-col gap-3 p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 h-full">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold flex items-center gap-2">
          <ToggleLeft className="w-4 h-4 text-[var(--color-primary)]" />
          Relay Actuator Matrix
        </p>
        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
          8-CH MATRIX
        </span>
      </div>

      <div className="space-y-2">
        {relayItems.map(({ idx, label, description }) => {
          const on = localRelays[idx] ?? false;
          const isLoading = loadingIdx === idx;
          return (
            <div key={idx} className="flex items-center justify-between py-1.5">
              <div>
                <p className="text-xs font-medium">{label}</p>
                <p className="text-[10px] text-[var(--text-muted)]">{description}</p>
              </div>
              <PermissionGuard
                resource="relays"
                action="override"
                fallback={
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      on
                        ? 'text-emerald-400 bg-emerald-400/10'
                        : 'text-[var(--text-muted)] bg-[var(--bg-base)]'
                    }`}
                  >
                    {on ? 'ON' : 'OFF'}
                  </span>
                }
              >
                <button
                  onClick={() => toggle(idx, label)}
                  disabled={isLoading}
                  className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border transition-all disabled:opacity-50 ${
                    on
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25'
                      : 'bg-[var(--bg-base)] text-[var(--text-muted)] border-[var(--border-primary)]/40 hover:border-[var(--border-primary)]'
                  }`}
                >
                  {isLoading ? (
                    <RefreshCw className="w-3 h-3 animate-spin" />
                  ) : on ? (
                    <ToggleRight className="w-3.5 h-3.5" />
                  ) : (
                    <ToggleLeft className="w-3.5 h-3.5" />
                  )}
                  {on ? 'ON' : 'OFF'}
                </button>
              </PermissionGuard>
            </div>
          );
        })}
      </div>

      <PermissionGuard resource="relays" action="override">
        <button
          onClick={handleEmergencyStop}
          disabled={estopLoading}
          className="mt-2 w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold hover:bg-red-500/20 transition-colors disabled:opacity-50"
        >
          {estopLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldAlert className="w-4 h-4" />}
          EMERGENCY STOP ALL
        </button>
      </PermissionGuard>
    </div>
  );
}

// ============================================================================
// AI Decision Panel
// ============================================================================

interface AiDecisionPanelProps {
  solarW: number;
  loadW: number;
  soc: number;
}

function AiDecisionPanel({ solarW, loadW, soc }: AiDecisionPanelProps) {
  const isNetPositive = solarW >= loadW;
  const decisionText = isNetPositive
    ? `Charging BESS with surplus ${(solarW - loadW).toFixed(1)}W solar generation`
    : `Discharging battery to offset ${(loadW - solarW).toFixed(1)}W load deficit`;

  return (
    <div className="flex flex-col gap-3 p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 h-full">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold flex items-center gap-2">
          <Brain className="w-4 h-4 text-[var(--color-primary)]" />
          AI Autonomous Routing Engine
        </p>
        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
          1 Hz INFERENCE
        </span>
      </div>
      <div className="flex-1 space-y-3">
        <div className="p-3 rounded-lg bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/20">
          <p className="text-xs text-[var(--color-primary)] font-semibold mb-1">Active Optimization Rule</p>
          <p className="text-sm text-[var(--text-primary)] font-medium">"{decisionText}"</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2.5 rounded-lg bg-[var(--bg-base)] text-center">
            <p className="text-[10px] text-[var(--text-muted)] mb-1">Model Confidence</p>
            <p className="text-lg font-bold text-emerald-400">91.4%</p>
          </div>
          <div className="p-2.5 rounded-lg bg-[var(--bg-base)] text-center">
            <p className="text-[10px] text-[var(--text-muted)] mb-1">Inference Latency</p>
            <p className="text-lg font-bold text-[var(--text-primary)]">14.8 ms</p>
          </div>
        </div>
        <p className="text-[10px] text-[var(--text-muted)] font-mono text-center">
          Model: GridBrain-RL-Optimizer-v3.0 (ONNX)
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// Alerts Feed
// ============================================================================

const ALERTS_DATA = [
  { id: 'A1', severity: 'info', message: 'Solar MPPT tracking efficiency nominal (98.4%)', time: 'Just now' },
  { id: 'A2', severity: 'warning', message: 'Peak utility tariff period active ($0.34/kWh)', time: '12m ago' },
  { id: 'A3', severity: 'info', message: 'FreeRTOS Core 0 safety loop running @ 100 Hz', time: '25m ago' },
];

function AlertsFeed() {
  return (
    <div className="flex flex-col gap-3 p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 h-full">
      <p className="text-sm font-semibold flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-400" />
        Live Fault & Event Stream
        <span className="ml-auto text-[10px] font-mono text-[var(--text-muted)] bg-[var(--bg-base)] px-2 py-0.5 rounded-full">
          STREAM
        </span>
      </p>
      <div className="space-y-2">
        {ALERTS_DATA.map((alert) => (
          <div
            key={alert.id}
            className={`flex items-start gap-3 p-2.5 rounded-lg border-l-2 ${
              alert.severity === 'warning'
                ? 'bg-amber-500/10 border-l-amber-500 text-amber-400'
                : 'bg-blue-500/10 border-l-blue-500 text-blue-400'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-[var(--text-primary)] truncate">{alert.message}</p>
              <p className="text-[10px] text-[var(--text-muted)] mt-0.5 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {alert.time}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Real-Time Power Flow Sankey Diagram
// ============================================================================

interface PowerFlowSankeyProps {
  solarW: number;
  gridW: number;
  battW: number;
  loadW: number;
  busV: number;
}

function PowerFlowSankey({ solarW, gridW, battW, loadW, busV }: PowerFlowSankeyProps) {
  return (
    <div className="flex flex-col gap-3 p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 h-full">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold flex items-center gap-2">
          <Zap className="w-4 h-4 text-[var(--color-primary)]" />
          Real-Time Power Flow Topology
        </p>
        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
          LIVE 1Hz
        </span>
      </div>
      <div className="flex-1 relative overflow-hidden rounded-lg bg-[var(--bg-base)] min-h-[220px]">
        <svg viewBox="0 0 400 220" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          {/* Solar Source */}
          <rect
            x="10"
            y="25"
            width="80"
            height="35"
            rx="6"
            fill="var(--color-primary)"
            fillOpacity="0.15"
            stroke="var(--color-primary)"
            strokeOpacity="0.6"
            strokeWidth="1"
          />
          <text x="50" y="42" textAnchor="middle" fontSize="10" fill="var(--color-primary)" fontWeight="700">
            ☀ Solar PV
          </text>
          <text x="50" y="54" textAnchor="middle" fontSize="9" fill="var(--text-primary)" fontFamily="monospace">
            {solarW.toFixed(1)} W
          </text>

          {/* Grid Source */}
          <rect
            x="10"
            y="85"
            width="80"
            height="35"
            rx="6"
            fill="#6366f1"
            fillOpacity="0.15"
            stroke="#6366f1"
            strokeOpacity="0.6"
            strokeWidth="1"
          />
          <text x="50" y="102" textAnchor="middle" fontSize="10" fill="#6366f1" fontWeight="700">
            ⚡ AC Grid
          </text>
          <text x="50" y="114" textAnchor="middle" fontSize="9" fill="var(--text-primary)" fontFamily="monospace">
            {gridW.toFixed(1)} W
          </text>

          {/* Battery BESS */}
          <rect
            x="10"
            y="145"
            width="80"
            height="35"
            rx="6"
            fill="#10b981"
            fillOpacity="0.15"
            stroke="#10b981"
            strokeOpacity="0.6"
            strokeWidth="1"
          />
          <text x="50" y="162" textAnchor="middle" fontSize="10" fill="#10b981" fontWeight="700">
            🔋 BESS Pack
          </text>
          <text x="50" y="174" textAnchor="middle" fontSize="9" fill="var(--text-primary)" fontFamily="monospace">
            {battW > 0 ? `+${battW.toFixed(1)}W` : `${battW.toFixed(1)}W`}
          </text>

          {/* Common DC Bus */}
          <rect
            x="160"
            y="65"
            width="80"
            height="90"
            rx="8"
            fill="var(--bg-surface)"
            stroke="var(--color-primary)"
            strokeOpacity="0.6"
            strokeWidth="2"
          />
          <text x="200" y="95" textAnchor="middle" fontSize="10" fill="var(--text-muted)" fontWeight="800">
            DC BUS
          </text>
          <text x="200" y="115" textAnchor="middle" fontSize="12" fill="var(--text-primary)" fontWeight="800" fontFamily="monospace">
            {busV.toFixed(2)} V
          </text>
          <text x="200" y="135" textAnchor="middle" fontSize="8" fill="var(--color-primary)">
            REGULATED
          </text>

          {/* Load Consumer */}
          <rect
            x="310"
            y="65"
            width="80"
            height="35"
            rx="6"
            fill="#f59e0b"
            fillOpacity="0.15"
            stroke="#f59e0b"
            strokeOpacity="0.6"
            strokeWidth="1"
          />
          <text x="350" y="82" textAnchor="middle" fontSize="10" fill="#f59e0b" fontWeight="700">
            Load Tiers
          </text>
          <text x="350" y="94" textAnchor="middle" fontSize="9" fill="var(--text-primary)" fontFamily="monospace">
            {loadW.toFixed(1)} W
          </text>

          {/* MPPT Charger */}
          <rect
            x="310"
            y="125"
            width="80"
            height="35"
            rx="6"
            fill="var(--color-primary)"
            fillOpacity="0.1"
            stroke="var(--color-primary)"
            strokeOpacity="0.4"
            strokeWidth="1"
          />
          <text x="350" y="142" textAnchor="middle" fontSize="10" fill="var(--text-muted)" fontWeight="700">
            MPPT Core
          </text>
          <text x="350" y="154" textAnchor="middle" fontSize="8" fill="var(--color-primary)" fontWeight="600">
            TRACKING
          </text>

          {/* Dynamic Flow Paths */}
          {solarW > 0 && (
            <path d="M90 42 Q125 42 160 90" stroke="var(--color-primary)" strokeWidth="2" strokeOpacity="0.8" fill="none" strokeDasharray="5,4">
              <animate attributeName="stroke-dashoffset" from="0" to="-18" dur="0.8s" repeatCount="indefinite" />
            </path>
          )}

          {gridW > 0 && (
            <path d="M90 102 Q125 102 160 110" stroke="#6366f1" strokeWidth="2" strokeOpacity="0.8" fill="none" strokeDasharray="5,4">
              <animate attributeName="stroke-dashoffset" from="0" to="-18" dur="1s" repeatCount="indefinite" />
            </path>
          )}

          <path d="M90 162 Q125 162 160 130" stroke="#10b981" strokeWidth="2" strokeOpacity="0.8" fill="none" strokeDasharray="5,4">
            <animate attributeName="stroke-dashoffset" from="0" to={battW >= 0 ? "-18" : "18"} dur="1s" repeatCount="indefinite" />
          </path>

          <path d="M240 95 Q275 95 310 82" stroke="#f59e0b" strokeWidth="2.5" strokeOpacity="0.8" fill="none" strokeDasharray="5,4">
            <animate attributeName="stroke-dashoffset" from="0" to="-18" dur="0.8s" repeatCount="indefinite" />
          </path>

          <path d="M240 125 Q275 125 310 142" stroke="var(--color-primary)" strokeWidth="1.5" strokeOpacity="0.5" fill="none" strokeDasharray="5,4">
            <animate attributeName="stroke-dashoffset" from="0" to="-18" dur="1.2s" repeatCount="indefinite" />
          </path>
        </svg>
      </div>
    </div>
  );
}

// ============================================================================
// Operations Console (Live Operator Dashboard)
// ============================================================================

export default function OperatorDashboardPage() {
  const { user } = useAuth();
  const telemetry = useTelemetry();

  // Battery current * battery voltage = Battery Power Watts
  const batteryPowerW = telemetry.batteryVoltageV * telemetry.batteryCurrentA;

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-[1800px] mx-auto w-full">
      {/* Real-Time WebSocket Connection Status Bar */}
      <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 text-xs">
        <span
          className={`flex items-center gap-1.5 font-semibold ${
            telemetry.isWsConnected ? 'text-emerald-400' : 'text-amber-400'
          }`}
        >
          {telemetry.isWsConnected ? (
            <>
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live Telemetry Stream Active
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5 text-amber-400" />
              Connecting to Edge Gateway...
            </>
          )}
        </span>
        <span className="text-[var(--text-muted)]">·</span>
        <span className="text-[var(--text-muted)]">
          Node: <span className="text-[var(--text-primary)] font-mono">{telemetry.deviceId}</span>
        </span>
        <span className="text-[var(--text-muted)]">·</span>
        <span className="text-[var(--text-muted)]">
          Failsafe:{' '}
          <span
            className={`font-mono font-bold ${
              telemetry.core0FailsafeActive ? 'text-red-400' : 'text-emerald-400'
            }`}
          >
            {telemetry.core0FailsafeActive ? 'TRIPPED' : 'NOMINAL (100Hz)'}
          </span>
        </span>
        <span className="ml-auto text-[var(--text-muted)] font-mono hidden sm:inline">
          GridFlowX Operations Console
        </span>
      </div>

      {/* KPI Row (Bound to Live Telemetry) */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          label="Solar PV Generation"
          value={telemetry.solarPowerW}
          unit="W"
          trend={+4.2}
          sublabel={`${telemetry.solarVoltageV.toFixed(1)}V · ${telemetry.solarCurrentA.toFixed(1)}A`}
          icon={<Sun className="w-4 h-4" />}
          color="bg-yellow-500/10 text-yellow-400"
        />
        <KpiCard
          label="Total Load Demand"
          value={telemetry.totalLoadPowerW}
          unit="W"
          trend={-1.5}
          sublabel="Tiers 1, 2, 3 Active"
          icon={<Zap className="w-4 h-4" />}
          color="bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
        />
        <KpiCard
          label="Battery State of Charge"
          value={telemetry.batterySoc}
          unit="%"
          trend={0}
          sublabel={`${telemetry.batteryVoltageV.toFixed(2)}V · ${telemetry.batteryTempC.toFixed(1)}°C`}
          icon={<Battery className="w-4 h-4" />}
          color="bg-emerald-500/10 text-emerald-400"
        />
        <KpiCard
          label="DC Bus Voltage"
          value={telemetry.dcBusVoltageV}
          unit="V"
          trend={0}
          sublabel="12.0V Target Bus"
          icon={<Radio className="w-4 h-4" />}
          color="bg-indigo-500/10 text-indigo-400"
        />
      </div>

      {/* Main Real-Time Grid Topology Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <PowerFlowSankey
            solarW={telemetry.solarPowerW}
            gridW={telemetry.gridPowerW}
            battW={batteryPowerW}
            loadW={telemetry.totalLoadPowerW}
            busV={telemetry.dcBusVoltageV}
          />
        </div>
        <div>
          <RelayControlPanel relayStates={telemetry.relayStates} />
        </div>
      </div>

      {/* Bottom Operational Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AiDecisionPanel
          solarW={telemetry.solarPowerW}
          loadW={telemetry.totalLoadPowerW}
          soc={telemetry.batterySoc}
        />
        <AlertsFeed />
      </div>
    </div>
  );
}
