import { Suspense } from "react"

import { getCoupons } from "@/queries/coupon"
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton"

import { CreateCouponButton } from "../_components/action-buttons"
import { CouponsTable } from "../_components/tables/coupons-table"

export default function CategoriesPage() {
  const couponsPromise = getCoupons()

  return (
    <div className="space-y-6">
      <div className="flex w-full items-center justify-between">
        <h1 className="text-2xl font-semibold sm:text-3xl">Categories</h1>
        <CreateCouponButton />
      </div>

      <Suspense
        fallback={
          <DataTableSkeleton
            columnCount={9}
            searchableColumnCount={1}
            filterableColumnCount={1}
            shrinkZero
            withPagination={false}
            cellWidths={[
              { width: "1.25rem", height: "1.25rem" },
              { width: "8rem" },
              { width: "8rem" },
              { width: "8rem" },
              { width: "8rem" },
              { width: "6rem" },
              { width: "10rem" },
              { width: "8rem" },
              { width: "8rem" },
            ]}
          />
        }
      >
        <CouponsTable couponsPromise={couponsPromise} />
      </Suspense>
    </div>
  )
}
