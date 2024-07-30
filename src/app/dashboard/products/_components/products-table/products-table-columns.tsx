"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { Ellipsis } from "lucide-react"
import { type ColumnDef } from "@tanstack/react-table"
import { toast } from "sonner"
import { format } from "date-fns"

import { Product, products } from "@/db/schema"
import { Badge } from "@/components/ui/badge"
import { formatPrice } from "@/utils"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { deleteProducts, updateProductStatusLabel } from "@/actions/product"
import type { getDashboardProducts } from "@/queries/product"
import { useConfirmModal } from "@/stores/use-confirm-modal"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import {
  productLabelItems,
  productStatusItems,
} from "@/utils/constants/products"

export type ProductColumnsData = Awaited<
  ReturnType<typeof getDashboardProducts>
>["data"][number]

export function getColumns(): ColumnDef<ProductColumnsData>[] {
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
      accessorKey: "images",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Image" />
      ),
      cell: ({ row }) => {
        const images = row.original.images.sort((a, b) => a.order - b.order)
        const image = images[0]
          ? images[0]
          : {
              name: "",
              url: "/product-placeholder.svg",
            }

        return (
          <div className="relative aspect-square w-20 rounded-md border">
            <Image
              fill
              priority
              alt={image.name}
              src={image.url}
              className="rounded-md bg-muted/50 object-cover"
            />
          </div>
        )
      },
      enableSorting: false,
    },
    {
      accessorKey: "title",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Title" />
      ),
      cell: ({ row }) => {
        return (
          <div className="max-w-[400px] font-medium">
            <p className="truncate">{row.getValue("title")}</p>
          </div>
        )
      },
      enableHiding: false,
    },
    {
      accessorKey: "price",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Price" />
      ),
      cell: ({ row }) => {
        const price = row.original.price

        if (!price) {
          if (row.original.type === "variable") {
            return <Badge variant={"outline"}>Variable</Badge>
          } else {
            return <span className="text-muted-foreground">N/A</span>
          }
        }

        return <div className="font-medium">{formatPrice(price)}</div>
      },
    },
    {
      accessorKey: "stock",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Stock" />
      ),
      cell: ({ row }) => {
        const stock = row.original.stock

        if (!stock) {
          return <span className="text-muted-foreground">N/A</span>
        }

        return <>{stock}</>
      },
    },
    {
      accessorKey: "type",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Type" />
      ),
      cell: ({ row }) => (
        <Badge variant={"secondary"} className="capitalize">
          {row.original.type}
        </Badge>
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const status = productStatusItems.find(
          (item) => item.value === row.original.status,
        )

        if (!status) return null

        return (
          <Badge
            variant={status.value === "active" ? "success" : "destructive"}
          >
            {status.label}
          </Badge>
        )
      },
      filterFn: (row, id, value) => {
        return Array.isArray(value) && value.includes(row.getValue(id))
      },
    },
    {
      accessorKey: "label",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Label" />
      ),
      cell: ({ row }) => {
        const label = productLabelItems.find(
          (item) => item.value === row.original.label,
        )

        if (!label) return null

        return (
          <Badge
            className="whitespace-nowrap"
            variant={label.value === "none" ? "outline" : "default"}
          >
            {label.label}
          </Badge>
        )
      },
      filterFn: (row, id, value) => {
        return Array.isArray(value) && value.includes(row.getValue(id))
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
        const [isUpdatePending, startUpdateTransition] = React.useTransition()
        const { onOpen } = useConfirmModal()

        const { id, title } = row.original

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
              <Link href={`/dashboard/products/e/${id}`}>
                <DropdownMenuItem>Edit</DropdownMenuItem>
              </Link>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Label</DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuRadioGroup
                    value={row.original.label}
                    onValueChange={(value) => {
                      startUpdateTransition(() => {
                        toast.promise(
                          updateProductStatusLabel({
                            id: row.original.id,
                            label: value as Product["label"],
                          }),
                          {
                            loading: "Updating...",
                            success: "Label updated",
                            error: () => "Error updating label",
                          },
                        )
                      })
                    }}
                  >
                    {products.label.enumValues.map((label) => (
                      <DropdownMenuRadioItem
                        key={label}
                        value={label}
                        className="capitalize"
                        disabled={isUpdatePending}
                      >
                        {label}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Status</DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuRadioGroup
                    value={row.original.status}
                    onValueChange={(value) => {
                      startUpdateTransition(() => {
                        toast.promise(
                          updateProductStatusLabel({
                            id: row.original.id,
                            status: value as Product["status"],
                          }),
                          {
                            loading: "Updating...",
                            success: "Status updated",
                            error: () => "Error updating status",
                          },
                        )
                      })
                    }}
                  >
                    {products.status.enumValues.map((status) => (
                      <DropdownMenuRadioItem
                        key={status}
                        value={status}
                        className="capitalize"
                        disabled={isUpdatePending}
                      >
                        {status}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() =>
                  onOpen({
                    description: `Product ${title} will be permanently deleted.`,
                    onConfirm: () => deleteProducts({ ids: [id] }),
                    onSuccess: () => toast.success("Product deleted"),
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
