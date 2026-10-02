import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";

const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const LinkedinIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" rx="1" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const TwitterIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

const YoutubeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17z" />
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="currentColor" />
  </svg>
);

const AnimatedWave = dynamic(
  () => import("@/3d/components/animated-wave").then((mod) => mod.AnimatedWave),
  { ssr: false }
);

export function CompactFooter() {
  const mainLinks = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Features", href: "/features" },
    { name: "Developers", href: "/developers" },
    { name: "Explorer", href: "/explorer", hasMegaMenu: true },
    { name: "Contact", href: "/contact" },
  ];

  const socialLinks = [
    { name: "GitHub", icon: GithubIcon, href: "https://github.com/Mekesh-Engineer/gridflowx" },
    { name: "LinkedIn", icon: LinkedinIcon, href: "#" },
    { name: "Twitter", icon: TwitterIcon, href: "#" },
    { name: "YouTube", icon: YoutubeIcon, href: "#" },
  ];

  return (
    <footer className="relative bg-black border-t border-zinc-900 overflow-hidden selection:bg-primary/20">
      
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

      <div className="relative z-10 mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        
        {/* Logo */}
        <div className="flex justify-center text-[var(--primary)]">
          <Link 
            href="/" 
            className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] rounded-xl px-2 py-1"
          >
            <div className="relative w-10 h-10 rounded-xl bg-[var(--primary)]/10 border border-[var(--primary)]/20 flex items-center justify-center shadow-[0_0_15px_var(--val-shadow-primary)] transition-transform duration-500 group-hover:scale-105 group-hover:bg-[var(--primary)]/20">
              <Image
                src="/favicon.svg"
                alt="GridFlowX Logo"
                width={20}
                height={20}
                className="object-contain"
              />
            </div>
            <span className="text-3xl font-display font-bold tracking-tight text-white">
              GridFlowX
            </span>
          </Link>
        </div>

        {/* Description */}
        <p className="mx-auto mt-6 max-w-md text-center leading-relaxed text-zinc-400 text-sm">
          A production-grade, edge-cloud hybrid cyber-physical platform for intelligent energy routing, renewable generation maximization, and predictive hardware maintenance.
        </p>

        {/* Navigation Links */}
        <ul className="mt-10 flex flex-wrap justify-center gap-6 md:gap-8 lg:gap-12">
          {mainLinks.map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
                className="text-sm font-medium text-zinc-400 transition-colors hover:text-[var(--primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] rounded-md px-2 py-1"
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>

        {/* Social Icons */}
        <ul className="mt-10 flex justify-center gap-6 md:gap-8">
          {socialLinks.map((social) => (
            <li key={social.name}>
              <a
                href={social.href}
                rel="noreferrer"
                target="_blank"
                className="text-zinc-500 transition-all duration-300 hover:text-[var(--primary)] hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] rounded-md p-2 block"
              >
                <span className="sr-only">{social.name}</span>
                <social.icon className="h-5 w-5" />
              </a>
            </li>
          ))}
        </ul>
        
      </div>
    </footer>
  );
}