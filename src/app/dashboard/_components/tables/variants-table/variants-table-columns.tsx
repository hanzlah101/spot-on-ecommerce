"use client"

import * as React from "react"
import { Ellipsis } from "lucide-react"
import { type ColumnDef } from "@tanstack/react-table"
import { toast } from "sonner"
import { format } from "date-fns"

import { isColor } from "@/utils"
import type { getVariants } from "@/queries/variant"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { useConfirmModal } from "@/stores/use-confirm-modal"
import { Badge } from "@/components/ui/badge"
import { useVariantModal } from "@/stores/use-variant-modal"
import { deleteVariants } from "@/actions/variant"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export type VariantColumnsData = Awaited<ReturnType<typeof getVariants>>[number]

export function getColumns(): ColumnDef<VariantColumnsData>[] {
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
      accessorKey: "slug",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Slug" />
      ),
    },
    {
      accessorKey: "variantValues",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Values" />
      ),
      cell: function Cell({ row }) {
        const { variantValues, name } = row.original
        const isColorVariant = isColor(name)

        return (
          <div className="flex max-w-[300px] flex-wrap gap-2">
            {variantValues.map((val) => (
              <Tooltip key={val.id} delayDuration={100}>
                <TooltipTrigger>
                  {isColorVariant ? (
                    <div
                      style={{ backgroundColor: val.value }}
                      className="!size-6 rounded-full border"
                    />
                  ) : (
                    <Badge variant={"secondary"} className="whitespace-nowrap">
                      {val.value}
                    </Badge>
                  )}
                </TooltipTrigger>
                <TooltipContent side="top">{val.name}</TooltipContent>
              </Tooltip>
            ))}
          </div>
        )
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
        const { onOpen: onVariantOpen } = useVariantModal()
        const { onOpen: onDelete } = useConfirmModal()

        const { id, name, variantValues, slug, guideImage } = row.original

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
                  onVariantOpen({
                    name,
                    slug,
                    variantId: id,
                    values: variantValues,
                    guideImage,
                  })
                }
              >
                Edit
              </DropdownMenuItem>

              <DropdownMenuItem
                onSelect={() =>
                  onDelete({
                    description: `Variant ${name} will be permanently deleted.`,
                    onConfirm: () => deleteVariants({ ids: [id] }),
                    onSuccess: () => toast.success("Variant deleted"),
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
