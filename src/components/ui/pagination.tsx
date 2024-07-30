import * as React from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"

import { cn } from "@/utils"
import { useModifiedUrl } from "@/hooks/use-modified-url"
import { ButtonProps, buttonVariants } from "@/components/ui/button"

const Pagination = ({ className, ...props }: React.ComponentProps<"nav">) => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={cn("mx-auto flex w-full justify-center", className)}
    {...props}
  />
)
Pagination.displayName = "Pagination"

const PaginationContent = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul">
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn("flex flex-row items-center gap-1", className)}
    {...props}
  />
))
PaginationContent.displayName = "PaginationContent"

const PaginationItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn("", className)} {...props} />
))
PaginationItem.displayName = "PaginationItem"

type PaginationLinkProps = {
  isActive?: boolean
} & Pick<ButtonProps, "size"> &
  Omit<React.ComponentProps<typeof Link>, "href"> & {
    pageParam: Record<string, string | number>
    disabled?: boolean
  }

const PaginationLink = ({
  className,
  isActive,
  size = "icon",
  pageParam,
  ...props
}: PaginationLinkProps) => {
  const { modifyUrl } = useModifiedUrl()

  return (
    <Link
      href={modifyUrl(pageParam)}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        buttonVariants({
          variant: isActive ? "outline" : "ghost",
          size,
          className: "size-8 text-[13px] sm:size-10 sm:text-sm",
        }),
        className,
      )}
      {...props}
    />
  )
}
PaginationLink.displayName = "PaginationLink"

const PaginationPrevious = ({
  className,
  disabled,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to previous page"
    size="icon"
    aria-disabled={disabled}
    className={cn(
      "size-8 gap-1 bg-accent/80 aria-disabled:pointer-events-none aria-disabled:opacity-50 sm:size-10",
      className,
    )}
    {...props}
  >
    <ChevronLeft className="size-3.5 shrink-0 sm:size-4" />
    <span className="sr-only">Previous</span>
  </PaginationLink>
)
PaginationPrevious.displayName = "PaginationPrevious"

const PaginationNext = ({
  className,
  disabled,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to next page"
    size="icon"
    aria-disabled={disabled}
    className={cn(
      "size-8 gap-1 bg-accent/80 aria-disabled:pointer-events-none aria-disabled:opacity-50 sm:size-10",
      className,
    )}
    {...props}
  >
    <span className="sr-only">Next</span>
    <ChevronRight className="size-3.5 shrink-0 sm:size-4" />
  </PaginationLink>
)
PaginationNext.displayName = "PaginationNext"

const PaginationEllipsis = ({
  className,
  ...props
}: React.ComponentProps<"span">) => (
  <span
    aria-hidden
    className={cn("flex h-9 w-9 items-center justify-center", className)}
    {...props}
  >
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">More pages</span>
  </span>
)
PaginationEllipsis.displayName = "PaginationEllipsis"

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
}
