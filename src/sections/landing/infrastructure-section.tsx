"use client";

import { useEffect, useRef, useState } from "react";
import { Container } from "@/components/shared/container";
import { SectionHeader } from "@/components/shared/section-header";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { useMotionConfig } from "@/hooks/use-motion-config";

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface SystemMetric {
  component: string;
  layer: string;
  latency: string;
  status: "deterministic" | "real-time" | "near-real-time";
}

// ============================================================================
// Custom Hooks
// ============================================================================

function useIntersectionObserver(threshold = 0.1) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentRef = ref.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Toggle visibility based on intersection to pause background animations
        setIsVisible(entry.isIntersecting);
      },
      { threshold }
    );

    if (currentRef) observer.observe(currentRef);
    return () => {
      if (currentRef) observer.disconnect();
    };
  }, [threshold]);

  return { ref, isVisible };
}

// ============================================================================
// Domain Data (GridFlowX Specific)
// ============================================================================

const metrics: SystemMetric[] = [
  { component: "ESP32 Safety Loop", layer: "Edge Hardware (Core 0)", latency: "< 10ms", status: "deterministic" },
  { component: "LSTM AI Inference", layer: "Cloud Backend (ONNX)", latency: "22.8ms", status: "real-time" },
  { component: "WebSocket Telemetry", layer: "Network Transport", latency: "~ 50ms", status: "real-time" },
  { component: "Firestore Sync", layer: "Database Storage", latency: "~ 150ms", status: "near-real-time" },
  { component: "Dashboard UI", layer: "Next.js Client (React 19)", latency: "< 200ms", status: "near-real-time" },
];

// ============================================================================
// Main Component
// ============================================================================

export function InfrastructureSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });
  const { shouldAnimate, transitions } = useMotionConfig();
  const [activeMetric, setActiveMetric] = useState(0);

  // Cycle through metrics ONLY when the section is visible in the viewport
  useEffect(() => {
    if (!isInView) return;
    const interval = setInterval(() => {
      setActiveMetric((prev) => (prev + 1) % metrics.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [isInView]);

  return (
    <section ref={sectionRef} className="relative py-24 lg:py-32 overflow-hidden">
      <Container>
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">

          {/* Left: Content */}
          <motion.div
            initial={shouldAnimate ? { opacity: 0, x: -32 } : { opacity: 0 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <SectionHeader
              eyebrow="System Latency"
              title={
                <>
                  Cyber-physical
                  <br />
                  <span className="text-[var(--primary)] transition-colors duration-500">precision.</span>
                </>
              }
              description={
                <>
                  GridFlowX bridges the physical-digital divide. Our <span className="text-[var(--primary)] font-semibold">edge-cloud architecture</span> guarantees deterministic <span className="text-[var(--primary)] font-semibold">hardware failsafes</span> while maintaining millisecond telemetry sync with predictive <span className="text-[var(--primary)] font-semibold">AI models</span>.
                </>
              }
              descriptionClassName="mb-12 text-lg text-[var(--text-muted)] leading-relaxed"
              className="mb-8 lg:mb-12 max-w-none text-left"
            />

            {/* Stats — stagger reveal */}
            <div className="grid grid-cols-3 gap-6 lg:gap-8">
              {[
                { value: "<10", unit: "ms", label: "Failsafe Response" },
                { value: "22", unit: "ms", label: "AI Inference" },
                { value: "1", unit: "Hz", label: "Telemetry Sync" },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={shouldAnimate ? { opacity: 0, y: 16 } : { opacity: 0 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.3 + i * 0.1 }}
                >
                  <div className="text-4xl lg:text-5xl font-display mb-2 text-[var(--text-primary)]">
                    {stat.value}<span className="text-2xl text-[var(--primary)] transition-colors duration-500">{stat.unit}</span>
                  </div>
                  <div className="text-sm font-medium text-[var(--text-muted)]">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right: Metric Pipeline List */}
          <motion.div
            initial={shouldAnimate ? { opacity: 0, x: 32 } : { opacity: 0 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          >
            <div className="border border-[var(--border-primary)] rounded-2xl overflow-hidden bg-[var(--bg-card)] shadow-lg">

              {/* Header */}
              <div className="px-6 py-5 border-b border-[var(--border-primary)] bg-[var(--bg-surface)] flex items-center justify-between">
                <span className="text-sm font-mono tracking-wider uppercase text-[var(--text-muted)]">
                  Architecture Pipeline
                </span>
                <span className="flex items-center gap-2 text-xs font-mono text-[var(--primary)] transition-colors duration-500">
                  <motion.span
                    className="w-2 h-2 rounded-full bg-[var(--primary)] shadow-[0_0_8px_var(--val-shadow-primary)]"
                    animate={shouldAnimate ? { opacity: [1, 0.3, 1], scale: [1, 1.4, 1] } : {}}
                    transition={transitions.breathe}
                  />
                  Live Sync
                </span>
              </div>

              {/* Metrics Semantic List — stagger sweep-in from right */}
              <ul className="flex flex-col m-0 p-0 list-none">
                {metrics.map((metric, index) => {
                  const isActive = activeMetric === index;
                  return (
                    <motion.li
                      key={metric.component}
                      initial={shouldAnimate ? { opacity: 0, x: 24 } : { opacity: 0 }}
                      animate={isInView ? { opacity: 1, x: 0 } : {}}
                      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.3 + index * 0.07 }}
                      className="px-6 py-5 border-b border-[var(--border-primary)]/10 last:border-b-0 flex items-center justify-between"
                      style={{
                        background: isActive ? "var(--primary-light)" : undefined,
                      }}
                    >
                      <div className="flex items-center gap-4">
                        {/* Status Indicator */}
                        <motion.span
                          className="w-2 h-2 rounded-full"
                          animate={{
                            backgroundColor: isActive ? "var(--primary)" : "color-mix(in srgb, var(--text-muted) 20%, transparent)",
                            boxShadow: isActive ? "0 0 8px var(--val-shadow-primary)" : "none",
                          }}
                          transition={transitions.snappy}
                        />

                        {/* Labels */}
                        <div>
                          <motion.div
                            className="font-medium"
                            animate={{ color: isActive ? "var(--primary)" : "var(--text-primary)" }}
                            transition={transitions.snappy}
                          >
                            {metric.component}
                          </motion.div>
                          <div className="text-sm text-[var(--text-muted)] mt-0.5">{metric.layer}</div>
                        </div>
                      </div>

                      {/* Latency Values */}
                      <div className="text-right">
                        <motion.div
                          className="font-mono text-sm"
                          animate={{ color: isActive ? "var(--primary)" : "var(--text-muted)", fontWeight: isActive ? 700 : 400 }}
                          transition={transitions.snappy}
                        >
                          {metric.latency}
                        </motion.div>
                        <AnimatePresence mode="wait">
                          {isActive && (
                            <motion.div
                              key={`status-${index}`}
                              initial={shouldAnimate ? { opacity: 0, y: 4 } : { opacity: 0 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={shouldAnimate ? { opacity: 0 } : { opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="text-[10px] uppercase tracking-widest text-[var(--primary)]/70 mt-1"
                            >
                              {metric.status}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.li>
                  );
                })}
              </ul>

            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}