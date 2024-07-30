"use client"

import * as React from "react"
import { Label, Pie, PieChart } from "recharts"

import { formatPrice } from "@/utils"
import type { Order } from "@/db/schema"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type OrdersChartProps = {
  totalRevenue: number
  totalOrders: {
    status: Order["status"]
    total: number
  }[]
}

const chartConfig = {
  total: {
    label: "Total",
  },
  processing: {
    label: "Processing",
    color: "#3b82f6",
  },
  dispatched: {
    label: "Dispatched",
    color: "#7c3aed",
  },
  shipped: {
    label: "Shipped",
    color: "#059669",
  },
  delivered: {
    label: "Delivered",
    color: "#84cc16",
  },
  on_hold: {
    label: "On Hold",
    color: "#fbbf24",
  },
  cancelled: {
    label: "Cancelled",
    color: "#e11d48",
  },
} satisfies ChartConfig

export function OrdersChart({ totalOrders, totalRevenue }: OrdersChartProps) {
  const totalCount = React.useMemo(() => {
    return totalOrders.reduce((acc, curr) => acc + curr.total, 0)
  }, [totalOrders])

  const chartData = React.useMemo(() => {
    return totalOrders.map((o) => ({
      ...o,
      fill: `var(--color-${o.status.replace(" ", "_")})`,
    }))
  }, [totalOrders])

  return (
    <Card className="flex h-fit flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Total orders</CardTitle>
        <CardDescription>All orders from lifetime to date</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="total"
              nameKey="status"
              innerRadius={60}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {totalCount.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Orders
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>

      <CardFooter className="flex-col gap-2 text-sm">
        <div className="text-center leading-none text-muted-foreground">
          Generated total revenue of {formatPrice(totalRevenue)} so far
        </div>
      </CardFooter>
    </Card>
  )
}
