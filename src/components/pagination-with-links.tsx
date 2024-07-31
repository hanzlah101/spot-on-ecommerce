"use client"

import { type ReactNode, useCallback } from "react"
import { usePathname, useSearchParams } from "next/navigation"

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

type PaginationWithLinksProps = {
  pageCount: number
  shouldScroll?: boolean
  pageSearchParam?: string
}

export function PaginationWithLinks({
  pageCount,
  pageSearchParam,
  shouldScroll = true,
}: PaginationWithLinksProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const page = Number(searchParams.get(pageSearchParam ?? "page") ?? "1")

  const buildLink = useCallback(
    (newPage: number) => {
      const key = pageSearchParam || "page"
      if (!searchParams) return `${pathname}?${key}=${newPage}`
      const newSearchParams = new URLSearchParams(searchParams)
      newSearchParams.set(key, String(newPage))
      return `${pathname}?${newSearchParams.toString()}`
    },
    [searchParams, pathname, pageSearchParam],
  )

  const renderPageNumbers = () => {
    const items: ReactNode[] = []
    const maxVisiblePages = 5

    if (pageCount <= maxVisiblePages) {
      for (let i = 1; i <= pageCount; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              scroll={shouldScroll}
              href={buildLink(i)}
              isActive={page === i}
            >
              {i}
            </PaginationLink>
          </PaginationItem>,
        )
      }
    } else {
      items.push(
        <PaginationItem key={1}>
          <PaginationLink
            scroll={shouldScroll}
            href={buildLink(1)}
            isActive={page === 1}
          >
            1
          </PaginationLink>
        </PaginationItem>,
      )

      if (page > 3) {
        items.push(
          <PaginationItem key="ellipsis-start">
            <PaginationEllipsis />
          </PaginationItem>,
        )
      }

      const start = Math.max(2, page - 1)
      const end = Math.min(pageCount - 1, page + 1)

      for (let i = start; i <= end; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              scroll={shouldScroll}
              href={buildLink(i)}
              isActive={page === i}
            >
              {i}
            </PaginationLink>
          </PaginationItem>,
        )
      }

      if (page < pageCount - 2) {
        items.push(
          <PaginationItem key="ellipsis-end">
            <PaginationEllipsis />
          </PaginationItem>,
        )
      }

      items.push(
        <PaginationItem key={pageCount}>
          <PaginationLink
            scroll={shouldScroll}
            href={buildLink(pageCount)}
            isActive={page === pageCount}
          >
            {pageCount}
          </PaginationLink>
        </PaginationItem>,
      )
    }

    return items
  }

  return (
    <Pagination className="pt-8">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href={buildLink(Math.max(page - 1, 1))}
            aria-disabled={page === 1}
            tabIndex={page === 1 ? -1 : undefined}
            className={
              page === 1 ? "pointer-events-none opacity-50" : undefined
            }
          />
        </PaginationItem>
        {renderPageNumbers()}
        <PaginationItem>
          <PaginationNext
            href={buildLink(Math.min(page + 1, pageCount))}
            aria-disabled={page === pageCount}
            tabIndex={page === pageCount ? -1 : undefined}
            className={
              page === pageCount ? "pointer-events-none opacity-50" : undefined
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}
