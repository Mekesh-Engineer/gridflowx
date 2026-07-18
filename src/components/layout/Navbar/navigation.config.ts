// src/app/(public)/landing/Navbar/navigation.config.ts
import { Zap, Cpu, Battery, ShieldAlert, Home, Compass, Info, Mail, LucideIcon } from "lucide-react";

export interface NavigationItem {
  name: string;
  href: string;
  hasMegaMenu?: boolean;
}

export interface MegaMenuItem {
  name: string;
  description: string;
  href: string;
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
}

export interface MegaMenuCategory {
  title: string;
  items: MegaMenuItem[];
}

export interface MegaMenuHighlight {
  tag: string;
  title: string;
  description: string;
  ctas: {
    name: string;
    href: string;
    variant: "primary" | "secondary";
  }[];
}

export interface NavigationConfig {
  mainLinks: NavigationItem[];
  megaMenu: {
    categories: MegaMenuCategory[];
    highlight: MegaMenuHighlight;
  };
  mobileLinks: {
    label: string;
    path: string;
    icon: LucideIcon;
  }[];
  ctas: {
    signIn: { name: string; href: string };
  };
}

export const navigationConfig: NavigationConfig = {
  mainLinks: [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Features", href: "/features" },
    { name: "Developers", href: "/developers" },
    { name: "Explorer", href: "/explorer", hasMegaMenu: true },
    { name: "Contact", href: "/contact" },
  ],
  megaMenu: {
    categories: [
      {
        title: "Compute Core",
        items: [
          {
            name: "AI Inference Engine",
            description: "FastAPI high frequency streaming analytics",
            href: "/inference",
            icon: Cpu,
            iconColor: "text-[var(--color-primary)]",
            iconBg: "bg-[var(--color-primary-faint)]",
          },
          {
            name: "Telemetry Distribution",
            description: "WebSocket framework connection streaming",
            href: "/telemetry",
            icon: Zap,
            iconColor: "text-[var(--color-secondary)]",
            iconBg: "bg-[var(--color-secondary-faint)]",
          },
        ],
      },
      {
        title: "Explorer & Controls",
        items: [
          {
            name: "Open Data Explorer",
            description: "Interactive microgrid node visualization dashboard",
            href: "/explorer",
            icon: Compass,
            iconColor: "text-[var(--primary)]",
            iconBg: "bg-[var(--primary)]/10",
          },
          {
            name: "Hardware Controls",
            description: "Configure relays & local grid safeties",
            href: "/controls",
            icon: ShieldAlert,
            iconColor: "text-amber-500",
            iconBg: "bg-amber-500/10",
          },
        ],
      },
    ],
    highlight: {
      tag: "Grid Analytics Active",
      title: "Real-time Telemetry Explorer",
      description: "Inspect public microgrids, battery storage nodes, and real-time generation metrics across physical telemetry layers.",
      ctas: [
        { name: "Launch Grid Explorer", href: "/explorer", variant: "primary" },
        { name: "Read API Specs", href: "/developers", variant: "secondary" },
      ],
    },
  },
  mobileLinks: [
    { label: "Home", path: "/", icon: Home },
    { label: "About", path: "/about", icon: Info },
    { label: "Features", path: "/features", icon: Zap },
    { label: "Developers", path: "/developers", icon: Cpu },
    { label: "Explorer", path: "/explorer", icon: Compass },
    { label: "Contact", path: "/contact", icon: Mail },
  ],
  ctas: {
    signIn: { name: "Sign in", href: "/login" },
  },
};