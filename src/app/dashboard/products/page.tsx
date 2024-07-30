import Link from "next/link"
import { Suspense } from "react"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { getDashboardProducts } from "@/queries/product"
import { SearchParams } from "@/utils/types"
import { getProductsSchema } from "@/utils/validations/product"
import { ProductsTable } from "./_components/products-table"
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton"

type ProductsPageProps = {
  searchParams: SearchParams
}

export default function ProductsPage({ searchParams }: ProductsPageProps) {
  const search = getProductsSchema.parse(searchParams)
  const productsPromise = getDashboardProducts(search)

  // TODO: add range picker

  return (
    <div className="space-y-6">
      <div className="flex w-full items-center justify-between">
        <h1 className="text-2xl font-semibold sm:text-3xl">Products</h1>
        <Link href={"/dashboard/products/create"}>
          <Button variant={"outline"}>
            <Plus className="mr-2 size-5" />
            Create Product
          </Button>
        </Link>
      </div>

      <Suspense
        fallback={
          <DataTableSkeleton
            columnCount={9}
            searchableColumnCount={0}
            filterableColumnCount={1}
            shrinkZero
            cellWidths={[
              { width: "1.25rem", height: "1.25rem" },
              { width: "5rem", height: "5rem" },
              { width: "25rem" },
              { width: "5rem" },
              { width: "5rem" },
              { width: "5rem" },
              { width: "5rem" },
              { width: "8rem" },
              { width: "8rem" },
            ]}
          />
        }
      >
        <ProductsTable productsPromise={productsPromise} />
      </Suspense>
    </div>
  )
}
