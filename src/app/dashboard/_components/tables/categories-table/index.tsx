"use client"

import * as React from "react"
import type { DataTableFilterField } from "@/utils/types"
import { useSearchParams } from "next/navigation"

import { useDataTable } from "@/hooks/use-data-table"
import { DataTable } from "@/components/data-table"
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar"

import type { Category } from "@/db/schema"
import type { getCategories } from "@/queries/category"
import { useSortItems } from "@/hooks/use-sort-items"
import { useFilterItems } from "@/hooks/use-filter-items"

import { getColumns } from "./categories-table-columns"
import { CategoriesTableToolbarActions } from "./categories-table-toolbar-actions"

interface CategoriesTableProps {
  categoriesPromise: ReturnType<typeof getCategories>
}

export function CategoriesTable({ categoriesPromise }: CategoriesTableProps) {
  const data = React.use(categoriesPromise)

  const searchParams = useSearchParams()
  const query = searchParams.get("name")

  const columns = React.useMemo(() => getColumns(), [])

  const filterFields: DataTableFilterField<Category>[] = [
    {
      label: "Name",
      value: "name",
      placeholder: "Search categories...",
    },
  ]

  const filteredData = useFilterItems(data, [
    { keys: ["name", "description"], query },
  ])

  const sortedData = useSortItems(filteredData)

  const { table } = useDataTable({
    data: sortedData,
    columns,
    filterFields,
    defaultSort: "updatedAt.desc",
    withPagination: false,
  })

  return (
    <DataTable table={table} withPagination={false}>
      <DataTableToolbar table={table} filterFields={filterFields}>
        <CategoriesTableToolbarActions table={table} />
      </DataTableToolbar>
    </DataTable>
  )
}
