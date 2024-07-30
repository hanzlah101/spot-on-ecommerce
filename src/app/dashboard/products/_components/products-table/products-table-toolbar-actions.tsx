"use client"

import { toast } from "sonner"
import { Download, Trash2 } from "lucide-react"
import { type Table } from "@tanstack/react-table"

import { ProductColumnsData } from "./products-table-columns"
import { exportTableToCSV } from "@/utils/export-table-to-csv"
import { Button } from "@/components/ui/button"
import { deleteProducts } from "@/actions/product"
import { useConfirmModal } from "@/stores/use-confirm-modal"

interface ProductsTableToolbarActionsProps {
  table: Table<ProductColumnsData>
}

export function ProductsTableToolbarActions({
  table,
}: ProductsTableToolbarActionsProps) {
  const { onOpen } = useConfirmModal()

  const selectedRows = table.getFilteredSelectedRowModel().rows

  const onDelete = () => {
    onOpen({
      description: "All the selected products will be permanently deleted.",
      onConfirm: () =>
        deleteProducts({ ids: selectedRows.map((r) => r.original.id) }),
      onSuccess: () => {
        table.toggleAllRowsSelected(false)
        toast.success("Products deleted")
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
            filename: "products",
            excludeColumns: ["select", "actions", "images"],
          })
        }
      >
        <Download className="mr-2 size-4" aria-hidden="true" />
        Export
      </Button>
    </div>
  )
}
