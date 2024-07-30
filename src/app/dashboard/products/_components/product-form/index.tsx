"use client"

import { useMemo } from "react"

import { groupByAndCollect } from "@/utils"
import { Stepper } from "@/components/ui/stepper"
import type { getEditProduct } from "@/queries/product"
import { userRoleEnum } from "@/db/schema"

import { ProductDetailsStep } from "./product-details-step"
import { SimpleProductInventoryStep } from "./simple-product-inventory-step"
import { VariableProductInventoryStep } from "./variable-product-inventory-step"
import { CombinationsStep } from "./combinations-step"
import { ProductPublishStep } from "./product-publish-step"
import { ProductImage } from "@/utils/types"
import { useStepper } from "@/hooks/use-stepper"

type ProductFormProps = {
  userRole: (typeof userRoleEnum.enumValues)[number]
  product?: Awaited<ReturnType<typeof getEditProduct>>
}

export function ProductFormContent({ userRole, product }: ProductFormProps) {
  const { currentStep } = useStepper()

  const variantValueImages = useMemo(() => {
    if (!product?.productVariantValues) {
      return {}
    }

    return product.productVariantValues.reduce(
      (acc, curr) => {
        const { variantValueId, images } = curr

        if (images) {
          const filteredImages = images.filter(
            (img) => img !== null,
          ) as ProductImage[]
          if (filteredImages.length > 0) {
            acc[variantValueId] = acc[variantValueId]
              ? [...acc[variantValueId], ...filteredImages]
              : filteredImages
          }
        }

        return acc
      },
      {} as Record<string, ProductImage[]>,
    )
  }, [product?.productVariantValues])

  if (currentStep === 0) {
    return (
      <ProductDetailsStep
        initialData={
          product
            ? {
                title: product?.title,
                type: product?.type,
                categoryId: product.categoryId,
                subcategoryId: product.subcategoryId,
                shortDescription: product.shortDescription ?? "",
                longDescription: product.longDescription,
              }
            : undefined
        }
      />
    )
  } else {
    if (!product) return null

    switch (currentStep) {
      case 1:
        if (product.type === "variable") {
          return (
            <VariableProductInventoryStep
              initialData={{
                price: (product.price ?? undefined) as any,
                stock: (product.stock ?? undefined) as any,
                salePrice: product.salePrice ?? undefined,
                saleDuration: product.saleDuration,
                images: product.images,
                variants: product.productVariants.map((v) => v.variantId),
                values:
                  groupByAndCollect(
                    product.productVariantValues,
                    "variantId",
                    "variantValueId",
                  ) ?? {},
                variantValueImages: variantValueImages,
              }}
            />
          )
        } else {
          return (
            <SimpleProductInventoryStep
              initialData={{
                images: product.images,
                price: (product.price ?? undefined) as any,
                stock: (product.stock ?? undefined) as any,
                salePrice: product.salePrice ?? undefined,
                saleDuration: product.saleDuration,
              }}
            />
          )
        }
      case 2:
        if (product.type === "variable") {
          return <CombinationsStep />
        } else {
          return (
            <ProductPublishStep
              userRole={userRole}
              initialData={{
                label: product?.label,
                status: product.status,
                tags: product.tags,
              }}
            />
          )
        }
      case 3:
        if (product.type === "variable") {
          return (
            <ProductPublishStep
              userRole={userRole}
              initialData={{
                label: product?.label,
                status: product.status,
                tags: product.tags,
              }}
            />
          )
        } else {
          return null
        }
    }
  }
}

export function ProductForm(props: ProductFormProps) {
  const { product } = props

  const steps =
    !product || product.type === "simple"
      ? [
          {
            label: "Details",
          },
          {
            label: "Inventory",
          },
          {
            label: "Publish",
          },
        ]
      : [
          {
            label: "Details",
          },
          {
            label: "Inventory",
          },
          {
            label: "Combinations",
          },
          {
            label: "Publish",
          },
        ]

  return (
    <div className="space-y-8">
      <Stepper clickable={!!product} steps={steps} />
      <ProductFormContent {...props} />
    </div>
  )
}
