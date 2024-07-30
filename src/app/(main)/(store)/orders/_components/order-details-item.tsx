"use client"

import Image from "next/image"
import Link from "next/link"
import { useMemo } from "react"

import type { OrderItem } from "@/db/schema"
import type { ProductImage } from "@/utils/types"
import { cn, formatPrice, isValueColor } from "@/utils"
import { X } from "lucide-react"

type OrderDetailsItemProps = {
  index: number
  orderItem: OrderItem & {
    product: {
      id: string
      title: string
      images: ProductImage[]
    } | null
  }
}

export function OrderDetailsItem({ orderItem, index }: OrderDetailsItemProps) {
  const image = useMemo(() => {
    if (!!orderItem.product) {
      return orderItem.product.images.sort((a, b) => a.order - b.order)[0].url
    } else {
      return orderItem.imageUrl
    }
  }, [orderItem])

  const hasProduct = useMemo(() => !!orderItem.product, [orderItem])

  const TitleComp = hasProduct ? Link : "h2"

  return (
    <li
      className={cn(
        "flex items-center justify-between gap-x-1 sm:gap-x-3",
        index !== 0 && "pt-4",
      )}
    >
      <div className="flex items-start gap-x-3">
        <div className="relative aspect-square size-24 shrink-0 overflow-hidden rounded-md bg-muted md:size-32">
          <Image
            fill
            src={image}
            alt={orderItem.title}
            className="rounded-md object-cover transition-transform hover:scale-110"
          />
        </div>
        <div className="space-y-2">
          <TitleComp
            href={`/product/${orderItem.productId}`}
            className={cn(
              "line-clamp-2 text-[19px] font-medium",
              hasProduct && "hover:underline hover:underline-offset-4",
            )}
          >
            {orderItem.product?.title ?? orderItem.title}
          </TitleComp>
          <div className="flex items-center">
            {orderItem.combinations &&
              orderItem.combinations?.length > 0 &&
              orderItem.combinations.map((combo, index) => (
                <div key={combo + index} className="flex items-center">
                  <div
                    style={{
                      backgroundColor: isValueColor(combo) ? combo : undefined,
                    }}
                    className={cn(
                      "text-xs text-muted-foreground",
                      isValueColor(combo) && "size-4 rounded-full border",
                    )}
                  >
                    {!isValueColor(combo) && combo}
                  </div>
                  {orderItem.combinations &&
                    orderItem.combinations?.length - 1 > index && (
                      <X className="mx-1 size-3 shrink-0" />
                    )}
                </div>
              ))}
          </div>
          <div className="flex items-center gap-x-1.5 text-xs">
            <span className="text-muted-foreground">Qty:</span>
            {orderItem.quantity}
          </div>
        </div>
      </div>
      <h1 className="text-lg font-semibold">
        {formatPrice(orderItem.price * orderItem.quantity)}
      </h1>
    </li>
  )
}
