"use client"

import Link from "next/link"
import { useMemo } from "react"

import { PreviewProduct } from "@/utils/types"
import { formatPrice, getProductPrice } from "@/utils"
import { RatingStarsPreview } from "./rating-stars-preview"
import { Skeleton } from "@/components/ui/skeleton"
import { DirectionAwareHover } from "@/components/animations/direction-aware-hover"

type ProductReelProps = {
  product: PreviewProduct
}

export function ProductReel({ product }: ProductReelProps) {
  const { isSaleActive, price } = useMemo(() => {
    return getProductPrice(
      product.price ?? 0,
      product.salePrice,
      product.saleDuration,
    )
  }, [product])

  const images = useMemo(
    () => product.images.sort((a, b) => a.order - b.order),
    [product],
  )

  const image = images[0] ? images[0] : { url: "product-placeholder.svg" }

  return (
    <Link href={`/product/${product.id}`}>
      <div className="relative aspect-square w-full">
        <DirectionAwareHover
          imageUrl={image.url}
          childrenClassName="w-full max-w-[88%]"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-sm bg-yellow-500 px-2 py-0.5 text-sm text-white">
              {product.rating ?? 0}
            </div>
            <RatingStarsPreview
              rating={product.rating}
              starClassName="data-[state=empty]:text-neutral-400 dark:data-[state=empty]:text-neutral-400"
            />
          </div>
        </DirectionAwareHover>
      </div>
      <h2 className="mt-2 line-clamp-2 font-medium">{product.title}</h2>
      <div className="mt-1 flex items-end gap-1.5">
        <h1 className="text-xl font-semibold">{formatPrice(price)}</h1>
        {isSaleActive && (
          <p className="text-foreground/80 line-through">
            {formatPrice(product.price ?? 0)}
          </p>
        )}
      </div>
    </Link>
  )
}

export function ProductReelSkeleton({ length }: { length: number }) {
  return (
    <>
      {Array.from({ length }).map((_, index) => (
        <div key={index} className="w-full space-y-2">
          <Skeleton className="aspect-square w-full" />
          <Skeleton className="h-5 w-full rounded" />
          <Skeleton className="h-6 w-3/4 rounded" />
        </div>
      ))}
    </>
  )
}
