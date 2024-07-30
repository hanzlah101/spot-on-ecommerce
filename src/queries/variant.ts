"use server"

import { unstable_cache as cache } from "next/cache"

import { db } from "@/db"
import { variants } from "@/db/schema"
import { desc } from "drizzle-orm"

export async function getVariants() {
  return await cache(
    async () => {
      return await db.query.variants.findMany({
        with: { variantValues: true },
        orderBy: desc(variants.createdAt),
      })
    },
    ["variants"],
    {
      revalidate: 60 * 60 * 24, // every 24 hours
      tags: ["variants"],
    },
  )()
}
