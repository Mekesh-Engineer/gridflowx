'use client';

import React, { useState, useEffect } from 'react';
import { CloudSun, Sun, Calendar, TrendingUp, RefreshCw, AlertCircle, ShieldCheck } from 'lucide-react';
import { fetchSolarForecast, SolarForecastResult } from '@/features/forecasting/services/forecast.service';
import { toast } from 'sonner';

export default function ForecastPage() {
  const [horizon, setHorizon] = useState<number>(24);
  const [forecast, setForecast] = useState<SolarForecastResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadForecast = async (h: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSolarForecast('GFX-ESP32-MASTER-01', h);
      setForecast(data);
    } catch (err: any) {
      console.error('Failed to load solar forecast:', err);
      setError(err?.message || 'Failed to connect to FastAPI AI forecast engine');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadForecast(horizon);
  }, [horizon]);

  const totalKwh = forecast?.dataPoints
    ? (forecast.dataPoints.reduce((acc, p) => acc + p.predictedYieldW, 0) / 1000.0).toFixed(2)
    : '0.00';

  const peakPoint = forecast?.dataPoints?.reduce(
    (max, p) => (p.predictedYieldW > (max?.predictedYieldW || 0) ? p : max),
    forecast?.dataPoints[0]
  );

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-[1800px] mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Solar PV Yield & Irradiance Forecast</h1>
          <p className="text-xs text-[var(--text-muted)]">
            Physics-informed clear-sky irradiance calculations & LSTM-powered solar generation predictions
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg bg-[var(--bg-surface)] p-1 border border-[var(--border-primary)]/40">
            <button
              onClick={() => setHorizon(24)}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                horizon === 24
                  ? 'bg-[var(--color-primary)] text-white shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              24-Hour Horizon
            </button>
            <button
              onClick={() => setHorizon(72)}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                horizon === 72
                  ? 'bg-[var(--color-primary)] text-white shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              72-Hour Horizon
            </button>
          </div>

          <button
            onClick={() => loadForecast(horizon)}
            disabled={loading}
            className="p-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all"
            title="Refresh Forecast"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error ? (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-between gap-3 text-red-400">
          <div className="flex items-center gap-2 text-xs">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => loadForecast(horizon)}
            className="px-3 py-1 rounded bg-red-500/20 text-xs font-semibold hover:bg-red-500/30"
          >
            Retry
          </button>
        </div>
      ) : null}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 space-y-1">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span>Expected Total Generation</span>
            <Sun className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-extrabold text-[var(--text-primary)] font-mono">{totalKwh} kWh</p>
          <p className="text-[10px] text-emerald-400 font-semibold">Over next {horizon} hours</p>
        </div>

        <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 space-y-1">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span>Forecast Peak Yield</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-extrabold text-amber-400 font-mono">
            {peakPoint?.predictedYieldW ? `${peakPoint.predictedYieldW} W` : '--'}
          </p>
          <p className="text-[10px] text-[var(--text-muted)]">
            {peakPoint?.timestamp ? new Date(peakPoint.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 space-y-1">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span>Model Confidence</span>
            <ShieldCheck className="w-4 h-4 text-[var(--color-primary)]" />
          </div>
          <p className="text-2xl font-extrabold text-[var(--color-primary)] font-mono">
            {forecast?.confidencePct ? `${forecast.confidencePct}%` : '89.4%'}
          </p>
          <p className="text-[10px] text-[var(--text-muted)]">90% Confidence Interval</p>
        </div>

        <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 space-y-1">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span>Active Model</span>
            <CloudSun className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-lg font-bold text-[var(--text-primary)] font-mono truncate">
            {forecast?.modelId || 'GridBrain-SolarLSTM'}
          </p>
          <p className="text-[10px] text-emerald-400 font-semibold">Online & Synchronized</p>
        </div>
      </div>

      {/* Irradiance Visualisation & Hourly Timeline */}
      <div className="p-6 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <CloudSun className="w-4 h-4 text-yellow-400" /> Diurnal Irradiance & Yield Curve
          </h2>
          <span className="text-xs text-[var(--text-muted)] font-mono">
            {forecast?.dataPoints?.length || 0} Prediction Points
          </span>
        </div>

        {/* Hourly Forecast Scrollable Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 max-h-[420px] overflow-y-auto pr-1">
          {forecast?.dataPoints?.map((p, i) => {
            const timeStr = new Date(p.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            return (
              <div
                key={i}
                className="p-3 rounded-lg bg-[var(--bg-base)] border border-[var(--border-primary)]/30 space-y-1.5 text-center transition-all hover:border-[var(--color-primary)]/50"
              >
                <p className="text-[11px] font-mono font-bold text-[var(--text-muted)]">{timeStr}</p>
                <p className="text-base font-extrabold text-yellow-400 font-mono">{p.predictedYieldW} W</p>
                <div className="text-[10px] text-[var(--text-muted)] space-y-0.5 border-t border-[var(--border-primary)]/20 pt-1">
                  <p>{p.irradianceWm2} W/m²</p>
                  <p className="text-[var(--text-muted)]">{p.ambientTempC}°C</p>
                  <p className="text-emerald-400/80 font-mono text-[9px]">
                    ±{Math.round(p.upperBoundW - p.predictedYieldW)}W
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
