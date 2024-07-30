import { Suspense } from "react"
import { notFound } from "next/navigation"

import { getSession } from "@/utils/auth"
import { Skeleton } from "@/components/ui/skeleton"
import { getProductById, isFavouriteProduct } from "@/queries/product"
import { canReviewProduct, getProductReviews } from "@/queries/review"

import { ProductDetails } from "../../_components/product-details"
import { ProductReviews } from "../../_components/product-details/product-reviews"
import { ProductDescription } from "../../_components/product-details/product-description"

type SingleProductPageParams = {
  params: {
    productId: string
  }
  searchParams: {
    review_page?: string
  }
}

export default async function SingleProductPage({
  params: { productId },
  searchParams,
}: SingleProductPageParams) {
  const data = await getProductById(productId)
  const { user } = await getSession()

  if (!data || !data.product) notFound()

  const isFavourite = await isFavouriteProduct(productId, user?.id)

  const reviewPage = Number(searchParams.review_page ?? "1")
  const reviewsPromise = getProductReviews(reviewPage, productId)
  const canReviewPromise = canReviewProduct(productId)

  return (
    <div className="space-y-8">
      <ProductDetails data={data} isFavourite={isFavourite} />
      <Suspense fallback={<Skeleton className="h-[600px] w-full" />}>
        <ProductReviews
          productRating={data.product.rating}
          reviewsPromise={reviewsPromise}
          canReviewPromise={canReviewPromise}
          userId={user?.id}
        />
      </Suspense>
      <ProductDescription description={data.product.longDescription} />
    </div>
  )
}
