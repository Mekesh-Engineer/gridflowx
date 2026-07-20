'use client';

import React, { useState } from 'react';
import { useTheme } from 'next-themes';
import { AuthLogoMark } from '@/features/auth/components/AuthLogoMark';
import {
  Sun,
  Moon,
  Monitor,
  Bell,
  Shield,
  Sliders,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [refreshRate, setRefreshRate] = useState('5000');
  const [notifications, setNotifications] = useState({
    voltageSpike: true,
    thermalCutoff: true,
    firmwareUpdates: false,
    weeklyReports: true,
  });

  const handleSaveSettings = () => {
    toast.success('System preferences and telemetry refresh frequency updated.');
  };

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border-primary)]/40 pb-6">
          <div className="flex items-center gap-4">
            <AuthLogoMark iconSize="text-[26px]" containerSize="w-12 h-12" />
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
                Application & Telemetry Settings
              </h1>
              <p className="text-sm text-[var(--text-muted)]">
                Customize your interface aesthetics, telemetry polling intervals, and notification rules.
              </p>
            </div>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-surface)] text-sm font-semibold hover:border-[var(--color-primary)] transition-all"
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
        </div>

        <div className="space-y-6">
          {/* Theme Card */}
          <div className="rounded-2xl border border-[var(--border-primary)]/50 bg-[var(--bg-surface)] p-6 md:p-8 space-y-4 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                <Sliders size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[var(--text-primary)]">Appearance & Theme</h2>
                <p className="text-xs text-[var(--text-muted)]">Select how GridFlowX looks across your display terminals</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-2">
              {[
                { id: 'light', label: 'Light Mode', icon: Sun },
                { id: 'dark', label: 'Dark Mode', icon: Moon },
                { id: 'system', label: 'System Sync', icon: Monitor },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setTheme(id)}
                  className={`p-4 rounded-xl border flex flex-col items-center gap-3 text-sm font-bold transition-all cursor-pointer ${
                    theme === id
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)] shadow-sm'
                      : 'border-[var(--border-primary)]/50 bg-[var(--bg-base)] text-[var(--text-muted)] hover:border-[var(--color-primary)]/40'
                  }`}
                >
                  <Icon size={24} />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Telemetry Polling Card */}
          <div className="rounded-2xl border border-[var(--border-primary)]/50 bg-[var(--bg-surface)] p-6 md:p-8 space-y-4 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                <Sliders size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[var(--text-primary)]">Realtime Telemetry Polling Interval</h2>
                <p className="text-xs text-[var(--text-muted)]">Adjust how frequently the dashboard requests sensor packets from the microgrid</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              {[
                { value: '1000', label: 'High Frequency (1 sec)', sub: 'High network usage' },
                { value: '5000', label: 'Nominal (5 sec)', sub: 'Recommended for operators' },
                { value: '30000', label: 'Conserved (30 sec)', sub: 'Low bandwidth mode' },
              ].map(({ value, label, sub }) => (
                <button
                  key={value}
                  onClick={() => setRefreshRate(value)}
                  className={`p-4 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                    refreshRate === value
                      ? 'border-blue-500 bg-blue-500/10 text-[var(--text-primary)] shadow-sm'
                      : 'border-[var(--border-primary)]/50 bg-[var(--bg-base)] text-[var(--text-muted)] hover:border-blue-500/40'
                  }`}
                >
                  <div className="font-bold text-sm">{label}</div>
                  <div className="text-xs opacity-80">{sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Notifications Card */}
          <div className="rounded-2xl border border-[var(--border-primary)]/50 bg-[var(--bg-surface)] p-6 md:p-8 space-y-4 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                <Bell size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[var(--text-primary)]">Alert & Notification Rules</h2>
                <p className="text-xs text-[var(--text-muted)]">Manage push and email notifications for microgrid events</p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              {[
                { key: 'voltageSpike', label: 'Instant push notification on sector voltage harmonic spikes > 10%' },
                { key: 'thermalCutoff', label: 'High priority alert when battery thermal drift approaches cutoff threshold' },
                { key: 'firmwareUpdates', label: 'Notify when new GridFlowX controller firmware v3.x is available' },
                { key: 'weeklyReports', label: 'Send weekly PDF telemetry digests to verified email address' },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-3 cursor-pointer text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                  <input
                    type="checkbox"
                    checked={notifications[key as keyof typeof notifications]}
                    onChange={(e) =>
                      setNotifications({ ...notifications, [key]: e.target.checked })
                    }
                    className="rounded border-[var(--border-primary)] text-[var(--color-primary)] focus:ring-[var(--color-primary)] size-4 cursor-pointer"
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSaveSettings}
              className="px-6 py-3 rounded-xl text-sm font-bold bg-[var(--color-primary)] text-[var(--text-inverse)] hover:opacity-90 transition-opacity flex items-center gap-2 cursor-pointer shadow-md"
            >
              <CheckCircle2 size={16} /> Save Preferences
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
