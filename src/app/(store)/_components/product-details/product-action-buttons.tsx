"use client"

import Link from "next/link"
import { toast } from "sonner"
import { useCallback, useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Heart, Minus, Plus } from "lucide-react"
import { useAction } from "next-safe-action/hooks"

import { cn, formatPrice } from "@/utils"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/stores/use-cart-store"
import { productTypeEnum } from "@/db/schema"
import { useCartModal } from "@/stores/use-cart-modal"
import { favouriteProduct } from "@/actions/product"
import { parseError } from "@/utils/error"
import { ShakeAnimation } from "@/components/animations/shake-animation"

type ProductActionButtonsProps = {
  selectedCombinationId?: string
  productType: (typeof productTypeEnum.enumValues)[number]
  onError: (_e: boolean) => void
  stock: number
  price: number
  isFavourite: boolean
}

export function ProductActionButtons({
  selectedCombinationId,
  productType,
  onError,
  stock,
  price,
  isFavourite: initialFav,
}: ProductActionButtonsProps) {
  const { productId }: { productId: string } = useParams()
  const { addToCart, cart } = useCartStore()

  const [quantity, setQuantity] = useState(1)
  const [isFavourite, setIsFavourite] = useState(initialFav)

  const { onOpen } = useCartModal()

  const incrementQty = useCallback(() => {
    if (quantity >= stock) {
      return
    }

    setQuantity((prev) => prev + 1)
  }, [quantity, stock])

  const decrementQty = useCallback(() => {
    if (quantity <= 1) {
      return
    }

    setQuantity((prev) => prev - 1)
  }, [quantity])

  function handleAddToCart() {
    if (productType === "variable" && !selectedCombinationId) {
      onError(true)
      return
    }

    const product = cart.find(
      (item) =>
        item.productId === productId &&
        item.combinationId === selectedCombinationId,
    )

    if (product) {
      if (quantity + product.quantity > stock) {
        toast.error("Not enough stock")
        onOpen()
        return
      }
    }

    addToCart({
      productId,
      quantity,
      isSelected: true,
      combinationId: selectedCombinationId,
    })

    onOpen()
    onError(false)
  }

  function handleBuyNow(e: React.MouseEvent<HTMLAnchorElement>) {
    if (productType === "variable" && !selectedCombinationId) {
      e.preventDefault()
      onError(true)
      return
    }
  }

  const { execute: favourite } = useAction(favouriteProduct, {
    onError({ error }) {
      toast.error(parseError(error))
    },
    onExecute() {
      setIsFavourite((prev) => !prev)
    },
  })

  useEffect(() => {
    if (quantity > stock) {
      setQuantity(stock)
    }
  }, [quantity, stock])

  useEffect(() => {
    setIsFavourite(initialFav)
  }, [initialFav])

  return (
    <>
      <div className="mt-6 flex items-center gap-x-1">
        <p className="text-muted-foreground">Total:</p>
        <p className="font-medium">{formatPrice(price * quantity)}</p>
      </div>
      <div className="mt-3 space-y-1.5">
        <p className="font-medium">Quantity:</p>
        <div className="flex w-fit items-center rounded-full border py-2">
          <button
            onClick={decrementQty}
            disabled={quantity <= 1}
            aria-label="Decrement Qty"
            className="px-4 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Minus className="h-[18px] w-[18px]" />
          </button>
          <p className="border-x px-4 text-center">{quantity}</p>
          <button
            onClick={incrementQty}
            disabled={quantity >= stock}
            aria-label="Increment Qty"
            className="px-4 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="h-[18px] w-[18px]" />
          </button>
        </div>
      </div>

      <div className="mt-4">
        <ShakeAnimation disabled={stock === 0}>
          <Button
            disabled={stock === 0}
            onClick={handleAddToCart}
            className="mb-3 h-12 w-full rounded-full text-lg disabled:bg-foreground/70 md:h-14"
          >
            {stock === 0 ? "Out of stock!" : "Add to cart"}
          </Button>
        </ShakeAnimation>

        {stock > 0 && (
          <Link
            onClick={handleBuyNow}
            className="flex h-12 w-full items-center justify-center rounded-full border bg-secondary/60 text-secondary-foreground transition-colors hover:bg-secondary/70 md:h-14"
            href={{
              pathname: "/orders/confirm",
              query: {
                mode: "buy-now",
                productId,
                qty: quantity,
                ...(selectedCombinationId
                  ? { combinationId: selectedCombinationId }
                  : undefined),
              },
            }}
          >
            <Button
              className={cn(
                "animate-bg-shine bg-[length:250%_100%] bg-clip-text text-lg font-bold tracking-wide text-transparent disabled:animate-none dark:text-transparent",
                "dark:bg-[linear-gradient(110deg,#D4D4D8,45%,#27272A,55%,#D4D4D8)]",
                "bg-[linear-gradient(110deg,#09090B,45%,#fff,55%,#09090B)]",
              )}
            >
              Buy Now!
            </Button>
          </Link>
        )}
        <button
          onClick={() => favourite({ productId })}
          className="mt-3 inline-flex items-center pl-4 transition-opacity hover:opacity-80"
        >
          <Heart
            className={cn("mr-2 h-4 w-4", {
              "fill-rose-500 stroke-rose-500 text-rose-500": isFavourite,
            })}
          />
          {isFavourite ? "Remove from" : "Add to"} wishlist
        </button>
      </div>
    </>
  )
}
