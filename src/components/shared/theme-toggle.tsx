"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Sun, Moon } from "lucide-react"

export interface ThemeToggleProps {
  isDark?: boolean
  onToggle?: () => void
  className?: string
}

export function ThemeToggle({ isDark: controlledIsDark, onToggle, className }: ThemeToggleProps = {}) {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const isControlled = typeof controlledIsDark === 'boolean' && typeof onToggle === 'function'

  if (!mounted && !isControlled) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className={className || "w-9 h-9 rounded-full border border-foreground/10 text-muted-foreground"}
        aria-hidden="true"
      >
        <span className="sr-only">Toggle theme</span>
      </Button>
    )
  }

  const currentTheme = theme === "system" ? resolvedTheme : theme
  const activeIsDark = isControlled ? controlledIsDark : currentTheme === "dark"
  const handleToggle = isControlled ? onToggle : () => setTheme(activeIsDark ? "light" : "dark")

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      className={className || "w-9 h-9 rounded-full border border-foreground/10 text-foreground hover:bg-foreground/5 dark:hover:bg-foreground/10 transition-colors relative"}
      aria-label="Toggle color theme"
      title={activeIsDark ? "Activate Light Mode" : "Activate Dark Mode"}
    >
      <Sun className={`h-4 w-4 transition-transform duration-300 ${activeIsDark ? 'rotate-90 scale-0' : 'rotate-0 scale-100'}`} />
      <Moon className={`absolute h-4 w-4 transition-transform duration-300 ${activeIsDark ? 'rotate-0 scale-100' : '-rotate-90 scale-0'}`} />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
