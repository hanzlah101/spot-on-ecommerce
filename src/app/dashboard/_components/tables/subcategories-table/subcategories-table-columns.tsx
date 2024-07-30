"use client"

import * as React from "react"
import { Ellipsis } from "lucide-react"
import { type ColumnDef } from "@tanstack/react-table"
import { toast } from "sonner"
import { format } from "date-fns"

import type { getSubcategories } from "@/queries/category"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { deleteSubcategories } from "@/actions/category"
import { useConfirmModal } from "@/stores/use-confirm-modal"
import { useSubcategoryModal } from "@/stores/use-subcategory-modal"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export type SubategoryColumnsData = Awaited<
  ReturnType<typeof getSubcategories>
>[number]

export function getColumns(): ColumnDef<SubategoryColumnsData>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="translate-y-0.5"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-0.5"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => {
        return (
          <div className="max-w-[400px] font-medium">
            <p className="truncate">{row.getValue("name")}</p>
          </div>
        )
      },
      enableHiding: false,
    },
    {
      accessorKey: "description",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Description" />
      ),
      cell: ({ row }) => {
        return (
          <div className="max-w-[400px] text-muted-foreground">
            <p className="truncate">{row.getValue("description")}</p>
          </div>
        )
      },
    },
    {
      accessorKey: "category",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Category" />
      ),
      cell: function Cell({ row }) {
        const { category } = row.original

        return <span className="text-sm">{category.name}</span>
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created At" />
      ),
      cell: ({ cell }) => format(cell.getValue() as Date, "LLL dd, yyyy"),
    },
    {
      accessorKey: "updatedAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Last Updated" />
      ),
      cell: ({ cell }) => format(cell.getValue() as Date, "LLL dd, yyyy"),
    },
    {
      id: "actions",
      cell: function Cell({ row }) {
        const { onOpen: onSubcategoryOpen } = useSubcategoryModal()
        const { onOpen: onDelete } = useConfirmModal()

        const { id, name, description, categoryId } = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                aria-label="Open menu"
                variant="ghost"
                className="flex size-8 p-0 data-[state=open]:bg-muted"
              >
                <Ellipsis className="size-4" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem
                onSelect={() =>
                  onSubcategoryOpen({
                    subcategoryId: id,
                    name,
                    description,
                    categoryId,
                  })
                }
              >
                Edit
              </DropdownMenuItem>

              <DropdownMenuItem
                onSelect={() =>
                  onDelete({
                    description: `Subcategory ${name} will be permanently deleted.`,
                    onConfirm: () => deleteSubcategories({ ids: [id] }),
                    onSuccess: () => toast.success("Subcategory deleted"),
                  })
                }
              >
                Delete
                <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
}
