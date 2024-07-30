"use client"

import Link, { LinkProps } from "next/link"
import { motion } from "framer-motion"
import { type LucideIcon } from "lucide-react"

import { cn } from "@/utils"
import { Sheet, SheetBody, SheetContent } from "@/components/ui/sheet"
import { useSidebar } from "@/stores/use-sidebar"

export const SidebarLayout = (
  props: React.ComponentProps<typeof motion.div>,
) => {
  return (
    <>
      <DesktopSidebar {...props} />
      <MobileSidebar {...(props as React.ComponentProps<"div">)} />
    </>
  )
}

export const DesktopSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof motion.div>) => {
  const { isOpen, onOpenChange, screenSize } = useSidebar()

  const open = isOpen && screenSize === "desktop"

  return (
    <>
      <motion.div
        className={cn(
          "fixed left-0 top-0 z-40 hidden h-full min-h-screen flex-shrink-0 overflow-y-auto bg-muted/50 px-4 py-4 backdrop-blur-md md:flex md:flex-col",
          open ? "w-[300px]" : "w-[60px]",
          className,
        )}
        animate={{ width: open ? "300px" : "60px" }}
        transition={{ duration: 0.3 }}
        onMouseEnter={() => onOpenChange(true, "desktop")}
        onMouseLeave={() => onOpenChange(false, "desktop")}
        {...props}
      >
        {children}
      </motion.div>
    </>
  )
}

export const MobileSidebar = ({
  children,
  ...props
}: React.ComponentProps<"div">) => {
  const { isOpen, onOpenChange, screenSize } = useSidebar()
  const open = isOpen && screenSize === "mobile"

  function handleOpenChange(v: boolean) {
    onOpenChange(v, "mobile")
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="left" {...props}>
        <SheetBody className="py-4">{children}</SheetBody>
      </SheetContent>
    </Sheet>
  )
}

type SidebarLinkProps = LinkProps & {
  label: string
  href: string
  icon: LucideIcon
  isActive: boolean
  className?: string
}

export const SidebarLink = ({
  href,
  label,
  className,
  isActive,
  icon: Icon,
  ...props
}: SidebarLinkProps) => {
  const { isOpen, screenSize, onOpenChange } = useSidebar()

  function handleClick() {
    if (screenSize === "mobile") {
      onOpenChange(false, "mobile")
    }
  }

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={cn(
        "group/sidebar flex items-center justify-start gap-2 py-2 transition-colors",
        isActive
          ? "text-foreground"
          : "text-muted-foreground hover:text-foreground",
        className,
      )}
      {...props}
    >
      <Icon className="size-5" />

      <motion.span
        animate={{
          display: isOpen ? "inline-block" : "none",
          opacity: isOpen ? 1 : 0,
        }}
        className={cn(
          "!m-0 whitespace-pre !p-0 text-sm transition duration-150 group-hover/sidebar:translate-x-1",
          isOpen ? "inline-block" : "hidden",
        )}
      >
        {label}
      </motion.span>
    </Link>
  )
}
