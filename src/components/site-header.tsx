"use client"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { usePathname } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Shield, CheckCircle2 } from "lucide-react"

export function SiteHeader() {
  const pathname = usePathname()
  const { user, role } = useAuth()

  const getPageInfo = () => {
    if (pathname.startsWith("/dashboard/admin")) {
      return { title: "System Administration Portal", subtitle: "User management & telemetry limits" }
    }
    if (pathname.startsWith("/dashboard/supervisor")) {
      return { title: "Supervisor Fleet Oversight", subtitle: "Active alerts & anomaly queue" }
    }
    if (pathname.startsWith("/dashboard/audit")) {
      return { title: "Cryptographic Audit Ledger", subtitle: "Tamper-evident activity logs" }
    }
    if (pathname.startsWith("/profile")) {
      return { title: "Profile Settings", subtitle: "Operator identity & credentials" }
    }
    if (pathname.startsWith("/settings")) {
      return { title: "System Preferences", subtitle: "Theme & notification rules" }
    }
    if (pathname.startsWith("/my-tickets")) {
      return { title: "Maintenance Tickets", subtitle: "Service request tracking" }
    }
    return { title: "GridFlowX Telemetry Center", subtitle: "Live sector monitoring & control" }
  }

  const { title, subtitle } = getPageInfo()

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b border-[var(--border-primary)]/50 bg-[var(--bg-surface)]/80 backdrop-blur-md transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-2 px-4 lg:gap-3 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <div className="flex flex-col">
          <h1 className="text-sm md:text-base font-bold text-[var(--text-primary)] leading-tight">
            {title}
          </h1>
          <span className="text-[11px] text-[var(--text-muted)] hidden sm:inline">
            {subtitle}
          </span>
        </div>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          {user?.emailVerified && (
            <span className="hidden md:inline-flex items-center gap-1 text-xs font-semibold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
              <CheckCircle2 size={12} /> Verified Operator
            </span>
          )}
          {role && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-[var(--color-primary)]/15 text-[var(--color-primary)] border border-[var(--color-primary)]/30 shadow-xs">
              <Shield size={13} /> {role}
            </span>
          )}
        </div>
      </div>
    </header>
  )
}
