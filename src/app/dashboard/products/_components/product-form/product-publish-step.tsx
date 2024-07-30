"use client"

import { useEffect } from "react"
import { OctagonAlert } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAction } from "next-safe-action/hooks"

import { isEqual } from "@/utils"
import { parseError } from "@/utils/error"
import { Button } from "@/components/ui/button"
import { useStepper } from "@/hooks/use-stepper"
import { userRoleEnum } from "@/db/schema"
import { TagInput } from "@/components/ui/tag-input"
import { RadioGroup, RadioGroupCardItem } from "@/components/ui/radio-group"

import {
  PublishProductSchema,
  publishProductSchema,
} from "@/utils/validations/product"

import {
  productLabelItems,
  productStatusItems,
} from "@/utils/constants/products"

import {
  Form,
  FormControl,
  FormError,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { publishProduct } from "@/actions/product"

type ProductPublishStepProps = {
  initialData: PublishProductSchema
  userRole: (typeof userRoleEnum.enumValues)[number]
}

export function ProductPublishStep({
  initialData,
  userRole,
}: ProductPublishStepProps) {
  const router = useRouter()
  const { prevStep } = useStepper()
  const { productId }: { productId: string } = useParams()

  const form = useForm<PublishProductSchema>({
    resolver: zodResolver(publishProductSchema),
    defaultValues: initialData
      ? initialData
      : {
          tags: [],
          label: "none",
          status: "draft",
        },
  })

  const { execute: update, isExecuting } = useAction(publishProduct, {
    onError({ error }) {
      const message = parseError(error)
      form.setError("root", { message })
    },
  })

  const onSubmit = form.handleSubmit((values) => {
    if (isEqual(initialData, values)) {
      router.push("/dashboard/products")
      return
    }

    update({ ...values, productId })
  })

  const isModerator = userRole === "moderator"

  useEffect(() => {
    if (initialData) {
      form.setValue("label", initialData.label)
      form.setValue("status", initialData.status)
      form.setValue("tags", initialData.tags)
    }
  }, [initialData, form])

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-4">
        <h1 className="text-xl font-semibold sm:text-2xl">Tags & Publish</h1>

        {isModerator && (
          <div className="flex items-center gap-x-3 rounded-md border border-primary bg-primary/10 px-3 py-2 text-primary">
            <OctagonAlert className="h-5 w-5 shrink-0" />
            <h3 className="font-medium">
              Only admins can change product status & label
            </h3>
          </div>
        )}

        <FormError />

        <FormField
          control={form.control}
          name="tags"
          disabled={isExecuting}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product tags</FormLabel>
              <FormControl>
                <TagInput
                  disabled={isExecuting}
                  initialKeywords={field.value}
                  onKeywordsChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="label"
          disabled={isExecuting || isModerator}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Label</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isExecuting || isModerator}
                  className="grid grid-cols-1 md:grid-cols-3"
                >
                  {productLabelItems.map((item) => (
                    <FormItem key={item.value}>
                      <FormControl>
                        <RadioGroupCardItem
                          disabled={isExecuting || isModerator}
                          value={item.value}
                        >
                          <div className="flex items-start gap-x-3">
                            {item.icon && (
                              <item.icon className="h-8 w-8 shrink-0" />
                            )}
                            <div className="flex flex-col items-start text-start">
                              <h3 className="text-[17px] capitalize text-foreground">
                                {item.label}
                              </h3>
                              <h3 className="text-[15px] text-muted-foreground">
                                {item.description}
                              </h3>
                            </div>
                          </div>
                        </RadioGroupCardItem>
                      </FormControl>
                    </FormItem>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          disabled={isExecuting || isModerator}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isExecuting || isModerator}
                  className="grid grid-cols-1 md:grid-cols-3"
                >
                  {productStatusItems.map((item) => (
                    <FormItem key={item.value}>
                      <FormControl>
                        <RadioGroupCardItem
                          value={item.value}
                          disabled={isExecuting || isModerator}
                        >
                          <div className="flex items-start gap-x-3">
                            {item.icon && (
                              <item.icon className="h-8 w-8 shrink-0" />
                            )}
                            <div className="flex flex-col items-start text-start">
                              <h3 className="text-[17px] capitalize text-foreground">
                                {item.label}
                              </h3>
                              <h3 className="text-[15px] text-muted-foreground">
                                {item.description}
                              </h3>
                            </div>
                          </div>
                        </RadioGroupCardItem>
                      </FormControl>
                    </FormItem>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="py-4">
          <div className="h-px w-full bg-border" />
        </div>

        <div className="grid grid-cols-2 items-center justify-between gap-x-4 md:flex">
          <Button
            type="button"
            variant={"outline"}
            onClick={prevStep}
            disabled={isExecuting}
          >
            Back
          </Button>
          <Button
            type="submit"
            loading={isExecuting}
            className="w-full md:w-[73px]"
          >
            Finish
          </Button>
        </div>
      </form>
    </Form>
  )
}
