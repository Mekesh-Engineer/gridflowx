'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldX, ArrowLeft, Home } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { ROLE_DASHBOARDS, ROLE_LABELS } from '@/config/routes.config';
import { UserRole } from '@/types/roles';

const ROLE_MESSAGES: Record<UserRole, string> = {
  [UserRole.OPERATOR]:   'Your Operator account does not have access to this section. Contact your Supervisor or Admin.',
  [UserRole.SUPERVISOR]: 'Your Supervisor account does not have access to this section. Contact your Admin.',
  [UserRole.ADMIN]:      'You do not have access to this resource.',
  [UserRole.AUDITOR]:    'Your Auditor account has read-only access. This action or section requires elevated permissions.',
};

export default function UnauthorizedPage() {
  const { user, role } = useAuth();
  const normalizedRole = (role ? String(role).toLowerCase() : null) as UserRole | null;
  const homePath = normalizedRole ? ROLE_DASHBOARDS[normalizedRole] : '/dashboard';
  const roleLabel = normalizedRole ? ROLE_LABELS[normalizedRole] : 'User';
  const message = normalizedRole ? ROLE_MESSAGES[normalizedRole] : 'You are not authorized to view this page.';

  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-center bg-[var(--bg-base)] text-[var(--text-primary)] p-6">
      <div className="w-full max-w-md text-center space-y-6">

        {/* Icon */}
        <div className="flex items-center justify-center">
          <div className="w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center">
            <ShieldX className="w-10 h-10 text-red-400" />
          </div>
        </div>

        {/* Error Code */}
        <div className="space-y-1">
          <p className="text-xs font-mono text-[var(--text-muted)] tracking-widest uppercase">
            Error 403 — Access Denied
          </p>
          <h1 className="text-2xl font-bold tracking-tight">
            Unauthorized Access
          </h1>
        </div>

        {/* Role Context */}
        {user && normalizedRole && (
          <div className="px-4 py-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 text-sm text-left space-y-1">
            <p className="text-[var(--text-muted)] text-xs font-mono uppercase tracking-wide">Current Session</p>
            <p className="font-semibold">{user.displayName || user.email}</p>
            <p className="text-[var(--text-muted)] text-sm">Role: <span className="text-[var(--color-primary)] font-medium">{roleLabel}</span></p>
          </div>
        )}

        {/* Message */}
        <p className="text-[var(--text-muted)] text-sm leading-relaxed">
          {message}
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/50 text-sm font-medium hover:bg-[var(--bg-hover)] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
          <Link
            href={homePath}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--color-primary)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Home className="w-4 h-4" />
            Return to Dashboard
          </Link>
        </div>

        {/* GridFlowX branding footer */}
        <p className="text-[var(--text-muted)] text-xs font-mono pt-2">
          GridFlowX Security Gateway · RBAC Enforced
        </p>
      </div>
    </main>
  );
}
