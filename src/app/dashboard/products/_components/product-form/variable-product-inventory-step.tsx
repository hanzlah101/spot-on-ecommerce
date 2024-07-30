"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useParams } from "next/navigation"
import { Minus } from "lucide-react"
import { getVariants } from "@/queries/variant"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery } from "@tanstack/react-query"
import { useAction } from "next-safe-action/hooks"
import { useForm, useWatch } from "react-hook-form"
import {
  VariableProductInventorySchema,
  variableProductInventorySchema,
} from "@/utils/validations/product"

import { isColor, isEqual } from "@/utils"
import { parseError } from "@/utils/error"
import { useStepper } from "@/hooks/use-stepper"
import { MultiSelect } from "@/components/ui/multi-select"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useVariantModal } from "@/stores/use-variant-modal"
import {
  Form,
  FormControl,
  FormDescription,
  FormError,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

import { ImageSelect } from "./image-select"
import { SaleDuration } from "../../../_components/sale-duration"

import { Input } from "@/components/ui/input"
import { updateProductVariants } from "@/actions/product"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

type VariantsStepProps = {
  initialData?: VariableProductInventorySchema
}

export function VariableProductInventoryStep({
  initialData,
}: VariantsStepProps) {
  const { onOpen } = useVariantModal()
  const { nextStep, prevStep } = useStepper()
  const { productId }: { productId: string } = useParams()

  const { data, isFetching } = useQuery({
    queryKey: ["variants"],
    queryFn: async () => await getVariants(),
  })

  const variants = data ?? []

  const variantValues = variants.flatMap((variant) =>
    variant.variantValues.map((variantValue) => ({
      ...variantValue,
      variant: { name: variant.name },
    })),
  )

  const form = useForm<VariableProductInventorySchema>({
    resolver: zodResolver(variableProductInventorySchema),
    defaultValues: initialData
      ? initialData
      : {
          variants: [],
          images: [],
          values: {},
          variantValueImages: {},
          stock: 0,
        },
  })

  const selectedVariants = useWatch({
    control: form.control,
    name: "variants",
  })

  const selectedVariantValues = useWatch({
    control: form.control,
    name: "values",
  })

  const selectedVariantValueIds = useMemo(() => {
    return Object.values(selectedVariantValues).flat()
  }, [selectedVariantValues])

  const [openAccordionItems, setOpenAccordionItems] = useState<Set<string>>(
    new Set(selectedVariantValueIds),
  )

  const { execute: update, isExecuting } = useAction(updateProductVariants, {
    onError({ error }) {
      const message = parseError(error)
      form.setError("root", { message })
    },
  })

  const onSubmit = form.handleSubmit((values) => {
    if (isEqual(values, initialData)) return nextStep()
    update({ ...values, productId })
  })

  useEffect(() => {
    if (initialData) {
      form.setValue("price", initialData.price)
      form.setValue("salePrice", initialData.salePrice)
      form.setValue("stock", initialData.stock)
      form.setValue("saleDuration", initialData.saleDuration)
      form.setValue("images", initialData.images)
      form.setValue("variants", initialData.variants)
      form.setValue("values", initialData.values)
      form.setValue("variantValueImages", initialData.variantValueImages)
    }
  }, [initialData, form])

  const handleVariantRemoval = useCallback(() => {
    const newValues = form.getValues("values")
    const newVariantValueImages = form.getValues("variantValueImages")

    Object.keys(newValues).forEach((variantId) => {
      if (!selectedVariants.includes(variantId)) {
        const removedValues = newValues[variantId] || []
        delete newValues[variantId]

        removedValues.forEach((value) => {
          delete newVariantValueImages[value]
        })
      }
    })

    form.setValue("values", newValues)
    form.setValue("variantValueImages", newVariantValueImages)
  }, [selectedVariants, form])

  const handleValueRemoval = useCallback(() => {
    const newVariantValueImages = form.getValues("variantValueImages")
    const selectedValues = form.getValues("values")

    Object.entries(selectedValues).forEach(([_, variantValues]) => {
      Object.keys(newVariantValueImages).forEach((imageKey) => {
        if (!variantValues.includes(imageKey)) {
          delete newVariantValueImages[imageKey]
        }
      })
    })

    form.setValue("variantValueImages", newVariantValueImages)
  }, [form])

  useEffect(() => {
    handleVariantRemoval()
  }, [selectedVariants, handleVariantRemoval])

  useEffect(() => {
    handleValueRemoval()
  }, [selectedVariantValues, handleValueRemoval])

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-4">
        <h1 className="text-xl font-semibold sm:text-2xl">Variants & Images</h1>
        <FormError />
        <FormField
          control={form.control}
          name={"variants"}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Variants</FormLabel>
              <FormControl>
                <MultiSelect
                  loading={isFetching}
                  disabled={isExecuting}
                  placeholder="Select Variants"
                  defaultValue={field.value ?? []}
                  options={(variants ?? [])?.map((v) => ({
                    label: v.name,
                    value: v.id,
                  }))}
                  onValueChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
              <Button
                type="button"
                variant={"link"}
                size="fit"
                disabled={isExecuting}
                className="text-muted-foreground"
                onClick={() => onOpen()}
              >
                Create variant
              </Button>
            </FormItem>
          )}
        />

        {isFetching
          ? Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className="space-y-1.5">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-3 w-40" />
              </div>
            ))
          : selectedVariants?.map((variantId) => {
              const variant = variants?.find(({ id }) => id === variantId)

              if (!variant) return null

              return (
                <FormField
                  key={variant.id}
                  control={form.control}
                  name={`values.${variant.id}`}
                  disabled={isExecuting}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{variant?.name}</FormLabel>
                      <FormControl>
                        <MultiSelect
                          maxCount={4}
                          placeholder={`Select ${variant.name}`}
                          defaultValue={field.value ?? []}
                          disabled={isExecuting}
                          onValueChange={field.onChange}
                          options={variant.variantValues.map((val) => ({
                            label: val.name,
                            value: val.id,
                          }))}
                        />
                      </FormControl>
                      <FormMessage />
                      <Button
                        type="button"
                        variant={"link"}
                        size="fit"
                        disabled={isExecuting}
                        className="text-muted-foreground"
                        onClick={() =>
                          onOpen({
                            variantId: variant.id,
                            name: variant.name,
                            slug: variant.slug,
                            guideImage: variant.guideImage ?? undefined,
                            values: variant.variantValues,
                          })
                        }
                      >
                        Create {variant.name.toLowerCase()}
                      </Button>
                    </FormItem>
                  )}
                />
              )
            })}

        {isFetching ? (
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="w-full space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-3 w-48" />
                <Skeleton className="h-4 w-4" />
              </div>
              <Skeleton className="h-3 w-36" />
              <div className="grid w-full grid-cols-2 gap-2.5 md:grid-cols-3 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-square w-full" />
                ))}
              </div>
            </div>
          ))
        ) : (
          <Accordion
            type="multiple"
            className="w-full"
            value={Array.from(openAccordionItems)}
            onValueChange={(v) => setOpenAccordionItems(new Set(v))}
          >
            {!!selectedVariantValueIds?.length && (
              <h2
                onClick={() => {
                  const prevItems = Array.from(openAccordionItems)
                  if (prevItems.length === selectedVariantValueIds.length) {
                    setOpenAccordionItems(new Set([]))
                  } else {
                    setOpenAccordionItems(new Set(selectedVariantValueIds))
                  }
                }}
                className="cursor-pointer text-lg font-medium hover:underline hover:underline-offset-4"
              >
                Variant Images
              </h2>
            )}
            <>
              {selectedVariantValueIds?.map((valueId) => {
                const variantValue = variantValues.find((v) => v.id === valueId)

                if (!variantValue) return null

                return (
                  <AccordionItem value={variantValue.id} key={variantValue.id}>
                    <AccordionTrigger>
                      <div className="flex items-center">
                        {variantValue.name}
                        <Minus className="mx-2 size-4 text-muted-foreground" />
                        {isColor(variantValue.variant.name) ? (
                          <span
                            className="size-8 rounded-md border"
                            style={{ backgroundColor: variantValue.value }}
                          />
                        ) : (
                          <span className="text-sm">
                            ({variantValue.value})
                          </span>
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <FormField
                        control={form.control}
                        name={`variantValueImages.${valueId}`}
                        disabled={isExecuting}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {variantValue.name} {variantValue.variant.name}{" "}
                              Images
                            </FormLabel>
                            <FormControl>
                              <ImageSelect
                                disabled={isExecuting}
                                value={field.value ?? []}
                                onChange={field.onChange}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </AccordionContent>
                  </AccordionItem>
                )
              })}
            </>
          </Accordion>
        )}

        <div className="grid w-full grid-cols-1 gap-x-3 gap-y-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="price"
            disabled={isExecuting}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <Input placeholder="1499" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="stock"
            disabled={isExecuting}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stock</FormLabel>
                <FormControl>
                  <Input placeholder="100" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid w-full grid-cols-1 gap-x-3 gap-y-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="salePrice"
            disabled={isExecuting}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sale Price</FormLabel>
                <FormControl>
                  <Input placeholder="1099" {...field} />
                </FormControl>
                <FormMessage />
                <FormDescription>
                  If you have same sale on each variant
                </FormDescription>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="saleDuration"
            disabled={isExecuting}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sale Duration</FormLabel>
                <SaleDuration
                  disabled={isExecuting}
                  value={field?.value}
                  onChange={field.onChange}
                />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="images"
          disabled={isExecuting}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Images</FormLabel>
              <FormControl>
                <ImageSelect
                  disabled={isExecuting}
                  value={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 items-center justify-between gap-x-4 md:flex">
          <Button
            disabled={isExecuting}
            type="button"
            variant={"outline"}
            onClick={prevStep}
          >
            Back
          </Button>
          <Button
            type="submit"
            className="w-full md:w-[100px]"
            loading={isExecuting}
          >
            Continue
          </Button>
        </div>
      </form>
    </Form>
  )
}
