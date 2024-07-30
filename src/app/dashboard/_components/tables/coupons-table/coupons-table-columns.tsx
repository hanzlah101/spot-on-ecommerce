"use client"

import * as React from "react"
import { Ellipsis, Percent } from "lucide-react"
import { type ColumnDef } from "@tanstack/react-table"
import { toast } from "sonner"
import { format } from "date-fns"

import type { CouponCode } from "@/db/schema"
import { formatPrice } from "@/utils"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { useConfirmModal } from "@/stores/use-confirm-modal"
import { Badge } from "@/components/ui/badge"
import { useCouponModal } from "@/stores/use-coupon-modal"
import { deleteCouponCodes } from "@/actions/coupon"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function getColumns(): ColumnDef<CouponCode>[] {
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
      accessorKey: "code",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Code" />
      ),
      cell: ({ row }) => {
        return (
          <div className="max-w-[400px] font-medium">
            <p className="truncate">{row.getValue("code")}</p>
          </div>
        )
      },
      enableHiding: false,
    },
    {
      accessorKey: "amountType",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Amount Type" />
      ),
      cell: ({ row }) => (
        <Badge variant={"secondary"} className="capitalize">
          {row.getValue("amountType")}
        </Badge>
      ),
    },
    {
      accessorKey: "amount",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Amount" />
      ),
      cell: ({ row }) => {
        const { amount, amountType } = row.original

        if (amountType === "fixed amount") {
          return <span className="font-medium">{formatPrice(amount)}</span>
        }

        return (
          <span className="flex items-center gap-x-1 font-medium">
            {amount}
            <Percent className="size-4" />
          </span>
        )
      },
    },
    {
      accessorKey: "minOrderAmount",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Min Order Amt" />
      ),
      cell: ({ row }) => (
        <span className="text-sm font-medium">
          {formatPrice(row.getValue("minOrderAmount"))}
        </span>
      ),
    },
    {
      accessorKey: "usageLimit",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Usage Limit" />
      ),
      cell: ({ row }) => {
        const { usageLimit } = row.original

        if (!usageLimit) {
          return <span className="text-muted-foreground">N/A</span>
        }

        if (usageLimit <= 0) {
          return <Badge variant={"destructive"}>Expired</Badge>
        }

        return <span className="text-sm">{usageLimit}</span>
      },
    },
    {
      accessorKey: "validityDuration",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Min Order Amt" />
      ),
      cell: ({ row }) => {
        const { validityDuration } = row.original

        if (!validityDuration?.from && !validityDuration?.from) {
          return <span className="text-muted-foreground">N/A</span>
        }

        return (
          <span className="whitespace-nowrap text-sm">
            {validityDuration?.from ? (
              validityDuration.to ? (
                <>
                  {format(validityDuration.from, "LLL dd, yyyy")} -{" "}
                  {format(validityDuration.to, "LLL dd, yyyy")}
                </>
              ) : (
                format(validityDuration.from, "LLL dd, yyyy")
              )
            ) : null}
          </span>
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
        const { onOpen: onCouponOpen } = useCouponModal()
        const { onOpen: onDelete } = useConfirmModal()

        const {
          id,
          usageLimit,
          validityDuration,
          amount,
          amountType,
          code,
          minOrderAmount,
        } = row.original

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
                  onCouponOpen({
                    couponId: id,
                    usageLimit: usageLimit ?? undefined,
                    validityDuration: validityDuration ?? undefined,
                    amount,
                    amountType,
                    code,
                    minOrderAmount,
                  })
                }
              >
                Edit
              </DropdownMenuItem>

              <DropdownMenuItem
                onSelect={() =>
                  onDelete({
                    description: `Coupon ${code} will be permanently deleted.`,
                    onConfirm: () => deleteCouponCodes({ ids: [id] }),
                    onSuccess: () => toast.success("Coupon deleted"),
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
