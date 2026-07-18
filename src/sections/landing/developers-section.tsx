"use client";

import { useState, useMemo, useRef } from "react";
import Link from "next/link";
import { 
  Copy, 
  Check, 
  Terminal, 
  Activity, 
  ShieldCheck, 
  Cpu, 
  BrainCircuit,
  BookOpen
} from "lucide-react";
import { Container } from "@/components/shared/container";
import { SectionHeader } from "@/components/shared/section-header";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { useMotionConfig } from "@/hooks/use-motion-config";

const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

// ============================================================================
// Types & Interfaces
// ============================================================================

interface CodeExample {
  label: string;
  fileName: string;
  code: string;
}

interface DevFeature {
  title: string;
  description: string;
  icon: React.ElementType;
}

// ============================================================================
// Domain Data (GridFlowX Integration)
// ============================================================================

const codeExamples: CodeExample[] = [
  {
    label: "Edge (C++)",
    fileName: "telemetry.cpp",
    code: `// ESP32 Telemetry Broadcast (FreeRTOS Core 1)
StaticJsonDocument<200> doc;
doc["deviceId"] = "ESP32-NODE-01";
doc["solar_v"] = 18.4;
doc["battery_soc"] = 84.5;

String payload;
serializeJson(doc, payload);
webSocket.sendTXT(payload);`,
  },
  {
    label: "Cloud (Python)",
    fileName: "hub.py",
    code: `# FastAPI Edge Hub & Agent Router
@app.websocket("/ws/edge")
async def edge_endpoint(ws: WebSocket):
    await ws.accept()
    data = await ws.receive_json()
    
    # Route to AI optimization layer
    action = await optimization_agent.process(data)
    await ws.send_json(action)`,
  },
  {
    label: "Client (TypeScript)",
    fileName: "dashboard.tsx",
    code: `// Next.js React 19 Client
import { useTelemetry } from '@/store/zustand'

export function GridDashboard() {
  const { soc, gridActive } = useTelemetry()
  
  return (
    <BatteryStatus 
      level={soc} 
      status={gridActive ? 'charging' : 'discharging'} 
    />
  )
}`,
  },
];

const features: DevFeature[] = [
  { 
    title: "Sub-100ms Latency", 
    description: "Bi-directional **WebSocket streams** built for real-time **edge control**.",
    icon: Activity
  },
  { 
    title: "Strict Typing", 
    description: "End-to-end **type safety** from FastAPI (Pydantic) to **Next.js (Zod)**.",
    icon: ShieldCheck
  },
  { 
    title: "Hardware Agnostic", 
    description: "Seamlessly integrate **ESP32**, Raspberry Pi, and industrial **PLCs**.",
    icon: Cpu
  },
  { 
    title: "AI-Ready Payloads", 
    description: "Edge-normalized data optimized for **PyTorch** and **ONNX inference**.",
    icon: BrainCircuit
  },
];

function renderDescription(text: string) {
  const parts = text.split("**");
  return parts.map((part, i) => 
    i % 2 === 1 
      ? <span key={i} className="text-[var(--primary)] font-semibold transition-colors duration-500">{part}</span> 
      : part
  );
}

// Inline styles preserved for self-contained animation
const codeAnimationStyles = `
  .dev-code-line {
    opacity: 0;
    transform: translateX(-8px);
    animation: devLineReveal 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }
  @keyframes devLineReveal {
    to { opacity: 1; transform: translateX(0); }
  }
  .dev-code-char {
    opacity: 0;
    filter: blur(8px);
    animation: devCharReveal 0.3s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }
  @keyframes devCharReveal {
    to { opacity: 1; filter: blur(0); }
  }
`;

// ============================================================================
// Main Component
// ============================================================================

