"use client"

import * as React from "react"
import type { DataTableFilterField } from "@/utils/types"

import { type Order, orders } from "@/db/schema"
import { useDataTable } from "@/hooks/use-data-table"
import { DataTable } from "@/components/data-table"
import { DataTableAdvancedToolbar } from "@/components/data-table/advanced/data-table-advanced-toolbar"

import type { getDashboardOrders } from "@/queries/order"
import { getColumns } from "./orders-table-columns"
import { OrdersTableFloatingBar } from "./orders-table-floating-bar"
import { OrdersTableToolbarActions } from "./orders-table-toolbar-actions"

interface OrdersTableProps {
  ordersPromise: ReturnType<typeof getDashboardOrders>
}

export function OrdersTable({ ordersPromise }: OrdersTableProps) {
  const { data, pageCount } = React.use(ordersPromise)

  const columns = React.useMemo(() => getColumns(), [])

  const filterFields: DataTableFilterField<Order>[] = [
    {
      label: "Tracking Id",
      value: "trackingId",
      placeholder: "Search by tracking id...",
    },
    {
      label: "Customer name",
      value: "customerName",
      placeholder: "Search by name...",
    },

    {
      label: "Email",
      value: "email",
      placeholder: "Search emails...",
    },
    {
      label: "Phone Number",
      value: "phoneNumber",
      placeholder: "Search phone numbers...",
    },
    {
      label: "State",
      value: "state",
      placeholder: "Search by states...",
    },
    {
      label: "City",
      value: "city",
      placeholder: "Search by cities...",
    },
    {
      label: "Street Address",
      value: "streetAddress",
      placeholder: "Search by street address...",
    },
    {
      label: "Order Status",
      value: "status",
      options: orders.status.enumValues.map((item) => ({
        label: item[0]?.toUpperCase() + item.slice(1),
        value: item,
        withCount: true,
      })),
    },
    {
      label: "Payment Method",
      value: "paymentMethod",
      options: orders.paymentMethod.enumValues.map((item) => ({
        label: item[0]?.toUpperCase() + item.slice(1),
        value: item,
        withCount: true,
      })),
    },
    {
      label: "Payment Status",
      value: "paymentStatus",
      options: orders.paymentStatus.enumValues.map((item) => ({
        label: item[0]?.toUpperCase() + item.slice(1),
        value: item,
        withCount: true,
      })),
    },
  ]

  const { table } = useDataTable({
    data,
    columns,
    pageCount,
    filterFields,
    defaultPerPage: 10,
    defaultSort: "updatedAt.desc",
  })

  return (
    <DataTable
      table={table}
      floatingBar={<OrdersTableFloatingBar table={table} />}
    >
      <DataTableAdvancedToolbar table={table} filterFields={filterFields}>
        <OrdersTableToolbarActions table={table} />
      </DataTableAdvancedToolbar>
    </DataTable>
  )
}
