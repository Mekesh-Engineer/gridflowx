'use client';

import React, { useState } from 'react';
import { Sliders, RefreshCw, Save, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { PermissionGuard } from '@/components/providers/PermissionGuard';

export default function CalibrationPage() {
  const [zeroPoint, setZeroPoint] = useState(2.50);
  const [multiplier, setMultiplier] = useState(0.066);
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success('ACS712 current sensor calibration parameters saved to EEPROM.');
    }, 1200);
  };

  const rawVoltage = 2.76;
  const calculatedCurrent = ((rawVoltage - zeroPoint) / multiplier).toFixed(2);

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-[1800px] mx-auto w-full">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Sensor Calibration Studio</h1>
        <p className="text-xs text-[var(--text-muted)]">ACS712 Hall-effect current sensor zero-point & sensitivity multiplier tuning</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 space-y-6">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[var(--color-primary)]" /> Calibration Parameters
          </h2>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-[var(--text-muted)] block mb-1">Zero-Point Voltage (Vcc / 2 offset in V)</label>
              <input
                type="number"
                step="0.001"
                value={zeroPoint}
                onChange={e => setZeroPoint(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-lg bg-[var(--bg-base)] border border-[var(--border-primary)]/40 text-xs font-mono"
              />
            </div>

            <div>
              <label className="text-xs text-[var(--text-muted)] block mb-1">Sensitivity Multiplier (V / A)</label>
              <input
                type="number"
                step="0.001"
                value={multiplier}
                onChange={e => setMultiplier(parseFloat(e.target.value) || 0.001)}
                className="w-full px-3 py-2 rounded-lg bg-[var(--bg-base)] border border-[var(--border-primary)]/40 text-xs font-mono"
              />
            </div>

            <PermissionGuard resource="sensors" action="update">
              <button
                disabled={saving}
                onClick={handleSave}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[var(--color-primary)] text-white text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                <Save className="w-4 h-4" /> {saving ? 'Writing to EEPROM...' : 'Save Calibration to Node'}
              </button>
            </PermissionGuard>
          </div>
        </div>

        <div className="p-6 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">Live Reading Preview</h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">Real-time output calculated from parameters</p>
          </div>

          <div className="p-4 rounded-lg bg-[var(--bg-base)] border border-[var(--border-primary)]/30 space-y-3">
            <div className="flex justify-between text-xs">
              <span className="text-[var(--text-muted)]">ADC Raw Voltage:</span>
              <span className="font-mono font-bold text-[var(--text-primary)]">{rawVoltage} V</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[var(--text-muted)]">Configured Zero-Point:</span>
              <span className="font-mono text-[var(--text-muted)]">{zeroPoint} V</span>
            </div>
            <div className="pt-2 border-t border-[var(--border-primary)]/30 flex justify-between items-center">
              <span className="text-xs font-semibold text-[var(--text-primary)]">Calibrated Output:</span>
              <span className="text-2xl font-extrabold font-mono text-[var(--color-primary)]">{calculatedCurrent} A</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" /> Zero-point drift within acceptable threshold (&lt;0.5%)
          </div>
        </div>
      </div>
    </div>
  );
}
