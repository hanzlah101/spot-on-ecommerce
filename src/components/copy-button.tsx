"use client"

import { Copy, CopyCheck } from "lucide-react"

import { cn } from "@/utils"
import { useCopy } from "@/hooks/use-copy"
import type { ButtonProps } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type CopyButtonProps = ButtonProps & {
  label: string
  value: string
}

export function CopyButton({
  label,
  value,
  className,
  ...props
}: CopyButtonProps) {
  const { copy, copied } = useCopy()
  const Icon = copied ? CopyCheck : Copy

  return (
    <Tooltip delayDuration={100}>
      <TooltipTrigger
        onClick={() => copy(value)}
        aria-label={label}
        className={cn(
          "flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
          className,
        )}
        {...props}
      >
        <Icon className="size-4" />
      </TooltipTrigger>
      <TooltipContent side="top">{label}</TooltipContent>
    </Tooltip>
  )
}
