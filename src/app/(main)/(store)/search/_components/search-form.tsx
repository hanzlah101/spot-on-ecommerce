"use client"

import { Input } from "@/components/ui/input"
import { useSearchProducts } from "@/hooks/use-search-products"

import { Search } from "lucide-react"

export function SearchForm() {
  const { inputValue, handleInputChange, handleSubmit } = useSearchProducts()

  return (
    <form className="relative shrink-0" onSubmit={handleSubmit}>
      <Input
        autoFocus
        type="text"
        value={inputValue}
        placeholder="Search products..."
        onChange={handleInputChange}
        className="h-11 px-4 text-base placeholder:text-base sm:h-12"
      />
      <button
        type="submit"
        aria-label="search"
        className="absolute right-4 top-1/2 h-full -translate-y-1/2"
      >
        <Search className="size-5" />
      </button>
    </form>
  )
}
