"use client"

import * as React from "react"
import type { DataTableFilterField } from "@/utils/types"

import { useDataTable } from "@/hooks/use-data-table"
import { DataTable } from "@/components/data-table"
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar"

import type { getUsers } from "@/queries/user"
import { UsersTableFloatingBar } from "./users-table-floating-bar"
import { UsersTableToolbarActions } from "./users-table-toolbar-actions"
import { UserColumnData, getColumns } from "./users-table-columns"

interface UsersTableProps {
  usersPromise: ReturnType<typeof getUsers>
  type: "customers" | "moderators"
}

export function UsersTable({ usersPromise, type }: UsersTableProps) {
  const { data, pageCount } = React.use(usersPromise)

  const columns = React.useMemo(() => getColumns(), [])

  const filterFields: DataTableFilterField<UserColumnData>[] = [
    {
      label: "Name",
      value: "name",
      placeholder: `Search ${type}...`,
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
      floatingBar={<UsersTableFloatingBar table={table} />}
    >
      <DataTableToolbar table={table} filterFields={filterFields}>
        <UsersTableToolbarActions type={type} table={table} />
      </DataTableToolbar>
    </DataTable>
  )
}
