"use client";

import React, { useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  User as UserIcon,
  Settings,
  LogOut,
  LayoutDashboard,
  Ticket,
  ChevronDown,
  Sun,
  Moon,
  Laptop,
  Shield,
  Sparkles,
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export interface UserProfile {
  uid?: string;
  displayName?: string | null;
  email?: string | null;
  photoURL?: string | null;
  role?: "admin" | "supervisor" | "operator" | "auditor" | string | null;
}

interface ProfileDropdownProps {
  user: UserProfile | null;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  onLogout: () => void;
  theme?: string;
  setTheme?: (theme: string) => void;
}

const dropPanelVariants: Variants = {
  hidden: { opacity: 0, y: 10, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0,
    y: 6,
    scale: 0.98,
    transition: { duration: 0.15, ease: "easeIn" },
  },
};

export const ProfileDropdown: React.FC<ProfileDropdownProps> = ({
  user,
  isOpen,
  onToggle,
  onClose,
  onLogout,
  theme,
  setTheme,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        isOpen &&
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const role = user?.role?.toLowerCase();

  const getRoleDisplayName = () => {
    switch (role) {
      case "admin":
        return "Admin";
      case "supervisor":
        return "Supervisor";
      case "operator":
        return "Operator";
      case "auditor":
        return "Auditor";
      default:
        return "User";
    }
  };

  const getRoleBadgeStyle = () => {
    switch (role) {
      case "admin":
        return "bg-rose-500/10 text-rose-500 border-rose-500/20";
      case "supervisor":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "operator":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "auditor":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  const getDashboardPath = () => {
    if (role === "admin") return "/dashboard/admin";
    if (role === "supervisor") return "/dashboard/supervisor";
    if (role === "auditor") return "/dashboard/audit";
    return "/dashboard";
  };

  // Extract initials for fallback
  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const displayName = user?.displayName || "Guest User";
  const email = user?.email || "No email";
  const initials = getInitials(user?.displayName);

  return (
    <div ref={containerRef} className="relative inline-flex items-center">
      {/* Rounded Profile Button Trigger */}
      <button
        type="button"
        onClick={onToggle}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label="User Profile and Account Menu"
        className={cn(
          "flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-full border transition-all duration-300 cursor-pointer select-none",
          "bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)]",
          "border-[var(--border-primary)] hover:border-[var(--color-primary)]/40",
          "focus:outline-hidden focus:ring-2 focus:ring-[var(--color-primary)]/50",
          isOpen && "border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/20 bg-[var(--bg-hover)] shadow-xs"
        )}
      >
        {/* User Avatar with live status dot */}
        <div className="relative">
          <Avatar className="size-7 border border-[var(--border-primary)] shadow-2xs">
            {user?.photoURL && (
              <AvatarImage
                src={user.photoURL}
                alt={displayName}
                className="object-cover"
              />
            )}
            <AvatarFallback className="bg-[var(--color-primary-faint)] text-[var(--color-primary)] text-xs font-bold font-mono">
              {initials}
            </AvatarFallback>
          </Avatar>
          {/* Active online pulse dot */}
          <span className="absolute -bottom-0.5 -right-0.5 flex size-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full size-2 bg-emerald-500 ring-2 ring-[var(--bg-card)]" />
          </span>
        </div>

        {/* User Name & Role details */}
        <div className="flex flex-col items-start text-left leading-none max-w-[120px] hidden sm:flex">
          <span className="text-xs font-semibold text-[var(--text-primary)] truncate max-w-[110px]">
            {displayName}
          </span>
          <span
            className={cn(
              "text-[9px] font-mono font-medium px-1.5 py-0.5 rounded-full border mt-0.5 tracking-tight uppercase",
              getRoleBadgeStyle()
            )}
          >
            {getRoleDisplayName()}
          </span>
        </div>

        {/* Small Dropdown Chevron Icon */}
        <ChevronDown
          className={cn(
            "size-3.5 text-[var(--text-muted)] transition-transform duration-300 ml-0.5",
            isOpen ? "rotate-180 text-[var(--color-primary)]" : "group-hover:text-[var(--text-primary)]"
          )}
        />
      </button>

      {/* Clean Profile Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={dropPanelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute right-0 top-full mt-2.5 w-64 bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl shadow-2xl overflow-hidden z-50 backdrop-blur-xl p-2 select-none"
            role="menu"
            aria-orientation="vertical"
          >
            {/* Header User Card */}
            <div className="p-3 rounded-xl bg-[var(--bg-surface)]/60 border border-[var(--border-primary)]/50 mb-2">
              <div className="flex items-center gap-3">
                <Avatar className="size-10 border border-[var(--border-primary)]">
                  {user?.photoURL && (
                    <AvatarImage
                      src={user.photoURL}
                      alt={displayName}
                      className="object-cover"
                    />
                  )}
                  <AvatarFallback className="bg-[var(--color-primary-faint)] text-[var(--color-primary)] text-sm font-bold font-mono">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-bold text-[var(--text-primary)] truncate">
                      {displayName}
                    </h4>
                    <span
                      className={cn(
                        "text-[9px] font-mono font-semibold px-1.5 py-0.2 rounded-full border shrink-0",
                        getRoleBadgeStyle()
                      )}
                    >
                      {getRoleDisplayName()}
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--text-muted)] truncate mt-0.5">
                    {email}
                  </p>
                </div>
              </div>

              {/* Edge Connection Badge */}
              <div className="mt-2 pt-2 border-t border-[var(--border-primary)]/40 flex items-center justify-between text-[10px] text-[var(--text-muted)]">
                <span className="flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                  GridFlowX Connected
                </span>
                <span className="font-mono text-[9px] text-[var(--color-primary)]">
                  v1.0 • TLS 1.3
                </span>
              </div>
            </div>

            {/* Quick Theme Switcher */}
            {setTheme && (
              <div className="px-3 py-2 rounded-xl bg-[var(--bg-surface)]/40 border border-[var(--border-primary)]/30 mb-2 flex items-center justify-between">
                <span className="text-xs font-medium text-[var(--text-secondary)]">
                  Theme Mode
                </span>
                <div className="flex items-center p-0.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-primary)]">
                  <button
                    type="button"
                    onClick={() => setTheme("light")}
                    title="Light mode"
                    className={cn(
                      "p-1 rounded-md transition-all duration-200 cursor-pointer",
                      theme === "light"
                        ? "bg-[var(--bg-card)] text-[var(--color-primary)] shadow-xs"
                        : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    )}
                  >
                    <Sun className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setTheme("dark")}
                    title="Dark mode"
                    className={cn(
                      "p-1 rounded-md transition-all duration-200 cursor-pointer",
                      theme === "dark"
                        ? "bg-[var(--bg-card)] text-[var(--color-primary)] shadow-xs"
                        : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    )}
                  >
                    <Moon className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setTheme("system")}
                    title="System theme"
                    className={cn(
                      "p-1 rounded-md transition-all duration-200 cursor-pointer",
                      theme === "system"
                        ? "bg-[var(--bg-card)] text-[var(--color-primary)] shadow-xs"
                        : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    )}
                  >
                    <Laptop className="size-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Navigation Menu Options */}
            <div className="space-y-0.5">
              <Link
                href={getDashboardPath()}
                onClick={onClose}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all duration-150 group cursor-pointer"
                role="menuitem"
              >
                <LayoutDashboard className="size-4 text-[var(--text-muted)] group-hover:text-[var(--color-primary)] transition-colors" />
                <span className="flex-1">Dashboard</span>
              </Link>

              <Link
                href="/profile"
                onClick={onClose}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all duration-150 group cursor-pointer"
                role="menuitem"
              >
                <UserIcon className="size-4 text-[var(--text-muted)] group-hover:text-[var(--color-primary)] transition-colors" />
                <span className="flex-1">Profile</span>
              </Link>

              <Link
                href="/my-tickets"
                onClick={onClose}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all duration-150 group cursor-pointer"
                role="menuitem"
              >
                <Ticket className="size-4 text-[var(--text-muted)] group-hover:text-[var(--color-primary)] transition-colors" />
                <span className="flex-1">My Tickets</span>
              </Link>

              <Link
                href="/settings"
                onClick={onClose}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all duration-150 group cursor-pointer"
                role="menuitem"
              >
                <Settings className="size-4 text-[var(--text-muted)] group-hover:text-[var(--color-primary)] transition-colors" />
                <span className="flex-1">Settings</span>
              </Link>
            </div>

            {/* Separator */}
            <div className="h-px bg-[var(--border-primary)]/60 my-1.5 mx-1" />

            {/* Log out option */}
            <button
              type="button"
              onClick={() => {
                onClose();
                onLogout();
              }}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-500/90 hover:text-rose-500 hover:bg-rose-500/10 transition-all duration-150 w-full text-left cursor-pointer group"
              role="menuitem"
            >
              <LogOut className="size-4 text-rose-500/80 group-hover:text-rose-500 transition-colors" />
              <span>Log out</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
