"use client"

import { useEffect } from "react"
import { useParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAction } from "next-safe-action/hooks"

import { ImageSelect } from "./image-select"
import { SaleDuration } from "../../../_components/sale-duration"

import { isEqual } from "@/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useStepper } from "@/hooks/use-stepper"
import { parseError } from "@/utils/error"
import { updateSimpleProductInventory } from "@/actions/product"
import {
  SimpleProductInventorySchema,
  simpleProductInventorySchema,
} from "@/utils/validations/product"

import {
  Form,
  FormControl,
  FormError,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

type SimpleProductInventoryStepProps = {
  initialData: SimpleProductInventorySchema
}

export function SimpleProductInventoryStep({
  initialData,
}: SimpleProductInventoryStepProps) {
  const { nextStep, prevStep } = useStepper()
  const { productId }: { productId: string } = useParams()

  const form = useForm<SimpleProductInventorySchema>({
    resolver: zodResolver(simpleProductInventorySchema),
    defaultValues: initialData,
  })

  const { execute: update, isExecuting } = useAction(
    updateSimpleProductInventory,
    {
      onError({ error }) {
        const message = parseError(error)
        form.setError("root", { message })
      },
    },
  )

  const onSubmit = form.handleSubmit((values) => {
    if (isEqual(initialData, values)) return nextStep()
    update({ ...values, productId })
  })

  useEffect(() => {
    if (initialData) {
      form.setValue("price", initialData.price)
      form.setValue("stock", initialData.stock)
      form.setValue("salePrice", initialData.salePrice)
      form.setValue("saleDuration", initialData.saleDuration)
      form.setValue("images", initialData.images)
    }
  }, [initialData, form])

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-4">
        <h1 className="text-xl font-semibold sm:text-2xl">Pricing & Stock</h1>

        <FormError />

        <FormField
          control={form.control}
          name="price"
          disabled={isExecuting}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price</FormLabel>
              <FormControl>
                <Input autoFocus placeholder="1499" {...field} />
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
