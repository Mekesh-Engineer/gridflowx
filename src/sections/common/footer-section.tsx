"use client";

import { 
  Activity, 
  BrainCircuit, 
  Cpu, 
  LineChart, 
  BookOpen, 
  CircuitBoard, 
  Server, 
  Network, 
  Users, 
  GraduationCap, 
  FileText, 
  Map as MapIcon, 
  ShieldCheck, 
  Key, 
  Scale, 
  BookText,
  Zap,
  Mail
} from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { Container } from "@/components/shared/container";
import { cn } from "@/lib/utils";

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

const LinkedinIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const YoutubeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
  </svg>
);

const AnimatedWave = dynamic(
  () => import("@/animations/animated-wave").then((mod) => mod.AnimatedWave),
  { ssr: false }
);

// ============================================================================
// Domain Data (GridFlowX Project)
// ============================================================================

const footerLinks = {
  Platform: [
    { name: "Telemetry Dashboard", href: "/dashboard", icon: Activity },
    { name: "AI Forecasting", href: "/forecast", icon: BrainCircuit },
    { name: "Relay Control", href: "/relay", icon: Cpu },
    { name: "Analytics & Logs", href: "/analytics", icon: LineChart },
  ],
  Developers: [
    { name: "Architecture Specs", href: "/docs/architecture", icon: BookOpen },
    { name: "ESP32 Firmware", href: "/docs/hardware", icon: CircuitBoard },
    { name: "FastAPI Reference", href: "/docs/api", icon: Server },
    { name: "WebSocket Schema", href: "/docs/ws", icon: Network },
  ],
  Project: [
    { name: "About the Team", href: "/about", icon: Users },
    { name: "Kongu Eng. College", href: "https://kongu.ac.in", icon: GraduationCap },
    { name: "Phase I Report", href: "/docs/report", icon: FileText, badge: "PDF" },
    { name: "Project Roadmap", href: "/docs/roadmap", icon: MapIcon },
  ],
  Legal: [
    { name: "Security Rules", href: "/docs/security", icon: ShieldCheck },
    { name: "RBAC Policies", href: "/docs/rbac", icon: Key },
    { name: "Academic Integrity", href: "/docs/academic", icon: Scale },
  ],
};

// Social/Contact icons ordered precisely as requested
const socialLinks = [
  { name: "GitHub", href: "https://github.com/gridflowx", icon: GithubIcon },
  { name: "LinkedIn", href: "#", icon: LinkedinIcon },
  { name: "Documentation", href: "/docs", icon: BookText },
  { name: "YouTube", href: "#", icon: YoutubeIcon },
  { name: "Email", href: "mailto:contact@gridflowx.com", icon: Mail },
];

// ============================================================================
// Main Component
// ============================================================================

