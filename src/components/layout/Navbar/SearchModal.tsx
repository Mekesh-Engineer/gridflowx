// src/app/(public)/landing/Navbar/SearchModal.tsx
"use client";

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, CornerDownLeft, Sparkles, Database, FileText, Globe } from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SEARCH_CATEGORIES = ['All', 'Global', 'AI Inference', 'Database', 'Documentation'] as const;

interface SearchItem {
  text: string;
  category: typeof SEARCH_CATEGORIES[number] | string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const searchMockData: SearchItem[] = [
  { text: 'Solar generation forecasting model analytics framework', category: 'AI Inference', icon: Sparkles },
  { text: 'Prisma DB grid migration telemetry audit logs data', category: 'Database', icon: Database },
  { text: 'RBAC user authentication specifications Operator L1 configuration', category: 'Documentation', icon: FileText },
  { text: 'Grid telemetry core system dashboard status overview map', category: 'Global', icon: Globe },
  { text: 'Relay configuration threshold parameter manual documentation v2', category: 'Documentation', icon: FileText },
  { text: 'Battery structural state-of-charge tracking algorithms model', category: 'AI Inference', icon: Sparkles },
];

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const listTrackRef = useRef<HTMLUListElement>(null);
  
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<typeof SEARCH_CATEGORIES[number]>('All');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Filter items matching query rules and active category tab selections
  const filteredSearchItems = searchMockData.filter(item => {
    const searchMatches = item.text.toLowerCase().includes(query.toLowerCase());
    const categoryMatches = activeTab === 'All' || item.category === activeTab;
    return searchMatches && categoryMatches;
  });

  // Reset selected element tracking whenever structural listing parameters shift
  useEffect(() => {
    setSelectedIndex(0);
  }, [query, activeTab]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 60);
      document.body.style.overflow = "hidden";
    } else {
      setQuery('');
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // Handle item index selections via keyboard arrow tracks safely
  useEffect(() => {
    const handleKeyboardNavigation = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % Math.max(1, filteredSearchItems.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredSearchItems.length) % Math.max(1, filteredSearchItems.length));
      } else if (e.key === 'Enter' && filteredSearchItems[selectedIndex]) {
        e.preventDefault();
        console.log(`Executing target telemetry query parameter row path: ${filteredSearchItems[selectedIndex].text}`);
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyboardNavigation);
    return () => window.removeEventListener('keydown', handleKeyboardNavigation);
  }, [isOpen, filteredSearchItems, selectedIndex, onClose]);

  // Smooth container alignment scrolling for keyboard cursor adjustments
  useEffect(() => {
    if (selectedIndex >= 0 && listTrackRef.current) {
      const activeNode = listTrackRef.current.children[selectedIndex] as HTMLElement;
      if (activeNode) {
        activeNode.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] px-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="System Command Palette"
    >
      <div className="absolute inset-0 -z-10" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, y: -16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -12, scale: 0.98 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-2xl bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[65vh]"
      >
        {/* Input Control Header Row Bar */}
        <div className="flex items-center gap-3 px-4 border-b border-[var(--border-primary)] h-14 shrink-0">
          <Search size={18} className="text-[var(--text-muted)] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search operational logs, AI metrics, telemetry definitions..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 h-full bg-transparent border-hidden outline-hidden text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] font-sans"
          />
          <kbd className="hidden sm:flex items-center gap-0.5 px-1.5 h-5 font-mono text-[10px] text-[var(--text-muted)] bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-md select-none">
            <span>⌘</span>K
          </kbd>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer outline-hidden">
            <X size={15} />
          </button>
        </div>

        {/* Categorical Filtering Navigation Row Layer */}
        <div className="flex items-center gap-1 px-3 py-2 bg-[var(--bg-secondary)]/30 border-b border-[var(--border-primary)] overflow-x-auto scrollbar-none shrink-0 select-none">
          {SEARCH_CATEGORIES.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 text-[11px] font-medium rounded-lg transition-all cursor-pointer whitespace-nowrap outline-hidden ${
                activeTab === tab
                  ? 'bg-[var(--color-primary)] text-white shadow-xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Main Search Results Listing Target Area Container */}
        <div className="flex-1 overflow-y-auto p-2 min-h-36">
          {filteredSearchItems.length === 0 ? (
            <div className="text-center py-10 select-none">
              <p className="text-xs font-mono font-bold text-[var(--text-muted)]">No active records found matching search query.</p>
              <p className="text-[11px] text-[var(--text-muted)]/60 mt-1">Verify asset variable declarations inside global config definitions.</p>
            </div>
          ) : (
            <ul ref={listTrackRef} className="space-y-0.5" role="listbox" aria-label="Search results query parameters tracking">
              {filteredSearchItems.map((item, idx) => {
                const ItemIcon = item.icon;
                const isItemChosen = idx === selectedIndex;
                return (
                  <li key={item.text} role="option" aria-selected={isItemChosen}>
                    <button
                      onClick={() => {
                        console.log(`Routing operational parameters path towards: ${item.text}`);
                        onClose();
                      }}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`w-full flex items-center justify-between gap-4 p-2.5 rounded-xl text-left transition-all cursor-pointer outline-hidden group ${
                        isItemChosen ? 'bg-[var(--bg-hover)]' : 'bg-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-7 h-7 rounded-lg border border-foreground/5 flex items-center justify-center shrink-0 transition-colors ${
                          isItemChosen ? 'bg-[var(--bg-card)] text-[var(--color-primary)]' : 'bg-[var(--bg-secondary)] text-[var(--text-muted)]'
                        }`}>
                          <ItemIcon size={14} />
                        </div>
                        <div className="min-w-0 space-y-0.5">
                          <p className={`text-xs font-semibold truncate ${isItemChosen ? 'text-[var(--color-primary)]' : 'text-[var(--text-primary)]'}`}>
                            {item.text}
                          </p>
                          <span className="block text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider">{item.category}</span>
                        </div>
                      </div>
                      <span className={`transition-opacity text-[var(--text-muted)] font-mono font-bold flex items-center gap-1 text-[10px] select-none ${
                        isItemChosen ? 'opacity-100' : 'opacity-0'
                      }`}>
                        Select <CornerDownLeft size={10} className="mt-0.5" />
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer Shortcut Labels Row */}
        <div className="p-3 bg-[var(--bg-secondary)]/50 border-t border-[var(--border-primary)] flex items-center justify-end gap-4 text-[10px] font-mono font-semibold text-[var(--text-muted)] select-none shrink-0">
          <span><kbd className="px-1 py-0.5 bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-md shadow-2xs">↑↓</kbd> navigate</span>
          <span><kbd className="px-1 py-0.5 bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-md shadow-2xs">ESC</kbd> close</span>
          <span><kbd className="px-1 py-0.5 bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-md shadow-2xs">↵</kbd> select</span>
        </div>
      </motion.div>
    </div>
  );
};