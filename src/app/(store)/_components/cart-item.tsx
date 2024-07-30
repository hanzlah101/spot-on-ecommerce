"use client"

import Image from "next/image"
import Link from "next/link"
import { useCallback, useEffect, useMemo } from "react"
import { Minus, Plus, Trash2, X } from "lucide-react"

import type { CartItem } from "@/utils/types"
import type { getCartProducts } from "@/queries/product"
import { useCartStore } from "@/stores/use-cart-store"
import { cn, formatPrice, getProductPrice, isValueColor } from "@/utils"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import { useCartModal } from "@/stores/use-cart-modal"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type CartItemProps = {
  product: Exclude<Awaited<ReturnType<typeof getCartProducts>>[number], null>
  buyNowItem?: CartItem
  onChangeQty?: (_qty: number) => void
  isCheckout?: boolean
}

export function CartItem({
  product,
  buyNowItem,
  onChangeQty,
  isCheckout,
}: CartItemProps) {
  const { cart, changeProductQty, toggleSelectItem, removeFromCart } =
    useCartStore()

  const { onOpenChange } = useCartModal()

  const { combination } = product

  const item = useMemo(() => {
    if (!!buyNowItem) {
      return buyNowItem
    }

    return cart.find(
      (i) => i.productId === product.id && combination?.id === i.combinationId,
    )
  }, [cart, combination, product, buyNowItem])

  const { price, stock } = useMemo(() => {
    if (!!combination) {
      const price = getProductPrice(
        combination?.price,
        combination?.salePrice,
        combination?.saleDuration,
      )

      return { ...price, stock: combination?.stock }
    } else {
      const price = getProductPrice(
        product.price ?? 0,
        product.salePrice,
        product.saleDuration,
      )

      return { ...price, stock: product.stock ?? 0 }
    }
  }, [product, combination])

  const decrementQty = useCallback(() => {
    if (!item || item?.quantity <= 1) return

    if (onChangeQty) {
      onChangeQty(item.quantity - 1)
      return
    }

    changeProductQty({
      ...item,
      quantity: item?.quantity - 1,
    })
  }, [item, changeProductQty, onChangeQty])

  const incrementQty = useCallback(() => {
    if (!item || item?.quantity >= stock) return

    if (onChangeQty) {
      onChangeQty(item.quantity + 1)
      return
    }

    changeProductQty({
      ...item,
      quantity: item?.quantity + 1,
    })
  }, [item, changeProductQty, stock, onChangeQty])

  const handleRemoveItem = useCallback(() => {
    if (!!buyNowItem || !item) return
    removeFromCart(item)
  }, [item, removeFromCart, buyNowItem])

  useEffect(() => {
    if (!item) return

    if (item.quantity > stock && stock !== 0) {
      if (onChangeQty) {
        onChangeQty(stock)
      } else {
        changeProductQty({ ...item, quantity: stock })
      }
    }
  }, [item, stock, onChangeQty, toggleSelectItem, changeProductQty])

  if (!item) return null

  return (
    <li className="flex gap-x-1 py-4">
      {isCheckout ? null : (
        <Checkbox
          checked={item.isSelected}
          disabled={stock === 0}
          aria-label={stock === 0 ? "Not enought stock" : "Toggle Select"}
          onCheckedChange={() => toggleSelectItem(item)}
          title={item.isSelected ? "Deselect" : "Select"}
        />
      )}
      <div className="flex w-full gap-x-2">
        <div className="relative size-20 shrink-0 overflow-hidden rounded-md bg-muted sm:size-28">
          <Image
            fill
            src={product.images[0]?.url}
            alt={product.title}
            className="rounded-md transition-transform duration-300 hover:scale-110 object-cover"
          />
        </div>
        <div className="flex w-full items-center justify-between gap-x-2 sm:gap-x-4">
          <div className="flex h-full flex-col justify-between gap-y-1">
            <Link
              href={`/product/${product.id}`}
              onClick={() => onOpenChange(false)}
              className="line-clamp-1 text-sm font-medium hover:underline hover:underline-offset-4 sm:line-clamp-2"
            >
              {product.title}
            </Link>

            {stock === 0 && (
              <p className="text-[10px] text-destructive">Out of stock</p>
            )}

            {combination && combination.combinationVariantValues.length > 0 && (
              <div className="flex max-w-[240px] flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                {combination.combinationVariantValues.map(
                  ({ variantValue }, index) => {
                    const isColor = isValueColor(variantValue.value)

                    return (
                      <div
                        key={variantValue.id + index}
                        className="flex items-center gap-x-1"
                      >
                        <Tooltip delayDuration={100}>
                          <TooltipTrigger>
                            <div
                              style={{
                                backgroundColor: isColor
                                  ? variantValue.value
                                  : undefined,
                              }}
                              className={cn(
                                "flex items-center",
                                isColor && "size-4 rounded-full border",
                              )}
                            >
                              {!isColor && <span>{variantValue.value}</span>}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>{variantValue.name}</TooltipContent>
                        </Tooltip>

                        {combination.combinationVariantValues.length - 1 >
                          index && <X className="size-3 shrink-0" />}
                      </div>
                    )
                  },
                )}
              </div>
            )}

            <div className="flex w-fit items-center rounded-full border py-0.5 sm:py-1">
              <button
                onClick={decrementQty}
                disabled={item.quantity <= 1}
                aria-label="Decrement Qty"
                className="px-1 disabled:cursor-not-allowed disabled:opacity-50 sm:px-2"
              >
                <Minus className="size-4" />
              </button>
              <p className="border-x px-2 text-xs sm:px-3 sm:text-sm">
                {item.quantity}
              </p>
              <button
                onClick={incrementQty}
                disabled={item.quantity >= stock}
                aria-label="Increment Qty"
                className="px-1 disabled:cursor-not-allowed disabled:opacity-50 sm:px-2"
              >
                <Plus className="size-4" />
              </button>
            </div>
          </div>
          <div className="flex h-full flex-col items-end justify-between">
            <h2 className="text-sm font-medium">
              {formatPrice(price * item.quantity)}
            </h2>
            {!!buyNowItem ? null : (
              <button
                onClick={handleRemoveItem}
                className="flex items-center text-sm text-muted-foreground transition-colors hover:text-destructive"
              >
                <Trash2 className="size-3.5 sm:mr-2" />
                <span className="sr-only sm:not-sr-only">Remove</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </li>
  )
}

CartItem.Skeleton = function CartItemSkeleton({
  checkbox = true,
}: {
  checkbox?: boolean
}) {
  return (
    <div className="flex w-full gap-x-1 py-4">
      {checkbox && <Skeleton className="size-5 shrink-0 rounded" />}
      <div className="flex w-full gap-x-2">
        <Skeleton className="size-20 shrink-0 sm:size-28" />
        <div className="flex w-full items-center justify-between gap-x-2">
          <div className="flex h-full w-full flex-col justify-between gap-y-1">
            <Skeleton className="h-4 w-full rounded md:w-2/4" />
            <Skeleton className="h-3 w-full max-w-36 rounded" />
            <Skeleton className="h-4 w-full max-w-20 rounded-full sm:h-6 sm:max-w-24" />
          </div>

          <div className="flex h-full flex-col items-end justify-between">
            <Skeleton className="h-4 w-24 rounded" />
            <Skeleton className="h-4 w-full max-w-4 rounded sm:max-w-24" />
          </div>
        </div>
      </div>
    </div>
  )
}
