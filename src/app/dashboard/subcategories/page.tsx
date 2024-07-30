import { Suspense } from "react"

import { getSubcategories } from "@/queries/category"
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton"

import { CreateSubcategoryButton } from "../_components/action-buttons"
import { SubcategoriesTable } from "../_components/tables/subcategories-table"

export default function SubcategoriesPage() {
  const subcategoriesPromise = getSubcategories()

  return (
    <div className="space-y-6">
      <div className="flex w-full items-center justify-between">
        <h1 className="text-2xl font-semibold sm:text-3xl">Subcategories</h1>
        <CreateSubcategoryButton />
      </div>

      <Suspense
        fallback={
          <DataTableSkeleton
            columnCount={5}
            searchableColumnCount={1}
            filterableColumnCount={0}
            shrinkZero
            withPagination={false}
            cellWidths={[
              { width: "1.25rem", height: "1.25rem" },
              { width: "20rem" },
              { width: "20rem" },
              { width: "10rem" },
              { width: "10rem" },
            ]}
          />
        }
      >
        <SubcategoriesTable subcategoriesPromise={subcategoriesPromise} />
      </Suspense>
    </div>
  )
}
