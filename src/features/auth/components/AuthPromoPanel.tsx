'use client';

import type { PromoPanelConfig } from '@/features/auth/types/auth.types';
import { motion, AnimatePresence } from 'framer-motion';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Cpu, 
  Shield, 
  Activity, 
  Database, 
  Network, 
  Zap, 
  Mail, 
  ArrowRight,
  Server
} from 'lucide-react';

// =============================================================================
// CONSTANTS & TYPES
// =============================================================================

const BOTTOM_STATS = [
    { label: 'NODE DENSITY', description: '12K+ active edge devices', color: 'text-[var(--primary)]' },
    { label: 'LATENCY', description: 'Sub-100ms real-time sync', color: 'text-cyan-400' },
    { label: 'THROUGHPUT', description: '2.5M telemetry points/hr', color: 'text-emerald-400' },
];

const heroVideo = '/videos/hero.mp4';

// =============================================================================
// SUB-COMPONENTS: ROUTE-SPECIFIC VISUALIZATIONS
// =============================================================================

function LiveDashboardVisual() {
  const [pulse, setPulse] = useState(72);
  const [load, setLoad] = useState(48.5);

  useEffect(() => {
    const timer = setInterval(() => {
      setPulse((p) => Math.min(Math.max(p + (Math.random() - 0.5) * 4, 68), 78));
      setLoad((l) => Math.min(Math.max(l + (Math.random() - 0.5) * 2, 45), 52));
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full h-[180px] bg-black/40 rounded-2xl border border-[var(--border-primary)]/20 p-4 backdrop-blur-md overflow-hidden flex flex-col justify-between group shadow-2xl">
      {/* Grid lines background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:1.5rem_1.5rem]" />
      
      {/* Header bar */}
      <div className="relative z-10 flex items-center justify-between border-b border-white/5 pb-2 text-[11px] font-mono text-[var(--text-muted)]">
        <span className="flex items-center gap-1.5 font-bold tracking-wider">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
          SYSTEM OK // CORE TERMINAL
        </span>
        <span>EDGE PORT: 443</span>
      </div>

      {/* Grid metrics */}
      <div className="relative z-10 grid grid-cols-3 gap-3 my-2">
        <div className="bg-white/[0.02] border border-white/5 rounded-lg p-2 flex flex-col justify-center">
          <span className="text-[9px] text-[var(--text-muted)] font-mono font-bold uppercase tracking-wider block">Pulse Freq</span>
          <span className="text-xl font-display font-semibold text-[var(--primary)] mt-1">{pulse.toFixed(1)} <span className="text-[10px] text-[var(--text-muted)]">Hz</span></span>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-lg p-2 flex flex-col justify-center">
          <span className="text-[9px] text-[var(--text-muted)] font-mono font-bold uppercase tracking-wider block">Grid load</span>
          <span className="text-xl font-display font-semibold text-cyan-400 mt-1">{load.toFixed(1)} <span className="text-[10px] text-[var(--text-muted)]">%</span></span>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-lg p-2 flex flex-col justify-center">
          <span className="text-[9px] text-[var(--text-muted)] font-mono font-bold uppercase tracking-wider block">Packet flow</span>
          <span className="text-xl font-display font-semibold text-emerald-400 mt-1">99.98<span className="text-[10px] text-[var(--text-muted)]">%</span></span>
        </div>
      </div>

      {/* SVG Wave */}
      <div className="relative z-10 h-10 w-full opacity-60">
        <svg viewBox="0 0 400 40" className="w-full h-full stroke-[var(--primary)] fill-none">
          <path d="M0 20 Q 40 5, 80 20 T 160 20 T 240 20 T 320 20 T 400 20" />
          <motion.path 
            d="M0 20 Q 40 5, 80 20 T 160 20 T 240 20 T 320 20 T 400 20" 
            className="stroke-cyan-400"
            animate={{ x: [0, 80] }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          />
        </svg>
      </div>
    </div>
  );
}

function GridTopologyVisual() {
  return (
    <div className="relative w-full h-[180px] bg-black/40 rounded-2xl border border-[var(--border-primary)]/20 p-4 backdrop-blur-md overflow-hidden flex items-center justify-center shadow-2xl">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:1.5rem_1.5rem]" />
      
      <svg viewBox="0 0 300 120" className="w-full h-full relative z-10">
        {/* Connection Paths */}
        <line x1="50" y1="60" x2="150" y2="30" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" />
        <line x1="50" y1="60" x2="150" y2="90" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" />
        <line x1="150" y1="30" x2="250" y2="60" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" />
        <line x1="150" y1="90" x2="250" y2="60" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" />
        
        {/* Moving energy packets */}
        <motion.circle r="3" fill="var(--primary)" animate={{ cx: [50, 150], cy: [60, 30] }} transition={{ repeat: Infinity, duration: 2.2, ease: "linear" }} />
        <motion.circle r="3" fill="#22d3ee" animate={{ cx: [50, 150], cy: [60, 90] }} transition={{ repeat: Infinity, duration: 1.8, ease: "linear" }} />
        <motion.circle r="3" fill="var(--primary)" animate={{ cx: [150, 250], cy: [30, 60] }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} />
        <motion.circle r="3" fill="#22d3ee" animate={{ cx: [150, 250], cy: [90, 60] }} transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }} />

        {/* Nodes */}
        <circle cx="50" cy="60" r="10" fill="var(--bg-base)" stroke="var(--primary)" strokeWidth="2" />
        <Zap className="w-3.5 h-3.5 text-[var(--primary)] absolute" style={{ transform: "translate(43px, 53px)" }} />

        <circle cx="150" cy="30" r="10" fill="var(--bg-base)" stroke="#22d3ee" strokeWidth="2" />
        <Cpu className="w-3.5 h-3.5 text-cyan-400 absolute" style={{ transform: "translate(143px, 23px)" }} />

        <circle cx="150" cy="90" r="10" fill="var(--bg-base)" stroke="var(--primary)" strokeWidth="2" />
        <Database className="w-3.5 h-3.5 text-[var(--primary)] absolute" style={{ transform: "translate(143px, 83px)" }} />

        <circle cx="250" cy="60" r="10" fill="var(--bg-base)" stroke="#10b981" strokeWidth="2" />
        <Network className="w-3.5 h-3.5 text-emerald-400 absolute" style={{ transform: "translate(243px, 53px)" }} />
      </svg>
    </div>
  );
}

function SecurityValidationVisual() {
  return (
    <div className="relative w-full h-[180px] bg-black/40 rounded-2xl border border-[var(--border-primary)]/20 p-4 backdrop-blur-md overflow-hidden flex items-center justify-center shadow-2xl">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:1.5rem_1.5rem]" />
      
      {/* Radar scanning sweep */}
      <motion.div 
        className="absolute w-[200px] h-[200px] bg-gradient-to-tr from-[var(--primary)]/10 to-transparent rounded-full origin-center"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
      />

      <div className="relative flex flex-col items-center gap-2">
        {/* Pulsing Concentric rings */}
        <motion.div 
          className="absolute w-20 h-20 rounded-full border border-[var(--primary)]/30"
          animate={{ scale: [0.8, 1.4], opacity: [1, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
        />
        <motion.div 
          className="absolute w-28 h-28 rounded-full border border-cyan-400/20"
          animate={{ scale: [0.8, 1.4], opacity: [1, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeOut", delay: 0.7 }}
        />

        <div className="w-14 h-14 rounded-full bg-black/50 border border-[var(--primary)]/40 flex items-center justify-center relative z-10 shadow-lg">
          <Shield className="w-6 h-6 text-[var(--primary)]" />
        </div>
        <span className="text-[10px] font-mono tracking-widest text-[var(--primary)] font-bold uppercase mt-1">SSL PROTOCOL OK</span>
      </div>
    </div>
  );
}

function EmailVerificationVisual() {
  return (
    <div className="relative w-full h-[180px] bg-black/40 rounded-2xl border border-[var(--border-primary)]/20 p-4 backdrop-blur-md overflow-hidden flex items-center justify-center shadow-2xl">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:1.5rem_1.5rem]" />
      
      <div className="relative flex flex-col items-center gap-3">
        {/* Wave pulses */}
        <motion.div
          className="absolute w-16 h-16 bg-[var(--primary)]/5 rounded-full"
          animate={{ scale: [1, 2.2], opacity: [0.6, 0] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
        />
        
        <div className="w-14 h-14 rounded-full bg-black/50 border border-[var(--primary)]/40 flex items-center justify-center relative z-10 shadow-lg">
          <Mail className="w-6 h-6 text-[var(--primary)]" />
        </div>
        
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-mono tracking-widest text-cyan-400 font-bold uppercase">WAITING FOR HANDSHAKE</span>
          <span className="text-[9px] font-mono text-[var(--text-muted)] mt-0.5">GRIDFLOWX VERIFICATION GATEWAY</span>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const PARTICLES = [
  { top: '15%', left: '20%', x: [0, 15, 0], y: [0, -40, 0], duration: 10, delay: 0 },
  { top: '35%', left: '70%', x: [0, -20, 0], y: [0, -35, 0], duration: 12, delay: 1 },
  { top: '65%', left: '25%', x: [0, 25, 0], y: [0, -45, 0], duration: 9, delay: 0.5 },
  { top: '80%', left: '80%', x: [0, -15, 0], y: [0, -30, 0], duration: 14, delay: 2 },
  { top: '25%', left: '45%', x: [0, 20, 0], y: [0, -50, 0], duration: 11, delay: 1.5 },
  { top: '50%', left: '85%', x: [0, -25, 0], y: [0, -25, 0], duration: 13, delay: 0.8 },
  { top: '75%', left: '15%', x: [0, 18, 0], y: [0, -35, 0], duration: 10.5, delay: 2.2 },
  { top: '10%', left: '60%', x: [0, -10, 0], y: [0, -40, 0], duration: 15, delay: 0.3 },
  { top: '40%', left: '10%', x: [0, 22, 0], y: [0, -30, 0], duration: 8.5, delay: 1.8 },
  { top: '85%', left: '50%', x: [0, -18, 0], y: [0, -45, 0], duration: 11.5, delay: 2.5 },
];

export function AuthPromoPanel({ config, widthClass = 'lg:w-[58%] xl:w-[60%]' }: { config: PromoPanelConfig; widthClass?: string }) {
    const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
    const panelRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!panelRef.current) return;
      const rect = panelRef.current.getBoundingClientRect();
      setMousePos({
        x: ((e.clientX - rect.left) / rect.width) * 100,
        y: ((e.clientY - rect.top) / rect.height) * 100,
      });
    };

    // Determine which interactive visualization to mount
    const renderVisualizer = () => {
      const badge = config.badge.toLowerCase();
      if (badge.includes('security protocol')) {
        return <LiveDashboardVisual />;
      } else if (badge.includes('new account')) {
        return <GridTopologyVisual />;
      } else if (badge.includes('recovery') || badge.includes('reset')) {
        return <SecurityValidationVisual />;
      } else if (badge.includes('verification')) {
        return <EmailVerificationVisual />;
      }
      return <LiveDashboardVisual />;
    };

    return (
        <div 
          ref={panelRef}
          onMouseMove={handleMouseMove}
          className={`hidden lg:flex ${widthClass} h-full min-h-screen relative flex-col overflow-hidden border-r border-[var(--border-primary)]`}
        >
            {/* Ambient Background Video Loop — slow zoom parallax */}
            <motion.video
                autoPlay loop muted playsInline
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
                className="absolute inset-0 w-full h-full object-cover z-0 origin-center"
                src={heroVideo}
            />

            {/* Overlays */}
            <div className="absolute inset-0 z-[1] bg-gradient-to-t from-[var(--bg-base)] via-[var(--bg-base)]/85 to-[var(--bg-base)]/40" />
            <div className="absolute inset-0 z-[1] bg-gradient-to-r from-[var(--bg-base)]/60 to-transparent" />
            
            {/* Interactive Cursor Spotlight */}
            <motion.div
              className="absolute inset-0 opacity-25 pointer-events-none z-[2]"
              animate={{
                background: `radial-gradient(800px circle at ${mousePos.x}% ${mousePos.y}%, var(--spotlight-color), transparent 50%)`,
              }}
              transition={{ duration: 0.1, ease: "linear" }}
            />

            {/* Engineering Grid Layout */}
            <div className="absolute inset-0 z-[2] bg-[linear-gradient(to_right,rgba(74,222,128,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(74,222,128,0.03)_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] opacity-60" />

            {/* Floating Particles Layer */}
            <div className="absolute inset-0 pointer-events-none z-[2] overflow-hidden">
              {PARTICLES.map((particle, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1.5 h-1.5 bg-[var(--primary)]/20 rounded-full"
                  style={{
                    top: particle.top,
                    left: particle.left,
                  }}
                  animate={{
                    y: particle.y,
                    x: particle.x,
                    opacity: [0.2, 0.8, 0.2],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: particle.duration,
                    ease: "easeInOut",
                    delay: particle.delay,
                  }}
                />
              ))}
            </div>

            {/* Glow Accents */}
            <div className="absolute top-1/3 left-1/4 w-[28rem] h-[28rem] bg-[var(--primary)]/8 rounded-full blur-[120px] pointer-events-none z-[2]" />
            <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none z-[2]" />

            {/* Content Layer */}
            <div className="relative z-10 flex flex-col h-full px-8 xl:px-12 py-8 justify-between flex-1">

                {/* Brand Logo Header */}
                <Link href="/" className="flex items-center gap-3 group shrink-0" aria-label="GridFlowX Home">
                    <div className="relative w-10 h-10 rounded-xl bg-[var(--primary)]/10 border border-[var(--primary)]/20 flex items-center justify-center shadow-lg shadow-[var(--primary)]/15 group-hover:scale-105 group-hover:bg-[var(--primary)]/20 transition-all duration-300">
                      <Image
                        src="/favicon.svg"
                        alt="GridFlowX Logo"
                        width={20}
                        height={20}
                        className="object-contain"
                      />
                    </div>
                    <div>
                        <span className="text-[var(--text-primary)] font-bold text-lg tracking-tight">GridFlowX</span>
                        <span className="block text-[11px] text-[var(--text-muted)] font-medium -mt-0.5">Intelligent Microgrid Management</span>
                    </div>
                </Link>

                {/* Main Content */}
                <div className="flex-1 flex flex-col justify-center max-w-xl my-6 gap-6">
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                        className="space-y-4"
                    >
                        {/* Shimmering Badge */}
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[var(--primary)]/25 bg-[var(--primary)]/10 text-[var(--primary)] text-[11px] font-bold uppercase tracking-[0.12em] font-mono relative overflow-hidden">
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-pulse" />
                            {config.badge}
                            <motion.span 
                              className="absolute top-0 bottom-0 left-0 w-8 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                              animate={{ x: [-50, 200] }}
                              transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                            />
                        </div>

                        {/* Route-specific Dynamic Headline */}
                        <h1 className="text-[2.6rem] xl:text-5xl font-extrabold leading-[1.1] tracking-tight text-[var(--text-primary)]">
                            {config.headlineLine1}
                            <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary)] to-cyan-400">
                                {config.headlineLine2}
                            </span>
                        </h1>

                        {/* Subtitle */}
                        <p className="text-[var(--text-muted)] text-[15px] leading-relaxed max-w-lg">
                            {config.subtitle}
                        </p>
                    </motion.div>

                    {/* Interactive Route Visualizer Preview */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                    >
                      {renderVisualizer()}
                    </motion.div>

                    {/* Feature Cards — Stagger Entrance reveals */}
                    <div className="grid grid-cols-2 gap-3 mt-2">
                        {config.cards.map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 + index * 0.05, ease: [0.22, 1, 0.36, 1] }}
                                whileHover={{ y: -4, borderColor: "rgba(34, 197, 94, 0.25)", boxShadow: "0 0 20px rgba(34, 197, 94, 0.08)" }}
                                className="flex items-start gap-3 p-4 rounded-2xl bg-[var(--text-primary)]/[0.02] border border-[var(--border-primary)]/30 backdrop-blur-sm transition-all duration-300 group cursor-default"
                            >
                                <div className="p-2 rounded-xl bg-[var(--primary)]/10 border border-[var(--primary)]/20 text-[var(--primary)] shrink-0 transition-colors">
                                    <item.icon size={18} />
                                </div>
                                <div className="min-w-0">
                                    <h4 className="font-bold text-[13px] text-[var(--text-primary)] leading-tight">{item.title}</h4>
                                    <p className="text-[11px] text-[var(--text-muted)] leading-snug mt-1">{item.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* CTA Links */}
                    <div className="flex items-center gap-4 mt-2">
                      <Link href="/docs" className="text-xs font-mono font-bold tracking-wider text-[var(--primary)] hover:text-cyan-400 transition-colors flex items-center gap-1 group/cta">
                        VIEW DOCUMENTATION <ArrowRight className="w-3.5 h-3.5 group-hover/cta:translate-x-0.5 transition-transform" />
                      </Link>
                      <span className="text-white/10 text-xs">|</span>
                      <a href="https://github.com/gridflowx" target="_blank" rel="noopener noreferrer" className="text-xs font-mono font-bold tracking-wider text-[var(--text-muted)] hover:text-white transition-colors">
                        GITHUB REPOSITORY
                      </a>
                    </div>
                </div>

                {/* Bottom Stats Footer Bar */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.7, delay: 0.4 }}
                    className="flex items-center gap-8 pt-6 border-t border-[var(--border-primary)]/30 shrink-0"
                >
                    {BOTTOM_STATS.map((stat, index) => (
                        <div key={index} className="flex flex-col gap-0.5">
                            <span className={`text-[10px] font-extrabold tracking-[0.1em] ${stat.color}`}>{stat.label}</span>
                            <span className="text-[11px] text-[var(--text-muted)] font-medium">{stat.description}</span>
                        </div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
}
