'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Search,
  Filter,
  Plus,
  RefreshCw,
  Cpu,
  Activity,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Wifi,
  WifiOff,
  Sliders,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { MicrogridDevice, DeviceStatus } from '@/types/device.types';
import {
  fetchAllDevices,
  subscribeToDevices,
  INITIAL_MICROGRID_DEVICES,
} from '@/services/device.service';

export default function DevicesPage() {
  const [devices, setDevices] = useState<MicrogridDevice[]>(INITIAL_MICROGRID_DEVICES);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    // Initial fetch + real-time RTDB subscription
    const unsubscribe = subscribeToDevices(
      (updatedList) => {
        setDevices(updatedList);
        setLoading(false);
      },
      (err) => {
        console.warn('Realtime subscription failed, loading snapshot:', err);
        fetchAllDevices().then((d) => {
          setDevices(d);
          setLoading(false);
        });
      }
    );

    return () => unsubscribe();
  }, []);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const refreshed = await fetchAllDevices();
      setDevices(refreshed);
      toast.success('Device inventory refreshed');
    } catch {
      toast.error('Failed to refresh device inventory');
    } finally {
      setLoading(false);
    }
  };

  const filtered = devices.filter((d) => {
    const matchSearch =
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.id.toLowerCase().includes(search.toLowerCase()) ||
      d.location.toLowerCase().includes(search.toLowerCase()) ||
      d.siteId.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || d.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-[1800px] mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight">IoT Device Inventory</h1>
          <p className="text-xs text-[var(--text-muted)]">
            Edge nodes, microgrid controllers, and telemetry sensors ({devices.length} registered)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 text-xs font-semibold hover:border-[var(--color-primary)] transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Sync
          </button>
          <button
            onClick={() => toast.info('Provisioning modal: Scan QR code on ESP32 enclosure to pair node.')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white text-xs font-semibold hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" /> Provision New Device
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search by device name, ID, or site location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 text-xs focus:outline-none focus:border-[var(--color-primary)]"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 text-xs focus:outline-none focus:border-[var(--color-primary)]"
        >
          <option value="ALL">All Statuses</option>
          <option value="ONLINE">Online</option>
          <option value="CALIBRATING">Calibrating</option>
          <option value="MAINTENANCE">Maintenance</option>
          <option value="OFFLINE">Offline</option>
          <option value="FAULT">Fault</option>
        </select>
      </div>

      {loading ? (
        <div className="p-12 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-[var(--color-primary)]" />
          <p className="text-xs text-[var(--text-muted)]">Loading Realtime Hardware Inventory...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 text-center space-y-2">
          <Box className="w-8 h-8 text-[var(--text-muted)] mx-auto opacity-50" />
          <p className="text-sm font-semibold">No matching devices found</p>
          <p className="text-xs text-[var(--text-muted)]">Try adjusting your search criteria or status filter.</p>
        </div>
      ) : (
        <div className="rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[var(--border-primary)]/30 bg-[var(--bg-base)]/50 text-[var(--text-muted)] font-medium">
                  <th className="p-3.5">Device Identifier</th>
                  <th className="p-3.5">Type & Architecture</th>
                  <th className="p-3.5">Location & Site</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">IP / Transport</th>
                  <th className="p-3.5">Firmware</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-primary)]/20">
                {filtered.map((d) => {
                  const isOnline = d.status === 'ONLINE';
                  return (
                    <tr key={d.id} className="hover:bg-[var(--bg-base)]/40 transition-colors">
                      <td className="p-3.5">
                        <div className="font-semibold font-mono text-[var(--text-primary)]">{d.name}</div>
                        <div className="text-[10px] text-[var(--text-muted)] font-mono">{d.id}</div>
                      </td>
                      <td className="p-3.5">
                        <span className="font-mono text-[11px] font-semibold">{d.type}</span>
                        <div className="text-[10px] text-[var(--text-muted)]">{d.hardwareRevision}</div>
                      </td>
                      <td className="p-3.5">
                        <div>{d.location}</div>
                        <div className="text-[10px] text-[var(--text-muted)]">{d.siteId}</div>
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            isOnline
                              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                              : d.status === 'CALIBRATING'
                              ? 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30'
                              : 'bg-red-500/15 text-red-400 border-red-500/30'
                          }`}
                        >
                          {isOnline ? (
                            <CheckCircle2 className="w-2.5 h-2.5" />
                          ) : (
                            <XCircle className="w-2.5 h-2.5" />
                          )}
                          {d.status}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono text-[11px] text-[var(--text-muted)]">
                        {d.ipAddress || '—'}
                      </td>
                      <td className="p-3.5 font-mono text-[11px] text-[var(--text-muted)]">
                        {d.firmwareVersion}
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() =>
                            toast.info(`Calibration Studio: Opened profile for ${d.name}`)
                          }
                          className="px-2.5 py-1 rounded bg-[var(--bg-base)] border border-[var(--border-primary)]/40 text-[11px] font-semibold hover:border-[var(--color-primary)] transition-colors"
                        >
                          Calibrate
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
