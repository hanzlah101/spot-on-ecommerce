"use server"

import { z } from "zod"
import { cookies } from "next/headers"
import { alphabet, generateRandomString } from "oslo/crypto"
import { createId } from "@paralleldrive/cuid2"
import { DEFAULT_SERVER_ERROR_MESSAGE } from "next-safe-action"
import { redirect } from "next/navigation"
import { TimeSpan } from "lucia"
import { createDate } from "oslo"
import { and, eq, inArray, sql } from "drizzle-orm"
import { revalidatePath, revalidateTag } from "next/cache"

import { db } from "@/db"
import { stripe } from "@/utils/stripe"
import { action, adminAction } from "@/utils/action"
import {
  deleteOrdersSchema,
  createOrderSchema,
  updateOrdersPaymentMethodStatusSchema,
  OrderInfoSchema,
  validateOrderSchema,
  editOrderSchema,
} from "@/utils/validations/order"

import { verifyCouponCode } from "./coupon"
import { getCartProducts } from "@/queries/product"
import { ActionError, parseError } from "@/utils/error"
import { getProductPrice } from "@/utils"
import {
  DEFAULT_DELIVERY_TIME,
  DEFAULT_SHIPPING_PRICE,
} from "@/utils/constants"

import { getSession } from "@/utils/auth"
import { updateManyWithDifferentValues } from "@/utils/helpers"
import {
  Order,
  couponCodes,
  orderItems,
  orders,
  productVariantCombinations,
  products,
} from "@/db/schema"

function generateOrderTrackingId() {
  return generateRandomString(12, alphabet("0-9"))
}

