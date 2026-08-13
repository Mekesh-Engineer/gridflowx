"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
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
  PhoneCall,
  MapPin,
  Clock,
  Search,
  ThumbsUp,
  ThumbsDown,
  Globe,
  Radio,
  Share2,
  Lock,
  Layers,
  FileCode,
  CheckCircle2,
} from "lucide-react";
import {
  IconBrandGithub,
  IconBrandLinkedin,
  IconBrandDiscord,
  IconBrandYoutube,
  IconBrandX,
} from "@tabler/icons-react";
import { Container } from "@/components/shared/container";
import { SectionHeader } from "@/components/shared/section-header";
import { cn } from "@/lib/utils";
import { useMotionConfig } from "@/hooks/use-motion-config";
import { useAuthStore } from "@/store/auth.store";
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
  { 
    id: UserRole.OPERATOR, 
    label: "Operator", 
    icon: Terminal, 
    description: "Edge routing, manual overrides & telemetry logs",
    permission: "Read / Actuate Tier 3"
  },
  { 
    id: UserRole.SUPERVISOR, 
    label: "Supervisor", 
    icon: Activity, 
    description: "Substation monitoring & load shedding triggers",
    permission: "Read / Write Shed Rules"
  },
  { 
    id: UserRole.ADMIN, 
    label: "Admin", 
    icon: Shield, 
    description: "Failsafe thresholds, RBAC & system parameters",
    permission: "Full Core 0 Configuration"
  },
  { 
    id: UserRole.AUDITOR, 
    label: "Auditor", 
    icon: DatabaseZap, 
    description: "Compliance auditing & immutable event logs",
    permission: "Read-Only Compliance Logs"
  },
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
  { id: "faq-1", question: "Why did my manual relay override fail?", answer: "Overrides require Operator or Admin privileges. If the system is in an active thermal or overcurrent failsafe state (Core 0), the hardware will reject manual overrides to prevent physical damage.", category: "Hardware" },
  { id: "faq-2", question: "How long are telemetry logs stored?", answer: "High-frequency 1Hz telemetry is downsampled and aggregated daily. Raw logs are kept in Firestore for 30 days, while daily aggregations are stored indefinitely.", category: "Data" },
  { id: "faq-3", question: "Can I adjust the < 10ms failsafe thresholds?", answer: "No. The < 10ms failsafe limits are hardcoded into the ESP32 FreeRTOS Core 0 firmware. Only soft-shedding limits (e.g., shedding Tier 3 loads at 30% SoC) can be adjusted in the Admin configuration.", category: "Safety" },
  { id: "faq-4", question: "How does the WebSocket fallback mechanism work?", answer: "If the 1Hz WebSocket heartbeat drops 3 consecutive pings, the edge gateway automatically falls back to secure HTTPS long-polling over TLS 1.3 while attempting background socket reconnection.", category: "Pipeline" },
  { id: "faq-5", question: "What should I do if I receive a 403 Forbidden on elevation?", answer: "Ensure your JWT custom claims are synced with your Firestore user profile. If you recently elevated roles, log out and log back in to trigger a token refresh.", category: "RBAC" },
  { id: "faq-6", question: "How are attachments handled during ticket dispatch?", answer: "Diagnostic logs and screenshots attached to your ticket are encrypted and uploaded to Firebase Storage. Direct download URLs are appended to the ticket payload for engineer inspection.", category: "Data" },
];

