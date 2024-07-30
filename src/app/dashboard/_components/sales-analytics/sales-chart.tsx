"use client"

import * as React from "react"
import { format, startOfYear } from "date-fns"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

type SalesChartProps = {
  last30DaysSales: {
    total: number
    date: string
  }[]
  thisYearSalesByMonth: {
    total: number
    date: number
  }[]
}

export function SalesChart({
  last30DaysSales,
  thisYearSalesByMonth,
}: SalesChartProps) {
  const chartConfig = React.useMemo(() => {
    const defaultConf = {
      views: {
        label: "Sales",
      },
      monthly: {
        label: `Last ${last30DaysSales.length} days`,
        color: "hsl(var(--primary))",
      },
    }

    if (thisYearSalesByMonth.length <= 1) {
      return defaultConf
    } else {
      return {
        ...defaultConf,
        yearly: {
          label: "This year",
          color: "hsl(var(--primary))",
        },
      }
    }
  }, [thisYearSalesByMonth, last30DaysSales])

  const [activeChart, setActiveChart] =
    React.useState<keyof typeof chartConfig>("monthly")

  const total = React.useMemo(
    () => ({
      monthly: last30DaysSales.reduce((acc, { total }) => acc + total, 0),
      yearly: thisYearSalesByMonth.reduce((acc, { total }) => acc + total, 0),
    }),
    [thisYearSalesByMonth, last30DaysSales],
  )

  const chartData = React.useMemo(() => {
    if (activeChart === "monthly") {
      return last30DaysSales
    } else {
      return thisYearSalesByMonth
    }
  }, [last30DaysSales, thisYearSalesByMonth, activeChart])

  function formatDate(value: string) {
    if (activeChart === "monthly") {
      return format(value, "LLL dd")
    } else {
      return format(startOfYear(new Date()).setMonth(Number(value) - 1), "MMMM")
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle>Sales Analytics</CardTitle>
          <CardDescription>
            Showing total sales for
            {activeChart === "monthly"
              ? ` last ${last30DaysSales.length} days`
              : " year"}
          </CardDescription>
        </div>
        <div className="flex">
          {["monthly", "yearly"].map((key) => {
            const chart = key as keyof typeof chartConfig
            if (key === "yearly" && thisYearSalesByMonth.length <= 1) {
              return null
            }

            return (
              <button
                key={chart}
                data-active={activeChart === chart}
                onClick={() => setActiveChart(chart)}
                className="relative z-20 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6"
              >
                <span className="whitespace-nowrap text-xs text-muted-foreground">
                  {chartConfig[chart]?.label}
                </span>
                <span className="text-lg font-bold leading-none sm:text-3xl">
                  {total[key as keyof typeof total].toFixed(0).toLocaleString()}
                </span>
              </button>
            )
          })}
        </div>
      </CardHeader>

      <CardContent>
        <ChartContainer config={chartConfig} className="max-h-[500px] w-full">
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={formatDate}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  nameKey="views"
                  indicator="line"
                  labelFormatter={formatDate}
                />
              }
            />
            <defs>
              <linearGradient id="fillChart" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={`var(--color-${activeChart})`}
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor={`var(--color-${activeChart})`}
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <Area
              dataKey="total"
              type="natural"
              fill="url(#fillChart)"
              fillOpacity={0.4}
              stroke={`var(--color-${activeChart})`}
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
