// src/app/(public)/landing/Navbar/Megamenu.tsx
"use client";

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import Link from 'next/link';
import { Award, ArrowRight } from 'lucide-react';
import { navigationConfig } from './navigation.config';

interface MegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const containerVariants: Variants = {
  hidden: { opacity: 0, y: -12, scale: 0.99 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.25,
      ease: [0.16, 1, 0.3, 1],
      when: "beforeChildren",
      staggerChildren: 0.03,
    }
  },
  exit: {
    opacity: 0,
    y: -8,
    scale: 0.99,
    transition: { duration: 0.15, ease: "easeInOut" }
  }
};

const childItemVariants: Variants = {
  hidden: { opacity: 0, x: -6 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.18, ease: "easeOut" } }
};

export const MegaMenu: React.FC<MegaMenuProps> = ({ isOpen, onClose }) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const { categories, highlight } = navigationConfig.megaMenu;

  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEscapeKey);
    return () => window.removeEventListener('keydown', handleEscapeKey);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={menuRef}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onMouseLeave={onClose}
          className="absolute left-0 right-0 top-3 bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-3xl shadow-[var(--val-shadow-card)] overflow-hidden z-50 w-full backdrop-blur-xl focus-within:ring-2 focus-within:ring-[var(--color-primary)]/10"
          role="menu"
          aria-label="Platform Mega Menu Engine"
        >
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-0">
            {/* Nav Links Grid Sections (60% Spanning Block Width) */}
            <div className="lg:col-span-3 p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              {categories.map((category, catIdx) => (
                <div key={catIdx} className="space-y-4">
                  <h3 className="text-[11px] font-mono font-bold uppercase tracking-widest text-[var(--text-muted)] border-b border-[var(--border-primary)] pb-2 select-none">
                    {category.title}
                  </h3>
                  <ul className="space-y-1.5" role="none">
                    {category.items.map((item, itemIdx) => {
                      const Icon = item.icon;
                      return (
                        <motion.li key={itemIdx} variants={childItemVariants} role="none">
                          <Link
                            href={item.href}
                            onClick={onClose}
                            className="flex items-start gap-3.5 p-2.5 -mx-2.5 rounded-xl hover:bg-[var(--bg-hover)] transition-all duration-300 ease-out group focus:outline-hidden focus:bg-[var(--bg-hover)]"
                            role="menuitem"
                          >
                            <div className={`p-2 rounded-lg ${item.iconBg} ${item.iconColor} border border-foreground/5 shadow-xs shrink-0 transition-transform duration-300 group-hover:scale-105`}>
                              <Icon size={16} />
                            </div>
                            <div className="flex-1 min-w-0 pr-2">
                              <div className="flex items-center gap-1">
                                <h4 className="text-xs font-bold text-[var(--text-primary)] transition-colors group-hover:text-[var(--color-primary)] truncate">
                                  {item.name}
                                </h4>
                                <ArrowRight size={11} className="text-[var(--color-primary)] opacity-0 -translate-x-2 transition-all duration-300 ease-out group-hover:opacity-100 group-hover:translate-x-0 shrink-0" />
                              </div>
                              <p className="text-[11px] text-[var(--text-muted)] leading-relaxed mt-0.5">
                                {item.description}
                              </p>
                            </div>
                          </Link>
                        </motion.li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>

            {/* Premium Marketing Metric Showcase Card Panel (40% Spanning Block Width) */}
            <div className="lg:col-span-2 bg-[var(--bg-secondary)] p-8 border-t lg:border-t-0 lg:border-l border-[var(--border-primary)] flex flex-col justify-between relative overflow-hidden group/highlight">
              <div className="absolute -right-24 -top-24 w-72 h-72 bg-[var(--color-primary)]/[0.03] rounded-full blur-3xl pointer-events-none group-hover/highlight:scale-110 transition-transform duration-700" />
              
              <div className="relative z-10">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-[var(--color-primary-faint)] text-[var(--color-primary)] border border-[var(--color-primary)]/10 mb-4 shadow-xs select-none">
                  <Award size={11} /> {highlight.tag}
                </span>
                <h3 className="text-lg font-bold tracking-tight text-[var(--text-primary)] leading-snug">
                  {highlight.title}
                </h3>
                <p className="text-xs text-[var(--text-muted)] mt-2 leading-relaxed font-medium">
                  {highlight.description}
                </p>

                <div className="mt-6 grid grid-cols-2 gap-4 border-t border-[var(--border-primary)] pt-5">
                  <div>
                    <span className="block text-[9px] font-mono text-[var(--text-muted)] uppercase tracking-wider select-none">Telemetry core</span>
                    <span className="text-xs font-bold text-[var(--text-primary)] mt-0.5 block">High Frequency Stream</span>
                  </div>
                  <div>
                    <span className="block text-[9px] font-mono text-[var(--text-muted)] uppercase tracking-wider select-none">AI Inference Channel</span>
                    <span className="text-xs font-bold text-[var(--text-primary)] mt-0.5 block">FastAPI Server (Port 8000)</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-8 relative z-10">
                {highlight.ctas.map((cta, ctaIdx) => (
                  <Link
                    key={ctaIdx}
                    href={cta.href}
                    onClick={onClose}
                    className={`px-4 py-2 font-bold rounded-lg text-[11px] transition-all duration-300 ease-out text-center focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)] ${
                      cta.variant === "primary"
                        ? "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-focus)] shadow-sm shadow-[var(--color-primary)]/5 hover:-translate-y-0.5 flex-1 sm:flex-none"
                        : "bg-[var(--bg-card)] border border-[var(--border-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] flex-1 sm:flex-none"
                    }`}
                  >
                    {cta.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};