"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useNotificationsStore } from "@/store/notifications.store";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Bell, Search, Shield, CheckCircle2, Wifi, WifiOff, Loader2, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ROLE_LABELS } from "@/config/routes.config";
import { UserRole } from "@/types/roles";

// ============================================================================
// Page Info Resolver — maps pathnames to human-readable titles
// ============================================================================

const PAGE_INFO: { prefix: string; title: string; subtitle: string }[] = [
  { prefix: '/dashboard/supervisor',              title: 'Supervisor Fleet Console',          subtitle: 'Multi-site oversight & team coordination' },
  { prefix: '/dashboard/admin/billing',           title: 'Billing & Subscription',            subtitle: 'Seat management & invoice history' },
  { prefix: '/dashboard/admin/integrations',      title: 'Integration Hub',                   subtitle: 'Third-party service connections' },
  { prefix: '/dashboard/admin/api-keys',          title: 'API Keys & Webhooks',               subtitle: 'Developer credentials management' },
  { prefix: '/dashboard/admin/settings',          title: 'Tenant Settings',                   subtitle: 'Safety thresholds & platform configuration' },
  { prefix: '/dashboard/admin',                   title: 'Admin Executive Portal',            subtitle: 'Tenant governance & system oversight' },
  { prefix: '/dashboard/audit/logs',              title: 'Security Audit Logs',               subtitle: 'Immutable tamper-evident activity log' },
  { prefix: '/dashboard/audit/compliance',        title: 'Compliance Center',                 subtitle: 'SOC2 · GDPR · ISO 50001 readiness' },
  { prefix: '/dashboard/audit',                   title: 'Auditor Console',                   subtitle: 'Compliance monitoring & export center' },
  { prefix: '/dashboard/iot/firmware',            title: 'OTA Firmware Manager',              subtitle: 'Staged edge device firmware deployment' },
  { prefix: '/dashboard/iot/diagnostics',         title: 'Device Diagnostics',                subtitle: 'Serial logs, ping & reboot controls' },
  { prefix: '/dashboard/iot/gateways',            title: 'Gateway Hub',                       subtitle: 'MQTT broker & WebSocket status' },
  { prefix: '/dashboard/iot/devices',             title: 'Device Inventory',                  subtitle: 'ESP32 nodes & inverter registry' },
  { prefix: '/dashboard/sensors/calibration',     title: 'Sensor Calibration Studio',         subtitle: 'ACS712 zero-point & multiplier adjustment' },
  { prefix: '/dashboard/sensors/history',         title: 'Telemetry History',                 subtitle: 'Historical sensor time-series explorer' },
  { prefix: '/dashboard/sensors/live',            title: 'Live Telemetry Stream',             subtitle: 'High-frequency real-time sensor readings' },
  { prefix: '/dashboard/weather/accuracy',        title: 'Forecast Model Accuracy',           subtitle: 'Actual vs predicted · MAE/MAPE analysis' },
  { prefix: '/dashboard/weather/forecast',        title: 'Solar & Weather Forecast',          subtitle: '72-hour irradiance & cloud cover prediction' },
  { prefix: '/dashboard/weather/live',            title: 'Live Weather Station',              subtitle: 'Solar irradiance · temperature · wind' },
  { prefix: '/dashboard/ai/models',               title: 'AI Model Registry',                 subtitle: 'Model versioning, drift & retraining' },
  { prefix: '/dashboard/ai/recommendations',      title: 'AI Recommendations',                subtitle: 'Active AI action proposals & confidence scores' },
  { prefix: '/dashboard/ai/overview',             title: 'AI Intelligence Center',            subtitle: 'Inference engines & prediction overview' },
  { prefix: '/dashboard/agentic-ai/queue',        title: 'Human Approval Queue',              subtitle: 'High-impact autonomous actions awaiting approval' },
  { prefix: '/dashboard/agentic-ai/timeline',     title: 'Agent Execution Timeline',          subtitle: 'Step-by-step reasoning & decision trace' },
  { prefix: '/dashboard/agentic-ai/overview',     title: 'Agent Orchestration Dashboard',     subtitle: 'Active autonomous agents & status' },
  { prefix: '/dashboard/digital-twin/simulation', title: 'Fault & Load Simulator',            subtitle: 'What-If scenario modelling' },
  { prefix: '/dashboard/digital-twin/energy-flow',title: 'Live Sankey Energy Flow',           subtitle: 'Generation → Storage → Consumption mapping' },
  { prefix: '/dashboard/digital-twin/visualizer', title: 'Digital Twin Visualizer',           subtitle: '3D interactive microgrid model' },
  { prefix: '/dashboard/energy/loads',            title: 'Load Tier Management',              subtitle: 'Circuit relay assignment & load shedding tiers' },
  { prefix: '/dashboard/energy/grid',             title: 'Grid Interconnection',              subtitle: 'Import/export metering & peak shaving' },
  { prefix: '/dashboard/energy/solar',            title: 'Solar PV Monitoring',               subtitle: 'String inverter yield & MPPT efficiency' },
  { prefix: '/dashboard/energy/bess',             title: 'Battery Storage Management',        subtitle: 'SoC · SoH · thermal limits · cell balance' },
  { prefix: '/dashboard/operations/overrides',    title: 'Manual Override Log',               subtitle: 'Active relay overrides & countdown timers' },
  { prefix: '/dashboard/operations/checklists',   title: 'SOP Checklists',                    subtitle: 'Digital pre-commissioning & maintenance checks' },
  { prefix: '/dashboard/operations/incidents',    title: 'Incident Triage Portal',            subtitle: 'Hardware faults & emergency shutdown tracking' },
  { prefix: '/dashboard/operations/work-orders',  title: 'Work Order Center',                 subtitle: 'Task dispatch & maintenance scheduling' },
  { prefix: '/dashboard/analytics/carbon',        title: 'Carbon Footprint Analytics',        subtitle: 'Scope 1 & 2 · ESG carbon credit reduction' },
  { prefix: '/dashboard/analytics/business',      title: 'Business & Financial Analytics',    subtitle: 'Cost avoidance & peak demand reduction' },
  { prefix: '/dashboard/reports/generator',       title: 'Report Generator',                  subtitle: 'Scheduled PDF/CSV/Excel automated reports' },
  { prefix: '/dashboard/reports/archive',         title: 'Report Archive',                    subtitle: 'Historical compliance & performance reports' },
  { prefix: '/dashboard/notifications/rules',     title: 'Alert Rules',                       subtitle: 'Threshold triggers & escalation channels' },
  { prefix: '/dashboard/notifications/center',    title: 'Notification Center',               subtitle: 'System alerts & event notifications' },
  { prefix: '/dashboard/roles',                   title: 'Roles & Permissions',               subtitle: 'RBAC matrix configuration' },
  { prefix: '/dashboard/users',                   title: 'User Directory',                    subtitle: 'User provisioning & account management' },
  { prefix: '/profile',                           title: 'Profile Settings',                  subtitle: 'Personal preferences & security' },
  { prefix: '/settings',                          title: 'System Preferences',                subtitle: 'Theme & notification settings' },
  { prefix: '/my-tickets',                        title: 'Support Tickets',                   subtitle: 'Service request & incident tracking' },
];

