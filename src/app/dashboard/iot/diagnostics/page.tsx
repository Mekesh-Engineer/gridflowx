'use client';

import React, { useState } from 'react';
import { Activity, Terminal, RefreshCw, Power, Radio, CheckCircle2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

const LOG_LINES = [
  '[05:28:10.102] [ESP32-DEV-01] WiFi connected. IP: 192.168.1.101 RSSI: -62dBm',
  '[05:28:10.512] [ESP32-DEV-01] MQTT client connected to broker mqtt.gridflowx.io:1883',
  '[05:28:11.001] [ESP32-DEV-01] ACS712 zero-point calibrated: 2.501V',
  '[05:28:11.500] [ESP32-DEV-01] Telemetry stream initialized. Frequency: 1000ms',
  '[05:28:12.000] [ESP32-DEV-01] [TX] Topic: gridflowx/sector1/telemetry | Solar: 342.5W | Load: 48.2W | SoC: 72.3%',
  '[05:28:13.000] [ESP32-DEV-01] [TX] Topic: gridflowx/sector1/telemetry | Solar: 343.1W | Load: 47.9W | SoC: 72.3%',
];

export default function DiagnosticsPage() {
  const [selectedDevice, setSelectedDevice] = useState('DEV-ESP-01');
  const [logs, setLogs] = useState(LOG_LINES);
  const [pinging, setPinging] = useState(false);

  const handlePing = () => {
    setPinging(true);
    setTimeout(() => {
      setPinging(false);
      const newLog = `[${new Date().toISOString().slice(11, 23)}] [PING] Device ${selectedDevice} responded in 14ms.`;
      setLogs(prev => [...prev, newLog]);
      toast.success(`Ping successful (14ms)`);
    }, 800);
  };

  const handleReboot = () => {
    const newLog = `[${new Date().toISOString().slice(11, 23)}] [REBOOT] Graceful restart command sent to ${selectedDevice}.`;
    setLogs(prev => [...prev, newLog]);
    toast.warning(`Graceful reboot sent to ${selectedDevice}`);
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-[1800px] mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Device Diagnostics & Serial Logs</h1>
          <p className="text-xs text-[var(--text-muted)]">Live terminal serial streaming, ICMP ping testing, and remote device reboot controls</p>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={handlePing} disabled={pinging} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 text-xs font-semibold hover:border-[var(--color-primary)] transition-all">
            <Radio className="w-3.5 h-3.5 text-[var(--color-primary)]" /> {pinging ? 'Pinging...' : 'Ping Device'}
          </button>
          <button onClick={handleReboot} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold hover:bg-red-500/20 transition-all">
            <Power className="w-3.5 h-3.5" /> Remote Reboot
          </button>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono">
            <Terminal className="w-4 h-4 text-[var(--color-primary)]" />
            <span>Target: </span>
            <select value={selectedDevice} onChange={e => setSelectedDevice(e.target.value)} className="bg-[var(--bg-base)] border border-[var(--border-primary)]/40 px-2 py-1 rounded text-xs">
              <option value="DEV-ESP-01">DEV-ESP-01 (Sector 1 Controller)</option>
              <option value="DEV-ESP-02">DEV-ESP-02 (Sector 2 Controller)</option>
              <option value="DEV-BMS-01">DEV-BMS-01 (Battery BMS)</option>
            </select>
          </div>
          <button onClick={() => setLogs(LOG_LINES)} className="text-[10px] text-[var(--text-muted)] hover:text-[var(--text-primary)]">
            Clear Terminal
          </button>
        </div>

        <div className="p-4 rounded-lg bg-black/80 font-mono text-xs text-emerald-400 h-80 overflow-y-auto space-y-1 border border-emerald-500/20 shadow-inner">
          {logs.map((line, idx) => (
            <p key={idx} className="leading-relaxed">{line}</p>
          ))}
        </div>
      </div>
    </div>
  );
}
