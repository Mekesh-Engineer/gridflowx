"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Mail,
  HelpCircle,
  Wrench,
  Shield,
  MessageCircle,
  Check,
  AlertCircle,
  Loader2,
  Sparkles,
  Server,
  Activity,
  Cpu,
  DatabaseZap,
  Terminal,
  Paperclip
} from "lucide-react";
import { Container } from "@/components/shared/container";
import { SectionHeader } from "@/components/shared/section-header";
import { cn } from "@/lib/utils";
import { useMotionConfig } from "@/hooks/use-motion-config";
import { useAuthStore } from "@/store/zustand/stores";
import { UserRole } from "@/lib/constants";

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
// Domain Data
// ============================================================================

const ROLES = [
  { id: UserRole.OPERATOR, label: "Operator", icon: Terminal, description: "Edge routing & overrides" },
  { id: UserRole.SUPERVISOR, label: "Supervisor", icon: Activity, description: "System monitoring" },
  { id: UserRole.ADMIN, label: "Admin", icon: Shield, description: "Thresholds & access" },
  { id: UserRole.AUDITOR, label: "Auditor", icon: DatabaseZap, description: "Compliance & logs" },
];

const INQUIRY_TYPES = [
  { id: "telemetry", title: "Telemetry Sync Issue", description: "WebSocket disconnects or delayed 1Hz data updates", icon: Activity, color: "text-sky-500", bg: "bg-sky-500/10" },
  { id: "hardware", title: "Hardware Diagnostics", description: "Relay failures, thermal anomalies, or overcurrent trips", icon: Cpu, color: "text-amber-500", bg: "bg-amber-500/10" },
  { id: "rbac", title: "Access & Authorization", description: "JWT claims, permission denied, or role elevation", icon: Shield, color: "text-purple-500", bg: "bg-purple-500/10" },
  { id: "general", title: "General Support", description: "Dashboard usage, export logs, or account inquiries", icon: HelpCircle, color: "text-[var(--primary)]", bg: "bg-[var(--primary)]/10" },
];

const FAQ_DATA = [
  { question: "Why did my manual relay override fail?", answer: "Overrides require Operator or Admin privileges. If the system is in an active thermal or overcurrent failsafe state (Core 0), the hardware will reject manual overrides to prevent physical damage.", category: "Hardware" },
  { question: "How long are telemetry logs stored?", answer: "High-frequency 1Hz telemetry is downsampled and aggregated daily. Raw logs are kept in Firestore for 30 days, while daily aggregations are stored indefinitely.", category: "Data" },
  { question: "Can I adjust the < 10ms failsafe thresholds?", answer: "No. The < 10ms failsafe limits are hardcoded into the ESP32 FreeRTOS Core 0 firmware. Only soft-shedding limits (e.g., shedding Tier 3 loads at 30% SoC) can be adjusted in the Admin configuration.", category: "Safety" },
];

// ============================================================================
// Components
// ============================================================================

