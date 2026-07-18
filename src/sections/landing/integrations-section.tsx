"use client";

import { useRef } from "react";
import { Container } from "@/components/shared/container";
import { SectionHeader } from "@/components/shared/section-header";
import { motion, useInView } from "framer-motion";
import { useMotionConfig } from "@/hooks/use-motion-config";

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface Integration {
  name: string;
  category: string;
}



// ============================================================================
// Domain Data (GridFlowX Tech Stack)
// ============================================================================

const integrations: Integration[] = [
  // Edge & Hardware
  { name: "ESP32 / ESP-IDF", category: "Hardware Firmware" },
  { name: "FreeRTOS", category: "Edge OS" },
  { name: "C++", category: "Embedded Logic" },
  { name: "ArduinoJson", category: "Serialization" },
  
  // Backend & Cloud
  { name: "FastAPI", category: "WebSocket Backend" },
  { name: "Python 3.12", category: "Core Backend" },
  { name: "WebSockets", category: "Real-time Telemetry" },
  { name: "Firebase Auth", category: "Identity" },
  { name: "Firestore", category: "NoSQL Database" },
  { name: "PostgreSQL", category: "Relational DB" },
  { name: "Prisma", category: "ORM" },
  { name: "Docker", category: "Containerization" },

  // AI & Forecasting
  { name: "PyTorch", category: "AI / ML" },
  { name: "ONNX Runtime", category: "Inference Engine" },
  { name: "OpenWeatherMap", category: "Irradiance API" },

  // Frontend & UI
  { name: "Next.js 15", category: "Frontend Framework" },
  { name: "React 19", category: "UI Library" },
  { name: "Tailwind CSS v4", category: "Styling" },
  { name: "Zustand", category: "State Management" },
  { name: "shadcn/ui", category: "UI Components" },
  { name: "Vercel", category: "Edge Deployment" },
  { name: "GitHub Actions", category: "CI/CD Pipeline" },
];

// ============================================================================
// Components
// ============================================================================

function IntegrationCard({ integration }: { integration: Integration }) {
  const { shouldAnimate } = useMotionConfig();
  return (
    <motion.div
      className="relative shrink-0 px-8 py-6 border border-[var(--border-primary)] bg-[var(--bg-card)] rounded-2xl overflow-hidden"
      whileHover={shouldAnimate ? {
        y: -6,
        borderColor: "var(--primary)",
        boxShadow: "0 0 24px var(--val-shadow-primary)",
      } : {}}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Background glow */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/10 to-transparent pointer-events-none"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />
      <div className="relative z-10 text-lg font-medium group-hover:text-[var(--primary)] transition-colors duration-300">
        {integration.name}
      </div>
      <div className="relative z-10 text-sm text-[var(--text-muted)] mt-1">
        {integration.category}
      </div>
    </motion.div>
  );
}

export function IntegrationsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });
  const { shouldAnimate } = useMotionConfig();

  const reversedIntegrations = [...integrations].reverse();

  return (
    <section id="integrations" ref={sectionRef} className="relative py-24 lg:py-32 overflow-hidden">

      {/* Inline animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee-infinite {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marquee-infinite-reverse {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0%); }
        }
        .animate-marquee-infinite {
          animation: marquee-infinite 60s linear infinite;
        }
        .animate-marquee-infinite-reverse {
          animation: marquee-infinite-reverse 60s linear infinite;
        }
        .pause-on-hover:hover .animate-marquee-infinite,
        .pause-on-hover:hover .animate-marquee-infinite-reverse {
          animation-play-state: paused;
        }
      `}} />

      <Container>
        <motion.div
          initial={shouldAnimate ? { opacity: 0, scale: 0.96, y: 20 } : { opacity: 0 }}
          animate={isInView ? { opacity: 1, scale: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <SectionHeader
            eyebrow="Core Technologies"
            align="center"
            hasTrailingLine
            title={
              <>
                Powered by an
                <br />
                <span className="text-[var(--primary)] transition-colors duration-500">enterprise stack.</span>
              </>
            }
            description={
              <>
                Built on modern, production-ready frameworks bridging <span className="text-[var(--primary)] font-semibold">edge controllers</span> to <span className="text-[var(--primary)] font-semibold">cloud infrastructure</span>.
              </>
            }
            titleClassName="mb-6"
          />
        </motion.div>
      </Container>
      
      {/* Marquee Wrapper with edge masking for smooth fade in/out */}
      <div className="w-full mt-12 flex flex-col gap-6 [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)] pause-on-hover">
        
        {/* Forward Marquee */}
        <div className="flex w-max animate-marquee-infinite gap-6 pr-6">
          {/* First Set */}
          <div className="flex gap-6 shrink-0">
            {integrations.map((integration) => (
              <IntegrationCard key={`${integration.name}-set-1`} integration={integration} />
            ))}
          </div>
          {/* Second Set (Hidden from Screen Readers to avoid duplication) */}
          <div className="flex gap-6 shrink-0" aria-hidden="true">
            {integrations.map((integration) => (
              <IntegrationCard key={`${integration.name}-set-2`} integration={integration} />
            ))}
          </div>
        </div>
        
        {/* Reverse Marquee */}
        <div className="flex w-max animate-marquee-infinite-reverse gap-6 pr-6">
          {/* First Set */}
          <div className="flex gap-6 shrink-0">
            {reversedIntegrations.map((integration) => (
              <IntegrationCard key={`${integration.name}-rev-1`} integration={integration} />
            ))}
          </div>
          {/* Second Set (Hidden from Screen Readers to avoid duplication) */}
          <div className="flex gap-6 shrink-0" aria-hidden="true">
            {reversedIntegrations.map((integration) => (
              <IntegrationCard key={`${integration.name}-rev-2`} integration={integration} />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}