import { useSearchParams } from "next/navigation"
import { useMemo } from "react"

type SortableItem = {
  [key: string]: any
}

export function useSortItems<T extends SortableItem>(
  items: T[],
  defaultSort: string = "updatedAt.desc",
) {
  const searchParams = useSearchParams()
  const sortParam = searchParams.get("sort") || defaultSort
  const [field, order] = sortParam.split(".")

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      if (typeof a[field] === "string") {
        return order === "asc"
          ? a[field].localeCompare(b[field])
          : b[field].localeCompare(a[field])
      } else if (a[field] instanceof Date) {
        return order === "asc"
          ? a[field].getTime() - b[field].getTime()
          : b[field].getTime() - a[field].getTime()
      } else {
        return order === "asc" ? a[field] - b[field] : b[field] - a[field]
      }
    })
  }, [field, items, order])

  return sortedItems
}