export async function createOrder(_data: unknown, mode: "cart" | "buy-now") {
  const trackingId = generateOrderTrackingId()
  const { error, data } = createOrderSchema.safeParse(_data)

  try {
    if (error) {
      throw new ActionError("CONFLICT", error.issues[0].message)
    }

    const { items, couponCode, paymentMethod, ...input } = data

    const { user } = await getSession()

    const { clientSecret } = await db.transaction(async (tx) => {
      const cartProducts = await getCartProducts(items)

      function getProdPrice(
        product: (typeof cartProducts)[number],
        withQty = false,
      ) {
        const { combination } = product
        const cartItem = items.find(
          (i) =>
            i.productId === product.id &&
            i.combinationId === product.combination?.id,
        )

        if (!cartItem) {
          throw new ActionError("CONFLICT", DEFAULT_SERVER_ERROR_MESSAGE)
        }

        if (combination) {
          const { price } = getProductPrice(
            combination.price,
            combination.salePrice,
            combination.saleDuration,
          )

          if (withQty) {
            return price * cartItem.quantity
          }

          return price
        } else {
          const { price } = getProductPrice(
            product.price ?? 0,
            product.salePrice,
            product.saleDuration,
          )

          if (withQty) {
            return price * cartItem.quantity
          }

          return price
        }
      }

      if (!cartProducts.length) {
        throw new ActionError(
          "FORBIDDEN",
          "You don't have selected any available product",
        )
      }

      cartProducts.map((product) => {
        if (product.combination && product.combination.stock <= 0) {
          throw new ActionError("FORBIDDEN", "This variant is out od stock")
        } else if (!product.stock || product.stock <= 0) {
          throw new ActionError("FORBIDDEN", "This product is out od stock")
        }
      })

      const subtotal = cartProducts
        .map((product) => {
          return getProdPrice(product, true)
        })
        .reduce((acc, curr) => acc + curr, 0)

      async function getCoupon() {
        if (!couponCode) {
          return { couponId: null, discountAmount: null }
        }

        const res = await verifyCouponCode({
          code: couponCode,
          orderAmount: subtotal + DEFAULT_SHIPPING_PRICE,
        })

        if (!res?.data || !res.data.discountAmount) {
          if (res?.serverError || res?.validationErrors) {
            const message = parseError(res)
            throw new ActionError("CONFLICT", message)
          }

          throw new ActionError(
            "INTERNAL_SERVER_ERROR",
            DEFAULT_SERVER_ERROR_MESSAGE,
          )
        }

        await tx
          .update(couponCodes)
          .set({ usageLimit: sql`${couponCodes.usageLimit} - 1` })
          .where(eq(couponCodes.code, couponCode))

        revalidateTag("coupon-codes")

        return res.data
      }

      const { discountAmount } = await getCoupon()

      const orderId = createId()

      await tx.insert(orders).values({
        id: orderId,
        trackingId,
        subtotal,
        paymentMethod,
        discount: discountAmount,
        shippingFee: DEFAULT_SHIPPING_PRICE,
        estDeliveryDate: DEFAULT_DELIVERY_TIME,
        userId: user?.id,
        ...input,
      })

      await tx.insert(orderItems).values(
        cartProducts.map((prod) => {
          const item = items.find(
            (item) =>
              item?.productId === prod.id &&
              item?.combinationId === prod.combination?.id,
          )

          if (!item) {
            throw new ActionError("CONFLICT", DEFAULT_SERVER_ERROR_MESSAGE)
          }

          const combinations = prod.combination
            ? prod.combination.combinationVariantValues.map(
                (cvv) => cvv.variantValue.value,
              )
            : null

          return {
            orderId,
            combinations,
            title: prod.title,
            productId: prod.id,
            quantity: item.quantity,
            price: getProdPrice(prod),
            imageUrl: prod.images.sort((a, b) => a.order - b.order)[0]?.url,
          }
        }),
      )

      const prodQtyToUpdate = cartProducts.map((p) => {
        const itemQty =
          items.find(
            (i) =>
              i?.productId === p.id && i?.combinationId === p.combination?.id,
          )?.quantity ?? 1

        return {
          id: p.id,
          stock: p.stock ? p.stock - itemQty : 0,
        }
      })

      const combinationsQtyToUpdate = cartProducts.flatMap(
        ({ id, combination }) => {
          const itemQty =
            items.find(
              (i) =>
                i?.productId === id && i?.combinationId === combination?.id,
            )?.quantity ?? 1

          if (combination) {
            return {
              id: combination.id,
              stock: combination.stock - itemQty,
            }
          } else {
            return []
          }
        },
      )

      await updateManyWithDifferentValues(tx, products, prodQtyToUpdate, "id")

      if (combinationsQtyToUpdate.length > 0) {
        await updateManyWithDifferentValues(
          tx,
          productVariantCombinations,
          combinationsQtyToUpdate,
          "id",
        )
      }

      if (paymentMethod === "credit card") {
        const amount = Math.round(
          (subtotal + DEFAULT_SHIPPING_PRICE - (discountAmount ?? 0)) * 100,
        )

        const paymentIntent = await stripe.paymentIntents.create({
          amount,
          currency: "USD",
          metadata: {
            trackingId,
          },
        })

        if (paymentIntent.client_secret === null) {
          throw new ActionError("FORBIDDEN", "Something went wrong")
        }

        return { clientSecret: paymentIntent.client_secret }
      }

      return { clientSecret: null }
    })

    if (!user) {
      cookies().set("user-email", input.email, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        expires: createDate(new TimeSpan(30, "d")),
      })
    }

    revalidatePath("/orders", "layout")
    revalidatePath(`/orders/${trackingId}`)

    if (clientSecret) {
      return { clientSecret, trackingId }
    }
  } catch (error) {
    console.error({ error })
    if (error instanceof ActionError) {
      return { error: error.message }
    } else {
      return { error: DEFAULT_SERVER_ERROR_MESSAGE }
    }
  }

  if (data.paymentMethod === "cash on delivery") {
    redirect(`/orders/${trackingId}?success=1&mode=${mode}`)
  }
}

export async function updateOrderInfo(
  input: OrderInfoSchema,
  trackingId: string,
) {
  try {
    await db
      .update(orders)
      .set(input)
      .where(
        and(eq(orders.trackingId, trackingId), eq(orders.status, "processing")),
      )

    revalidatePath(`/orders/${trackingId}`)
    return { error: null }
  } catch (error) {
    return { error: DEFAULT_SERVER_ERROR_MESSAGE }
  }
}

