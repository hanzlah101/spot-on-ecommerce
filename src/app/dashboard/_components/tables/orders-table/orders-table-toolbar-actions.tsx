"use client"

import { toast } from "sonner"
import { Download, Trash2 } from "lucide-react"
import { type Table } from "@tanstack/react-table"

import type { Order } from "@/db/schema"
import { exportTableToCSV } from "@/utils/export-table-to-csv"
import { Button } from "@/components/ui/button"
import { deleteOrders } from "@/actions/order"
import { useConfirmModal } from "@/stores/use-confirm-modal"

interface OrdersTableToolbarActionsProps {
  table: Table<Order>
}

export function OrdersTableToolbarActions({
  table,
}: OrdersTableToolbarActionsProps) {
  const { onOpen } = useConfirmModal()

  const selectedRows = table.getFilteredSelectedRowModel().rows

  const onDelete = () => {
    onOpen({
      description: "All the selected orders will be permanently deleted.",
      onConfirm: () =>
        deleteOrders({ ids: selectedRows.map((r) => r.original.id) }),
      onSuccess: () => {
        table.toggleAllRowsSelected(false)
        toast.success("Orders deleted")
      },
    })
  }

  return (
    <div className="flex items-center gap-2">
      {selectedRows.length > 0 && (
        <Button size="sm" variant={"destructive"} onClick={onDelete}>
          <Trash2 className="mr-2 size-4" />
          Delete ({selectedRows.length})
        </Button>
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={() =>
          exportTableToCSV(table, {
            filename: "orders",
            excludeColumns: ["select", "actions"],
          })
        }
      >
        <Download className="mr-2 size-4" aria-hidden="true" />
        Export
      </Button>
    </div>
  )
}
