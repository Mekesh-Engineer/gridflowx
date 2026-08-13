'use client';

import React, { useState } from 'react';
import { Zap, UploadCloud, CheckCircle2, AlertTriangle, ShieldCheck, ArrowUpCircle } from 'lucide-react';
import { toast } from 'sonner';
import { PermissionGuard } from '@/components/providers/PermissionGuard';

const RELEASES = [
  { version: 'v2.4.1', releaseDate: '2026-07-20', status: 'STABLE', devicesDeployed: 18, totalDevices: 24, notes: 'Fix ACS712 zero-point drift & telemetry jitter' },
  { version: 'v2.4.0', releaseDate: '2026-06-15', status: 'DEPRECATED', devicesDeployed: 5, totalDevices: 24, notes: 'Added WebSocket TLS 1.3 encryption support' },
  { version: 'v2.5.0-beta', releaseDate: '2026-07-28', status: 'BETA', devicesDeployed: 1, totalDevices: 24, notes: 'Canary build with experimental AI local inference' },
];

export default function FirmwarePage() {
  const [deploying, setDeploying] = useState<string | null>(null);

  const handleDeploy = (ver: string) => {
    setDeploying(ver);
    setTimeout(() => {
      setDeploying(null);
      toast.success(`OTA update ${ver} deployed to canary devices successfully.`);
    }, 2000);
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-[1800px] mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight">OTA Firmware Manager</h1>
          <p className="text-xs text-[var(--text-muted)]">Staged Over-The-Air firmware updates for ESP32 microgrid edge controllers</p>
        </div>
        <PermissionGuard resource="firmware" action="create">
          <button onClick={() => toast.info('Upload firmware binary modal opened')} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white text-xs font-semibold hover:opacity-90 transition-opacity">
            <UploadCloud className="w-4 h-4" /> Upload .BIN Firmware
          </button>
        </PermissionGuard>
      </div>

      <div className="space-y-4">
        {RELEASES.map(rel => (
          <div key={rel.version} className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-base font-bold font-mono text-[var(--text-primary)]">{rel.version}</span>
                <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${
                  rel.status === 'STABLE' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' :
                  rel.status === 'BETA' ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' :
                  'bg-red-500/15 text-red-400 border-red-500/30'
                }`}>
                  {rel.status}
                </span>
                <span className="text-xs text-[var(--text-muted)] font-mono">Released {rel.releaseDate}</span>
              </div>
              <p className="text-xs text-[var(--text-muted)]">{rel.notes}</p>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right text-xs">
                <p className="font-semibold text-[var(--text-primary)]">{rel.devicesDeployed} / {rel.totalDevices} Devices</p>
                <p className="text-[10px] text-[var(--text-muted)]">{Math.round((rel.devicesDeployed / rel.totalDevices) * 100)}% deployed</p>
              </div>

              <PermissionGuard resource="firmware" action="execute">
                <button
                  disabled={deploying === rel.version}
                  onClick={() => handleDeploy(rel.version)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg-base)] border border-[var(--border-primary)]/50 text-xs font-semibold hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-all disabled:opacity-50"
                >
                  <ArrowUpCircle className="w-3.5 h-3.5" />
                  {deploying === rel.version ? 'Deploying...' : 'Deploy OTA'}
                </button>
              </PermissionGuard>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
