"use client";

import { useRef, useState } from "react";
import { Container } from "@/components/shared/container";
import { SectionHeader } from "@/components/shared/section-header";
import { cn } from "@/lib/utils";
import { motion, useInView } from "framer-motion";
import { useMotionConfig, calc3DTilt } from "@/hooks/use-motion-config";

// ============================================================================
// Types & Interfaces
// ============================================================================

export type VisualType = "forecasting" | "failsafe" | "routing" | "telemetry";

export interface FeatureProps {
  number: string;
  title: string;
  description: string;
  visual: VisualType;
}

// ============================================================================
// Domain Data (GridFlowX Specific)
// ============================================================================

const features: FeatureProps[] = [
  {
    number: "01",
    title: "Predictive Solar Forecasting",
    description: "Deep-layer **LSTM networks** produce 1-hour ahead **solar irradiance predictions**, pre-positioning battery charge states before cloud transients hit.",
    visual: "forecasting",
  },
  {
    number: "02",
    title: "Sub-10ms Hardware Failsafe",
    description: "A dedicated **FreeRTOS Core 0** task guarantees deterministic **thermal and overcurrent cutoffs** entirely independently of cloud connectivity.",
    visual: "failsafe",
  },
  {
    number: "03",
    title: "Autonomous Priority Routing",
    description: "Our tri-source router autonomously manages **Solar PV, Battery, and Grid** fallback utilizing a dynamic **3-tier critical load shedding** matrix.",
    visual: "routing",
  },
  {
    number: "04",
    title: "Real-Time Edge Telemetry",
    description: "A unified **FastAPI WebSocket** server acts as the central hub, streaming **1Hz bi-directional telemetry** and remote overrides with **<100ms latency**.",
    visual: "telemetry",
  },
];

// ============================================================================
// Visual Components (SVGs)
// ============================================================================

function ForecastingVisual() {
  return (
    <svg viewBox="0 0 200 160" className="w-full h-full" aria-hidden="true" role="presentation">
      <circle cx="100" cy="80" r="12" fill="currentColor">
        <animate attributeName="r" values="12;14;12" dur="2s" repeatCount="indefinite" />
      </circle>
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const angle = (i * 60) * (Math.PI / 180);
        const radius = 50;
        const x2 = (100 + Math.cos(angle) * radius).toFixed(4);
        const y2 = (80 + Math.sin(angle) * radius).toFixed(4);
        return (
          <g key={i}>
            <line x1="100" y1="80" x2={x2} y2={y2} stroke="currentColor" strokeWidth="1" opacity="0.3">
              <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2s" begin={`${i * 0.3}s`} repeatCount="indefinite" />
            </line>
            <circle cx={x2} cy={y2} r="6" fill="none" stroke="currentColor" strokeWidth="2">
              <animate attributeName="r" values="6;8;6" dur="2s" begin={`${i * 0.3}s`} repeatCount="indefinite" />
            </circle>
          </g>
        );
      })}
      <circle cx="100" cy="80" r="30" fill="none" stroke="currentColor" strokeWidth="1" opacity="0">
        <animate attributeName="r" values="20;60" dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.5;0" dur="2s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

function FailsafeVisual() {
  return (
    <svg viewBox="0 0 200 160" className="w-full h-full" aria-hidden="true" role="presentation">
      <path d="M 100 20 L 150 40 L 150 90 Q 150 130 100 145 Q 50 130 50 90 L 50 40 Z" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M 100 35 L 135 50 L 135 85 Q 135 115 100 128 Q 65 115 65 85 L 65 50 Z" fill="currentColor" opacity="0.1">
        <animate attributeName="opacity" values="0.1;0.2;0.1" dur="2s" repeatCount="indefinite" />
      </path>
      <rect x="85" y="70" width="30" height="25" rx="3" fill="currentColor" />
      <path d="M 90 70 L 90 60 Q 90 50 100 50 Q 110 50 110 60 L 110 70" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <circle cx="100" cy="80" r="4" fill="white" />
      <rect x="98" y="82" width="4" height="8" fill="white" />
      <line x1="60" y1="60" x2="140" y2="60" stroke="currentColor" strokeWidth="1" opacity="0">
        <animate attributeName="y1" values="40;120;40" dur="3s" repeatCount="indefinite" />
        <animate attributeName="y2" values="40;120;40" dur="3s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0;0.5;0" dur="3s" repeatCount="indefinite" />
      </line>
    </svg>
  );
}

function RoutingVisual() {
  return (
    <svg viewBox="0 0 200 160" className="w-full h-full" aria-hidden="true" role="presentation">
      <defs>
        <clipPath id="deployClip">
          <rect x="30" y="20" width="140" height="120" rx="4" />
        </clipPath>
      </defs>
      <rect x="30" y="20" width="140" height="120" rx="4" fill="none" stroke="currentColor" strokeWidth="2" />
      <g clipPath="url(#deployClip)">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <rect key={i} x="40" y={35 + i * 16} width="120" height="10" rx="2" fill="currentColor" opacity="0.15">
            <animate attributeName="opacity" values="0.15;0.8;0.15" dur="2s" begin={`${i * 0.15}s`} repeatCount="indefinite" />
            <animate attributeName="width" values="20;120;20" dur="2s" begin={`${i * 0.15}s`} repeatCount="indefinite" />
          </rect>
        ))}
      </g>
      <circle cx="100" cy="155" r="3" fill="currentColor" opacity="0.3">
        <animate attributeName="opacity" values="0.3;1;0.3" dur="1s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

