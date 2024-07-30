"use server"

import {
  and,
  asc,
  count,
  desc,
  eq,
  gte,
  lt,
  lte,
  or,
  sql,
  type SQL,
} from "drizzle-orm"
import { cookies } from "next/headers"
import { unstable_noStore as noStore } from "next/cache"

import { db } from "@/db"
import { type Order, orders } from "@/db/schema"
import { filterColumn } from "@/utils/helpers"
import { GetOrdersSchema } from "@/utils/validations/order"
import { DrizzleWhere } from "@/utils/types"
import { getSession } from "@/utils/auth"

export async function getLastOrder(userEmail: string | undefined) {
  try {
    const getEmail = () => {
      const cookieEmail = cookies().get("user-email")?.value ?? null
      return userEmail ?? cookieEmail ?? null
    }

    const email = getEmail()

    if (!email) return null

    const [order] = await db
      .select({
        email: orders.email,
        phoneNumber: orders.phoneNumber,
        city: orders.city,
        state: orders.state,
        streetAddress: orders.streetAddress,
        customerName: orders.customerName,
      })
      .from(orders)
      .where(eq(orders.email, email))
      .limit(1)
      .orderBy(desc(orders.createdAt))

    return order ?? null
  } catch (error) {
    return null
  }
}

export async function getOrders() {
  try {
    const { user } = await getSession()

    if (!user) return []

    const data = await db.query.orders.findMany({
      where: or(eq(orders.email, user.email), eq(orders.userId, user.id)),
      with: {
        orderItems: {
          columns: {
            id: true,
            productId: true,
            imageUrl: true,
          },
          with: {
            product: {
              columns: {
                images: true,
              },
            },
          },
        },
      },
      orderBy: desc(orders.createdAt),
    })

    return data
  } catch (error) {
    return []
  }
}

export async function getDashboardOrders(input: GetOrdersSchema) {
  try {
    noStore()

    const {
      page,
      per_page,
      sort,
      operator,
      status,
      from,
      to,
      trackingId,
      email,
      phoneNumber,
      customerName,
      city,
      state,
      streetAddress,
      paymentStatus,
      paymentMethod,
    } = input

    const offset = (page - 1) * per_page
    const [column, order] = (sort?.split(".").filter(Boolean) ?? [
      "createdAt",
      "desc",
    ]) as [keyof Order | undefined, "asc" | "desc" | undefined]

    const fromDay = from ? sql`to_date(${from}, 'yyyy-mm-dd')` : undefined
    const toDay = to ? sql`to_date(${to}, 'yyyy-mm-dd')` : undefined

    const expressions: (SQL<unknown> | undefined)[] = [
      !!status
        ? filterColumn({
            column: orders.status,
            value: status,
            isSelectable: true,
          })
        : undefined,
      !!paymentStatus
        ? filterColumn({
            column: orders.paymentStatus,
            value: paymentStatus,
            isSelectable: true,
          })
        : undefined,
      !!paymentMethod
        ? filterColumn({
            column: orders.paymentMethod,
            value: paymentMethod,
            isSelectable: true,
          })
        : undefined,
      trackingId
        ? filterColumn({
            column: orders.trackingId,
            value: trackingId,
          })
        : undefined,
      email
        ? filterColumn({
            column: orders.email,
            value: email,
          })
        : undefined,
      phoneNumber
        ? filterColumn({
            column: orders.phoneNumber,
            value: phoneNumber,
          })
        : undefined,
      customerName
        ? filterColumn({
            column: orders.customerName,
            value: customerName,
          })
        : undefined,
      state
        ? filterColumn({
            column: orders.state,
            value: state,
          })
        : undefined,
      city
        ? filterColumn({
            column: orders.city,
            value: city,
          })
        : undefined,
      streetAddress
        ? filterColumn({
            column: orders.streetAddress,
            value: streetAddress,
          })
        : undefined,
      fromDay && toDay
        ? and(gte(orders.createdAt, fromDay), lte(orders.createdAt, toDay))
        : undefined,
    ]

    const where: DrizzleWhere<Order> =
      !operator || operator === "and" ? and(...expressions) : or(...expressions)

    const { data, total } = await db.transaction(async (tx) => {
      const data = await tx.query.orders.findMany({
        limit: per_page,
        offset,
        where,
        orderBy:
          column && column in orders
            ? order === "asc"
              ? asc(orders[column])
              : desc(orders[column])
            : desc(orders.updatedAt),
      })

      const total = await tx
        .select({ count: count() })
        .from(orders)
        .where(where)
        .execute()
        .then((res) => res[0]?.count ?? 0)

      return { data, total }
    })

    const pageCount = Math.ceil(total / per_page)
    return { data, pageCount }
  } catch (error) {
    return { data: [], pageCount: 0 }
  }
}

export async function getOrderByTrackingId(trackingId: string) {
  noStore()

  try {
    const order = await db.query.orders.findFirst({
      where: eq(orders.trackingId, trackingId),
      with: {
        orderItems: {
          with: {
            product: {
              columns: {
                id: true,
                title: true,
                images: true,
              },
            },
          },
        },
      },
    })

    return order ?? null
  } catch (error) {
    return null
  }
}

