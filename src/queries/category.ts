"use server"

import { eq } from "drizzle-orm"
import {
  unstable_cache as cache,
  unstable_noStore as noStore,
} from "next/cache"

import { db } from "@/db"
import { categories, subcategories } from "@/db/schema"

export async function getCategories() {
  return await cache(
    async () => {
      return db.select().from(categories)
    },
    ["categories"],
    {
      revalidate: 60 * 60 * 24, // every 24 hours
      tags: ["categories"],
    },
  )()
}

export async function getSubcategories() {
  return await cache(
    async () => {
      return db.query.subcategories.findMany({
        with: {
          category: {
            columns: {
              id: true,
              name: true,
            },
          },
        },
      })
    },
    ["subcategories"],
    {
      revalidate: 60 * 60 * 24, // every 24 hours
      tags: ["subcategories"],
    },
  )()
}

export async function getSubcategoriesByCategoryId(categoryId: string) {
  noStore()

  if (!categoryId) return []

  try {
    const data = db
      .select()
      .from(subcategories)
      .where(eq(subcategories.categoryId, categoryId))

    return data
  } catch (error) {
    return []
  }
}

export async function getCategoryById(categoryId?: string) {
  if (!categoryId) return null

  try {
    const [category] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, categoryId))

    return category ?? null
  } catch (error) {
    return null
  }
}

export async function getSubcategoryById(subcategoryId?: string) {
  if (!subcategoryId) return null

  try {
    const [subcategory] = await db
      .select()
      .from(subcategories)
      .where(eq(subcategories.id, subcategoryId))

    return subcategory ?? null
  } catch (error) {
    return null
  }
}
