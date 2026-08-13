'use client';

import React from 'react';
import { Radio, Server, Activity, CheckCircle2, AlertTriangle, RefreshCw, Cpu, Layers } from 'lucide-react';

const GATEWAYS = [
  { id: 'GW-01', name: 'MQTT Primary Broker', host: 'mqtt.gridflowx.io:1883', clients: 42, msgsSec: 128, status: 'ONLINE', latency: 12, uptime: '99.98%' },
  { id: 'GW-02', name: 'WebSocket Stream Hub', host: 'ws.gridflowx.io:8080', clients: 115, msgsSec: 340, status: 'ONLINE', latency: 8, uptime: '99.99%' },
  { id: 'GW-03', name: 'Edge Gateway Site-03', host: '192.168.3.1', clients: 8, msgsSec: 22, status: 'DEGRADED', latency: 85, uptime: '97.20%' },
];

export default function GatewaysPage() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-[1800px] mx-auto w-full">
      <div>
        <h1 className="text-xl font-bold tracking-tight">MQTT & WebSocket Gateways</h1>
        <p className="text-xs text-[var(--text-muted)]">Real-time messaging brokers, gateway nodes and telemetry stream latency</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {GATEWAYS.map(gw => (
          <div key={gw.id} className="flex flex-col justify-between p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-mono text-[var(--color-primary)]">{gw.id}</p>
                <h3 className="text-base font-bold text-[var(--text-primary)] mt-0.5">{gw.name}</h3>
                <p className="text-xs text-[var(--text-muted)] font-mono mt-1">{gw.host}</p>
              </div>
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                gw.status === 'ONLINE' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
              }`}>
                {gw.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--border-primary)]/20">
              <div className="p-2.5 rounded-lg bg-[var(--bg-base)] text-center">
                <p className="text-[10px] text-[var(--text-muted)]">Active Clients</p>
                <p className="text-lg font-bold tabular-nums text-[var(--text-primary)]">{gw.clients}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-[var(--bg-base)] text-center">
                <p className="text-[10px] text-[var(--text-muted)]">Msgs / Sec</p>
                <p className="text-lg font-bold tabular-nums text-[var(--color-primary)]">{gw.msgsSec}</p>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-[var(--text-muted)] pt-1">
              <span>Latency: <strong className={gw.latency < 20 ? 'text-emerald-400' : 'text-amber-400'}>{gw.latency} ms</strong></span>
              <span>Uptime: <strong className="text-[var(--text-primary)]">{gw.uptime}</strong></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
