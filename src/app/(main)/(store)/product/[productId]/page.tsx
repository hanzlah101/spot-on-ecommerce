import { notFound } from "next/navigation"

import { getSession } from "@/utils/auth"
import { getProductById, isFavouriteProduct } from "@/queries/product"

import { ProductDetails } from "../../_components/product-details"
import { ProductReviews } from "../../_components/product-details/product-reviews"
import { ProductDescription } from "../../_components/product-details/product-description"

type SingleProductPageParams = {
  params: {
    productId: string
  }
}

export default async function SingleProductPage({
  params: { productId },
}: SingleProductPageParams) {
  const data = await getProductById(productId)
  const { user } = await getSession()

  if (!data || !data.product) notFound()

  const isFavourite = await isFavouriteProduct(productId, user?.id)

  return (
    <div className="space-y-8">
      <ProductDetails data={data} isFavourite={isFavourite} />
      <ProductReviews productRating={data.product.rating} userId={user?.id} />
      <ProductDescription description={data.product.longDescription} />
    </div>
  )
}
