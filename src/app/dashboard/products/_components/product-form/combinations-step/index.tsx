"use client"

import { toast } from "sonner"
import { useEffect, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { useParams } from "next/navigation"
import { ListRestart, X, ShieldQuestion, Trash2 } from "lucide-react"
import { useAction } from "next-safe-action/hooks"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { isEqual, parseSaleDuration } from "@/utils"
import { getProductCombinations } from "@/queries/product"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { useStepper } from "@/hooks/use-stepper"
import { parseError } from "@/utils/error"
import { Form, FormError } from "@/components/ui/form"
import { CombinationFormField } from "./combination-form-field"
import { useConfirmModal } from "@/stores/use-confirm-modal"
import {
  deleteProductCombinations,
  loadProductCombinationVariantValues,
  updateProductCombinations,
} from "@/actions/product"

import {
  updateProductCombinationsSchema,
  UpdateProductCombinationsSchema,
} from "@/utils/validations/product"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export function CombinationsStep() {
  const { productId }: { productId: string } = useParams()
  const { prevStep, nextStep, currentStep } = useStepper()
  const { onOpen: onDelete } = useConfirmModal()

  const {
    data: combinations,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["product-combinations", productId, currentStep],
    queryFn: async () => await getProductCombinations(productId),
  })

  const { execute: loadCombinations, isExecuting: isLoadingCombinations } =
    useAction(loadProductCombinationVariantValues, {
      onError({ error }) {
        toast.error(parseError(error))
      },
      onSuccess() {
        refetch()
      },
    })

  const formCombinations = useMemo(() => {
    return combinations?.map((c) => ({
      id: c.id,
      price: c.price,
      stock: c.stock,
      salePrice: c.salePrice ?? undefined,
      saleDuration: parseSaleDuration(c.saleDuration),
    }))
  }, [combinations])

  const form = useForm<UpdateProductCombinationsSchema>({
    resolver: zodResolver(updateProductCombinationsSchema),
    defaultValues: {
      combinations: formCombinations ?? [],
    },
  })

  const { execute: update, isExecuting: isUpdating } = useAction(
    updateProductCombinations,
    {
      onSuccess() {
        refetch()
      },
      onError({ error }) {
        const message = parseError(error)
        form.setError("root", { message })
      },
    },
  )

  const onSubmit = form.handleSubmit((values) => {
    if (isEqual(formCombinations, values.combinations)) return nextStep()
    update({ ...values, productId })
  })

  useEffect(() => {
    if (formCombinations && !!formCombinations.length) {
      form.setValue("combinations", formCombinations)
    }
  }, [formCombinations, form])

  if (isFetching) {
    return (
      <div className="space-y-10">
        <div className="space-y-4">
          <h1 className="text-xl font-semibold sm:text-2xl">
            Combinations Inventory
          </h1>
          <div className="flex items-center gap-x-3">
            <Skeleton className="h-10 w-28" />
            <Skeleton className="h-10 w-28" />
          </div>
        </div>
        <div className="space-y-4 p-0.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="w-full space-y-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-2.5 w-32" />
                <Skeleton className="h-4 w-4" />
              </div>
              <div className="grid grid-cols-1 gap-x-3 gap-y-4 md:grid-cols-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="space-y-1.5">
                    <Skeleton className="h-2.5 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </div>
              <Skeleton className="h-9 w-[100px]" />
              <div className="h-px w-full bg-border" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!combinations || !combinations?.length) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-semibold sm:text-2xl">
          Combinations Inventory
        </h1>
        <div className="flex flex-col items-center justify-center gap-y-2 py-32">
          <ShieldQuestion className="size-10" />
          <h1 className="text-lg">No Combination Found!</h1>
          <p className="text-muted-foreground">
            Load all combinations for the product.
          </p>
          <Button
            loading={isLoadingCombinations}
            variant={"outline"}
            icon={ListRestart}
            onClick={() => loadCombinations({ productId })}
          >
            Load All
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold sm:text-2xl">
        Combinations Inventory
      </h1>

      <div className="flex items-center gap-x-3">
        <Button
          variant={"outline"}
          icon={ListRestart}
          loading={isLoadingCombinations}
          onClick={() => loadCombinations({ productId })}
        >
          Load Rest
        </Button>
        <Button
          variant={"destructive"}
          icon={Trash2}
          onClick={() =>
            onDelete({
              description:
                "All the combinations and their data will be deleted permanently.",
              onConfirm: () => deleteProductCombinations({ productId }),
              onSuccess: refetch,
            })
          }
        >
          Delete All
        </Button>
      </div>

      <Form {...form}>
        <form className="space-y-4" onSubmit={onSubmit}>
          <FormError />
          <Accordion
            type="multiple"
            defaultValue={combinations.map(({ id }) => id)}
          >
            {combinations.map((comb, index) => (
              <AccordionItem value={comb.id} key={comb.id}>
                <AccordionTrigger>
                  <div className="flex items-center">
                    {comb.combinationVariantValues
                      .sort((a, b) =>
                        b.variantValue.variantId.localeCompare(
                          a.variantValue.variantId,
                        ),
                      )
                      .map((val, i) => (
                        <p
                          key={val.variantValueId}
                          className="flex items-center"
                        >
                          {val.variantValue.name}
                          <sub className="ml-1 text-muted-foreground">
                            ({val.variantValue.value})
                          </sub>
                          {comb.combinationVariantValues.length - 1 !== i && (
                            <X className="mx-2 size-4 text-muted-foreground" />
                          )}
                        </p>
                      ))}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 px-0.5">
                  <CombinationFormField
                    index={index}
                    disabled={isUpdating}
                    combinationId={comb.id}
                    onRefetch={refetch}
                  />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="grid grid-cols-2 items-center justify-between gap-x-4 md:flex">
            <Button
              disabled={isUpdating}
              type="button"
              variant={"outline"}
              onClick={prevStep}
            >
              Back
            </Button>
            <Button
              type="submit"
              className="w-full md:w-[100px]"
              loading={isUpdating}
            >
              Continue
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
