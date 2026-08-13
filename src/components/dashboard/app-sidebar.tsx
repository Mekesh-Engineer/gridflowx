"use client"

import * as React from "react"
import Link from "next/link"
import { IconInnerShadowTop } from "@tabler/icons-react"
import { useAuth } from "@/hooks/use-auth"
import { SIDEBAR_NAV } from "@/config/sidebar.config"
import { UserRole } from "@/types/roles"

import { NavMain } from "./nav-main"
import { NavUser } from "./nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { role } = useAuth()
  const normalizedRole = (role ? String(role).toLowerCase() : UserRole.OPERATOR) as UserRole

  const rawGroups = SIDEBAR_NAV[normalizedRole] ?? []

  // Map sidebar.config.ts role navigation groups to NavMain format
  const groups = rawGroups.map((g) => ({
    label: g.label,
    items: g.items.map((item) => ({
      title: item.label,
      url: item.href,
      icon: item.icon,
      badge: item.badge,
    })),
  }))

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              size="lg"
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <Link href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-[var(--color-primary)]/15 border border-[var(--color-primary)]/30 text-[var(--color-primary)]">
                  <IconInnerShadowTop className="size-5 text-[var(--color-primary)]" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-bold tracking-tight">GridFlowX</span>
                  <span className="truncate text-xs text-muted-foreground font-mono">
                    AI Microgrid Platform
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain groups={groups} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
