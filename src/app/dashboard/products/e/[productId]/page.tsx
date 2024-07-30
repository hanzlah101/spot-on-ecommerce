import { verifyAdmin } from "@/utils/auth"
import { notFound } from "next/navigation"
import { ProductForm } from "../../_components/product-form"
import { getEditProduct } from "@/queries/product"

type UpdateProductPageProps = {
  params: {
    productId: string
  }
}

export default async function UpdateProductPage({
  params: { productId },
}: UpdateProductPageProps) {
  const { user } = await verifyAdmin()

  const product = await getEditProduct(productId)

  if (!product) notFound()

  return (
    <div className="max-w-dashboard-wrapper space-y-6">
      <h1 className="text-2xl font-semibold sm:text-3xl">
        Update: <span className="text-muted-foreground">{product.title}</span>
      </h1>
      <ProductForm product={product} userRole={user.role} />
    </div>
  )
}
