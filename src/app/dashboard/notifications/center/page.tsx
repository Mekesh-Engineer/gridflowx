'use client';

import React from 'react';
import { Bell, Trash2, CheckCircle2 } from 'lucide-react';
import { useNotificationsStore } from '@/store/notifications.store';

export default function NotificationsCenterPage() {
  const { notifications, markRead, markAllRead, clearAll } = useNotificationsStore();

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-[1800px] mx-auto w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Notification Center</h1>
          <p className="text-xs text-[var(--text-muted)]">Central alert feed, system events and critical telemetry notifications</p>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={markAllRead} className="px-3 py-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 text-xs font-semibold hover:border-[var(--color-primary)] transition-all">
            Mark All Read
          </button>
          <button onClick={clearAll} className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold hover:bg-red-500/20 transition-all">
            Clear All
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="p-8 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 text-center text-xs text-[var(--text-muted)]">
            No notifications in history.
          </div>
        ) : (
          notifications.map(n => (
            <div key={n.id} onClick={() => markRead(n.id)} className={`p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 flex items-start justify-between gap-4 cursor-pointer ${n.isRead ? 'opacity-50' : 'opacity-100'}`}>
              <div>
                <h3 className="text-sm font-bold text-[var(--text-primary)]">{n.title}</h3>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">{n.message}</p>
                <p className="text-[10px] text-[var(--text-muted)] font-mono mt-1">{n.timestamp}</p>
              </div>
              <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border bg-[var(--bg-base)] border-[var(--border-primary)]/40">
                {n.severity}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
