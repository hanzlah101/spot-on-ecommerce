"use client"

import Link from "next/link"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { ArrowRight, Check, Info, ShieldQuestion, X } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAction } from "next-safe-action/hooks"
import type { User } from "lucia"

import type { getLastOrder } from "@/queries/order"
import { Input } from "@/components/ui/input"
import { CartItem } from "../../../_components/cart-item"
import { getCheckoutProducts } from "@/queries/product"
import { useCartStore } from "@/stores/use-cart-store"
import { EmptyCartIcon } from "@/components/icons/empty-cart"
import { Button } from "@/components/ui/button"
import { useModifiedUrl } from "@/hooks/use-modified-url"
import { Skeleton } from "@/components/ui/skeleton"
import { formatPrice, getProductPrice } from "@/utils"
import { DEFAULT_SHIPPING_PRICE } from "@/utils/constants"
import { verifyCouponCode } from "@/actions/coupon"
import { parseError } from "@/utils/error"
import { Badge } from "@/components/ui/badge"
import { OrderInfoForm } from "./order-info-form"

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"

import {
  ApplyCouponCodeSchema,
  applyCouponCodeSchema,
} from "@/utils/validations/coupon"

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

type ConfirmOrderFormProps = {
  user: User | null
  lastOrder: Awaited<ReturnType<typeof getLastOrder>>
}