const CONTACT_CHANNELS = [
  {
    title: "Level 2 Emergency Dispatch",
    subtitle: "P1 Critical Failsafes & On-Call Engineering",
    email: "mekesh.engineer@gmail.com",
    phone: "+1 (800) 474-3356",
    sla: "< 15 Mins SLA",
    icon: ShieldAlert,
    iconColor: "text-red-500",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    badge: "24/7 EMERGENCY",
  },
  {
    title: "Global Engineering HQ & Lab",
    subtitle: "GridFlowX Hardware & Systems Division",
    email: "sysadmin@gridflowx.local",
    location: "Building 4, Microgrid Innovation Park, Silicon Valley, CA",
    hours: "Continuous NOC Operations",
    icon: MapPin,
    iconColor: "text-emerald-500",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    badge: "GLOBAL HQ",
  },
  {
    title: "AI Triage & Firmware Copilot",
    subtitle: "Heuristic Stack Trace Analysis & Pre-fill",
    actionText: "Run Instant AI Triage",
    icon: Sparkles,
    iconColor: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    badge: "AUTOMATED",
    isAi: true,
  },
];

const SOCIAL_LINKS = [
  { name: "GitHub", href: "https://github.com/gridflowx", icon: IconBrandGithub, color: "hover:text-white hover:bg-zinc-800" },
  { name: "LinkedIn", href: "https://linkedin.com", icon: IconBrandLinkedin, color: "hover:text-sky-400 hover:bg-sky-500/10" },
  { name: "Discord", href: "https://discord.gg", icon: IconBrandDiscord, color: "hover:text-indigo-400 hover:bg-indigo-500/10" },
  { name: "YouTube", href: "https://youtube.com", icon: IconBrandYoutube, color: "hover:text-red-500 hover:bg-red-500/10" },
  { name: "X (Twitter)", href: "https://x.com", icon: IconBrandX, color: "hover:text-cyan-400 hover:bg-cyan-500/10" },
];

const DRAFT_STORAGE_KEY = "gridflowx_support_draft_v1";

// Floating Particles Configuration
const BACKGROUND_PARTICLES = [
  { top: "12%", left: "15%", duration: 9, delay: 0 },
  { top: "28%", left: "80%", duration: 11, delay: 1 },
  { top: "60%", left: "25%", duration: 8, delay: 0.5 },
  { top: "82%", left: "70%", duration: 13, delay: 2 },
  { top: "45%", left: "88%", duration: 10, delay: 1.5 },
];

// ============================================================================
// Sub-Components
// ============================================================================

