import { Loader } from "lucide-react"
import { VariantProps, cva } from "class-variance-authority"

import { cn } from "@/utils"

const spinnerVariants = cva("animate-spin", {
  variants: {
    size: {
      sm: "size-4",
      md: "size-5",
      lg: "size-7",
    },
  },
  defaultVariants: {
    size: "md",
  },
})

interface SpinnerContentProps extends VariantProps<typeof spinnerVariants> {
  className?: string
}

export function Spinner({ size, className }: SpinnerContentProps) {
  return <Loader className={cn(spinnerVariants({ size }), className)} />
}
