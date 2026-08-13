"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { IconCirclePlusFilled, IconMail, type Icon } from "@tabler/icons-react"
import type { LucideIcon } from "lucide-react"
import { useNotificationsStore } from "@/store/notifications.store"
import { Button } from "@/components/ui/button"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export interface NavMainItem {
  title: string
  url: string
  icon?: Icon | LucideIcon
  badge?: string
}

export interface NavMainGroup {
  label: string
  items: NavMainItem[]
}

export function NavMain({
  groups,
}: {
  groups: NavMainGroup[]
}) {
  const pathname = usePathname()
  const pendingApprovals = useNotificationsStore((s) => s.pendingApprovals)

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        {/* Top Quick Action Header Buttons */}
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <SidebarMenuButton
              tooltip="Quick Create"
              className="min-w-8 bg-primary text-primary-foreground duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground"
              asChild
            >
              <Link href="/dashboard/operations/work-orders">
                <IconCirclePlusFilled />
                <span>Quick Create</span>
              </Link>
            </SidebarMenuButton>
            <Button
              size="icon"
              className="size-8 group-data-[collapsible=icon]:opacity-0 shrink-0"
              variant="outline"
              asChild
            >
              <Link href="/dashboard/notifications/center">
                <IconMail />
                <span className="sr-only">Notifications</span>
              </Link>
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>

        {/* Dynamic Role-Based Navigation Groups */}
        {groups.map((group) => (
          <div key={group.label} className="mt-2">
            <SidebarGroupLabel className="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
              {group.label}
            </SidebarGroupLabel>
            <SidebarMenu>
              {group.items.map((item) => {
                const isActive =
                  pathname === item.url ||
                  (item.url !== "/dashboard" && pathname.startsWith(item.url + "/"))
                const badgeCount = item.badge === "approvals" ? pendingApprovals : 0
                const IconComponent = item.icon

                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                    >
                      <Link href={item.url}>
                        {IconComponent && <IconComponent className="size-4 shrink-0" />}
                        <span>{item.title}</span>
                        {badgeCount > 0 && (
                          <span className="ml-auto shrink-0 min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1 group-data-[collapsible=icon]:hidden">
                            {badgeCount}
                          </span>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </div>
        ))}
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
