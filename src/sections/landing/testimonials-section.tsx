"use client";

import { useEffect, useRef, useState } from "react";
import { Container } from "@/components/shared/container";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { useMotionConfig } from "@/hooks/use-motion-config";

// ============================================================================
// Domain Data (GridFlowX Evaluation Results)
// ============================================================================

const testimonials = [
  {
    quote: (
      <>
        The achieved response time of <span className="text-primary">&lt; 10 ms</span> significantly exceeds the 100 ms target, validating the hardware-interrupt-driven GPIO approach for emergency disconnection.
      </>
    ),
    author: "System Benchmarking",
    role: "Hardware Evaluation",
    company: "Project Work I",
    metric: "< 10ms Failsafe",
  },
  {
    quote: (
      <>
        LSTM solar forecasting achieved a <span className="text-primary">10.3% MAE</span> and ARIMA load forecasting achieved a <span className="text-primary">6.7% MAPE</span>, performing well within the specified targets.
      </>
    ),
    author: "AI Validation Team",
    role: "Model Performance",
    company: "GridFlowX Research",
    metric: "10.3% Forecast MAE",
  },
  {
    quote: (
      <>
        The Isolation Forest model achieved <span className="text-primary">94.1% precision</span> at the tuned threshold, exceeding the 92% target for identifying incipient hardware faults.
      </>
    ),
    author: "Diagnostics Panel",
    role: "Anomaly Detection",
    company: "2nd Review Stage",
    metric: "94.1% Precision",
  },
  {
    quote: (
      <>
        The <span className="text-primary">1.2 s LCP</span> and <span className="text-primary">95/100 Lighthouse score</span> confirm that the Next.js SSR architecture is suitable for production deployment.
      </>
    ),
    author: "UI/UX Analytics",
    role: "Frontend Evaluation",
    company: "Dashboard Metrics",
    metric: "95/100 Score",
  },
];

const marqueeEntities = [
  "Kongu Engineering College",
  "Department of EEE",
  "SDG 7: Clean Energy",
  "SDG 9: Innovation",
  "SDG 13: Climate Action",
  "Project Work II",
  "Phase I Review",
];

// ============================================================================
// Main Component
// ============================================================================

