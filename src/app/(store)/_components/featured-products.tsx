"use client"

import { use } from "react"

import { ProductReel } from "./product-reel"
import type { getFeaturedProducts } from "@/queries/product"

type FeaturedProductsProps = {
  featuredProductsPromise: ReturnType<typeof getFeaturedProducts>
}

export function FeaturedProducts({
  featuredProductsPromise,
}: FeaturedProductsProps) {
  const featuredProducts = use(featuredProductsPromise)

  return (
    <div className="mt-8 grid w-full grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6">
      {featuredProducts.map((product) => (
        <ProductReel key={product.id} product={product} />
      ))}
    </div>
  )
}
