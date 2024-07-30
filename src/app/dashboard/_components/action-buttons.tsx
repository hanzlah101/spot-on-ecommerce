"use client"

import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useCategoryModal } from "@/stores/use-category-modal"
import { useSubcategoryModal } from "@/stores/use-subcategory-modal"
import { useVariantModal } from "@/stores/use-variant-modal"
import { useCouponModal } from "@/stores/use-coupon-modal"

export function CreateCategoryButton() {
  const { onOpen } = useCategoryModal()

  return (
    <Button onClick={() => onOpen()} variant={"outline"} size="sm" icon={Plus}>
      Create Category
    </Button>
  )
}

export function CreateSubcategoryButton() {
  const { onOpen } = useSubcategoryModal()

  return (
    <Button onClick={() => onOpen()} variant={"outline"} size="sm" icon={Plus}>
      Create Subcategory
    </Button>
  )
}

export function CreateVariantButton() {
  const { onOpen } = useVariantModal()

  return (
    <Button onClick={() => onOpen()} variant={"outline"} size="sm" icon={Plus}>
      Create Variant
    </Button>
  )
}

export function CreateCouponButton() {
  const { onOpen } = useCouponModal()

  return (
    <Button onClick={() => onOpen()} variant={"outline"} size="sm" icon={Plus}>
      Create Coupon
    </Button>
  )
}
