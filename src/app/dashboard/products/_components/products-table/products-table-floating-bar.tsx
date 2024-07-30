import * as React from "react"
import { type Product } from "@/db/schema"
import { SelectTrigger } from "@radix-ui/react-select"
import { type Table } from "@tanstack/react-table"
import { toast } from "sonner"
import { useAction } from "next-safe-action/hooks"
import { useConfirmModal } from "@/stores/use-confirm-modal"
import { X, Tag, CircleCheck, DownloadIcon, Trash2 } from "lucide-react"

import { ProductColumnsData } from "./products-table-columns"
import { parseError } from "@/utils/error"
import { Spinner } from "@/components/ui/spinner"
import { exportTableToCSV } from "@/utils/export-table-to-csv"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Kbd } from "@/components/ui/kbd"
import { deleteProducts, updateProductsStatusLabel } from "@/actions/product"
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

import {
  productLabelItems,
  productStatusItems,
} from "@/utils/constants/products"

interface ProductsTableFloatingBarProps {
  table: Table<ProductColumnsData>
}

export function ProductsTableFloatingBar({
  table,
}: ProductsTableFloatingBarProps) {
  const rows = table.getFilteredSelectedRowModel().rows

  const [method, setMethod] = React.useState<"update-status" | "update-label">()

  const { onOpen } = useConfirmModal()

  const { isExecuting, execute: update } = useAction(
    updateProductsStatusLabel,
    {
      onSuccess() {
        toast.success("Products updated")
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
              onValueChange={(value: Product["status"]) => {
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
                  {productStatusItems.map((item) => (
                    <SelectItem
                      hideIndicator
                      key={item.value}
                      value={item.value}
                      className="pl-3"
                    >
                      <div className="flex items-center">
                        <item.icon className="mr-2 size-4" />
                        {item.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <Select
              onValueChange={(value: Product["label"]) => {
                setMethod("update-label")
                update({
                  ids: rows.map((row) => row.original.id),
                  label: value,
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
                      {isExecuting && method === "update-label" ? (
                        <Spinner size="sm" aria-hidden="true" />
                      ) : (
                        <Tag className="size-3.5" aria-hidden="true" />
                      )}
                    </Button>
                  </TooltipTrigger>
                </SelectTrigger>
                <TooltipContent className="border bg-accent font-semibold text-foreground dark:bg-zinc-900">
                  <p>Update label</p>
                </TooltipContent>
              </Tooltip>
              <SelectContent align="center">
                <SelectGroup>
                  {productLabelItems.map((item) => (
                    <SelectItem
                      hideIndicator
                      key={item.value}
                      value={item.value}
                      className="pl-3"
                    >
                      <div className="flex items-center">
                        <item.icon className="mr-2 size-4" />
                        {item.label}
                      </div>
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
                  onClick={() =>
                    exportTableToCSV(table, {
                      excludeColumns: ["select", "actions", "images"],
                      onlySelected: true,
                    })
                  }
                  disabled={isExecuting}
                >
                  <DownloadIcon className="size-3.5" aria-hidden="true" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="border bg-accent font-semibold text-foreground dark:bg-zinc-900">
                <p>Export products</p>
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
                        "All the selected products will be permanently deleted.",
                      onConfirm: () =>
                        deleteProducts({ ids: rows.map((r) => r.original.id) }),
                      onSuccess: () => {
                        table.toggleAllRowsSelected(false)
                        toast.success("Products deleted")
                      },
                    })
                  }
                >
                  <Trash2 className="size-3.5" aria-hidden="true" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="border bg-accent font-semibold text-foreground dark:bg-zinc-900">
                <p>Delete products</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  )
}
