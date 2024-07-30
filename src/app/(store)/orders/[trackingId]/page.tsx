import { type ReactNode } from "react"
import { notFound } from "next/navigation"
import { differenceInDays, format } from "date-fns"
import {
  Calendar,
  ShieldCheck,
  Home,
  MapPin,
  Package,
  Timer,
  Truck,
  X,
  type LucideIcon,
} from "lucide-react"

import { cn, formatPrice, getOrderDate } from "@/utils"
import { getOrderByTrackingId } from "@/queries/order"
import { OrderDetailsItem } from "../_components/order-details-item"
import { OrderActionButtons } from "../_components/order-action-buttons"
import { Badge } from "@/components/ui/badge"
import { stripe } from "@/utils/stripe"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  Timeline,
  TimelineItem,
  TimelineConnector,
  TimelineContent,
  TimelineDescription,
  TimelineHeader,
  TimelineIcon,
  TimelineTime,
  TimelineTitle,
} from "@/components/ui/timeline"

export type OrderPageProps = {
  params: {
    trackingId: string
  }
  searchParams: {
    payment_intent?: string
  }
}

export default async function OrderPage({
  params: { trackingId },
  searchParams: { payment_intent },
}: OrderPageProps) {
  const order = await getOrderByTrackingId(trackingId)

  if (!order) notFound()

  if (payment_intent) {
    const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent)

    if (
      !paymentIntent.metadata.trackingId ||
      paymentIntent.metadata.trackingId !== trackingId
    ) {
      notFound()
    }
  }

  const orderDate = getOrderDate(order)
  const isDispatched =
    order.status === "dispatched" ||
    order.status === "delivered" ||
    order.status === "shipped"

  const isShipped = order.status === "shipped" || order.status === "delivered"
  const isDelivered = order.status === "delivered"
  const isOnHold = order.status === "on hold"
  const isCancelled = order.status === "cancelled"

  const remainingDays = differenceInDays(order.estDeliveryDate, new Date())

  return (
    <div className="space-y-6 py-8">
      <div>
        <h1 className="text-xl font-semibold">
          Track the delivery of order{" "}
          <span className="italic text-muted-foreground">
            {order.trackingId}
          </span>
        </h1>
        <p className="text-sm text-muted-foreground">
          Your order is {order.status}
        </p>
      </div>

      <OrderActionButtons order={order} />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <OrderInfoCard
          icon={Calendar}
          value={format(order.estDeliveryDate, "LLL dd, yyyy")}
          title={order.status === "cancelled" ? "Cancelled" : "Delivery Date"}
          description={
            order.status === "cancelled"
              ? `Cancelled${order.cancelledAt ? " on " + format(order.cancelledAt, "hh:mm - LLL dd, yyyy") : ""}`
              : order.status === "delivered"
                ? `Delivered${order.deliveredAt ? " on " + format(order.deliveredAt, "LLL dd, yyyy") : ""}`
                : remainingDays === 0
                  ? "Will be delivered today"
                  : `Within ${remainingDays} days`
          }
        />

        <OrderInfoCard
          title="Order Status"
          icon={ShieldCheck}
          value={
            <span
              className={cn(
                "capitalize",
                order.status === "cancelled"
                  ? "text-destructive"
                  : order.status === "delivered" && "text-emerald-600",
              )}
            >
              {order.status}
            </span>
          }
          description={
            orderDate
              ? format(orderDate, "LLL dd, yyyy")
              : `Ordered on ${format(order.createdAt, "hh:mm - LLL dd, yyyy")}`
          }
        />

        <OrderInfoCard
          title="Shipping Address"
          icon={MapPin}
          value={`${order.city}, ${order.state}`}
          description={order.streetAddress}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[40%_60%]">
        <Card className="h-fit bg-accent/30">
          <CardHeader>
            <CardTitle>Order history</CardTitle>
            <CardDescription>Your order timeline & history</CardDescription>
          </CardHeader>
          <CardContent>
            <Timeline>
              {isCancelled ? (
                <TimelineItem>
                  <TimelineHeader>
                    <TimelineConnector isCompleted={!!order.shippedAt} />
                    <TimelineIcon
                      icon={X}
                      className="bg-destructive text-destructive-foreground"
                    />
                    <TimelineTitle className="text-destructive">
                      Cancelled
                    </TimelineTitle>
                    {order.cancelledAt ? (
                      <TimelineTime time={order.cancelledAt} />
                    ) : null}
                  </TimelineHeader>

                  <TimelineContent>
                    <TimelineDescription>Order cancelled</TimelineDescription>
                  </TimelineContent>
                </TimelineItem>
              ) : (
                <TimelineItem>
                  <TimelineHeader>
                    <TimelineConnector isCompleted={isDelivered} />
                    <TimelineIcon icon={Home} isCompleted={isDelivered} />
                    <TimelineTitle>Delivered</TimelineTitle>
                    {order.deliveredAt ? (
                      <TimelineTime time={order.deliveredAt} />
                    ) : null}
                  </TimelineHeader>

                  <TimelineContent>
                    <TimelineDescription>
                      {isDelivered
                        ? `Order delivered via ${order.paymentMethod}`
                        : `Order being delivered on ${format(order.estDeliveryDate, "LLL dd, yyyy")}`}
                    </TimelineDescription>
                  </TimelineContent>
                </TimelineItem>
              )}

              {isOnHold ? (
                <TimelineItem>
                  <TimelineHeader>
                    <TimelineConnector isCompleted={!!order.shippedAt} />
                    <TimelineIcon
                      icon={Timer}
                      className="bg-yellow-500 text-destructive-foreground"
                    />
                    <TimelineTitle className="text-yellow-500">
                      On hold
                    </TimelineTitle>
                  </TimelineHeader>

                  <TimelineContent>
                    <TimelineDescription>
                      Order is on hold & will be delivered on{" "}
                      {format(order.estDeliveryDate, "LLL dd, yyyy")}
                    </TimelineDescription>
                  </TimelineContent>
                </TimelineItem>
              ) : null}

              <TimelineItem>
                <TimelineHeader>
                  <TimelineConnector isCompleted={isShipped} />
                  <TimelineIcon icon={MapPin} isCompleted={isShipped} />
                  <TimelineTitle>Shipped</TimelineTitle>
                  {order.shippedAt ? (
                    <TimelineTime time={order.shippedAt} />
                  ) : null}
                </TimelineHeader>

                <TimelineContent>
                  <TimelineDescription>
                    {isShipped
                      ? isDelivered
                        ? "Order shipped"
                        : `Order shipped & will be delivered on ${format(order.estDeliveryDate, "LLL dd, yyyy")}`
                      : "Order being shipped"}
                  </TimelineDescription>
                </TimelineContent>
              </TimelineItem>

              <TimelineItem>
                <TimelineHeader>
                  <TimelineConnector isCompleted={isDispatched} />
                  <TimelineIcon icon={Truck} isCompleted={isDispatched} />
                  <TimelineTitle>Dispatched</TimelineTitle>
                  {order.dispatchedAt ? (
                    <TimelineTime time={order.dispatchedAt} />
                  ) : null}
                </TimelineHeader>

                <TimelineContent>
                  <TimelineDescription>
                    {isDispatched
                      ? "Order dispatched"
                      : "Order being dispatched"}
                  </TimelineDescription>
                </TimelineContent>
              </TimelineItem>

              <TimelineItem>
                <TimelineHeader>
                  <TimelineIcon icon={Package} isCompleted />
                  <TimelineTitle>Confirmed</TimelineTitle>
                  <TimelineTime time={order.createdAt} />
                </TimelineHeader>
                <TimelineContent>
                  <TimelineDescription>
                    Order placed tracking id: {order.trackingId}
                  </TimelineDescription>
                </TimelineContent>
              </TimelineItem>
            </Timeline>
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Ordered items</CardTitle>
            <CardDescription>
              Details of the items you have ordered
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="mb-6 list-none space-y-4 divide-y">
              {order.orderItems.map((item, index) => (
                <OrderDetailsItem
                  index={index}
                  key={item.id}
                  orderItem={item}
                />
              ))}
            </ul>

            <ul className="space-y-4 border-t pt-4">
              <li className="flex items-center justify-between border-b pb-4 text-lg">
                <p className="font-medium">Payment Status</p>
                <Badge
                  className="capitalize"
                  variant={
                    order.paymentStatus === "paid" ? "success" : "destructive"
                  }
                >
                  {order.paymentStatus}
                </Badge>
              </li>

              <li className="flex items-center justify-between">
                <p className="text-muted-foreground">Subtotal</p>
                <p className="font-medium">{formatPrice(order.subtotal)}</p>
              </li>
              <li className="flex items-center justify-between">
                <p className="text-muted-foreground">Shipping Fee</p>
                <p className="font-medium">{formatPrice(order.shippingFee)}</p>
              </li>
              <li className="flex items-center justify-between">
                <p className="text-muted-foreground">Taxes</p>
                <p className="font-medium">{formatPrice(order.taxes)}</p>
              </li>
              {!!order.discount && order.discount > 0 && (
                <li className="flex items-center justify-between">
                  <p className="text-muted-foreground">Discount</p>
                  <p className="font-medium text-emerald-600">
                    - {formatPrice(order.discount)}
                  </p>
                </li>
              )}
              <li className="flex items-center justify-between border-t py-4 text-lg">
                <p className="font-medium">Total</p>
                <p className="font-semibold">
                  {formatPrice(
                    order.subtotal +
                      order.shippingFee +
                      order.taxes -
                      (order.discount ?? 0),
                  )}
                </p>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {order.status !== "cancelled" && (
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold sm:text-3xl">
            Thanks for your order!
          </h1>
          <p className="text-sm text-muted-foreground md:text-base">
            We&apos;ll keep you updated via phone calls & emails
          </p>
        </div>
      )}
    </div>
  )
}

type OrderInfoCardProps = {
  title: string
  value: ReactNode
  description: string
  icon: LucideIcon
}

function OrderInfoCard({
  title,
  value,
  description,
  icon: Icon,
}: OrderInfoCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="size-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-lg font-bold md:text-xl">{value}</div>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}
