"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence, useInView, useScroll, useTransform } from "framer-motion";
import { Play, ArrowUpRight, X, TrendingUp, Zap } from "lucide-react";
import { Container } from "@/components/shared/container";
import { Button } from "@/components/ui/button";
import { useMotionConfig } from "@/hooks/use-motion-config";

// ============================================================================
// Domain Data (GridFlowX Growth & Impact)
// ============================================================================

const GROWTH_FEATURES = [
  {
    title: "Dataset Expansion & Training",
    desc: "Scaling the LSTM and ARIMA predictive models using continuous real-world meteorological data to reduce the forecast error rate below 12%.",
  },
  {
    title: "Multi-Node Synchronization",
    desc: "Expanding the FastAPI WebSocket hub to orchestrate dozens of ESP32 edge controllers simultaneously without dropping the 100Hz safety loop.",
  },
];

const MASK_URI = `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 360' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M 50,0 L 370,0 C 386.5,0 400,13.5 400,30 L 400,240 C 400,256.5 386.5,270 370,270 L 350,270 C 333.5,270 320,283.5 320,300 L 320,330 C 320,346.5 306.5,360 290,360 L 30,360 C 13.5,360 0,346.5 0,330 L 0,110 C 0,93.5 13.5,80 30,80 L 50,80 C 66.5,80 80,66.5 80,50 L 80,30 C 80,13.5 93.5,0 110,0 Z' fill='black'/%3E%3C/svg%3E")`;

// ============================================================================
// Floating Metric Orb
// ============================================================================

function MetricOrb({
  value,
  label,
  color,
  style,
  delay,
  shouldAnimate,
}: {
  value: string;
  label: string;
  color: string;
  style: React.CSSProperties;
  delay: number;
  shouldAnimate: boolean;
}) {
  return (
    <motion.div
      aria-hidden="true"
      animate={shouldAnimate ? { scale: [1, 1.15, 1], opacity: [0.15, 0.3, 0.15] } : {}}
      transition={{ duration: 6 + delay, repeat: Infinity, ease: "easeInOut", delay }}
      className="absolute pointer-events-none rounded-full"
      style={{
        width: 220,
        height: 220,
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        filter: "blur(40px)",
        ...style,
      }}
    />
  );
}

// ============================================================================
// FadeIn Helper
// ============================================================================

