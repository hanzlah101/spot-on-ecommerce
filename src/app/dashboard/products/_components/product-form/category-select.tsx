"use client"

import { useEffect } from "react"
import { Plus } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { useFormContext, useWatch } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { useCategoryModal } from "@/stores/use-category-modal"
import { useSubcategoryModal } from "@/stores/use-subcategory-modal"
import { ProductDetailsSchema } from "@/utils/validations/product"
import { getCategories, getSubcategoriesByCategoryId } from "@/queries/category"
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type CategorySelectProps = {
  disabled?: boolean
}

export function CategorySelect({ disabled }: CategorySelectProps) {
  const { onOpen: onCategoryOpen } = useCategoryModal()
  const { onOpen: onSubategoryOpen, isOpen } = useSubcategoryModal()

  const form = useFormContext<ProductDetailsSchema>()

  const categoryId = useWatch({
    control: form.control,
    name: "categoryId",
  })

  const { data: categories, isFetching: isFetchingCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => await getCategories(),
  })

  const {
    data: subcategories,
    isFetching: isFetchingSubcategories,
    refetch,
  } = useQuery({
    queryKey: ["subcategories", categoryId],
    queryFn: async () => await getSubcategoriesByCategoryId(categoryId),
    enabled: false,
  })

  useEffect(() => {
    if (categoryId) {
      refetch()
    }
  }, [categoryId, refetch, isOpen])

  if ((!categories || !categories?.length) && !isFetchingCategories) {
    return (
      <FormField
        control={form.control}
        name="categoryId"
        disabled={disabled}
        render={() => (
          <FormItem>
            <FormLabel>Category</FormLabel>
            <FormControl>
              <div className="flex w-full flex-col items-center justify-center gap-y-1 py-8">
                <p className="text-lg font-medium">No categories found.</p>
                <Button
                  size="sm"
                  type="button"
                  variant={"outline"}
                  onClick={() => onCategoryOpen()}
                >
                  <Plus className="mr-2 size-4" />
                  Create New
                </Button>
              </div>
            </FormControl>
            <FormMessage />
            <Button
              type="button"
              variant={"link"}
              size={"fit"}
              onClick={() => onCategoryOpen()}
            >
              New Category
            </Button>
          </FormItem>
        )}
      />
    )
  }

  return (
    <div className="grid grid-cols-1 gap-x-3 gap-y-4 md:grid-cols-2">
      <FormField
        control={form.control}
        name="categoryId"
        disabled={disabled}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Category</FormLabel>
            <Select
              disabled={disabled || isFetchingCategories}
              onValueChange={field.onChange}
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger loading={isFetchingCategories}>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {categories?.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
            <Button
              type="button"
              variant={"link"}
              size={"fit"}
              onClick={() => onCategoryOpen()}
              className="text-muted-foreground"
            >
              New Category
            </Button>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="subcategoryId"
        disabled={
          disabled ||
          !categoryId ||
          isFetchingSubcategories ||
          isFetchingCategories
        }
        render={({ field }) => (
          <FormItem>
            <FormLabel>Subategory</FormLabel>
            <Select
              disabled={
                disabled ||
                !categoryId ||
                isFetchingSubcategories ||
                isFetchingCategories
              }
              onValueChange={field.onChange}
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger loading={isFetchingSubcategories}>
                  <SelectValue placeholder="Select a subcategory" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {subcategories?.map((sub) => (
                  <SelectItem key={sub.id} value={sub.id}>
                    {sub.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
            <FormDescription>
              {!categoryId ? (
                "Select a category first"
              ) : (
                <Button
                  type="button"
                  variant={"link"}
                  size={"fit"}
                  className="text-muted-foreground"
                  onClick={() => onSubategoryOpen()}
                >
                  New Subategory
                </Button>
              )}
            </FormDescription>
          </FormItem>
        )}
      />
    </div>
  )
}
