// src/app/(public)/landing/Navbar/NotificationsDropdown.tsx
"use client";

import React, { useEffect, useRef } from 'react';
import { motion, Variants } from 'framer-motion';
import { Check, Info, AlertTriangle, Bell, ExternalLink, SlidersHorizontal } from 'lucide-react';

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'success' | 'info' | 'warning';
}

interface NotificationsDropdownProps {
  notifications: Notification[];
  onClose: () => void;
  onMarkAllRead: () => void;
}

const dropPanelVariants: Variants = {
  hidden: { opacity: 0, y: 12, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, y: 8, scale: 0.99, transition: { duration: 0.15, ease: "easeIn" } }
};

export const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({
  notifications,
  onClose,
  onMarkAllRead,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const unreadAlertsCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleKeyActions = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyActions);
    dropdownRef.current?.focus();
    return () => window.removeEventListener('keydown', handleKeyActions);
  }, [onClose]);

  const retrieveAlertAssets = (type: Notification['type'], isUnread: boolean) => {
    const assets = {
      success: { icon: <Check size={14} className="text-[var(--color-primary)]" />, bg: "bg-[var(--color-primary-faint)] text-[var(--color-primary)]", border: isUnread ? "border-l-[var(--color-primary)]" : "border-l-transparent" },
      warning: { icon: <AlertTriangle size={14} className="text-amber-500" />, bg: "bg-amber-500/10 text-amber-500", border: isUnread ? "border-l-amber-500" : "border-l-transparent" },
      info: { icon: <Info size={14} className="text-[var(--color-secondary)]" />, bg: "bg-[var(--color-secondary-faint)] text-[var(--color-secondary)]", border: isUnread ? "border-l-[var(--color-secondary)]" : "border-l-transparent" }
    };
    return assets[type] || assets.info;
  };

  return (
    <motion.div
      ref={dropdownRef}
      tabIndex={-1}
      variants={dropPanelVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="absolute right-0 mt-3 w-[420px] max-w-[calc(100vw-32px)] bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl shadow-2xl overflow-hidden z-50 backdrop-blur-xl focus:outline-hidden"
      role="dialog"
      aria-modal="true"
      aria-label="GridFlowX System Operational Alerts Hub"
    >
      {/* Header Container Area Block */}
      <div className="p-4 border-b border-[var(--border-primary)] bg-[var(--bg-card)] flex items-center justify-between select-none">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-foreground/[0.03] border border-foreground/5 text-[var(--text-primary)]">
            <Bell size={14} />
          </div>
          <div>
            <h3 className="text-xs font-bold tracking-tight text-[var(--text-primary)]">Operational Metrics</h3>
            <p className="text-[9px] font-mono font-bold text-[var(--text-muted)] uppercase tracking-wider mt-0.5">Live Monitors</p>
          </div>
          {unreadAlertsCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[var(--color-primary-faint)] text-[var(--color-primary)] border border-[var(--color-primary)]/10 animate-pulse">
              {unreadAlertsCount} NEW
            </span>
          )}
        </div>
        {unreadAlertsCount > 0 && (
          <button
            onClick={onMarkAllRead}
            className="text-xs text-[var(--color-primary)] hover:text-[var(--color-primary-focus)] font-bold transition-all hover:-translate-y-0.5 cursor-pointer focus:outline-hidden focus:underline"
          >
            Mark all read
          </button>
        )}
      </div>

      {/* Main Alerts Feed Track List Container */}
      <div className="max-h-[320px] overflow-y-auto divide-y divide-[var(--border-primary)] bg-gradient-to-b from-transparent to-foreground/[0.005]">
        {notifications.length === 0 ? (
          <div className="p-10 text-center flex flex-col items-center justify-center space-y-2 select-none">
            <div className="w-9 h-9 rounded-full bg-foreground/[0.02] border border-foreground/5 flex items-center justify-center text-[var(--text-muted)]">
              <SlidersHorizontal size={14} className="opacity-50" />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-[var(--text-secondary)]">Telemetry Stream Nominal</p>
              <p className="text-[11px] text-[var(--text-muted)]">No active threshold variations recorded.</p>
            </div>
          </div>
        ) : (
          notifications.map((n) => {
            const config = retrieveAlertAssets(n.type, !n.read);
            return (
              <div
                key={n.id}
                className={`p-4 hover:bg-[var(--bg-hover)] border-l-2 transition-all duration-200 flex items-start gap-3.5 focus-within:bg-[var(--bg-hover)] relative group cursor-pointer ${config.border} ${
                  !n.read ? 'bg-[var(--color-primary)]/[0.005]' : ''
                }`}
                role="article"
                tabIndex={0}
              >
                {!n.read && (
                  <span className="absolute top-4 right-4 w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] ring-4 ring-[var(--color-primary)]/5" />
                )}
                <div className={`w-8 h-8 shrink-0 rounded-xl border border-foreground/5 flex items-center justify-center shadow-2xs transition-transform duration-200 group-hover:scale-105 ${config.bg}`}>
                  {config.icon}
                </div>
                <div className="flex-1 min-w-0 space-y-1 pr-2">
                  <div className="flex items-start justify-between gap-4">
                    <h4 className={`text-xs font-bold leading-tight tracking-tight ${!n.read ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
                      {n.title}
                    </h4>
                    <span className="text-[10px] font-mono text-[var(--text-muted)] whitespace-nowrap shrink-0 select-none">{n.time}</span>
                  </div>
                  <p className="text-[11px] text-[var(--text-muted)] leading-relaxed font-medium">
                    {n.message}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Interface Operational Panel Layer Block */}
      <div className="p-2.5 bg-foreground/[0.01] border-t border-[var(--border-primary)] flex items-center justify-center select-none">
        <button
          onClick={onClose}
          className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1.5 py-1.5 px-4 rounded-lg hover:bg-foreground/[0.02] transition-colors focus:outline-hidden"
        >
          View All Activity Logs <ExternalLink size={11} className="opacity-60" />
        </button>
      </div>
    </motion.div>
  );
};