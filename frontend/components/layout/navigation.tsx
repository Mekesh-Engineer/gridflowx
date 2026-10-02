// src/app/(public)/landing/Navigation.tsx
"use client";

import React, { useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Menu, X, Search, Bell } from "lucide-react";
import { ThemeToggle } from "./navbar/ThemeToggle";
import { useNavbarState } from "@/hooks/use-navbar-state";
import { navigationConfig } from "@/config/navigation.config";

// Lazy loading subcomponents to maximize initial page paint performance scores
const MegaMenu = dynamic(() => import("./navbar/Megamenu").then((mod) => mod.MegaMenu), { ssr: false });
const MobileMenu = dynamic(() => import("./navbar/MobileMenu").then((mod) => mod.MobileMenu), { ssr: false });
const SearchModal = dynamic(() => import("./navbar/SearchModal").then((mod) => mod.SearchModal), { ssr: false });
const NotificationsDropdown = dynamic(() => import("./navbar/NotificationsDropdown").then((mod) => mod.NotificationsDropdown), { ssr: false });
const ProfileDropdown = dynamic(() => import("./navbar/ProfileDropdown").then((mod) => mod.ProfileDropdown), { ssr: false });

export function Navigation() {
  const {
    pathname,
    isScrolled,
    activeOverlay,
    isAuthenticated,
    user,
    notifications,
    mounted,
    isDark,
    theme,
    setTheme,
    openOverlay,
    closeOverlay,
    toggleOverlay,
    toggleTheme,
    handleMarkAllRead,
    handleLogout,
    handleNavigate,
  } = useNavbarState();

  const [accountDropdownOpen, setAccountDropdownOpen] = React.useState(false);
  const toggleAccountDropdown = () => setAccountDropdownOpen((prev) => !prev);

  const notificationsButtonRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Global focus key listener for search launcher layout (Cmd/Ctrl + K)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        toggleOverlay("search");
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [toggleOverlay]);

  // Click outside listener logic to close active context panels safely
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        activeOverlay === "notifications" &&
        notificationsButtonRef.current &&
        !notificationsButtonRef.current.contains(e.target as Node)
      ) {
        closeOverlay();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeOverlay, closeOverlay]);

  return (
    <header
      className={`fixed z-50 transition-all duration-500 ease-in-out ${isScrolled ? "top-4 left-4 right-4" : "top-0 left-0 right-0"
        }`}
    >
      <nav
        className={`mx-auto transition-all duration-500 relative ${isScrolled || activeOverlay === "mobile"
            ? "bg-[var(--bg-glass)] backdrop-blur-xl border border-[var(--border-primary)] rounded-2xl shadow-[var(--val-shadow-card)] max-w-[1200px]"
            : "bg-transparent max-w-[1400px]"
          }`}
      >
        <div
          className={`flex items-center justify-between transition-all duration-500 px-6 lg:px-12 ${isScrolled ? "h-14" : "h-20"
            }`}
        >
          {/* Logo Group: Fluid SVG configuration linking to Home */}
          <Link
            href="/"
            className="flex items-center gap-2.5 group focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] rounded-xl outline-hidden shrink-0"
            onClick={closeOverlay}
          >
            <div className="relative w-8 h-8 transition-transform duration-300 group-hover:scale-105 select-none">
              <Image
                src="/favicon.svg"
                alt="GridFlowX Logo"
                width={32}
                height={32}
                priority
                className="object-contain"
              />
            </div>
            <div className="flex items-baseline gap-1">
              <span className={`font-display font-bold tracking-tight text-[var(--text-primary)] transition-all duration-500 ${isScrolled ? "text-xl" : "text-2xl"}`}>
                GridFlowX
              </span>
              <span className={`text-[var(--text-muted)] font-mono font-bold transition-all duration-500 ${isScrolled ? "text-[10px]" : "text-xs"}`}>
                v1.0
              </span>
            </div>
          </Link>

          {/* Desktop Central Link Map */}
          <div className="hidden lg:flex items-center gap-6 xl:gap-8">
            {navigationConfig.mainLinks.map((link) => {
              if (link.hasMegaMenu) {
                return (
                  <div
                    key={link.name}
                    className="py-2"
                    onMouseEnter={() => openOverlay("megamenu")}
                  >
                    <button
                      className={`text-sm font-semibold transition-colors duration-300 relative group cursor-pointer focus:outline-hidden whitespace-nowrap ${activeOverlay === "megamenu" || pathname === link.href
                          ? "text-[var(--primary)]"
                          : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                        }`}
                      aria-haspopup="true"
                      aria-expanded={activeOverlay === "megamenu"}
                    >
                      {link.name}
                      <span
                        className={`absolute -bottom-1 left-0 h-px bg-[var(--primary)] transition-all duration-300 ${activeOverlay === "megamenu" || pathname === link.href ? "w-full" : "w-0 group-hover:w-full"
                          }`}
                      />
                    </button>
                  </div>
                );
              }

              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-sm font-semibold transition-colors duration-300 ease-out relative group focus:outline-hidden whitespace-nowrap ${isActive
                      ? "text-[var(--primary)]"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    }`}
                >
                  {link.name}
                  <span className={`absolute -bottom-1 left-0 h-px bg-[var(--primary)] transition-all duration-300 ease-out ${isActive ? "w-full" : "w-0 group-hover:w-full"
                    }`} />
                </Link>
              );
            })}
          </div>

          {/* Desktop Right Global Actions Control Array */}
          <div className="hidden lg:flex items-center gap-3.5">
            {/* Search Input Trigger Box */}
            <button
              onClick={() => toggleOverlay("search")}
              className="p-2.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] border border-[var(--border-primary)] transition-all duration-300 ease-out cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-[var(--color-primary)] whitespace-nowrap"
              title="Search System Panel (⌘K)"
              aria-label="Launch Command Search"
            >
              <Search size={16} />
            </button>

            {/* Notification Trigger Button */}
            <div ref={notificationsButtonRef} className="relative">
              <button
                onClick={() => toggleOverlay("notifications")}
                className="p-2.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] border border-[var(--border-primary)] transition-all duration-300 ease-out relative cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-[var(--color-primary)] whitespace-nowrap"
                aria-label="View system notifications"
                aria-haspopup="true"
                aria-expanded={activeOverlay === "notifications"}
              >
                <Bell size={16} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-[var(--color-primary)] rounded-full animate-pulse ring-2 ring-[var(--bg-card)]" />
                )}
              </button>

              {activeOverlay === "notifications" && (
                <NotificationsDropdown
                  notifications={notifications}
                  onClose={closeOverlay}
                  onMarkAllRead={handleMarkAllRead}
                />
              )}
            </div>

            {/* Atomic Client Dark Mode Switch Trigger */}
            {mounted && <ThemeToggle isDark={isDark} onToggle={toggleTheme} />}

            <div className="w-px h-4 bg-[var(--border-primary)] mx-1" />

            {/* Consolidated Premium User Profile Action Dropdown */}
            {isAuthenticated ? (
              <ProfileDropdown
                user={user}
                isOpen={accountDropdownOpen}
                onToggle={toggleAccountDropdown}
                onClose={() => setAccountDropdownOpen(false)}
                onLogout={handleLogout}
                theme={theme}
                setTheme={setTheme}
              />
            ) : (
              <Link href={navigationConfig.ctas.signIn.href} className="whitespace-nowrap">
                <Button
                  size="sm"
                  className={`bg-[var(--color-primary)] hover:bg-[var(--color-primary-focus)] text-[var(--bg-base)] rounded-full font-bold transition-all duration-300 ease-out focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)] cursor-pointer whitespace-nowrap ${isScrolled ? "px-4 h-8 text-xs" : "px-5 h-9 text-sm"
                    }`}
                >
                  {navigationConfig.ctas.signIn.name}
                </Button>
              </Link>
            )}
          </div>

          {/* Touchscreen Responsive Interface Actions Area */}
          <div className="flex lg:hidden items-center gap-1.5">
            <button
              onClick={() => toggleOverlay("search")}
              className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] focus:outline-hidden rounded-lg whitespace-nowrap"
              aria-label="Open Search Command Palette"
            >
              <Search size={18} />
            </button>

            <div ref={notificationsButtonRef} className="relative">
              <button
                onClick={() => toggleOverlay("notifications")}
                className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] relative focus:outline-hidden rounded-lg whitespace-nowrap"
                aria-label="System Notifications Counter"
                aria-haspopup="true"
                aria-expanded={activeOverlay === "notifications"}
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[var(--color-primary)] rounded-full" />
                )}
              </button>

              {activeOverlay === "notifications" && (
                <NotificationsDropdown
                  notifications={notifications}
                  onClose={closeOverlay}
                  onMarkAllRead={handleMarkAllRead}
                />
              )}
            </div>

            {mounted && <ThemeToggle isDark={isDark} onToggle={toggleTheme} />}

            <button
              onClick={() => toggleOverlay("mobile")}
              className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] focus:outline-hidden rounded-lg whitespace-nowrap"
              aria-label="Toggle Responsive Navigation Menu Drawer"
              aria-expanded={activeOverlay === "mobile"}
            >
              {activeOverlay === "mobile" ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Global Context Absolute Placement Subcontainers Mapping */}
      <div className="absolute left-0 right-0 top-full max-w-[1400px] mx-auto px-4 pointer-events-none">
        <div className="pointer-events-auto relative">
          <MegaMenu isOpen={activeOverlay === "megamenu"} onClose={closeOverlay} />
        </div>
      </div>

      <MobileMenu
        isOpen={activeOverlay === "mobile"}
        onClose={closeOverlay}
        isAuthenticated={isAuthenticated}
        currentPath={pathname}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      />

      <SearchModal isOpen={activeOverlay === "search"} onClose={closeOverlay} />
    </header>
  );
}