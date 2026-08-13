'use client';

import React from 'react';
import { Thermometer, Sun, Wind, Droplets, CloudSun, Eye } from 'lucide-react';

export default function LiveWeatherPage() {
  const metrics = [
    { label: 'Solar Irradiance', value: '845.2', unit: 'W/m²', icon: <Sun className="w-5 h-5 text-yellow-400" />, color: 'bg-yellow-500/10' },
    { label: 'Ambient Temperature', value: '31.4', unit: '°C', icon: <Thermometer className="w-5 h-5 text-red-400" />, color: 'bg-red-500/10' },
    { label: 'Relative Humidity', value: '58.0', unit: '%', icon: <Droplets className="w-5 h-5 text-blue-400" />, color: 'bg-blue-500/10' },
    { label: 'Wind Velocity', value: '12.4', unit: 'km/h', icon: <Wind className="w-5 h-5 text-emerald-400" />, color: 'bg-emerald-500/10' },
  ];

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-[1800px] mx-auto w-full">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Live Weather Station</h1>
        <p className="text-xs text-[var(--text-muted)]">Real-time environmental sensor data & solar pyranometer telemetry</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map(m => (
          <div key={m.label} className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${m.color}`}>
              {m.icon}
            </div>
            <div>
              <p className="text-xs text-[var(--text-muted)]">{m.label}</p>
              <p className="text-2xl font-extrabold tabular-nums text-[var(--text-primary)]">
                {m.value}<span className="text-xs font-normal text-[var(--text-muted)] ml-1">{m.unit}</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
