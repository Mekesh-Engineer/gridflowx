"use client";

import { useRef } from "react";
import { Lock, Cpu, UserCheck, DatabaseZap } from "lucide-react";
import { Container } from "@/components/shared/container";
import { SectionHeader } from "@/components/shared/section-header";
import { motion, useInView } from "framer-motion";
import { useMotionConfig } from "@/hooks/use-motion-config";

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface SecurityFeature {
  icon: React.ElementType;
  title: string;
  description: string;
}


// ============================================================================
// Domain Data (GridFlowX Security Specs)
// ============================================================================

const securityFeatures: SecurityFeature[] = [
  {
    icon: Cpu,
    title: "Hardware-Level Isolation",
    description: "The ESP32 deterministic **failsafe loop** runs on an isolated **Core 0**, making critical cutoffs immune to network intrusion.",
  },
  {
    icon: UserCheck,
    title: "Zero-Trust RBAC",
    description: "Firebase Auth enforces strict **Role-Based Access Control** via custom **JWT claims** for Operators, Supervisors, and Admins.",
  },
  {
    icon: Lock,
    title: "Encrypted Edge Telemetry",
    description: "All ESP32 and WebSocket traffic is secured via **TLS 1.3** using hardware-embedded **SSL certificates**.",
  },
  {
    icon: DatabaseZap,
    title: "Granular Database Rules",
    description: "Firestore Security Rules validate every read/write at the field level, ensuring multi-tenant **data isolation**.",
  },
];

const protectionLayers = ["TLS 1.3", "AES-256", "JWT Auth", "WPA3", "Hardcoded SSL"];

function renderDescription(text: string) {
  const parts = text.split("**");
  return parts.map((part, i) =>
    i % 2 === 1
      ? <span key={i} className="text-[var(--primary)] font-semibold transition-colors duration-500">{part}</span>
      : part
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function SecuritySection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });
  const { shouldAnimate, transitions } = useMotionConfig();

  const badgeVariants = {
    hidden: shouldAnimate ? { opacity: 0, y: 12 } : { opacity: 0 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const, delay: i * 0.06 + 0.3 },
    }),
  };

  const cardVariants = {
    hidden: shouldAnimate ? { opacity: 0, x: 32, rotateY: -5 } : { opacity: 0 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      rotateY: 0,
      transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const, delay: i * 0.1 },
    }),
  };

  return (
    <section
      id="security"
      ref={sectionRef}
      className="relative py-24 lg:py-32 bg-[var(--bg-surface)]/[0.2] border-y border-[var(--border-primary)]/10 overflow-hidden"
    >
      {/* Radial green bloom that expands on scroll entry */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 1.2, ease: "easeOut" }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vh] bg-[var(--primary)]/5 rounded-full blur-[100px]" />
      </motion.div>

      <Container>
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">

          {/* Left: Content & Badges */}
          <motion.div
            initial={shouldAnimate ? { opacity: 0, x: -32 } : { opacity: 0 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <SectionHeader
              eyebrow="Platform Security"
              title={
                <>
                  Industrial-grade
                  <br />
                  <span className="text-[var(--primary)] transition-colors duration-500">protection.</span>
                </>
              }
              description={
                <>
                  From <span className="text-[var(--primary)] font-semibold">edge hardware failsafes</span> to cloud-native <span className="text-[var(--primary)] font-semibold">JWT authentication</span>, GridFlowX employs a multi-layered defense architecture to secure critical microgrid infrastructure.
                </>
              }
              descriptionClassName="mb-12 text-lg text-[var(--text-muted)] leading-relaxed"
              className="mb-8 lg:mb-12 max-w-none text-left"
            />

            {/* Protocol badges — stagger cascade */}
            <div className="flex flex-wrap gap-3">
              {protectionLayers.map((layer, index) => (
                <motion.span
                  key={layer}
                  custom={index}
                  variants={badgeVariants}
                  initial="hidden"
                  animate={isInView ? "visible" : "hidden"}
                  whileHover={shouldAnimate ? { scale: 1.06, borderColor: "var(--primary)" } : {}}
                  className="px-4 py-2 border border-[var(--border-primary)] bg-[var(--bg-card)] text-sm font-mono text-[var(--text-muted)] hover:text-[var(--primary)] cursor-default"
                >
                  {layer}
                </motion.span>
              ))}
            </div>
          </motion.div>

          {/* Right: Security Features Grid */}
          <div className="grid gap-6" style={{ perspective: "1000px" }}>
            {securityFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                custom={index}
                variants={cardVariants}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                whileHover={shouldAnimate ? { scale: 1.02, boxShadow: "0 0 24px var(--val-shadow-primary)" } : {}}
                className="p-6 bg-[var(--bg-card)] rounded-xl border border-[var(--border-primary)] hover:border-[var(--primary)]/40 transition-colors duration-300 group"
              >
                <div className="flex items-start gap-5">
                  {/* Icon Box — pulses on loop */}
                  <motion.div
                    className="shrink-0 w-12 h-12 flex items-center justify-center rounded-lg border border-[var(--border-primary)] bg-[var(--bg-surface)] group-hover:bg-[var(--primary)] group-hover:border-[var(--primary)] group-hover:text-[var(--text-inverse)] transition-all duration-300"
                    animate={shouldAnimate ? { boxShadow: ["0 0 0px var(--val-shadow-primary)", "0 0 12px var(--val-shadow-primary)", "0 0 0px var(--val-shadow-primary)"] } : {}}
                    transition={{ ...transitions.breathe, delay: index * 0.5 }}
                  >
                    <feature.icon className="w-5 h-5" />
                  </motion.div>

                  {/* Text Content */}
                  <div>
                    <motion.h3
                      className="text-lg font-medium mb-1.5 text-[var(--text-primary)] group-hover:text-[var(--primary)] transition-colors duration-300"
                      whileHover={shouldAnimate ? { x: 4 } : {}}
                      transition={{ duration: 0.25 }}
                    >
                      {feature.title}
                    </motion.h3>
                    <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                      {renderDescription(feature.description)}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </Container>
    </section>
  );
}