function FadeIn({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export default function AboutGrowthSection() {
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const { shouldAnimate } = useMotionConfig();
  const bannerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  // Parallax scroll for the video banner image
  const { scrollYProgress } = useScroll({
    target: bannerRef,
    offset: ["start end", "end start"],
  });
  const bannerY = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);

  // Close modal on escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsVideoOpen(false);
    };
    if (isVideoOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isVideoOpen]);

  return (
    <section
      ref={sectionRef}
      id="growth"
      aria-label="About GridFlowX Growth"
      className="relative py-20 lg:py-32 overflow-hidden border-y border-[var(--border-primary)]/30"
      style={{ background: "var(--bg-base)" }}
    >
      {/* Floating Metric Orbs — ambient background depth */}
      <MetricOrb value="4+" label="Iters" color="rgba(74,222,128,0.25)" style={{ top: "10%", right: "-5%" }} delay={0} shouldAnimate={shouldAnimate} />
      <MetricOrb value="88%" label="Acc" color="rgba(99,102,241,0.25)" style={{ bottom: "20%", left: "-8%" }} delay={2.5} shouldAnimate={shouldAnimate} />
      <MetricOrb value="100Hz" label="Loop" color="rgba(34,211,238,0.2)" style={{ top: "60%", right: "15%" }} delay={4} shouldAnimate={shouldAnimate} />

      <Container className="max-w-7xl relative z-10">

        {/* Main Top Heading */}
        <FadeIn className="text-center mb-10 sm:mb-14">
          <h2 className="text-4xl sm:text-5xl lg:text-[56px] font-display font-bold text-[var(--text-primary)] tracking-tight leading-[1.15]">
            Scaling Digital Intelligence for <br className="hidden sm:block" />Physical Infrastructure
          </h2>
        </FadeIn>

        {/* Hero Video Banner — Parallax */}
        <FadeIn delay={0.1}>
          <div
            ref={bannerRef}
            className="relative w-full h-[280px] sm:h-[380px] lg:h-[420px] rounded-[28px] sm:rounded-[36px] overflow-hidden mb-12 shadow-2xl group border border-[var(--border-primary)]/50"
            style={{ boxShadow: "0 0 60px rgba(74,222,128,0.06), 0 30px 80px rgba(0,0,0,0.5)" }}
          >
            <motion.div
              style={{ y: bannerY }}
              className="absolute inset-0 scale-110"
            >
              <Image
                src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80"
                alt="Digital Earth Network GridFlowX"
                fill
                className="object-cover opacity-80"
              />
            </motion.div>

            {/* Dark overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-base)] via-transparent to-transparent opacity-90" />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />

            {/* Hologram scan-line */}
            <motion.div
              aria-hidden="true"
              animate={shouldAnimate ? { top: ["-10%", "110%"] } : {}}
              transition={{ duration: 3.5, repeat: Infinity, ease: "linear", repeatDelay: 4 }}
              className="absolute left-0 right-0 h-[2px] pointer-events-none"
              style={{
                background: "linear-gradient(90deg, transparent 0%, rgba(74,222,128,0.6) 30%, rgba(74,222,128,0.9) 50%, rgba(74,222,128,0.6) 70%, transparent 100%)",
                boxShadow: "0 0 12px rgba(74,222,128,0.8)",
              }}
            />

            {/* Play Button with Orbital Ring */}
            <button
              onClick={() => setIsVideoOpen(true)}
              aria-label="Play Architecture Overview Video"
              className="absolute inset-0 m-auto w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[var(--bg-card)]/80 hover:bg-[var(--primary)] text-[var(--text-primary)] hover:text-[var(--text-inverse)] flex items-center justify-center transition-all duration-300 shadow-xl backdrop-blur-sm hover:scale-110 active:scale-95 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] group/btn border border-[var(--border-primary)]"
            >
              {/* Orbital dashed ring */}
              <motion.span
                aria-hidden="true"
                animate={shouldAnimate ? { rotate: 360 } : {}}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="absolute inset-[-10px] rounded-full border border-dashed border-[var(--primary)]/50"
              />
              <motion.span
                aria-hidden="true"
                animate={shouldAnimate ? { rotate: -360 } : {}}
                transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
                className="absolute inset-[-18px] rounded-full border border-dotted border-[var(--primary)]/25"
              />
              <Play className="w-7 h-7 sm:w-8 sm:h-8 fill-current ml-1 group-hover/btn:scale-90 transition-transform" />
            </button>
          </div>
        </FadeIn>

        {/* Middle Content Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-20 lg:mb-28">
          {/* Left Info */}
          <FadeIn delay={0.2} className="flex flex-row items-start gap-6 max-w-xl">
            <span className="text-[var(--primary)] font-bold text-base shrink-0 pt-0.5 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-5 h-5" /> Scale
            </span>
            <p className="text-[var(--text-secondary)] text-base sm:text-lg leading-relaxed font-medium">
              We continually refine our algorithms, testing edge-node resilience against extreme load scenarios to prepare for real-world deployment.
            </p>
          </FadeIn>

          {/* Right Action Buttons */}
          <FadeIn delay={0.3} className="flex flex-wrap items-center gap-4 shrink-0">
            <Button
              asChild
              size="lg"
              className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--text-inverse)] font-bold px-7 py-6 rounded-2xl transition-all hover:-translate-y-0.5"
            >
              <Link href="/dashboard">
                <span>Access Dashboard</span>
                <ArrowUpRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="bg-[var(--bg-card)] hover:bg-[var(--bg-surface)] text-[var(--text-primary)] border-[var(--border-primary)] font-bold px-7 py-6 rounded-2xl transition-all"
            >
              <Link href="/docs/roadmap">
                Project Roadmap
              </Link>
            </Button>
          </FadeIn>
        </div>

        {/* Bottom Feature Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">

          {/* Left Column: Feature List */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            {GROWTH_FEATURES.map((feature, idx) => (
              <React.Fragment key={idx}>
                <FadeIn delay={0.4 + idx * 0.1}>
                  <div className="flex items-start justify-between gap-4 group cursor-default">
                    <div>
                      {/* Neon underline draw-in on hover */}
                      <h3 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] mb-2 group-hover:text-[var(--primary)] transition-colors relative inline-flex flex-col">
                        {feature.title}
                        <motion.span
                          initial={{ scaleX: 0 }}
                          whileInView={{ scaleX: 1 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.7, delay: 0.5 + idx * 0.15, ease: [0.22, 1, 0.36, 1] }}
                          className="mt-1 h-[2px] bg-gradient-to-r from-[var(--primary)] to-cyan-400 origin-left"
                          style={{ boxShadow: "0 0 6px rgba(74,222,128,0.5)" }}
                        />
                      </h3>
                      <p className="text-[var(--text-muted)] text-sm sm:text-base leading-relaxed max-w-sm">
                        {feature.desc}
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-full border border-[var(--border-primary)] text-[var(--text-primary)] flex items-center justify-center shrink-0 group-hover:border-[var(--primary)] group-hover:text-[var(--primary)] group-hover:bg-[var(--primary)]/10 transition-all">
                      <Zap className="w-4 h-4" />
                    </div>
                  </div>
                </FadeIn>
                {idx === 0 && (
                  <FadeIn delay={0.45}>
                    <hr className="border-[var(--border-primary)]/50 my-8" />
                  </FadeIn>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Middle Column: Holographic Notched Visual */}
          <div className="lg:col-span-4 flex justify-center">
            <FadeIn delay={0.6}>
              <motion.div
                whileHover={shouldAnimate ? { y: -8 } : {}}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="w-full max-w-[340px] sm:max-w-[380px] h-[300px] sm:h-[340px] relative"
              >
                <div
                  className="w-full h-full overflow-hidden bg-[var(--bg-surface)] shadow-2xl relative"
                  style={{
                    maskImage: MASK_URI,
                    WebkitMaskImage: MASK_URI,
                    maskSize: "100% 100%",
                    WebkitMaskSize: "100% 100%",
                    maskRepeat: "no-repeat",
                    WebkitMaskRepeat: "no-repeat",
                    boxShadow: "0 0 40px rgba(74,222,128,0.12)",
                  }}
                >
                  <Image
                    src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80"
                    alt="Cyber Physical Microgrid Network"
                    fill
                    sizes="(max-width: 1024px) 380px, 340px"
                    className="object-cover opacity-80 mix-blend-luminosity"
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/30 to-cyan-500/10 mix-blend-overlay" />

                  {/* Hologram scan-line on the notched image */}
                  <motion.div
                    aria-hidden="true"
                    animate={shouldAnimate ? { top: ["-5%", "105%"] } : {}}
                    transition={{ duration: 2.8, repeat: Infinity, ease: "linear", repeatDelay: 5 }}
                    className="absolute left-0 right-0 h-[1px] pointer-events-none"
                    style={{
                      background: "linear-gradient(90deg, transparent, rgba(74,222,128,0.7), transparent)",
                      boxShadow: "0 0 8px rgba(74,222,128,0.6)",
                    }}
                  />
                </div>
              </motion.div>
            </FadeIn>
          </div>

          {/* Right Column: Heading & Badge */}
          <div className="lg:col-span-3 flex flex-col justify-center items-start lg:pl-4">
            <FadeIn delay={0.7}>
              <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-[var(--text-primary)] leading-[1.2] mb-6 tracking-tight">
                Architecting<br />for Impact
              </h2>
              <motion.div
                animate={shouldAnimate ? { boxShadow: ["0 0 8px rgba(74,222,128,0.1)", "0 0 24px rgba(74,222,128,0.35)", "0 0 8px rgba(74,222,128,0.1)"] } : {}}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="inline-flex items-center bg-[var(--bg-card)] border border-[var(--primary)]/40 text-[var(--primary)] font-bold text-sm px-6 py-2 rounded-full uppercase tracking-widest"
              >
                Evolution
              </motion.div>
            </FadeIn>
          </div>

        </div>
      </Container>

      {/* ================= VIDEO MODAL ================= */}
      <AnimatePresence>
        {isVideoOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setIsVideoOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md cursor-pointer"
            />
            {/* Video Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-4xl bg-black rounded-3xl overflow-hidden aspect-video shadow-2xl z-10 border border-white/10"
              style={{ boxShadow: "0 0 60px rgba(74,222,128,0.15)" }}
            >
              <button
                onClick={() => setIsVideoOpen(false)}
                aria-label="Close Video"
                className="absolute top-4 right-4 text-white bg-black/40 hover:bg-black/70 rounded-full w-10 h-10 flex items-center justify-center z-20 transition-colors border border-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                <p className="text-zinc-500 font-mono text-sm">Video Player Placeholder (e.g., YouTube/Vimeo Embed)</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}