"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Mail,
  HelpCircle,
  Wrench,
  Shield,
  AlertCircle,
  Loader2,
  Sparkles,
  Server,
  Activity,
  Cpu,
  DatabaseZap,
  Terminal,
  Paperclip,
  Zap,
  Check,
  RotateCcw,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { Container } from "@/components/shared/container";
import { SectionHeader } from "@/components/shared/section-header";
import { cn } from "@/lib/utils";
import { useMotionConfig } from "@/hooks/use-motion-config";
import { useAuthStore } from "@/store/zustand/stores";
import { UserRole } from "@/lib/constants";
import { submitSupportTicket, uploadDiagnosticFile, type SupportTicketPayload } from "@/services/support.service";
import { LiveTicketTracker } from "@/features/support/components/LiveTicketTracker";
import { AiDiagnosticModal } from "@/features/support/components/AiDiagnosticModal";
import { DiagnosticDropzone, type AttachedFileItem } from "@/features/support/components/DiagnosticDropzone";

// ============================================================================
// Schema & Types
// ============================================================================

const supportSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  role: z.nativeEnum(UserRole, { errorMap: () => ({ message: "Invalid role selected" }) }),
  inquiryType: z.enum(["telemetry", "hardware", "rbac", "general"]),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(15, "Please provide more detail (minimum 15 characters)"),
  attachDiagnostics: z.boolean(),
});

type SupportFormValues = z.infer<typeof supportSchema>;

// ============================================================================
// Domain Data & Constants
// ============================================================================

const ROLES = [
  { id: UserRole.OPERATOR, label: "Operator", icon: Terminal, description: "Edge routing & overrides" },
  { id: UserRole.SUPERVISOR, label: "Supervisor", icon: Activity, description: "System monitoring" },
  { id: UserRole.ADMIN, label: "Admin", icon: Shield, description: "Thresholds & access" },
  { id: UserRole.AUDITOR, label: "Auditor", icon: DatabaseZap, description: "Compliance & logs" },
];

const INQUIRY_TYPES = [
  {
    id: "telemetry" as const,
    title: "Telemetry Sync Issue",
    description: "WebSocket disconnects or delayed 1Hz data updates",
    icon: Activity,
    color: "text-sky-500",
    bg: "bg-sky-500/10",
    border: "border-sky-500/30",
    activeRing: "focus:border-sky-500 focus:ring-sky-500/20",
    cardBorder: "border-sky-500/40 shadow-[0_0_20px_rgba(14,165,233,0.15)]",
  },
  {
    id: "hardware" as const,
    title: "Hardware Diagnostics",
    description: "Relay failures, thermal anomalies, or overcurrent trips",
    icon: Cpu,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    activeRing: "focus:border-amber-500 focus:ring-amber-500/20",
    cardBorder: "border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.15)]",
  },
  {
    id: "rbac" as const,
    title: "Access & Authorization",
    description: "JWT claims, permission denied, or role elevation",
    icon: Shield,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    border: "border-purple-500/30",
    activeRing: "focus:border-purple-500 focus:ring-purple-500/20",
    cardBorder: "border-purple-500/40 shadow-[0_0_20px_rgba(168,85,247,0.15)]",
  },
  {
    id: "general" as const,
    title: "General Support",
    description: "Dashboard usage, export logs, or account inquiries",
    icon: HelpCircle,
    color: "text-[var(--primary)]",
    bg: "bg-[var(--primary)]/10",
    border: "border-[var(--primary)]/30",
    activeRing: "focus:border-[var(--primary)] focus:ring-[var(--primary)]/20",
    cardBorder: "border-[var(--primary)]/40 shadow-[0_0_20px_var(--val-shadow-primary)]",
  },
];

const FAQ_DATA = [
  { question: "Why did my manual relay override fail?", answer: "Overrides require Operator or Admin privileges. If the system is in an active thermal or overcurrent failsafe state (Core 0), the hardware will reject manual overrides to prevent physical damage.", category: "Hardware" },
  { question: "How long are telemetry logs stored?", answer: "High-frequency 1Hz telemetry is downsampled and aggregated daily. Raw logs are kept in Firestore for 30 days, while daily aggregations are stored indefinitely.", category: "Data" },
  { question: "Can I adjust the < 10ms failsafe thresholds?", answer: "No. The < 10ms failsafe limits are hardcoded into the ESP32 FreeRTOS Core 0 firmware. Only soft-shedding limits (e.g., shedding Tier 3 loads at 30% SoC) can be adjusted in the Admin configuration.", category: "Safety" },
  { question: "How does the WebSocket fallback mechanism work?", answer: "If the 1Hz WebSocket heartbeat drops 3 consecutive pings, the edge gateway automatically falls back to secure HTTPS long-polling over TLS 1.3 while attempting background socket reconnection.", category: "Pipeline" },
];

