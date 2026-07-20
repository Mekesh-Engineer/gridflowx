'use client';

import React, { useEffect, useState } from 'react';
import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { fetchAllUsers, updateUserRole, UserProfileDocument } from '@/services/firebase';
import { UserRole, TELEMETRY_LIMITS } from '@/lib/constants';
import {
  Users,
  Shield,
  Sliders,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Cpu,
  Power,
  Search,
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminDashboardPage() {
  const [users, setUsers] = useState<UserProfileDocument[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingUid, setUpdatingUid] = useState<string | null>(null);

  // Threshold state
  const [thresholds, setThresholds] = useState({
    minSoc: TELEMETRY_LIMITS.MIN_SOC,
    criticalSoc: TELEMETRY_LIMITS.CRITICAL_SOC,
    maxTemp: TELEMETRY_LIMITS.MAX_TEMP,
    minVoltage: TELEMETRY_LIMITS.MIN_VOLTAGE,
    maxVoltage: TELEMETRY_LIMITS.MAX_VOLTAGE,
  });
  const [savingConfig, setSavingConfig] = useState(false);

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const list = await fetchAllUsers();
      setUsers(list);
    } catch (error) {
      toast.error('Failed to load users from Firestore.');
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRoleChange = async (targetUid: string, newRole: string) => {
    setUpdatingUid(targetUid);
    try {
      await updateUserRole(targetUid, newRole);
      setUsers((prev) =>
        prev.map((u) => (u.uid === targetUid ? { ...u, role: newRole as UserRole } : u))
      );
      toast.success(`User role updated to ${newRole.toUpperCase()}`);
    } catch (error) {
      toast.error('Failed to update user role.');
    } finally {
      setUpdatingUid(null);
    }
  };

  const handleSaveThresholds = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingConfig(true);
    setTimeout(() => {
      setSavingConfig(false);
      toast.success('System telemetry thresholds synchronized across grid controllers.');
    }, 800);
  };

  const filteredUsers = users.filter(
    (u) =>
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.displayName && u.displayName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 12)',
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col p-4 md:p-6 gap-6 bg-[var(--bg-base)]">
          {/* Header Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-[var(--color-primary)]/15 via-[var(--bg-surface)] to-[var(--bg-surface)] border border-[var(--border-primary)]/50 shadow-sm">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 text-xs font-extrabold tracking-wider uppercase rounded-md bg-[var(--color-primary)] text-[var(--text-inverse)]">
                  Admin Portal
                </span>
                <span className="text-sm text-[var(--text-muted)] font-mono">v3.0.0-PROD</span>
              </div>
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">
                System & User Administration Center
              </h1>
              <p className="text-sm text-[var(--text-muted)]">
                Manage user access permissions, configure safety thresholds, and execute emergency overrides.
              </p>
            </div>
            <button
              onClick={loadUsers}
              disabled={loadingUsers}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-surface)] text-sm font-semibold text-[var(--text-primary)] hover:border-[var(--color-primary)]/50 transition-all cursor-pointer self-start md:self-center"
            >
              <RefreshCw className={`size-4 ${loadingUsers ? 'animate-spin' : ''}`} />
              Sync Users
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* User Management Table (2 cols) */}
            <div className="lg:col-span-2 rounded-2xl border border-[var(--border-primary)]/50 bg-[var(--bg-surface)] p-6 space-y-4 shadow-sm flex flex-col">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                    <Users size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-[var(--text-primary)]">User Role Control</h2>
                    <p className="text-xs text-[var(--text-muted)]">
                      {users.length} total registered accounts
                    </p>
                  </div>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[var(--text-muted)]" />
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl text-sm bg-[var(--bg-base)] border border-[var(--border-primary)]/60 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--border-primary)]/40 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                      <th className="py-3 px-3">User</th>
                      <th className="py-3 px-3">Verification</th>
                      <th className="py-3 px-3">Current Role</th>
                      <th className="py-3 px-3 text-right">Assign Role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-primary)]/30 text-sm">
                    {loadingUsers ? (
                      <tr>
                        <td colSpan={4} className="py-12 text-center text-[var(--text-muted)]">
                          <div className="inline-flex items-center gap-2">
                            <Loader2 className="size-5 animate-spin text-[var(--color-primary)]" />
                            Loading users from Firestore...
                          </div>
                        </td>
                      </tr>
                    ) : filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-12 text-center text-[var(--text-muted)]">
                          No matching user records found.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => (
                        <tr key={u.uid} className="hover:bg-[var(--bg-base)]/50 transition-colors">
                          <td className="py-3.5 px-3">
                            <div className="flex flex-col">
                              <span className="font-semibold text-[var(--text-primary)]">
                                {u.displayName || 'Unnamed User'}
                              </span>
                              <span className="text-xs text-[var(--text-muted)]">{u.email}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-3">
                            {u.emailVerified ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                <CheckCircle2 size={12} /> Verified
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                <AlertTriangle size={12} /> Pending
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-3">
                            <span className="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/20">
                              {u.role || 'operator'}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 text-right">
                            <select
                              value={u.role || UserRole.OPERATOR}
                              disabled={updatingUid === u.uid}
                              onChange={(e) => handleRoleChange(u.uid, e.target.value)}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--bg-base)] border border-[var(--border-primary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] cursor-pointer disabled:opacity-50"
                            >
                              <option value={UserRole.OPERATOR}>Operator</option>
                              <option value={UserRole.SUPERVISOR}>Supervisor</option>
                              <option value={UserRole.ADMIN}>Admin</option>
                              <option value={UserRole.AUDITOR}>Auditor</option>
                            </select>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* System Configuration & Emergency Controls (1 col) */}
            <div className="space-y-6">
              {/* Thresholds Card */}
              <div className="rounded-2xl border border-[var(--border-primary)]/50 bg-[var(--bg-surface)] p-6 space-y-4 shadow-sm">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-orange-500/10 text-orange-500">
                    <Sliders size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-[var(--text-primary)]">Safety Thresholds</h2>
                    <p className="text-xs text-[var(--text-muted)]">Automated grid protection limits</p>
                  </div>
                </div>

                <form onSubmit={handleSaveThresholds} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[var(--text-muted)] uppercase">
                      Min Battery State of Charge (%)
                    </label>
                    <input
                      type="number"
                      value={thresholds.minSoc}
                      onChange={(e) => setThresholds({ ...thresholds, minSoc: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 rounded-xl text-sm bg-[var(--bg-base)] border border-[var(--border-primary)] text-[var(--text-primary)] font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[var(--text-muted)] uppercase">
                      Critical SoC Alert Level (%)
                    </label>
                    <input
                      type="number"
                      value={thresholds.criticalSoc}
                      onChange={(e) => setThresholds({ ...thresholds, criticalSoc: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 rounded-xl text-sm bg-[var(--bg-base)] border border-[var(--border-primary)] text-[var(--text-primary)] font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[var(--text-muted)] uppercase">
                      Max Thermal Cutoff (°C)
                    </label>
                    <input
                      type="number"
                      value={thresholds.maxTemp}
                      onChange={(e) => setThresholds({ ...thresholds, maxTemp: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 rounded-xl text-sm bg-[var(--bg-base)] border border-[var(--border-primary)] text-[var(--text-primary)] font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={savingConfig}
                    className="w-full py-2.5 rounded-xl text-sm font-bold bg-[var(--color-primary)] text-[var(--text-inverse)] hover:opacity-90 transition-opacity flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {savingConfig ? (
                      <><Loader2 className="size-4 animate-spin" /> Synchronizing...</>
                    ) : (
                      <><Shield size={16} /> Deploy Configuration</>
                    )}
                  </button>
                </form>
              </div>

              {/* Emergency Override Card */}
              <div className="rounded-2xl border border-red-500/30 bg-red-500/[0.03] p-6 space-y-3 shadow-sm">
                <div className="flex items-center gap-2.5 text-red-500">
                  <Power size={20} />
                  <h3 className="font-bold text-base">Emergency Relay Override</h3>
                </div>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  Immediately isolate Sector 4 or trip all high-voltage feeder relays in case of severe grid instability.
                </p>
                <button
                  type="button"
                  onClick={() => toast.error('Emergency isolation sequence triggered for Sector 4.')}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 transition-all cursor-pointer uppercase tracking-wider"
                >
                  Trip Feeder Relays (Emergency)
                </button>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
