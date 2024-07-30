"use client"

import * as React from "react"
import { Ellipsis } from "lucide-react"
import { type ColumnDef } from "@tanstack/react-table"
import { toast } from "sonner"
import { format } from "date-fns"

import { type Order, orders } from "@/db/schema"
import { Badge } from "@/components/ui/badge"
import { useCopy } from "@/hooks/use-copy"
import { formatPrice } from "@/utils"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { deleteOrders, updateOrdersPaymentMethodStatus } from "@/actions/order"
import { useConfirmModal } from "@/stores/use-confirm-modal"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { CopyButton } from "@/components/copy-button"
import { useEditOrderModal } from "@/stores/use-edit-order-modal"
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

export function getColumns(): ColumnDef<Order>[] {
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
      accessorKey: "customerName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Customer" />
      ),
      cell: ({ row }) => {
        const { customerName, email } = row.original

        return (
          <div className="space-y-1">
            <p className="font-medium">{customerName}</p>
            <p className="text-xs text-muted-foreground">{email}</p>
          </div>
        )
      },
    },
    {
      accessorKey: "trackingId",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Tracking Id" />
      ),
      cell: function Cell({ row }) {
        const { trackingId } = row.original

        return (
          <div className="group flex items-center gap-x-2 whitespace-nowrap">
            <span className="font-medium">{trackingId}</span>
            <CopyButton
              value={trackingId}
              label="Copy tracking id"
              className="opacity-0 transition group-hover:opacity-100"
            />
          </div>
        )
      },
    },
    {
      accessorKey: "streetAddress",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Shipping Info" />
      ),
      cell: ({ row }) => {
        const { streetAddress, city, state } = row.original

        return (
          <p className="max-w-[400px] truncate text-muted-foreground">
            {streetAddress}, {city}, {state}
          </p>
        )
      },
    },
    {
      accessorKey: "paymentStatus",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Payment Status" />
      ),
      cell: ({ row }) => {
        const { paymentStatus } = row.original

        return (
          <Badge
            className="capitalize"
            variant={paymentStatus === "paid" ? "success" : "destructive"}
          >
            {paymentStatus}
          </Badge>
        )
      },
    },
    {
      accessorKey: "paymentMethod",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Payment Method" />
      ),
      cell: ({ row }) => {
        const paymentMethod = row.original.paymentMethod

        return (
          <Badge className="whitespace-nowrap capitalize" variant={"outline"}>
            {paymentMethod}
          </Badge>
        )
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const { status } = row.original

        return (
          <Badge
            className="whitespace-nowrap capitalize"
            variant={
              status === "delivered"
                ? "success"
                : status === "cancelled"
                  ? "destructive"
                  : "secondary"
            }
          >
            {status}
          </Badge>
        )
      },
      filterFn: (row, id, value) => {
        return Array.isArray(value) && value.includes(row.getValue(id))
      },
    },
    {
      accessorKey: "subtotal",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Amount" />
      ),
      cell: ({ row }) => {
        const { subtotal, taxes, shippingFee } = row.original

        return (
          <span className="font-medium">
            {formatPrice(subtotal + taxes + shippingFee)}
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
        const [isUpdatePending, startUpdateTransition] = React.useTransition()
        const { onOpen } = useConfirmModal()
        const { copy } = useCopy()

        const { onOpen: onUpdate } = useEditOrderModal()

        const {
          id,
          trackingId,
          estDeliveryDate,
          dispatchedAt,
          shippedAt,
          deliveredAt,
          cancelledAt,
          ...data
        } = row.original

        const dates = {
          estDeliveryDate,
          dispatchedAt: dispatchedAt ?? undefined,
          shippedAt: shippedAt ?? undefined,
          deliveredAt: deliveredAt ?? undefined,
          cancelledAt: cancelledAt ?? undefined,
        }

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
              <DropdownMenuItem onSelect={() => copy(trackingId)}>
                Copy Tracking Id
              </DropdownMenuItem>

              <a href={`/orders/${trackingId}`} target="_blank">
                <DropdownMenuItem>Track order</DropdownMenuItem>
              </a>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onSelect={() => onUpdate({ orderId: id, ...dates, ...data })}
              >
                Edit
              </DropdownMenuItem>

              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Order Status</DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuRadioGroup
                    value={row.original.status}
                    onValueChange={(value) => {
                      startUpdateTransition(() => {
                        toast.promise(
                          updateOrdersPaymentMethodStatus({
                            ids: [row.original.id],
                            status: value as Order["status"],
                          }),
                          {
                            loading: "Updating...",
                            success: "Orders status updated",
                            error: () => "Error updating status",
                          },
                        )
                      })
                    }}
                  >
                    {orders.status.enumValues.map((status) => (
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

              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Payment Method</DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuRadioGroup
                    value={row.original.paymentMethod}
                    onValueChange={(value) => {
                      startUpdateTransition(() => {
                        toast.promise(
                          updateOrdersPaymentMethodStatus({
                            ids: [row.original.id],
                            paymentMethod: value as Order["paymentMethod"],
                          }),
                          {
                            loading: "Updating...",
                            success: "Payment method updated",
                            error: () => "Error updating payment method",
                          },
                        )
                      })
                    }}
                  >
                    {orders.paymentMethod.enumValues.map((method) => (
                      <DropdownMenuRadioItem
                        key={method}
                        value={method}
                        className="capitalize"
                        disabled={isUpdatePending}
                      >
                        {method}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Payment Status</DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuRadioGroup
                    value={row.original.paymentStatus}
                    onValueChange={(value) => {
                      startUpdateTransition(() => {
                        toast.promise(
                          updateOrdersPaymentMethodStatus({
                            ids: [row.original.id],
                            paymentStatus: value as Order["paymentStatus"],
                          }),
                          {
                            loading: "Updating...",
                            success: "Payment status updated",
                            error: () => "Error updating payment status",
                          },
                        )
                      })
                    }}
                  >
                    {orders.paymentStatus.enumValues.map((status) => (
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
                    description: `Order ${trackingId} will be permanently deleted.`,
                    onConfirm: () => deleteOrders({ ids: [id] }),
                    onSuccess: () => toast.success("Order deleted"),
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
