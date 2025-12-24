"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ModeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <button className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors duration-200">
        <Sun className="w-5 h-5 text-black/80 dark:text-white/80" />
      </button>
    )
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors duration-200"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun className="w-5 h-5 text-white/80 hover:text-white transition-colors" />
      ) : (
        <Moon className="w-5 h-5 text-black/80 hover:text-black transition-colors" />
      )}
    </button>
  )
}