function FAQAccordionItem({
  item,
  isOpen,
  onToggle,
  index,
  onVote,
  voted,
}: {
  item: typeof FAQ_DATA[0];
  isOpen: boolean;
  onToggle: () => void;
  index: number;
  onVote: (id: string, type: "up" | "down") => void;
  voted: "up" | "down" | null;
}) {
  const { shouldAnimate, transitions } = useMotionConfig();

  return (
    <motion.div
      initial={shouldAnimate ? { opacity: 0, y: 10 } : { opacity: 0 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="border border-[var(--border-primary)] rounded-xl overflow-hidden bg-[var(--bg-card)] transition-colors hover:border-[var(--primary)]/40 shadow-sm"
    >
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between p-5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] group"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3.5 min-w-0 pr-4">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[var(--primary)] bg-[var(--primary)]/10 border border-[var(--primary)]/20 px-2.5 py-1 rounded-md shrink-0">
            {item.category}
          </span>
          <h4 className="text-[var(--text-primary)] font-semibold text-sm group-hover:text-[var(--primary)] transition-colors truncate">
            {item.question}
          </h4>
        </div>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={transitions.snappy} className="shrink-0">
          <div className="w-6 h-6 rounded-full flex items-center justify-center bg-[var(--bg-surface)] border border-[var(--border-primary)] text-[var(--text-muted)] group-hover:border-[var(--primary)]/50 group-hover:text-[var(--primary)] transition-colors">
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
            <div className="px-5 pb-5 pt-2 border-t border-[var(--border-primary)]/50 mt-1 space-y-4">
              <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                {item.answer}
              </p>
              
              {/* Helpful Voting Bar */}
              <div className="flex items-center justify-between pt-3 border-t border-[var(--border-primary)]/30 text-xs font-mono">
                <span className="text-[var(--text-muted)]">Was this article helpful?</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onVote(item.id, "up");
                    }}
                    className={cn(
                      "px-2.5 py-1 rounded-lg border flex items-center gap-1.5 transition-all text-xs font-semibold",
                      voted === "up"
                        ? "bg-emerald-500/20 border-emerald-500 text-emerald-400 font-bold"
                        : "bg-[var(--bg-surface)] border-[var(--border-primary)] text-[var(--text-muted)] hover:text-emerald-400 hover:border-emerald-500/40"
                    )}
                  >
                    <ThumbsUp size={12} /> Helpful {voted === "up" && "✓"}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onVote(item.id, "down");
                    }}
                    className={cn(
                      "px-2.5 py-1 rounded-lg border flex items-center gap-1.5 transition-all text-xs font-semibold",
                      voted === "down"
                        ? "bg-red-500/20 border-red-500 text-red-400 font-bold"
                        : "bg-[var(--bg-surface)] border-[var(--border-primary)] text-[var(--text-muted)] hover:text-red-400 hover:border-red-500/40"
                    )}
                  >
                    <ThumbsDown size={12} /> Unhelpful
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function ContactPage() {
  const { user, isAuthenticated } = useAuthStore();
  const [openFAQ, setOpenFAQ] = useState<number | null>(0);
  const [faqSearchQuery, setFaqSearchQuery] = useState<string>("");
  const [selectedFaqCategory, setSelectedFaqCategory] = useState<string>("All");
  const [faqVotes, setFaqVotes] = useState<Record<string, "up" | "down">>({});
  
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
  const activeRoleObj = ROLES.find((r) => r.id === selectedRole) || ROLES[0];

  // Hydrate user form defaults if authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      setValue("name", user.displayName || `${user.firstName || ""} ${user.lastName || ""}`.trim());
      setValue("email", user.email || "");
      if (user.role) setValue("role", user.role);
    }
  }, [isAuthenticated, user, setValue]);

  // Check local draft
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
      // ignore
    }
  }, [setValue]);

  // Debounced draft autosave
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
        // ignore
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

  const handleFaqVote = (id: string, type: "up" | "down") => {
    setFaqVotes((prev) => ({ ...prev, [id]: type }));
  };

  // Filter FAQ items by query and category
  const filteredFaqs = useMemo(() => {
    return FAQ_DATA.filter((item) => {
      const matchesCategory = selectedFaqCategory === "All" || item.category === selectedFaqCategory;
      const matchesQuery =
        !faqSearchQuery.trim() ||
        item.question.toLowerCase().includes(faqSearchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(faqSearchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(faqSearchQuery.toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [faqSearchQuery, selectedFaqCategory]);

  const faqCategories = ["All", "Hardware", "Data", "Safety", "Pipeline", "RBAC"];

  const onSubmit = async (data: SupportFormValues) => {
    try {
      // Generated telemetry snapshot
      const telemetrySnapshot = data.attachDiagnostics
        ? {
            batterySoC: 84,
            dcBusVoltage: 24.2,
            core0FailsafeActive: data.inquiryType === "hardware",
            gatewayLatencyMs: 12,
            timestamp: new Date().toISOString(),
          }
        : null;

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

      // Submit to Firebase Realtime Database
      const ticketDoc = await submitSupportTicket(payload);

      // Upload diagnostic artifacts if present
      if (attachedFiles.length > 0) {
        for (const item of attachedFiles) {
          try {
            await uploadDiagnosticFile(ticketDoc.id, item.file);
          } catch (uploadErr) {
            console.error(`Failed to upload file ${item.name}:`, uploadErr);
          }
        }
      }

      // Cleanup local draft state
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      setHasDraft(false);
      setSubmittedTicketId(ticketDoc.id);
    } catch (error) {
      console.error("Error submitting support ticket:", error);
    }
  };

  return (
    <main className="min-h-screen pt-28 pb-24 bg-[var(--bg-base)] text-[var(--text-body)] font-sans selection:bg-[var(--primary)]/20 selection:text-[var(--primary)] relative overflow-hidden">
      
      {/* Background Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(74,222,128,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(74,222,128,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none z-0" />
      
      {/* Aurora Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[40rem] h-[24rem] bg-[var(--primary)]/8 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute top-3/4 right-10 w-[30rem] h-[30rem] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* Floating Particles Layer */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {BACKGROUND_PARTICLES.map((particle, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 bg-[var(--primary)]/25 rounded-full"
            style={{ top: particle.top, left: particle.left }}
            animate={{
              y: [0, -35, 0],
              opacity: [0.2, 0.7, 0.2],
            }}
            transition={{
              repeat: Infinity,
              duration: particle.duration,
              ease: "easeInOut",
              delay: particle.delay,
            }}
          />
        ))}
      </div>

      <Container className="relative z-10">

        {/* Real-Time Operational System Health Banner */}
        <div className="max-w-5xl mx-auto mb-10">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-[var(--bg-card)]/90 backdrop-blur-xl border border-[var(--border-primary)] rounded-2xl p-3.5 px-6 shadow-lg flex flex-wrap items-center justify-between gap-4 text-xs font-mono"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span className="font-bold text-[var(--text-primary)] tracking-wide">
                GLOBAL API GATEWAY: <span className="text-emerald-500 uppercase">Operational</span>
              </span>
              <span className="text-[var(--text-muted)] hidden sm:inline">|</span>
              <span className="text-emerald-500 font-semibold hidden sm:inline flex items-center gap-1">
                <Zap size={12} className="inline" /> 12ms Latency (TLS 1.3)
              </span>
            </div>
            
            <div className="flex items-center gap-5 text-[var(--text-secondary)]">
              <div className="flex items-center gap-1.5">
                <Radio size={13} className="text-[var(--primary)] animate-pulse" />
                <span>Queue: <strong className="text-[var(--text-primary)]">2 Active</strong></span>
              </div>
              <span className="text-[var(--border-primary)] hidden md:inline">|</span>
              <div className="hidden md:flex items-center gap-1.5">
                <Globe size={13} className="text-cyan-400" />
                <span>On-Call Engineers: <strong className="text-[var(--text-primary)]">14 Online</strong></span>
              </div>
              <span className="text-[var(--border-primary)] hidden lg:inline">|</span>
              <div className="hidden lg:flex items-center gap-1.5">
                <Shield size={13} className="text-emerald-400" />
                <span>Core 0 Failsafe: <strong className="text-emerald-500">Nominal</strong></span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Hero Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-14">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <SectionHeader
              eyebrow="GRIDFLOWX LEVEL 2 DISPATCH // v3.2.0-PROD"
              align="center"
              title={
                <>
                  System <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary)] via-emerald-400 to-cyan-400">Diagnostics</span> & Engineering Dispatch
                </>
              }
              description="Submit a secure diagnostic ticket directly to our level-2 engineering queue. Attach edge telemetry snapshots or run our instant AI Diagnostic Copilot for automated root-cause analysis."
            />
          </motion.div>
        </div>

        {/* Contact Channels Grid */}
        <div className="grid md:grid-cols-3 gap-5 max-w-6xl mx-auto mb-12">
          {CONTACT_CHANNELS.map((channel, idx) => {
            const ChannelIcon = channel.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className={cn(
                  "bg-[var(--bg-card)] border rounded-2xl p-6 relative overflow-hidden shadow-lg flex flex-col justify-between group transition-all duration-300 hover:border-[var(--primary)]/50 hover:-translate-y-1",
                  channel.border
                )}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={cn("p-3 rounded-xl border shrink-0", channel.bg, channel.border, channel.iconColor)}>
                    <ChannelIcon size={22} />
                  </div>
                  <span className="text-[10px] font-mono font-extrabold tracking-widest px-2.5 py-1 rounded-full bg-[var(--bg-surface)] border border-[var(--border-primary)] text-[var(--text-muted)]">
                    {channel.badge}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-[var(--text-primary)] leading-tight">{channel.title}</h3>
                  <p className="text-xs text-[var(--text-muted)] mt-1">{channel.subtitle}</p>

                  <div className="mt-4 pt-3 border-t border-[var(--border-primary)]/40 space-y-1.5 text-xs font-mono">
                    {channel.email && (
                      <p className="text-[var(--text-primary)] font-bold flex items-center gap-1.5">
                        <Mail size={13} className="text-[var(--primary)]" />
                        <a href={`mailto:${channel.email}`} className="hover:underline hover:text-[var(--primary)] transition-colors truncate">
                          {channel.email}
                        </a>
                      </p>
                    )}
                    {channel.phone && (
                      <p className="text-[var(--text-secondary)] flex items-center gap-1.5">
                        <PhoneCall size={13} className="text-emerald-400" />
                        <span>{channel.phone}</span>
                      </p>
                    )}
                    {channel.location && (
                      <p className="text-[var(--text-muted)] text-[11px] leading-snug flex items-start gap-1.5 font-sans">
                        <MapPin size={13} className="text-sky-400 shrink-0 mt-0.5" />
                        <span>{channel.location}</span>
                      </p>
                    )}
                    {channel.sla && (
                      <p className="text-red-400 font-bold flex items-center gap-1.5 pt-1">
                        <Clock size={13} /> {channel.sla}
                      </p>
                    )}
                  </div>
                </div>

                {channel.isAi && (
                  <button
                    type="button"
                    onClick={() => setIsAiModalOpen(true)}
                    className="mt-5 w-full py-2.5 px-4 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--text-inverse)] font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_var(--val-shadow-primary)]"
                  >
                    <Zap size={14} /> {channel.actionText}
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Main Bento Layout: Ticket Form / Live Tracker & FAQs */}
        <div className="grid lg:grid-cols-12 gap-8 max-w-6xl mx-auto">

          {/* Left Column (60%): Ticket Form / Live Tracker */}
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
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className={cn(
                    "bg-[var(--bg-card)] border rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden transition-all duration-500",
                    currentTypeMeta.cardBorder
                  )}
                >
                  {/* Form Top Header */}
                  <div className="flex items-center justify-between pb-5 mb-6 border-b border-[var(--border-primary)]/60">
                    <div>
                      <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                        <Terminal size={18} className="text-[var(--primary)]" /> Diagnostic Dispatch Ticket
                      </h3>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">
                        Direct queue push to Super Admin (<code className="text-[var(--primary)]">mekesh.engineer@gmail.com</code>)
                      </p>
                    </div>

                    {/* Authentication Status Badge */}
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-surface)] border border-[var(--border-primary)] text-xs font-mono">
                      <Lock size={12} className={isAuthenticated ? "text-emerald-500" : "text-amber-500"} />
                      <span className="text-[11px]">
                        {isAuthenticated ? "Verified Operator" : "Guest Operator"}
                      </span>
                    </div>
                  </div>

                  {/* Recovered Draft Alert */}
                  {hasDraft && (
                    <div className="mb-6 p-3.5 rounded-xl bg-[var(--primary)]/10 border border-[var(--primary)]/30 flex items-center justify-between text-xs font-sans">
                      <span className="text-[var(--text-primary)] font-medium flex items-center gap-2">
                        <RotateCcw size={14} className="text-[var(--primary)] shrink-0 animate-spin-once" />
                        Recovered unsubmitted draft from your previous session.
                      </span>
                      <button
                        type="button"
                        onClick={clearDraft}
                        className="text-[var(--text-muted)] hover:text-red-500 font-bold transition-colors text-xs shrink-0 ml-2"
                      >
                        Discard Draft
                      </button>
                    </div>
                  )}

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>

                    {/* Operator Role Selector Panel */}
                    <fieldset className="space-y-3">
                      <legend className="text-sm font-semibold text-[var(--text-secondary)] flex items-center justify-between w-full mb-1">
                        <span className="flex items-center gap-2">
                          <Shield size={15} className="text-[var(--primary)]" /> Operator Authorization Level
                        </span>
                        <span className="text-[11px] font-mono text-[var(--text-muted)]">
                          Active Permission: <strong className="text-[var(--primary)]">{activeRoleObj.permission}</strong>
                        </span>
                      </legend>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        {ROLES.map((role) => {
                          const RoleIcon = role.icon;
                          const isSelected = selectedRole === role.id;
                          return (
                            <label
                              key={role.id}
                              className={cn(
                                "cursor-pointer flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all text-center relative overflow-hidden group",
                                isSelected
                                  ? "bg-[var(--primary)]/15 border-[var(--primary)] text-[var(--primary)] shadow-sm font-bold scale-[1.02]"
                                  : "bg-[var(--bg-surface)] border-[var(--border-primary)] text-[var(--text-muted)] hover:border-[var(--primary)]/50 hover:text-[var(--text-primary)]"
                              )}
                            >
                              <input type="radio" value={role.id} {...register("role")} className="sr-only" disabled={isAuthenticated} />
                              <RoleIcon size={18} className={isSelected ? "text-[var(--primary)]" : "text-[var(--text-muted)] group-hover:text-[var(--primary)]"} />
                              <span className="text-xs font-semibold">{role.label}</span>
                              <span className="text-[9px] font-mono text-[var(--text-muted)] leading-tight opacity-80 line-clamp-1">{role.description}</span>
                            </label>
                          );
                        })}
                      </div>
                    </fieldset>

                    {/* Identity Information Fields */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-[var(--text-secondary)]">Operator Name</label>
                        <input
                          {...register("name")}
                          disabled={isAuthenticated}
                          placeholder="e.g., Engineer Mekesh"
                          className={cn(
                            "w-full bg-[var(--bg-surface)] border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-all disabled:opacity-60",
                            errors.name ? "border-red-500 focus:ring-red-500/20" : cn("border-[var(--border-primary)]", currentTypeMeta.activeRing)
                          )}
                        />
                        {errors.name && (
                          <p className="text-xs text-red-500 mt-1 flex items-center gap-1 font-medium">
                            <AlertCircle size={12} /> {errors.name.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-[var(--text-secondary)]">Secure Dispatch Email</label>
                        <input
                          {...register("email")}
                          disabled={isAuthenticated}
                          type="email"
                          placeholder="e.g., operator@substation.local"
                          className={cn(
                            "w-full bg-[var(--bg-surface)] border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-all disabled:opacity-60",
                            errors.email ? "border-red-500 focus:ring-red-500/20" : cn("border-[var(--border-primary)]", currentTypeMeta.activeRing)
                          )}
                        />
                        {errors.email && (
                          <p className="text-xs text-red-500 mt-1 flex items-center gap-1 font-medium">
                            <AlertCircle size={12} /> {errors.email.message}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Diagnostic Category Selector */}
                    <fieldset className="space-y-3 pt-2 border-t border-[var(--border-primary)]/50">
                      <legend className="text-sm font-semibold text-[var(--text-secondary)] flex items-center gap-2">
                        <Server size={15} className="text-[var(--primary)]" /> Diagnostic Category
                      </legend>
                      
                      <div className="grid sm:grid-cols-2 gap-3">
                        {INQUIRY_TYPES.map((type) => {
                          const TypeIcon = type.icon;
                          const isSelected = selectedInquiry === type.id;
                          return (
                            <label
                              key={type.id}
                              className={cn(
                                "cursor-pointer flex items-start gap-3 p-3.5 rounded-xl border transition-all relative overflow-hidden",
                                isSelected
                                  ? cn("bg-[var(--bg-surface)] shadow-sm font-semibold", type.border)
                                  : "bg-[var(--bg-surface)] border-[var(--border-primary)] hover:border-[var(--primary)]/40"
                              )}
                            >
                              <input type="radio" value={type.id} {...register("inquiryType")} className="sr-only" />
                              <div className={cn("p-2 rounded-lg shrink-0", type.bg, type.color)}>
                                <TypeIcon size={16} />
                              </div>
                              <div>
                                <p className={cn("text-xs font-bold", isSelected ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]")}>
                                  {type.title}
                                </p>
                                <p className="text-[10px] text-[var(--text-muted)] mt-0.5 leading-tight">{type.description}</p>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </fieldset>

                    {/* Ticket Subject & Message */}
                    <div className="space-y-4 pt-2 border-t border-[var(--border-primary)]/50">
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-[var(--text-secondary)]">Ticket Subject</label>
                        <input
                          {...register("subject")}
                          placeholder="e.g., Relay 4 overcurrent trip during peak battery shedding"
                          className={cn(
                            "w-full bg-[var(--bg-surface)] border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-all font-sans",
                            errors.subject ? "border-red-500 focus:ring-red-500/20" : cn("border-[var(--border-primary)]", currentTypeMeta.activeRing)
                          )}
                        />
                        {errors.subject && (
                          <p className="text-xs text-red-500 mt-1 flex items-center gap-1 font-medium">
                            <AlertCircle size={12} /> {errors.subject.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium text-[var(--text-secondary)]">Diagnostic Details & Observed Anomaly</label>
                          <span className="text-[10px] font-mono text-[var(--text-muted)]">
                            {currentMessage ? currentMessage.length : 0} chars (min 15)
                          </span>
                        </div>
                        <textarea
                          {...register("message")}
                          rows={4}
                          placeholder="Describe the exact sequence of events, ESP32 error codes, FreeRTOS registers, or anomalies observed across the telemetry pipeline..."
                          className={cn(
                            "w-full bg-[var(--bg-surface)] border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-all resize-none font-mono text-xs text-[var(--text-primary)] leading-relaxed",
                            errors.message ? "border-red-500 focus:ring-red-500/20" : cn("border-[var(--border-primary)]", currentTypeMeta.activeRing)
                          )}
                        />
                        {errors.message && (
                          <p className="text-xs text-red-500 mt-1 flex items-center gap-1 font-medium">
                            <AlertCircle size={12} /> {errors.message.message}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Multi-File Diagnostic Dropzone */}
                    <div className="pt-2 border-t border-[var(--border-primary)]/50">
                      <label className="text-sm font-semibold text-[var(--text-secondary)] block mb-2">
                        Attach Diagnostic Artifacts (Optional)
                      </label>
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
                          <Paperclip size={14} className="text-[var(--primary)]" /> Attach Substation Telemetry Snapshot
                        </p>
                        <p className="text-xs text-[var(--text-muted)] mt-0.5">
                          Bundles current battery SoC (84%), edge failsafe status, and 24.2V DC bus voltage into ticket payload.
                        </p>
                      </div>
                    </label>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full flex items-center justify-center gap-2.5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--text-inverse)] py-4 rounded-xl font-bold transition-all disabled:opacity-70 shadow-[0_0_20px_var(--val-shadow-primary)] active:scale-[0.99] cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 size={18} className="animate-spin" /> Writing Ticket & Dispatching Real-Time Email...
                        </>
                      ) : (
                        <>
                          <Terminal size={18} /> Submit Diagnostic Ticket to Level 2 Queue
                        </>
                      )}
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Column (40%): AI Copilot & FAQ Knowledge Base */}
          <div className="lg:col-span-5 space-y-6">

            {/* AI Diagnostic Copilot Quick Trigger Card */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-gradient-to-br from-[var(--primary)]/15 via-[var(--primary)]/5 to-transparent border border-[var(--primary)]/40 rounded-2xl p-6 relative overflow-hidden shadow-xl group"
            >
              <div className="absolute -right-6 -top-6 w-32 h-32 bg-[var(--primary)]/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700 pointer-events-none" />
              
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 rounded-xl bg-[var(--primary)] text-[var(--text-inverse)] shadow-md">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[var(--text-primary)] leading-tight">AI Diagnostic Copilot</h3>
                  <p className="text-xs font-mono text-[var(--primary)] font-bold uppercase tracking-wider">Instant Error Log Triage</p>
                </div>
              </div>

              <p className="text-xs text-[var(--text-secondary)] mb-5 leading-relaxed">
                Paste raw ESP32, FreeRTOS, or Gateway stack traces. Our AI engine performs instant heuristic root-cause triage, suggests terminal fix commands, and auto-populates your ticket.
              </p>

              <button
                type="button"
                onClick={() => setIsAiModalOpen(true)}
                className="w-full py-3 px-5 rounded-xl bg-[var(--bg-card)] hover:bg-[var(--bg-surface)] border border-[var(--primary)]/50 text-[var(--text-primary)] font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-sm group-hover:border-[var(--primary)] cursor-pointer"
              >
                <Zap size={15} className="text-amber-400" /> Open AI Triage Copilot
              </button>
            </motion.div>

            {/* Knowledge Base FAQs with Search & Category Filters */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                  <Wrench size={18} className="text-[var(--primary)]" /> Knowledge Base FAQ
                </h3>
                <span className="text-xs font-mono text-[var(--text-muted)]">
                  {filteredFaqs.length} Articles
                </span>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="text"
                  value={faqSearchQuery}
                  onChange={(e) => setFaqSearchQuery(e.target.value)}
                  placeholder="Search questions, hardware codes, or protocols..."
                  className="w-full bg-[var(--bg-card)] border border-[var(--border-primary)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 rounded-xl pl-10 pr-4 py-2.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] transition-all"
                />
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {faqCategories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedFaqCategory(cat)}
                    className={cn(
                      "px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all shrink-0 cursor-pointer",
                      selectedFaqCategory === cat
                        ? "bg-[var(--primary)] text-[var(--text-inverse)] shadow-sm"
                        : "bg-[var(--bg-surface)] border border-[var(--border-primary)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Accordion List */}
              <div className="space-y-3 pt-1">
                {filteredFaqs.length > 0 ? (
                  filteredFaqs.map((item, idx) => (
                    <FAQAccordionItem
                      key={item.id}
                      item={item}
                      index={idx}
                      isOpen={openFAQ === idx}
                      onToggle={() => setOpenFAQ(openFAQ === idx ? null : idx)}
                      onVote={handleFaqVote}
                      voted={faqVotes[item.id] || null}
                    />
                  ))
                ) : (
                  <div className="p-6 text-center border border-dashed border-[var(--border-primary)] rounded-xl bg-[var(--bg-card)] text-xs text-[var(--text-muted)]">
                    No articles found matching &quot;{faqSearchQuery}&quot; in category &quot;{selectedFaqCategory}&quot;.
                  </div>
                )}
              </div>
            </motion.div>

            {/* Social & Community Developer Ecosystem Card */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl p-6 shadow-sm"
            >
              <h4 className="text-sm font-bold text-[var(--text-primary)] mb-1 flex items-center gap-2">
                <Share2 size={16} className="text-[var(--primary)]" /> Engineering Community & Repositories
              </h4>
              <p className="text-xs text-[var(--text-muted)] mb-4">
                Join our open firmware discussions, contribute to SDKs, or view open-source telemetry drivers.
              </p>

              <div className="flex flex-wrap gap-2">
                {SOCIAL_LINKS.map((soc) => {
                  const SocIcon = soc.icon;
                  return (
                    <a
                      key={soc.name}
                      href={soc.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)] text-xs font-semibold text-[var(--text-secondary)] transition-all",
                        soc.color
                      )}
                    >
                      <SocIcon size={16} />
                      <span>{soc.name}</span>
                    </a>
                  );
                })}
              </div>
            </motion.div>

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