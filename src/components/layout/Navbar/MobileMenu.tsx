import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { LogIn, LogOut, X } from 'lucide-react';
import { navigationConfig } from './navigation.config';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  isAuthenticated: boolean;
  currentPath: string;
  onNavigate: (path: string) => void;
  onLogout: () => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onClose,
  isAuthenticated,
  currentPath,
  onNavigate,
  onLogout,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Accessibility: Focus trap & Escape key
  useEffect(() => {
    if (isOpen) {
      // Store currently focused element to restore it on close
      previousFocusRef.current = document.activeElement as HTMLElement;

      const focusableElements = containerRef.current?.querySelectorAll(
        'a[href], button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements && focusableElements.length > 0) {
        // Delay slightly for transition to complete
        setTimeout(() => {
          (focusableElements[0] as HTMLElement).focus();
        }, 150);
      }
    } else {
      // Restore focus on close
      previousFocusRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key === 'Tab') {
        const focusableElements = containerRef.current?.querySelectorAll(
          'a[href], button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusableElements || focusableElements.length === 0) return;

        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const menuLinks = navigationConfig.mobileLinks;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-40 lg:hidden"
            aria-hidden="true"
          />

          {/* Drawer panel */}
          <motion.div
            ref={containerRef}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 20, stiffness: 150 }}
            className="fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-[var(--bg-card)] border-l border-[var(--border-primary)] shadow-2xl z-50 p-6 flex flex-col justify-between lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation Menu"
          >
            <div className="space-y-8 mt-6">
              {/* Close Button */}
              <div className="flex justify-end">
                <button
                  onClick={onClose}
                  className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-hover)] transition-colors focus:outline-hidden focus:ring-2 focus:ring-[var(--color-primary)]"
                  aria-label="Close mobile menu"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Navigation Links */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] px-3">
                  Navigation
                </span>
                <ul className="space-y-1">
                  {menuLinks.map((link) => {
                    const Icon = link.icon;
                    const isActive = currentPath === link.path;
                    return (
                      <li key={link.path}>
                        <Link
                          href={link.path}
                          onClick={onClose}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors duration-300 ease-out focus:outline-hidden focus:bg-[var(--bg-hover)] ${
                            isActive
                              ? 'text-[var(--color-primary)] bg-[var(--color-primary-faint)]'
                              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
                          }`}
                        >
                          <Icon size={18} />
                          <span>{link.label}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>

            {/* Auth CTAs */}
            <div className="space-y-4">
              {isAuthenticated ? (
                <button
                  onClick={() => {
                    onLogout();
                    onClose();
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-red-500/20 hover:bg-red-500/10 text-red-400 font-medium rounded-xl transition-colors focus:outline-hidden focus:ring-2 focus:ring-red-500/55"
                >
                  <LogOut size={18} />
                  <span>Log Out</span>
                </button>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      onNavigate('/login');
                      onClose();
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-[var(--border-primary)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] font-medium rounded-xl transition-colors focus:outline-hidden focus:ring-2 focus:ring-[var(--color-primary)]"
                  >
                    <LogIn size={18} />
                    <span>Sign In</span>
                  </button>
                  <button
                    onClick={() => {
                      onNavigate('/register');
                      onClose();
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[var(--color-primary)] hover:bg-[var(--color-primary-focus)] text-[var(--bg-base)] font-semibold rounded-xl transition-all duration-300 ease-out focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)]"
                  >
                    <span>Get Started</span>
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
