import { Suspense } from "react"

import { getOrders } from "@/queries/order"
import { OrdersList, OrdersListSkeleton } from "./_components/orders-list"

export default function OrdersPage() {
  const ordersPromise = getOrders()

  return (
    <div className="space-y-6 py-12">
      <h1 className="text-2xl font-semibold sm:text-3xl">Your Orders</h1>
      <Suspense fallback={<OrdersListSkeleton />}>
        <OrdersList ordersPromise={ordersPromise} />
      </Suspense>
    </div>
  )
}
