// src/app/(public)/landing/Navigation.tsx
"use client";

import React, { useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Menu, X, Search, Bell } from "lucide-react";
import { ThemeToggle } from "./Navbar/ThemeToggle";
import { useNavbarState } from "./Navbar/useNavbarState";
import { navigationConfig } from "./Navbar/navigation.config";

// Lazy loading subcomponents to maximize initial page paint performance scores
const MegaMenu = dynamic(() => import("./Navbar/Megamenu").then((mod) => mod.MegaMenu), { ssr: false });
const MobileMenu = dynamic(() => import("./Navbar/MobileMenu").then((mod) => mod.MobileMenu), { ssr: false });
const SearchModal = dynamic(() => import("./Navbar/SearchModal").then((mod) => mod.SearchModal), { ssr: false });
const NotificationsDropdown = dynamic(() => import("./Navbar/NotificationsDropdown").then((mod) => mod.NotificationsDropdown), { ssr: false });

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
  const accountRef = useRef<HTMLDivElement>(null);
  const toggleAccountDropdown = () => setAccountDropdownOpen((prev) => !prev);

  // Click outside listener for account dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        accountDropdownOpen &&
        accountRef.current &&
        !accountRef.current.contains(e.target as Node)
      ) {
        setAccountDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [accountDropdownOpen]);

  const role = user?.role;

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

  const getRoleBadgeClass = () => {
    switch (role) {
      case "admin":
        return "bg-red-500/10 text-red-400 border border-red-500/20";
      case "supervisor":
        return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
      case "operator":
        return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
      case "auditor":
        return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
      default:
        return "bg-gray-500/10 text-gray-400 border border-gray-500/20";
    }
  };

  const getDashboardPath = () => {
    if (role === "admin") return "/dashboard/admin";
    if (role === "supervisor") return "/dashboard/supervisor";
    if (role === "auditor") return "/dashboard/audit";
    return "/dashboard";
  };

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
      className={`fixed z-50 transition-all duration-500 ease-in-out ${
        isScrolled ? "top-4 left-4 right-4" : "top-0 left-0 right-0"
      }`}
    >
      <nav
        className={`mx-auto transition-all duration-500 relative ${
          isScrolled || activeOverlay === "mobile"
            ? "bg-[var(--bg-glass)] backdrop-blur-xl border border-[var(--border-primary)] rounded-2xl shadow-[var(--val-shadow-card)] max-w-[1200px]"
            : "bg-transparent max-w-[1400px]"
        }`}
      >
        <div
          className={`flex items-center justify-between transition-all duration-500 px-6 lg:px-12 ${
            isScrolled ? "h-14" : "h-20"
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
                      className={`text-sm font-semibold transition-colors duration-300 relative group cursor-pointer focus:outline-hidden whitespace-nowrap ${
                        activeOverlay === "megamenu" || pathname === link.href
                          ? "text-[var(--primary)]"
                          : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                      }`}
                      aria-haspopup="true"
                      aria-expanded={activeOverlay === "megamenu"}
                    >
                      {link.name}
                      <span
                        className={`absolute -bottom-1 left-0 h-px bg-[var(--primary)] transition-all duration-300 ${
                          activeOverlay === "megamenu" || pathname === link.href ? "w-full" : "w-0 group-hover:w-full"
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
                  className={`text-sm font-semibold transition-colors duration-300 ease-out relative group focus:outline-hidden whitespace-nowrap ${
                    isActive 
                      ? "text-[var(--primary)]" 
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {link.name}
                  <span className={`absolute -bottom-1 left-0 h-px bg-[var(--primary)] transition-all duration-300 ease-out ${
                    isActive ? "w-full" : "w-0 group-hover:w-full"
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

            {/* Consolidated Premium Secondary Action Button Vector */}
            {isAuthenticated ? (
              <div className="dash-header-item-right">
                <div className="flex items-center">
                  <div className="dash-user-info desktop-only">
                    <span className="dash-user-name">
                      {user?.displayName || 'Guest User'}
                    </span>
                    <span className={`dash-role-badge ${getRoleBadgeClass()}`}>
                      {getRoleDisplayName()}
                    </span>
                  </div>

                  <div ref={accountRef} className="inline-flex relative text-start">
                    <button
                      id="hs-dnad"
                      type="button"
                      onClick={toggleAccountDropdown}
                      className="dash-account-trigger"
                      aria-haspopup="true"
                      aria-expanded={accountDropdownOpen ? "true" : "false"}
                      aria-label="User menu" >
                      <img
                        className="shrink-0 size-8 rounded-full border-2 border-[var(--border-primary)]"
                        src={user?.photoURL || 'https://images.unsplash.com/photo-1659482633369-9fe69af50bfb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=3&w=320&h=320&q=80'}
                        alt={user?.displayName || 'User Avatar'}
                      />
                    </button>

                    <div
                      className={`dash-dropdown-panel is-right is-wide ${accountDropdownOpen ? 'is-open' : ''}`}
                      aria-labelledby="hs-dnad"
                    >
                      <div className="dash-account-info">
                        <span className="dash-account-name">
                          {user?.displayName || 'Guest User'}
                        </span>
                        <p className="dash-account-email">
                          {user?.email || 'No email'}
                        </p>
                        <span className={`dash-role-badge mt-1.5 ${getRoleBadgeClass()}`}>
                          {getRoleDisplayName()}
                        </span>
                      </div>

                      <div className="dash-theme-row">
                        <div className="flex flex-wrap justify-between items-center gap-2">
                          <span className="dash-theme-label">Theme</span>
                          <div className="dash-theme-group">
                            <button type="button" onClick={() => setTheme ? setTheme('light') : null} className={`dash-theme-btn ${theme === 'light' ? 'is-active' : ''}`}>
                              <svg className="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4" /><path d="M12 3v1" /><path d="M12 20v1" /><path d="M3 12h1" /><path d="M20 12h1" /><path d="m18.364 5.636-.707.707" /><path d="m6.343 17.657-.707.707" /><path d="m5.636 5.636.707.707" /><path d="m17.657 17.657.707.707" /></svg>
                              <span className="sr-only">Default (Light)</span>
                            </button>
                            <button type="button" onClick={() => setTheme ? setTheme('dark') : null} className={`dash-theme-btn ${theme === 'dark' ? 'is-active-dark' : ''}`}>
                              <svg className="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" /></svg>
                              <span className="sr-only">Dark</span>
                            </button>
                            <button type="button" onClick={() => setTheme ? setTheme('system') : null} className={`dash-theme-btn ${theme === 'system' ? 'is-active' : ''}`}>
                              <svg className="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="3" rx="2" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="21" /></svg>
                              <span className="sr-only">Auto (System)</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="dash-dropdown-divider">
                        <Link className="dash-account-menu-item" href={getDashboardPath()} onClick={() => setAccountDropdownOpen(false)}>
                          <svg className="shrink-0 mt-0.5 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>
                          Dashboard
                        </Link>
                        <Link className="dash-account-menu-item" href="/profile" onClick={() => setAccountDropdownOpen(false)}>
                          <svg className="shrink-0 mt-0.5 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                          Profile
                        </Link>
                        <Link className="dash-account-menu-item" href="/my-tickets" onClick={() => setAccountDropdownOpen(false)}>
                          <svg className="shrink-0 mt-0.5 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" /><path d="M13 5v2" /><path d="M13 17v2" /><path d="M13 11v2" /></svg>
                          My Tickets
                        </Link>
                        <Link className="dash-account-menu-item" href="/settings" onClick={() => setAccountDropdownOpen(false)}>
                          <svg className="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>
                          Settings
                        </Link>
                        <button className="dash-account-menu-item w-full text-left" onClick={handleLogout}>
                          <svg className="shrink-0 mt-0.5 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m16 17 5-5-5-5" /><path d="M21 12H9" /><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /></svg>
                          Log out
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <Link href={navigationConfig.ctas.signIn.href} className="whitespace-nowrap">
                <Button
                  size="sm"
                  className={`bg-[var(--color-primary)] hover:bg-[var(--color-primary-focus)] text-[var(--bg-base)] rounded-full font-bold transition-all duration-300 ease-out focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)] cursor-pointer whitespace-nowrap ${
                    isScrolled ? "px-4 h-8 text-xs" : "px-5 h-9 text-sm"
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