function TelemetryVisual() {
  return (
    <svg viewBox="0 0 200 160" className="w-full h-full" aria-hidden="true" role="presentation">
      <g>
        <rect x="30" y="50" width="50" height="60" rx="4" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="55" cy="80" r="6" fill="currentColor" opacity="0.5" />
        <circle cx="55" cy="35" r="12" fill="none" stroke="currentColor" strokeWidth="2" />
      </g>
      <g>
        <rect x="120" y="50" width="50" height="60" rx="4" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="145" cy="80" r="6" fill="currentColor" opacity="0.5" />
        <circle cx="145" cy="35" r="12" fill="none" stroke="currentColor" strokeWidth="2" />
      </g>
      <line x1="80" y1="80" x2="120" y2="80" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4">
        <animate attributeName="stroke-dashoffset" values="0;-8" dur="0.5s" repeatCount="indefinite" />
      </line>
      <circle r="4" fill="currentColor">
        <animateMotion dur="1.5s" repeatCount="indefinite">
          <mpath href="#dataPath" />
        </animateMotion>
      </circle>
      <path id="dataPath" d="M 80 80 L 120 80" fill="none" />
      <g transform="translate(100, 130)">
        <circle r="6" fill="none" stroke="currentColor" strokeWidth="2">
          <animate attributeName="r" values="6;10;6" dur="1s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite" />
        </circle>
      </g>
    </svg>
  );
}

function AnimatedVisual({ type }: { type: VisualType }) {
  switch (type) {
    case "forecasting": return <ForecastingVisual />;
    case "failsafe":    return <FailsafeVisual />;
    case "routing":     return <RoutingVisual />;
    case "telemetry":   return <TelemetryVisual />;
    default:            return <RoutingVisual />;
  }
}

// ============================================================================
// Layout Components
// ============================================================================

function renderDescription(text: string) {
  const parts = text.split("**");
  return parts.map((part, i) =>
    i % 2 === 1
      ? <span key={i} className="text-[var(--primary)] font-semibold transition-colors duration-500">{part}</span>
      : part
  );
}

function FeatureCard({ feature, index }: { feature: FeatureProps; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const { shouldAnimate, transitions } = useMotionConfig();

  // 3D tilt state
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!shouldAnimate || !ref.current) return;
    const { rotateX, rotateY } = calc3DTilt(e, ref.current, 4);
    setTilt({ rotateX, rotateY });
  };

  const handleMouseLeave = () => setTilt({ rotateX: 0, rotateY: 0 });

  return (
    <motion.div
      ref={ref}
      initial={shouldAnimate ? { opacity: 0, y: 40 } : { opacity: 0 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: index * 0.1 }}
      style={{
        perspective: "1200px",
        transformStyle: "preserve-3d",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        animate={{ rotateX: tilt.rotateX, rotateY: tilt.rotateY }}
        transition={transitions.spring}
        className="group relative"
      >
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 py-12 lg:py-20 border-b border-[var(--border-primary)] group-hover:border-[var(--primary)]/20 transition-colors duration-500">
          {/* Number */}
          <div className="shrink-0">
            <span className="font-mono text-sm text-[var(--primary)] transition-colors duration-500">{feature.number}</span>
          </div>

          {/* Content */}
          <div className="flex-1 grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <motion.h3
                className="text-3xl lg:text-4xl font-display mb-4 transition-colors duration-500"
                whileHover={shouldAnimate ? { x: 6, color: "var(--primary)" } : {}}
                transition={transitions.snappy}
              >
                {feature.title}
              </motion.h3>
              <p className="text-lg text-[var(--text-muted)] leading-relaxed">
                {renderDescription(feature.description)}
              </p>
            </div>

            {/* Visual — floats on loop */}
            <div className="flex justify-center lg:justify-end">
              <motion.div
                className="w-48 h-40 text-[var(--primary)] transition-colors duration-500"
                animate={shouldAnimate ? { y: [0, -10, 0] } : {}}
                transition={{ ...transitions.floatLoop, delay: index * 0.3 }}
              >
                <AnimatedVisual type={feature.visual} />
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function FeaturesSection() {
  const headerRef = useRef<HTMLDivElement>(null);
  const isHeaderInView = useInView(headerRef, { once: true, margin: "-60px" });
  const { shouldAnimate } = useMotionConfig();

  return (
    <section id="features" className="relative py-24 lg:py-32">
      <Container>
        <motion.div
          ref={headerRef}
          initial={shouldAnimate ? { opacity: 0, y: 24 } : { opacity: 0 }}
          animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <SectionHeader
            eyebrow="Core Architecture"
            title={
              <>
                Intelligent Edge Control.
                <br />
                <span className="text-[var(--primary)]">Cloud-Native Resilience.</span>
              </>
            }
          />
        </motion.div>

        {/* Features List */}
        <div>
          {features.map((feature, index) => (
            <FeatureCard key={feature.number} feature={feature} index={index} />
          ))}
        </div>
      </Container>
    </section>
  );
}