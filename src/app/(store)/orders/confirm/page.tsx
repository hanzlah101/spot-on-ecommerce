import { notFound } from "next/navigation"

import { getLastOrder } from "@/queries/order"
import { ConfirmOrderForm } from "../_components/confirm-order"
import { getSession } from "@/utils/auth"

type CheckoutPageProps = {
  searchParams: {
    mode?: "buy-now" | "cart"
    productId?: string
  }
}

export default async function CheckoutPage({
  searchParams: { mode, productId },
}: CheckoutPageProps) {
  if (mode === "buy-now" && !productId) notFound()

  const { user } = await getSession()
  const lastOrder = await getLastOrder(user?.email)

  return <ConfirmOrderForm user={user} lastOrder={lastOrder} />
}
