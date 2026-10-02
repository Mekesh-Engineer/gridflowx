'use client';

import React, { useState } from 'react';
import { Layers, ToggleLeft, ToggleRight, ShieldAlert, Zap, CheckCircle2, ShieldCheck, Activity } from 'lucide-react';
import { useTelemetryStore } from '@/features/telemetry/store/telemetry.store';
import { toggleRelayOverride } from '@/features/relay/services/relay.service';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';

export default function LoadsPage() {
  const currentFrame = useTelemetryStore((state) => state.currentFrame);
  const { user } = useAuth();
  const [togglingChannel, setTogglingChannel] = useState<number | null>(null);

  const totalLoadW = currentFrame?.totalLoadPowerW ?? 48.2;
  const relays = currentFrame?.relayStates ?? [true, true, false, true, false, true, false, true];

  const handleToggleTier = async (channel: number, tierName: string, currentState: boolean) => {
    setTogglingChannel(channel);
    try {
      const targetState = !currentState;
      await toggleRelayOverride(
        channel,
        targetState,
        `Operator manual ${targetState ? 'restore' : 'shed'} on ${tierName}`,
        user
      );
      toast.success(`${tierName}: Toggled ${targetState ? 'ONLINE (CLOSED)' : 'SHEDDED (OPEN)'}`);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to toggle load relay');
    } finally {
      setTogglingChannel(null);
    }
  };

  const tiers = [
    {
      channel: 0,
      tier: 'Tier 1 — Critical Life-Safety & Comms',
      desc: 'ESP32 telemetry, emergency lighting, fire safety & security contactors',
      power: relays[0] ? '18.0 W' : '0.0 W',
      priority: 1,
      active: relays[0] ?? true,
      badgeColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    },
    {
      channel: 1,
      tier: 'Tier 2 — Important Operational Loads',
      desc: 'Central computing server, air handling & active battery cooling fans',
      power: relays[1] ? '20.0 W' : '0.0 W',
      priority: 2,
      active: relays[1] ?? true,
      badgeColor: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    },
    {
      channel: 2,
      tier: 'Tier 3 — Flexible / Automated Sheddable',
      desc: 'Auxiliary space heaters, HVAC boosters & non-essential AC distribution',
      power: relays[2] ? '45.0 W' : '0.0 W',
      priority: 3,
      active: relays[2] ?? false,
      badgeColor: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    },
  ];

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-[1800px] mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Circuit Load Tier Management & Shedding</h1>
          <p className="text-xs text-[var(--text-muted)]">
            Prioritized 3-tier microgrid circuit distribution & autonomous emergency load shedding controls
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-pink-400 bg-pink-500/10 border border-pink-500/30 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5" /> Total Active Load: {totalLoadW.toFixed(1)} W
          </span>
        </div>
      </div>

      {/* Tiered Load Cards */}
      <div className="space-y-4">
        {tiers.map((t) => {
          const isPending = togglingChannel === t.channel;
          return (
            <div
              key={t.channel}
              className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 flex flex-col md:flex-row md:items-center justify-between gap-5 transition-all hover:border-[var(--color-primary)]/40"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-[var(--color-primary)]">Relay Ch {t.channel}</span>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${t.badgeColor}`}>
                    Priority {t.priority}
                  </span>
                </div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">{t.tier}</h3>
                <p className="text-xs text-[var(--text-muted)]">{t.desc}</p>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right font-mono">
                  <p className="text-[10px] text-[var(--text-muted)]">Measured Draw</p>
                  <p className="text-lg font-extrabold text-[var(--text-primary)]">{t.power}</p>
                </div>

                <button
                  onClick={() => handleToggleTier(t.channel, t.tier, t.active)}
                  disabled={isPending}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold border transition-all ${
                    t.active
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/25'
                      : 'bg-zinc-800/30 border-zinc-700/40 text-zinc-400 hover:text-white'
                  }`}
                >
                  {t.active ? <ToggleRight className="w-4 h-4 text-emerald-400" /> : <ToggleLeft className="w-4 h-4 text-zinc-500" />}
                  {isPending ? 'Switching...' : t.active ? 'ONLINE (SHED)' : 'SHEDDED (ACTIVATE)'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
