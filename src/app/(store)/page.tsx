import { Suspense } from "react"

import { getFeaturedProducts } from "@/queries/product"
import { HeroSection } from "./_components/store-hero"
import { FeaturedProducts } from "./_components/featured-products"
import { DesktopCategoriesMenu } from "./_components/store-navbar/categories-menu"
import { getCategories, getSubcategories } from "@/queries/category"
import { ProductReelSkeleton } from "./_components/product-reel"

export default function HomePage() {
  const featuredProductsPromise = getFeaturedProducts()
  const categoriesPromise = getCategories()
  const subcategoriesPromise = getSubcategories()

  return (
    <>
      <DesktopCategoriesMenu
        categoriesPromise={categoriesPromise}
        subcategoriesPromise={subcategoriesPromise}
      />

      <HeroSection />
      <div className="mt-12 w-full">
        <h1 className="text-2xl font-semibold sm:text-3xl">
          Featured Products
        </h1>
        <Suspense
          fallback={
            <div className="mt-8 grid w-full grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6">
              <ProductReelSkeleton length={8} />
            </div>
          }
        >
          <FeaturedProducts featuredProductsPromise={featuredProductsPromise} />
        </Suspense>
      </div>
    </>
  )
}
