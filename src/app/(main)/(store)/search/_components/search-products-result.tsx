"use client"

import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { SearchX, TextSearch } from "lucide-react"

import { SortSelect } from "./sort-select"
import { Skeleton } from "@/components/ui/skeleton"
import { searchProducts } from "@/queries/product"
import type { Category, Subcategory } from "@/db/schema"
import { SearchProductsSchema } from "@/utils/validations/product"
import { PaginationWithLinks } from "@/components/pagination-with-links"
import {
  ProductReel,
  ProductReelSkeleton,
} from "../../_components/product-reel"

type SearchProductsResultProps = {
  category: Category | null
  subcategory: Subcategory | null
  searchParams: SearchProductsSchema
}

export function SearchProductsResult({
  category,
  subcategory,
  searchParams,
}: SearchProductsResultProps) {
  const { query, categoryId, subcategoryId } = searchParams

  const { data, isFetching } = useQuery({
    queryKey: ["search-products", searchParams],
    queryFn: async () => await searchProducts(searchParams),
  })

  const {
    data: products,
    total,
    pageCount,
  } = data ?? { data: [], pageCount: 0, total: 0 }

  const searchLabel = useMemo(() => {
    if (query) {
      return query
    } else if (subcategory) {
      return subcategory.name
    } else if (category) {
      return category.name
    } else {
      return ""
    }
  }, [category, subcategory, query])

  const hasSearch = useMemo(() => {
    return !!query || !!category || !!subcategory
  }, [query, category, subcategory])

  if (isFetching) {
    return (
      <div className="space-y-4">
        <div className="flex w-full items-center justify-between gap-x-4">
          {hasSearch && <Skeleton className="h-4 w-56 rounded" />}
          <Skeleton className="ml-auto h-10 w-40" />
        </div>
        <div className="grid w-full grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          <ProductReelSkeleton length={24} />
        </div>
      </div>
    )
  }

  if (!data || products.length === 0) {
    if (!query && !categoryId && !subcategoryId) {
      return (
        <div className="flex h-full flex-1 flex-col items-center justify-center space-y-2">
          <TextSearch className="size-7 text-muted-foreground" />
          <div className="space-y-1 text-center">
            <h1 className="text-xl font-semibold">Search Products</h1>
            <p className="text-[15px] text-muted-foreground">
              Discover your next favorite item
            </p>
          </div>
        </div>
      )
    } else {
      return (
        <div className="flex h-full flex-1 flex-col items-center justify-center space-y-2">
          <SearchX className="size-8 text-muted-foreground" />
          <div className="space-y-1 text-center">
            <h1 className="text-xl font-semibold">No items found.</h1>
            <p className="text-[15px] text-muted-foreground">
              No items found{" "}
              {hasSearch && `${query ? "for" : "in"} "${searchLabel}"`}
            </p>
          </div>
        </div>
      )
    }
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex w-full flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
        {hasSearch && (
          <p className="text-sm font-medium">
            {total} items found{" "}
            {hasSearch && `${query ? "for" : "in"} "${searchLabel}"`}
          </p>
        )}
        <div className="ml-auto w-full sm:w-auto">
          <SortSelect />
        </div>
      </div>
      <div className="grid w-full grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {products.map((product) => (
          <ProductReel key={product.id} product={product} />
        ))}
      </div>

      {pageCount > 1 ? <PaginationWithLinks pageCount={pageCount} /> : null}
    </div>
  )
}
