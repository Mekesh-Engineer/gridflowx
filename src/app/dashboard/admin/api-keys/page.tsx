'use client';

import React, { useState } from 'react';
import { Key, Plus, Trash2, Copy } from 'lucide-react';
import { toast } from 'sonner';

const KEYS = [
  { id: 'KEY-01', name: 'FastAPI Service Key', prefix: 'gfx_live_99a8...', created: '2026-06-01', status: 'ACTIVE' },
  { id: 'KEY-02', name: 'Grafana Telemetry Key', prefix: 'gfx_live_33f1...', created: '2026-07-10', status: 'ACTIVE' },
];

export default function ApiKeysPage() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-[1800px] mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight">API Keys & Webhooks Manager</h1>
          <p className="text-xs text-[var(--text-muted)] font-mono">Generate developer API tokens and configure HMAC webhook delivery endpoints</p>
        </div>

        <button onClick={() => toast.info('New API key generated')} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white text-xs font-semibold hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /> Generate New API Key
        </button>
      </div>

      <div className="space-y-3">
        {KEYS.map(k => (
          <div key={k.id} className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 flex items-center justify-between">
            <div>
              <span className="text-xs font-mono font-bold text-[var(--color-primary)]">{k.id}</span>
              <h3 className="text-sm font-bold text-[var(--text-primary)] mt-0.5">{k.name}</h3>
              <p className="text-xs font-mono text-[var(--text-muted)] mt-1">{k.prefix}</p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-[var(--text-muted)]">Created {k.created}</span>
              <button onClick={() => toast.success('API key copied to clipboard')} className="p-2 rounded-lg bg-[var(--bg-base)] border border-[var(--border-primary)]/40 text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
