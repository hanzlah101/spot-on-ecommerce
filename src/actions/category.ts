"use server"

import { eq, inArray } from "drizzle-orm"
import { revalidateTag, unstable_noStore as noStore } from "next/cache"

import { db } from "@/db"
import { categories, subcategories } from "@/db/schema"
import { categorySchema, subcategorySchema } from "@/utils/validations/category"
import { adminAction } from "@/utils/action"
import { ActionError } from "@/utils/error"
import { z } from "zod"

export const createCategory = adminAction
  .schema(categorySchema)
  .action(async ({ parsedInput }) => {
    noStore()

    await db
      .insert(categories)
      .values(parsedInput)
      .catch((e) => {
        if (e.code === "23505") {
          throw new ActionError(
            "CONFLICT",
            "Category already exists with this name",
          )
        } else {
          throw e
        }
      })

    revalidateTag("categories")
  })

export const updateCategory = adminAction
  .schema(categorySchema.extend({ categoryId: z.string().min(1).cuid2() }))
  .action(async ({ parsedInput: { categoryId, ...data } }) => {
    noStore()

    await db
      .update(categories)
      .set(data)
      .where(eq(categories.id, categoryId))
      .catch((e) => {
        if (e.code === "23505") {
          throw new ActionError(
            "CONFLICT",
            "Category already exists with this name",
          )
        } else {
          throw e
        }
      })

    revalidateTag("categories")
  })

export const deleteCategories = adminAction
  .schema(z.object({ ids: z.string().min(1).cuid2().array().min(1) }))
  .action(async ({ parsedInput: { ids } }) => {
    await db.delete(categories).where(inArray(categories.id, ids))
    revalidateTag("categories")
  })

export const createSubcategory = adminAction
  .schema(subcategorySchema)
  .action(async ({ parsedInput }) => {
    noStore()

    await db
      .insert(subcategories)
      .values(parsedInput)
      .catch((e) => {
        if (e.code === "23505") {
          throw new ActionError(
            "CONFLICT",
            "Subcategory already exists with this name",
          )
        } else {
          throw e
        }
      })

    revalidateTag("subcategories")
  })

export const updateSubcategory = adminAction
  .schema(
    subcategorySchema.extend({ subcategoryId: z.string().min(1).cuid2() }),
  )
  .action(async ({ parsedInput: { subcategoryId, ...data } }) => {
    noStore()

    await db
      .update(subcategories)
      .set(data)
      .where(eq(subcategories.id, subcategoryId))
      .catch((e) => {
        if (e.code === "23505") {
          throw new ActionError(
            "CONFLICT",
            "Subcategory already exists with this name",
          )
        } else {
          throw e
        }
      })

    revalidateTag("subcategories")
  })

export const deleteSubcategories = adminAction
  .schema(z.object({ ids: z.string().min(1).cuid2().array().min(1) }))
  .action(async ({ parsedInput: { ids } }) => {
    await db.delete(subcategories).where(inArray(subcategories.id, ids))
    revalidateTag("subcategories")
  })
