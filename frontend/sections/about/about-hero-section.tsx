"use client";

import React, { useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { Activity, Star, ArrowUpRight, Play } from "lucide-react";
import { useMotionConfig } from "@/hooks/use-motion-config";

// ============================================================================
// Particle Canvas — Reactive Microgrid Node Network
// ============================================================================

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  opacity: number;
}

function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: -9999, y: -9999 });
  const particles = useRef<Particle[]>([]);
  const animId = useRef<number>(0);

  const initParticles = useCallback((w: number, h: number) => {
    const count = Math.floor((w * h) / 12000);
    particles.current = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.8 + 0.6,
      opacity: Math.random() * 0.5 + 0.2,
    }));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = canvas.offsetWidth;
    let h = canvas.offsetHeight;
    canvas.width = w;
    canvas.height = h;
    initParticles(w, h);

    const handleResize = () => {
      w = canvas.offsetWidth;
      h = canvas.offsetHeight;
      canvas.width = w;
      canvas.height = h;
      initParticles(w, h);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const ps = particles.current;
      const mx = mouse.current.x;
      const my = mouse.current.y;
      const LINK_DIST = 120;
      const MOUSE_DIST = 140;

      for (let i = 0; i < ps.length; i++) {
        const p = ps[i];
        // mouse repulsion
        const dx = p.x - mx;
        const dy = p.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MOUSE_DIST) {
          const force = (MOUSE_DIST - dist) / MOUSE_DIST;
          p.vx += (dx / dist) * force * 0.4;
          p.vy += (dy / dist) * force * 0.4;
        }
        // velocity damping & boundary bounce
        p.vx *= 0.98;
        p.vy *= 0.98;
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        // draw node
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(74, 222, 128, ${p.opacity})`;
        ctx.fill();

        // draw edges
        for (let j = i + 1; j < ps.length; j++) {
          const q = ps[j];
          const ex = p.x - q.x;
          const ey = p.y - q.y;
          const edist = Math.sqrt(ex * ex + ey * ey);
          if (edist < LINK_DIST) {
            const alpha = (1 - edist / LINK_DIST) * 0.18;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(74, 222, 128, ${alpha})`;
            ctx.lineWidth = 0.7;
            ctx.stroke();
          }
        }
      }
      animId.current = requestAnimationFrame(draw);
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    animId.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animId.current);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [initParticles]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 w-full h-full pointer-events-none opacity-60"
    />
  );
}

// ============================================================================
// Character-Stagger Text
// ============================================================================

function SplitText({
  text,
  className,
  delay = 0,
  shouldAnimate,
}: {
  text: string;
  className?: string;
  delay?: number;
  shouldAnimate: boolean;
}) {
  return (
    <span className={className} aria-label={text}>
      {text.split("").map((char, i) => (
        <motion.span
          key={i}
          aria-hidden="true"
          initial={shouldAnimate ? { opacity: 0, y: 20, filter: "blur(4px)" } : { opacity: 1 }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{
            duration: 0.5,
            ease: [0.22, 1, 0.36, 1],
            delay: delay + i * 0.028,
          }}
          style={{ display: "inline-block", whiteSpace: char === " " ? "pre" : "normal" }}
        >
          {char}
        </motion.span>
      ))}
    </span>
  );
}

// ============================================================================
// Organic Clip SVG
// ============================================================================

const OrganicClipPath = () => (
  <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
    <defs>
      <clipPath id="hero-organic-clip" clipPathUnits="objectBoundingBox">
        <path d="M 0.04923 0 L 0.81231 0 A 0.04923 0.05818 0 0 1 0.86154 0.05818 L 0.86154 0.06909 A 0.04923 0.05818 0 0 0 0.91077 0.12727 L 0.95077 0.12727 A 0.04923 0.05818 0 0 1 1 0.18545 L 1 0.94182 A 0.04923 0.05818 0 0 1 0.95077 1 L 0.18769 1 A 0.04923 0.05818 0 0 1 0.13846 0.94182 L 0.13846 0.93091 A 0.04923 0.05818 0 0 0 0.08923 0.87273 L 0.04923 0.87273 A 0.04923 0.05818 0 0 1 0 0.81455 L 0 0.05818 A 0.04923 0.05818 0 0 1 0.04923 0 Z" />
      </clipPath>
    </defs>
  </svg>
);

