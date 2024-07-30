"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/utils"

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & {
    indicatorCN?: string
  }
>(({ className, value, max = 100, indicatorCN, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    max={max}
    className={cn(
      "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
      className,
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      style={{
        transform: `translateX(${-((max - (value || 0)) / max) * 100}%)`,
      }}
      className={cn(
        "h-full w-full flex-1 bg-primary transition-all",
        indicatorCN,
      )}
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