export async function getDashboardAnalytics() {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
    const lastMonthStart = new Date(
      today.getFullYear(),
      today.getMonth() - 1,
      1,
    )
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0)
    const startOfYear = new Date(today.getFullYear(), 0, 1)
    const startOfLastYear = new Date(today.getFullYear() - 1, 0, 1)
    const endOfLastYear = new Date(today.getFullYear() - 1, 11, 31)

    const {
      todaySales,
      yesterdaySales,
      thisMonthSales,
      lastMonthSales,
      thisYearSales,
      lastYearSales,
      totalRevenue,
      last30DaysSales,
      thisYearSalesByMonth,
      totalOrders,
    } = await db.transaction(async (tx) => {
      const last30DaysSales = await tx
        .select({
          date: sql<string>`DATE(${orders.createdAt})`,
          total: sql<number>`SUM(${orders.subtotal} + ${orders.shippingFee} + ${orders.taxes} - COALESCE(${orders.discount}, 0))`,
        })
        .from(orders)
        .where(
          and(
            gte(orders.createdAt, thirtyDaysAgo),
            eq(orders.paymentStatus, "paid"),
          ),
        )
        .groupBy(sql`DATE(${orders.createdAt})`)
        .orderBy(asc(sql`DATE(${orders.createdAt})`))

      const todaySales = await tx
        .select({
          total: sql<number>`SUM(${orders.subtotal} + ${orders.shippingFee} + ${orders.taxes} - COALESCE(${orders.discount}, 0))`,
        })
        .from(orders)
        .where(
          and(gte(orders.createdAt, today), eq(orders.paymentStatus, "paid")),
        )

      const yesterdaySales = await tx
        .select({
          total: sql<number>`SUM(${orders.subtotal} + ${orders.shippingFee} + ${orders.taxes} - COALESCE(${orders.discount}, 0))`,
        })
        .from(orders)
        .where(
          and(
            gte(orders.createdAt, yesterday),
            lt(orders.createdAt, today),
            eq(orders.paymentStatus, "paid"),
          ),
        )

      const thisMonthSales = await tx
        .select({
          total: sql<number>`SUM(${orders.subtotal} + ${orders.shippingFee} + ${orders.taxes} - COALESCE(${orders.discount}, 0))`,
        })
        .from(orders)
        .where(
          and(
            gte(
              orders.createdAt,
              new Date(today.getFullYear(), today.getMonth(), 1),
            ),
            eq(orders.paymentStatus, "paid"),
          ),
        )

      const lastMonthSales = await tx
        .select({
          total: sql<number>`SUM(${orders.subtotal} + ${orders.shippingFee} + ${orders.taxes} - COALESCE(${orders.discount}, 0))`,
        })
        .from(orders)
        .where(
          and(
            gte(orders.createdAt, lastMonthStart),
            lte(orders.createdAt, lastMonthEnd),
            eq(orders.paymentStatus, "paid"),
          ),
        )

      const thisYearSalesByMonth = await tx
        .select({
          date: sql<number>`EXTRACT(MONTH FROM ${orders.createdAt})`,
          total: sql<number>`SUM(${orders.subtotal} + ${orders.shippingFee} + ${orders.taxes} - COALESCE(${orders.discount}, 0))`,
        })
        .from(orders)
        .where(
          and(
            gte(orders.createdAt, startOfYear),
            eq(orders.paymentStatus, "paid"),
          ),
        )
        .groupBy((t) => t.date)
        .orderBy((t) => asc(t.date))

      const lastYearSales = await tx
        .select({
          total: sql<number>`SUM(${orders.subtotal} + ${orders.shippingFee} + ${orders.taxes} - COALESCE(${orders.discount}, 0))`,
        })
        .from(orders)
        .where(
          and(
            gte(orders.createdAt, startOfLastYear),
            lte(orders.createdAt, endOfLastYear),
            eq(orders.paymentStatus, "paid"),
          ),
        )

      const totalRevenue = await tx
        .select({
          total: sql<number>`SUM(${orders.subtotal} + ${orders.shippingFee} + ${orders.taxes} - COALESCE(${orders.discount}, 0))`,
        })
        .from(orders)
        .where(eq(orders.paymentStatus, "paid"))

      const totalOrders = await tx
        .select({ total: count(), status: orders.status })
        .from(orders)
        .groupBy(orders.status)

      return {
        last30DaysSales,
        thisYearSalesByMonth,
        totalOrders,
        todaySales: todaySales[0].total || 0,
        yesterdaySales: yesterdaySales[0].total || 0,
        thisMonthSales: thisMonthSales[0].total || 0,
        lastMonthSales: lastMonthSales[0].total || 0,
        thisYearSales: thisYearSalesByMonth[0].total || 0,
        lastYearSales: lastYearSales[0].total || 0,
        totalRevenue: totalRevenue[0].total || 0,
      }
    })

    const calculatePercentChange = (
      current: number,
      previous: number,
    ): string => {
      if (previous === 0) {
        return current > 0 ? "+100" : "0"
      }
      const percentChange = ((current - previous) / previous) * 100
      const sign = percentChange > 0 ? "+" : ""
      return `${sign}${percentChange.toFixed(2).replace(/\.00$/, "")}`
    }

    const todayVsYesterdayPercent = calculatePercentChange(
      todaySales,
      yesterdaySales,
    )
    const thisMonthVsLastMonthPercent = calculatePercentChange(
      thisMonthSales,
      lastMonthSales,
    )
    const thisYearVsLastYearPercent = calculatePercentChange(
      thisYearSales,
      lastYearSales,
    )

    return {
      last30DaysSales,
      thisYearSalesByMonth,
      totalOrders,
      todaySales,
      todayVsYesterdayPercent,
      thisMonthSales,
      thisMonthVsLastMonthPercent,
      thisYearSales,
      thisYearVsLastYearPercent,
      totalRevenue,
    }
  } catch (error) {
    return {
      last30DaysSales: [],
      thisYearSalesByMonth: [],
      totalOrders: [],
      thisYearSales: 0,
      todaySales: 0,
      todayVsYesterdayPercent: 0,
      thisMonthSales: 0,
      thisMonthVsLastMonthPercent: 0,
      thisYearVsLastYearPercent: 0,
      totalRevenue: 0,
    }
  }
}
