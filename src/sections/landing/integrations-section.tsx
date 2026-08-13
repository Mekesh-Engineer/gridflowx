"use client";

import { useRef, useState, useMemo } from "react";
import { Container } from "@/components/shared/container";
import { SectionHeader } from "@/components/shared/section-header";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { useMotionConfig } from "@/hooks/use-motion-config";
import {
  Layers,
  Cpu,
  Server,
  Sparkles,
  Layout,
  Search,
  ArrowRight,
  Grid3X3,
  Repeat,
} from "lucide-react";

// ============================================================================
// Types & Interfaces
// ============================================================================

export type TechLayer = "all" | "edge" | "cloud" | "ai" | "frontend";

export interface Integration {
  id: string;
  name: string;
  category: string;
  layer: "edge" | "cloud" | "ai" | "frontend";
  badge: string;
  description: string;
  pulse?: boolean;
}

// ============================================================================
// Official & Recognized Brand SVG Logos
// ============================================================================

const TechIcons: Record<string, (props: React.SVGProps<SVGSVGElement>) => React.JSX.Element> = {
  // Edge & Hardware
  "esp32": (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M6 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3H6zm1 4h10a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1zm2 2v2h2V9H9zm4 0v2h2V9h-2zm-4 4v2h2v-2H9zm4 0v2h2v-2h-2zm-8-3H3v-1h2v1zm0-3H3V6.5h2V7zm0 6H3v-.5h2V13zm16-3h2v-1h-2v1zm0-3h2V6.5h-2V7zm0 6h2v-.5h-2V13zM9 3v2h1V3H9zm4 0v2h1V3h-1zm-4 16v2h1v-2H9zm4 0v2h1v-2h-1z" />
    </svg>
  ),
  "freertos": (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v4.25l3.5 2.1-1 1.65L11 12.5V7z" />
      <path d="M7 12a5 5 0 0 1 5-5v2a3 3 0 0 0-3 3H7z" opacity="0.6" />
    </svg>
  ),
  "cpp": (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M22.394 6.002a2.03 2.03 0 0 0-1.025-1.775L13.119.58a2.032 2.032 0 0 0-2.05 0L2.819 4.227a2.03 2.03 0 0 0-1.025 1.775v8.132a2.03 2.03 0 0 0 1.025 1.775l8.25 4.764a2.032 2.032 0 0 0 2.05 0l8.25-4.764a2.03 2.03 0 0 0 1.025-1.775V6.002zM11.66 14.86c-2.13 0-3.66-1.5-3.66-3.66s1.53-3.66 3.66-3.66c1.44 0 2.52.75 3.09 1.83l-1.47.84c-.33-.63-.9-1.02-1.62-1.02-1.14 0-1.98.9-1.98 2.01s.84 2.01 1.98 2.01c.75 0 1.32-.42 1.65-1.05l1.47.84c-.6 1.11-1.68 1.86-3.12 1.86zm4.59-2.85h-.9v-1.62h.9V9.5h1.62v.89h.9v1.62h-.9v.89H16.25v-.89zm4.05 0h-.9v-1.62h.9V9.5h1.62v.89h.9v1.62h-.9v.89H20.3v-.89z" />
    </svg>
  ),
  "arduinojson": (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M16.5 6a5.5 5.5 0 0 0-4.5 2.34A5.5 5.5 0 0 0 7.5 6 5.5 5.5 0 0 0 2 11.5 5.5 5.5 0 0 0 7.5 17a5.5 5.5 0 0 0 4.5-2.34A5.5 5.5 0 0 0 16.5 17a5.5 5.5 0 0 0 5.5-5.5A5.5 5.5 0 0 0 16.5 6zm-9 9a3.5 3.5 0 0 1-3.5-3.5A3.5 3.5 0 0 1 7.5 8a3.48 3.48 0 0 1 2.87 1.51L8.59 11H6V12h2.59l1.78 1.49A3.48 3.48 0 0 1 7.5 15zm9 0a3.48 3.48 0 0 1-2.87-1.51L15.41 12H18v-1h-2.59l-1.78-1.49A3.48 3.48 0 0 1 16.5 8a3.5 3.5 0 0 1 3.5 3.5 3.5 3.5 0 0 1-3.5 3.5zm-11-4h3v1h-3zm10-1h1v-1h1v1h1v1h-1v1h-1v-1h-1z" />
    </svg>
  ),

  // Backend & Cloud
  "fastapi": (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 0a12 12 0 1 0 12 12A12.014 12.014 0 0 0 12 0zm-.788 4.707h4.086l-4.14 6.787h3.766L6.87 19.293l2.45-6.787H6.702z" />
    </svg>
  ),
  "python": (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M11.914 0C5.82 0 6.2 2.645 6.2 2.645l.006 2.738h5.81v.822H3.88S0 5.766 0 11.884c0 6.12 3.398 5.908 3.398 5.908h2.03v-2.85s-.11-3.398 3.337-3.398h5.753s3.227.05 3.227-3.155V3.155S18.23 0 11.914 0zm-3.23 1.838a1.002 1.002 0 1 1 0 2.004 1.002 1.002 0 0 1 0-2.004zM12.086 24c6.094 0 5.714-2.645 5.714-2.645l-.006-2.738h-5.81v-.822h8.136S24 18.234 24 12.116c0-6.12-3.398-5.908-3.398-5.908h-2.03v2.85s.11 3.398-3.337 3.398H9.482s-3.227-.05-3.227 3.155v5.234S5.77 24 12.086 24zm3.23-1.838a1.002 1.002 0 1 1 0-2.004 1.002 1.002 0 0 1 0 2.004z" />
    </svg>
  ),
  "websockets": (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M19.78 4.22a11 11 0 1 0 0 15.56l-1.42-1.42a9 9 0 1 1 0-12.72l1.42-1.42zM16.95 7.05a7 7 0 1 0 0 9.9l-1.41-1.41a5 5 0 1 1 0-7.08l1.41-1.41zM13 12a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" />
      <path d="M11 2v4h2V2h-2zm-9 9v2h4v-2H2zm16 0v2h4v-2h-4zm-7 7v4h2v-4h-2z" />
    </svg>
  ),
  "firebase": (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M3.89 15.672L6.255.461A.542.542 0 0 1 7.27.284l2.871 5.394-6.25 10zM20.11 15.672l-1.89-11.9a.542.542 0 0 0-.97-.245L3.89 15.672l7.28 4.103a1.64 1.64 0 0 0 1.66 0l7.28-4.103zM14.7 6.452l-2.02-3.873a.542.542 0 0 0-.96 0L3.89 15.672l6.98-3.93 3.83-5.29z" />
    </svg>
  ),
  "firestore": (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 1.5c-4.42 0-8 1.12-8 2.5v16c0 1.38 3.58 2.5 8 2.5s8-1.12 8-2.5v-16c0-1.38-3.58-2.5-8-2.5zm0 2c3.54 0 6 1 6 1.5s-2.46 1.5-6 1.5-6-1-6-1.5 2.46-1.5 6-1.5zm-6 5.2c1.4.6 3.5.8 6 .8s4.6-.2 6-.8V10c0 .5-2.46 1.5-6 1.5s-6-1-6-1.5V8.7zm0 4.5c1.4.6 3.5.8 6 .8s4.6-.2 6-.8V15c0 .5-2.46 1.5-6 1.5s-6-1-6-1.5v-1.8zm0 4.5c1.4.6 3.5.8 6 .8s4.6-.2 6-.8v1.8c0 .5-2.46 1.5-6 1.5s-6-1-6-1.5v-1.8z" />
      <path d="M12 9l2 3.5-2 1.5-2-1.5z" opacity="0.6" />
    </svg>
  ),
  "postgresql": (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M11.894 0C5.324 0 .002 5.322.002 11.892c0 3.738 1.725 7.07 4.417 9.25-.06-.593-.092-1.2-.092-1.817 0-4.047 2.375-7.55 5.787-9.213C9.728 9.535 9.5 8.795 9.5 8c0-2.485 2.015-4.5 4.5-4.5s4.5 2.015 4.5 4.5c0 .795-.228 1.535-.614 2.112 3.412 1.663 5.787 5.166 5.787 9.213 0 .617-.032 1.224-.092 1.817 2.692-2.18 4.417-5.512 4.417-9.25C23.998 5.322 18.665 0 11.894 0zm2.106 6c1.38 0 2.5 1.12 2.5 2.5S15.38 11 14 11s-2.5-1.12-2.5-2.5S12.62 6 14 6z" />
    </svg>
  ),
  "prisma": (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M21.996 18.514L13.784 1.874c-.752-1.524-2.816-1.524-3.568 0L1.97 18.514c-.752 1.524.28 3.486 1.784 3.486h16.458c1.504 0 2.536-1.962 1.784-3.486zM12 3.65l7.51 15.22H4.49L12 3.65z" />
    </svg>
  ),
  "docker": (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M13.983 11.078h2.119a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.119a.185.185 0 00-.185.185v1.888c0 .102.083.185.185.185m-2.954-5.43h2.118a.186.186 0 00.186-.186V3.574a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.888c0 .102.082.185.185.185m0 2.716h2.118a.187.187 0 00.186-.186V6.29a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.887c0 .102.082.186.185.186m-2.93 0h2.12a.186.186 0 00.184-.186V6.29a.185.185 0 00-.185-.185H8.1a.185.185 0 00-.185.185v1.887c0 .102.083.186.185.186m-2.964 0h2.119a.186.186 0 00.185-.186V6.29a.185.185 0 00-.185-.185H5.136a.186.186 0 00-.186.185v1.887c0 .102.084.186.186.186m5.893 2.715h2.118a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.118a.185.185 0 00-.185.185v1.888c0 .102.082.185.185.185m-2.93 0h2.12a.185.185 0 00.184-.185V9.006a.185.185 0 00-.184-.186h-2.12a.185.185 0 00-.184.185v1.888c0 .102.083.185.185.185m-2.964 0h2.119a.185.185 0 00.185-.185V9.006a.185.185 0 00-.185-.186H5.136a.186.186 0 00-.186.186v1.887c0 .102.084.185.186.185m-2.928 0h2.119a.185.185 0 00.185-.185V9.006a.185.185 0 00-.185-.186H2.208a.185.185 0 00-.185.185v1.888c0 .102.083.185.185.185m21.68 1.134a4.34 4.34 0 00-1.89-2.392l-.396-.238-.344.31a3.024 3.024 0 01-1.928.795H1.472a1.272 1.272 0 00-1.266 1.27c0 4.148 2.66 7.63 7.82 7.63 6.364 0 10.985-3.328 12.875-7.375z" />
    </svg>
  ),

  // AI & Forecasting
  "pytorch": (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M13.775 0a9.94 9.94 0 0 0-6.19 2.15l1.62 1.62a7.66 7.66 0 0 1 4.57-1.52c4.25 0 7.7 3.45 7.7 7.7 0 1.62-.5 3.12-1.37 4.36l1.63 1.63A9.9 9.9 0 0 0 23.725 9.95c0-5.5-4.45-9.95-9.95-9.95zm-2.05 4.14a1.35 1.35 0 1 0 0-2.7 1.35 1.35 0 0 0 0 2.7zm-4.3 2.18A9.9 9.9 0 0 0 3.825 9.95c0 5.5 4.45 9.95 9.95 9.95 2.5 0 4.79-.92 6.54-2.45l-1.62-1.62a7.66 7.66 0 0 1-4.92 1.82c-4.25 0-7.7-3.45-7.7-7.7 0-1.8.62-3.46 1.67-4.78L7.425 6.32zM14.5 7.5L9.75 13.5h3.5v5.5l4.75-6h-3.5V7.5z" />
    </svg>
  ),
  "onnx": (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M23.955 8.813a3.548 3.548 0 0 0-3.543-3.543h-4.82a3.548 3.548 0 0 0-3.543 3.543v.878H7.951V8.813a3.548 3.548 0 0 0-3.543-3.543H0v3.543h4.408v6.374H0v3.543h4.408a3.548 3.548 0 0 0 3.543-3.543v-.878h4.098v.878a3.548 3.548 0 0 0 3.543 3.543h4.82a3.548 3.548 0 0 0 3.543-3.543v-6.374zm-3.543 6.374h-4.82V8.813h4.82v6.374z" />
    </svg>
  ),
  "openweathermap": (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 4.5a7.5 7.5 0 0 0-7.38 6.13A5.5 5.5 0 0 0 5.5 21.5h12a5.5 5.5 0 0 0 4.88-8.03A7.5 7.5 0 0 0 12 4.5zm0 2a5.5 5.5 0 0 1 5.4 4.52.75.75 0 0 0 .64.62A3.5 3.5 0 0 1 17.5 19.5h-12a3.5 3.5 0 0 1-.95-6.87.75.75 0 0 0 .54-.72A5.5 5.5 0 0 1 12 6.5z" />
      <path d="M12 1.5a1 1 0 0 1 1 1v1a1 1 0 0 1-2 0v-1a1 1 0 0 1 1-1zm6.36 2.64a1 1 0 0 1 1.41 0l.71.71a1 1 0 0 1-1.41 1.41l-.71-.71a1 1 0 0 1 0-1.41zM21.5 11a1 1 0 0 1 1 1v0a1 1 0 0 1-1 1h-1a1 1 0 0 1 0-2h1zM4.23 4.14a1 1 0 0 1 1.41 1.41l-.7.71A1 1 0 0 1 3.53 4.85l.7-.71zM2.5 11a1 1 0 0 1 0 2h-1a1 1 0 0 1 0-2h1z" />
    </svg>
  ),

  // Frontend & UI
  "nextjs": (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M18.665 21.978C16.687 23.243 14.42 24 12 24 5.373 24 0 18.627 0 12S5.373 0 12 0s12 5.373 12 12c0 3.168-1.229 6.052-3.242 8.196L9.67 6.467A.82.82 0 0 0 9 6.002H7.25c-.414 0-.75.336-.75.75v10.496c0 .414.336.75.75.75h1.22c.414 0 .75-.336.75-.75V9.458l9.445 12.52zM15.42 6.752c-.414 0-.75.336-.75.75v6.5c0 .414.336.75.75.75h1.22c.414 0 .75-.336.75-.75v-6.5c0-.414-.336-.75-.75-.75H15.42z" />
    </svg>
  ),
  "react": (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 9.07c-1.62 0-2.93 1.31-2.93 2.93s1.31 2.93 2.93 2.93 2.93-1.31 2.93-2.93S13.62 9.07 12 9.07zm0 4.67c-.96 0-1.74-.78-1.74-1.74s.78-1.74 1.74-1.74 1.74.78 1.74 1.74-.78 1.74-1.74 1.74zm9.64-1.74c-.21-1.38-.9-2.58-1.92-3.41-1.02-.83-2.34-1.29-3.78-1.35.5-1.12.72-2.31.62-3.47-.1-1.16-.62-2.22-1.46-3.01-.84-.79-1.93-1.23-3.1-1.23s-2.26.44-3.1 1.23c-.84.79-1.36 1.85-1.46 3.01-.1 1.16.12 2.35.62 3.47-1.44.06-2.76.52-3.78 1.35-1.02.83-1.71 2.03-1.92 3.41-.21 1.38.07 2.76.79 3.93.72 1.17 1.8 2.07 3.08 2.58-.27 1.2-.18 2.43.27 3.54.45 1.11 1.26 2.02 2.29 2.58 1.03.56 2.22.75 3.39.54 1.17-.21 2.22-.84 2.99-1.77.77.93 1.82 1.56 2.99 1.77 1.17.21 2.36.02 3.39-.54 1.03-.56 1.84-1.47 2.29-2.58.45-1.11.54-2.34.27-3.54 1.28-.51 2.36-1.41 3.08-2.58.72-1.17 1-2.55.79-3.93zm-9.64 9.17c-.82 0-1.6-.28-2.24-.8-.64-.52-1.07-1.24-1.23-2.05 1.12.18 2.28.27 3.47.27s2.35-.09 3.47-.27c-.16.81-.59 1.53-1.23 2.05-.64.52-1.42.8-2.24.8zm-6.28-4.47c-.89-.4-1.63-1.04-2.12-1.84-.49-.8-.68-1.74-.53-2.67.15-.93.63-1.75 1.36-2.33.73-.58 1.66-.9 2.65-.92.21.6.49 1.18.84 1.74-.75 1.83-1.49 4.02-2.2 6.02zm12.56 0c-.71-2-1.45-4.19-2.2-6.02.35-.56.63-1.14.84-1.74.99.02 1.92.34 2.65.92.73.58 1.21 1.4 1.36 2.33.15.93-.04 1.87-.53 2.67-.49.8-1.23 1.44-2.12 1.84z" />
    </svg>
  ),
  "tailwind": (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12.001 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C13.666 10.618 15.027 12 18.001 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C16.337 6.182 14.976 4.8 12.001 4.8zm-6 7.2c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624 1.177 1.194 2.538 2.576 5.512 2.576 3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C10.337 13.382 8.976 12 6.001 12z" />
    </svg>
  ),
  "zustand": (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M18.8 5.4c-.6-.8-1.6-1.2-2.5-.9-1.2-.7-2.6-1.1-4.3-1.1s-3.1.4-4.3 1.1c-1-.3-2 .1-2.5.9-1.1 1.7-.5 3.9 1.2 4.8.1.6.3 1.2.6 1.8C6.3 12.7 6 13.8 6 15c0 3.3 2.7 6 6 6s6-2.7 6-6c0-1.2-.3-2.3-1-3.1.3-.6.5-1.2.6-1.8 1.7-.9 2.3-3.1 1.2-4.7zm-10.3 3c-.4-.4-.5-1-.2-1.5.3-.5.9-.7 1.4-.4.4.2.7.6.7 1.1 0 .6-.4 1.1-.9 1.1-.4 0-.8-.1-1-.3zm7 0c-.2.2-.6.3-1 .3-.5 0-.9-.5-.9-1.1 0-.5.3-.9.7-1.1.5-.3 1.1-.1 1.4.4.3.5.2 1.1-.2 1.5zM12 18.5c-2 0-3.5-1.1-3.5-2.5S10 13.5 12 13.5s3.5 1.1 3.5 2.5-1.5 2.5-3.5 2.5z" />
    </svg>
  ),
  "shadcn": (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="4" y1="20" x2="20" y2="4" />
      <line x1="4" y1="12" x2="12" y2="4" />
      <line x1="12" y1="20" x2="20" y2="12" />
    </svg>
  ),
  "vercel": (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M24 22.525H0l12-21.05 12 21.05z" />
    </svg>
  ),
  "github": (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  ),
};

