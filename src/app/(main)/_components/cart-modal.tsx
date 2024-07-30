"use client"

import Link from "next/link"
import { useEffect, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { usePathname } from "next/navigation"
import { ArrowRight } from "lucide-react"

import { cn, formatPrice, getProductPrice } from "@/utils"
import { Button } from "@/components/ui/button"
import { useCartModal } from "@/stores/use-cart-modal"
import { useCartStore } from "@/stores/use-cart-store"
import { getCartProducts } from "@/queries/product"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { CartItem } from "../(store)/_components/cart-item"
import { EmptyCartIcon } from "@/components/icons/empty-cart"
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

export function CartModal() {
  const { isOpen, onOpenChange } = useCartModal()
  const { cart, toggleAllSelect, removeAllProducts } = useCartStore()

  const pathname = usePathname()

  const { isFetching, data } = useQuery({
    queryKey: [
      "cart-items",
      cart.map((item) => ({
        productId: item.productId,
        combinationId: item.combinationId,
      })),
    ],
    queryFn: async () => await getCartProducts(cart),
  })

  const totalItems = useMemo(() => {
    return cart
      .map((item) => item.quantity)
      .reduce((acc, curr) => acc + curr, 0)
  }, [cart])

  const selectedItems = useMemo(() => {
    return cart.filter((item) => item.isSelected)
  }, [cart])

  const allSelected = useMemo(
    () => cart.every((item) => item.isSelected || item.quantity === 0),
    [cart],
  )

  const totalPrice = useMemo(() => {
    if (!data) return 0

    const selectedData = data.filter((item) =>
      selectedItems.some(
        (i) =>
          i.productId === item?.id && i.combinationId === item.combination?.id,
      ),
    )

    return selectedData
      .map((item) => {
        if (!item) return 0

        const { combination, ...product } = item

        const cartItem = cart.find(
          (i) =>
            i.productId === product.id && combination?.id === i.combinationId,
        )

        if (!cartItem) return 0

        if (combination) {
          const { price } = getProductPrice(
            combination.price,
            combination.salePrice,
            combination.saleDuration,
          )

          return price * cartItem.quantity
        } else {
          const { price } = getProductPrice(
            product.price ?? 0,
            product.salePrice,
            product.saleDuration,
          )

          return price * cartItem.quantity
        }
      })
      .reduce((acc, curr) => acc + curr, 0)
  }, [data, cart, selectedItems])

  const { inStockItems, outOfStockItems } = useMemo(() => {
    if (!data || !data.length) return { inStockItems: [], outOfStockItems: [] }

    const inStockItems = data.filter(
      (product) =>
        product &&
        cart.some(
          (cartItem) =>
            cartItem.productId === product.id &&
            cartItem.combinationId === product.combination?.id &&
            cartItem.quantity > 0 &&
            (product.combination
              ? product.combination.stock > 0
              : (product?.stock ?? 0) > 0),
        ),
    )

    const outOfStockItems = data.filter(
      (product) =>
        product &&
        cart.some(
          (cartItem) =>
            cartItem.productId === product.id &&
            cartItem.combinationId === product.combination?.id &&
            (product.combination
              ? product.combination.stock === 0
              : (product?.stock ?? 0) === 0),
        ),
    )

    return { inStockItems, outOfStockItems }
  }, [data, cart])

  useEffect(() => {
    onOpenChange(false)
  }, [pathname, onOpenChange])

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="h-full w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="text-start">
            Shpping Cart ({totalItems})
          </SheetTitle>
          {cart.length > 0 && (
            <div className="mt-2 flex items-center justify-between">
              <div className="flex items-center gap-x-3">
                <Checkbox
                  id="cart-select-all"
                  checked={allSelected}
                  onCheckedChange={() => toggleAllSelect()}
                />
                <Label htmlFor="cart-select-all">
                  Selected ({selectedItems.length})
                </Label>
              </div>
              <button
                onClick={removeAllProducts}
                className="text-sm text-muted-foreground transition-colors hover:text-destructive"
              >
                Clear Cart ({selectedItems.length})
              </button>
            </div>
          )}
        </SheetHeader>
        <SheetBody className="h-full py-4">
          {cart?.length > 0 ? (
            <>
              {isFetching ? (
                <div className="space-y-4 divide-y">
                  {Array.from({ length: cart.length }).map((_, index) => (
                    <CartItem.Skeleton key={index} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-y-4 divide-y-4">
                  {inStockItems.length > 0 && (
                    <ul className="list-none divide-y">
                      {inStockItems?.map((product, index) => (
                        <CartItem key={product.id + index} product={product} />
                      ))}
                    </ul>
                  )}

                  {outOfStockItems.length > 0 && (
                    <div className={cn(inStockItems.length > 0 && "pt-4")}>
                      <h3 className="font-medium text-destructive">
                        Unavailable
                      </h3>
                      <ul className="list-none divide-y">
                        {outOfStockItems?.map((product, index) => (
                          <CartItem
                            key={product.id + index}
                            product={product}
                          />
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center space-y-3">
              <EmptyCartIcon className="size-48" />
              <h1 className="text-lg font-semibold uppercase">
                Your cart is empty!
              </h1>
            </div>
          )}
        </SheetBody>
        {cart.length > 0 && (
          <SheetFooter className="-mt-4 border-t py-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium">Subotal</p>
              <p className="font-semibold">{formatPrice(totalPrice)}</p>
            </div>
            <Link
              href={"/orders/confirm?mode=cart"}
              onClick={() => onOpenChange(false)}
            >
              <Button className="group w-full">
                Checkout
                <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <p className="mt-1 text-center text-[11px] text-muted-foreground">
              All the taxes will be calculated while checkout.
            </p>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  )
}
