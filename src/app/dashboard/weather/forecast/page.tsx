'use client';

import React from 'react';
import { CloudSun, Sun, Calendar, TrendingUp } from 'lucide-react';

export default function ForecastPage() {
  const hourly = [
    { time: '09:00', irrad: 420, cloud: 10, yield: '2.1 kWh' },
    { time: '12:00', irrad: 910, cloud: 5,  yield: '4.8 kWh' },
    { time: '15:00', irrad: 780, cloud: 25, yield: '3.9 kWh' },
    { time: '18:00', irrad: 210, cloud: 40, yield: '1.0 kWh' },
  ];

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-[1800px] mx-auto w-full">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Solar & Irradiance Forecast</h1>
        <p className="text-xs text-[var(--text-muted)]">72-hour machine learning solar yield prediction with cloud cover shading</p>
      </div>

      <div className="p-6 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 space-y-4">
        <h2 className="text-sm font-semibold flex items-center gap-2">
          <CloudSun className="w-4 h-4 text-yellow-400" /> Irradiance Curve (Today)
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {hourly.map((h, i) => (
            <div key={i} className="p-4 rounded-lg bg-[var(--bg-base)] border border-[var(--border-primary)]/30 space-y-2 text-center">
              <p className="text-xs font-mono font-bold text-[var(--text-muted)]">{h.time}</p>
              <p className="text-xl font-extrabold text-yellow-400">{h.irrad} W/m²</p>
              <div className="text-[10px] text-[var(--text-muted)] space-y-0.5">
                <p>Cloud cover: {h.cloud}%</p>
                <p className="text-emerald-400 font-semibold">Exp Yield: {h.yield}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
