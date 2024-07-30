"use client"

import Link from "next/link"
import type { User } from "lucia"
import { useAction } from "next-safe-action/hooks"
import {
  Key,
  LayoutDashboard,
  LogOut,
  Package,
  ShieldQuestion,
  Truck,
  User2,
  UserCog2,
} from "lucide-react"

import { signOut } from "@/actions/auth"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { useUpdateUserModal } from "@/stores/use-update-user-modal"
import { useTrackOrderModal } from "@/stores/use-track-order-modal"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type UserMenuProps = {
  user: User | null
}

export function UserMenu({ user }: UserMenuProps) {
  const { isExecuting, execute: logout } = useAction(signOut)

  const { onOpen } = useUpdateUserModal()
  const { onOpen: onTrackOrder } = useTrackOrderModal()

  if (!user) {
    return (
      <Tooltip delayDuration={250}>
        <Link href="/sign-in">
          <TooltipTrigger
            asChild
            className="text-foreground transition-transform hover:scale-110"
            aria-label="Sign in"
          >
            <User2 className="size-5" />
          </TooltipTrigger>
        </Link>
        <TooltipContent side="bottom" sideOffset={10}>
          Sign In
        </TooltipContent>
      </Tooltip>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Tooltip delayDuration={250}>
          <TooltipTrigger
            asChild
            className="text-foreground transition-transform hover:scale-110"
            aria-label="Account"
          >
            <User2 className="size-5" />
          </TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={10}>
            Account
          </TooltipContent>
        </Tooltip>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" alignOffset={-20} className="p-2">
        <div className="flex items-center gap-x-2 p-1">
          <Avatar>
            <AvatarImage src={user.image ?? "/placeholder-user.jpg"} />
            <AvatarFallback name={user.name} />
          </Avatar>
          <div>
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <DropdownMenuSeparator />

        {!user.emailVerified ? (
          <>
            <Link href="/verify-email">
              <DropdownMenuItem>
                <ShieldQuestion className="mr-2 size-4" />
                Verify email
              </DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator />
          </>
        ) : null}

        {user.role !== "customer" && (
          <Link href="/dashboard">
            <DropdownMenuItem>
              <LayoutDashboard className="mr-2 size-4" />
              Dashboard
            </DropdownMenuItem>
          </Link>
        )}

        <DropdownMenuItem onSelect={() => onOpen("profile")}>
          <UserCog2 className="mr-2 size-4" />
          Update profile
        </DropdownMenuItem>

        <DropdownMenuItem onSelect={() => onOpen("password")}>
          <Key className="mr-2 size-4" />
          Update password
        </DropdownMenuItem>

        <Link href="/orders">
          <DropdownMenuItem>
            <Package className="mr-2 size-4" />
            Orders
          </DropdownMenuItem>
        </Link>

        <DropdownMenuItem onClick={onTrackOrder}>
          <Truck className="mr-2 size-4" />
          Track order
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem disabled={isExecuting} onClick={() => logout()}>
          <LogOut className="mr-2 size-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
