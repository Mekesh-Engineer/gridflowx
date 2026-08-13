"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { ChevronRight, ChevronLeft, Activity, Cpu, Server, Play } from "lucide-react";
import { Container } from "@/components/shared/container";
import { useMotionConfig, calc3DTilt } from "@/hooks/use-motion-config";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

// ============================================================================
// Domain Data (GridFlowX Pipeline)
// ============================================================================

type WidgetType = "telemetry" | "ai" | "hardware";

interface StepData {
  stepNum: string;
  tag: string;
  title: string;
  desc: string;
  nextStepNum: string;
  nextTitle: string;
  widgetType: WidgetType;
  image: string;
}

const STEPS_DATA: StepData[] = [
  {
    stepNum: "Step 01",
    tag: "Edge Data Acquisition",
    title: "Continuous<br/>Telemetry Sync",
    desc: "ESP32 edge nodes acquire multi-channel current, voltage, and thermal data, streaming to the FastAPI hub via sub-second WebSockets.",
    nextStepNum: "Step 02",
    nextTitle: "Predictive AI<br/>Inference Engine",
    widgetType: "telemetry",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80",
  },
  {
    stepNum: "Step 02",
    tag: "Cloud Intelligence",
    title: "Predictive AI<br/>Inference Engine",
    desc: "The Python AI Agent processes incoming edge matrices through LSTM models to forecast 1-hour ahead solar irradiance and load volatility.",
    nextStepNum: "Step 03",
    nextTitle: "Autonomous Priority<br/>Load Routing",
    widgetType: "ai",
    image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=800&q=80",
  },
  {
    stepNum: "Step 03",
    tag: "Hardware Execution",
    title: "Autonomous Priority<br/>Load Routing",
    desc: "The decision core routes power based on predictive models. If anomalies occur, the local ESP32 Core 0 enforces hard cutoffs under 10ms.",
    nextStepNum: "Step 01",
    nextTitle: "Continuous<br/>Telemetry Sync",
    widgetType: "hardware",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
  }
];

const AUTO_ADVANCE_DURATION_MS = 8000;

// ============================================================================
// Micro-Widgets
// ============================================================================

function TelemetryWidget() {
  return (
    <div className="mb-4 p-3 bg-[var(--bg-base)] border border-[var(--border-primary)] rounded-xl shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-[var(--primary)]" /> Edge Stream
        </span>
        <span className="text-[10px] bg-[var(--primary)]/10 text-[var(--primary)] font-bold px-2 py-0.5 rounded">100Hz</span>
      </div>
      <div className="font-mono text-[10px] text-[var(--text-secondary)] bg-black/50 p-2 rounded-lg leading-relaxed">
        <span className="text-cyan-400">{"{"}</span><br/>
        &nbsp;&nbsp;<span className="text-emerald-400">"v_bus"</span>: 24.5,<br/>
        &nbsp;&nbsp;<span className="text-emerald-400">"i_load"</span>: 12.1,<br/>
        &nbsp;&nbsp;<span className="text-emerald-400">"soc"</span>: 84.2<br/>
        <span className="text-cyan-400">{"}"}</span>
      </div>
    </div>
  );
}