const DRAFT_STORAGE_KEY = "gridflowx_support_draft_v1";

// ============================================================================
// Components
// ============================================================================

function FAQAccordionItem({ item, isOpen, onToggle, index }: { item: typeof FAQ_DATA[0], isOpen: boolean, onToggle: () => void, index: number }) {
  const { shouldAnimate, transitions } = useMotionConfig();

  return (
    <motion.div
      initial={shouldAnimate ? { opacity: 0, y: 10 } : { opacity: 0 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="border border-[var(--border-primary)] rounded-xl overflow-hidden bg-[var(--bg-card)] transition-colors hover:border-[var(--primary)]/40"
    >
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between p-5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[var(--primary)] bg-[var(--primary)]/10 border border-[var(--primary)]/20 px-2 py-1 rounded-md">
            {item.category}
          </span>
          <h4 className="text-[var(--text-primary)] font-semibold text-sm">{item.question}</h4>
        </div>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={transitions.snappy}>
          <div className="w-5 h-5 rounded-full flex items-center justify-center bg-[var(--bg-surface)] text-[var(--text-muted)]">
            ↓
          </div>
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={transitions.snappy}
            className="overflow-hidden"
          >
            <p className="px-5 pb-5 pt-2 text-[var(--text-secondary)] text-sm leading-relaxed border-t border-[var(--border-primary)]/50 mt-2">
              {item.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function ContactPage() {
  const { user, isAuthenticated } = useAuthStore();
  const [openFAQ, setOpenFAQ] = useState<number | null>(0);
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFileItem[]>([]);
  const [submittedTicketId, setSubmittedTicketId] = useState<string | null>(null);
  const [hasDraft, setHasDraft] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SupportFormValues>({
    resolver: zodResolver(supportSchema),
    defaultValues: {
      role: UserRole.OPERATOR,
      inquiryType: "general",
      attachDiagnostics: true,
      subject: "",
      message: "",
    },
  });

  const selectedRole = watch("role");
  const selectedInquiry = watch("inquiryType");
  const currentSubject = watch("subject");
  const currentMessage = watch("message");

  const currentTypeMeta = INQUIRY_TYPES.find((t) => t.id === selectedInquiry) || INQUIRY_TYPES[3];

  // Hydrate form if user is logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      setValue("name", user.displayName || `${user.firstName || ""} ${user.lastName || ""}`.trim());
      setValue("email", user.email || "");
      if (user.role) setValue("role", user.role);
    }
  }, [isAuthenticated, user, setValue]);

  // Check for local draft on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.subject || parsed.message) {
          setValue("subject", parsed.subject || "");
          setValue("message", parsed.message || "");
          if (parsed.inquiryType) setValue("inquiryType", parsed.inquiryType);
          setHasDraft(true);
        }
      }
    } catch {
      // ignore JSON errors
    }
  }, [setValue]);

  // Debounced save to local storage
  useEffect(() => {
    if (!currentSubject && !currentMessage) return;
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(
          DRAFT_STORAGE_KEY,
          JSON.stringify({
            subject: currentSubject,
            message: currentMessage,
            inquiryType: selectedInquiry,
          })
        );
      } catch {
        // ignore storage errors
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [currentSubject, currentMessage, selectedInquiry]);

  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      setValue("subject", "");
      setValue("message", "");
      setHasDraft(false);
    } catch {
      // ignore
    }
  }, [setValue]);

  const handleApplyDiagnosis = (rec: {
    inquiryType: "telemetry" | "hardware" | "rbac" | "general";
    subject: string;
    message: string;
  }) => {
    setValue("inquiryType", rec.inquiryType);
    setValue("subject", rec.subject);
    setValue("message", rec.message);
  };

  const onSubmit = async (data: SupportFormValues) => {
    try {
      // Generate simulated telemetry snapshot if requested
      const telemetrySnapshot = data.attachDiagnostics
        ? {
            batterySoC: 84,
            dcBusVoltage: 24.2,
            core0FailsafeActive: data.inquiryType === "hardware",
            gatewayLatencyMs: 12,
            timestamp: new Date().toISOString(),
          }
        : null;

      // Submit ticket document to Firestore
      const payload: SupportTicketPayload = {
        name: data.name,
        email: data.email,
        role: data.role,
        inquiryType: data.inquiryType,
        subject: data.subject,
        message: data.message,
        attachDiagnostics: data.attachDiagnostics,
        telemetrySnapshot,
      };

      const ticketDoc = await submitSupportTicket(payload);

      // Upload files if any
      if (attachedFiles.length > 0) {
        for (const item of attachedFiles) {
          try {
            await uploadDiagnosticFile(ticketDoc.id, item.file);
          } catch (uploadErr) {
            console.error(`Failed to upload ${item.name}`, uploadErr);
          }
        }
      }

      // Clear local storage draft upon success
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      setHasDraft(false);
      setSubmittedTicketId(ticketDoc.id);
    } catch (error) {
      console.error("Error submitting support ticket:", error);
    }
  };

  return (
    <main className="min-h-screen pt-32 pb-20 bg-[var(--bg-base)] text-[var(--text-body)] font-sans selection:bg-[var(--primary)]/20 selection:text-[var(--primary)]">
      <Container>
        {/* Real-Time System Health Ticker */}
        <div className="max-w-5xl mx-auto mb-10">
          <div className="bg-[var(--bg-card)]/80 backdrop-blur-md border border-[var(--border-primary)] rounded-2xl p-3 px-5 shadow-sm flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
            <div className="flex items-center gap-3">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span className="font-bold text-[var(--text-primary)]">Global API Gateway: Operational</span>
              <span className="text-[var(--text-muted)] hidden sm:inline">|</span>
              <span className="text-emerald-500 hidden sm:inline">Latency: 12ms (TLS 1.3)</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[var(--text-secondary)]">Core 0 Failsafe Relay: <strong className="text-emerald-500">Nominal</strong></span>
              <span className="text-[var(--text-muted)] hidden md:inline">|</span>
              <span className="text-[var(--text-secondary)] hidden md:inline">Active Substation Shards: <strong className="text-[var(--text-primary)]">48</strong></span>
            </div>
          </div>
        </div>

        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-14">
          <SectionHeader
            eyebrow="GridFlowX Level 2 Support"
            align="center"
            title={
              <>
                System <span className="text-[var(--primary)]">Diagnostics</span> & Engineering Dispatch
              </>
            }
            description="Submit a secure diagnostic ticket directly to the engineering queue. Attach edge telemetry snapshots or run our instant AI Triage Copilot for immediate self-healing resolution."
          />
        </div>

        {/* Bento Grid Layout */}
        <div className="grid lg:grid-cols-12 gap-8 max-w-6xl mx-auto">
          {/* Left Column (65%): Form / Live Tracker */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {submittedTicketId ? (
                <LiveTicketTracker
                  key="tracker"
                  docId={submittedTicketId}
                  onReset={() => {
                    setSubmittedTicketId(null);
                    setAttachedFiles([]);
                    reset();
                  }}
                />
              ) : (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={cn(
                    "bg-[var(--bg-card)] border rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden transition-all duration-500",
                    currentTypeMeta.cardBorder
                  )}
                >
                  {/* Draft Alert */}
                  {hasDraft && (
                    <div className="mb-6 p-3 rounded-xl bg-[var(--primary)]/10 border border-[var(--primary)]/30 flex items-center justify-between text-xs">
                      <span className="text-[var(--text-primary)] font-medium flex items-center gap-2">
                        <RotateCcw size={14} className="text-[var(--primary)] animate-spin-once" />
                        Draft recovered from your previous session.
                      </span>
                      <button
                        type="button"
                        onClick={clearDraft}
                        className="text-[var(--text-muted)] hover:text-red-500 font-semibold transition-colors"
                      >
                        Discard Draft
                      </button>
                    </div>
                  )}

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
                    {/* Role Selector */}
                    <fieldset className="space-y-3">
                      <legend className="text-sm font-medium text-[var(--text-secondary)] flex items-center gap-2">
                        <Shield size={14} className="text-[var(--primary)]" /> Operator Authorization Level
                      </legend>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        {ROLES.map((role) => (
                          <label
                            key={role.id}
                            className={cn(
                              "cursor-pointer flex flex-col items-center gap-2 p-3 rounded-xl border transition-all text-center",
                              selectedRole === role.id
                                ? "bg-[var(--primary)]/15 border-[var(--primary)] text-[var(--primary)] shadow-sm font-bold"
                                : "bg-[var(--bg-surface)] border-[var(--border-primary)] text-[var(--text-muted)] hover:border-[var(--primary)]/50"
                            )}
                          >
                            <input type="radio" value={role.id} {...register("role")} className="sr-only" disabled={isAuthenticated} />
                            <role.icon size={18} />
                            <span className="text-xs">{role.label}</span>
                          </label>
                        ))}
                      </div>
                    </fieldset>

                    {/* Identity Inputs */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-[var(--text-secondary)]">Operator Name</label>
                        <input
                          {...register("name")}
                          disabled={isAuthenticated}
                          className={cn(
                            "w-full bg-[var(--bg-surface)] border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-all disabled:opacity-50",
                            errors.name ? "border-red-500 focus:ring-red-500/20" : cn("border-[var(--border-primary)]", currentTypeMeta.activeRing)
                          )}
                        />
                        {errors.name && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.name.message}</p>}
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-[var(--text-secondary)]">Secure Dispatch Email</label>
                        <input
                          {...register("email")}
                          disabled={isAuthenticated}
                          type="email"
                          className={cn(
                            "w-full bg-[var(--bg-surface)] border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-all disabled:opacity-50",
                            errors.email ? "border-red-500 focus:ring-red-500/20" : cn("border-[var(--border-primary)]", currentTypeMeta.activeRing)
                          )}
                        />
                        {errors.email && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.email.message}</p>}
                      </div>
                    </div>

                    {/* Diagnostic Category */}
                    <fieldset className="space-y-3 pt-2 border-t border-[var(--border-primary)]/50">
                      <legend className="text-sm font-medium text-[var(--text-secondary)] flex items-center gap-2">
                        <Server size={14} className="text-[var(--primary)]" /> Diagnostic Category
                      </legend>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {INQUIRY_TYPES.map((type) => (
                          <label
                            key={type.id}
                            className={cn(
                              "cursor-pointer flex items-start gap-3 p-3.5 rounded-xl border transition-all relative overflow-hidden",
                              selectedInquiry === type.id
                                ? cn("bg-[var(--bg-surface)] shadow-sm font-semibold", type.border)
                                : "bg-[var(--bg-surface)] border-[var(--border-primary)] hover:border-[var(--primary)]/40"
                            )}
                          >
                            <input type="radio" value={type.id} {...register("inquiryType")} className="sr-only" />
                            <div className={cn("p-2 rounded-lg shrink-0", type.bg, type.color)}>
                              <type.icon size={16} />
                            </div>
                            <div>
                              <p className={cn("text-xs font-bold", selectedInquiry === type.id ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]")}>
                                {type.title}
                              </p>
                              <p className="text-[10px] text-[var(--text-muted)] mt-0.5 leading-tight">{type.description}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </fieldset>

                    {/* Message & Subject */}
                    <div className="space-y-4 pt-2 border-t border-[var(--border-primary)]/50">
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-[var(--text-secondary)]">Ticket Subject</label>
                        <input
                          {...register("subject")}
                          placeholder="e.g., Relay 4 overcurrent trip during peak battery shedding"
                          className={cn(
                            "w-full bg-[var(--bg-surface)] border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-all",
                            errors.subject ? "border-red-500 focus:ring-red-500/20" : cn("border-[var(--border-primary)]", currentTypeMeta.activeRing)
                          )}
                        />
                        {errors.subject && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.subject.message}</p>}
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-[var(--text-secondary)]">Diagnostic Details & Observed Anomaly</label>
                        <textarea
                          {...register("message")}
                          rows={4}
                          placeholder="Describe the exact sequence of events, error codes, or anomalies observed across the telemetry pipeline..."
                          className={cn(
                            "w-full bg-[var(--bg-surface)] border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-all resize-none",
                            errors.message ? "border-red-500 focus:ring-red-500/20" : cn("border-[var(--border-primary)]", currentTypeMeta.activeRing)
                          )}
                        />
                        {errors.message && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.message.message}</p>}
                      </div>
                    </div>

                    {/* Multi-File Diagnostic Dropzone */}
                    <div className="pt-2 border-t border-[var(--border-primary)]/50">
                      <label className="text-sm font-medium text-[var(--text-secondary)] block mb-2">Attach Diagnostic Artifacts (Optional)</label>
                      <DiagnosticDropzone files={attachedFiles} onFilesChange={setAttachedFiles} />
                    </div>

                    {/* Attach Active Telemetry State Checkbox */}
                    <label className="flex items-start gap-3.5 p-4 border border-[var(--border-primary)] bg-[var(--bg-surface)] rounded-xl cursor-pointer hover:border-[var(--primary)]/50 transition-colors">
                      <div className="relative flex items-center justify-center mt-0.5">
                        <input type="checkbox" {...register("attachDiagnostics")} className="peer sr-only" />
                        <div className="w-5 h-5 border-2 border-[var(--text-muted)] rounded peer-checked:bg-[var(--primary)] peer-checked:border-[var(--primary)] transition-colors flex items-center justify-center">
                          <Check size={12} className="text-[var(--bg-base)] opacity-0 peer-checked:opacity-100" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
                          <Paperclip size={14} className="text-[var(--primary)]" /> Attach Active Substation Telemetry Snapshot
                        </p>
                        <p className="text-xs text-[var(--text-muted)] mt-0.5">
                          Automatically bundles current battery SoC (84%), edge failsafe status, and 24V DC bus voltage into the ticket metadata.
                        </p>
                      </div>
                    </label>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full flex items-center justify-center gap-2.5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--text-inverse)] py-4 rounded-xl font-bold transition-all disabled:opacity-70 shadow-[0_0_20px_var(--val-shadow-primary)] active:scale-[0.99]"
                    >
                      {isSubmitting ? (
                        <><Loader2 size={18} className="animate-spin" /> Writing Ticket & Uploading Diagnostics...</>
                      ) : (
                        <><Terminal size={18} /> Submit Diagnostic Ticket to Level 2 Queue</>
                      )}
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Column (35%): AI Copilot, Direct Contact & FAQ */}
          <div className="lg:col-span-5 space-y-6">
            {/* AI Copilot Quick Trigger Card */}
            <div className="bg-gradient-to-br from-[var(--primary)]/15 via-[var(--primary)]/5 to-transparent border border-[var(--primary)]/40 rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-xl group">
              <div className="absolute -right-6 -top-6 w-32 h-32 bg-[var(--primary)]/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 rounded-xl bg-[var(--primary)] text-[var(--text-inverse)] shadow-md">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[var(--text-primary)] leading-tight">AI Diagnostic Copilot</h3>
                  <p className="text-xs font-mono text-[var(--primary)] font-bold uppercase tracking-wider">Instant Error Triage</p>
                </div>
              </div>
              <p className="text-sm text-[var(--text-secondary)] mb-6 leading-relaxed">
                Before submitting a ticket, paste raw ESP32, FreeRTOS, or Gateway stack traces. Our AI engine performs instant heuristic root-cause triage and auto-populates your ticket.
              </p>
              <button
                type="button"
                onClick={() => setIsAiModalOpen(true)}
                className="w-full py-3 px-5 rounded-xl bg-[var(--bg-card)] hover:bg-[var(--bg-surface)] border border-[var(--primary)]/50 text-[var(--text-primary)] font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-sm group-hover:border-[var(--primary)]"
              >
                <Zap size={15} className="text-amber-400" /> Open AI Triage Copilot
              </button>
            </div>

            {/* Direct Contact / Level 2 Dispatch Card */}
            <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl p-6 md:p-8 shadow-sm">
              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2 flex items-center gap-2">
                <ShieldAlert size={18} className="text-red-500" /> Level 2 Emergency Dispatch
              </h3>
              <p className="text-sm text-[var(--text-secondary)] mb-6">
                Critical substation thermal alerts or Core 0 hardware failsafes must be reported immediately.
              </p>
              <a
                href="mailto:sysadmin@gridflowx.local"
                className="flex items-center justify-between p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)] hover:border-[var(--primary)] transition-all group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-lg bg-[var(--bg-card)] border border-[var(--border-primary)] flex items-center justify-center text-[var(--text-muted)] group-hover:text-[var(--primary)] transition-colors">
                    <Mail size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase">On-Call SysAdmin Dispatch</p>
                    <p className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--primary)] transition-colors">
                      sysadmin@gridflowx.local
                    </p>
                  </div>
                </div>
                <ArrowRight size={16} className="text-[var(--text-muted)] group-hover:text-[var(--primary)] group-hover:translate-x-1 transition-all" />
              </a>
            </div>

            {/* Architecture FAQs */}
            <div>
              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4 mt-6 flex items-center gap-2">
                <Wrench size={18} className="text-[var(--primary)]" /> Architecture & Safety FAQ
              </h3>
              <div className="space-y-3">
                {FAQ_DATA.map((item, idx) => (
                  <FAQAccordionItem
                    key={idx}
                    item={item}
                    index={idx}
                    isOpen={openFAQ === idx}
                    onToggle={() => setOpenFAQ(openFAQ === idx ? null : idx)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* AI Diagnostic Modal */}
      <AiDiagnosticModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onApplyDiagnosis={handleApplyDiagnosis}
      />
    </main>
  );
}