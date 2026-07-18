"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/shared/container";
import { ArrowRight, Terminal } from "lucide-react";
import dynamic from "next/dynamic";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { useMotionConfig } from "@/hooks/use-motion-config";

const AnimatedTetrahedron = dynamic(
  () => import("@/animations/animated-tetrahedron").then((mod) => mod.AnimatedTetrahedron),
  { ssr: false }
);



// ============================================================================
// Main Component
// ============================================================================

export function CtaSection() {
  const { shouldAnimate, transitions } = useMotionConfig();
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Scroll parallax for tetrahedron
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const tetrahedronY = useTransform(scrollYProgress, [0, 1], [shouldAnimate ? 40 : 0, shouldAnimate ? -40 : 0]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  return (
    <section ref={sectionRef} className="relative py-24 lg:py-32 overflow-hidden border-t border-[var(--border-primary)]/10">
      <Container>
        <motion.div
          initial={shouldAnimate ? { opacity: 0, y: 40, scale: 0.97 } : { opacity: 0 }}
          animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative border border-[var(--border-primary)]/20 bg-[var(--bg-surface)]/[0.2] rounded-3xl overflow-hidden"
          onMouseMove={handleMouseMove}
        >
          {/* Spotlight effect */}
          <motion.div
            className="absolute inset-0 opacity-20 pointer-events-none"
            animate={{
              background: `radial-gradient(600px circle at ${mousePosition.x}% ${mousePosition.y}%, var(--spotlight-color), transparent 40%)`,
            }}
            transition={{ duration: 0.1, ease: "linear" }}
          />

          <div className="relative z-10 px-8 lg:px-16 py-16 lg:py-24">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-12">

              {/* Left content */}
              <div className="flex-1">
                <h2 className="text-4xl lg:text-7xl font-display tracking-tight mb-8 leading-[0.95] text-[var(--text-primary)]">
                  Ready to orchestrate
                  <br />
                  <span className="text-[var(--primary)] transition-colors duration-500">your microgrid?</span>
                </h2>

                <p className="text-xl text-[var(--text-muted)] mb-12 leading-relaxed max-w-xl">
                  Deploy GridFlowX to bridge physical <span className="text-[var(--primary)] font-semibold">edge hardware</span> with cloud-native intelligence. Automate <span className="text-[var(--primary)] font-semibold">load shedding</span>, predict <span className="text-[var(--primary)] font-semibold">solar yield</span>, and protect your battery lifecycle today.
                </p>

                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <Link href="/login">
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
                          className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--text-inverse)] px-8 h-14 text-base rounded-full group w-full sm:w-auto transition-all"
                        >
                          Launch Operator Terminal
                          <motion.span
                            animate={shouldAnimate ? { x: [0, 4, 0] } : {}}
                            transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
                          >
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </motion.span>
                        </Button>
                      </motion.div>
                    </motion.div>
                  </Link>
                  <Link href="/docs">
                    <motion.div
                      whileHover={shouldAnimate ? { scale: 1.03 } : {}}
                      whileTap={shouldAnimate ? { scale: 0.97 } : {}}
                    >
                      <Button
                        size="lg"
                        variant="outline"
                        className="h-14 px-8 text-base rounded-full border-[var(--primary)]/20 text-[var(--primary)] hover:bg-[var(--primary-light)] w-full sm:w-auto transition-colors"
                      >
                        View Architecture Docs
                      </Button>
                    </motion.div>
                  </Link>
                </div>

                <div className="flex items-center gap-2 mt-8 text-sm text-[var(--text-muted)] font-mono">
                  <Terminal className="w-4 h-4 text-[var(--primary)]" />
                  <span><span className="text-[var(--primary)] font-semibold">ESP32-WROOM-32E</span> Hardware Required for Edge Deployment</span>
                </div>
              </div>

              {/* Right animation — parallax on scroll */}
              <motion.div
                style={{ y: tetrahedronY }}
                className="hidden lg:flex items-center justify-center w-[500px] h-[500px] -mr-16 text-[var(--primary)]"
              >
                <AnimatedTetrahedron />
              </motion.div>
            </div>
          </div>

          {/* Decorative corners — animate in on view */}
          <motion.div
            initial={shouldAnimate ? { opacity: 0, scale: 0 } : { opacity: 0 }}
            animate={isInView ? { opacity: 0.5, scale: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="absolute top-0 right-0 w-32 h-32 border-b border-l border-[var(--primary)]/20 rounded-bl-3xl"
          />
          <motion.div
            initial={shouldAnimate ? { opacity: 0, scale: 0 } : { opacity: 0 }}
            animate={isInView ? { opacity: 0.5, scale: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="absolute bottom-0 left-0 w-32 h-32 border-t border-r border-[var(--primary)]/20 rounded-tr-3xl"
          />
        </motion.div>
      </Container>
    </section>
  );
}