"use client"

import * as React from "react"
import Link from "next/link"
import {
  IconDotsVertical,
  IconLogout,
  IconUserCircle,
  IconTicket,
  IconSettings,
  IconShieldCheck,
} from "@tabler/icons-react"
import { useAuth } from "@/hooks/use-auth"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
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

export function NavUser({
  user: fallbackUser,
}: {
  user?: {
    name: string
    email: string
    avatar: string
  }
}) {
  const { isMobile, state, setOpenMobile } = useSidebar()
  const { user: authUser, logout, role } = useAuth()

  const displayName = authUser?.displayName || fallbackUser?.name || "Operator User"
  const email = authUser?.email || fallbackUser?.email || "No email"
  const avatar =
    authUser?.photoURL ||
    fallbackUser?.avatar ||
    "https://images.unsplash.com/photo-1659482633369-9fe69af50bfb?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=3&w=320&h=320&q=80"
  const initial = displayName.charAt(0).toUpperCase()
  const isCollapsed = state === "collapsed" && !isMobile

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  const handleLogout = async () => {
    if (isMobile) {
      setOpenMobile(false)
    }
    await logout()
  }

  const buttonTrigger = (
    <SidebarMenuButton
      size="lg"
      className="h-12 w-full rounded-lg p-2 transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground group-data-[collapsible=icon]:p-0! group-data-[collapsible=icon]:size-9! group-data-[collapsible=icon]:mx-auto! group-data-[collapsible=icon]:justify-center! group-data-[collapsible=icon]:gap-0! overflow-hidden cursor-pointer"
    >
      <div className="relative shrink-0">
        <Avatar className="size-8 rounded-lg border border-sidebar-border">
          <AvatarImage src={avatar} alt={displayName} />
          <AvatarFallback className="rounded-lg bg-[var(--color-primary)] text-white font-bold text-xs">
            {initial}
          </AvatarFallback>
        </Avatar>
        <span
          className="absolute -bottom-0.5 -right-0.5 size-2 rounded-full bg-emerald-500 ring-2 ring-sidebar"
          aria-hidden="true"
        />
      </div>

      <div className="grid flex-1 text-left text-xs leading-tight overflow-hidden whitespace-nowrap transition-[opacity,width] duration-300 ease-[cubic-bezier(0.2,0,0,1)] group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:pointer-events-none">
        <span className="truncate font-semibold text-sidebar-foreground">
          {displayName}
        </span>
        <span className="truncate text-[11px] text-sidebar-foreground/60 font-mono">
          {email}
        </span>
      </div>

      <IconDotsVertical className="ml-auto size-4 text-sidebar-foreground/50 shrink-0 transition-[opacity,width] duration-300 ease-[cubic-bezier(0.2,0,0,1)] group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:pointer-events-none" />
    </SidebarMenuButton>
  )

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                {buttonTrigger}
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent side="right" align="center" sideOffset={10} hidden={!isCollapsed}>
              <p className="font-semibold text-xs">{displayName}</p>
              <p className="text-[10px] text-muted-foreground uppercase">{role || "Operator"}</p>
            </TooltipContent>
          </Tooltip>

          <DropdownMenuContent
            className="w-64 rounded-xl border border-sidebar-border bg-sidebar p-1.5 shadow-md text-sidebar-foreground"
            side={isMobile ? "bottom" : "right"}
            align={isMobile ? "end" : "end"}
            sideOffset={8}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2.5 p-2 text-left">
                <Avatar className="size-9 rounded-lg border border-sidebar-border">
                  <AvatarImage src={avatar} alt={displayName} />
                  <AvatarFallback className="rounded-lg bg-[var(--color-primary)] text-white font-bold text-xs">
                    {initial}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-xs leading-tight min-w-0">
                  <span className="truncate font-semibold text-sidebar-foreground">
                    {displayName}
                  </span>
                  <span className="truncate text-[11px] text-sidebar-foreground/60 font-mono">
                    {email}
                  </span>
                  {role && (
                    <div className="mt-1 flex items-center gap-1">
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider bg-sidebar-accent text-[var(--color-primary)] border border-sidebar-border">
                        <IconShieldCheck className="size-3" />
                        {role}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator className="bg-sidebar-border my-1" />

            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link
                  href="/profile"
                  onClick={handleLinkClick}
                  className="flex items-center gap-2 px-2.5 py-2 text-xs rounded-lg cursor-pointer hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
                >
                  <IconUserCircle className="size-4 text-sidebar-foreground/70" />
                  <span>Profile Account</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link
                  href="/my-tickets"
                  onClick={handleLinkClick}
                  className="flex items-center gap-2 px-2.5 py-2 text-xs rounded-lg cursor-pointer hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
                >
                  <IconTicket className="size-4 text-sidebar-foreground/70" />
                  <span>My Tickets</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link
                  href="/settings"
                  onClick={handleLinkClick}
                  className="flex items-center gap-2 px-2.5 py-2 text-xs rounded-lg cursor-pointer hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
                >
                  <IconSettings className="size-4 text-sidebar-foreground/70" />
                  <span>Settings & Preferences</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator className="bg-sidebar-border my-1" />

            <DropdownMenuItem
              onClick={handleLogout}
              className="flex items-center gap-2 px-2.5 py-2 text-xs rounded-lg cursor-pointer text-red-500 hover:bg-red-500/10 hover:text-red-500 focus:bg-red-500/10 focus:text-red-500 font-semibold transition-colors"
            >
              <IconLogout className="size-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