// ============================================================================
// Main Component
// ============================================================================

export default function AboutHeroSection() {
  const { shouldAnimate, transitions } = useMotionConfig();
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // Parallax layers
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "-14%"]);

  return (
    <section
      ref={sectionRef}
      aria-label="GridFlowX — Hero"
      className="relative min-h-screen flex items-center justify-center py-24 px-4 sm:px-6 lg:px-12 xl:px-24 overflow-hidden border-b border-[var(--border-primary)]/30"
      style={{ background: "radial-gradient(ellipse 80% 60% at 60% 40%, rgba(74,222,128,0.06) 0%, transparent 70%), var(--bg-base)" }}
    >
      {/* Reactive particle background */}
      <ParticleCanvas />

      {/* Ambient atmospheric blobs */}
      <motion.div
        aria-hidden="true"
        animate={shouldAnimate ? { scale: [1, 1.15, 1], opacity: [0.12, 0.2, 0.12] } : {}}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(74,222,128,0.15) 0%, transparent 70%)" }}
      />
      <motion.div
        aria-hidden="true"
        animate={shouldAnimate ? { scale: [1, 1.2, 1], opacity: [0.08, 0.15, 0.08] } : {}}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        className="absolute bottom-[-15%] left-[-5%] w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)" }}
      />

      <OrganicClipPath />

      <div className="relative z-10 max-w-[1300px] w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

        {/* ================= LEFT CONTENT ================= */}
        <motion.section
          style={{ y: textY }}
          className="lg:col-span-5 space-y-8 lg:space-y-10"
        >
          {/* Category Pills */}
          <motion.div
            initial={shouldAnimate ? { opacity: 0, y: 16 } : { opacity: 1 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-wrap items-center gap-3"
          >
            <span className="px-5 py-2 bg-[var(--bg-card)]/80 backdrop-blur-sm border border-[var(--border-primary)] rounded-full text-[var(--text-muted)] text-sm font-medium shadow-inner">
              Edge OS
            </span>
            <span className="px-5 py-2 bg-[var(--bg-card)]/80 backdrop-blur-sm border border-[var(--border-primary)] rounded-full text-[var(--text-muted)] text-sm font-medium shadow-inner">
              Telemetry
            </span>
            <div className="w-10 h-10 flex items-center justify-center bg-[var(--bg-card)]/80 backdrop-blur-sm border border-[var(--border-primary)] rounded-full shrink-0">
              <Activity className="w-4 h-4 text-[var(--text-muted)]" />
            </div>
            <motion.span
              animate={shouldAnimate ? { boxShadow: ["0 0 10px rgba(74,222,128,0.2)", "0 0 24px rgba(74,222,128,0.5)", "0 0 10px rgba(74,222,128,0.2)"] } : {}}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              className="px-6 py-2 bg-gradient-to-r from-[var(--primary)] to-[var(--primary-focus)] text-[var(--text-inverse)] rounded-full text-sm font-semibold shrink-0"
            >
              GridFlowX
            </motion.span>
          </motion.div>

          {/* Headline — Character Stagger */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-semibold tracking-tight leading-[1.08]">
            <SplitText
              text="Predictive"
              className="text-[var(--primary)]"
              delay={0.3}
              shouldAnimate={shouldAnimate}
            />
            <SplitText
              text=" Control,"
              className="text-[var(--text-primary)]"
              delay={0.3}
              shouldAnimate={shouldAnimate}
            />
            <SplitText
              text=" Maximizing Resilience"
              className="text-[var(--text-primary)]"
              delay={0.6}
              shouldAnimate={shouldAnimate}
            />
            <motion.span
              className="text-cyan-400"
              initial={shouldAnimate ? { opacity: 0 } : { opacity: 1 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.6 }}
            >
              .
            </motion.span>
          </h1>

          {/* Description */}
          <motion.p
            initial={shouldAnimate ? { opacity: 0, y: 12 } : { opacity: 1 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="text-[clamp(1.1rem,1.8vw,1.45rem)] text-[var(--text-muted)] max-w-[430px] leading-relaxed"
          >
            Strategic cyber-physical infrastructure designed to optimize energy routing and maximize your microgrid&apos;s reliability.
          </motion.p>

          {/* CTA Actions */}
          <motion.div
            initial={shouldAnimate ? { opacity: 0, y: 12 } : { opacity: 1 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.05 }}
            className="flex flex-wrap items-center gap-6 pt-4"
          >
            <Link
              href="/dashboard"
              className="relative overflow-hidden bg-[var(--text-primary)] text-[var(--bg-base)] px-9 py-4 rounded-full text-lg font-bold hover:scale-105 transition-transform duration-300 shadow-xl shadow-[var(--text-primary)]/10 group"
            >
              <span className="relative z-10">Launch Terminal</span>
              {/* Shimmer */}
              <span
                aria-hidden="true"
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.25) 50%, transparent 70%)",
                  transform: "translateX(-100%)",
                  animation: "shimmer-slide 0.6s ease forwards",
                }}
              />
            </Link>
            <Link
              href="/docs"
              className="text-lg font-medium text-[var(--text-primary)] underline decoration-[1.5px] underline-offset-8 hover:text-[var(--primary)] transition-colors duration-300"
            >
              How it works
            </Link>
          </motion.div>

          {/* Trust & Social Proof */}
          <motion.div
            initial={shouldAnimate ? { opacity: 0, y: 12 } : { opacity: 1 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="flex flex-wrap items-center gap-8 lg:gap-12 pt-8"
          >
            <div>
              <p className="text-sm text-[var(--text-muted)] mb-1 font-mono uppercase tracking-wider">Engineered for_</p>
              <h3 className="text-5xl lg:text-[64px] font-display font-bold text-[var(--text-primary)] leading-none">
                100<span className="text-[var(--primary)]">Hz+</span>
              </h3>
              <p className="text-sm text-[var(--text-muted)] mt-3 font-medium">Failsafe operations</p>
            </div>

            {/* Glassmorphism Status Card */}
            <div className="bg-[var(--bg-card)]/60 backdrop-blur-xl p-6 rounded-[28px] shadow-2xl border border-[var(--border-primary)] flex flex-col gap-3 min-w-[240px] hover:scale-105 transition-transform duration-300 group"
              style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)" }}
            >
              <div className="flex items-center justify-between">
                <span className="text-3xl font-display font-bold text-[var(--text-primary)]">99.9%</span>
                <div className="flex gap-0.5 text-[var(--primary)]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
              </div>
              <div className="flex -space-x-3 overflow-hidden mt-1">
                {[
                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80",
                  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&h=100&q=80",
                  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=100&h=100&q=80",
                  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=100&h=100&q=80",
                ].map((src, i) => (
                  <div key={i} className="relative w-10 h-10 rounded-full ring-2 ring-[var(--bg-card)] overflow-hidden">
                    <Image src={src} alt={`Node ${i + 1}`} fill className="object-cover" sizes="40px" />
                  </div>
                ))}
                <div className="flex items-center justify-center h-10 w-10 rounded-full ring-2 ring-[var(--bg-card)] bg-[var(--primary)] text-[var(--text-inverse)] text-xs font-bold relative z-10">
                  +
                </div>
              </div>
            </div>
          </motion.div>
        </motion.section>

        {/* ================= RIGHT VISUAL CONTENT ================= */}
        <section className="lg:col-span-7 relative h-full flex justify-center items-center mt-12 lg:mt-0">
          <motion.div
            style={{ y: imageY }}
            animate={shouldAnimate ? { y: ["-6px", "6px", "-6px"] } : {}}
            transition={transitions.floatLoop}
            className="relative w-full max-w-[650px] aspect-[1.18/1]"
          >
            {/* Outer neon glow frame */}
            <div
              className="w-full h-full"
              style={{
                filter: "drop-shadow(0 0 24px rgba(74,222,128,0.18)) drop-shadow(0 25px 35px rgba(0,0,0,0.5))",
              }}
            >
              {/* Clipped inner container */}
              <div
                className="w-full h-full relative overflow-hidden bg-[var(--bg-surface)]"
                style={{
                  clipPath: "url(#hero-organic-clip)",
                  WebkitClipPath: "url(#hero-organic-clip)",
                }}
              >
                <Image
                  src="https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&w=1200&q=80"
                  alt="GridFlowX Architecture Abstract"
                  fill
                  priority
                  className="object-cover object-center opacity-90 scale-105 mix-blend-luminosity"
                  sizes="(max-width: 1024px) 100vw, 650px"
                />

                {/* Brand gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-[var(--primary)]/40 via-[var(--bg-base)]/60 to-purple-500/20 mix-blend-overlay" />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-base)] via-[var(--bg-base)]/40 to-transparent" />

                {/* Scanline overlay */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 pointer-events-none opacity-[0.04]"
                  style={{
                    backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.8) 2px, rgba(255,255,255,0.8) 4px)",
                    backgroundSize: "100% 4px",
                  }}
                />

                {/* Play Button */}
                <button className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-[var(--bg-card)]/30 backdrop-blur-md border border-white/20 flex items-center justify-center hover:scale-110 hover:bg-[var(--primary)]/80 transition-all duration-300 group shadow-[0_0_30px_rgba(0,0,0,0.5)] z-20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]">
                  {/* Orbital ring */}
                  <span
                    aria-hidden="true"
                    className="absolute inset-[-8px] rounded-full border border-dashed border-[var(--primary)]/40"
                    style={{ animation: "spin 8s linear infinite" }}
                  />
                  <Play className="w-8 h-8 text-white fill-white ml-1 group-hover:scale-95 transition-transform" />
                </button>

                {/* Overlay text */}
                <div className="absolute bottom-12 left-10 right-10 z-20">
                  <h2 className="text-3xl sm:text-[52px] font-display font-bold text-white leading-tight drop-shadow-lg">
                    Phase I<br />Validation
                  </h2>
                </div>
              </div>
            </div>

            {/* Floating Glassmorphism Action Card */}
            <Link
              href="#architecture"
              className="absolute bottom-[-10%] right-[5%] md:bottom-[-20px] md:right-[10%] w-[120px] h-[120px] md:w-[170px] md:h-[170px] rounded-[24px] md:rounded-[28px] flex items-center justify-center z-30 transition-all duration-300 hover:scale-110 cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
              style={{
                background: "rgba(255,255,255,0.04)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: "1px solid rgba(255,255,255,0.1)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(74,222,128,0.15), inset 0 1px 0 rgba(255,255,255,0.08)",
              }}
            >
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full border-[1.5px] border-[var(--border-primary)] flex items-center justify-center group-hover:bg-[var(--primary)] group-hover:border-[var(--primary)] transition-colors">
                <ArrowUpRight className="w-6 h-6 text-[var(--text-primary)] group-hover:text-[var(--text-inverse)]" strokeWidth={2} />
              </div>
            </Link>
          </motion.div>
        </section>
      </div>

      {/* Global shimmer keyframe */}
      <style jsx global>{`
        @keyframes shimmer-slide {
          from { transform: translateX(-100%); }
          to   { transform: translateX(200%); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </section>
  );
}