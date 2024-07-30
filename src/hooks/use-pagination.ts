import { useSearchParams } from "next/navigation"

interface UsePaginationProps {
  pageCount: number
  pageParamName?: string
}

interface UsePaginationResult {
  currentPage: number
  pages: (number | "...")[]
}

export function usePagination({
  pageCount,
  pageParamName,
}: UsePaginationProps): UsePaginationResult {
  const searchParams = useSearchParams()
  const currentPage = Math.min(
    Math.max(Number(searchParams.get(pageParamName ?? "page") ?? "1"), 1),
    pageCount,
  )

  const pages: (number | "...")[] = []

  pages.push(1)

  if (currentPage <= 3) {
    for (let i = 2; i <= Math.min(4, pageCount); i++) {
      pages.push(i)
    }
  } else {
    pages.push("...")
    for (
      let i = currentPage - 1;
      i <= Math.min(currentPage + 1, pageCount);
      i++
    ) {
      pages.push(i)
    }
  }

  // Add last page if not already included
  if (pageCount > 4 && currentPage < pageCount - 2) {
    pages.push("...")
  }

  if (pageCount > 1 && pages[pages.length - 1] !== pageCount) {
    pages.push(pageCount)
  }

  return { currentPage, pages }
}
