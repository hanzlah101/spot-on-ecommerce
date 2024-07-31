"use client"

import * as React from "react"
import type { DataTableFilterField } from "@/utils/types"
import { useSearchParams } from "next/navigation"

import { useDataTable } from "@/hooks/use-data-table"
import { DataTable } from "@/components/data-table"
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar"

import type { getVariants } from "@/queries/variant"
import { useSortItems } from "@/hooks/use-sort-items"
import { useFilterItems } from "@/hooks/use-filter-items"

import { VariantsTableToolbarActions } from "./variants-table-toolbar-actions"
import { getColumns, type VariantColumnsData } from "./variants-table-columns"

interface VariantsTableProps {
  variantsPromise: ReturnType<typeof getVariants>
}

export function VariantsTable({ variantsPromise }: VariantsTableProps) {
  const data = React.use(variantsPromise)

  const searchParams = useSearchParams()
  const query = searchParams.get("name")

  const columns = React.useMemo(() => getColumns(), [])

  const filterFields: DataTableFilterField<VariantColumnsData>[] = [
    {
      label: "Name",
      value: "name",
      placeholder: "Search variants...",
    },
  ]

  const filteredData = useFilterItems(data, [
    {
      keys: ["name", "slug"],
      query,
    },
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
        <VariantsTableToolbarActions table={table} />
      </DataTableToolbar>
    </DataTable>
  )
}
