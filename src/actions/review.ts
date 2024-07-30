"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { and, avg, eq } from "drizzle-orm"

import { db } from "@/db"
import { authenticatedAction } from "@/utils/action"
import { reviewSchema } from "@/utils/validations/review"
import { ActionError } from "@/utils/error"
import { canReviewProduct } from "@/queries/review"
import { products, reviews } from "@/db/schema"

async function updateProductRating(tx: any, productId: string) {
  const [avgRating] = await tx
    .select({ averageRating: avg(reviews.rating) })
    .from(reviews)
    .where(eq(reviews.productId, productId))

  const newRating = parseFloat(avgRating?.averageRating ?? "0").toFixed(1)

  await tx
    .update(products)
    .set({ rating: newRating })
    .where(eq(products.id, productId))
}

export const createReview = authenticatedAction
  .schema(reviewSchema.extend({ productId: z.string().min(1).cuid2() }))
  .action(async ({ parsedInput: { productId, ...input }, ctx }) => {
    const { canReview } = await canReviewProduct(productId)

    if (!canReview) {
      throw new ActionError(
        "CONFLICT",
        "You must purchase this product to review",
      )
    }

    await db.transaction(async (tx) => {
      await tx
        .insert(reviews)
        .values({ ...input, productId, userId: ctx.user.id })
        .catch((e) => {
          if (e.code === "23505") {
            throw new ActionError(
              "CONFLICT",
              "You have already reviewed this product",
            )
          } else {
            throw e
          }
        })

      await updateProductRating(tx, productId)
    })

    revalidatePath(`/product/${productId}`)
  })

export const updateReview = authenticatedAction
  .schema(
    reviewSchema.extend({
      reviewId: z.string().min(1).cuid2(),
      productId: z.string().min(1).cuid2(),
    }),
  )
  .action(
    async ({
      parsedInput: { reviewId, productId, ...input },
      ctx: { user },
    }) => {
      await db.transaction(async (tx) => {
        await tx
          .update(reviews)
          .set(input)
          .where(and(eq(reviews.userId, user.id), eq(reviews.id, reviewId)))

        await updateProductRating(tx, productId)
      })

      revalidatePath(`/product/${productId}`)
    },
  )

export const deleteReview = authenticatedAction
  .schema(
    z.object({
      reviewId: z.string().min(1).cuid2(),
      productId: z.string().min(1).cuid2(),
    }),
  )
  .action(async ({ parsedInput: { reviewId, productId }, ctx: { user } }) => {
    await db.transaction(async (tx) => {
      await tx
        .delete(reviews)
        .where(and(eq(reviews.id, reviewId), eq(reviews.userId, user.id)))

      await updateProductRating(tx, productId)
    })

    revalidatePath(`/product/${productId}`)
  })
