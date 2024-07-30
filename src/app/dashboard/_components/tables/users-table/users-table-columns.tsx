"use client"

import * as React from "react"
import { Ellipsis } from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"
import { type ColumnDef } from "@tanstack/react-table"

import type { getUsers } from "@/queries/user"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { deleteUsers, updateUsersRole } from "@/actions/user"
import { useConfirmModal } from "@/stores/use-confirm-modal"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export type UserColumnData = Awaited<
  ReturnType<typeof getUsers>
>["data"][number]

export function getColumns(): ColumnDef<UserColumnData>[] {
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
      accessorKey: "image",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Image" />
      ),
      cell: ({ row }) => {
        const { name, image } = row.original

        return (
          <Avatar className="rounded-md">
            <AvatarImage src={image ?? "/placeholder-user.jpg"} />
            <AvatarFallback name={name} className="rounded-md" />
          </Avatar>
        )
      },
      enableSorting: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Customer" />
      ),
      cell: ({ row }) => (
        <div className="max-w-[400px] font-medium">
          <p className="truncate">{row.getValue("name")}</p>
        </div>
      ),
    },
    {
      accessorKey: "email",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Customer" />
      ),
      cell: ({ row }) => (
        <div className="max-w-[400px] font-medium">
          <p className="truncate">{row.getValue("email")}</p>
        </div>
      ),
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

        const { id, name } = row.original

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
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>User Role</DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuRadioGroup
                    value={row.original.role}
                    onValueChange={(value) => {
                      startUpdateTransition(() => {
                        toast.promise(
                          updateUsersRole({
                            ids: [row.original.id],
                            role: value as "customer" | "moderator",
                          }),
                          {
                            loading: "Updating...",
                            success: "User role updated",
                            error: () => "Error updating role",
                          },
                        )
                      })
                    }}
                  >
                    {["customer", "moderator"].map((role) => (
                      <DropdownMenuRadioItem
                        key={role}
                        value={role}
                        className="capitalize"
                        disabled={isUpdatePending}
                      >
                        {role}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              {/* TODO */}
              <DropdownMenuItem onSelect={() => {}}>Edit</DropdownMenuItem>

              <DropdownMenuItem
                onSelect={() =>
                  onOpen({
                    description: `User ${name} will be permanently deleted.`,
                    onConfirm: () => deleteUsers({ ids: [id] }),
                    onSuccess: () => toast.success("User deleted"),
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