function FAQAccordionItem({ item, isOpen, onToggle, index }: { item: any, isOpen: boolean, onToggle: () => void, index: number }) {
  const { shouldAnimate, transitions } = useMotionConfig();
  
  return (
    <motion.div
      initial={shouldAnimate ? { opacity: 0, y: 10 } : { opacity: 0 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="border border-[var(--border-primary)] rounded-xl overflow-hidden bg-[var(--bg-card)] transition-colors hover:border-[var(--primary)]/30"
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
  const { shouldAnimate, transitions } = useMotionConfig();
  const [openFAQ, setOpenFAQ] = useState<number | null>(0);
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<SupportFormValues>({
    resolver: zodResolver(supportSchema),
    defaultValues: {
      role: UserRole.OPERATOR,
      inquiryType: "general",
      attachDiagnostics: true,
    },
  });

  const selectedRole = watch("role");
  const selectedInquiry = watch("inquiryType");

  // Hydrate form if user is logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      setValue("name", user.displayName || `${user.firstName || ''} ${user.lastName || ''}`.trim());
      setValue("email", user.email || "");
      setValue("role", user.role || UserRole.OPERATOR);
    }
  }, [isAuthenticated, user, setValue]);

  const onSubmit = async (data: SupportFormValues) => {
    // Simulated API submission
    await new Promise((resolve) => setTimeout(resolve, 1500));
    console.log("Support Ticket Payload:", data);
    
    // In production: await fetch('/api/v1/support', { method: 'POST', body: JSON.stringify(data) })
  };

  return (
    <main className="min-h-screen pt-32 pb-16 bg-[var(--bg-base)] text-[var(--text-body)] font-sans">
      <Container>
        
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <SectionHeader
            eyebrow="GridFlowX Support"
            align="center"
            title={
              <>
                System <span className="text-[var(--primary)]">Diagnostics</span> & Support
              </>
            }
            description="Submit a secure ticket to the engineering team. Edge telemetry and active anomaly states can be automatically attached to expedite resolution."
          />
        </div>

        <div className="grid lg:grid-cols-12 gap-12 max-w-6xl mx-auto">
          
          {/* Left Column: Form */}
          <div className="lg:col-span-7">
            <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden">
              
              <AnimatePresence>
                {isSubmitSuccessful && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 z-20 bg-[var(--bg-card)] flex flex-col items-center justify-center p-8 text-center"
                  >
                    <div className="w-16 h-16 rounded-full bg-[var(--primary)]/20 border border-[var(--primary)] flex items-center justify-center mb-6 text-[var(--primary)] shadow-[0_0_20px_var(--val-shadow-primary)]">
                      <Check size={32} />
                    </div>
                    <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-3">Ticket Submitted</h3>
                    <p className="text-[var(--text-secondary)] mb-8 max-w-sm">
                      Your diagnostic request has been routed securely to the engineering queue. 
                    </p>
                    <button
                      onClick={() => reset()}
                      className="px-6 py-2.5 rounded-full border border-[var(--border-primary)] hover:bg-[var(--bg-surface)] text-sm font-medium transition-colors"
                    >
                      Submit Another Ticket
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
                
                {/* Role Selector */}
                <fieldset className="space-y-3">
                  <legend className="text-sm font-medium text-[var(--text-secondary)] flex items-center gap-2">
                    <Shield size={14} /> Identity Profile
                  </legend>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {ROLES.map((role) => (
                      <label
                        key={role.id}
                        className={cn(
                          "cursor-pointer flex flex-col items-center gap-2 p-3 rounded-xl border transition-all text-center",
                          selectedRole === role.id
                            ? "bg-[var(--primary)]/10 border-[var(--primary)] text-[var(--primary)] shadow-sm"
                            : "bg-[var(--bg-surface)] border-[var(--border-primary)] text-[var(--text-muted)] hover:border-[var(--primary)]/50"
                        )}
                      >
                        <input type="radio" value={role.id} {...register("role")} className="sr-only" disabled={isAuthenticated} />
                        <role.icon size={18} />
                        <span className="text-xs font-semibold">{role.label}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                {/* Identity Inputs */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[var(--text-secondary)]">Operator Name</label>
                    <input
                      {...register("name")}
                      disabled={isAuthenticated}
                      className={cn(
                        "w-full bg-[var(--bg-surface)] border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 disabled:opacity-50",
                        errors.name ? "border-red-500 focus:ring-red-500/20" : "border-[var(--border-primary)] focus:border-[var(--primary)] focus:ring-[var(--primary)]/20"
                      )}
                    />
                    {errors.name && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={12}/>{errors.name.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[var(--text-secondary)]">Secure Email</label>
                    <input
                      {...register("email")}
                      disabled={isAuthenticated}
                      type="email"
                      className={cn(
                        "w-full bg-[var(--bg-surface)] border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 disabled:opacity-50",
                        errors.email ? "border-red-500 focus:ring-red-500/20" : "border-[var(--border-primary)] focus:border-[var(--primary)] focus:ring-[var(--primary)]/20"
                      )}
                    />
                    {errors.email && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={12}/>{errors.email.message}</p>}
                  </div>
                </div>

                {/* Inquiry Type */}
                <fieldset className="space-y-3 pt-2 border-t border-[var(--border-primary)]/50">
                  <legend className="text-sm font-medium text-[var(--text-secondary)] flex items-center gap-2">
                    <Server size={14} /> Diagnostic Category
                  </legend>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {INQUIRY_TYPES.map((type) => (
                      <label
                        key={type.id}
                        className={cn(
                          "cursor-pointer flex items-start gap-3 p-3 rounded-xl border transition-all",
                          selectedInquiry === type.id
                            ? "bg-[var(--bg-surface)] border-[var(--primary)] shadow-sm"
                            : "bg-[var(--bg-surface)] border-[var(--border-primary)] hover:border-[var(--primary)]/50"
                        )}
                      >
                        <input type="radio" value={type.id} {...register("inquiryType")} className="sr-only" />
                        <div className={cn("p-2 rounded-lg shrink-0", type.bg, type.color)}>
                          <type.icon size={16} />
                        </div>
                        <div>
                          <p className={cn("text-xs font-bold", selectedInquiry === type.id ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]")}>{type.title}</p>
                          <p className="text-[10px] text-[var(--text-muted)] mt-0.5 leading-tight">{type.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </fieldset>

                {/* Message Inputs */}
                <div className="space-y-4 pt-2 border-t border-[var(--border-primary)]/50">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[var(--text-secondary)]">Subject</label>
                    <input
                      {...register("subject")}
                      placeholder="E.g., Relay 4 failing to actuate during peak load"
                      className={cn(
                        "w-full bg-[var(--bg-surface)] border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2",
                        errors.subject ? "border-red-500 focus:ring-red-500/20" : "border-[var(--border-primary)] focus:border-[var(--primary)] focus:ring-[var(--primary)]/20"
                      )}
                    />
                    {errors.subject && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={12}/>{errors.subject.message}</p>}
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[var(--text-secondary)]">Diagnostic Details</label>
                    <textarea
                      {...register("message")}
                      rows={4}
                      placeholder="Describe the anomalies observed in the telemetry pipeline..."
                      className={cn(
                        "w-full bg-[var(--bg-surface)] border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 resize-none",
                        errors.message ? "border-red-500 focus:ring-red-500/20" : "border-[var(--border-primary)] focus:border-[var(--primary)] focus:ring-[var(--primary)]/20"
                      )}
                    />
                    {errors.message && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={12}/>{errors.message.message}</p>}
                  </div>
                </div>

                {/* Payload Attachments */}
                <label className="flex items-center gap-3 p-4 border border-[var(--border-primary)] bg-[var(--bg-surface)] rounded-xl cursor-pointer hover:border-[var(--primary)]/50 transition-colors">
                  <div className="relative flex items-center justify-center">
                    <input type="checkbox" {...register("attachDiagnostics")} className="peer sr-only" />
                    <div className="w-5 h-5 border-2 border-[var(--text-muted)] rounded peer-checked:bg-[var(--primary)] peer-checked:border-[var(--primary)] transition-colors flex items-center justify-center">
                      <Check size={12} className="text-[var(--bg-base)] opacity-0 peer-checked:opacity-100" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
                      <Paperclip size={14} className="text-[var(--primary)]"/> Attach Active Telemetry State
                    </p>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">Appends current battery SoC, edge failsafe status, and DC bus voltage to the payload.</p>
                  </div>
                </label>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--text-inverse)] py-3.5 rounded-xl font-bold transition-all disabled:opacity-70 shadow-[0_0_15px_var(--val-shadow-primary)]"
                >
                  {isSubmitting ? (
                    <><Loader2 size={18} className="animate-spin" /> Verifying Payload...</>
                  ) : (
                    <><Terminal size={18} /> Submit Diagnostic Ticket</>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: FAQ & Info */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Direct Contact Card */}
            <div className="bg-[var(--primary)]/5 border border-[var(--primary)]/20 rounded-2xl p-6 md:p-8">
              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2 flex items-center gap-2">
                <Sparkles size={18} className="text-[var(--primary)]" /> Edge-Cloud Support
              </h3>
              <p className="text-sm text-[var(--text-secondary)] mb-6">
                Critical failsafe operations must be handled immediately. Contact the Level 2 engineering team directly for severe anomalies.
              </p>
              
              <div className="space-y-4">
                <a href="mailto:sysadmin@gridflowx.local" className="flex items-center gap-4 group">
                  <div className="w-10 h-10 rounded-lg bg-[var(--bg-card)] border border-[var(--border-primary)] flex items-center justify-center text-[var(--text-muted)] group-hover:text-[var(--primary)] group-hover:border-[var(--primary)]/50 transition-all">
                    <Mail size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-mono text-[var(--text-muted)] uppercase">SysAdmin Dispatch</p>
                    <p className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--primary)] transition-colors">sysadmin@gridflowx.local</p>
                  </div>
                </a>
              </div>
            </div>

            {/* Architecture FAQs */}
            <div>
              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4 mt-8 flex items-center gap-2">
                <Wrench size={18} /> Architecture FAQ
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
    </main>
  );
}