export function TestimonialsSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const { shouldAnimate, transitions } = useMotionConfig();
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const activeTestimonial = testimonials[activeIndex];

  return (
    <section ref={sectionRef} className="relative py-32 lg:py-40 border-t border-[var(--border-primary)]/10 lg:pb-14 overflow-hidden">

      {/* Inline styles for the seamless infinite marquee */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee-infinite {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee-infinite {
          animation: marquee-infinite 40s linear infinite;
        }
        .pause-on-hover:hover .animate-marquee-infinite {
          animation-play-state: paused;
        }
      `}} />

      <Container size="narrow">
        {/* Section Label */}
        <motion.div
          className="flex items-center gap-4 mb-16"
          initial={shouldAnimate ? { opacity: 0, y: 16 } : { opacity: 0 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="font-mono text-xs tracking-widest text-[var(--primary)] transition-colors duration-500 uppercase">
            Performance Evaluation
          </span>
          <div className="flex-1 h-px bg-[var(--border-primary)]/10" />
          <AnimatePresence mode="wait">
            <motion.span
              key={activeIndex}
              initial={shouldAnimate ? { opacity: 0 } : {}}
              animate={{ opacity: 1 }}
              exit={shouldAnimate ? { opacity: 0 } : {}}
              transition={{ duration: 0.2 }}
              className="font-mono text-xs text-[var(--text-muted)]"
            >
              {String(activeIndex + 1).padStart(2, "0")} / {String(testimonials.length).padStart(2, "0")}
            </motion.span>
          </AnimatePresence>
        </motion.div>

        {/* Main Quote — AnimatePresence cross-fade */}
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-20">
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              <motion.blockquote
                key={activeIndex}
                initial={shouldAnimate ? { opacity: 0, y: 20 } : { opacity: 0 }}
                animate={{ opacity: 1, y: 0 }}
                exit={shouldAnimate ? { opacity: 0, y: -20 } : { opacity: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <p className="font-display text-3xl md:text-4xl lg:text-5xl leading-[1.2] tracking-tight text-[var(--text-primary)]">
                  &ldquo;{activeTestimonial.quote}&rdquo;
                </p>
              </motion.blockquote>
            </AnimatePresence>

            {/* Author */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`author-${activeIndex}`}
                className="mt-12 flex items-center gap-6"
                initial={shouldAnimate ? { opacity: 0, x: -16 } : { opacity: 0 }}
                animate={{ opacity: 1, x: 0 }}
                exit={shouldAnimate ? { opacity: 0, x: 16 } : { opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
              >
                {/* Avatar ring — floats on loop */}
                <motion.div
                  className="w-16 h-16 rounded-full bg-[var(--primary)]/10 border border-[var(--primary)]/20 flex items-center justify-center shadow-[0_0_15px_var(--val-shadow-primary)] transition-colors duration-500"
                  animate={shouldAnimate ? { scale: [1, 1.06, 1] } : {}}
                  transition={transitions.floatLoopSlow}
                >
                  <span className="font-display text-2xl text-[var(--primary)] transition-colors duration-500">
                    {activeTestimonial.author.charAt(0)}
                  </span>
                </motion.div>
                <div>
                  <p className="text-lg font-medium text-[var(--text-primary)]">{activeTestimonial.author}</p>
                  <p className="text-[var(--text-muted)]">
                    {activeTestimonial.role}, <span className="text-[var(--text-primary)]/70">{activeTestimonial.company}</span>
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Metric Highlight */}
          <div className="lg:col-span-4 flex flex-col justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={`metric-${activeIndex}`}
                initial={shouldAnimate ? { opacity: 0, scale: 0.92 } : { opacity: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={shouldAnimate ? { opacity: 0, scale: 0.92 } : { opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="p-8 border border-[var(--border-primary)] bg-[var(--bg-surface)] rounded-2xl relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/5 to-transparent opacity-50" />
                <div className="relative z-10">
                  <span className="font-mono text-xs tracking-widest text-[var(--primary)] uppercase block mb-4 transition-colors duration-500">
                    Key Result
                  </span>
                  <p className="font-display text-3xl md:text-4xl text-[var(--text-primary)]">
                    {activeTestimonial.metric}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Dots — layout animated width morph */}
            <div className="flex gap-2 mt-8" role="tablist">
              {testimonials.map((_, idx) => (
                <motion.button
                  key={idx}
                  role="tab"
                  aria-selected={idx === activeIndex}
                  aria-label={`View evaluation ${idx + 1}`}
                  onClick={() => setActiveIndex(idx)}
                  layout
                  animate={{
                    width: idx === activeIndex ? 32 : 8,
                    backgroundColor: idx === activeIndex
                      ? "var(--primary)"
                      : "color-mix(in srgb, var(--text-muted) 20%, transparent)",
                  }}
                  transition={transitions.spring}
                  className="h-2 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Entity Logos Marquee Label */}
        <div className="mt-24 pt-12 border-t border-foreground/10">
          <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase mb-8 text-center">
            Developed in alignment with academic & global standards
          </p>
        </div>
      </Container>
      
      {/* Seamless Infinite Marquee */}
      <div className="w-full mt-4 pause-on-hover [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <div className="flex w-max animate-marquee-infinite gap-16 pr-16 items-center">
          
          {/* First Set (Visible to screen readers) */}
          <div className="flex gap-16 items-center shrink-0">
            {marqueeEntities.map((entity, idx) => (
              <span
                key={`set1-${idx}`}
                className="font-display text-xl md:text-2xl text-foreground/30 whitespace-nowrap hover:text-primary dark:hover:text-secondary hover:scale-105 transition-all duration-300 cursor-default"
              >
                {entity}
              </span>
            ))}
          </div>

          {/* Second Set (Hidden from screen readers to prevent duplicate reading) */}
          <div className="flex gap-16 items-center shrink-0" aria-hidden="true">
            {marqueeEntities.map((entity, idx) => (
              <span
                key={`set2-${idx}`}
                className="font-display text-xl md:text-2xl text-foreground/30 whitespace-nowrap hover:text-primary dark:hover:text-secondary hover:scale-105 transition-all duration-300 cursor-default"
              >
                {entity}
              </span>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}