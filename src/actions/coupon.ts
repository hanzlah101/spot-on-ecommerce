"use server"

import { z } from "zod"
import { revalidateTag } from "next/cache"
import { eq, inArray } from "drizzle-orm"
import { isAfter, isBefore, isValid } from "date-fns"

import { db } from "@/db"
import { formatPrice } from "@/utils"
import { couponCodes } from "@/db/schema"
import { action, adminAction } from "@/utils/action"
import { ActionError } from "@/utils/error"
import { applyCouponCodeSchema, couponSchema } from "@/utils/validations/coupon"

export const createCoupon = adminAction
  .schema(couponSchema)
  .action(async ({ parsedInput }) => {
    await db
      .insert(couponCodes)
      .values(parsedInput)
      .catch((e) => {
        if (e.code === "23505") {
          throw new ActionError("CONFLICT", "Coupon code already exists")
        } else {
          throw e
        }
      })

    revalidateTag("coupon-codes")
  })

export const updateCoupon = adminAction
  .schema(couponSchema.and(z.object({ couponId: z.string().min(1).cuid2() })))
  .action(async ({ parsedInput: { couponId, ...input } }) => {
    await db
      .update(couponCodes)
      .set(input)
      .where(eq(couponCodes.id, couponId))
      .catch((e) => {
        if (e.code === "23505") {
          throw new ActionError("CONFLICT", "Coupon code already exists")
        } else {
          throw e
        }
      })

    revalidateTag("coupon-codes")
  })

export const verifyCouponCode = action
  .schema(applyCouponCodeSchema.extend({ orderAmount: z.number().min(0) }))
  .action(async ({ parsedInput: { code, orderAmount } }) => {
    const coupon = await db.query.couponCodes.findFirst({
      where: (coupons, { eq }) => eq(coupons.code, code),
    })

    if (!coupon) {
      throw new ActionError("NOT_FOUND", "Invalid coupon code")
    }

    if (coupon.validityDuration) {
      const now = new Date()
      const { from, to } = coupon.validityDuration

      if (from && !isValid(new Date(from)) && !isAfter(now, new Date(from))) {
        throw new ActionError("FORBIDDEN", "Invalid coupon code")
      }

      if (to && !isValid(new Date(to)) && !isBefore(now, new Date(to))) {
        throw new ActionError("FORBIDDEN", "Coupon has expired")
      }
    }

    if (orderAmount < coupon.minOrderAmount) {
      throw new ActionError(
        "FORBIDDEN",
        `Order must be atleast ${formatPrice(coupon.minOrderAmount)} for this coupon`,
      )
    }

    if (coupon?.usageLimit && coupon?.usageLimit <= 0) {
      throw new ActionError("FORBIDDEN", "Coupon has expired")
    }

    if (coupon.amountType === "percentage") {
      return { discountAmount: orderAmount * (coupon.amount / 100) }
    } else {
      return { discountAmount: coupon.amount }
    }
  })

export const deleteCouponCodes = adminAction
  .schema(z.object({ ids: z.string().min(1).cuid2().array().min(1) }))
  .action(async ({ parsedInput: { ids } }) => {
    await db.delete(couponCodes).where(inArray(couponCodes.id, ids))
    revalidateTag("coupon-codes")
  })
