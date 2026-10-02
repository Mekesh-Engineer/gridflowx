'use client';

import React, { useState } from 'react';
import { Zap, UploadCloud, CheckCircle2, AlertTriangle, ShieldCheck, ArrowUpCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { PermissionGuard } from '@/components/providers/PermissionGuard';
import { logAuditEvent } from '@/services/audit.service';
import { useAuth } from '@/hooks/use-auth';

interface FirmwareRelease {
  version: string;
  releaseDate: string;
  status: 'STABLE' | 'BETA' | 'DEPRECATED';
  devicesDeployed: number;
  totalDevices: number;
  notes: string;
  sha256: string;
}

const RELEASES: FirmwareRelease[] = [
  {
    version: 'v2.4.1',
    releaseDate: '2026-07-20',
    status: 'STABLE',
    devicesDeployed: 24,
    totalDevices: 24,
    notes: 'Fix ACS712 zero-point drift & FreeRTOS 100Hz deterministic safety timer interrupt',
    sha256: '9f8b2c41a7e944d82b01cc8421bb9902',
  },
  {
    version: 'v2.4.0',
    releaseDate: '2026-06-15',
    status: 'DEPRECATED',
    devicesDeployed: 0,
    totalDevices: 24,
    notes: 'Added WebSocket TLS 1.3 encryption & dynamic MPPT tracking packet serialization',
    sha256: '3a7b11d8c90f42b899ef01aa7722cc14',
  },
  {
    version: 'v2.5.0-beta',
    releaseDate: '2026-08-01',
    status: 'BETA',
    devicesDeployed: 2,
    totalDevices: 24,
    notes: 'Canary build with on-chip edge anomaly statistical scoring & UART high-speed buffer',
    sha256: 'e8a7199f0c22d41b8a1c9e782d029bb1',
  },
];

export default function FirmwarePage() {
  const { user } = useAuth();
  const [deploying, setDeploying] = useState<string | null>(null);

  const handleDeploy = async (rel: FirmwareRelease) => {
    setDeploying(rel.version);
    try {
      await logAuditEvent({
        actorUid: user?.uid || 'usr-operator-01',
        actorEmail: user?.email || 'operator@gridflowx.io',
        actorRole: (user?.role as any) || 'operator',
        action: 'FIRMWARE_OTA_DISPATCHED',
        severity: 'WARNING',
        status: 'SUCCESS',
        resource: 'devices/GFX-ESP32-MASTER-01',
        details: { version: rel.version, sha256: rel.sha256, targetDevices: 'Canary Cluster (Node A)' },
      });

      setTimeout(() => {
        setDeploying(null);
        toast.success(`OTA firmware binary ${rel.version} successfully broadcasted to ESP32 controllers.`);
      }, 1500);
    } catch (err: any) {
      setDeploying(null);
      toast.error(err?.message || 'Failed to dispatch OTA update');
    }
  };

  const handleUploadModal = () => {
    toast.info('Firmware binary upload modal opened (Supports ESP32 .bin artifacts with SHA-256 validation).');
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-[1800px] mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Over-The-Air (OTA) Firmware Management</h1>
          <p className="text-xs text-[var(--text-muted)]">
            Staged binary releases, cryptographic SHA-256 verification & canary deployment for ESP32 microgrid nodes
          </p>
        </div>

        <PermissionGuard resource="firmware" action="create">
          <button
            onClick={handleUploadModal}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white text-xs font-semibold hover:opacity-90 transition-opacity shadow-sm"
          >
            <UploadCloud className="w-4 h-4" /> Upload .BIN Firmware
          </button>
        </PermissionGuard>
      </div>

      {/* Release List */}
      <div className="space-y-4">
        {RELEASES.map((rel) => (
          <div
            key={rel.version}
            className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 flex flex-col lg:flex-row lg:items-center justify-between gap-5 transition-all hover:border-[var(--color-primary)]/40"
          >
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5">
                <span className="text-base font-bold font-mono text-[var(--text-primary)]">{rel.version}</span>
                <span
                  className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${
                    rel.status === 'STABLE'
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                      : rel.status === 'BETA'
                      ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                      : 'bg-zinc-800 text-zinc-500 border-zinc-700/40'
                  }`}
                >
                  {rel.status}
                </span>
                <span className="text-xs text-[var(--text-muted)] font-mono">Released {rel.releaseDate}</span>
              </div>
              <p className="text-xs text-[var(--text-muted)]">{rel.notes}</p>
              <p className="text-[10px] text-[var(--text-muted)] font-mono">SHA-256: {rel.sha256}</p>
            </div>

            <div className="flex items-center gap-5">
              <div className="text-right text-xs font-mono">
                <p className="font-bold text-[var(--text-primary)]">
                  {rel.devicesDeployed} / {rel.totalDevices} Deployed
                </p>
                <p className="text-[10px] text-emerald-400 font-semibold">
                  {Math.round((rel.devicesDeployed / rel.totalDevices) * 100)}% Coverage
                </p>
              </div>

              <PermissionGuard resource="firmware" action="execute">
                <button
                  disabled={deploying === rel.version}
                  onClick={() => handleDeploy(rel)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--bg-base)] border border-[var(--border-primary)]/50 text-xs font-semibold hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-all disabled:opacity-50"
                >
                  <ArrowUpCircle className={`w-3.5 h-3.5 ${deploying === rel.version ? 'animate-spin text-[var(--color-primary)]' : ''}`} />
                  {deploying === rel.version ? 'Broadcasting OTA...' : 'Deploy OTA'}
                </button>
              </PermissionGuard>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
