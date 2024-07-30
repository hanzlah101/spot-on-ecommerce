import Link from "next/link"
import Image from "next/image"
import { Truck } from "lucide-react"

import { cn } from "@/utils"
import { getOrders } from "@/queries/order"
import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default async function OrdersPage() {
  const orders = await getOrders()

  return (
    <div className="space-y-6 py-12">
      <h1 className="text-2xl font-semibold sm:text-3xl">Your Orders</h1>
      <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {orders.map((order) => (
          <Card key={order.id} className="h-fit">
            <CardHeader>
              <CardTitle>Order: {order.trackingId}</CardTitle>
              <CardDescription>Your order is {order.status}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                className={cn(
                  "grid gap-3",
                  order.orderItems.length === 1 ? "grid-cols-1" : "grid-cols-2",
                )}
              >
                {order.orderItems.slice(0, 3).map((item) => {
                  const Comp = item.productId ? Link : "div"
                  const imageUrl = !!item.product?.images?.length
                    ? item.product?.images.sort((a, b) => a.order - b.order)[0]
                        .url
                    : item.imageUrl

                  return (
                    <Comp key={item.id} href={`/prdoduct/${item.productId}`}>
                      <div className="relative aspect-square w-full overflow-hidden rounded-md transition-opacity hover:opacity-80">
                        <Image fill src={imageUrl} alt={""} />
                      </div>
                    </Comp>
                  )
                })}

                {order.orderItems.length > 3 && (
                  <div className="flex aspect-square w-full items-center justify-center rounded-md bg-muted text-lg">
                    + {order.orderItems.length - 3}
                  </div>
                )}
              </div>

              <Link
                href={`/orders/${order.trackingId}`}
                className={buttonVariants({ size: "sm", className: "w-full" })}
              >
                <Truck className="mr-2 size-4" />
                Track Order
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
