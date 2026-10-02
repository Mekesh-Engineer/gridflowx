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
  useSidebar,
} from "@/components/ui/sidebar"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

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
  const { state, isMobile, setOpenMobile } = useSidebar()
  const pendingApprovals = useNotificationsStore((s) => s.pendingApprovals)
  const unreadNotifications = useNotificationsStore((s) => s.notifications.filter((n) => !n.isRead).length)

  const isCollapsed = state === "collapsed" && !isMobile

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  return (
    <div className="flex flex-col w-full min-w-0">
      {/* Top Quick Action Header */}
      <div className="p-2 pb-1 group-data-[collapsible=icon]:p-1.5 shrink-0">
        <div className="flex items-center gap-1.5 w-full overflow-hidden group-data-[collapsible=icon]:gap-0">
          {/* Quick Create Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                asChild
                size="sm"
                className="flex-1 h-8.5 rounded-lg bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-focus)] shadow-none font-semibold text-xs transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] gap-2 justify-center px-2 group-data-[collapsible=icon]:size-9 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:flex-none group-data-[collapsible=icon]:gap-0 cursor-pointer overflow-hidden"
              >
                <Link
                  href="/dashboard/operations/work-orders"
                  onClick={handleLinkClick}
                  className="flex items-center justify-center group-data-[collapsible=icon]:gap-0"
                >
                  <IconCirclePlusFilled className="size-4.5 shrink-0" />
                  <span className="truncate overflow-hidden whitespace-nowrap transition-[opacity,width] duration-300 ease-[cubic-bezier(0.2,0,0,1)] group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:pointer-events-none">
                    Quick Create
                  </span>
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" align="center" sideOffset={10} hidden={!isCollapsed}>
              Quick Create Work Order
            </TooltipContent>
          </Tooltip>

          {/* Notifications Shortcut */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="outline"
                className="size-8.5 rounded-lg border-sidebar-border bg-sidebar-accent text-sidebar-foreground hover:bg-sidebar-accent/80 shrink-0 transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] relative cursor-pointer overflow-hidden group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:border-0 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:pointer-events-none"
                asChild
              >
                <Link href="/dashboard/notifications/center" onClick={handleLinkClick}>
                  <IconMail className="size-4 shrink-0" />
                  <span className="sr-only">Notifications</span>
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-red-500" />
                  )}
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" align="end" hidden={isCollapsed}>
              {unreadNotifications > 0 ? `${unreadNotifications} Notifications` : "Notifications"}
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Dynamic Role-Based Navigation Groups */}
      {groups.map((group, index) => (
        <SidebarGroup
          key={group.label}
          className="p-2 py-1 group-data-[collapsible=icon]:p-1 shrink-0 transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)]"
        >
          {/* Section Divider */}
          {index > 0 && (
            <div
              className="h-px bg-sidebar-border mb-1.5 mx-1 transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] group-data-[collapsible=icon]:w-5 group-data-[collapsible=icon]:mx-auto"
              role="separator"
            />
          )}

          {/* Group Label */}
          <SidebarGroupLabel className="px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wider text-sidebar-foreground/60 select-none">
            {group.label}
          </SidebarGroupLabel>

          {/* Group Menu Items */}
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {group.items.map((item) => {
                const isActive =
                  pathname === item.url ||
                  (item.url !== "/dashboard" && pathname.startsWith(item.url + "/"))
                const badgeCount = item.badge === "approvals" ? pendingApprovals : 0
                const IconComponent = item.icon

                const tooltipContent = badgeCount > 0 ? `${item.title} (${badgeCount})` : item.title

                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={tooltipContent}
                      className="group/nav-btn"
                    >
                      <Link
                        href={item.url}
                        onClick={handleLinkClick}
                        className="relative overflow-hidden group-data-[collapsible=icon]:gap-0"
                      >
                        {/* Active Indicator Bar */}
                        {isActive && (
                          <span
                            className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-[var(--color-primary)] transition-all duration-300"
                            aria-hidden="true"
                          />
                        )}

                        {/* Nav Icon */}
                        {IconComponent && (
                          <div className="relative shrink-0 flex items-center justify-center">
                            <IconComponent
                              className={`size-4 transition-colors duration-200 ${
                                isActive
                                  ? "text-[var(--color-primary)]"
                                  : "text-sidebar-foreground/70 group-hover/nav-btn:text-sidebar-foreground"
                              }`}
                            />
                            {/* Collapsed Badge Dot Indicator */}
                            {badgeCount > 0 && (
                              <span
                                className="absolute -top-1 -right-1 size-2 rounded-full bg-amber-500 ring-2 ring-sidebar transition-opacity duration-300 opacity-0 group-data-[collapsible=icon]:opacity-100 pointer-events-none"
                                aria-label={`${badgeCount} approvals pending`}
                              />
                            )}
                          </div>
                        )}

                        {/* Label */}
                        <span className="truncate overflow-hidden whitespace-nowrap transition-[opacity,width] duration-300 ease-[cubic-bezier(0.2,0,0,1)] group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:pointer-events-none">
                          {item.title}
                        </span>

                        {/* Expanded Mode Badge */}
                        {badgeCount > 0 && (
                          <span
                            className="ml-auto shrink-0 min-w-5 h-4.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-[10px] font-bold flex items-center justify-center px-1.5 overflow-hidden whitespace-nowrap transition-[opacity,width,padding] duration-300 ease-[cubic-bezier(0.2,0,0,1)] group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:border-0 group-data-[collapsible=icon]:pointer-events-none"
                            aria-label={`${badgeCount} pending`}
                          >
                            {badgeCount}
                          </span>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </div>
  )
}
