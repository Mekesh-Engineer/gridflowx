"use client";

import { useEffect, useState, useRef } from "react";
import { Container } from "@/components/shared/container";
import { SectionHeader } from "@/components/shared/section-header";
import { cn } from "@/lib/utils";
import { Zap, ShieldCheck, Activity, BrainCircuit } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useMotionConfig, calc3DTilt } from "@/hooks/use-motion-config";

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface MetricProps {
  value: number;
  label: string;
  description: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  icon: React.ReactNode;
}

// ============================================================================
// Custom Hooks
// ============================================================================

function useIntersectionObserver(threshold = 0.5) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<any>(null);

  useEffect(() => {
    const currentRef = ref.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // Only trigger once
        }
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
// Domain Data (GridFlowX Architecture Docs)
// ============================================================================

const metrics: MetricProps[] = [
  { 
    value: 97, 
    label: "Peak MPPT Efficiency", 
    description: "Maximum power point tracking yield across dynamically shifting solar irradiance conditions.",
    suffix: "%",
    icon: <Zap className="w-6 h-6" />
  },
  { 
    value: 10, 
    label: "Failsafe Response", 
    description: "Deterministic ESP32 hardware-level overcurrent and thermal protection loop.",
    prefix: "< ",
    suffix: "ms",
    icon: <ShieldCheck className="w-6 h-6" />
  },
  { 
    value: 12, 
    label: "Forecast Error Rate", 
    description: "Deep-layer LSTM neural network accuracy for 1-hour ahead solar yield predictions.",
    prefix: "≤ ",
    suffix: "%",
    icon: <BrainCircuit className="w-6 h-6" />
  },
  { 
    value: 99.99, 
    label: "Telemetry Uptime", 
    description: "High-availability edge-cloud WebSocket synchronization and data persistence.",
    suffix: "%", 
    decimals: 2,
    icon: <Activity className="w-6 h-6" />
  },
];

// ============================================================================
// Components
// ============================================================================

function AnimatedCounter({ 
  end, 
  suffix = "", 
  prefix = "", 
  decimals = 0,
  delay = 0
}: { 
  end: number; 
  suffix?: string; 
  prefix?: string; 
  decimals?: number;
  delay?: number;
}) {
  const [count, setCount] = useState(0);
  const { ref, isVisible } = useIntersectionObserver(0.5);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    let animationFrameId: number;
    let timeoutId: NodeJS.Timeout;

    if (isVisible && !hasAnimated) {
      setHasAnimated(true);
      
      const startAnimation = () => {
        const duration = 1500; // Snappier and more direct 1.5 seconds reveal
        const startTime = performance.now();

        const animate = (currentTime: number) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          
          // easeOutQuart function for very smooth deceleration
          const eased = 1 - Math.pow(1 - progress, 4);
          
          setCount(eased * end);

          if (progress < 1) {
            animationFrameId = requestAnimationFrame(animate);
          } else {
            setCount(end); // Force exact target value
          }
        };

        animationFrameId = requestAnimationFrame(animate);
      };

      if (delay > 0) {
        timeoutId = setTimeout(startAnimation, delay);
      } else {
        startAnimation();
      }
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [end, hasAnimated, isVisible, delay]);

  const formattedCount = count.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  const formattedEnd = end.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <dd ref={ref} className="text-5xl lg:text-7xl font-display tracking-tight m-0 bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/60">
      {/* Visual Animation */}
      <span aria-hidden="true">
        {prefix}{formattedCount}{suffix}
      </span>
      {/* Static Target Value (Screen Readers) */}
      <span className="sr-only">
        {prefix}{formattedEnd}{suffix}
      </span>
    </dd>
  );
}

// ============================================================================
// Metric Card with 3D Tilt
// ============================================================================

function MetricCard({ metric, index }: { metric: MetricProps; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: true, margin: "-60px" });
  const { shouldAnimate, transitions } = useMotionConfig();
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!shouldAnimate || !cardRef.current) return;
    const { rotateX, rotateY } = calc3DTilt(e, cardRef.current, 5);
    setTilt({ rotateX, rotateY });
  };

  return (
    <motion.div
      ref={cardRef}
      initial={shouldAnimate ? { opacity: 0, scale: 0.93, y: 24 } : { opacity: 0 }}
      animate={isInView ? { opacity: 1, scale: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: index * 0.1 }}
      style={{ perspective: "1000px" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setTilt({ rotateX: 0, rotateY: 0 })}
      className="group relative bg-[var(--bg-card)] p-8 lg:p-12"
    >
      <motion.div
        animate={{ rotateX: tilt.rotateX, rotateY: tilt.rotateY }}
        transition={transitions.spring}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Hover gradient */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/5 to-transparent pointer-events-none"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        />

        <div className="relative z-10">
          {/* Icon — floats on loop */}
          <motion.div
            className="mb-6 text-[var(--text-muted)] group-hover:text-[var(--primary)] transition-colors duration-500"
            animate={shouldAnimate ? { y: [0, -5, 0] } : {}}
            transition={{ ...transitions.floatLoop, delay: index * 0.4 }}
          >
            {metric.icon}
          </motion.div>

          <AnimatedCounter
            end={metric.value}
            suffix={metric.suffix}
            prefix={metric.prefix}
            decimals={metric.decimals}
            delay={index * 100 + 300}
          />

          <dt className="mt-6 text-xl font-medium text-[var(--text-primary)] group-hover:text-[var(--primary)] transition-colors duration-300">
            {metric.label}
          </dt>

          <dd className="mt-2 text-sm text-[var(--text-muted)] leading-relaxed max-w-xs">
            {metric.description}
          </dd>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function MetricsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });
  const { shouldAnimate, transitions } = useMotionConfig();
  const [time, setTime] = useState<Date | null>(null);

  // Live Clock effect
  useEffect(() => {
    setTime(new Date());
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="metrics" ref={sectionRef} className="relative py-24 lg:py-32 border-y border-[var(--border-primary)]/10">
      <Container>
        {/* Header Row */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-16 lg:mb-24">
          <motion.div
            initial={shouldAnimate ? { opacity: 0, y: 20 } : { opacity: 0 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <SectionHeader
              eyebrow="Platform Scale"
              title={
                <>
                  Engineered for
                  <br />
                  <span className="text-[var(--primary)]/90">reliability.</span>
                </>
              }
              className="mb-0 max-w-none text-left"
            />
          </motion.div>

          {/* Live Status Indicator */}
          <motion.div
            className="flex items-center gap-4 font-mono text-sm text-[var(--text-muted)] lg:mb-6"
            initial={shouldAnimate ? { opacity: 0 } : { opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <span className="flex items-center gap-2">
              <motion.span
                className="w-2 h-2 rounded-full bg-[var(--primary)] shadow-[0_0_8px_var(--val-shadow-primary)]"
                animate={shouldAnimate ? { opacity: [1, 0.3, 1], scale: [1, 1.4, 1] } : {}}
                transition={transitions.breathe}
              />
              <span className="text-[var(--primary)] font-medium">Live Telemetry</span>
            </span>
            <span className="text-[var(--text-muted)]/30">|</span>
            <span>{time ? time.toLocaleTimeString() : "--:--:--"}</span>
          </motion.div>
        </div>

        {/* Metrics Grid */}
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[var(--border-primary)]/10 border border-[var(--border-primary)]/10 rounded-2xl overflow-hidden m-0">
          {metrics.map((metric, index) => (
            <MetricCard key={metric.label} metric={metric} index={index} />
          ))}
        </dl>
      </Container>
    </section>
  );
}