export function FooterSection() {
  return (
    <footer className="relative border-t border-zinc-900 bg-black overflow-hidden selection:bg-primary/20">
      
      {/* Dynamic Keyframes for smooth floating brand text */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float-brand {
          0% { transform: translate(-2%, 0); }
          50% { transform: translate(2%, 2%); }
          100% { transform: translate(-2%, 0); }
        }
        .animate-float-brand {
          animation: float-brand 20s ease-in-out infinite;
        }
      `}} />

      {/* ================= BACKGROUND EFFECTS (5 LAYERS) ================= */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex flex-col justify-end z-0">
        
        {/* Layer 1: Base Dark Surface is handled by footer's bg-black class */}

        {/* Layer 2: Ambient Green Glow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-[50vh] bg-[var(--primary)]/10 rounded-[100%] blur-[120px] mix-blend-screen" />

        {/* Layer 3: Perspective Engineering Grid */}
        <div className="absolute inset-x-0 bottom-0 h-[70vh] [perspective:1000px] opacity-35">
          <div 
            className="absolute inset-0 origin-bottom [transform:rotateX(75deg)] border-t border-primary/30"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(var(--primary), 0.2) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(var(--primary), 0.2) 1px, transparent 1px)
              `,
              backgroundSize: '4rem 4rem',
              WebkitMaskImage: 'linear-gradient(to top, black, transparent 80%)'
            }}
          />
        </div>

        {/* Layer 4: Animated Wave Matrix */}
        <div className="absolute inset-x-0 bottom-0 h-64 text-primary opacity-40 mix-blend-screen">
          <AnimatedWave />
        </div>

        {/* Layer 5: Floating Background Branding */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] select-none">
          <span className="font-display text-[12vw] font-bold tracking-tighter text-zinc-800 whitespace-nowrap animate-float-brand">
            GridFlowX
          </span>
        </div>

      </div>
      {/* ================================================================ */}

      <Container className="relative z-10">
        
        {/* Main Footer Content */}
        <div className="py-16 lg:py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-16 lg:gap-8">
            
            {/* Brand Column */}
            <div className="lg:col-span-2 group">
              <a href="#" className="inline-flex items-center gap-3 mb-6">
                <div className="relative w-10 h-10 rounded-xl bg-[var(--primary)]/10 border border-[var(--primary)]/20 flex items-center justify-center shadow-[0_0_15px_var(--val-shadow-primary)] transition-transform duration-500 group-hover:scale-105 group-hover:bg-[var(--primary)]/20">
                  <Image
                    src="/favicon.svg"
                    alt="GridFlowX Logo"
                    width={20}
                    height={20}
                    className="object-contain"
                  />
                </div>
                <span className="text-3xl font-display tracking-tight text-white">GridFlowX</span>
              </a>

              <p className="text-zinc-400 leading-relaxed mb-8 max-w-sm">
                A production-grade, edge-cloud hybrid cyber-physical platform for intelligent energy routing, renewable generation maximization, and predictive hardware maintenance.
              </p>

              {/* Social/Contact Links */}
              <div className="flex gap-4">
                {socialLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    aria-label={link.name}
                    className="w-10 h-10 rounded-full border border-zinc-800 bg-zinc-950/50 backdrop-blur-sm flex items-center justify-center text-zinc-400 hover:text-[var(--primary)] hover:border-[var(--primary)]/50 hover:bg-[var(--primary)]/5 transition-all duration-300 group/social hover:-translate-y-1 hover:shadow-[0_4px_12px_rgba(var(--primary),0.2)]"
                  >
                    <link.icon className="w-4 h-4 group-hover/social:scale-110 transition-transform duration-300" />
                  </a>
                ))}
              </div>
            </div>

            {/* Link Columns */}
            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title} className="flex flex-col">
                <h3 className="text-sm font-semibold tracking-wider uppercase text-white mb-6 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]/50" />
                  {title}
                </h3>
                <ul className="space-y-3.5">
                  {links.map((link) => (
                    <li key={link.name}>
                      <a
                        href={link.href}
                        className="group/link flex items-center gap-3 text-sm text-zinc-400 hover:text-[var(--primary)] transition-all duration-300"
                      >
                        <link.icon className="w-4 h-4 opacity-50 group-hover/link:opacity-100 group-hover/link:scale-110 transition-all duration-300" />
                        <span className="group-hover/link:translate-x-1 transition-transform duration-300">
                          {link.name}
                        </span>
                        {"badge" in link && link.badge && (
                          <span className="ml-1 text-[10px] px-2 py-0.5 bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20 rounded-full font-mono font-medium group-hover/link:bg-[var(--primary)] group-hover/link:text-black transition-colors">
                            {link.badge}
                          </span>
                        )}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-8 border-t border-zinc-900 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-sm text-zinc-500 font-mono">
            &copy; 2026 <span className="text-zinc-300">GridFlowX Research Team</span>. Kongu Engineering College.
          </p>

          <div className="flex items-center gap-4 text-sm font-mono text-zinc-400 bg-zinc-950 border border-zinc-900 px-4 py-2 rounded-full backdrop-blur-md">
            <span className="flex items-center gap-2">
              <span className="relative flex w-2 h-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full w-2 h-2 bg-primary shadow-[0_0_8px_rgba(var(--primary),1)]"></span>
              </span>
              <span className="text-zinc-200 font-medium">Mk Studios</span>
            </span>
          </div>
        </div>
      </Container>
    </footer>
  );
}