import { Suspense } from "react"

import { getDashboardOrders } from "@/queries/order"
import { SearchParams } from "@/utils/types"
import { getOrdersSchema } from "@/utils/validations/order"
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton"

import { OrdersTable } from "../_components/tables/orders-table"
import { EditOrderModal } from "../_components/modals/edit-order-modal"

type OrdersPageProps = {
  searchParams: SearchParams
}

export default function OrdersPage({ searchParams }: OrdersPageProps) {
  const search = getOrdersSchema.parse(searchParams)
  const ordersPromise = getDashboardOrders(search)

  return (
    <>
      <EditOrderModal />
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold sm:text-3xl">Orders</h1>
        <Suspense
          fallback={
            <DataTableSkeleton
              columnCount={10}
              searchableColumnCount={0}
              filterableColumnCount={1}
              shrinkZero
              cellWidths={[
                { width: "1.25rem", height: "1.25rem" },
                { width: "15em", height: "3rem" },
                { width: "7rem" },
                { width: "20rem" },
                { width: "7rem" },
                { width: "7rem" },
                { width: "7rem" },
                { width: "7rem" },
                { width: "8rem" },
                { width: "8rem" },
              ]}
            />
          }
        >
          <OrdersTable ordersPromise={ordersPromise} />
        </Suspense>
      </div>
    </>
  )
}
