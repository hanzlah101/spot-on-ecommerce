"use client"

import type { User } from "@/db/schema"
import { Logo } from "@/components/logo"
import { useDashboardSidebarItems } from "@/hooks/use-dashboard-items"

import { SidebarLayout, SidebarLink } from "./sidebar-layout"

type SidebarProps = {
  userRole: User["role"]
}

export function Sidebar({ userRole }: SidebarProps) {
  const items = useDashboardSidebarItems(userRole)

  return (
    <SidebarLayout>
      <Logo />
      <div className="mt-8 flex flex-col gap-3">
        {items.map((item) => (
          <SidebarLink key={item.href} {...item} />
        ))}
      </div>
    </SidebarLayout>
  )

  // <aside
  //   className={cn(
  //     "fixed inset-y-0 left-0 z-20 h-full min-h-screen w-48 space-y-8 overflow-y-auto border-r bg-background px-4 py-6",
  //     className,
  //   )}
  // >
  //   <Logo />
  //   <ul className="flex w-full list-none flex-col space-y-2">
  //     {items.map(({ href, label, isActive, icon: Icon }) => (
  //       <Link
  //         key={href}
  //         href={href}
  //         className={cn(
  //           isActive ? "text-foreground" : "text-muted-foreground",
  //           buttonVariants({
  //             className: "w-full justify-start px-3",
  //             variant: isActive ? "secondary" : "ghost",
  //           }),
  //         )}
  //       >
  //         <Icon className="mr-2 h-5 w-5 shrink-0" />
  //         {label}
  //       </Link>
  //     ))}
  //   </ul>
  // </aside>
}
