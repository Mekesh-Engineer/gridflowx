"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { ArrowUpRight, Calculator, Cpu, Cloud, Zap } from "lucide-react";
import { Container } from "@/components/shared/container";
import { Button } from "@/components/ui/button";
import { useMotionConfig } from "@/hooks/use-motion-config";
import { cn } from "@/lib/utils";

// ============================================================================
// Domain Data (GridFlowX Overview Segments)
// ============================================================================

type SegmentType = "edge" | "cloud";

const SEGMENT_DATA = {
  edge: {
    headline: "Safety Crafted,<br/>Latency Crushed",
    subtitle: "Deterministic Edge Hardware",
    desc: "Empowering your microgrid with C++ firmware running on isolated ESP32 dual-cores, guaranteeing sub-10ms thermal cutoffs independent of network connectivity.",
    stat1: { num: 100, suffix: "Hz", label: "Failsafe Loop" },
    stat2: { num: 10, suffix: "ms", label: "Cutoff Speed" },
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1000&q=80",
    alt: "ESP32 Circuit Board Microgrid Controller"
  },
  cloud: {
    headline: "Yield Scaled,<br/>Flow Optimized",
    subtitle: "Cloud Intelligence Engine",
    desc: "Enterprise-grade PyTorch inference, automated priority load shedding, and sub-second WebSocket telemetry syncing directly to your dashboard.",
    stat1: { num: 2.5, suffix: "M+", label: "Data Points/Hr" },
    stat2: { num: 99.9, suffix: "%", label: "System Uptime" },
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1000&q=80",
    alt: "Cloud Server Data Center Architecture"
  }
};

// ============================================================================
// Custom Hooks & Animation Components
// ============================================================================

