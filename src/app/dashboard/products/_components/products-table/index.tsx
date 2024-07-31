"use client"

import * as React from "react"
import type { DataTableFilterField } from "@/utils/types"

import { productTypeEnum } from "@/db/schema"
import { useDataTable } from "@/hooks/use-data-table"
import { DataTable } from "@/components/data-table"
import { DataTableAdvancedToolbar } from "@/components/data-table/advanced/data-table-advanced-toolbar"

import type { getDashboardProducts } from "@/queries/product"
import { ProductColumnsData, getColumns } from "./products-table-columns"
import { ProductsTableFloatingBar } from "./products-table-floating-bar"
import { ProductsTableToolbarActions } from "./products-table-toolbar-actions"
import {
  productLabelItems,
  productStatusItems,
} from "@/utils/constants/products"

interface ProductsTableProps {
  productsPromise: ReturnType<typeof getDashboardProducts>
}

export function ProductsTable({ productsPromise }: ProductsTableProps) {
  const { data, pageCount } = React.use(productsPromise)

  const columns = React.useMemo(() => getColumns(), [])

  const filterFields: DataTableFilterField<ProductColumnsData>[] = [
    {
      label: "Title",
      value: "title",
      placeholder: "Search by title...",
    },
    {
      label: "Status",
      value: "status",
      options: productStatusItems.map((item) => ({
        ...item,
        withCount: true,
      })),
    },
    {
      label: "Label",
      value: "label",
      options: productLabelItems.map((item) => ({
        ...item,
        withCount: true,
      })),
    },
    {
      label: "Type",
      value: "type",
      options: productTypeEnum.enumValues.map((type) => ({
        label: type[0]?.toUpperCase() + type.slice(1),
        value: type,
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
    defaultSort: "createdAt.desc",
  })

  return (
    <DataTable
      table={table}
      floatingBar={<ProductsTableFloatingBar table={table} />}
    >
      <DataTableAdvancedToolbar table={table} filterFields={filterFields}>
        <ProductsTableToolbarActions table={table} />
      </DataTableAdvancedToolbar>
    </DataTable>
  )
}
