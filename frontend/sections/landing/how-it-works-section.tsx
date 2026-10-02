"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { Container } from "@/components/shared/container";
import { SectionHeader } from "@/components/shared/section-header";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { useMotionConfig } from "@/hooks/use-motion-config";

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface StepProps {
  number: string;
  title: string;
  description: string;
  fileName: string;
  code: string;
}

// ============================================================================
// Domain Data (GridFlowX Specific)
// ============================================================================

const steps: StepProps[] = [
  {
    number: "I",
    title: "Edge-Cloud Telemetry Sync",
    description: "ESP32 edge microcontrollers stream high-frequency sensor data to the FastAPI hub via secure, bi-directional WebSockets.",
    fileName: "telemetry_payload.json",
    code: `{
  "deviceId": "ESP32-NODE-01",
  "timestamp": 1718812800,
  "metrics": {
    "solar_v": 18.4,
    "solar_a": 5.2,
    "battery_soc": 84.5,
    "grid_active": true
  }
}`,
  },
  {
    number: "II",
    title: "Predictive AI Inference",
    description: "The Python AI Agent processes real-time and historical data through LSTM forecasting tools to predict 1-hour ahead solar yield.",
    fileName: "agent_core.py",
    code: `@app.websocket("/ws/telemetry")
async def process_telemetry(ws: WebSocket):
    await ws.accept()
    data = await ws.receive_json()

    # Predict 1-hr ahead solar yield (LSTM)
    yield_pred = forecast_tool.predict(data)
    
    await decision_layer.evaluate(yield_pred)`,
  },
  {
    number: "III",
    title: "Autonomous Priority Routing",
    description: "The decision core routes power based on predictive models and state-of-charge, safely shedding non-critical loads.",
    fileName: "router.py",
    code: `def enforce_load_shedding(soc: float):
    if soc < 20.0:
        # Shed Tier 3 (Flexible) Loads
        relay_matrix.deenergize(channels=[4,5,6])
        
    elif soc < 5.0:
        # Sub-10ms Emergency Cutoff
        failsafe.trigger_hardware_interrupt()`,
  },
];

// ============================================================================
// Main Component
// ============================================================================