// ============================================================================
// Domain Data (GridFlowX Enterprise Tech Stack)
// ============================================================================

const integrations: Integration[] = [
  // Edge & Hardware
  {
    id: "esp32",
    name: "ESP32 / ESP-IDF",
    category: "Hardware Firmware",
    layer: "edge",
    badge: "Dual-Core 240MHz",
    description: "Bare-metal C++ firmware with deterministic FreeRTOS hardware task scheduling.",
    pulse: true,
  },
  {
    id: "freertos",
    name: "FreeRTOS",
    category: "Edge OS",
    layer: "edge",
    badge: "Sub-10ms Cutoff",
    description: "Preemptive priority scheduler managing hard real-time safety failsafes on Core 0.",
    pulse: true,
  },
  {
    id: "cpp",
    name: "C++",
    category: "Embedded Logic",
    layer: "edge",
    badge: "Zero-Overhead",
    description: "High-performance native code for instantaneous ADC sensor polling and relay switching.",
  },
  {
    id: "arduinojson",
    name: "ArduinoJson",
    category: "Serialization",
    layer: "edge",
    badge: "Zero-Allocation",
    description: "Memory-safe JSON serialization designed for microcontrollers with zero heap churn.",
  },

  // Backend & Cloud
  {
    id: "fastapi",
    name: "FastAPI",
    category: "WebSocket Backend",
    layer: "cloud",
    badge: "Async Starlette",
    description: "High-throughput asynchronous Python ASGI server for sub-millisecond dispatch.",
    pulse: true,
  },
  {
    id: "python",
    name: "Python 3.12",
    category: "Core Backend",
    layer: "cloud",
    badge: "Sub-interpreters",
    description: "Modern Python engine executing power routing algorithms and event buses.",
  },
  {
    id: "websockets",
    name: "WebSockets",
    category: "Real-time Telemetry",
    layer: "cloud",
    badge: "1Hz Telemetry",
    description: "Persistent full-duplex protocol streaming solar metrics and control states under <100ms.",
    pulse: true,
  },
  {
    id: "firebase",
    name: "Firebase Auth",
    category: "Identity & Security",
    layer: "cloud",
    badge: "Custom JWT Claims",
    description: "Multi-tenant role-based access control for Operators, Admins, and Auditors.",
  },
  {
    id: "firestore",
    name: "Firestore",
    category: "NoSQL Database",
    layer: "cloud",
    badge: "Live Document Sync",
    description: "Low-latency document store syncing microgrid configuration state across edge nodes.",
  },
  {
    id: "postgresql",
    name: "PostgreSQL",
    category: "Relational DB",
    layer: "cloud",
    badge: "ACID Time-Series",
    description: "High-durability relational ledger logging millisecond telemetry, faults, and audits.",
  },
  {
    id: "prisma",
    name: "Prisma",
    category: "ORM",
    layer: "cloud",
    badge: "100% Type-Safe",
    description: "Next-generation ORM providing end-to-end type safety and automated migrations.",
  },
  {
    id: "docker",
    name: "Docker",
    category: "Containerization",
    layer: "cloud",
    badge: "OCI Multi-Stage",
    description: "Lightweight container runtime orchestrating backend and forecasting services.",
  },

  // AI & Forecasting
  {
    id: "pytorch",
    name: "PyTorch",
    category: "AI / ML",
    layer: "ai",
    badge: "Deep LSTM Networks",
    description: "Deep neural networks modeling 1-hour ahead solar irradiance and battery load.",
    pulse: true,
  },
  {
    id: "onnx",
    name: "ONNX Runtime",
    category: "Inference Engine",
    layer: "ai",
    badge: "FP16 Acceleration",
    description: "Optimized cross-platform inference engine delivering <15ms predictive passes.",
  },
  {
    id: "openweathermap",
    name: "OpenWeatherMap",
    category: "Irradiance API",
    layer: "ai",
    badge: "Solar Weather Feeds",
    description: "Real-time cloud cover, atmospheric pressure, and direct normal irradiance telemetry.",
  },

  // Frontend & UI
  {
    id: "nextjs",
    name: "Next.js 15",
    category: "Frontend Framework",
    layer: "frontend",
    badge: "App Router & SSR",
    description: "React Server Components and streaming SSR for instant microgrid dashboards.",
  },
  {
    id: "react",
    name: "React 19",
    category: "UI Library",
    layer: "frontend",
    badge: "Concurrent Hooks",
    description: "Declarative reactive UI with Actions, Compiler optimizations, and zero tearing.",
  },
  {
    id: "tailwind",
    name: "Tailwind CSS v4",
    category: "Styling",
    layer: "frontend",
    badge: "Lightning CSS",
    description: "Zero-runtime CSS engine with custom design tokens and hardware-accelerated transitions.",
  },
  {
    id: "zustand",
    name: "Zustand",
    category: "State Management",
    layer: "frontend",
    badge: "Atomic Reactive Store",
    description: "Blazing-fast client state management without unnecessary telemetry re-renders.",
  },
  {
    id: "shadcn",
    name: "shadcn/ui",
    category: "UI Components",
    layer: "frontend",
    badge: "Radix Primitives",
    description: "Accessible, unstyled component primitives tailored to GridFlowX design tokens.",
  },
  {
    id: "vercel",
    name: "Vercel",
    category: "Edge Deployment",
    layer: "frontend",
    badge: "Global Anycast Edge",
    description: "Global edge network with instant cache invalidation and hardware TLS termination.",
  },
  {
    id: "github",
    name: "GitHub Actions",
    category: "CI/CD Pipeline",
    layer: "frontend",
    badge: "Automated Workflows",
    description: "Automated test suites, ESP32 firmware compilation, and zero-downtime releases.",
  },
];

