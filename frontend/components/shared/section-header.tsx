import * as React from "react"
import { cn } from "@/lib/utils"

interface SectionHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  eyebrow?: string
  title: React.ReactNode
  description?: React.ReactNode
  align?: "left" | "center"
  theme?: "light" | "dark"
  hasTrailingLine?: boolean
  titleClassName?: string
  descriptionClassName?: string
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "left",
  theme = "light",
  hasTrailingLine = false,
  className,
  titleClassName,
  descriptionClassName,
  ...props
}: SectionHeaderProps) {
  const isDark = theme === "dark"

  return (
    <div
      className={cn(
        "mb-16 lg:mb-24",
        align === "center" ? "text-center max-w-3xl mx-auto" : "max-w-4xl",
        className
      )}
      {...props}
    >
      {eyebrow && (
        <span
          className={cn(
            "inline-flex items-center gap-3 text-sm font-mono mb-6",
            isDark ? "text-background/50" : "text-muted-foreground"
          )}
        >
          <span className={cn("w-8 h-px", isDark ? "bg-background/30" : "bg-foreground/30")} />
          {eyebrow}
          {hasTrailingLine && (
            <span className={cn("w-8 h-px", isDark ? "bg-background/30" : "bg-foreground/30")} />
          )}
        </span>
      )}
      
      <h2
        className={cn(
          "text-4xl lg:text-6xl font-display tracking-tight leading-tight",
          isDark ? "text-background" : "text-foreground",
          titleClassName
        )}
      >
        {title}
      </h2>

      {description && (
        <p
          className={cn(
            "text-xl leading-relaxed mt-6",
            isDark ? "text-background/60" : "text-muted-foreground",
            align === "center" ? "mx-auto" : "",
            descriptionClassName
          )}
        >
          {description}
        </p>
      )}
    </div>
  )
}