export function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState(0);
  const { shouldAnimate, transitions } = useMotionConfig();

  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });

  // Auto-rotate steps every 6 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Memoize the animated code block
  const animatedCodeBlock = useMemo(() => {
    const lines = steps[activeStep].code.split('\n');
    return lines.map((line, lineIndex) => {
      const commentIndex = line.indexOf('#');
      let normalPart = line;
      let commentPart = '';
      if (commentIndex !== -1) {
        normalPart = line.substring(0, commentIndex);
        commentPart = line.substring(commentIndex);
      }

      const renderChars = (str: string, startIndex: number, isComment: boolean) => {
        return str.split('').map((char, charIndex) => {
          const globalCharIndex = startIndex + charIndex;
          return (
            <span
              key={`${activeStep}-${lineIndex}-${globalCharIndex}`}
              className={cn(
                "code-char-reveal",
                isComment ? "text-[var(--primary)] font-semibold" : ""
              )}
              style={{ animationDelay: `${lineIndex * 80 + globalCharIndex * 15}ms` }}
            >
              {char === ' ' ? '\u00A0' : char}
            </span>
          );
        });
      };

      return (
        <div
          key={`${activeStep}-${lineIndex}`}
          className="leading-loose code-line-reveal"
          style={{ animationDelay: `${lineIndex * 80}ms` }}
        >
          <span className="text-[var(--text-muted)]/20 select-none w-8 inline-block">
            {lineIndex + 1}
          </span>
          <span className="inline-flex">
            {renderChars(normalPart, 0, false)}
            {commentPart && renderChars(commentPart, normalPart.length, true)}
          </span>
        </div>
      );
    });
  }, [activeStep]);

  const staggerContainer = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.15, delayChildren: 0.1 } },
  };

  const stepVariant = {
    hidden: shouldAnimate ? { opacity: 0, x: -24 } : { opacity: 0 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
  };

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className="relative py-24 lg:py-32 bg-black text-white overflow-hidden"
    >
      {/* Diagonal lines pattern */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
        <div className="absolute inset-0 diagonal-lines" />
      </div>

      <Container className="relative z-10">
        <motion.div
          initial={shouldAnimate ? { opacity: 0, y: 24 } : { opacity: 0 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <SectionHeader
            eyebrow="Agentic Flow"
            title={
              <>
                Sense. Predict.
                <br />
                <span className="text-[var(--primary)]">Act Autonomously.</span>
              </>
            }
            titleClassName="text-white font-display"
            descriptionClassName="text-zinc-400"
          />
        </motion.div>

        {/* Main content */}
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">

          {/* Steps List */}
          <motion.div
            className="space-y-0"
            role="tablist"
            variants={staggerContainer}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
          >
            {steps.map((step, index) => (
              <motion.button
                key={step.number}
                type="button"
                role="tab"
                aria-selected={activeStep === index}
                onClick={() => setActiveStep(index)}
                variants={stepVariant}
                className={cn(
                  "w-full text-left py-8 border-b border-zinc-800 transition-all duration-500 group relative",
                  activeStep === index ? "opacity-100" : "opacity-40 hover:opacity-75"
                )}
              >
                {/* Active step glow ring */}
                {activeStep === index && (
                  <motion.div
                    layoutId="step-glow"
                    className="absolute left-0 top-0 bottom-0 w-0.5 bg-[var(--primary)] rounded-full"
                    transition={transitions.spring}
                  />
                )}

                <div className="flex items-start gap-6 pl-4">
                  <span className={cn(
                    "font-display text-3xl transition-colors duration-500",
                    activeStep === index ? "text-[var(--primary)]" : "text-zinc-800"
                  )}>
                    {step.number}
                  </span>
                  <div className="flex-1">
                    <motion.h3
                      className="text-2xl lg:text-3xl font-display mb-3 text-white"
                      animate={activeStep === index && shouldAnimate ? { x: 4 } : { x: 0 }}
                      transition={transitions.snappy}
                    >
                      {step.title}
                    </motion.h3>
                    <p className="text-zinc-400 leading-relaxed text-sm lg:text-base">
                      {step.description}
                    </p>

                    {/* Progress indicator — Framer Motion driven */}
                    {activeStep === index && (
                      <div className="mt-4 h-px bg-zinc-850 overflow-hidden">
                        <motion.div
                          className="h-full bg-[var(--primary)]"
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ duration: 6, ease: "linear" }}
                          style={{ transformOrigin: "left" }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </motion.button>
            ))}
          </motion.div>

          {/* Code display — AnimatePresence for cross-fade transitions */}
          <motion.div
            className="lg:sticky lg:top-32 self-start"
            initial={shouldAnimate ? { opacity: 0, x: 40 } : { opacity: 0 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          >
            <div className="border border-zinc-800 rounded-lg overflow-hidden bg-zinc-950 shadow-2xl">

              {/* Window header */}
              <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/40">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-zinc-800" />
                  <div className="w-3 h-3 rounded-full bg-zinc-800" />
                  <div className="w-3 h-3 rounded-full bg-zinc-800" />
                </div>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={steps[activeStep].fileName}
                    initial={shouldAnimate ? { opacity: 0, y: -6 } : { opacity: 0 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={shouldAnimate ? { opacity: 0, y: 6 } : { opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="text-xs font-mono text-[var(--primary)]"
                  >
                    {steps[activeStep].fileName}
                  </motion.span>
                </AnimatePresence>
              </div>

              {/* Code content — animates when step changes */}
              <div className="p-8 font-mono text-xs sm:text-sm min-h-[300px]">
                <pre className="sr-only">{steps[activeStep].code}</pre>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeStep}
                    initial={shouldAnimate ? { opacity: 0, y: 12 } : { opacity: 0 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={shouldAnimate ? { opacity: 0, y: -12 } : { opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] as const }}
                    className="text-zinc-300"
                    aria-hidden="true"
                  >
                    {animatedCodeBlock}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Status */}
              <div className="px-6 py-4 border-t border-zinc-800 flex items-center gap-3">
                <motion.span
                  className="w-2 h-2 rounded-full bg-[var(--primary)]"
                  animate={shouldAnimate ? { opacity: [1, 0.3, 1], scale: [1, 1.3, 1] } : {}}
                  transition={transitions.breathe}
                />
                <span className="text-xs font-mono text-[var(--primary)]/60 uppercase tracking-widest">
                  System Active
                </span>
              </div>

            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}