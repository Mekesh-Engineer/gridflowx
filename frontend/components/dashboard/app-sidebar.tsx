"use client";

import * as React from "react";
import Link from "next/link";
import { IconInnerShadowTop } from "@tabler/icons-react";
import { PanelLeftClose, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { SIDEBAR_NAV } from "@/config/sidebar.config";
import { UserRole } from "@/types/roles";

import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { role } = useAuth();
  const { state, toggleSidebar, isMobile, setOpenMobile } = useSidebar();
  const normalizedRole = (
    role ? String(role).toLowerCase() : UserRole.OPERATOR
  ) as UserRole;

  // Map sidebar.config.ts role navigation groups to NavMain format
  const groups = React.useMemo(() => {
    const rawGroups = SIDEBAR_NAV[normalizedRole] ?? [];
    return rawGroups.map((g) => ({
      label: g.label,
      items: g.items.map((item) => ({
        title: item.label,
        url: item.href,
        icon: item.icon,
        badge: item.badge,
      })),
    }));
  }, [normalizedRole]);

  const isCollapsed = state === "collapsed" && !isMobile;

  return (
    <Sidebar collapsible="icon" {...props}>
      {/* Brand Header */}
      <SidebarHeader className="relative overflow-hidden">
        <div className="flex w-full items-center justify-between gap-2 overflow-hidden group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:justify-center">
          {/* Logo + Brand Information */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/dashboard"
                onClick={() => {
                  if (isMobile) setOpenMobile(false);
                }}
                className="flex items-center gap-2.5 rounded-lg p-1 transition-colors hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-sidebar-ring outline-hidden group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:gap-0 overflow-hidden"
              >
                <div className="flex aspect-square size-8 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary)] text-white transition-colors">
                  <IconInnerShadowTop className="size-4.5 text-white" />
                </div>
                <div className="grid flex-1 text-left leading-tight overflow-hidden whitespace-nowrap transition-[opacity,width] duration-300 ease-[cubic-bezier(0.2,0,0,1)] group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:pointer-events-none">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-sm font-bold tracking-tight text-sidebar-foreground">
                      GridFlowX
                    </span>
                    <span className="rounded bg-sidebar-accent border border-sidebar-border px-1 py-0.2 text-[9px] font-bold text-[var(--color-primary)] uppercase tracking-wider">
                      AI
                    </span>
                  </div>
                  <span className="truncate text-[10.5px] text-sidebar-foreground/60 font-mono tracking-tight">
                    Microgrid Platform
                  </span>
                </div>
              </Link>
            </TooltipTrigger>
            {isCollapsed && (
              <TooltipContent side="right" align="center" sideOffset={10}>
                <p className="font-semibold text-xs">GridFlowX</p>
                <p className="text-[10px] text-muted-foreground">
                  AI Microgrid Platform
                </p>
              </TooltipContent>
            )}
          </Tooltip>

          {/* Close button on mobile / Desktop Inline Collapse Toggle */}
          {isMobile ? (
            <button
              type="button"
              onClick={() => setOpenMobile(false)}
              aria-label="Close navigation menu"
              title="Close"
              className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-sidebar-border text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors focus-visible:ring-2 focus-visible:ring-sidebar-ring outline-hidden cursor-pointer"
            >
              <X className="size-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={toggleSidebar}
              aria-label={
                isCollapsed
                  ? "Expand sidebar (Ctrl+B)"
                  : "Collapse sidebar (Ctrl+B)"
              }
              title={
                isCollapsed
                  ? "Expand sidebar (Ctrl+B)"
                  : "Collapse sidebar (Ctrl+B)"
              }
              className="flex size-7 shrink-0 items-center justify-center rounded-md border border-sidebar-border text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] overflow-hidden group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:pointer-events-none focus-visible:ring-2 focus-visible:ring-sidebar-ring outline-hidden cursor-pointer"
            >
              <PanelLeftClose className="size-3.5" />
            </button>
          )}
        </div>
      </SidebarHeader>

      {/* Main Navigation Content */}
      <SidebarContent>
        <NavMain groups={groups} />
      </SidebarContent>

      {/* Footer Area: System Status + User Account */}
      <SidebarFooter>
        {/* Real System Status Info */}
        <div className="w-full px-1 group-data-[collapsible=icon]:px-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center justify-between rounded-md px-2 py-1.5 bg-sidebar-accent border border-sidebar-border text-[11px] group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:py-1.5 group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:border-0 cursor-default select-none overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)]">
                <div className="flex items-center gap-2 min-w-0 group-data-[collapsible=icon]:gap-0">
                  <span className="flex size-2 rounded-full bg-emerald-500 shrink-0" />
                  <span className="truncate font-medium text-sidebar-foreground/75 text-[10.5px] overflow-hidden whitespace-nowrap transition-[opacity,width] duration-300 ease-[cubic-bezier(0.2,0,0,1)] group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:pointer-events-none">
                    System Operational
                  </span>
                </div>
                <span className="font-mono text-[10px] text-sidebar-foreground/50 overflow-hidden whitespace-nowrap transition-[opacity,width] duration-300 ease-[cubic-bezier(0.2,0,0,1)] group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:pointer-events-none">
                  v3.0.0
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="right" align="center" sideOffset={10}>
              <div className="flex items-center gap-1.5 text-xs">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                <span className="font-medium">System Operational · v3.0.0</span>
              </div>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* User Account Component */}
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
