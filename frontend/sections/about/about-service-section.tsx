"use client";

import React, { useState, useRef, MouseEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { 
  ArrowUpRight, 
  Cpu, 
  Cloud, 
  X, 
  Zap, 
  CheckCircle2, 
  Activity, 
  Server,
  BrainCircuit
} from "lucide-react";
import { Container } from "@/components/shared/container";
import { useMotionConfig, calc3DTilt } from "@/hooks/use-motion-config";
import { cn } from "@/lib/utils";

// ============================================================================
// Domain Data (GridFlowX Services)
// ============================================================================

type SegmentType = "edge" | "cloud";

const SERVICE_DATA = {
  edge: {
    title: "Beyond Automation,<br/>Toward Autonomy",
    desc: "Deterministic hardware logic designed to protect microgrid infrastructure instantaneously.",
    card1: {
      title: "Hardware<br/>Failsafes",
      image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80",
      drawerKey: "failsafes"
    },
    card2: {
      title: "Telemetry<br/>Frequency",
      desc: "Optimize polling rates to balance data granularity with edge bandwidth.",
      simLabel: "Polling Rate",
      simSuffix: "Hz",
      simMin: 1,
      simMax: 100,
      simDefault: 10,
      calcResult: (val: number) => `${(val * 3600).toLocaleString()} pts/hr`
    },
    card3: {
      title: "Local Load<br/>Shedding",
      image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80",
      drawerKey: "shedding"
    }
  },
  cloud: {
    title: "Global Visibility,<br/>Predictive Action",
    desc: "Cloud-native intelligence to forecast generation and orchestrate fleet-wide routing.",
    card1: {
      title: "AI Yield<br/>Forecasting",
      image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80",
      drawerKey: "forecasting"
    },
    card2: {
      title: "Inference<br/>Latency",
      desc: "Tune PyTorch ONNX thread allocation for predictive response speeds.",
      simLabel: "Compute Threads",
      simSuffix: " Cores",
      simMin: 1,
      simMax: 16,
      simDefault: 4,
      calcResult: (val: number) => `~${(90 / val).toFixed(1)} ms`
    },
    card3: {
      title: "Fleet<br/>Management",
      image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=600&q=80",
      drawerKey: "fleet"
    }
  }
};

const DRAWER_DETAILS: Record<string, any> = {
  failsafes: {
    title: "Hardware Failsafes",
    tag: "Edge Determinism",
    icon: Cpu,
    desc: "The ESP32 Core 0 runs an isolated, high-priority FreeRTOS task evaluating current and thermal sensors. If thresholds are breached, relays physically decouple under 10ms, entirely bypassing software layers.",
    deliverables: [
      "Sub-10ms thermal/overcurrent trips",
      "Isolated Core 0 execution",
      "Immune to network disconnects",
      "Automatic physical decoupling"
    ],
    timeframe: "Instantaneous (<10ms)"
  },
  shedding: {
    title: "Local Load Shedding",
    tag: "Priority Routing",
    icon: Zap,
    desc: "When battery SoC drops or solar irradiance plummets unexpectedly, the edge controller autonomously sheds Tier 3 (non-critical) loads to preserve grid stability without waiting for cloud instructions.",
    deliverables: [
      "Dynamic 3-tier priority matrix",
      "Brownout prevention protocol",
      "Immediate frequency stabilization",
      "Local state-machine override"
    ],
    timeframe: "Real-time (<50ms)"
  },
  forecasting: {
    title: "AI Yield Forecasting",
    tag: "Predictive Analytics",
    icon: BrainCircuit,
    desc: "A PyTorch LSTM model analyzes historical irradiance, live weather APIs, and current panel voltage to predict solar yield 1-hour ahead, enabling proactive battery charging strategies.",
    deliverables: [
      "T+1hr generation predictions",
      "Cloud cover transient detection",
      "Dynamic MPPT adjustments",
      "Exportable forecast reports"
    ],
    timeframe: "Continuous (1hr Ahead)"
  },
  fleet: {
    title: "Fleet Management",
    tag: "Global Orchestration",
    icon: Server,
    desc: "The Next.js 15 dashboard provides a unified view of all edge nodes. Monitor live telemetry, push OTA firmware updates, and analyze historical performance across your entire microgrid fleet.",
    deliverables: [
      "Unified WebSocket telemetry stream",
      "Role-Based Access Control (RBAC)",
      "Over-The-Air (OTA) firmware deployment",
      "Multi-tenant data isolation"
    ],
    timeframe: "Live Dashboard"
  }
};

const MASK_URI = `url("data:image/svg+xml,%3Csvg viewBox='0 0 300 220' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M 70,0 L 280,0 Q 300,0 300,20 L 300,165 Q 300,180 285,180 L 270,180 Q 255,180 255,195 L 255,200 Q 255,220 235,220 L 20,220 Q 0,220 0,200 L 0,70 Q 0,50 20,50 L 35,50 Q 50,50 50,35 L 50,20 Q 50,0 70,0 Z' fill='black'/%3E%3C/svg%3E")`;

// ============================================================================
// Sub-Components
// ============================================================================

function TiltCardWrapper({ children, className, style }: { children: React.ReactNode, className?: string, style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });
  const { shouldAnimate, transitions } = useMotionConfig();

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!shouldAnimate || !ref.current) return;
    const { rotateX, rotateY } = calc3DTilt(e, ref.current, 6);
    setTilt({ rotateX, rotateY });
  };

  const handleMouseLeave = () => setTilt({ rotateX: 0, rotateY: 0 });

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ rotateX: tilt.rotateX, rotateY: tilt.rotateY }}
      transition={transitions.spring}
      style={{ transformStyle: "preserve-3d", perspective: "1000px", ...style }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export default function AboutServiceSection() {
  const { shouldAnimate, transitions } = useMotionConfig();
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const [segment, setSegment] = useState<SegmentType>("edge");
  const [mousePos, setMousePos] = useState({ x: 500, y: 500 });
  const [isHoveringSection, setIsHoveringSection] = useState(false);
  
  const [simValue, setSimValue] = useState<number>(10);
  const [activeDrawerKey, setActiveDrawerKey] = useState<string | null>(null);

  const data = SERVICE_DATA[segment];

  // Handle ambient glow
  const handleSectionMouseMove = (e: MouseEvent<HTMLElement>) => {
    if (!sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  // Change segment and reset simulator
  const handleSegmentChange = (newSegment: SegmentType) => {
    if (newSegment === segment) return;
    setSegment(newSegment);
    setSimValue(SERVICE_DATA[newSegment].card2.simDefault);
  };

  return (
    <section className="py-24 border-y border-[var(--border-primary)]/30 overflow-hidden relative" style={{ background: "var(--bg-base)" }}>
      {/* Animated aurora gradient blobs */}
      <motion.div
        aria-hidden="true"
        animate={shouldAnimate ? { x: [-30, 30, -30], y: [-20, 20, -20] } : {}}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(74,222,128,0.12) 0%, transparent 70%)", filter: "blur(60px)" }}
      />
      <motion.div
        aria-hidden="true"
        animate={shouldAnimate ? { x: [20, -20, 20], y: [30, -30, 30] } : {}}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 5 }}
        className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)", filter: "blur(60px)" }}
      />
      <motion.div
        aria-hidden="true"
        animate={shouldAnimate ? { scale: [1, 1.3, 1] } : {}}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute top-[40%] left-[40%] w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(34,211,238,0.08) 0%, transparent 70%)", filter: "blur(60px)" }}
      />
      <Container>
        
        {/* Main Section Wrapper with Ambient Glow */}
        <motion.section
          ref={sectionRef}
          initial={shouldAnimate ? { opacity: 0, y: 32 } : { opacity: 1 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          onMouseMove={handleSectionMouseMove}
          onMouseEnter={() => setIsHoveringSection(true)}
          onMouseLeave={() => setIsHoveringSection(false)}
          className="relative w-full max-w-7xl mx-auto bg-[var(--bg-card)] rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-12 lg:p-16 border border-[var(--border-primary)] shadow-2xl"
        >
          {/* Dynamic Ambient Glow */}
          <div 
            className="pointer-events-none absolute -inset-px rounded-[2rem] sm:rounded-[2.5rem] z-0 transition-opacity duration-500"
            style={{
              opacity: isHoveringSection ? 1 : 0,
              background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(74,222,128,0.12), transparent 80%)`
            }}
          />

          {/* Top Floating Emblem */}
          <div className="absolute -top-7 left-1/2 -translate-x-1/2 z-20">
            <div className="w-14 h-14 bg-[var(--bg-surface)] rounded-full flex items-center justify-center shadow-lg border border-[var(--border-primary)]">
              <div className="w-10 h-10 bg-[var(--primary)] rounded-full flex items-center justify-center text-[var(--text-inverse)] shadow-[0_0_15px_rgba(var(--primary),0.3)]">
                <Zap className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Header & Segment Toggle */}
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-start justify-between gap-8 mb-12 sm:mb-16 pt-2">
            <div>
              <div className="flex items-center gap-3 mb-6 flex-wrap">
                <div className="inline-flex items-center bg-[var(--primary)] text-[var(--text-inverse)] text-xs font-bold px-4 py-1.5 rounded-full shadow-sm uppercase tracking-wider">
                  Platform Services
                </div>
                
                {/* Segment Switcher */}
                <div className="inline-flex p-1 bg-[var(--bg-base)] rounded-full text-xs font-semibold border border-[var(--border-primary)]">
                  <button 
                    onClick={() => handleSegmentChange("edge")}
                    aria-pressed={segment === "edge"}
                    className={cn(
                      "px-4 py-1.5 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]",
                      segment === "edge" ? "bg-[var(--primary)] text-[var(--text-inverse)] shadow-sm" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    )}
                  >
                    Edge Operations
                  </button>
                  <button 
                    onClick={() => handleSegmentChange("cloud")}
                    aria-pressed={segment === "cloud"}
                    className={cn(
                      "px-4 py-1.5 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]",
                      segment === "cloud" ? "bg-[var(--primary)] text-[var(--text-inverse)] shadow-sm" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    )}
                  >
                    Cloud Orchestration
                  </button>
                </div>
              </div>

              {/* Dynamic Header */}
              <AnimatePresence mode="wait">
                <motion.h2 
                  key={segment}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={transitions.snappy}
                  className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-[var(--text-primary)] tracking-tight leading-[1.18]"
                  dangerouslySetInnerHTML={{ __html: data.title }}
                />
              </AnimatePresence>
            </div>

            <div className="max-w-xs sm:max-w-sm lg:mt-12">
              <AnimatePresence mode="wait">
                <motion.p 
                  key={segment}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={transitions.snappy}
                  className="text-[var(--text-muted)] text-sm sm:text-base leading-relaxed"
                >
                  {data.desc}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            
            {/* CARD 1 */}
            <TiltCardWrapper className="group rounded-[28px] p-4 flex flex-col justify-between border hover:border-[var(--primary)]/50 transition-all duration-500 min-h-[340px]" style={{ background: "rgba(10,14,20,0.8)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: "1px solid rgba(74,222,128,0.1)", boxShadow: "0 0 0 1px rgba(74,222,128,0.05), 0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(74,222,128,0.05)" }}>
              <div className="relative w-full h-[220px] sm:h-[240px] mb-5">
                <div className="absolute top-2 left-2 z-10 text-[var(--text-inverse)] p-2">
                  <Activity className="w-5 h-5 drop-shadow-md" />
                </div>
                <button 
                  onClick={() => setActiveDrawerKey(data.card1.drawerKey)}
                  className="absolute bottom-2 right-2 z-10 w-10 h-10 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--text-inverse)] rounded-xl flex items-center justify-center shadow-lg transition-transform active:scale-90 group-hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--text-inverse)]"
                >
                  <ArrowUpRight className="w-5 h-5" />
                </button>
                {/* Notched Mask Image */}
                <div 
                  className="w-full h-full overflow-hidden bg-[var(--bg-surface)]"
                  style={{ maskImage: MASK_URI, WebkitMaskImage: MASK_URI, maskSize: "100% 100%", WebkitMaskSize: "100% 100%" }}
                >
                  <AnimatePresence mode="wait">
                    <motion.div key={data.card1.image} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full">
                      <Image 
                        src={data.card1.image} 
                        alt="Service Illustration" 
                        fill 
                        className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-80 mix-blend-luminosity" 
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-tr from-[var(--primary)]/30 to-transparent mix-blend-overlay" />
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
              <div className="px-3 pb-3">
                <AnimatePresence mode="wait">
                  <motion.h3 
                    key={segment}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] leading-snug"
                    dangerouslySetInnerHTML={{ __html: data.card1.title }}
                  />
                </AnimatePresence>
              </div>
            </TiltCardWrapper>

            {/* CARD 2: Interactive Simulator */}
            <TiltCardWrapper className="group rounded-[28px] p-6 sm:p-7 flex flex-col items-center justify-between text-center border hover:border-[var(--primary)]/50 transition-all duration-500 min-h-[340px]" style={{ background: "rgba(10,14,20,0.8)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: "1px solid rgba(74,222,128,0.1)", boxShadow: "0 0 0 1px rgba(74,222,128,0.05), 0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(74,222,128,0.05)" }}>
              <div className="pt-2 w-full">
                <AnimatePresence mode="wait">
                  <motion.h3 
                    key={segment}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] leading-snug"
                    dangerouslySetInnerHTML={{ __html: data.card2.title }}
                  />
                </AnimatePresence>
              </div>

              {/* Dynamic Interactive Widget */}
              <div className="w-full bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-2xl p-4 my-4 shadow-inner text-left">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                    {data.card2.simLabel}
                  </span>
                  <span className="text-xs font-bold text-[var(--primary)]">
                    {simValue}{data.card2.simSuffix}
                  </span>
                </div>
                
                <input 
                  type="range" 
                  min={data.card2.simMin} 
                  max={data.card2.simMax} 
                  value={simValue} 
                  onChange={(e) => setSimValue(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-[var(--bg-card)] rounded-lg appearance-none cursor-pointer mb-3 accent-[var(--primary)]"
                />

                {/* Oscilloscope SVG visualizer */}
                <div className="w-full h-10 mb-2 overflow-hidden rounded-lg" style={{ background: "rgba(0,0,0,0.4)" }}>
                  <svg viewBox="0 0 200 40" className="w-full h-full" preserveAspectRatio="none">
                    <polyline
                      points={Array.from({ length: 41 }, (_, i) => {
                        const x = i * 5;
                        const freq = (simValue / data.card2.simMax) * 3 + 0.5;
                        const amp = 14 * (simValue / data.card2.simMax);
                        const y = 20 + amp * Math.sin((i / 40) * Math.PI * 2 * freq);
                        return `${x},${y}`;
                      }).join(" ")}
                      fill="none"
                      stroke="rgba(74,222,128,0.8)"
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                <div className="flex justify-between items-center text-xs font-medium pt-2 border-t border-[var(--border-primary)]/50">
                  <span className="text-[var(--text-muted)]">Resulting Output:</span>
                  <span className="font-extrabold text-cyan-400">
                    {data.card2.calcResult(simValue)}
                  </span>
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.p 
                  key={segment}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="text-[var(--text-muted)] text-xs sm:text-sm leading-relaxed"
                >
                  {data.card2.desc}
                </motion.p>
              </AnimatePresence>
            </TiltCardWrapper>

            {/* CARD 3 */}
            <TiltCardWrapper className="group bg-[var(--bg-base)] rounded-[28px] p-4 flex flex-col justify-between border border-[var(--border-primary)] hover:border-[var(--primary)]/40 hover:shadow-[0_0_30px_rgba(var(--primary),0.1)] transition-all duration-500 min-h-[340px]">
              <div className="relative w-full h-[220px] sm:h-[240px] mb-5">
                <div className="absolute top-2 left-2 z-10 text-[var(--text-inverse)] p-2">
                  <Server className="w-5 h-5 drop-shadow-md" />
                </div>
                <button 
                  onClick={() => setActiveDrawerKey(data.card3.drawerKey)}
                  className="absolute bottom-2 right-2 z-10 w-10 h-10 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--text-inverse)] rounded-xl flex items-center justify-center shadow-lg transition-transform active:scale-90 group-hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--text-inverse)]"
                >
                  <ArrowUpRight className="w-5 h-5" />
                </button>
                {/* Notched Mask Image */}
                <div 
                  className="w-full h-full overflow-hidden bg-[var(--bg-surface)]"
                  style={{ maskImage: MASK_URI, WebkitMaskImage: MASK_URI, maskSize: "100% 100%", WebkitMaskSize: "100% 100%" }}
                >
                  <AnimatePresence mode="wait">
                    <motion.div key={data.card3.image} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full">
                      <Image 
                        src={data.card3.image} 
                        alt="Service Illustration" 
                        fill 
                        className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-80 mix-blend-luminosity" 
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-tr from-[var(--bg-base)] via-[var(--primary)]/30 to-transparent mix-blend-overlay" />
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
              <div className="px-3 pb-3">
                <AnimatePresence mode="wait">
                  <motion.h3 
                    key={segment}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] leading-snug"
                    dangerouslySetInnerHTML={{ __html: data.card3.title }}
                  />
                </AnimatePresence>
              </div>
            </TiltCardWrapper>

          </div>
        </motion.section>
      </Container>

      {/* ================= SIDE DRAWER MODAL ================= */}
      <AnimatePresence>
        {activeDrawerKey && DRAWER_DETAILS[activeDrawerKey] && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
              onClick={() => setActiveDrawerKey(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 cursor-pointer"
            />
            
            {/* Drawer Panel */}
            <motion.div 
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-[var(--bg-card)] border-l border-[var(--border-primary)] p-6 sm:p-8 z-50 flex flex-col justify-between overflow-y-auto shadow-2xl"
            >
              <div>
                {/* Header */}
                <div className="flex justify-between items-center mb-8 pb-4 border-b border-[var(--border-primary)]/50">
                  <span className="text-xs font-bold text-[var(--primary)] bg-[var(--primary)]/10 px-3 py-1.5 rounded-full border border-[var(--primary)]/20 uppercase tracking-wider">
                    {DRAWER_DETAILS[activeDrawerKey].tag}
                  </span>
                  <button 
                    onClick={() => setActiveDrawerKey(null)} 
                    aria-label="Close drawer" 
                    className="w-8 h-8 rounded-full bg-[var(--bg-surface)] hover:bg-[var(--border-primary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Content */}
                <div className="flex items-center gap-3 mb-4">
                  {React.createElement(DRAWER_DETAILS[activeDrawerKey].icon, { className: "w-8 h-8 text-[var(--primary)]" })}
                  <h3 className="text-2xl sm:text-3xl font-extrabold font-display text-[var(--text-primary)]">
                    {DRAWER_DETAILS[activeDrawerKey].title}
                  </h3>
                </div>
                
                <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-8">
                  {DRAWER_DETAILS[activeDrawerKey].desc}
                </p>

                <div className="mb-8">
                  <h4 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-4">Core Deliverables</h4>
                  <ul className="space-y-3 text-sm text-[var(--text-primary)] font-medium">
                    {DRAWER_DETAILS[activeDrawerKey].deliverables.map((item: string, i: number) => (
                      <li key={i} className="flex items-start gap-2.5 bg-[var(--bg-surface)] p-3 rounded-xl border border-[var(--border-primary)]/40">
                        <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 bg-[var(--bg-base)] rounded-2xl border border-[var(--border-primary)] mb-6 flex items-center justify-between">
                  <span className="text-xs text-[var(--text-muted)] font-medium">Execution Latency</span>
                  <span className="text-sm font-bold text-[var(--primary)]">{DRAWER_DETAILS[activeDrawerKey].timeframe}</span>
                </div>
              </div>

              {/* Bottom Action */}
              <div className="pt-6 border-t border-[var(--border-primary)]/50">
                <Link href="/docs" className="w-full flex items-center justify-center gap-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--text-inverse)] font-bold text-sm px-4 py-4 rounded-xl transition-all shadow-[0_0_15px_rgba(var(--primary),0.2)]">
                  Read Technical Specs <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </section>
  );
}