export function ConfirmOrderForm({ user, lastOrder }: ConfirmOrderFormProps) {
  const [appliedCoupon, setAppliedCoupon] = useState({
    discount: 0,
    couponCode: "",
  })

  const router = useRouter()
  const pathname = usePathname()

  const searchParams = useSearchParams()
  const mode = (searchParams.get("mode") ?? "cart") as "cart" | "buy-now"
  const productId = searchParams.get("productId")
  const combinationId = searchParams.get("combinationId") ?? undefined
  const qty = searchParams.get("qty")

  const { cart } = useCartStore()
  const { modifyUrl } = useModifiedUrl()

  const selectedCartItems = useMemo(() => {
    return cart
      .filter((i) => i.isSelected)
      .map(({ isSelected: _, ...item }) => ({ ...item }))
  }, [cart])

  const quantity = Number(qty ?? "1")

  const { isFetching, data, refetch } = useQuery({
    queryKey: [
      "checkout-items",
      mode,
      productId,
      combinationId,
      cart.map((item) => ({
        productId: item.productId,
        combinationId: item.combinationId,
        isSelected: item.isSelected,
      })),
    ],
    queryFn: async () =>
      await getCheckoutProducts({
        cartItems: selectedCartItems,
        combinationId,
        productId: productId ?? "",
        quantity: Number(quantity ?? "1"),
        mode: mode ?? "cart",
      }),
  })

  const onChangeQty = useCallback(
    (qty: number) => {
      const newUrl = modifyUrl({ qty: String(qty) })
      router.push(newUrl, { scroll: false })
    },
    [modifyUrl, router],
  )

  const subTotal = useMemo(() => {
    if (!data) return 0

    return data
      .map((product) => {
        const cartItem = cart.find(
          (i) =>
            i.productId === product.id &&
            product.combination?.id === i.combinationId,
        )

        if (product?.combination) {
          const { price } = getProductPrice(
            product?.combination.price,
            product?.combination.salePrice,
            product?.combination.saleDuration,
          )

          if (mode === "buy-now") {
            return price * quantity
          } else {
            if (!cartItem) return 0
            return price * cartItem?.quantity
          }
        } else {
          const { price } = getProductPrice(
            product?.price ?? 0,
            product?.salePrice,
            product?.saleDuration,
          )

          if (mode === "buy-now") {
            return price * quantity
          } else {
            if (!cartItem) return 0
            return price * cartItem?.quantity
          }
        }
      })
      .reduce((acc, curr) => acc + curr, 0)
  }, [data, cart, mode, quantity])

  const total = useMemo(() => subTotal + DEFAULT_SHIPPING_PRICE, [subTotal])

  const discountedTotal = useMemo(
    () => subTotal + DEFAULT_SHIPPING_PRICE - appliedCoupon.discount,
    [subTotal, appliedCoupon],
  )

  const prevTotalRef = useRef(total)

  const buyNowProduct = useMemo(() => data?.[0], [data])

  const form = useForm<ApplyCouponCodeSchema>({
    resolver: zodResolver(applyCouponCodeSchema),
    defaultValues: {
      code: "",
    },
  })

  const {
    execute: verifyCoupon,
    isExecuting: isApplyingCoupon,
    hasSucceeded: isValidCoupon,
  } = useAction(verifyCouponCode, {
    onError({ error }) {
      const message = parseError(error)
      form.setError("code", { message })
    },
    onSuccess({ data, input }) {
      if (data) {
        setAppliedCoupon({
          discount: data.discountAmount,
          couponCode: input.code,
        })
      }
    },
  })

  const onSubmit = form.handleSubmit((values) => {
    setAppliedCoupon({
      discount: 0,
      couponCode: "",
    })
    verifyCoupon({ ...values, orderAmount: total })
  })

  useEffect(() => {
    refetch()
  }, [pathname, refetch])

  useEffect(() => {
    const shouldRevalidateCoupon =
      !!appliedCoupon.couponCode &&
      appliedCoupon.discount > 0 &&
      total !== prevTotalRef.current

    if (shouldRevalidateCoupon) {
      setAppliedCoupon({
        discount: 0,
        couponCode: "",
      })
      verifyCoupon({ code: appliedCoupon.couponCode, orderAmount: total })
    }

    prevTotalRef.current = total
  }, [appliedCoupon, total, verifyCoupon])

  useEffect(() => {
    if (mode === "buy-now" && quantity <= 0) {
      onChangeQty(1)
    }
  }, [onChangeQty, mode, quantity])

  if (mode === "buy-now" && !productId) {
    return null
  }

  if (isFetching) {
    return (
      <div className="grid h-full min-h-screen grid-cols-1 gap-5 pt-12 lg:grid-cols-[60%_40%] xl:grid-cols-[65%_35%]">
        <Skeleton className="h-full w-full rounded-lg" />
        <Skeleton className="h-full w-full rounded-lg" />
      </div>
    )
  }

  if (!data || !data.length) {
    return (
      <div className="flex h-full flex-1 flex-col items-center justify-center gap-y-3 py-12">
        <EmptyCartIcon className="size-64" />
        <h1 className="text-center text-xl uppercase">Your cart is empty!</h1>
        <Link href="/search">
          <Button className="group" variant={"outline"}>
            View our latest collection
            <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      </div>
    )
  }

  if (mode === "buy-now") {
    const stock = !!buyNowProduct?.combination
      ? buyNowProduct?.combination.stock
      : (buyNowProduct?.stock ?? 0)

    if (stock === 0 || !buyNowProduct) {
      return (
        <div className="flex h-full flex-1 flex-col items-center justify-center gap-y-3">
          <ShieldQuestion className="size-8 text-muted-foreground" />
          <h1 className="text-center text-lg">
            This{" "}
            {!!buyNowProduct?.combination ? "variant of product" : "product"} is
            unavailable right now
          </h1>
          <Link href={`/product/${buyNowProduct?.id}`}>
            <Button variant={"outline"}>View Product</Button>
          </Link>
        </div>
      )
    }
  }

  return (
    <div className="grid grid-cols-1 gap-5 pt-12 lg:grid-cols-[60%_40%] xl:grid-cols-[65%_35%]">
      <OrderInfoForm
        total={discountedTotal}
        user={user}
        lastOrder={lastOrder}
        couponCode={appliedCoupon.couponCode}
        items={data.map((prod) => ({
          productId: prod.id,
          combinationId: prod.combination?.id,
          quantity:
            mode === "buy-now"
              ? quantity
              : (selectedCartItems.find(
                  (i) =>
                    i.productId === prod.id &&
                    i.combinationId === prod.combination?.id,
                )?.quantity ?? 1),
        }))}
      />

      <Card className="h-fit">
        <CardHeader>
          <CardTitle>Summary</CardTitle>
          <CardDescription>Whole summary of you order</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 divide-y divide-foreground/10">
          <Form {...form}>
            <form onSubmit={onSubmit}>
              <FormField
                control={form.control}
                name="code"
                disabled={isApplyingCoupon}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discount Code</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input placeholder="SUMMER20" {...field} />
                      </FormControl>
                      <Button
                        type="submit"
                        loading={isApplyingCoupon}
                        className="absolute right-1.5 top-1/2 size-7 -translate-y-1/2 p-0"
                      >
                        <Check className="size-4" />
                      </Button>
                    </div>
                    <FormMessage />
                    {isValidCoupon && appliedCoupon.couponCode && (
                      <Badge variant={"secondary"}>
                        {appliedCoupon.couponCode}
                        <X
                          className="ml-2 size-3.5 shrink-0 cursor-pointer"
                          onClick={() =>
                            setAppliedCoupon({
                              discount: 0,
                              couponCode: "",
                            })
                          }
                        />
                      </Badge>
                    )}
                  </FormItem>
                )}
              />
            </form>
          </Form>

          <div className="space-y-3.5 pt-5 text-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-muted-foreground">
                <p>Subtotal</p>
                <Tooltip delayDuration={100}>
                  <TooltipTrigger>
                    <Info className="ml-2 size-5 fill-muted-foreground text-background" />
                  </TooltipTrigger>
                  <TooltipContent className="text-start">
                    Total excluding shipping <br /> and taxes.
                  </TooltipContent>
                </Tooltip>
              </div>
              <p className="font-medium">{formatPrice(subTotal)}</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground">Shipping</p>
              <p className="font-medium">
                {formatPrice(DEFAULT_SHIPPING_PRICE)}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground">Taxes</p>
              <p className="font-medium">{formatPrice(0)}</p>
            </div>
            {isValidCoupon && appliedCoupon.discount > 0 && (
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground">Discount</p>
                <p className="font-medium text-emerald-600">
                  - {formatPrice(appliedCoupon.discount)}
                </p>
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between pt-5 text-sm">
              <p>Total</p>
              <p className="text-lg font-medium">{formatPrice(total)}</p>
            </div>

            {isValidCoupon && appliedCoupon.discount > 0 && (
              <div className="mt-3 flex items-center justify-between">
                <p>Discounted Total</p>
                <p className="text-lg font-medium text-emerald-600">
                  {formatPrice(discountedTotal)}
                </p>
              </div>
            )}
          </div>

          <ul className="list-none divide-y">
            {data.map((product, index) => (
              <CartItem
                isCheckout
                key={product.id + index}
                product={product}
                onChangeQty={mode === "buy-now" ? onChangeQty : undefined}
                buyNowItem={
                  mode === "buy-now"
                    ? {
                        productId: productId!,
                        combinationId,
                        quantity,
                        isSelected: true,
                      }
                    : undefined
                }
              />
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
