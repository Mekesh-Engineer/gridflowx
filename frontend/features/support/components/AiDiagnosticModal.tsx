"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  X,
  AlertTriangle,
  CheckCircle2,
  Wrench,
  Loader2,
  ArrowRight,
  Zap,
} from "lucide-react";

interface AiDiagnosticModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyDiagnosis: (recommendation: {
    inquiryType: "telemetry" | "hardware" | "rbac" | "general";
    subject: string;
    message: string;
  }) => void;
}

interface DiagnosticResult {
  category: "telemetry" | "hardware" | "rbac" | "general";
  categoryLabel: string;
  confidence: number;
  rootCause: string;
  selfHealingSteps: string[];
  firmwareCommand?: string;
  suggestedSubject: string;
  suggestedMessage: string;
}

export function AiDiagnosticModal({ isOpen, onClose, onApplyDiagnosis }: AiDiagnosticModalProps) {
  const [inputLogs, setInputLogs] = useState<string>("");
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [result, setResult] = useState<DiagnosticResult | null>(null);

  const handleAnalyze = () => {
    if (!inputLogs.trim()) return;
    setAnalyzing(true);
    setResult(null);

    setTimeout(() => {
      const lower = inputLogs.toLowerCase();
      let res: DiagnosticResult;

      if (lower.includes("watchdog") || lower.includes("core 0") || lower.includes("relay") || lower.includes("thermal")) {
        res = {
          category: "hardware",
          categoryLabel: "Hardware & Relay Actuation",
          confidence: 96,
          rootCause: "Core 0 Hardware Watchdog Reset triggered due to overcurrent spike (> 15A) during Relay 4 actuation.",
          selfHealingSteps: [
            "Verify physical load shedding status on tier-3 auxiliary circuits.",
            "Check thermal sensor T1 reading via local Modbus status register.",
            "Ensure system input voltage is stable at 24V ± 0.5V DC.",
          ],
          firmwareCommand: "esptool.py --port /dev/ttyUSB0 --baud 115200 reset_watchdog --clear-flags",
          suggestedSubject: "Relay 4 overcurrent / Core 0 Watchdog Reset anomaly",
          suggestedMessage: `Raw Log Sample: "${inputLogs.slice(0, 150)}..."\n\nAI Preliminary Triage: Core 0 Watchdog tripped during relay transition. Requesting level 2 electrical review of tier-3 load circuits.`,
        };
      } else if (lower.includes("jwt") || lower.includes("403") || lower.includes("permission") || lower.includes("claim")) {
        res = {
          category: "rbac",
          categoryLabel: "Access & Authorization (RBAC)",
          confidence: 94,
          rootCause: "Custom JWT claims mismatch or expired token signature during edge-cloud handshake.",
          selfHealingSteps: [
            "Trigger a forced token refresh on the client using `user.getIdToken(true)`.",
            "Verify that the user profile document in `users/{uid}` has \"role\": \"operator\" or \"supervisor\".",
            "Inspect Gateway CORS headers if connecting via external subnet.",
          ],
          suggestedSubject: "403 Authorization Claim Mismatch on Gateway Handshake",
          suggestedMessage: `Raw Error Trace: "${inputLogs.slice(0, 150)}..."\n\nAI Preliminary Triage: JWT custom claim verification failed. Operator role elevation request requires Admin review.`,
        };
      } else if (lower.includes("ws") || lower.includes("socket") || lower.includes("timeout") || lower.includes("1hz")) {
        res = {
          category: "telemetry",
          categoryLabel: "Telemetry Sync & WebSocket Pipeline",
          confidence: 92,
          rootCause: "WebSocket 1Hz heartbeat timeout causing automatic fall-back to HTTP long-polling.",
          selfHealingSteps: [
            "Inspect edge router NAT table and verify TCP keep-alive interval (recommended 15s).",
            "Check local buffer queue depth on ESP32 telemetry sender.",
            "Verify firewall is not blocking outbound WSS port 443.",
          ],
          firmwareCommand: "gridflow-cli telemetry ping --host gateway.gridflowx.local --trace-route",
          suggestedSubject: "WebSocket 1Hz heartbeat disconnects / Telemetry sync jitter",
          suggestedMessage: `Raw Socket Trace: "${inputLogs.slice(0, 150)}..."\n\nAI Preliminary Triage: Edge gateway websocket connection dropping under high packet volume. Requesting buffer optimization.`,
        };
      } else {
        res = {
          category: "general",
          categoryLabel: "General Diagnostics & Configuration",
          confidence: 88,
          rootCause: "General system anomaly or configuration query requiring manual engineering inspection.",
          selfHealingSteps: [
            "Verify edge gateway firmware is updated to version v2.4.1+.",
            "Check global NTP synchronization offset across local cluster nodes.",
          ],
          suggestedSubject: "Diagnostic review request: System configuration check",
          suggestedMessage: `Operator Log Dump: "${inputLogs.slice(0, 200)}..."\n\nAI Preliminary Triage: General system review requested.`,
        };
      }

      setResult(res);
      setAnalyzing(false);
    }, 1200);
  };

  const handleApply = () => {
    if (!result) return;
    onApplyDiagnosis({
      inquiryType: result.category,
      subject: result.suggestedSubject,
      message: result.suggestedMessage,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="p-6 border-b border-[var(--border-primary)] flex items-center justify-between bg-radial from-[var(--primary)]/10 via-transparent to-transparent">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[var(--primary)]/15 text-[var(--primary)] border border-[var(--primary)]/30">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                    AI Diagnostic Copilot
                  </h3>
                  <p className="text-xs text-[var(--text-muted)]">
                    Paste raw stack traces or error logs for instant root-cause analysis & form pre-fill.
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* Input Area */}
              <div className="space-y-2">
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center justify-between">
                  <span>Paste Raw Edge Log / Error Stack</span>
                  <span className="text-[10px] font-normal text-[var(--text-muted)]">Supports ESP32, FreeRTOS & Gateway dumps</span>
                </label>
                <textarea
                  value={inputLogs}
                  onChange={(e) => setInputLogs(e.target.value)}
                  rows={4}
                  placeholder="e.g., [E][main.cpp:142] Watchdog Reset on Core 0. Modbus timeout relay_actuator_4..."
                  className="w-full bg-[var(--bg-surface)] border border-[var(--border-primary)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 rounded-xl p-3 text-xs font-mono text-[var(--text-primary)] resize-none"
                />
                <div className="flex items-center justify-between pt-1">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setInputLogs("[E][esp32_relay.cpp:88] Watchdog Reset Core 0. Overcurrent >16A detected on Relay 4 during peak shedding.")}
                      className="text-[11px] text-[var(--primary)] hover:underline font-mono"
                    >
                      + Sample Hardware Error
                    </button>
                    <span className="text-[var(--text-muted)] font-mono text-[11px]">|</span>
                    <button
                      type="button"
                      onClick={() => setInputLogs("[W][wss_gateway.js:210] 1Hz Heartbeat timed out after 15000ms. Disconnecting socket client_node_eu_4.")}
                      className="text-[11px] text-[var(--primary)] hover:underline font-mono"
                    >
                      + Sample Socket Timeout
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={handleAnalyze}
                    disabled={analyzing || !inputLogs.trim()}
                    className="px-5 py-2 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--text-inverse)] text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5 shadow-[0_0_12px_var(--val-shadow-primary)]"
                  >
                    {analyzing ? (
                      <><Loader2 size={14} className="animate-spin" /> Analyzing Trace...</>
                    ) : (
                      <><Zap size={14} /> Run Triage Analysis</>
                    )}
                  </button>
                </div>
              </div>

              {/* Analysis Results */}
              <AnimatePresence>
                {result && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4 pt-4 border-t border-[var(--border-primary)]"
                  >
                    {/* Category & Confidence Bar */}
                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs font-bold text-[var(--text-primary)]">Inquiry Classification:</span>
                        <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-[var(--primary)]/15 text-[var(--primary)] border border-[var(--primary)]/30">
                          {result.categoryLabel}
                        </span>
                      </div>
                      <span className="text-xs font-mono font-bold text-emerald-500">
                        {result.confidence}% Confidence
                      </span>
                    </div>

                    {/* Root Cause */}
                    <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/30">
                      <p className="text-xs font-bold text-amber-500 font-mono uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <AlertTriangle size={14} /> Probable Root Cause
                      </p>
                      <p className="text-sm text-[var(--text-primary)] leading-relaxed">
                        {result.rootCause}
                      </p>
                    </div>

                    {/* Self-Healing Steps */}
                    <div className="space-y-2">
                      <p className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
                        <Wrench size={14} className="text-[var(--primary)]" /> Immediate Self-Healing Checks
                      </p>
                      <ul className="space-y-1.5">
                        {result.selfHealingSteps.map((step, i) => (
                          <li key={i} className="text-xs text-[var(--text-secondary)] flex items-start gap-2 bg-[var(--bg-surface)] p-2.5 rounded-lg border border-[var(--border-primary)]/50">
                            <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Firmware Command */}
                    {result.firmwareCommand && (
                      <div className="p-3 rounded-xl bg-[var(--bg-base)] border border-[var(--border-primary)] font-mono text-xs">
                        <span className="text-[10px] uppercase text-[var(--text-muted)] block mb-1">Recommended Terminal Command:</span>
                        <code className="text-sky-400 select-all">{result.firmwareCommand}</code>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer Actions */}
            <div className="p-5 border-t border-[var(--border-primary)] bg-[var(--bg-surface)] flex items-center justify-between">
              <span className="text-xs text-[var(--text-muted)]">
                {result ? "Ready to auto-populate ticket details?" : "Paste logs and run triage to proceed."}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-[var(--border-primary)] text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-card)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!result}
                  onClick={handleApply}
                  className="px-5 py-2 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--text-inverse)] text-xs font-bold transition-all disabled:opacity-40 flex items-center gap-1.5 shadow-[0_0_12px_var(--val-shadow-primary)]"
                >
                  <span>Auto-Fill & Attach to Ticket</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
