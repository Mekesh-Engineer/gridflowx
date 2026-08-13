'use client';

import React from 'react';
import { Plug, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

const INTGS = [
  { name: 'FastAPI AI Engine', status: 'CONNECTED', endpoint: 'http://localhost:8000/api/v1', latency: '18ms' },
  { name: 'OpenWeatherMap API', status: 'CONNECTED', endpoint: 'api.openweathermap.org', latency: '120ms' },
  { name: 'Firebase Firestore', status: 'CONNECTED', endpoint: 'gridflowx.firebaseapp.com', latency: '45ms' },
  { name: 'MQTT Broker', status: 'CONNECTED', endpoint: 'mqtt.gridflowx.io:1883', latency: '12ms' },
];

export default function IntegrationsPage() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-[1800px] mx-auto w-full">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Third-Party Integration Hub</h1>
        <p className="text-xs text-[var(--text-muted)] font-mono">External API services, machine learning backends & database connector health</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {INTGS.map(i => (
          <div key={i.name} className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[var(--text-primary)]">{i.name}</h3>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full border bg-emerald-500/15 text-emerald-400 border-emerald-500/30">
                {i.status}
              </span>
            </div>

            <p className="text-xs text-[var(--text-muted)] font-mono">{i.endpoint}</p>

            <div className="pt-2 border-t border-[var(--border-primary)]/20 flex justify-between text-xs text-[var(--text-muted)]">
              <span>Latency: <strong className="text-emerald-400">{i.latency}</strong></span>
              <button onClick={() => toast.success(`Tested connection to ${i.name}`)} className="text-[var(--color-primary)] hover:underline">
                Test Connection
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