function AIWidget() {
  return (
    <div className="mb-4 p-3 bg-cyan-500/5 border border-cyan-500/20 rounded-xl shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
          <Server className="w-3.5 h-3.5 text-cyan-400" /> LSTM Forecast
        </span>
        <span className="text-[10px] bg-cyan-500/10 text-cyan-400 font-bold px-2 py-0.5 rounded">22.8ms</span>
      </div>
      <div className="flex items-end justify-between px-2">
        <div className="flex flex-col">
          <span className="text-[10px] text-[var(--text-muted)]">T+1hr Yield</span>
          <span className="text-lg font-display font-bold text-cyan-400">840W</span>
        </div>
        <div className="flex gap-1 h-8 items-end">
          {[40, 60, 45, 80, 100].map((h, i) => (
            <motion.div 
              key={i} 
              className="w-1.5 bg-cyan-400 rounded-t-sm" 
              initial={{ height: 0 }}
              animate={{ height: `${h}%` }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function HardwareWidget() {
  return (
    <div className="mb-4 p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-2.5">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
        </span>
        <span className="text-xs font-bold text-amber-500">Core 0 Failsafe Active</span>
      </div>
      <span className="text-[10px] text-amber-500 font-bold bg-amber-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
        <Cpu className="w-3 h-3" /> Armed
      </span>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export default function AboutHowItWorksSection() {
  const [activeStep, setActiveStep] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const { shouldAnimate, transitions } = useMotionConfig();
  const sectionRef = useRef<HTMLDivElement>(null);
  const tiltCardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });

  // Auto-advance Timer & Progress Circle
  useEffect(() => {
    if (!isInView || isPaused) return;

    let startTime: number;
    let animationFrameId: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const currentProgress = (elapsed / AUTO_ADVANCE_DURATION_MS) * 100;

      if (currentProgress >= 100) {
        setActiveStep((prev) => (prev + 1) % STEPS_DATA.length);
        setProgress(0);
        startTime = timestamp; // Reset timer seamlessly
      } else {
        setProgress(currentProgress);
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrameId);
  }, [isInView, isPaused, activeStep]);

  // Manual Navigation
  const goToStep = (index: number) => {
    setActiveStep(index);
    setProgress(0);
  };

  const handleNext = () => goToStep((activeStep + 1) % STEPS_DATA.length);
  const handlePrev = () => goToStep((activeStep - 1 + STEPS_DATA.length) % STEPS_DATA.length);

  // Tilt Effect Handler
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!shouldAnimate || !tiltCardRef.current) return;
    const { rotateX, rotateY } = calc3DTilt(e, tiltCardRef.current, 6);
    setTilt({ rotateX, rotateY });
  };

  const handleMouseLeave = () => setTilt({ rotateX: 0, rotateY: 0 });

  const data = STEPS_DATA[activeStep];
  const circleCircumference = 2 * Math.PI * 23; // r=23
  const strokeDashoffset = circleCircumference - (progress / 100) * circleCircumference;

  const maskImageURI = `url("data:image/svg+xml,%3Csvg viewBox='0 0 600 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M 40,0 L 460,0 C 480,0 500,20 500,40 L 500,50 C 500,75 525,100 550,100 L 560,100 C 580,100 600,120 600,140 L 600,360 C 600,382 582,400 560,400 L 140,400 C 120,400 100,380 100,360 L 100,350 C 100,325 75,300 50,300 L 40,300 C 20,300 0,280 0,260 L 0,40 C 0,18 18,0 40,0 Z' fill='black'/%3E%3C/svg%3E")`;

  return (
    <section 
      id="how-it-works" 
      ref={sectionRef}
      className="relative py-20 lg:py-32 overflow-hidden"
      style={{ background: "var(--bg-base)" }}
    >
      <Container className="max-w-7xl">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12 lg:mb-16">
          <motion.div 
            initial={shouldAnimate ? { opacity: 0, y: 20 } : { opacity: 1 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl sm:text-5xl lg:text-[56px] font-display font-extrabold text-[var(--text-primary)] tracking-tight leading-[1.15]">
              Intelligent Flow,<br/>Autonomous Action
            </h2>
          </motion.div>

          <motion.div 
            initial={shouldAnimate ? { opacity: 0, y: 20 } : { opacity: 1 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-col items-start lg:items-start max-w-md"
          >
            <div className="inline-flex items-center bg-[var(--bg-card)] border border-[var(--border-primary)] text-[var(--primary)] text-xs font-bold px-4 py-1.5 rounded-full shadow-sm mb-4 uppercase tracking-wider">
              Orchestration Pipeline
            </div>
            <p className="text-[var(--text-secondary)] text-base sm:text-lg leading-relaxed">
              We collapse the physical-digital divide, executing predictive strategies directly on the hardware edge.
            </p>
          </motion.div>
        </div>

        <div 
          className="relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Progress Track */}
          <motion.div 
            initial={shouldAnimate ? { opacity: 0, scale: 0.95 } : { opacity: 1 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-10 w-full bg-[var(--bg-card)]/70 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-[var(--border-primary)] shadow-sm relative z-20"
          >
            <div className="flex items-center justify-between relative max-w-2xl mx-auto px-4 sm:px-8">
              {/* Background Line Track */}
              <div className="absolute top-1/2 left-8 right-8 -translate-y-1/2 h-1 bg-[var(--bg-surface)] rounded-full z-0" />
              
              {/* Active Progress Fill — Neon glow bar */}
              <motion.div 
                className="absolute top-1/2 left-8 -translate-y-1/2 h-1 rounded-full z-0" 
                animate={{ width: `${(activeStep / (STEPS_DATA.length - 1)) * 100}%` }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                style={{ 
                  background: "linear-gradient(90deg, var(--primary), rgba(34,211,238,0.9))",
                  boxShadow: "0 0 10px rgba(74,222,128,0.6), 0 0 20px rgba(74,222,128,0.3)"
                }}
              />

              {/* Nodes */}
              {STEPS_DATA.map((step, idx) => {
                const isActiveOrPassed = idx <= activeStep;
                return (
                  <button 
                    key={idx}
                    onClick={() => goToStep(idx)} 
                    className="relative z-10 flex flex-col items-center group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--primary)] rounded-full"
                    aria-label={`Go to ${step.stepNum}`}
                    aria-current={activeStep === idx ? "step" : undefined}
                  >
                    <span 
                      className={cn(
                        "w-9 h-9 rounded-full text-xs font-bold flex items-center justify-center shadow-md transition-all duration-300",
                        isActiveOrPassed 
                          ? "bg-[var(--primary)] text-[var(--bg-base)] scale-110 ring-4 ring-[var(--primary)]/20 border border-transparent" 
                          : "bg-[var(--bg-card)] border-2 border-[var(--border-primary)] text-[var(--text-muted)] group-hover:border-[var(--primary)]"
                      )}
                    >
                      0{idx + 1}
                    </span>
                    <span className={cn(
                      "text-[11px] font-semibold mt-2 transition-colors",
                      isActiveOrPassed ? "text-[var(--primary)]" : "text-[var(--text-muted)] group-hover:text-[var(--text-primary)]"
                    )}>
                      {step.tag.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* Steps Carousel / Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* Column 1: Controls */}
            <motion.div 
              initial={shouldAnimate ? { opacity: 0, x: -20 } : { opacity: 1 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="lg:col-span-2 flex flex-col justify-between items-start py-2 min-h-[140px] lg:min-h-[380px]"
            >
              <AnimatePresence mode="wait">
                <motion.div 
                  key={data.stepNum}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={transitions.snappy}
                  className="inline-flex items-center bg-[var(--bg-surface)] border border-[var(--border-primary)] text-[var(--text-primary)] text-sm font-semibold px-5 py-2 rounded-full shadow-sm"
                >
                  {data.stepNum}
                </motion.div>
              </AnimatePresence>

              {/* Navigation Controls */}
              <div className="flex items-center gap-3 mt-6 lg:mt-auto">
                <button 
                  onClick={handlePrev} 
                  aria-label="Previous Step" 
                  className="w-11 h-11 rounded-full border border-[var(--border-primary)] text-[var(--text-primary)] bg-[var(--bg-card)] hover:bg-[var(--bg-surface)] hover:text-[var(--primary)] hover:border-[var(--primary)]/50 transition-all flex items-center justify-center shadow-sm active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {/* Circular Progress Next Button */}
                <div className="relative inline-flex items-center justify-center group/ring">
                  <svg className="w-14 h-14 transform -rotate-90">
                    <circle cx="28" cy="28" r="23" stroke="var(--border-primary)" strokeWidth="3" fill="none" />
                    <circle 
                      cx="28" cy="28" r="23" 
                      stroke="var(--primary)" 
                      strokeWidth="3" 
                      fill="none" 
                      strokeDasharray={circleCircumference} 
                      strokeDashoffset={strokeDashoffset} 
                      className="transition-all duration-100 ease-linear" 
                    />
                  </svg>
                  <button 
                    onClick={handleNext} 
                    aria-label="Next Step" 
                    className="absolute w-11 h-11 rounded-full border border-transparent text-[var(--text-primary)] bg-[var(--bg-surface)] hover:bg-[var(--primary)] hover:text-[var(--text-inverse)] transition-all flex items-center justify-center shadow-sm active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Column 2: 3D Image Card */}
            <motion.div 
              initial={shouldAnimate ? { opacity: 0, y: 20 } : { opacity: 1 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="lg:col-span-4" 
              style={{ perspective: "1000px" }}
            >
              <motion.div 
                ref={tiltCardRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                animate={{ rotateX: tilt.rotateX, rotateY: tilt.rotateY }}
                transition={transitions.spring}
                className="bg-[var(--bg-card)] rounded-[28px] p-6 shadow-xl flex flex-col justify-between border border-[var(--border-primary)] h-full min-h-[380px]"
                style={{ transformStyle: "preserve-3d", boxShadow: "0 0 0 1px rgba(74,222,128,0.08), 0 20px 60px rgba(0,0,0,0.4)" }}
              >
                <div className="w-full h-[210px] relative mb-6">
                  <div 
                    className="w-full h-full overflow-hidden bg-[var(--bg-surface)] relative"
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
                         key={data.image}
                         initial={shouldAnimate ? { opacity: 0, scale: 1.1, filter: "blur(8px)" } : { opacity: 1 }}
                         animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                         exit={shouldAnimate ? { opacity: 0, scale: 0.9, filter: "blur(8px)" } : { opacity: 0 }}
                         transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute inset-0"
                      >
                        <Image 
                          src={data.image} 
                          alt="Process Graphic" 
                          fill 
                          className="object-cover opacity-80 mix-blend-luminosity"
                          sizes="(max-width: 1024px) 100vw, 33vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-tr from-[var(--bg-base)] via-[var(--primary)]/20 to-transparent mix-blend-overlay" />
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>

                <div>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={data.title}
                      initial={shouldAnimate ? { opacity: 0, y: 10 } : { opacity: 1 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={shouldAnimate ? { opacity: 0, y: -10 } : { opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <span className="block text-[var(--primary)] font-bold text-xs uppercase tracking-widest mb-2">
                        {data.tag}
                      </span>
                      <h3 
                        className="text-2xl sm:text-3xl font-display font-bold text-[var(--text-primary)] leading-tight tracking-tight"
                        dangerouslySetInnerHTML={{ __html: data.title }}
                      />
                    </motion.div>
                  </AnimatePresence>
                </div>
              </motion.div>
            </motion.div>

            {/* Column 3: Explanation & Dynamic Widget */}
            <motion.div 
              initial={shouldAnimate ? { opacity: 0, y: 20 } : { opacity: 1 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="lg:col-span-3 rounded-[28px] p-7 shadow-xl flex flex-col justify-between items-start border min-h-[380px]"
              style={{ 
                background: "rgba(10,14,20,0.7)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                border: "1px solid rgba(74,222,128,0.15)",
                boxShadow: "0 0 30px rgba(74,222,128,0.06), 0 20px 60px rgba(0,0,0,0.5)"
              }}
            >
              <AnimatePresence mode="wait">
                <motion.p 
                  key={data.desc}
                  initial={shouldAnimate ? { opacity: 0, x: -10 } : { opacity: 1 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={shouldAnimate ? { opacity: 0, x: 10 } : { opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-[var(--text-secondary)] text-sm sm:text-base leading-relaxed mb-4"
                >
                  {data.desc}
                </motion.p>
              </AnimatePresence>

              {/* Dynamic Contextual Micro-Widget */}
              <div className="w-full my-auto">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={data.widgetType}
                    initial={shouldAnimate ? { opacity: 0, scale: 0.95 } : { opacity: 1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={shouldAnimate ? { opacity: 0, scale: 0.95 } : { opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {data.widgetType === 'telemetry' && <TelemetryWidget />}
                    {data.widgetType === 'ai' && <AIWidget />}
                    {data.widgetType === 'hardware' && <HardwareWidget />}
                  </motion.div>
                </AnimatePresence>
              </div>

              <Link href="/dashboard" className="w-full">
                <button 
                  className="font-bold text-sm px-7 py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--primary)]"
                  style={{
                    background: "linear-gradient(135deg, var(--primary), rgba(34,211,238,0.8))",
                    color: "var(--text-inverse)",
                    boxShadow: "0 0 20px rgba(74,222,128,0.3), 0 0 40px rgba(74,222,128,0.1)"
                  }}
                >
                  <span>View Terminal</span>
                  <Play className="w-3.5 h-3.5 fill-current" />
                </button>
              </Link>
            </motion.div>

            {/* Column 4: Next Step Preview */}
            <motion.div 
              initial={shouldAnimate ? { opacity: 0, x: 20 } : { opacity: 1 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="lg:col-span-3 flex flex-col justify-end items-start p-6 lg:p-8 rounded-[28px] bg-[var(--bg-surface)] border border-[var(--border-primary)] min-h-[380px]"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={data.nextStepNum}
                  initial={shouldAnimate ? { opacity: 0, y: 10 } : { opacity: 1 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={shouldAnimate ? { opacity: 0, y: -10 } : { opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="w-full"
                >
                  <span className="block text-[var(--text-muted)] font-mono font-bold uppercase tracking-widest text-xs mb-2.5">
                    Up Next — {data.nextStepNum}
                  </span>
                  <h4 
                    className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] leading-snug mb-8 opacity-50"
                    dangerouslySetInnerHTML={{ __html: data.nextTitle }}
                  />
                </motion.div>
              </AnimatePresence>

              <button 
                onClick={handleNext} 
                className="bg-[var(--bg-card)] hover:bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--border-primary)] hover:border-[var(--primary)] font-semibold text-sm px-6 py-3 rounded-full shadow-sm hover:shadow-md transition-all flex items-center gap-2 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
              >
                <span>Skip to Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>

          </div>
        </div>
      </Container>
    </section>
  );
}