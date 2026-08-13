"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import AboutHeroSection from "@/sections/about/about-hero-section";
import AboutOverviewSection from "@/sections/about/about-overview-section";
import AboutHowItWorksSection from "@/sections/about/about-how-it-works-section";
import AboutServiceSection from "@/sections/about/about-service-section";
import AboutGrowthSection from "@/sections/about/about-growth-section";
import AboutTeamSection from "@/sections/about/about-team-section";

// ============================================================================
// Global Cursor Glow
// ============================================================================

function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = glowRef.current;
    if (!el) return;

    let rafId: number;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const onMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      if (!visible) setVisible(true);
    };

    const animate = () => {
      // Lerp for smooth trailing
      currentX += (targetX - currentX) * 0.06;
      currentY += (targetY - currentY) * 0.06;
      el.style.left = `${currentX}px`;
      el.style.top = `${currentY}px`;
      rafId = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    rafId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafId);
    };
  }, [visible]);

  return (
    <div
      ref={glowRef}
      aria-hidden="true"
      className="fixed pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 transition-opacity duration-500"
      style={{
        width: "600px",
        height: "600px",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(74,222,128,0.04) 0%, transparent 70%)",
        opacity: visible ? 1 : 0,
      }}
    />
  );
}

// ============================================================================
// About Page
// ============================================================================

export default function AboutPage() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <main className="min-h-screen bg-[var(--bg-base)] text-[var(--text-body)] font-sans overflow-x-hidden selection:bg-[var(--primary)]/30 selection:text-[var(--primary)] pt-16">
      {/* Global cursor ambient glow */}
      <CursorGlow />

      {/* Scroll Reading Progress Bar — neon gradient */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[2px] z-50 origin-left"
        style={{
          scaleX,
          background: "linear-gradient(90deg, var(--primary), rgba(34,211,238,0.9), rgba(99,102,241,0.8))",
          boxShadow: "0 0 8px rgba(74,222,128,0.6)",
        }}
      />

      {/* 1. Hero Section */}
      <AboutHeroSection />

      {/* 2. Overview Section */}
      <AboutOverviewSection />

      {/* 3. How It Works Section */}
      <AboutHowItWorksSection />

      {/* 4. Service / Capabilities Section */}
      <AboutServiceSection />

      {/* 5. Growth & Trajectory Section */}
      <AboutGrowthSection />

      {/* 6. Engineering Team Section */}
      <AboutTeamSection />
    </main>
  );
}