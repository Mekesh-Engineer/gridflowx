'use client';

import React, { useState } from 'react';
import { Box, Search, Filter, Plus, RefreshCw, Cpu, Activity, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';

const MOCK_DEVICES = [
  { id: 'DEV-ESP-01', name: 'Sector 1 Controller', type: 'ESP32 Gateway', site: 'North Campus', status: 'ONLINE', firmware: 'v2.4.1', ip: '192.168.1.101', rssi: -62, lastSeen: '2s ago' },
  { id: 'DEV-ESP-02', name: 'Sector 2 Controller', type: 'ESP32 Gateway', site: 'Industrial A', status: 'ONLINE', firmware: 'v2.4.1', ip: '192.168.1.102', rssi: -71, lastSeen: '5s ago' },
  { id: 'DEV-INV-01', name: 'PV Inverter String A', type: 'Solar Inverter', site: 'North Campus', status: 'ONLINE', firmware: 'v1.9.0', ip: '192.168.1.120', rssi: -58, lastSeen: '1s ago' },
  { id: 'DEV-BMS-01', name: 'Battery BMS Unit', type: 'LiFePO4 BMS', site: 'North Campus', status: 'DEGRADED', firmware: 'v3.0.2', ip: '192.168.1.130', rssi: -82, lastSeen: '12s ago' },
  { id: 'DEV-ESP-03', name: 'Sector 3 Node', type: 'ESP32 Relay', site: 'Residential B', status: 'OFFLINE', firmware: 'v2.3.9', ip: '192.168.1.103', rssi: 0, lastSeen: '15m ago' },
];

export default function DevicesPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filtered = MOCK_DEVICES.filter(d => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) || d.id.toLowerCase().includes(search.toLowerCase()) || d.site.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || d.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-[1800px] mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight">IoT Device Inventory</h1>
          <p className="text-xs text-[var(--text-muted)]">Edge nodes, microgrid controllers, and telemetry sensors</p>
        </div>
        <button onClick={() => toast.info('Add device wizard triggered')} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white text-xs font-semibold hover:opacity-90 transition-opacity self-start sm:self-auto">
          <Plus className="w-4 h-4" /> Provision New Device
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search by device name, ID or site..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 text-xs focus:outline-none focus:border-[var(--color-primary)]"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 text-xs focus:outline-none focus:border-[var(--color-primary)]"
        >
          <option value="ALL">All Statuses</option>
          <option value="ONLINE">Online</option>
          <option value="DEGRADED">Degraded</option>
          <option value="OFFLINE">Offline</option>
        </select>
      </div>

      <div className="rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[var(--text-muted)] text-[10px] uppercase tracking-wider border-b border-[var(--border-primary)]/30 bg-[var(--bg-base)]/50">
                <th className="text-left py-3 px-4 font-medium">Device Info</th>
                <th className="text-left py-3 px-4 font-medium">Type</th>
                <th className="text-left py-3 px-4 font-medium">Site</th>
                <th className="text-center py-3 px-4 font-medium">Status</th>
                <th className="text-left py-3 px-4 font-medium">Firmware</th>
                <th className="text-left py-3 px-4 font-medium">IP Address</th>
                <th className="text-right py-3 px-4 font-medium">RSSI / Signal</th>
                <th className="text-right py-3 px-4 font-medium">Last Heartbeat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-primary)]/20">
              {filtered.map(device => (
                <tr key={device.id} className="hover:bg-[var(--bg-hover)] transition-colors">
                  <td className="py-3 px-4">
                    <p className="font-semibold text-xs text-[var(--text-primary)]">{device.name}</p>
                    <p className="text-[10px] text-[var(--text-muted)] font-mono">{device.id}</p>
                  </td>
                  <td className="py-3 px-4 text-xs">{device.type}</td>
                  <td className="py-3 px-4 text-xs text-[var(--text-muted)]">{device.site}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${
                      device.status === 'ONLINE' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' :
                      device.status === 'DEGRADED' ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' :
                      'bg-red-500/15 text-red-400 border-red-500/30'
                    }`}>
                      {device.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-[var(--text-muted)]">{device.firmware}</td>
                  <td className="py-3 px-4 font-mono text-xs text-[var(--text-muted)]">{device.ip}</td>
                  <td className="py-3 px-4 text-right font-mono text-xs">
                    {device.rssi !== 0 ? <span className={device.rssi > -70 ? 'text-emerald-400' : 'text-amber-400'}>{device.rssi} dBm</span> : <span className="text-[var(--text-muted)]">N/A</span>}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-xs text-[var(--text-muted)]">{device.lastSeen}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
