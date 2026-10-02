"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Clock,
  AlertCircle,
  Activity,
  Cpu,
  ShieldAlert,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Radio,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { subscribeToTicketStatus, type SupportTicketDocument } from "@/services/support.service";

interface LiveTicketTrackerProps {
  docId: string;
  onReset: () => void;
}

const PRIORITY_STYLES = {
  P1_CRITICAL: { label: "P1 Critical Failsafe", bg: "bg-red-500/10", text: "text-red-500", border: "border-red-500/30", icon: ShieldAlert },
  P2_HIGH: { label: "P2 High Priority", bg: "bg-amber-500/10", text: "text-amber-500", border: "border-amber-500/30", icon: AlertCircle },
  P3_NORMAL: { label: "P3 Nominal Queue", bg: "bg-sky-500/10", text: "text-sky-500", border: "border-sky-500/30", icon: Clock },
};

const STATUS_STEPS = [
  { id: "received", label: "Payload Verified", desc: "Diagnostic payload verified by Gateway" },
  { id: "ai_triaged", label: "AI Diagnostic Triage", desc: "Automated root-cause analysis completed" },
  { id: "assigned", label: "Engineer Assigned", desc: "Dispatched to Level 2 On-Call Engineer" },
  { id: "resolved", label: "Anomaly Resolved", desc: "Fix deployed and verified via edge pulse" },
];

export function LiveTicketTracker({ docId, onReset }: LiveTicketTrackerProps) {
  const [ticket, setTicket] = useState<SupportTicketDocument | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToTicketStatus(
      docId,
      (data) => {
        setTicket(data);
        setLoading(false);
      },
      () => {
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [docId]);

  const handleCopyId = () => {
    if (!ticket?.ticketId) return;
    navigator.clipboard.writeText(ticket.ticketId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentStatusIndex = ticket
    ? STATUS_STEPS.findIndex((step) => step.id === ticket.status)
    : 1;

  const priorityStyle = ticket?.priority ? PRIORITY_STYLES[ticket.priority] : PRIORITY_STYLES.P3_NORMAL;
  const PriorityIcon = priorityStyle.icon;

  if (loading && !ticket) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl">
        <Activity size={32} className="animate-spin text-[var(--primary)] mb-4" />
        <p className="text-sm font-semibold text-[var(--text-secondary)]">Connecting to real-time Firestore tracking stream...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden"
    >
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-radial from-[var(--primary)]/10 via-transparent to-transparent pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border-primary)]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-500">Live Tracking Stream</span>
          </div>
          <h3 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-3">
            Ticket {ticket?.ticketId || "GFX-----"}
            <button
              onClick={handleCopyId}
              className="p-1.5 rounded-lg bg-[var(--bg-surface)] hover:bg-[var(--border-primary)]/50 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors text-xs flex items-center gap-1 font-normal"
              title="Copy Ticket ID"
            >
              {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
              {copied && <span className="text-[10px] text-emerald-500 font-bold">Copied</span>}
            </button>
          </h3>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">{ticket?.subject}</p>
        </div>

        {/* Priority Badge */}
        <div className={cn("px-3.5 py-2 rounded-xl border flex items-center gap-2.5 self-start sm:self-center shrink-0", priorityStyle.bg, priorityStyle.border)}>
          <PriorityIcon size={16} className={priorityStyle.text} />
          <div>
            <p className="text-[10px] font-mono uppercase text-[var(--text-muted)] leading-none">Triage Priority</p>
            <p className={cn("text-xs font-bold mt-0.5", priorityStyle.text)}>{priorityStyle.label}</p>
          </div>
        </div>
      </div>

      {/* AI Diagnostic Triage Summary Box */}
      {ticket?.aiTriageSummary && (
        <div className="my-6 p-4 rounded-xl border border-sky-500/30 bg-sky-500/5 flex items-start gap-3.5">
          <div className="p-2 rounded-lg bg-sky-500/10 text-sky-500 shrink-0 mt-0.5">
            <Sparkles size={18} />
          </div>
          <div>
            <p className="text-xs font-bold text-sky-400 font-mono uppercase tracking-wider flex items-center gap-1.5">
              AI Diagnostic Triage Output
            </p>
            <p className="text-sm text-[var(--text-secondary)] mt-1 leading-relaxed">
              {ticket.aiTriageSummary}
            </p>
          </div>
        </div>
      )}

      {/* Live Status Progress Timeline */}
      <div className="py-6">
        <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-muted)] mb-5 flex items-center gap-2">
          <Radio size={14} className="text-[var(--primary)] animate-pulse" /> Dispatch Pipeline Status
        </h4>
        <div className="space-y-4 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[var(--border-primary)]">
          {STATUS_STEPS.map((step, idx) => {
            const isCompleted = idx <= (currentStatusIndex >= 0 ? currentStatusIndex : 1);
            const isCurrent = idx === currentStatusIndex;

            return (
              <div key={step.id} className="flex items-start gap-4 relative z-10">
                <div
                  className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all shrink-0 border",
                    isCompleted
                      ? "bg-[var(--primary)] border-[var(--primary)] text-[var(--bg-base)] shadow-[0_0_12px_var(--val-shadow-primary)]"
                      : "bg-[var(--bg-surface)] border-[var(--border-primary)] text-[var(--text-muted)]"
                  )}
                >
                  {isCompleted ? <Check size={14} /> : idx + 1}
                </div>
                <div className="pt-0.5">
                  <p className={cn("text-sm font-bold flex items-center gap-2", isCompleted ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]")}>
                    {step.label}
                    {isCurrent && (
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[var(--primary)]/15 text-[var(--primary)] animate-pulse">
                        Active State
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Attached Telemetry Snapshot */}
      {ticket?.telemetrySnapshot && (
        <div className="p-4 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-surface)] mt-4">
          <p className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2 flex items-center gap-2">
            <Cpu size={14} className="text-[var(--primary)]" /> Attached Telemetry Vitals
          </p>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-primary)]">
              <span className="text-[10px] font-mono text-[var(--text-muted)] block">Battery SoC</span>
              <span className="text-xs font-bold text-[var(--text-primary)] font-mono">{ticket.telemetrySnapshot.batterySoC}%</span>
            </div>
            <div className="p-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-primary)]">
              <span className="text-[10px] font-mono text-[var(--text-muted)] block">DC Bus Voltage</span>
              <span className="text-xs font-bold text-[var(--text-primary)] font-mono">{ticket.telemetrySnapshot.dcBusVoltage}V</span>
            </div>
            <div className="p-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-primary)]">
              <span className="text-[10px] font-mono text-[var(--text-muted)] block">Core 0 Failsafe</span>
              <span className={cn("text-xs font-bold font-mono", ticket.telemetrySnapshot.core0FailsafeActive ? "text-red-500" : "text-emerald-500")}>
                {ticket.telemetrySnapshot.core0FailsafeActive ? "ACTIVE (TRIP)" : "Nominal"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="mt-8 pt-6 border-t border-[var(--border-primary)] flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-[var(--text-muted)] text-center sm:text-left">
          Status updates are pushed automatically via edge-cloud WebSocket stream.
        </p>
        <button
          type="button"
          onClick={onReset}
          className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-[var(--border-primary)] hover:border-[var(--primary)] hover:bg-[var(--bg-surface)] text-sm font-semibold text-[var(--text-primary)] transition-all flex items-center justify-center gap-2"
        >
          <RotateCcw size={15} /> Submit Another Diagnostic Ticket
        </button>
      </div>
    </motion.div>
  );
}
