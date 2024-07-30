"use client"

import { Trash2 } from "lucide-react"
import { useFormContext, useWatch } from "react-hook-form"
import { useParams } from "next/navigation"

import { SaleDuration } from "../../../../_components/sale-duration"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useConfirmModal } from "@/stores/use-confirm-modal"
import { UpdateProductCombinationsSchema } from "@/utils/validations/product"
import { deleteProductCombinationById } from "@/actions/product"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

type CombinationFormFieldProps = {
  index: number
  disabled?: boolean
  combinationId: string
  onRefetch: () => void
}

export function CombinationFormField({
  index,
  disabled,
  combinationId,
  onRefetch,
}: CombinationFormFieldProps) {
  const { productId }: { productId: string } = useParams()
  const { onOpen } = useConfirmModal()

  const form = useFormContext<UpdateProductCombinationsSchema>()
  const saleDuration = useWatch({
    control: form.control,
    name: `combinations.${index}.saleDuration`,
  })

  function deleteCombination() {
    onOpen({
      description: "This combination will be deleted permanently.",
      onConfirm: () =>
        deleteProductCombinationById({ combinationId, productId }),
      onSuccess: onRefetch,
    })
  }

  return (
    <>
      <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
        <FormField
          control={form.control}
          name={`combinations.${index}.price`}
          disabled={disabled}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price</FormLabel>
              <FormControl>
                <Input autoFocus={index === 0} placeholder="1200" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`combinations.${index}.stock`}
          disabled={disabled}
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

      <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
        <FormField
          control={form.control}
          name={`combinations.${index}.salePrice`}
          disabled={disabled}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sale Price</FormLabel>
              <FormControl>
                <Input placeholder="999" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`combinations.${index}.saleDuration`}
          disabled={disabled}
          render={({ field }) => {
            return (
              <FormItem>
                <FormLabel>Sale Duration</FormLabel>
                <SaleDuration
                  disabled={disabled}
                  value={saleDuration}
                  onChange={field.onChange}
                />
                <FormMessage />
              </FormItem>
            )
          }}
        />
      </div>

      <Button
        size="sm"
        type="button"
        variant={"destructive"}
        icon={Trash2}
        onClick={deleteCombination}
      >
        Delete
      </Button>
    </>
  )
}
