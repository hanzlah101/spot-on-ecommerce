"use client"

import type { PropsWithChildren } from "react"
import { ThemeProvider as NextThemeProvider } from "next-themes"

import { TooltipProvider } from "@/components/ui/tooltip"

export function ThemeProvider({ children }: PropsWithChildren) {
  return (
    <NextThemeProvider
      attribute="class"
      defaultTheme="system"
      storageKey="backup:theme"
    >
      <TooltipProvider>{children}</TooltipProvider>
    </NextThemeProvider>
  )
}
