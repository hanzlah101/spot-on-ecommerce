import { SearchParams } from "@/utils/types"
import { searchProductsSchema } from "@/utils/validations/product"
import { getCategoryById, getSubcategoryById } from "@/queries/category"

import { SearchForm } from "./_components/search-form"
import { SearchProductsResult } from "./_components/search-products-result"
import { SearchFilters } from "./_components/search-filters"

type SearchProductsPageProps = {
  searchParams: SearchParams
}

export default async function SearchProductsPage({
  searchParams,
}: SearchProductsPageProps) {
  const parsedSearchParams = searchProductsSchema.parse(searchParams)
  const { categoryId, subcategoryId } = parsedSearchParams

  const category = await getCategoryById(categoryId)
  const subcategory = await getSubcategoryById(subcategoryId)

  return (
    <div className="grid min-h-[calc(100vh-4rem)] w-full grid-cols-1 place-items-start gap-x-5 gap-y-4 py-8 md:grid-cols-[30%_70%] lg:grid-cols-[20%_80%]">
      <SearchFilters />
      <div className="flex h-full w-full flex-col space-y-6">
        <SearchForm />
        <SearchProductsResult
          category={category}
          subcategory={subcategory}
          searchParams={parsedSearchParams}
        />
      </div>
    </div>
  )
}
