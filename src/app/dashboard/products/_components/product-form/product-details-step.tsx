"use client"

import dynamic from "next/dynamic"
import { useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useParams } from "next/navigation"
import { useAction } from "next-safe-action/hooks"

import { isEqual } from "@/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { productTypeEnum } from "@/db/schema"
import {
  ProductDetailsSchema,
  productDetailsSchema,
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

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { CategorySelect } from "./category-select"
import { parseError } from "@/utils/error"
import { useStepper } from "@/hooks/use-stepper"
import { createProduct, updateProductDetails } from "@/actions/product"

const Editor = dynamic(() => import("@/components/editor"), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] w-full rounded-md border border-input bg-input/50" />
  ),
})

type ProductDetailsStepProps = {
  initialData?: ProductDetailsSchema
}

export function ProductDetailsStep({ initialData }: ProductDetailsStepProps) {
  const { nextStep } = useStepper()
  const { productId }: { productId: string } = useParams()

  const form = useForm<ProductDetailsSchema>({
    resolver: zodResolver(productDetailsSchema),
    defaultValues: initialData
      ? initialData
      : {
          title: "",
          shortDescription: "",
        },
  })

  const formType = useMemo(() => {
    if (!!initialData) {
      return "Continue"
    } else {
      return "Create"
    }
  }, [initialData])

  const { execute: create, isExecuting: isCreating } = useAction(
    createProduct,
    {
      onError({ error }) {
        const message = parseError(error)
        form.setError("root", { message })
      },
    },
  )

  const { execute: update, isExecuting: isUpdating } = useAction(
    updateProductDetails,
    {
      onError({ error }) {
        console.error({ error })
        const message = parseError(error)
        form.setError("root", { message })
      },
    },
  )

  const isPending = isCreating || isUpdating

  const onSubmit = form.handleSubmit((values) => {
    if (!!initialData) {
      if (isEqual(initialData, values)) return nextStep()
      update({ ...values, productId })
    } else {
      create(values)
    }
  })

  useEffect(() => {
    if (initialData) {
      form.setValue("title", initialData.title)
      form.setValue("shortDescription", initialData.shortDescription)
      form.setValue("longDescription", initialData.longDescription)
      form.setValue("categoryId", initialData.categoryId)
      form.setValue("subcategoryId", initialData.subcategoryId)
      form.setValue("type", initialData.type)
    }
  }, [initialData, form])

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-4">
        <h1 className="text-xl font-semibold sm:text-2xl">
          Title & Description
        </h1>

        <FormError />

        <FormField
          control={form.control}
          name="title"
          disabled={isPending}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input autoFocus placeholder="Title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          disabled={isPending}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select
                disabled={isPending}
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger disabled={isPending}>
                    <SelectValue placeholder="Select product type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {productTypeEnum.enumValues.map((val) => (
                    <SelectItem key={val} value={val} className="capitalize">
                      {val}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <CategorySelect disabled={isPending} />

        <FormField
          control={form.control}
          name="shortDescription"
          disabled={isPending}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Short Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Describe your product" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="longDescription"
          disabled={isPending}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Long Description</FormLabel>
              <FormControl>
                <Editor
                  editable
                  disabled={isPending}
                  initialValue={field.value}
                  onValueChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" loading={isPending}>
          {formType}
        </Button>
      </form>
    </Form>
  )
}
