"use client"

import Image from "next/image"
import { toast } from "sonner"
import { Ruler, X } from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"

import { ProductCarousel } from "./product-carousel"
import type { ProductImage } from "@/utils/types"
import type { getProductById } from "@/queries/product"
import type { VariantValue } from "@/db/schema"
import { ProductActionButtons } from "./product-action-buttons"
import {
  cn,
  formatPrice,
  getProductPrice,
  isColor,
  isWhiteOrBlack,
  organizeByVariants,
} from "@/utils"

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"

type ProductDetailsProps = {
  data: Exclude<Awaited<ReturnType<typeof getProductById>>, null>
  isFavourite: boolean
}

type ValueWithImages = VariantValue & { images: ProductImage[] | null }

export function ProductDetails({
  data: { product, prodVariants, productCombinations },
  isFavourite,
}: ProductDetailsProps) {
  const organizedVariants = organizeByVariants(prodVariants)

  const [selectedCombination, setSelectedCombination] = useState<
    Exclude<typeof productCombinations, null>[number] | null
  >(null)

  const [selectedVariantValues, setSelectedVariantValues] = useState<
    Record<string, ValueWithImages>
  >({})

  const [isError, setIsError] = useState(false)

  const images = useMemo(() => {
    const selectedValues = Object.values(selectedVariantValues)

    if (selectedValues.length > 0) {
      const newImages = selectedValues.flatMap((val) => val?.images ?? [])

      if (newImages.length > 0) {
        return newImages
      }
    }

    return product.images
  }, [product, selectedVariantValues])

  const { isSaleActive, price, fullPrice, stock } = useMemo(() => {
    if (selectedCombination) {
      const price = getProductPrice(
        selectedCombination.price,
        selectedCombination.salePrice,
        selectedCombination.saleDuration,
      )

      return {
        ...price,
        fullPrice: selectedCombination.price,
        stock: selectedCombination.stock,
      }
    } else {
      const price = getProductPrice(
        product.price ?? 0,
        product.salePrice,
        product.saleDuration,
      )

      return {
        ...price,
        fullPrice: product.price ?? 0,
        stock: product.stock ?? 0,
      }
    }
  }, [product, selectedCombination])

  const disabledVariantValues = useMemo(() => {
    const newDisabledVariantValues: Record<string, Set<string>> = {}

    if (!organizedVariants) return {}

    organizedVariants.forEach((variant) => {
      const disabledValues = new Set<string>()

      variant.variantValues?.forEach((value) => {
        const isDisabled = !productCombinations?.some((combination) => {
          const includesSelectedValues = Object.entries(
            selectedVariantValues,
          ).every(([selectedVariantId, selectedValue]) => {
            if (selectedVariantId === variant.id) return true

            return combination.combinationVariantValues.some(
              (cv) => cv.variantValueId === selectedValue.id,
            )
          })

          return (
            includesSelectedValues &&
            combination.combinationVariantValues.some(
              (cv) => cv.variantValueId === value.id,
            ) &&
            combination.stock > 0
          )
        })

        if (isDisabled) {
          disabledValues.add(value.id)
        }
      })

      newDisabledVariantValues[variant.id] = disabledValues
    })

    return newDisabledVariantValues
  }, [organizedVariants, productCombinations, selectedVariantValues])

  const isSelectedVariantValue = useCallback(
    (variantId: string, valueId: string) => {
      return selectedVariantValues[variantId]?.id === valueId
    },
    [selectedVariantValues],
  )

  const onVariantValueClick = useCallback(
    (clickedVariantId: string, clickedValue: ValueWithImages) => {
      setSelectedVariantValues((prev) => {
        const newSelectedValues = { ...prev }
        if (isSelectedVariantValue(clickedVariantId, clickedValue.id)) {
          delete newSelectedValues[clickedVariantId]
        } else {
          newSelectedValues[clickedVariantId] = clickedValue
        }

        return newSelectedValues
      })
    },
    [isSelectedVariantValue],
  )

  const findValidCombinations = useCallback(() => {
    if (!productCombinations || !productCombinations.length) return []

    return productCombinations.filter((combination) => {
      return Object.values(selectedVariantValues).every((value) =>
        combination.combinationVariantValues.some(
          (cv) => cv.variantValueId === value.id,
        ),
      )
    })
  }, [productCombinations, selectedVariantValues])

  useEffect(() => {
    const validCombinations = findValidCombinations()
    if (validCombinations.length === 1) {
      setSelectedCombination(validCombinations[0])
    } else {
      setSelectedCombination(null)
    }
  }, [productCombinations, findValidCombinations])

  return (
    <div className="space-y-8">
      <div className="grid w-full grid-cols-1 gap-x-8 gap-y-6 pt-12 lg:grid-cols-2">
        <ProductCarousel images={images} />
        <div>
          <h1 className="text-2xl font-medium leading-tight">
            {product.title}
          </h1>
          <div className="mt-3 flex items-end gap-2.5">
            {isSaleActive && (
              <p className="text-2xl tracking-tight text-muted-foreground line-through">
                {formatPrice(fullPrice ?? 0)}
              </p>
            )}
            <h1 className="text-3xl font-semibold tracking-wide">
              {formatPrice(price)}
            </h1>
          </div>

          <div className="mt-3 text-sm font-medium">
            {stock <= 0 ? (
              <p className="text-destructive">Out of stock</p>
            ) : stock <= 10 ? (
              <p className="text-destructive">Only {stock} left in stock</p>
            ) : (
              <p className="text-emerald-600">In Stock</p>
            )}
          </div>

          {product.type === "variable" &&
            organizedVariants &&
            organizedVariants?.length > 0 && (
              <div className="space-y-3">
                {organizedVariants.map((variant) => {
                  const isColorVariant = isColor(variant.name)
                  const selectedValue = selectedVariantValues[variant.id]
                  const guideImagekey = variant.guideImage?.id
                  const [width, height] = guideImagekey
                    ? guideImagekey.split("~")[1].split(":")
                    : ["1000", "1000"]

                  return (
                    <div key={variant.id} className="mt-4 space-y-2.5">
                      <div className="space-y-1">
                        <div className="flex items-center gap-x-2">
                          <p className="font-medium">{variant.name}</p>
                          {selectedValue ? (
                            <button
                              onClick={() =>
                                onVariantValueClick(variant.id, selectedValue)
                              }
                              className="flex items-center rounded-full bg-secondary px-3 py-1 text-xs transition-colors hover:bg-secondary/80"
                            >
                              {selectedValue?.name}
                              <X className="ml-2 size-3.5" />
                            </button>
                          ) : (
                            <p
                              className={cn(
                                "text-xs",
                                isError
                                  ? "text-destructive"
                                  : "text-muted-foreground",
                              )}
                            >
                              Please select a {variant.name.toLowerCase()}
                            </p>
                          )}
                        </div>

                        {variant.guideImage ? (
                          <Dialog>
                            <DialogTrigger className="flex items-center text-sm text-muted-foreground transition-colors hover:text-foreground">
                              <Ruler className="mr-2 size-4" />
                              <span>{variant.name} guide</span>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl p-0">
                              <AspectRatio
                                ratio={Number(width) / Number(height)}
                                className="bg-muted"
                              >
                                <Image
                                  fill
                                  alt={variant.name}
                                  src={variant.guideImage.url}
                                  className="object-contain"
                                />
                              </AspectRatio>
                            </DialogContent>
                          </Dialog>
                        ) : null}
                      </div>
                      <ul className="flex list-none flex-wrap items-center gap-2">
                        {variant.variantValues.map((value) => {
                          const isSelected = isSelectedVariantValue(
                            variant.id,
                            value.id,
                          )

                          const isDisabled =
                            disabledVariantValues[variant.id]?.has(value.id) ??
                            false

                          const { isBlack, isWhite } = isWhiteOrBlack(
                            value.value,
                          )

                          return (
                            <Tooltip key={value.id} delayDuration={100}>
                              <TooltipTrigger>
                                <li
                                  key={value.id}
                                  onClick={() => {
                                    if (isDisabled) {
                                      toast.info(
                                        `${value.name} ${variant.name.toLowerCase()} is out of stock right now`,
                                      )
                                      return
                                    }

                                    onVariantValueClick(variant.id, value)
                                  }}
                                  style={{
                                    backgroundColor: isColorVariant
                                      ? value.value
                                      : undefined,
                                  }}
                                  className={cn(
                                    "relative shrink-0 cursor-pointer border border-foreground transition hover:opacity-80",
                                    isColorVariant
                                      ? "size-10 rounded-full"
                                      : "flex min-w-10 items-center justify-center px-4 py-2 text-sm",
                                    isSelected &&
                                      (isColorVariant
                                        ? "border-background ring-[3px] ring-foreground"
                                        : "bg-foreground text-background"),
                                    isDisabled &&
                                      "cursor-not-allowed opacity-80",
                                  )}
                                >
                                  {isDisabled && (
                                    <div
                                      className={cn(
                                        "absolute left-1/2 top-1/2 z-10 h-full w-px -translate-x-1/2 -translate-y-1/2 rotate-45 transform",
                                        isColorVariant
                                          ? isBlack
                                            ? "bg-white"
                                            : isWhite
                                              ? "bg-black"
                                              : "bg-foreground"
                                          : "bg-foreground",
                                      )}
                                    />
                                  )}
                                  {!isColorVariant && (
                                    <span
                                      className={cn(isDisabled && "opacity-50")}
                                    >
                                      {value.value}
                                    </span>
                                  )}
                                </li>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                {value.name}{" "}
                                {isDisabled ? (
                                  <span className="text-[10px]">
                                    (Out of stock)
                                  </span>
                                ) : null}
                              </TooltipContent>
                            </Tooltip>
                          )
                        })}
                      </ul>
                    </div>
                  )
                })}
              </div>
            )}

          <ProductActionButtons
            selectedCombinationId={selectedCombination?.id}
            onError={setIsError}
            productType={product.type}
            stock={stock}
            price={price}
            isFavourite={isFavourite}
          />

          {product.shortDescription && (
            <p className="mt-4 pl-4 text-sm text-muted-foreground">
              {product.shortDescription}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
