// src/app/(public)/landing/Navbar/ThemeToggle.tsx
"use client";

import React from 'react';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  isDark: boolean;
  onToggle: () => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ isDark, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className="p-2.5 rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] border border-[var(--border-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all duration-200 cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-[var(--color-primary)] whitespace-nowrap"
      aria-label={isDark ? 'Switch to light layout theme mode' : 'Switch to dark layout theme mode'}
      title={isDark ? 'Activate Light Mode' : 'Activate Dark Mode'}
    >
      <div className="relative w-4 h-4 flex items-center justify-center overflow-hidden">
        {/* Sun Icon Layer Asset */}
        <div className={`absolute transition-transform duration-300 ${isDark ? 'translate-y-6 opacity-0' : 'translate-y-0 opacity-100'}`}>
          <Sun size={15} className="text-amber-500" />
        </div>
        {/* Moon Icon Layer Asset */}
        <div className={`absolute transition-transform duration-300 ${isDark ? 'translate-y-0 opacity-100' : '-translate-y-6 opacity-0'}`}>
          <Moon size={15} className="text-[var(--color-primary)]" />
        </div>
      </div>
    </button>
  );
};