"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import dynamic from "next/dynamic";
import { Container } from "@/components/shared/container";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
} from "framer-motion";
import { useMotionConfig } from "@/hooks/use-motion-config";

const AnimatedSphere = dynamic(
  () => import("@/3d/components/animated-sphere").then((mod) => mod.AnimatedSphere),
  { ssr: false }
);

const words = ["route", "forecast", "balance", "protect"];

const microgridStats = [
  { value: "97%", label: "Peak MPPT efficiency", context: "SOLAR YIELD" },
  { value: "40%", label: "Extended lifespan", context: "BATTERY HEALTH" },
  { value: "< 10ms", label: "Failsafe response", context: "EDGE SAFETY" },
  { value: "≤ 12%", label: "Forecast error", context: "AI PREDICTION" },
  { value: "0 ms", label: "Cloud-loss downtime", context: "AUTONOMY" },
];

// ============================================================================
// Word cycling with AnimatePresence
// ============================================================================

function CyclingWord() {
  const [wordIndex, setWordIndex] = useState(0);
  const { shouldAnimate } = useMotionConfig();

  // Cycle words on mount
  useState(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % words.length);
    }, 2500);
    return () => clearInterval(interval);
  });

  return (
    <span className="relative inline-block text-[var(--text-primary)]">
      <motion.span
        key={wordIndex}
        initial={shouldAnimate ? { opacity: 0, y: 16, filter: "blur(4px)" } : { opacity: 0 }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        exit={shouldAnimate ? { opacity: 0, y: -16, filter: "blur(4px)" } : { opacity: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="inline-block text-[var(--primary)] transition-colors duration-500"
      >
        {words[wordIndex]}
      </motion.span>
      <span className="absolute -bottom-2 left-0 right-0 h-3 bg-[var(--primary)]/20 transition-colors duration-500" />
    </span>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function HeroSection() {
  const { shouldAnimate, transitions } = useMotionConfig();
  const sectionRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  // Scroll-based parallax
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const headlineY = useTransform(scrollYProgress, [0, 1], [0, shouldAnimate ? -80 : 0]);
  const sphereY    = useTransform(scrollYProgress, [0, 1], [0, shouldAnimate ? 120 : 0]);
  const gridY      = useTransform(scrollYProgress, [0, 1], [0, shouldAnimate ? 40 : 0]);
  const statsY     = useTransform(scrollYProgress, [0, 1], [0, shouldAnimate ? -40 : 0]);

  // Spring-smoothed parallax
  const smoothHeadlineY = useSpring(headlineY, { stiffness: 60, damping: 20 });
  const smoothSphereY   = useSpring(sphereY,   { stiffness: 40, damping: 20 });

  // Mouse spotlight tracking
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  // Stagger container variants
  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
  };
  const itemVariants = {
    hidden: shouldAnimate ? { opacity: 0, y: 24 } : { opacity: 0 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const } },
  };

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex flex-col justify-center overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* Inline styles for marquee */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes hero-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-hero-marquee {
          animation: hero-marquee 40s linear infinite;
          width: max-content;
        }
        .animate-hero-marquee:hover {
          animation-play-state: paused;
        }
      `}} />

      {/* Mouse-follow spotlight */}
      <motion.div
        className="absolute inset-0 pointer-events-none z-0"
        animate={{
          background: `radial-gradient(700px circle at ${mousePos.x}% ${mousePos.y}%, var(--spotlight-color), transparent 50%)`,
        }}
        transition={{ duration: 0.1, ease: "linear" }}
      />

      {/* Animated sphere — floats with scroll parallax + loop float */}
      <motion.div
        style={{ y: smoothSphereY }}
        className="absolute right-0 top-1/2 -translate-y-1/2 w-[600px] h-[600px] lg:w-[800px] lg:h-[800px] pointer-events-none text-[var(--primary)]"
      >
        <motion.div
          className="w-full h-full opacity-40"
          animate={shouldAnimate ? { y: [0, -18, 0] } : {}}
          transition={transitions.floatLoopSlow}
        >
          <AnimatedSphere />
        </motion.div>
      </motion.div>

      {/* Grid lines — parallax scrolls at slower rate */}
      <motion.div
        style={{ y: gridY }}
        className="absolute inset-0 overflow-hidden pointer-events-none opacity-30"
      >
        {[...Array(8)].map((_, i) => (
          <div
            key={`h-${i}`}
            className="absolute h-px bg-[var(--border-primary)]/10"
            style={{ top: `${12.5 * (i + 1)}%`, left: 0, right: 0 }}
          />
        ))}
        {[...Array(12)].map((_, i) => (
          <div
            key={`v-${i}`}
            className="absolute w-px bg-[var(--border-primary)]/10"
            style={{ left: `${8.33 * (i + 1)}%`, top: 0, bottom: 0 }}
          />
        ))}
      </motion.div>

      {/* Main content — scrolls up slightly on scroll for parallax depth */}
      <motion.div style={{ y: smoothHeadlineY }} className="relative z-10">
        <Container className="py-32 lg:py-40">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Eyebrow */}
            <motion.div variants={itemVariants} className="mb-8">
              <span className="inline-flex items-center gap-3 text-sm font-mono text-[var(--primary)] transition-colors duration-500">
                <motion.span
                  className="w-8 h-px bg-[var(--primary)]/50"
                  animate={shouldAnimate ? { scaleX: [0, 1] } : {}}
                  transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
                  style={{ transformOrigin: "left" }}
                />
                Autonomous Peak Load Microgrid Optimization
              </span>
            </motion.div>

            {/* Main headline */}
            <motion.div variants={itemVariants} className="mb-12">
              <h1 className="text-[clamp(3rem,12vw,10rem)] font-display leading-[0.9] tracking-tight">
                <span className="block">
                  The <span className="text-[var(--primary)] transition-colors duration-500">AI platform</span>
                </span>
                <span className="block">
                  to{" "}
                  <CyclingWord />
                </span>
              </h1>
            </motion.div>

            {/* Description + CTAs */}
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-end">
              <motion.p
                variants={itemVariants}
                className="text-xl lg:text-2xl text-[var(--text-muted)] leading-relaxed max-w-xl"
              >
                Deploy{" "}
                <span className="text-[var(--primary)] font-medium transition-colors duration-500">
                  deep-layer neural solar forecasts
                </span>
                , structural battery health diagnostics, and{" "}
                <span className="text-[var(--primary)] font-medium transition-colors duration-500">
                  machine-learning anomaly containment
                </span>{" "}
                in a single low-latency edge-cloud interface.
              </motion.p>

              {/* CTAs */}
              <motion.div
                variants={itemVariants}
                className="flex flex-col sm:flex-row items-start gap-4"
              >
                <Link href="/login">
                  <motion.div
                    whileHover={shouldAnimate ? { scale: 1.03 } : {}}
                    whileTap={shouldAnimate ? { scale: 0.97 } : {}}
                  >
                    <Button
                      size="lg"
                      className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--text-inverse)] px-8 h-14 text-base rounded-full group transition-all shadow-[0_0_20px_var(--val-shadow-primary)]"
                    >
                      Operator Terminal
                      <motion.span
                        animate={shouldAnimate ? { x: [0, 4, 0] } : {}}
                        transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
                      >
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </motion.span>
                    </Button>
                  </motion.div>
                </Link>
                <Link href="/dashboard">
                  <motion.div
                    whileHover={shouldAnimate ? { scale: 1.03 } : {}}
                    whileTap={shouldAnimate ? { scale: 0.97 } : {}}
                  >
                    <Button
                      size="lg"
                      variant="outline"
                      className="h-14 px-8 text-base rounded-full border-[var(--primary)]/20 text-[var(--primary)] hover:bg-[var(--primary-light)] transition-colors"
                    >
                      Launch Platform
                    </Button>
                  </motion.div>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </Container>
      </motion.div>

      {/* Stats marquee */}
      <motion.div
        style={{ y: statsY }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.7 }}
        className="absolute bottom-6 lg:bottom-10 left-0 right-0 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]"
      >
        <div className="flex animate-hero-marquee gap-48 pr-48">
          {[...microgridStats, ...microgridStats].map((stat, i) => (
            <div key={`${stat.context}-${i}`} className="flex items-baseline gap-4 shrink-0">
              <span className="text-4xl lg:text-5xl font-display text-[var(--primary)] transition-colors duration-500">
                {stat.value}
              </span>
              <span className="text-sm text-[var(--text-muted)] uppercase tracking-wider">
                {stat.label}
                <span className="block font-mono text-xs mt-1 text-[var(--text-muted)]/40">{stat.context}</span>
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}