const layersConfig: { id: TechLayer; label: string; count: number; icon: React.ElementType }[] = [
  { id: "all", label: "All Stack", count: 22, icon: Layers },
  { id: "edge", label: "Edge & Hardware", count: 4, icon: Cpu },
  { id: "cloud", label: "Backend & Cloud", count: 8, icon: Server },
  { id: "ai", label: "AI & Forecasting", count: 3, icon: Sparkles },
  { id: "frontend", label: "Frontend & UI", count: 7, icon: Layout },
];

// ============================================================================
// Integration Card Component
// ============================================================================

function IntegrationCard({
  integration,
  viewMode = "marquee",
}: {
  integration: Integration;
  viewMode?: "marquee" | "grid";
}) {
  const { shouldAnimate } = useMotionConfig();
  const IconComponent = TechIcons[integration.id] || Cpu;

  return (
    <motion.div
      className={cn(
        "group relative border border-[var(--border-primary)]/80 bg-[var(--bg-card)]/90 backdrop-blur-md rounded-2xl overflow-hidden transition-all duration-300",
        viewMode === "marquee"
          ? "w-[310px] shrink-0 p-5 cursor-pointer select-none"
          : "w-full p-6 flex flex-col justify-between"
      )}
      whileHover={
        shouldAnimate
          ? {
              y: -4,
              scale: 1.015,
              borderColor: "var(--primary)",
              boxShadow: "0 12px 28px -8px var(--val-shadow-primary)",
            }
          : {}
      }
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Dynamic Hover Glow Spotlight using Theme Token */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-500 rounded-2xl bg-[radial-gradient(circle_at_50%_0%,var(--primary-light)_0%,transparent_70%)]"
      />

      {/* Top Border Accent Line on Hover using Theme Token */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[linear-gradient(90deg,transparent,var(--primary),transparent)]"
      />

      {/* Card Header: Icon + Name + Category + Badge */}
      <div className="relative z-10 flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center border border-[var(--primary)]/20 bg-[var(--primary-light)] text-[var(--primary)] transition-all duration-300 group-hover:scale-105 group-hover:border-[var(--primary)]/40 shadow-sm shrink-0"
          >
            <IconComponent className="w-5 h-5 transition-transform duration-300 group-hover:rotate-3" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold tracking-tight text-[var(--text-primary)] group-hover:text-[var(--primary)] transition-colors duration-200 truncate">
                {integration.name}
              </span>
              {integration.pulse && (
                <span className="relative flex h-2 w-2 shrink-0" title="Real-time Active Component">
                  <span
                    className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-[var(--primary)]"
                  />
                  <span
                    className="relative inline-flex rounded-full h-2 w-2 bg-[var(--primary)]"
                  />
                </span>
              )}
            </div>
            <span className="text-xs text-[var(--text-muted)] font-mono block truncate">
              {integration.category}
            </span>
          </div>
        </div>

        {/* Micro Tech Pill using Theme Token */}
        <span
          className="text-[10px] font-mono px-2.5 py-0.5 rounded-full border border-[var(--primary)]/25 bg-[var(--primary-light)] text-[var(--primary)] font-medium transition-colors duration-200 whitespace-nowrap shrink-0"
        >
          {integration.badge}
        </span>
      </div>

      {/* Description */}
      <div className="relative z-10 mt-1">
        <p className="text-xs leading-relaxed text-[var(--text-muted)] group-hover:text-[var(--text-primary)]/90 transition-colors duration-200 line-clamp-2">
          {integration.description}
        </p>
      </div>

      {/* Grid specific footer tags */}
      {viewMode === "grid" && (
        <div className="relative z-10 mt-4 pt-3 border-t border-[var(--border-primary)]/40 flex items-center justify-between text-[11px] text-[var(--text-muted)]">
          <span className="capitalize font-mono flex items-center gap-1.5">
            <span
              className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]"
            />
            {integration.layer} layer
          </span>
          <span className="group-hover:text-[var(--primary)] transition-colors duration-200 flex items-center gap-1 font-medium">
            Production Ready
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform duration-200" />
          </span>
        </div>
      )}
    </motion.div>
  );
}

