"use client"

import * as React from "react"
import type { DataTableFilterField } from "@/utils/types"
import { useSearchParams } from "next/navigation"

import { useDataTable } from "@/hooks/use-data-table"
import { DataTable } from "@/components/data-table"
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar"

import { couponCodeAmountTypeEnum, type CouponCode } from "@/db/schema"
import type { getCoupons } from "@/queries/coupon"
import { useSortItems } from "@/hooks/use-sort-items"
import { useFilterItems } from "@/hooks/use-filter-items"

import { CouponsTableToolbarActions } from "./coupons-table-toolbar-actions"
import { getColumns } from "./coupons-table-columns"

interface CouponsTableProps {
  couponsPromise: ReturnType<typeof getCoupons>
}

export function CouponsTable({ couponsPromise }: CouponsTableProps) {
  const data = React.use(couponsPromise)

  const searchParams = useSearchParams()
  const query = searchParams.get("code")
  const amtType = searchParams.get("amountType")

  const columns = React.useMemo(() => getColumns(), [])

  const filterFields: DataTableFilterField<CouponCode>[] = [
    {
      label: "Code",
      value: "code",
      placeholder: "Search coupons...",
    },
    {
      label: "Amount Type",
      value: "amountType",
      options: couponCodeAmountTypeEnum.enumValues.map((item) => ({
        label: item[0]?.toUpperCase() + item.slice(1),
        value: item,
        withCount: true,
      })),
    },
  ]

  const filteredData = useFilterItems(data, [
    { keys: ["code"], query },
    { keys: ["amountType"], query: amtType?.split(".") },
  ])

  const sortedData = useSortItems(filteredData)

  const { table } = useDataTable({
    data: sortedData,
    columns,
    filterFields,
    defaultSort: "createdAt.desc",
    withPagination: false,
  })

  return (
    <DataTable table={table} withPagination={false}>
      <DataTableToolbar table={table} filterFields={filterFields}>
        <CouponsTableToolbarActions table={table} />
      </DataTableToolbar>
    </DataTable>
  )
}