export const cancelOrder = action
  .schema(z.object({ trackingId: z.string().min(1) }))
  .action(async ({ parsedInput: { trackingId } }) => {
    await db
      .update(orders)
      .set({ status: "cancelled", cancelledAt: new Date() })
      .where(
        and(eq(orders.trackingId, trackingId), eq(orders.status, "processing")),
      )

    revalidatePath(`/orders/${trackingId}`)
  })

export const holdOrder = action
  .schema(z.object({ trackingId: z.string().min(1) }))
  .action(async ({ parsedInput: { trackingId } }) => {
    await db
      .update(orders)
      .set({ status: "on hold" })
      .where(
        and(eq(orders.trackingId, trackingId), eq(orders.status, "processing")),
      )

    revalidatePath(`/orders/${trackingId}`)
  })

export const unHoldOrder = action
  .schema(z.object({ trackingId: z.string().min(1) }))
  .action(async ({ parsedInput: { trackingId } }) => {
    await db
      .update(orders)
      .set({ status: "processing" })
      .where(
        and(eq(orders.trackingId, trackingId), eq(orders.status, "on hold")),
      )

    revalidatePath(`/orders/${trackingId}`)
  })

export const validateOrderByTrackingId = action
  .schema(validateOrderSchema)
  .action(async ({ parsedInput: { trackingId } }) => {
    const [order] = await db
      .select({})
      .from(orders)
      .where(eq(orders.trackingId, trackingId))

    if (!order) {
      throw new ActionError("FORBIDDEN", "No order find with this tracking id")
    }

    redirect(`/orders/${trackingId}`)
  })

type OrderDates = {
  dispatchedAt?: Date
  shippedAt?: Date
  cancelledAt?: Date
  deliveredAt?: Date
}

function updateOrderDates(status?: Order["status"], newDates?: OrderDates) {
  const now = new Date()
  const dateFields = {
    dispatchedAt: null,
    shippedAt: null,
    deliveredAt: null,
    cancelledAt: null,
  } as const

  switch (status) {
    case "processing":
      return dateFields
    case "dispatched":
      return { ...dateFields, dispatchedAt: newDates?.dispatchedAt ?? now }
    case "shipped":
      const { dispatchedAt: _, ...rest } = dateFields
      return { ...rest, shippedAt: newDates?.shippedAt ?? now }
    case "delivered":
      return { deliveredAt: newDates?.deliveredAt ?? now, cancelledAt: null }
    case "cancelled":
      return { cancelledAt: newDates?.cancelledAt ?? now, deliveredAt: null }
    case "on hold":
      return { deliveredAt: null, cancelledAt: null }
    default:
      return undefined
  }
}

export const updateOrdersPaymentMethodStatus = adminAction
  .schema(updateOrdersPaymentMethodStatusSchema)
  .action(async ({ parsedInput: { ids, status, ...input } }) => {
    const updatedOrderDates = updateOrderDates(status)

    await db
      .update(orders)
      .set({ ...input, status, ...updatedOrderDates })
      .where(inArray(orders.id, ids))
    revalidatePath("/dashboard/orders")
  })

export const editOrder = adminAction
  .schema(editOrderSchema.extend({ orderId: z.string().min(1).cuid2() }))
  .action(
    async ({
      parsedInput: {
        status,
        estDeliveryDate,
        paymentStatus,
        paymentMethod,
        orderId,
        ...input
      },
    }) => {
      const dates = updateOrderDates(status, input)

      await db
        .update(orders)
        .set({
          ...dates,
          status,
          estDeliveryDate,
          paymentStatus,
          paymentMethod,
        })
        .where(eq(orders.id, orderId))

      revalidatePath("/dashboard/orders")
    },
  )

export const deleteOrders = adminAction
  .schema(deleteOrdersSchema)
  .action(async ({ parsedInput: { ids } }) => {
    await db.delete(orders).where(inArray(orders.id, ids))
    revalidatePath("/dashboard/orders")
  })
