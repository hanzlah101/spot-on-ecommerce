"use client"

import { useMemo } from "react"
import { ShoppingCart } from "lucide-react"


import { useCartStore } from "@/stores/use-cart-store"
import { useCartModal } from "@/stores/use-cart-modal"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function CartTrigger() {
  const { cart } = useCartStore()
  const { onOpen: onCartOpen } = useCartModal()

  const totalItems = useMemo(() => {
    return cart
      .map((item) => item.quantity)
      .reduce((acc, curr) => acc + curr, 0)
  }, [cart])

  return (
      <Tooltip delayDuration={250}>
        <TooltipTrigger
          aria-label="Show cart"
          onClick={onCartOpen}
          className="relative text-foreground transition-transform hover:scale-110"
        >
          <ShoppingCart className="size-5" />
          {totalItems > 0 && (
            <span className="absolute -top-2.5 left-2.5 rounded-full bg-primary px-1.5 py-0.5 text-xs text-primary-foreground">
              {totalItems >= 10 ? "9+" : totalItems}
            </span>
          )}
        </TooltipTrigger>
        <TooltipContent side="bottom" sideOffset={10}>
          Cart
        </TooltipContent>
      </Tooltip>

  )
}
