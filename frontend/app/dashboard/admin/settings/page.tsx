'use client';

import React, { useState } from 'react';
import { Settings, Save, Sliders } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminSettingsPage() {
  const [minSoc, setMinSoc] = useState(20);
  const [maxTemp, setMaxTemp] = useState(45);
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success('Tenant safety cutoff limits updated successfully.');
    }, 1000);
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-[1800px] mx-auto w-full">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Tenant Platform & Safety Settings</h1>
        <p className="text-xs text-[var(--text-muted)]">Global microgrid safety limits, system cutoff thresholds and platform branding</p>
      </div>

      <div className="p-6 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 space-y-6 max-w-xl">
        <h2 className="text-sm font-semibold flex items-center gap-2">
          <Sliders className="w-4 h-4 text-[var(--color-primary)]" /> System Safety Cutoff Limits
        </h2>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-[var(--text-muted)] block mb-1">Minimum Battery SoC Threshold (%)</label>
            <input
              type="number"
              value={minSoc}
              onChange={e => setMinSoc(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-lg bg-[var(--bg-base)] border border-[var(--border-primary)]/40 text-xs font-mono"
            />
          </div>

          <div>
            <label className="text-xs text-[var(--text-muted)] block mb-1">Maximum Cell Temperature Limit (°C)</label>
            <input
              type="number"
              value={maxTemp}
              onChange={e => setMaxTemp(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-lg bg-[var(--bg-base)] border border-[var(--border-primary)]/40 text-xs font-mono"
            />
          </div>

          <button
            disabled={saving}
            onClick={handleSave}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[var(--color-primary)] text-white text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Tenant Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}
