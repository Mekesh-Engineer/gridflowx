import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";


export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: "success" | "info" | "warning";
}

export function useNavbarState() {
  const pathname = usePathname();
  const router = useRouter();

  // Scrolled state
  const [isScrolled, setIsScrolled] = useState(false);

  // Overlay state: megamenu, mobile menu, search modal, notifications dropdown
  const [activeOverlay, setActiveOverlay] = useState<"megamenu" | "mobile" | "search" | "notifications" | null>(null);

  // Auth state linked to useAuth hook
  const { user, isAuthenticated, logout } = useAuth();

  // Notifications state
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      title: "Voltage Anomaly Detected",
      message: "Grid telemetry reports 12% voltage spike in Sector 4.",
      time: "2m ago",
      read: false,
      type: "warning",
    },
    {
      id: "2",
      title: "Optimization Complete",
      message: "AI Forecasting generated new battery load distribution model.",
      time: "15m ago",
      read: false,
      type: "success",
    },
    {
      id: "3",
      title: "System Update",
      message: "GridFlowX firmware v3.0 successfully deployed.",
      time: "1h ago",
      read: true,
      type: "info",
    },
  ]);

  // Theme integration
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = theme === "system" ? resolvedTheme : theme;
  const isDark = currentTheme === "dark";
  const toggleTheme = () => setTheme(isDark ? "light" : "dark");

  // Track scroll position
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    // Initial check
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Sync scroll lock when full screen overlays are open (search and mobile menu)
  useEffect(() => {
    if (activeOverlay === "mobile" || activeOverlay === "search") {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [activeOverlay]);

  // Helper actions
  const openOverlay = (overlay: "megamenu" | "mobile" | "search" | "notifications") => {
    setActiveOverlay(overlay);
  };

  const closeOverlay = () => {
    setActiveOverlay(null);
  };

  const toggleOverlay = (overlay: "megamenu" | "mobile" | "search" | "notifications") => {
    setActiveOverlay((prev) => (prev === overlay ? null : overlay));
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleLogout = async () => {
    await logout();
  };

  const handleNavigate = (path: string) => {
    router.push(path);
    closeOverlay();
  };

  return {
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
  };
}
