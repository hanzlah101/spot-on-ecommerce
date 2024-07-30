import * as React from "react"
import { orders } from "@/db/schema"
import { SelectTrigger } from "@radix-ui/react-select"
import { type Table } from "@tanstack/react-table"
import { toast } from "sonner"
import { useAction } from "next-safe-action/hooks"
import { useConfirmModal } from "@/stores/use-confirm-modal"
import {
  X,
  CircleCheck,
  DownloadIcon,
  Trash2,
  BadgeDollarSign,
  CreditCard,
} from "lucide-react"

import type { Order } from "@/db/schema"
import { parseError } from "@/utils/error"
import { Spinner } from "@/components/ui/spinner"
import { exportTableToCSV } from "@/utils/export-table-to-csv"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Kbd } from "@/components/ui/kbd"
import { updateOrdersPaymentMethodStatus, deleteOrders } from "@/actions/order"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
} from "@/components/ui/select"

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface OrdersTableFloatingBarProps {
  table: Table<Order>
}

export function OrdersTableFloatingBar({ table }: OrdersTableFloatingBarProps) {
  const rows = table.getFilteredSelectedRowModel().rows

  const [method, setMethod] = React.useState<
    "update-status" | "update-payment-status" | "update-payment-method"
  >()

  const { onOpen } = useConfirmModal()

  const { isExecuting, execute: update } = useAction(
    updateOrdersPaymentMethodStatus,
    {
      onSuccess() {
        toast.success("Orders updated")
      },
      onError({ error }) {
        toast.error(parseError(error))
      },
    },
  )

  React.useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        table.toggleAllRowsSelected(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [table])

  return (
    <div className="fixed inset-x-0 bottom-4 z-50 mx-auto w-fit px-4">
      <div className="w-full overflow-x-auto">
        <div className="mx-auto flex w-fit items-center gap-2 rounded-md border bg-card p-2 shadow-2xl">
          <div className="flex h-7 items-center rounded-md border border-dashed pl-2.5 pr-1">
            <span className="whitespace-nowrap text-xs">
              {rows.length} selected
            </span>
            <Separator orientation="vertical" className="ml-2 mr-1" />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-5 hover:border"
                  onClick={() => table.toggleAllRowsSelected(false)}
                >
                  <X className="size-3.5 shrink-0" aria-hidden="true" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="flex items-center border bg-accent px-2 py-1 font-semibold text-foreground dark:bg-zinc-900">
                <p className="mr-2">Clear selection</p>
                <Kbd abbrTitle="Escape" variant="outline">
                  Esc
                </Kbd>
              </TooltipContent>
            </Tooltip>
          </div>
          <Separator orientation="vertical" className="hidden h-5 sm:block" />
          <div className="flex items-center gap-1.5">
            <Select
              onValueChange={(value: Order["status"]) => {
                setMethod("update-status")
                update({
                  ids: rows.map((row) => row.original.id),
                  status: value,
                })
              }}
            >
              <Tooltip delayDuration={250}>
                <SelectTrigger asChild>
                  <TooltipTrigger asChild>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="size-7 border data-[state=open]:bg-accent data-[state=open]:text-accent-foreground"
                      disabled={isExecuting}
                    >
                      {isExecuting && method === "update-status" ? (
                        <Spinner size="sm" aria-hidden="true" />
                      ) : (
                        <CircleCheck className="size-3.5" aria-hidden="true" />
                      )}
                    </Button>
                  </TooltipTrigger>
                </SelectTrigger>
                <TooltipContent className="border bg-accent font-semibold text-foreground dark:bg-zinc-900">
                  <p>Update status</p>
                </TooltipContent>
              </Tooltip>
              <SelectContent align="center">
                <SelectGroup>
                  {orders.status.enumValues.map((value) => (
                    <SelectItem
                      hideIndicator
                      key={value}
                      value={value}
                      className="pl-3"
                    >
                      <p className="capitalize">{value}</p>
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            <Select
              onValueChange={(value: Order["paymentStatus"]) => {
                setMethod("update-payment-status")
                update({
                  ids: rows.map((row) => row.original.id),
                  paymentStatus: value,
                })
              }}
            >
              <Tooltip delayDuration={250}>
                <SelectTrigger asChild>
                  <TooltipTrigger asChild>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="size-7 border data-[state=open]:bg-accent data-[state=open]:text-accent-foreground"
                      disabled={isExecuting}
                    >
                      {isExecuting && method === "update-payment-status" ? (
                        <Spinner size="sm" aria-hidden="true" />
                      ) : (
                        <BadgeDollarSign
                          className="size-3.5"
                          aria-hidden="true"
                        />
                      )}
                    </Button>
                  </TooltipTrigger>
                </SelectTrigger>
                <TooltipContent className="border bg-accent font-semibold text-foreground dark:bg-zinc-900">
                  <p>Update payment status</p>
                </TooltipContent>
              </Tooltip>
              <SelectContent align="center">
                <SelectGroup>
                  {orders.paymentStatus.enumValues.map((value) => (
                    <SelectItem
                      hideIndicator
                      key={value}
                      value={value}
                      className="pl-3"
                    >
                      <p className="capitalize">{value}</p>
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            <Select
              onValueChange={(value: Order["paymentMethod"]) => {
                setMethod("update-payment-method")
                update({
                  ids: rows.map((row) => row.original.id),
                  paymentMethod: value,
                })
              }}
            >
              <Tooltip delayDuration={250}>
                <SelectTrigger asChild>
                  <TooltipTrigger asChild>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="size-7 border data-[state=open]:bg-accent data-[state=open]:text-accent-foreground"
                      disabled={isExecuting}
                    >
                      {isExecuting && method === "update-payment-method" ? (
                        <Spinner size="sm" aria-hidden="true" />
                      ) : (
                        <CreditCard className="size-3.5" aria-hidden="true" />
                      )}
                    </Button>
                  </TooltipTrigger>
                </SelectTrigger>
                <TooltipContent className="border bg-accent font-semibold text-foreground dark:bg-zinc-900">
                  <p>Update payment method</p>
                </TooltipContent>
              </Tooltip>
              <SelectContent align="center">
                <SelectGroup>
                  {orders.paymentMethod.enumValues.map((value) => (
                    <SelectItem
                      hideIndicator
                      key={value}
                      value={value}
                      className="pl-3"
                    >
                      <p className="capitalize">{value}</p>
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <Tooltip delayDuration={250}>
              <TooltipTrigger asChild>
                <Button
                  variant="secondary"
                  size="icon"
                  className="size-7 border"
                  disabled={isExecuting}
                  onClick={() =>
                    exportTableToCSV(table, {
                      excludeColumns: ["select", "actions"],
                      onlySelected: true,
                    })
                  }
                >
                  <DownloadIcon className="size-3.5" aria-hidden="true" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="border bg-accent font-semibold text-foreground dark:bg-zinc-900">
                <p>Export orders</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip delayDuration={250}>
              <TooltipTrigger asChild>
                <Button
                  variant="secondary"
                  size="icon"
                  className="size-7 border"
                  disabled={isExecuting}
                  onClick={() =>
                    onOpen({
                      description:
                        "All the selected orders will be permanently deleted.",
                      onConfirm: () =>
                        deleteOrders({ ids: rows.map((r) => r.original.id) }),
                      onSuccess: () => {
                        table.toggleAllRowsSelected(false)
                        toast.success("Orders deleted")
                      },
                    })
                  }
                >
                  <Trash2 className="size-3.5" aria-hidden="true" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="border bg-accent font-semibold text-foreground dark:bg-zinc-900">
                <p>Delete orders</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  )
}
