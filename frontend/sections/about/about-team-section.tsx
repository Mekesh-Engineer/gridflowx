"use client";

import React, { useState, useRef, useEffect, MouseEvent } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { 
  Play, 
  RotateCw, 
  X, 
  Users, 
  ArrowRight, 
  CheckCircle2, 
  ExternalLink, 
  MessageCircle, 
  Mail, 
  Sparkles
} from "lucide-react";
import { Container } from "@/components/shared/container";
import { useMotionConfig } from "@/hooks/use-motion-config";
import { cn } from "@/lib/utils";

// ============================================================================
// Domain Data (GridFlowX Team)
// ============================================================================

type Category = "all" | "hardware" | "ai" | "systems";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  category: Category;
  image: string;
  bio: string;
  specialization: string;
  funFact: string;
  stats: {
    label1: string; val1: string;
    label2: string; val2: string;
  };
  status: string;
}

const TEAM_DATA: TeamMember[] = [
  {
    id: "harish",
    name: "Harish G",
    role: "Hardware & Edge Logic",
    category: "hardware",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
    bio: "Led the design of the ESP32 edge controller, ADC sensor calibration, and the 100Hz deterministic FreeRTOS safety loop.",
    specialization: "Embedded C++, FreeRTOS, PCB Design, Power Electronics & Modbus.",
    funFact: "Achieved sub-10ms failsafe response times.",
    stats: { label1: "Hardware Iterations", val1: "4+", label2: "Avg Trip Latency", val2: "<10ms" },
    status: "Active on Core 0"
  },
  {
    id: "mekesh",
    name: "Mekeshkumar M",
    role: "Backend & AI Orchestrator",
    category: "ai",
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80",
    bio: "Architected the FastAPI WebSocket backend and trained the LSTM/ARIMA predictive models and RL Decision Core.",
    specialization: "Python, FastAPI, PyTorch, ONNX Runtime, WebSocket Pipelines.",
    funFact: "Optimized ONNX inference down to 22.8ms on CPU.",
    stats: { label1: "Model Accuracy", val1: "88.3%", label2: "Inference Speed", val2: "22.8ms" },
    status: "Deploying Models"
  },
  {
    id: "padmesh",
    name: "Padmesh S",
    role: "Full-Stack & Systems",
    category: "systems",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
    bio: "Built the Next.js 15 cyber-physical dashboard, integrated Supabase Auth/PostgreSQL, and managed end-to-end global state.",
    specialization: "Next.js App Router, React 19, Tailwind CSS, Supabase, Zustand.",
    funFact: "Delivered a perfect 95/100 Lighthouse performance score.",
    stats: { label1: "Lighthouse Score", val1: "95/100", label2: "UI Components", val2: "40+" },
    status: "Optimizing UI"
  }
];

// ============================================================================
// Sub-Components
// ============================================================================