export function DevelopersSection() {
  const [activeTab, setActiveTab] = useState(0);
  const [copied, setCopied] = useState(false);
  
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });
  const { shouldAnimate, transitions } = useMotionConfig();

  const handleCopy = () => {
    navigator.clipboard.writeText(codeExamples[activeTab].code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Memoize the animated span generation to prevent huge re-rendering costs 
  const animatedCodeBlock = useMemo(() => {
    const lines = codeExamples[activeTab].code.split('\n');
    
    return lines.map((line, lineIndex) => {
      // Find comment index for either // (JS/C++) or # (Python)
      let commentIndex = line.indexOf('//');
      if (commentIndex === -1) {
        commentIndex = line.indexOf('#');
      }
      
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
              key={`${activeTab}-${lineIndex}-${globalCharIndex}`}
              className={cn(
                "dev-code-char",
                isComment ? "text-[var(--primary)] font-semibold" : ""
              )}
              style={{
                animationDelay: `${lineIndex * 80 + globalCharIndex * 15}ms`,
              }}
            >
              {char === ' ' ? '\u00A0' : char}
            </span>
          );
        });
      };

      return (
        <div 
          key={`${activeTab}-${lineIndex}`} 
          className="leading-loose dev-code-line"
          style={{ animationDelay: `${lineIndex * 80}ms` }}
        >
          <span className="inline-flex">
            {renderChars(normalPart, 0, false)}
            {commentPart && renderChars(commentPart, normalPart.length, true)}
          </span>
        </div>
      );
    });
  }, [activeTab]);

  return (
    <section id="developers" ref={sectionRef} className="relative py-16 sm:py-24 lg:py-32 bg-black text-white overflow-hidden">
      <style dangerouslySetInnerHTML={{ __html: codeAnimationStyles }} />
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-16 lg:gap-24 items-start">

          {/* Left: Content */}
          <motion.div
            initial={shouldAnimate ? { opacity: 0, x: -32 } : { opacity: 0 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col"
          >
            <SectionHeader
              eyebrow="Developer API"
              title={
                <>
                  Built for the edge.
                  <br />
                  <span className="text-[var(--primary)] transition-colors duration-500">Powered by the cloud.</span>
                </>
              }
              description="A robust, low-latency API bridging physical microgrids with cloud intelligence. Integrate telemetry, AI forecasts, and hardware relays seamlessly."
              titleClassName="text-white font-display"
              descriptionClassName="text-zinc-400 mb-8 sm:mb-12"
              className="mb-8 lg:mb-10 max-w-none text-left"
            />
            
            {/* Interactive Feature Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={shouldAnimate ? { opacity: 0, x: -24 } : { opacity: 0 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.2 + index * 0.07 }}
                  whileHover={shouldAnimate ? { scale: 1.02 } : {}}
                  className="group relative p-5 rounded-2xl border border-zinc-800 bg-zinc-900/30 hover:bg-zinc-900/60 hover:border-zinc-700 transition-colors duration-300"
                >
                  <div className="mb-4 inline-flex items-center justify-center w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 text-[var(--primary)] group-hover:bg-[var(--primary)] group-hover:text-[var(--text-inverse)] group-hover:shadow-[0_0_15px_var(--val-shadow-primary)] transition-all duration-300">
                    <feature.icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm sm:text-base font-semibold mb-1.5 text-white group-hover:text-[var(--primary)] transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                    {renderDescription(feature.description)}
                  </p>
                </motion.div>
              ))}
            </div>

          </motion.div>
          
          {/* Right: Code block */}
          <motion.div
            initial={shouldAnimate ? { opacity: 0, x: 32 } : { opacity: 0 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
            className="lg:sticky lg:top-32"
          >
            <div className="border border-zinc-800 rounded-xl bg-zinc-950 w-full overflow-hidden shadow-2xl relative z-10">
              
              {/* Tabs */}
              <div className="flex items-center overflow-x-auto scrollbar-none border-b border-zinc-800 w-full bg-zinc-900/40">
                {codeExamples.map((example, idx) => (
                  <button
                    key={example.label}
                    type="button"
                    onClick={() => setActiveTab(idx)}
                    className={cn(
                      "px-4 py-3 sm:px-6 sm:py-4 text-xs sm:text-sm font-mono transition-colors relative shrink-0 min-h-[44px]",
                      activeTab === idx
                        ? "text-[var(--primary)] font-medium"
                        : "text-zinc-500 hover:text-zinc-300"
                    )}
                  >
                    {example.label}
                    {activeTab === idx && (
                      <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--primary)] transition-colors duration-500" />
                    )}
                  </button>
                ))}
                
                <div className="flex-1 min-w-[20px]" />
                
                {/* File Name Indicator */}
                <div className="hidden sm:flex items-center pr-4 text-xs font-mono text-zinc-500">
                  {codeExamples[activeTab].fileName}
                </div>
                
                {/* Copy Button */}
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-3 py-3 sm:px-4 sm:py-4 border-l border-zinc-800 text-zinc-500 hover:text-[var(--primary)] hover:bg-zinc-900/50 transition-colors shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
                  aria-label="Copy code to clipboard"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-[var(--primary)] transition-colors" />
                  ) : (
                    <Copy className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  )}
                </button>
              </div>
              
              {/* Code content */}
              <div className="p-4 sm:p-6 lg:p-8 font-mono text-xs sm:text-sm bg-black/20 min-h-[220px] sm:min-h-[260px] overflow-x-auto scrollbar-none relative">
                
                {/* ACCESSIBILITY: Screen Readers read this hidden block */}
                <pre className="sr-only">
                  {codeExamples[activeTab].code}
                </pre>
                
                {/* VISUAL: Animated characters */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={shouldAnimate ? { opacity: 0, y: 10 } : { opacity: 0 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={shouldAnimate ? { opacity: 0, y: -10 } : { opacity: 0 }}
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    aria-hidden="true"
                    className="text-zinc-300 font-medium"
                  >
                    {animatedCodeBlock}
                  </motion.div>
                </AnimatePresence>
                
              </div>
            </div>

            {/* CTA Buttons (Properly positioned in right column) */}
            <motion.div
              initial={shouldAnimate ? { opacity: 0, y: 16 } : { opacity: 0 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] as const, delay: 0.4 }}
              className="mt-8 sm:mt-12 flex flex-col sm:flex-row items-center gap-4 relative z-10"
            >
              <Link href="/docs/api" className="w-full sm:w-auto">
                <motion.div
                  whileHover={shouldAnimate ? { scale: 1.03 } : {}}
                  whileTap={shouldAnimate ? { scale: 0.97 } : {}}
                >
                  <motion.div
                    animate={shouldAnimate ? { boxShadow: ["0 0 10px var(--val-shadow-primary)", "0 0 28px var(--val-shadow-primary)", "0 0 10px var(--val-shadow-primary)"] } : {}}
                    transition={transitions.breathe}
                    className="rounded-full"
                  >
                    <Button
                      size="lg"
                      className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--text-inverse)] px-8 h-14 text-base rounded-full group w-full sm:w-auto transition-all flex items-center justify-center gap-2"
                    >
                      <BookOpen className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
                      Read API Documentation
                    </Button>
                  </motion.div>
                </motion.div>
              </Link>
              <a href="https://github.com/gridflowx" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                <motion.div
                  whileHover={shouldAnimate ? { scale: 1.03 } : {}}
                  whileTap={shouldAnimate ? { scale: 0.97 } : {}}
                >
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-14 px-8 text-base rounded-full border-[var(--primary)]/30 text-[var(--primary)] hover:bg-[var(--primary)]/10 w-full sm:w-auto transition-colors flex items-center justify-center gap-2"
                  >
                    <GithubIcon className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors" />
                    View ESP32 Schema
                  </Button>
                </motion.div>
              </a>
            </motion.div>

            {/* Decorative abstract elements behind code window */}
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-[var(--primary)]/10 blur-[80px] rounded-full pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-white/5 blur-[80px] rounded-full pointer-events-none" />
          </motion.div>
          
        </div>
      </Container>
    </section>
  );
}