import * as z from "zod"

import { couponCodeAmountTypeEnum } from "@/db/schema"
import { preprocessStringToNumber } from ".."

export const couponSchema = z
  .object({
    code: z
      .string({ required_error: "Coupon code is required" })
      .min(1, "Coupon code is required")
      .min(3, "Coupon code must be atleast 3 characters")
      .max(32, "Coupon code must be less than 32 characters"),
    amountType: z.enum(couponCodeAmountTypeEnum.enumValues),
    amount: z.preprocess(
      preprocessStringToNumber,
      z
        .number({
          required_error: "Please enter an amount",
          invalid_type_error: "Invalid amount",
        })
        .min(0, "Amount must be greater than 0"),
    ),
    usageLimit: z.preprocess(
      preprocessStringToNumber,
      z
        .number({
          required_error: "Please enter an amount",
          invalid_type_error: "Invalid amount",
        })
        .min(0, "Limit must be greater than 0")
        .int("Invalid limit")
        .optional(),
    ),
    minOrderAmount: z.preprocess(
      preprocessStringToNumber,
      z
        .number({
          required_error: "Please enter an amount",
          invalid_type_error: "Invalid amount",
        })
        .min(0, "Amount must be greater than 0"),
    ),
    validityDuration: z
      .object({
        from: z.coerce.date().optional(),
        to: z.coerce.date().optional(),
      })
      .optional(),
  })
  .transform((data, ctx) => {
    if (data.amountType === "percentage") {
      if (data.amount < 0 || data.amount > 100) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Percentage amount must be a number between 1 and 100",
          path: ["amount"],
        })
      }
    }

    if (data.amountType === "fixed amount") {
      if (data.amount! > data.minOrderAmount) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Amount must be less than or equal min order amount",
          path: ["amount"],
        })
      }
    }

    return data
  })

export type CouponSchema = z.infer<typeof couponSchema>

export const applyCouponCodeSchema = z.object({
  code: z
    .string({ required_error: "Please enter a coupon code" })
    .min(1, "Please enter a coupon code"),
})

export type ApplyCouponCodeSchema = z.infer<typeof applyCouponCodeSchema>