const TeamCard = ({ 
  member, 
  playingAudioId, 
  setPlayingAudioId, 
  openBio, 
  openContact 
}: { 
  member: TeamMember, 
  playingAudioId: string | null, 
  setPlayingAudioId: (id: string | null) => void,
  openBio: (member: TeamMember) => void,
  openContact: (member: TeamMember) => void
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [spotlight, setSpotlight] = useState({ x: 50, y: 50 });
  const [audioProgress, setAudioProgress] = useState(10);
  const isPlaying = playingAudioId === member.id;

  // Handle Spotlight Hover
  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setSpotlight({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  // Handle Micro-Audio Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && audioProgress > 0) {
      timer = setInterval(() => setAudioProgress((p) => p - 1), 1000);
    } else if (audioProgress === 0) {
      setPlayingAudioId(null);
      setAudioProgress(10);
    }
    return () => clearInterval(timer);
  }, [isPlaying, audioProgress, setPlayingAudioId]);

  const toggleAudio = (e: MouseEvent) => {
    e.stopPropagation();
    if (isPlaying) {
      setPlayingAudioId(null);
      setAudioProgress(10);
    } else {
      setPlayingAudioId(member.id);
      setAudioProgress(10);
    }
  };

  return (
    <div className="h-[460px] w-full relative" style={{ perspective: "1000px" }}>
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full h-full relative cursor-default"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* ================= FRONT FACE ================= */}
        <div 
          ref={cardRef}
          onMouseMove={handleMouseMove}
          className="absolute inset-0 bg-[var(--bg-card)] rounded-3xl p-3 shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col justify-between border border-[var(--border-primary)] overflow-hidden group"
          style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
        >
          {/* Spotlight Overlay */}
          <div 
            className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" 
            style={{ background: `radial-gradient(350px circle at ${spotlight.x}px ${spotlight.y}px, rgba(74,222,128,0.1), transparent 80%)` }}
          />

          {/* Image Frame */}
          <div className="relative overflow-hidden rounded-2xl h-[310px] bg-[var(--bg-surface)] border border-[var(--border-primary)]/50">
            <Image 
              src={member.image} 
              alt={member.name} 
              fill 
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 mix-blend-luminosity group-hover:mix-blend-normal"
            />
            
            {/* Live Status Badge */}
            <div className="absolute top-3 left-3 bg-[var(--bg-card)]/90 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-bold text-[var(--primary)] flex items-center gap-1.5 shadow-sm z-20 border border-[var(--border-primary)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-pulse" />
              {member.status}
            </div>

            {/* Micro-Audio Button */}
            <button 
              onClick={toggleAudio} 
              className="absolute bottom-3 left-3 bg-[var(--bg-card)]/90 hover:bg-[var(--bg-card)] text-[var(--text-primary)] px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 shadow-md transition-all z-20 border border-[var(--border-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
            >
              {!isPlaying ? (
                <>
                  <Play className="w-3.5 h-3.5 text-[var(--primary)] fill-current" />
                  <span>10s Audio Log</span>
                </>
              ) : (
                <>
                  <div className="flex items-end gap-0.5 h-3.5">
                    <motion.span animate={{ height: ["4px", "12px", "4px"] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-0.5 bg-[var(--primary)]" />
                    <motion.span animate={{ height: ["4px", "14px", "4px"] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-0.5 bg-[var(--primary)]" />
                    <motion.span animate={{ height: ["4px", "10px", "4px"] }} transition={{ repeat: Infinity, duration: 0.7, delay: 0.4 }} className="w-0.5 bg-[var(--primary)]" />
                  </div>
                  <span className="text-[var(--primary)]">Playing... {audioProgress}s</span>
                </>
              )}
            </button>

            {/* Flip Button */}
            <button 
              onClick={(e) => { e.stopPropagation(); setIsFlipped(true); }} 
              aria-label="View Engineer Stats" 
              className="absolute top-3 right-3 bg-[var(--bg-card)]/90 hover:bg-[var(--primary)] text-[var(--text-muted)] hover:text-[var(--text-inverse)] w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-all z-20 border border-[var(--border-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>

          {/* Card Info Footer */}
          <div className="flex items-center justify-between px-2 pt-4 pb-2 z-20">
            <div>
              <h3 className="text-lg font-bold text-[var(--text-primary)] group-hover:text-[var(--primary)] transition-colors">{member.name}</h3>
              <p className="font-mono text-[10px] sm:text-xs text-[var(--text-muted)] font-bold uppercase tracking-wider mt-1">{member.role}</p>
            </div>
            <button 
              onClick={() => openBio(member)} 
              aria-label={`View ${member.name} profile`} 
              className="w-10 h-10 rounded-full border border-[var(--border-primary)] text-[var(--text-primary)] group-hover:border-[var(--primary)] group-hover:bg-[var(--primary)] group-hover:text-[var(--text-inverse)] flex items-center justify-center transition-all shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ================= BACK FACE ================= */}
        <div 
          className="absolute inset-0 bg-[var(--bg-surface)] rounded-3xl p-6 flex flex-col justify-between shadow-xl border border-[var(--border-primary)]/60 z-0"
          style={{ 
            backfaceVisibility: "hidden", 
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            boxShadow: "0 0 30px rgba(74,222,128,0.12), 0 20px 60px rgba(0,0,0,0.5)"
          }}
        >
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-[var(--primary)] bg-[var(--primary)]/10 px-3 py-1.5 rounded-full border border-[var(--primary)]/20 uppercase tracking-widest">
              Performance Metrics
            </span>
            <button 
              onClick={(e) => { e.stopPropagation(); setIsFlipped(false); }} 
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-xs font-semibold flex items-center gap-1.5 bg-[var(--bg-card)] border border-[var(--border-primary)] px-3 py-1.5 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
            >
              <RotateCw className="w-3 h-3 -scale-x-100" /> Flip Back
            </button>
          </div>

          <div className="my-auto space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[var(--bg-card)] p-4 rounded-2xl border border-[var(--border-primary)]">
                <span className="text-[10px] text-[var(--text-muted)] uppercase font-bold tracking-wider">{member.stats.label1}</span>
                <p className="text-2xl font-display font-extrabold text-[var(--primary)] mt-1">{member.stats.val1}</p>
              </div>
              <div className="bg-[var(--bg-card)] p-4 rounded-2xl border border-[var(--border-primary)]">
                <span className="text-[10px] text-[var(--text-muted)] uppercase font-bold tracking-wider">{member.stats.label2}</span>
                <p className="text-2xl font-display font-extrabold text-cyan-400 mt-1">{member.stats.val2}</p>
              </div>
            </div>
            <div className="bg-[var(--bg-card)] p-4 rounded-2xl border border-[var(--border-primary)]">
              <span className="text-[10px] text-[var(--text-muted)] uppercase font-bold tracking-wider block mb-1">Core Specialization</span>
              <p className="text-xs text-[var(--text-secondary)] font-medium leading-relaxed">{member.specialization}</p>
            </div>
          </div>

          <button 
            onClick={() => openContact(member)} 
            className="w-full bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--text-inverse)] font-bold text-xs py-3.5 rounded-xl shadow-md transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] flex items-center justify-center gap-2"
          >
            <Mail className="w-4 h-4" /> Message Engineer
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ============================================================================
// Main Component
// ============================================================================

export default function AboutTeamSection() {
  const { shouldAnimate, transitions } = useMotionConfig();
  const [filter, setFilter] = useState<Category>("all");
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  
  const [bioModal, setBioModal] = useState<TeamMember | null>(null);
  const [contactDrawer, setContactDrawer] = useState<TeamMember | null>(null);

  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  // Escape key listener for modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setBioModal(null);
        setContactDrawer(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const filteredTeam = TEAM_DATA.filter((m) => filter === "all" || m.category === filter);

  return (
    <section ref={sectionRef} className="py-24 border-y border-[var(--border-primary)]/30 overflow-hidden relative" style={{ background: "var(--bg-base)" }}>
      {/* Holographic shimmer bg */}
      <div 
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: "conic-gradient(from 0deg at 50% 50%, #4ade80, #6366f1, #22d3ee, #4ade80)",
          backgroundSize: "800px 800px",
          animation: "holo-rotate 20s linear infinite"
        }}
      />
      <style jsx>{`
        @keyframes holo-rotate { to { background-position: 800px 800px; } }
      `}</style>
      <Container>
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8 mb-12">
          <motion.div 
            initial={shouldAnimate ? { opacity: 0, x: -20 } : { opacity: 1 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="max-w-xl"
          >
            <div className="inline-flex items-center bg-[var(--bg-card)] border border-[var(--primary)]/30 text-[var(--primary)] text-xs font-bold px-4 py-1.5 rounded-full shadow-sm mb-6 uppercase tracking-widest gap-2">
              <Users className="w-3.5 h-3.5" /> Core Team
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold text-[var(--text-primary)] tracking-tight leading-[1.12]">
              Engineers behind the <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary)] to-cyan-400">Architecture</span>
            </h2>
          </motion.div>

          <motion.div 
            initial={shouldAnimate ? { opacity: 0, x: 20 } : { opacity: 1 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="max-w-md lg:pt-4 flex flex-col items-start"
          >
            <p className="text-[var(--text-secondary)] text-base sm:text-lg leading-relaxed mb-6 font-medium">
              Meet the electrical engineers and software architects turning fragmented microgrids into autonomous, self-healing networks.
            </p>
            <a href="https://github.com/gridflowx" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2.5 text-[var(--text-primary)] hover:text-[var(--primary)] font-bold text-sm sm:text-base transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] rounded-md px-2 py-1 -ml-2">
              <span className="underline underline-offset-4 decoration-[1.5px] decoration-[var(--border-primary)] group-hover:decoration-[var(--primary)]">View GitHub Org</span>
              <span className="w-8 h-8 rounded-full border border-[var(--border-primary)] group-hover:border-[var(--primary)] flex items-center justify-center text-xs transition-colors bg-[var(--bg-card)] shadow-sm">
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" />
              </span>
            </a>
          </motion.div>
        </div>

        {/* Filter Pills */}
        <motion.div 
          initial={shouldAnimate ? { opacity: 0, y: 10 } : { opacity: 1 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex items-center gap-2 mb-10 overflow-x-auto pb-4 scrollbar-none"
        >
          {([
            { id: "all", label: "All Engineers" },
            { id: "hardware", label: "Edge / Hardware" },
            { id: "ai", label: "Cloud / AI" },
            { id: "systems", label: "UI / Systems" }
          ] as { id: Category, label: string }[]).map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilter(cat.id)}
              aria-pressed={filter === cat.id}
              className={cn(
                "px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm transition-all whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]",
                filter === cat.id 
                  ? "bg-[var(--primary)] text-[var(--text-inverse)] border border-[var(--primary)]" 
                  : "bg-[var(--bg-card)] border border-[var(--border-primary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--primary)]/50"
              )}
            >
              {cat.label}
            </button>
          ))}
        </motion.div>

        {/* Team Grid with Isotope Filtering Animation */}
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 min-h-[480px]">
          <AnimatePresence mode="popLayout">
            {filteredTeam.map((member) => (
              <motion.div
                key={member.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={transitions.spring}
              >
                <TeamCard 
                  member={member} 
                  playingAudioId={playingAudioId} 
                  setPlayingAudioId={setPlayingAudioId} 
                  openBio={setBioModal}
                  openContact={setContactDrawer}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

      </Container>

      {/* ================= BIO MODAL (Center) ================= */}
      <AnimatePresence>
        {bioModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setBioModal(null)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm cursor-pointer"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={transitions.snappy}
              className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative z-10"
            >
              <button onClick={() => setBioModal(null)} aria-label="Close" className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--text-primary)] bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-full w-8 h-8 flex items-center justify-center transition-colors">
                <X className="w-4 h-4" />
              </button>
              
              <div className="w-24 h-24 rounded-2xl overflow-hidden mb-6 mx-auto border border-[var(--border-primary)]/50 shadow-inner">
                <Image src={bioModal.image} alt={bioModal.name} width={96} height={96} className="w-full h-full object-cover" />
              </div>
              
              <div className="text-center">
                <h3 className="text-2xl font-bold font-display text-[var(--text-primary)]">{bioModal.name}</h3>
                <p className="text-xs font-mono font-bold uppercase tracking-widest text-[var(--primary)] mt-1 mb-4">{bioModal.role}</p>
                
                <div className="p-4 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-primary)] mb-6">
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed font-medium">{bioModal.bio}</p>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-[var(--primary)]/10 border border-[var(--primary)]/20 mb-6 text-left">
                  <Sparkles className="w-4 h-4 text-[var(--primary)] shrink-0 mt-0.5" />
                  <p className="text-xs text-[var(--text-secondary)]"><strong className="text-[var(--primary)]">Fun Fact:</strong> {bioModal.funFact}</p>
                </div>

                <div className="flex gap-3 justify-center">
                  <a href="#" className="w-10 h-10 rounded-full bg-[var(--bg-surface)] border border-[var(--border-primary)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--text-primary)] transition-all">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <a href="#" className="w-10 h-10 rounded-full bg-[var(--bg-surface)] border border-[var(--border-primary)] flex items-center justify-center text-[var(--text-muted)] hover:text-cyan-400 hover:border-cyan-400 transition-all">
                    <MessageCircle className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= CONTACT DRAWER (Slide Right) ================= */}
      <AnimatePresence>
        {contactDrawer && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setContactDrawer(null)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 cursor-pointer"
            />
            <motion.div 
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-[var(--bg-card)] border-l border-[var(--border-primary)] p-6 sm:p-8 z-50 flex flex-col justify-between overflow-y-auto shadow-2xl"
            >
              <div>
                <div className="flex justify-between items-center mb-8 pb-4 border-b border-[var(--border-primary)]/50">
                  <span className="text-xs font-mono font-bold text-[var(--primary)] bg-[var(--primary)]/10 border border-[var(--primary)]/20 px-3 py-1.5 rounded-full uppercase tracking-widest">
                    Direct Comm Channel
                  </span>
                  <button onClick={() => setContactDrawer(null)} className="w-8 h-8 rounded-full bg-[var(--bg-surface)] hover:bg-[var(--border-primary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] flex items-center justify-center transition-colors border border-[var(--border-primary)]">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="text-2xl sm:text-3xl font-display font-bold text-[var(--text-primary)] mb-2">Message Engineer</h3>
                <p className="text-sm font-medium text-[var(--text-muted)] mb-8 flex items-center gap-2">
                  Routing to <span className="text-[var(--primary)] font-bold">{contactDrawer.name}</span>
                </p>

                {/* Simulated Form */}
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">Subject Matter</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button className="border border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)] font-bold text-xs py-3 rounded-xl transition-all">Architecture</button>
                      <button className="border border-[var(--border-primary)] bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--primary)]/50 font-bold text-xs py-3 rounded-xl transition-all">Collaboration</button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">Your Email</label>
                    <input type="email" placeholder="dev@company.com" className="w-full bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] placeholder-[var(--text-muted)]/50" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">Payload Message</label>
                    <textarea rows={4} placeholder="Enter your inquiry..." className="w-full bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] placeholder-[var(--text-muted)]/50 resize-none" />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[var(--border-primary)]/50">
                <button 
                  onClick={() => {
                    alert('Message securely routed to engineer.');
                    setContactDrawer(null);
                  }} 
                  className="w-full bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--text-inverse)] font-bold text-sm py-4 rounded-xl shadow-[0_0_15px_rgba(var(--primary),0.2)] transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5"
                >
                  <Mail className="w-4 h-4" /> Transmit Message
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </section>
  );
}