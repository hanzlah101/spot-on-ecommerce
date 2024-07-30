"use client"

import { useCallback, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  ArrowDownAZ,
  ArrowUpAZ,
  ArrowUp10,
  ArrowUpWideNarrow,
  LineChart,
  ArrowDown10,
} from "lucide-react"

import { useModifiedUrl } from "@/hooks/use-modified-url"
import { CalendarArrowDown } from "@/components/icons/calendar-sort"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function SortSelect() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const query = searchParams.get("query") ?? ""
  const sort = searchParams.get("sort") ?? ""

  const { modifyUrl } = useModifiedUrl()

  const sorts = useMemo(() => {
    const defaultSorts = [
      {
        label: "Best selling",
        value: "rating.desc",
        icon: LineChart,
      },
      {
        label: "Price: High to Low",
        value: "price.desc",
        icon: ArrowDown10,
      },
      {
        label: "Price: Low to High",
        value: "price.asc",
        icon: ArrowUp10,
      },
      {
        label: "A-Z",
        value: "title.asc",
        icon: ArrowDownAZ,
      },
      {
        label: "Z-A",
        value: "title.desc",
        icon: ArrowUpAZ,
      },
      {
        label: "Latest",
        value: "createdAt.desc",
        icon: CalendarArrowDown,
      },
    ] as const

    if (!query) {
      return defaultSorts
    } else {
      return [
        {
          label: "Best match",
          value: "similarity.desc",
          icon: ArrowUpWideNarrow,
        },
        ...defaultSorts,
      ]
    }
  }, [query])

  const handleSort = useCallback(
    (sort: string) => {
      if (sort === "similarity.desc") {
        const url = modifyUrl({ sort: null })
        router.push(url, { scroll: false })
      } else {
        const url = modifyUrl({ sort: sort })
        router.push(url, { scroll: false })
      }
    },
    [router, modifyUrl],
  )

  const selectedSort = useMemo(() => {
    if (sort) {
      return sorts.find((s) => s.value === sort)!
    } else if (!query) {
      return sorts.find((s) => s.value === "rating.desc")!
    } else {
      return sorts.find((s) => s.value === "similarity.desc")!
    }
  }, [sort, query, sorts])

  return (
    <div className="flex w-full items-center justify-between">
      <Select defaultValue={selectedSort.value} onValueChange={handleSort}>
        <SelectTrigger className="w-full gap-x-2 sm:w-auto">
          <SelectValue placeholder="Sort by">
            <span className="flex items-center gap-x-2 whitespace-nowrap">
              Sort By: {selectedSort.label}
            </span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {sorts.map((sort) => (
            <SelectItem key={sort.value} value={sort.value}>
              <div className="flex items-center">
                <sort.icon className="mr-2 size-4" />
                {sort.label}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
