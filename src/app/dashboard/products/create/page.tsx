import { verifyAdmin } from "@/utils/auth"
import { ProductForm } from "../_components/product-form"

export default async function CreateProductPage() {
  const { user } = await verifyAdmin()

  return (
    <div className="max-w-dashboard-wrapper space-y-6">
      <h1 className="text-2xl font-semibold sm:text-3xl">Create Product</h1>
      <ProductForm userRole={user?.role} />
    </div>
  )
}
