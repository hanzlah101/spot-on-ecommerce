import { Suspense } from "react"

import { getCategories } from "@/queries/category"
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton"

import { CreateCategoryButton } from "../_components/action-buttons"
import { CategoriesTable } from "../_components/tables/categories-table"

export default function CategoriesPage() {
  const categoriesPromise = getCategories()

  return (
    <div className="space-y-6">
      <div className="flex w-full items-center justify-between">
        <h1 className="text-2xl font-semibold sm:text-3xl">Categories</h1>
        <CreateCategoryButton />
      </div>

      <Suspense
        fallback={
          <DataTableSkeleton
            columnCount={6}
            searchableColumnCount={1}
            filterableColumnCount={1}
            shrinkZero
            withPagination={false}
            cellWidths={[
              { width: "1.25rem", height: "1.25rem" },
              { width: "15rem" },
              { width: "15rem" },
              { width: "10rem" },
              { width: "10rem" },
              { width: "10rem" },
            ]}
          />
        }
      >
        <CategoriesTable categoriesPromise={categoriesPromise} />
      </Suspense>
    </div>
  )
}