function AnimatedCounter({ end, decimals = 0 }: { end: number, decimals?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    let startTime: number;
    let animationFrameId: number;
    const duration = 1500;

    const animate = (time: number) => {
      if (!startTime) startTime = time;
      const progress = Math.min((time - startTime) / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(easeOutQuart * end);
      
      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setCount(end); // Force exact target value
      }
    };
    
    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isInView, end]);

  return (
    <span ref={ref} className="relative">
      <span aria-hidden="true">
        {count.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
      </span>
      <span className="sr-only">{end}</span>
    </span>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export default function AboutOverviewSection() {
  const [segment, setSegment] = useState<SegmentType>("edge");
  const { shouldAnimate } = useMotionConfig();
  
  // Interactive Simulator State
  const [solarIrradiance, setSolarIrradiance] = useState(600);
  const projectedYield = Math.round(solarIrradiance * 0.97); // 97% MPPT efficiency

  // Live Ticker State
  const [liveTxs, setLiveTxs] = useState(1248);
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveTxs(prev => prev + Math.floor(Math.random() * 3) + 1);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const data = SEGMENT_DATA[segment];

  // SVG Mask Data URI (Preserved from reference layout)
  const maskImageURI = `url("data:image/svg+xml,%3Csvg viewBox='0 0 600 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M 570,0 C 586.5,0 600,13.5 600,30 L 600,250 C 600,266.5 586.5,280 570,280 L 555,280 C 538.5,280 525,293.5 525,310 L 525,370 C 525,386.5 511.5,400 495,400 L 30,400 C 13.5,400 0,386.5 0,370 L 0,130 C 0,113.5 13.5,100 30,100 L 45,100 C 61.5,100 75,86.5 75,70 L 75,30 C 75,13.5 88.5,0 105,0 Z' fill='black'/%3E%3C/svg%3E")`;

  return (
    <section 
      id="platform-overview" 
      className="relative py-20 lg:py-32 overflow-hidden border-b border-[var(--border-primary)]/30"
      style={{ background: "var(--bg-base)" }}
    >
      {/* Subtle crosshatch grid texture */}
      <div 
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage: "linear-gradient(rgba(74,222,128,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(74,222,128,0.5) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      <Container className="max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* ================= LEFT COLUMN: CONTENT ================= */}
          <div className="lg:col-span-5 flex flex-col items-start pt-2">
            
            {/* Badge & Segment Switcher — Liquid Morph Pills */}
            <div className="flex flex-wrap items-center gap-4 mb-10">
              <div className="inline-flex items-center bg-[var(--bg-card)] border border-[var(--border-primary)] text-[var(--text-primary)] text-xs font-bold px-4 py-2 rounded-full shadow-sm tracking-wider uppercase">
                Architecture
              </div>
              
              <div className="relative inline-flex p-1 bg-[var(--bg-surface)] border border-[var(--border-primary)]/50 rounded-full text-xs font-semibold">
                {(["edge", "cloud"] as SegmentType[]).map((seg) => (
                  <button
                    key={seg}
                    onClick={() => setSegment(seg)}
                    aria-pressed={segment === seg}
                    className={cn(
                      "relative px-4 py-1.5 rounded-full transition-colors duration-200 flex items-center gap-1.5 z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]",
                      segment === seg ? "text-[var(--text-inverse)]" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    )}
                  >
                    {segment === seg && (
                      <motion.span
                        layoutId="segment-pill"
                        className="absolute inset-0 rounded-full bg-[var(--primary)]"
                        style={{ boxShadow: "0 0 12px rgba(74,222,128,0.4)" }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-1.5">
                      {seg === "edge" ? <Cpu className="w-3.5 h-3.5" /> : <Cloud className="w-3.5 h-3.5" />}
                      {seg === "edge" ? "Edge Hardware" : "Cloud AI"}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Dynamic Content — Depth Camera Transition */}
            <AnimatePresence mode="wait">
              <motion.div
                key={segment}
                initial={shouldAnimate ? { opacity: 0, scale: 0.92, filter: "blur(6px)", y: 10 } : { opacity: 1 }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)", y: 0 }}
                exit={shouldAnimate ? { opacity: 0, scale: 1.06, filter: "blur(6px)", y: -10 } : { opacity: 0 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="w-full"
              >
                {/* Headline */}
                <h2 
                  className="text-4xl sm:text-5xl lg:text-[60px] font-display font-extrabold text-[var(--text-primary)] tracking-tight leading-[1.12] mb-6"
                  dangerouslySetInnerHTML={{ __html: data.headline }}
                />

                {/* Subtitle */}
                <h3 className="text-xl sm:text-2xl font-bold text-[var(--primary)] mb-4">
                  {data.subtitle}
                </h3>

                {/* Description */}
                <p className="text-[var(--text-secondary)] text-base sm:text-lg leading-relaxed max-w-md mb-12">
                  {data.desc}
                </p>

                {/* Statistics Grid */}
                <div className="flex flex-row items-baseline gap-10 sm:gap-14 flex-wrap">
                  
                  {/* Stat 1 & Live Pulse Ticker */}
                  <div>
                    <div className="flex items-baseline">
                      <motion.span
                        animate={shouldAnimate ? { textShadow: ["0 0 4px rgba(74,222,128,0)", "0 0 16px rgba(74,222,128,0.6)", "0 0 4px rgba(74,222,128,0)"] } : {}}
                        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                        className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold text-[var(--text-primary)] tracking-tight"
                      >
                        <AnimatedCounter end={data.stat1.num} decimals={segment === 'cloud' ? 1 : 0} />
                      </motion.span>
                      <span className="text-2xl sm:text-3xl font-bold text-[var(--primary)] ml-1">
                        {data.stat1.suffix}
                      </span>
                    </div>
                    <p className="font-mono text-xs sm:text-sm font-bold uppercase tracking-wider text-[var(--text-muted)] mt-2">
                      {data.stat1.label}
                    </p>
                    
                    {/* Real-time Activity Ticker */}
                    <div className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20 shadow-sm">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      <span>Live: {liveTxs.toLocaleString()} payloads</span>
                    </div>
                  </div>

                  {/* Stat 2 & Interactive Simulator Tooltip */}
                  <div className="relative group/calc">
                    <div className="flex items-baseline cursor-pointer">
                      <span className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold text-[var(--text-primary)] tracking-tight">
                        <AnimatedCounter end={data.stat2.num} decimals={segment === 'cloud' ? 1 : 0} />
                      </span>
                      <span className="text-2xl sm:text-3xl font-bold text-[var(--primary)] ml-1">
                        {data.stat2.suffix}
                      </span>
                      <span className="ml-3 inline-flex items-center gap-1 text-[11px] bg-[var(--primary)]/10 border border-[var(--primary)]/30 text-[var(--primary)] font-bold px-2.5 py-1 rounded-full hover:bg-[var(--primary)]/20 transition-colors">
                        <Calculator className="w-3 h-3" /> Sim
                      </span>
                    </div>
                    <p className="font-mono text-xs sm:text-sm font-bold uppercase tracking-wider text-[var(--text-muted)] mt-2">
                      {data.stat2.label}
                    </p>

                    {/* Floating Micro-Simulator Popover */}
                    <div className="absolute bottom-full left-0 mb-4 hidden group-hover/calc:block group-focus-within/calc:block w-72 p-5 bg-[var(--bg-card)]/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-[var(--border-primary)] text-sm text-[var(--text-primary)] z-50 animate-in fade-in slide-in-from-bottom-2">
                      <div className="flex justify-between items-center mb-3 border-b border-[var(--border-primary)]/50 pb-2">
                        <span className="font-bold">Yield Optimizer</span>
                        <span className="text-[10px] text-[var(--primary)] font-bold uppercase tracking-widest bg-[var(--primary)]/10 px-2 py-0.5 rounded">
                          AI Matrix
                        </span>
                      </div>
                      
                      <label className="block text-xs text-[var(--text-muted)] mb-1.5 flex justify-between">
                        <span>Solar Irradiance:</span> 
                        <span className="font-bold text-[var(--text-primary)]">{solarIrradiance} W/m²</span>
                      </label>
                      <input 
                        type="range" 
                        min="200" 
                        max="1200" 
                        step="50" 
                        value={solarIrradiance} 
                        onChange={(e) => setSolarIrradiance(parseInt(e.target.value))}
                        className="w-full accent-[var(--primary)] h-1.5 bg-[var(--bg-surface)] rounded-lg cursor-pointer mb-4"
                        aria-label="Adjust Solar Irradiance"
                      />
                      
                      <div className="p-3 bg-[var(--bg-surface)] rounded-xl flex justify-between items-center border border-[var(--border-primary)]/50">
                        <span className="text-[var(--text-secondary)] font-medium text-xs">Est. Active Yield:</span>
                        <span className="font-display font-extrabold text-[var(--primary)] text-lg flex items-center gap-1">
                          <Zap className="w-4 h-4 fill-current" /> {projectedYield}W
                        </span>
                      </div>
                    </div>
                  </div>

                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* ================= RIGHT COLUMN: VISUALS & CTA ================= */}
          <div className="lg:col-span-7 flex flex-col justify-between h-full pt-2">
            
            {/* CTA Buttons (Aligned Right) */}
            <div className="flex flex-row justify-start lg:justify-end items-center gap-4 mb-10 lg:mb-12">
              <Button
                asChild
                size="lg"
                className="rounded-full px-8 py-6 font-bold text-base bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--text-inverse)] shadow-[0_0_20px_rgba(var(--primary),0.2)] transition-all hover:-translate-y-0.5"
              >
                <Link href="/login">
                  <span>Start Orchestrating</span>
                  <ArrowUpRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="rounded-full px-8 py-6 font-bold text-base bg-[var(--bg-card)] border-[var(--border-primary)] hover:border-[var(--primary)]/50 hover:bg-[var(--bg-surface)] transition-all"
              >
                <Link href="/docs">
                  Learn More
                </Link>
              </Button>
            </div>

            {/* Custom Notched Organic Image Container */}
            <motion.div 
                className="w-full relative h-[340px] sm:h-[400px] lg:h-[480px]"
                initial={shouldAnimate ? { opacity: 0, scale: 0.95 } : { opacity: 1 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              >
                <div 
                  className="w-full h-full overflow-hidden bg-[var(--bg-surface)] border border-[var(--border-primary)]/20 shadow-2xl relative"
                  style={{
                    maskImage: maskImageURI,
                    WebkitMaskImage: maskImageURI,
                    maskSize: "100% 100%",
                    WebkitMaskSize: "100% 100%",
                    maskRepeat: "no-repeat",
                    WebkitMaskRepeat: "no-repeat"
                  }}
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={segment}
                      initial={shouldAnimate ? { opacity: 0, scale: 1.12, filter: "blur(10px)" } : { opacity: 1 }}
                      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                      exit={shouldAnimate ? { opacity: 0, scale: 0.88, filter: "blur(10px)" } : { opacity: 0 }}
                      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute inset-0"
                    >
                      <Image 
                        src={data.image}
                        alt={data.alt}
                        fill
                        priority
                        className="object-cover pointer-events-none opacity-80 mix-blend-luminosity"
                        sizes="(max-width: 1024px) 100vw, 55vw"
                      />
                      {/* Brand Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-[var(--bg-base)] via-[var(--primary)]/20 to-transparent mix-blend-overlay" />
                      {/* Glassmorphism info overlay */}
                      <div 
                        className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl"
                        style={{
                          background: "rgba(10,10,20,0.6)",
                          backdropFilter: "blur(12px)",
                          WebkitBackdropFilter: "blur(12px)",
                          border: "1px solid rgba(74,222,128,0.15)",
                          boxShadow: "0 8px 32px rgba(0,0,0,0.4)"
                        }}
                      >
                        <p className="text-xs font-mono font-bold text-[var(--primary)] uppercase tracking-widest mb-1">{data.subtitle}</p>
                        <p className="text-sm text-white/80 leading-relaxed font-medium line-clamp-2">{data.desc}</p>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </motion.div>

          </div>

        </div>
      </Container>
    </section>
  );
}