function getPageInfo(pathname: string) {
  const match = PAGE_INFO.find((p) => pathname === p.prefix || pathname.startsWith(p.prefix + '/'));
  return match ?? { title: 'GridFlowX Operations Center', subtitle: 'Live microgrid monitoring & control' };
}

// ============================================================================
// WS Connection Status Pill
// ============================================================================

type WsStatus = 'live' | 'reconnecting' | 'offline';

function WsStatusPill({ status }: { status: WsStatus }) {
  return (
    <span className={cn(
      "hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-colors",
      status === 'live'         && "bg-emerald-500/10 text-emerald-400 border-emerald-500/25",
      status === 'reconnecting' && "bg-amber-500/10 text-amber-400 border-amber-500/25 animate-pulse",
      status === 'offline'      && "bg-red-500/10 text-red-400 border-red-500/25",
    )}>
      {status === 'live'         && <><Wifi className="w-3 h-3" /> LIVE</>}
      {status === 'reconnecting' && <><Loader2 className="w-3 h-3 animate-spin" /> RECONNECTING</>}
      {status === 'offline'      && <><WifiOff className="w-3 h-3" /> OFFLINE</>}
    </span>
  );
}

// ============================================================================
// Notification Drawer (inline slide-over)
// ============================================================================

const SEVERITY_STYLES = {
  critical: 'border-l-red-500 bg-red-500/5',
  warning:  'border-l-amber-500 bg-amber-500/5',
  info:     'border-l-blue-500 bg-blue-500/5',
  success:  'border-l-emerald-500 bg-emerald-500/5',
};

function NotificationDrawer({ onClose }: { onClose: () => void }) {
  const { notifications, markRead, markAllRead, clearAll } = useNotificationsStore();

  return (
    <div className="absolute right-4 top-[calc(var(--header-height)+8px)] w-80 sm:w-96 z-50 bg-[var(--bg-surface)] border border-[var(--border-primary)]/60 rounded-xl shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-primary)]/40">
        <p className="text-sm font-semibold">Notifications</p>
        <div className="flex items-center gap-2">
          <button onClick={markAllRead} className="text-[10px] text-[var(--text-muted)] hover:text-[var(--color-primary)] transition-colors uppercase tracking-wide">
            Mark all read
          </button>
          <button onClick={clearAll} className="text-[10px] text-[var(--text-muted)] hover:text-red-400 transition-colors uppercase tracking-wide">
            Clear all
          </button>
          <button onClick={onClose} className="ml-2 text-[var(--text-muted)] hover:text-[var(--text-primary)]">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="py-8 text-center text-sm text-[var(--text-muted)]">
            No notifications
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => markRead(n.id)}
              className={cn(
                "px-4 py-3 border-l-2 cursor-pointer transition-opacity",
                SEVERITY_STYLES[n.severity],
                n.isRead ? 'opacity-50' : 'opacity-100',
              )}
            >
              <p className={cn("text-xs font-semibold", n.isRead ? "text-[var(--text-muted)]" : "text-[var(--text-primary)]")}>
                {n.title}
              </p>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5">{n.message}</p>
              <p className="text-[10px] text-[var(--text-muted)] mt-1 font-mono">{n.timestamp}</p>
            </div>
          ))
        )}
      </div>

      <div className="px-4 py-2 border-t border-[var(--border-primary)]/40">
        <Link href="/dashboard/notifications/center" onClick={onClose} className="text-xs text-[var(--color-primary)] hover:underline">
          View all notifications →
        </Link>
      </div>
    </div>
  );
}

