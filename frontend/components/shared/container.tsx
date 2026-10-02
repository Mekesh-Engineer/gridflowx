import * as React from "react"
import { cn } from "@/lib/utils"

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  size?: "default" | "narrow"
}

export function Container({
  children,
  className,
  size = "default",
  ...props
}: ContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto px-6 lg:px-12 w-full",
        size === "narrow" ? "max-w-7xl" : "max-w-[1400px]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
