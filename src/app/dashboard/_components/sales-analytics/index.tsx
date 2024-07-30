"use client"

import * as React from "react"
import {
  CalendarClock,
  CalendarDays,
  DollarSign,
  History,
  Percent,
  TrendingDown,
  TrendingUp,
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import type { getDashboardAnalytics } from "@/queries/order"
import { NumberTicker } from "@/components/animations/number-ticker"
import { SalesChart } from "./sales-chart"
import { OrdersChart } from "./orders-chart"
import { Skeleton } from "@/components/ui/skeleton"

type SalesAnalyticsProps = {
  analyticsPromise: ReturnType<typeof getDashboardAnalytics>
}

export function SalesAnalytics({ analyticsPromise }: SalesAnalyticsProps) {
  const {
    totalRevenue,
    todaySales,
    todayVsYesterdayPercent,
    thisMonthSales,
    thisMonthVsLastMonthPercent,
    thisYearSales,
    thisYearVsLastYearPercent,
    thisYearSalesByMonth,
    last30DaysSales,
    totalOrders,
  } = React.use(analyticsPromise)

  return (
    <div className="w-full space-y-6">
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <NumberTicker value={totalRevenue} className="text-2xl font-bold" />
            <p className="text-xs text-muted-foreground">
              Lifetime revenue to date
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today</CardTitle>
            <CalendarClock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <NumberTicker value={todaySales} className="text-2xl font-bold" />
            <div className="flex items-center text-xs text-muted-foreground">
              {todayVsYesterdayPercent}
              <Percent className="ml-px size-3 shrink-0" />
              <span className="ml-1">from yestrday</span>
              {todayVsYesterdayPercent.toString().startsWith("-") ? (
                <TrendingDown className="ml-1.5 size-3.5 text-destructive" />
              ) : (
                <TrendingUp className="ml-1.5 size-3.5 text-emerald-600" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This month</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <NumberTicker
              value={thisMonthSales}
              className="text-2xl font-bold"
            />
            <div className="flex items-center text-xs text-muted-foreground">
              {thisMonthVsLastMonthPercent}
              <Percent className="ml-px size-3 shrink-0" />
              <span className="ml-1">from last month</span>
              {thisMonthVsLastMonthPercent.toString().startsWith("-") ? (
                <TrendingDown className="ml-1.5 size-3.5 text-destructive" />
              ) : (
                <TrendingUp className="ml-1.5 size-3.5 text-emerald-600" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This year</CardTitle>
            <History className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <NumberTicker
              value={thisYearSales}
              className="text-2xl font-bold"
            />
            <div className="flex items-center text-xs text-muted-foreground">
              {thisYearVsLastYearPercent}
              <Percent className="ml-px size-3 shrink-0" />
              <span className="ml-1">from last year</span>
              {thisYearVsLastYearPercent.toString().startsWith("-") ? (
                <TrendingDown className="ml-1.5 size-3.5 text-destructive" />
              ) : (
                <TrendingUp className="ml-1.5 size-3.5 text-emerald-600" />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-[70%_30%]">
        <SalesChart
          last30DaysSales={last30DaysSales}
          thisYearSalesByMonth={thisYearSalesByMonth}
        />
        <OrdersChart totalRevenue={totalRevenue} totalOrders={totalOrders} />
      </div>
    </div>
  )
}

export function SalesAnalyticsSkeleton() {
  return (
    <div className="w-full space-y-6">
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <CardHeader className="mb-0">
              <Skeleton className="h-4 w-2/4 rounded" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-6 w-2/3 rounded" />
              <Skeleton className="mt-2 h-3 w-2/3 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[70%_30%]">
        <Skeleton className="h-[500px] w-full" />
        <Skeleton className="h-[300px] w-full" />
      </div>
    </div>
  )
}
