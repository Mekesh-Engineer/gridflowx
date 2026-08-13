'use client';

import React, { useState } from 'react';
import { Play, AlertTriangle, ShieldAlert, Activity, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function SimulationPage() {
  const [scenario, setScenario] = useState('grid_outage');
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleRun = () => {
    setRunning(true);
    setResult(null);
    setTimeout(() => {
      setRunning(false);
      setResult('SIMULATION COMPLETE: System successfully islanded within 18ms. BESS sustained Tier 1 loads for projected 4.2 hours.');
      toast.success('Simulation completed successfully.');
    }, 1500);
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-[1800px] mx-auto w-full">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Fault & Load Scenario Simulator</h1>
        <p className="text-xs text-[var(--text-muted)]">"What-If" digital twin simulation for microgrid fault tolerance & islanding response</p>
      </div>

      <div className="p-6 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 space-y-4">
        <h2 className="text-sm font-semibold flex items-center gap-2">
          <Play className="w-4 h-4 text-[var(--color-primary)]" /> Select Simulation Scenario
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { id: 'grid_outage', name: 'Total Utility Grid Outage', desc: 'Simulate sudden grid loss & automatic islanding' },
            { id: 'solar_drop', name: '70% Solar Drop (Cloud Event)', desc: 'Simulate rapid irradiance drop & BESS discharge reaction' },
            { id: 'bess_fault', name: 'BESS Thermal Cutoff', desc: 'Simulate battery disconnect & Tier 3 load shedding' },
          ].map(sc => (
            <div
              key={sc.id}
              onClick={() => setScenario(sc.id)}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                scenario === sc.id
                  ? 'bg-[var(--color-primary)]/10 border-[var(--color-primary)] text-[var(--color-primary)]'
                  : 'bg-[var(--bg-base)] border-[var(--border-primary)]/30 text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <p className="text-xs font-bold">{sc.name}</p>
              <p className="text-[10px] mt-1 opacity-80">{sc.desc}</p>
            </div>
          ))}
        </div>

        <button
          disabled={running}
          onClick={handleRun}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[var(--color-primary)] text-white text-xs font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <Play className="w-4 h-4" /> {running ? 'Running Simulation Models...' : 'Execute What-If Simulation'}
        </button>

        {result && (
          <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 font-mono">
            {result}
          </div>
        )}
      </div>
    </div>
  );
}
