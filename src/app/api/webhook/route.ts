import Stripe from "stripe"
import { type NextRequest } from "next/server"
import { headers } from "next/headers"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

import { stripe } from "@/utils/stripe"
import { db } from "@/db"
import { apiErrorHandler } from "@/utils/error"
import { orders } from "@/db/schema"

export const POST = apiErrorHandler(async (req: NextRequest) => {
  const body = await req.text()
  const signature = headers().get("Stripe-Signature") as string

  let event: Stripe.Event

  event = stripe.webhooks.constructEvent(
    body,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!,
  )

  const session = event.data.object as Stripe.Checkout.Session

  if (event.type === "charge.succeeded" && session.metadata) {
    await db
      .update(orders)
      .set({ paymentStatus: "paid" })
      .where(eq(orders.trackingId, session.metadata?.trackingId))

    revalidatePath(`/orders/${session.metadata.trackingId}`)
  }

  return Response.json(null, { status: 200 })
})
