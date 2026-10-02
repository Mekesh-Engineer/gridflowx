"use client";

import { useThemeStore } from '@/hooks/use-theme-toggle';
import { AnimatePresence, motion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';
import React, { useEffect, useState } from 'react';

/**
 * Fixed top-right theme toggle button shared across all auth pages.
 * Reads and writes isDarkMode from the Zustand theme store.
 */
export function AuthThemeToggle() {
    const { isDarkMode, toggleTheme } = useThemeStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null; // Prevent hydration mismatch
    }

    return (
        <button
            type="button"
            onClick={toggleTheme}
            className="fixed top-5 right-5 z-50 p-2.5 rounded-xl bg-[var(--text-primary)]/5 border border-[var(--border-primary)] hover:bg-[var(--text-primary)]/10 transition-all duration-300 cursor-pointer backdrop-blur-sm"
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
            <AnimatePresence mode="wait" initial={false}>
                {isDarkMode ? (
                    <motion.div
                        key="sun"
                        initial={{ rotate: -90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: 90, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center justify-center"
                    >
                        <Sun size={18} className="text-amber-400" />
                    </motion.div>
                ) : (
                    <motion.div
                        key="moon"
                        initial={{ rotate: 90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: -90, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center justify-center"
                    >
                        <Moon size={18} className="text-slate-600" />
                    </motion.div>
                )}
            </AnimatePresence>
        </button>
    );
}