// ============================================================================
// SiteHeader
import { SearchModal } from "@/components/layout/navbar/SearchModal";
import { useTelemetryStore } from "@/features/telemetry/store/telemetry.store";

export function SiteHeader() {
  const pathname = usePathname();
  const { user, role } = useAuth();
  const unreadCount = useNotificationsStore((s) => s.notifications.filter((n) => !n.isRead).length);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const { title, subtitle } = getPageInfo(pathname);
  const normalizedRole = (role ? String(role).toLowerCase() : null) as UserRole | null;
  const roleLabel = normalizedRole ? ROLE_LABELS[normalizedRole] : null;

  // Live WebSocket status from Telemetry store
  const isWsConnected = useTelemetryStore((s) => s.isWsConnected);
  const wsStatus: WsStatus = isWsConnected ? 'live' : 'offline';

  // Keyboard shortcut for quick search palette (Cmd+K / Ctrl+K)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowSearch((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="flex h-[var(--header-height)] shrink-0 items-center gap-2 border-b border-[var(--border-primary)] bg-[var(--bg-surface)] transition-[width,height] duration-300 ease-[cubic-bezier(0.2,0,0,1)] group-has-data-[collapsible=icon]/sidebar-wrapper:h-[var(--header-height)] relative">
      <div className="flex w-full items-center gap-2 px-3 sm:px-4 lg:gap-3 lg:px-6">

        {/* Sidebar trigger + separator */}
        <SidebarTrigger className="-ml-0.5 sm:-ml-1" />
        <Separator orientation="vertical" className="mx-1.5 sm:mx-2 data-[orientation=vertical]:h-4" />

        {/* Breadcrumbs & Page title */}
        <div className="flex flex-col min-w-0 flex-1 sm:flex-initial">
          {pathname !== '/dashboard' && (
            <div className="hidden md:flex items-center gap-1.5 text-[10px] text-[var(--text-muted)] font-medium mb-0.5">
              <Link href="/dashboard" className="hover:text-[var(--text-primary)] transition-colors">
                Dashboard
              </Link>
              <span>/</span>
              {pathname.split('/').filter(Boolean).length > 2 && (
                <>
                  <span className="capitalize">
                    {pathname.split('/').filter(Boolean)[1]}
                  </span>
                  <span>/</span>
                </>
              )}
              <span className="text-[var(--text-primary)] truncate max-w-[200px]">
                {title}
              </span>
            </div>
          )}
          <h1 className="text-sm md:text-base font-bold text-[var(--text-primary)] leading-tight truncate">
            {title}
          </h1>
          <span className="text-[11px] text-[var(--text-muted)] hidden sm:inline truncate">
            {subtitle}
          </span>
        </div>


        {/* Right side controls */}
        <div className="ml-auto flex items-center gap-1.5 sm:gap-2 lg:gap-3">

          {/* WebSocket Status */}
          <WsStatusPill status={wsStatus} />

          {/* Verification badge */}
          {user?.emailVerified && (
            <span className="hidden lg:inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-full">
              <CheckCircle2 size={10} /> Verified
            </span>
          )}

          {/* Role badge */}
          {roleLabel && (
            <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[var(--color-primary)]/15 text-[var(--color-primary)] border border-[var(--color-primary)]/30">
              <Shield size={11} /> {roleLabel}
            </span>
          )}

          {/* Notification bell */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowNotifications((v) => !v)}
              className="w-9 h-9 rounded-full border border-[var(--border-primary)]/40 text-[var(--text-muted)] hover:text-[var(--text-primary)] relative focus-visible:ring-2 focus-visible:ring-emerald-500"
              aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center px-0.5">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Button>

            {showNotifications && (
              <NotificationDrawer onClose={() => setShowNotifications(false)} />
            )}
          </div>

          {/* Global Search Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSearch(true)}
            className="w-9 h-9 rounded-full border border-[var(--border-primary)]/40 text-[var(--text-muted)] hover:text-[var(--text-primary)] focus-visible:ring-2 focus-visible:ring-emerald-500"
            aria-label="Search operational console (Ctrl+K)"
            title="Search operational console (Ctrl+K)"
          >
            <Search className="w-4 h-4" />
          </Button>

          {/* Search Modal */}
          <SearchModal isOpen={showSearch} onClose={() => setShowSearch(false)} />
        </div>
      </div>
    </header>
  );
}

