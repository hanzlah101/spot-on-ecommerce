import { Suspense } from "react"

import { getVariants } from "@/queries/variant"
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton"

import { CreateVariantButton } from "../_components/action-buttons"
import { VariantsTable } from "../_components/tables/variants-table"

export default function VariantsPage() {
  const variantsPromise = getVariants()

  return (
    <div className="space-y-6">
      <div className="flex w-full items-center justify-between">
        <h1 className="text-2xl font-semibold sm:text-3xl">Variants</h1>
        <CreateVariantButton />
      </div>

      <Suspense
        fallback={
          <DataTableSkeleton
            columnCount={6}
            searchableColumnCount={1}
            filterableColumnCount={0}
            shrinkZero
            withPagination={false}
            cellWidths={[
              { width: "1.25rem", height: "1.25rem" },
              { width: "10rem" },
              { width: "10rem" },
              { width: "20rem" },
              { width: "10rem" },
              { width: "10rem" },
            ]}
          />
        }
      >
        <VariantsTable variantsPromise={variantsPromise} />
      </Suspense>
    </div>
  )
}
