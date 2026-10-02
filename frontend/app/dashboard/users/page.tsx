'use client';

import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Search, Shield } from 'lucide-react';
import { fetchAllUsers, updateUserRole, type UserProfileDocument } from '@/services/user.service';
import { UserRole } from '@/types/roles';
import { toast } from 'sonner';

export default function UsersPage() {
  const [users, setUsers] = useState<UserProfileDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadUsers = async () => {
    setLoading(true);
    try {
      const list = await fetchAllUsers();
      setUsers(list);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRoleChange = async (uid: string, newRole: UserRole) => {
    try {
      await updateUserRole(uid, newRole);
      toast.success(`User role updated to ${newRole}`);
      loadUsers();
    } catch {
      toast.error('Failed to update user role');
    }
  };

  const filtered = users.filter(u =>
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.displayName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-[1800px] mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight">User Directory</h1>
          <p className="text-xs text-[var(--text-muted)]">User account provisioning, seat allocation & RBAC role assignments</p>
        </div>

        <button onClick={() => toast.info('Invite user modal triggered')} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white text-xs font-semibold hover:opacity-90 transition-opacity">
          <UserPlus className="w-4 h-4" /> Invite User
        </button>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
        <input
          type="text"
          placeholder="Search users by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 text-xs focus:outline-none focus:border-[var(--color-primary)]"
        />
      </div>

      <div className="rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[var(--text-muted)] text-[10px] uppercase tracking-wider border-b border-[var(--border-primary)]/30 bg-[var(--bg-base)]/50">
                <th className="text-left py-3 px-4 font-medium">User</th>
                <th className="text-left py-3 px-4 font-medium">Role</th>
                <th className="text-left py-3 px-4 font-medium">Created At</th>
                <th className="text-right py-3 px-4 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-primary)]/20">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-xs text-[var(--text-muted)]">Loading users from Firestore...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-xs text-[var(--text-muted)]">No users found.</td>
                </tr>
              ) : (
                filtered.map(u => (
                  <tr key={u.uid} className="hover:bg-[var(--bg-hover)] transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-semibold text-xs text-[var(--text-primary)]">{u.displayName || 'No Name'}</p>
                      <p className="text-[10px] text-[var(--text-muted)] font-mono">{u.email}</p>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={u.role}
                        onChange={e => handleRoleChange(u.uid, e.target.value as UserRole)}
                        className="px-2 py-1 rounded bg-[var(--bg-base)] border border-[var(--border-primary)]/40 text-xs font-semibold capitalize"
                      >
                        <option value={UserRole.OPERATOR}>Operator</option>
                        <option value={UserRole.SUPERVISOR}>Supervisor</option>
                        <option value={UserRole.ADMIN}>Admin</option>
                        <option value={UserRole.AUDITOR}>Auditor</option>
                      </select>
                    </td>
                    <td className="py-3 px-4 text-xs text-[var(--text-muted)] font-mono">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}</td>
                    <td className="py-3 px-4 text-right text-xs">
                      <span className="text-emerald-400 font-semibold">Active</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
