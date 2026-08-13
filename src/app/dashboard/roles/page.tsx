'use client';

import React from 'react';
import { ShieldCheck, Lock, Check, X } from 'lucide-react';
import { PERMISSION_MATRIX, type PermissionResource, type PermissionAction } from '@/config/permissions.config';
import { UserRole } from '@/types/roles';

const RESOURCES: PermissionResource[] = ['telemetry', 'relays', 'devices', 'ai-models', 'agent-approvals', 'users', 'billing', 'audit-logs'];
const ACTIONS: PermissionAction[] = ['read', 'create', 'update', 'delete', 'override', 'approve', 'export'];

export default function RolesPage() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-[1800px] mx-auto w-full">
      <div>
        <h1 className="text-xl font-bold tracking-tight">RBAC Roles & Permissions Matrix Studio</h1>
        <p className="text-xs text-[var(--text-muted)] font-mono">Visual permission matrix grid mapping access actions per resource across all 4 system roles</p>
      </div>

      <div className="p-6 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-[var(--border-primary)]/40 text-[var(--text-muted)] uppercase font-mono">
              <th className="text-left py-2 pr-4">Resource</th>
              <th className="text-left py-2 pr-4">Action</th>
              <th className="text-center py-2 px-3 text-[var(--color-primary)]">Operator</th>
              <th className="text-center py-2 px-3 text-indigo-400">Supervisor</th>
              <th className="text-center py-2 px-3 text-emerald-400">Admin</th>
              <th className="text-center py-2 px-3 text-amber-400">Auditor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-primary)]/20">
            {RESOURCES.map(r => (
              ACTIONS.map(a => {
                const op = PERMISSION_MATRIX[UserRole.OPERATOR][r]?.includes(a);
                const sup = PERMISSION_MATRIX[UserRole.SUPERVISOR][r]?.includes(a);
                const adm = PERMISSION_MATRIX[UserRole.ADMIN][r]?.includes(a);
                const aud = PERMISSION_MATRIX[UserRole.AUDITOR][r]?.includes(a);

                return (
                  <tr key={`${r}-${a}`} className="hover:bg-[var(--bg-hover)] transition-colors">
                    <td className="py-2 pr-4 font-mono font-bold text-[var(--text-primary)]">{r}</td>
                    <td className="py-2 pr-4 font-mono text-[var(--text-muted)]">{a}</td>
                    <td className="py-2 px-3 text-center">{op ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> : <X className="w-4 h-4 text-[var(--text-muted)]/30 mx-auto" />}</td>
                    <td className="py-2 px-3 text-center">{sup ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> : <X className="w-4 h-4 text-[var(--text-muted)]/30 mx-auto" />}</td>
                    <td className="py-2 px-3 text-center">{adm ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> : <X className="w-4 h-4 text-[var(--text-muted)]/30 mx-auto" />}</td>
                    <td className="py-2 px-3 text-center">{aud ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> : <X className="w-4 h-4 text-[var(--text-muted)]/30 mx-auto" />}</td>
                  </tr>
                );
              })
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
