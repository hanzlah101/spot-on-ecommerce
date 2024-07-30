import { and, count, eq, sql } from "drizzle-orm"

import { db } from "@/db"
import { orderItems, orders, reviews } from "@/db/schema"
import { getSession } from "@/utils/auth"
import { PRODUCT_REVIEWS_LIMIT } from "@/utils/constants"

export async function canReviewProduct(productId: string) {
  try {
    const { user } = await getSession()

    if (!user || !user?.emailVerified) {
      return { canReview: false, prevReview: null }
    }

    const userOrders = await db
      .select({})
      .from(orders)
      .innerJoin(orderItems, eq(orders.id, orderItems.orderId))
      .where(
        and(
          eq(orders.email, user.email),
          eq(orderItems.productId, productId),
          eq(orders.status, "delivered"),
        ),
      )
      .limit(1)

    if (!userOrders?.length) {
      return { canReview: false, prevReview: null }
    }

    const [prevReview] = await db
      .select()
      .from(reviews)
      .where(and(eq(reviews.productId, productId), eq(reviews.userId, user.id)))

    return { canReview: userOrders.length > 0, prevReview }
  } catch (error) {
    return { canReview: false, prevReview: null }
  }
}

export async function getProductReviews(page: number, productId: string) {
  const offset = (page - 1) * PRODUCT_REVIEWS_LIMIT

  try {
    const { user } = await getSession()

    const { data, reviewCounts, total } = await db.transaction(async (tx) => {
      const data = await tx.query.reviews.findMany({
        where: eq(reviews.productId, productId),
        offset,
        limit: PRODUCT_REVIEWS_LIMIT,
        orderBy:
          user && page === 1
            ? sql`CASE WHEN ${reviews.userId} = ${user?.id} THEN 0 ELSE 1 END`
            : undefined,
        with: {
          user: {
            columns: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      })

      const reviewCounts = await tx
        .select({
          rating: reviews.rating,
          count: count(reviews.id),
        })
        .from(reviews)
        .where(eq(reviews.productId, productId))
        .groupBy(reviews.rating)

      const total = reviewCounts.reduce((acc, { count }) => acc + count, 0)

      return { data, reviewCounts, total }
    })

    const pageCount = Math.ceil(total / PRODUCT_REVIEWS_LIMIT)
    return { data, reviewCounts, pageCount, total }
  } catch (error) {
    console.error(error)
    return { data: [], reviewCounts: [], pageCount: 0, total: 0 }
  }
}
