"use server"

import { db } from "@/db"
import { couponCodes } from "@/db/schema"
import { unstable_cache as cache } from "next/cache"

export async function getCoupons() {
  return await cache(
    async () => {
      return await db.select().from(couponCodes)
    },
    ["coupon-codes"],
    {
      tags: ["coupon-codes"],
      revalidate: 60 * 60 * 24, // every 24 hours
    },
  )()
}
