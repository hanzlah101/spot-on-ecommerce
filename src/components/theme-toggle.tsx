"use client"

import { useTheme } from "next-themes"
import { MonitorSmartphone, Moon, Sun } from "lucide-react"

import { cn } from "@/utils"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { Tooltip, TooltipTrigger, TooltipContent } from "./ui/tooltip"

const themes = [
  {
    theme: "light",
    icon: Sun,
  },
  {
    theme: "dark",
    icon: Moon,
  },
  {
    theme: "system",
    icon: MonitorSmartphone,
  },
]

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <ul className="flex items-center gap-x-2">
      {themes.map((t, i) => (
        <li
          key={t.theme + i}
          aria-label={t.theme}
          onClick={() => setTheme(t.theme)}
          className={cn(
            "flex size-10 cursor-pointer items-center justify-center rounded-lg border-2 transition-colors",
            t.theme === theme
              ? "border-foreground bg-foreground text-background"
              : "border-border hover:bg-muted",
          )}
        >
          <t.icon className="size-5 shrink-0" />
        </li>
      ))}
    </ul>
  )
}

type ThemeToggleDropdownProps = {
  className?: string
}

export function ThemeToggleDropdown({
  className = "hidden lg:flex",
}: ThemeToggleDropdownProps) {
  const { setTheme } = useTheme()

  return (
    <DropdownMenu>
      <Tooltip delayDuration={250}>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger
            aria-label="Toggle theme"
            className={cn(
              "text-foreground outline-none transition-transform hover:scale-110",
              className,
            )}
          >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom" sideOffset={10}>
          Toggle theme
        </TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="end">
        {themes.map((t) => (
          <DropdownMenuItem key={t.theme} onClick={() => setTheme(t.theme)}>
            <t.icon className="mr-2 size-4" />
            {t.theme}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