// ============================================================================
// Main Section Component
// ============================================================================

export function IntegrationsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-60px" });
  const { shouldAnimate } = useMotionConfig();

  const [activeLayer, setActiveLayer] = useState<TechLayer>("all");
  const [viewMode, setViewMode] = useState<"marquee" | "grid">("marquee");
  const [searchQuery, setSearchQuery] = useState("");

  // Filtered list for Grid Mode
  const filteredIntegrations = useMemo(() => {
    return integrations.filter((item) => {
      const matchesLayer = activeLayer === "all" || item.layer === activeLayer;
      const matchesSearch =
        searchQuery.trim() === "" ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.badge.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesLayer && matchesSearch;
    });
  }, [activeLayer, searchQuery]);

  // Split integrations for the two marquee rows
  const halfLength = Math.ceil(integrations.length / 2);
  const row1 = integrations.slice(0, halfLength);
  const row2 = integrations.slice(halfLength);

  return (
    <section
      id="integrations"
      ref={sectionRef}
      className="relative py-20 lg:py-28 overflow-hidden border-t border-[var(--border-primary)]/20"
    >
      {/* Background ambient lighting effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-[var(--primary)]/5 rounded-full blur-[120px]" />
        <div className="absolute -bottom-32 right-10 w-[450px] h-[250px] bg-[var(--primary)]/5 rounded-full blur-[100px]" />
      </div>

      {/* Inline animations for Infinite Smooth Marquees */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @keyframes marquee-infinite {
            0% { transform: translateX(0%); }
            100% { transform: translateX(-50%); }
          }
          @keyframes marquee-infinite-reverse {
            0% { transform: translateX(-50%); }
            100% { transform: translateX(0%); }
          }
          .animate-marquee-flow {
            animation: marquee-infinite 45s linear infinite;
          }
          .animate-marquee-flow-reverse {
            animation: marquee-infinite-reverse 45s linear infinite;
          }
          .pause-on-hover:hover .animate-marquee-flow,
          .pause-on-hover:hover .animate-marquee-flow-reverse {
            animation-play-state: paused;
          }
        `,
        }}
      />

      <Container>
        {/* Section Header */}
        <motion.div
          initial={shouldAnimate ? { opacity: 0, scale: 0.98, y: 16 } : { opacity: 0 }}
          animate={isInView ? { opacity: 1, scale: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <SectionHeader
            eyebrow="Core Technologies"
            align="center"
            hasTrailingLine
            title={
              <>
                Engineered with an
                <br />
                <span className="text-[var(--primary)] transition-colors duration-500">
                  enterprise technology stack.
                </span>
              </>
            }
            description={
              <>
                From <span className="text-[var(--primary)] font-semibold">deterministic embedded C++</span> on FreeRTOS to{" "}
                <span className="text-[var(--primary)] font-semibold">cloud neural forecasting</span> with PyTorch and Next.js 15.
              </>
            }
            titleClassName="mb-4"
          />
        </motion.div>

        {/* View Mode & Filter Controls */}
        <motion.div
          initial={shouldAnimate ? { opacity: 0, y: 10 } : { opacity: 0 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col md:flex-row items-center justify-between gap-4 mt-8 mb-8 max-w-5xl mx-auto"
        >
          {/* Layer Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 p-1 rounded-xl bg-[var(--bg-surface)]/80 border border-[var(--border-primary)]/60 backdrop-blur-md">
            {layersConfig.map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeLayer === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveLayer(tab.id);
                    if (viewMode !== "grid" && tab.id !== "all") {
                      setViewMode("grid");
                    }
                  }}
                  className={cn(
                    "relative flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 select-none",
                    isActive
                      ? "text-[var(--text-inverse)] font-semibold shadow-sm"
                      : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]/40"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="active-integration-tab"
                      className="absolute inset-0 bg-[var(--primary)] rounded-lg"
                      transition={{ type: "spring", stiffness: 450, damping: 35 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    <TabIcon className="w-3.5 h-3.5" />
                    {tab.label}
                    <span
                      className={cn(
                        "text-[10px] px-1.5 py-0.2 rounded-full font-mono",
                        isActive
                          ? "bg-black/20 text-[var(--text-inverse)]"
                          : "bg-[var(--border-primary)] text-[var(--text-muted)]"
                      )}
                    >
                      {tab.count}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* View Toggle: Marquee Flow vs Grid Matrix */}
          <div className="flex items-center gap-2">
            {viewMode === "grid" && (
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="text"
                  placeholder="Search stack..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-[var(--border-primary)]/80 bg-[var(--bg-card)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)] transition-all w-36 sm:w-48"
                />
              </div>
            )}

            <div className="flex items-center p-1 rounded-xl bg-[var(--bg-surface)]/80 border border-[var(--border-primary)]/60">
              <button
                onClick={() => setViewMode("marquee")}
                title="Continuous Flow View"
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all select-none",
                  viewMode === "marquee"
                    ? "bg-[var(--primary)] text-[var(--text-inverse)] shadow-sm"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                )}
              >
                <Repeat className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Flow</span>
              </button>
              <button
                onClick={() => setViewMode("grid")}
                title="Interactive Stack Matrix"
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all select-none",
                  viewMode === "grid"
                    ? "bg-[var(--primary)] text-[var(--text-inverse)] shadow-sm"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                )}
              >
                <Grid3X3 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Matrix</span>
              </button>
            </div>
          </div>
        </motion.div>
      </Container>

      {/* VIEW MODE 1: DUAL SMOOTH INFINITE MARQUEE */}
      {viewMode === "marquee" ? (
        <div className="w-full mt-2 flex flex-col gap-5 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)] pause-on-hover">
          {/* Forward Marquee Row 1 */}
          <div className="flex w-max animate-marquee-flow gap-5 pr-5">
            {/* First Set */}
            <div className="flex gap-5 shrink-0">
              {row1.map((integration) => (
                <IntegrationCard
                  key={`${integration.id}-row1-set1`}
                  integration={integration}
                  viewMode="marquee"
                />
              ))}
            </div>
            {/* Duplicate Set for Seamless Infinite Loop */}
            <div className="flex gap-5 shrink-0" aria-hidden="true">
              {row1.map((integration) => (
                <IntegrationCard
                  key={`${integration.id}-row1-set2`}
                  integration={integration}
                  viewMode="marquee"
                />
              ))}
            </div>
          </div>

          {/* Reverse Marquee Row 2 */}
          <div className="flex w-max animate-marquee-flow-reverse gap-5 pr-5">
            {/* First Set */}
            <div className="flex gap-5 shrink-0">
              {row2.map((integration) => (
                <IntegrationCard
                  key={`${integration.id}-row2-set1`}
                  integration={integration}
                  viewMode="marquee"
                />
              ))}
            </div>
            {/* Duplicate Set for Seamless Infinite Loop */}
            <div className="flex gap-5 shrink-0" aria-hidden="true">
              {row2.map((integration) => (
                <IntegrationCard
                  key={`${integration.id}-row2-set2`}
                  integration={integration}
                  viewMode="marquee"
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* VIEW MODE 2: INTERACTIVE MATRIX GRID */
        <Container>
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto"
          >
            <AnimatePresence mode="popLayout">
              {filteredIntegrations.map((integration) => (
                <motion.div
                  key={integration.id}
                  layout
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.92 }}
                  transition={{ duration: 0.3 }}
                >
                  <IntegrationCard integration={integration} viewMode="grid" />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {filteredIntegrations.length === 0 && (
            <div className="text-center py-16 border border-dashed border-[var(--border-primary)] rounded-2xl max-w-md mx-auto">
              <Search className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-3 opacity-60" />
              <div className="text-base font-medium text-[var(--text-primary)]">
                No technologies found
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Try searching for another keyword or reset the category filters.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActiveLayer("all");
                }}
                className="mt-4 px-4 py-1.5 text-xs rounded-lg bg-[var(--primary)] text-[var(--text-inverse)] font-medium"
              >
                Reset Filters
              </button>
            </div>
          )}
        </Container>
      )}

      {/* Bottom Interactive Prompt & Help Text */}
      <Container>
        <div className="mt-10 text-center">
          <p className="text-xs text-[var(--text-muted)] flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-pulse" />
            Hover over any technology card to view isolated telemetry, hardware benchmarks, and architectural details.
          </p>
        </div>
      </Container>
    </section>
  );
}