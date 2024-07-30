"use client"

import * as React from "react"
import type { DataTableFilterField } from "@/utils/types"
import { useSearchParams } from "next/navigation"

import { useDataTable } from "@/hooks/use-data-table"
import { DataTable } from "@/components/data-table"
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar"

import type { getSubcategories } from "@/queries/category"
import { useSortItems } from "@/hooks/use-sort-items"
import { useFilterItems } from "@/hooks/use-filter-items"

import { SubcategoriesTableToolbarActions } from "./subcategories-table-toolbar-actions"
import {
  getColumns,
  type SubategoryColumnsData,
} from "./subcategories-table-columns"

interface SubcategoriesTableProps {
  subcategoriesPromise: ReturnType<typeof getSubcategories>
}

export function SubcategoriesTable({
  subcategoriesPromise,
}: SubcategoriesTableProps) {
  const data = React.use(subcategoriesPromise)

  const searchParams = useSearchParams()
  const query = searchParams.get("name")
  const category = searchParams.get("category")

  const categories = React.useMemo(() => {
    const categoriesMap = new Map(
      data.map((item) => [item.categoryId, item.category]),
    )
    return [...categoriesMap.values()]
  }, [data])

  const columns = React.useMemo(() => getColumns(), [])

  const filterFields: DataTableFilterField<SubategoryColumnsData>[] = [
    {
      label: "Name",
      value: "name",
      placeholder: "Search subcategories...",
    },
    {
      label: "Category",
      value: "category",
      options: categories.map((cat) => ({
        label: cat.name,
        value: cat.id,
      })),
    },
  ]

  const filteredData = useFilterItems(data, [
    { keys: ["name", "description", "category.name"], query },
    { keys: ["categoryId"], query: category?.split(".") },
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
        <SubcategoriesTableToolbarActions table={table} />
      </DataTableToolbar>
    </DataTable>
  )
}
