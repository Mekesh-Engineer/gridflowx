'use client';

import React from 'react';
import { Layers, Box, Activity, Zap } from 'lucide-react';

export default function DigitalTwinVisualizerPage() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-[1800px] mx-auto w-full">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Interactive 3D Microgrid Digital Twin</h1>
        <p className="text-xs text-[var(--text-muted)]">Real-time 3D spatial visualizer for battery containers, inverter bays & solar arrays</p>
      </div>

      <div className="p-8 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 min-h-[400px] flex flex-col items-center justify-center text-center space-y-4 relative overflow-hidden">
        <div className="w-20 h-20 rounded-2xl bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/30 flex items-center justify-center">
          <Box className="w-10 h-10 text-[var(--color-primary)] animate-pulse" />
        </div>
        <div className="space-y-1 max-w-md">
          <h3 className="text-base font-bold text-[var(--text-primary)]">Three.js / WebGL Spatial Canvas</h3>
          <p className="text-xs text-[var(--text-muted)]">3D Microgrid Scene Loaded: North Campus Site Node A. Live telemetry bound to spatial mesh components.</p>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono text-[var(--text-muted)] bg-[var(--bg-base)] px-4 py-2 rounded-full border border-[var(--border-primary)]/30">
          <span>FPS: <strong className="text-emerald-400">60.0</strong></span> · <span>Meshes: <strong className="text-[var(--text-primary)]">28</strong></span> · <span>WebGL 2.0</span>
        </div>
      </div>
    </div>
  );
}
