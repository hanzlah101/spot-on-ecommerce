"use client"

import Image from "next/image"
import { createId } from "@paralleldrive/cuid2"
import { useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { PlusCircle, X } from "lucide-react"
import { HexColorPicker } from "react-colorful"
import { useForm, useFieldArray, useWatch } from "react-hook-form"
import { useAction } from "next-safe-action/hooks"

import { cn, isColor } from "@/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { parseError } from "@/utils/error"
import { useVariantModal } from "@/stores/use-variant-modal"
import { useInvalidateQueries } from "@/hooks/use-invalidate-queries"
import { FileUploader } from "@/components/ui/file-uploader"
import { createVariant, updateVariant } from "@/actions/variant"
import { VariantSchema, variantSchema } from "@/utils/validations/variant"
import {
  Modal,
  ModalBody,
  ModalClose,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/modal"

import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormLabel,
  FormMessage,
  FormError,
} from "@/components/ui/form"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export function VariantModal() {
  const { isOpen, onOpenChange, initialData } = useVariantModal()

  const { invalidate } = useInvalidateQueries()

  const form = useForm<VariantSchema>({
    resolver: zodResolver(variantSchema),
    defaultValues: initialData
      ? initialData
      : {
          name: "",
          values: [{ id: createId(), name: "", value: "" }],
        },
  })

  const variantName = useWatch({
    control: form.control,
    name: "name",
  })

  const color = isColor(variantName)

  const { append, remove, fields } = useFieldArray({
    control: form.control,
    name: "values",
  })

  function handleOpenChange(open: boolean) {
    onOpenChange(open)
    if (!open) form.reset()
  }

  function onSuccess() {
    handleOpenChange(false)
    invalidate(["variants"])
  }

  const { execute: update, isExecuting: isUpdating } = useAction(
    updateVariant,
    {
      onSuccess,
      onError({ error }) {
        const message = parseError(error)
        form.setError("root", { message })
      },
    },
  )

  const { execute: create, isExecuting: isCreating } = useAction(
    createVariant,
    {
      onSuccess,
      onError({ error }) {
        const message = parseError(error)
        form.setError("root", { message })
      },
    },
  )

  const isPending = isUpdating || isCreating

  const guide = useWatch({
    control: form.control,
    name: "guideImage",
  })

  useEffect(() => {
    if (initialData) {
      form.setValue("name", initialData?.name)
      form.setValue("guideImage", initialData?.guideImage)
      form.setValue("values", initialData?.values)
      form.setValue("slug", initialData?.slug)
    }
  }, [initialData, form])

  const onSubmit = form.handleSubmit((values) => {
    if (!!initialData) {
      update({ ...values, variantId: initialData.variantId })
    } else {
      create(values)
    }
  })

  return (
    <Modal open={isOpen} onOpenChange={handleOpenChange}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>{!!initialData ? "Update" : "Create"} Variant</ModalTitle>
        </ModalHeader>

        <ModalBody>
          <Form {...form}>
            <form
              id="variant-form"
              onSubmit={onSubmit}
              className="flex flex-col gap-4"
            >
              <FormError />
              <FormField
                control={form.control}
                name="name"
                disabled={isPending}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input autoFocus placeholder="Color" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                disabled={isPending}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input placeholder="color" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="guideImage"
                disabled={isPending}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Guide</FormLabel>
                    <FormControl>
                      <FileUploader
                        multiple={false}
                        maxFiles={1}
                        folder="guides"
                        className="overflow-hidden"
                        onSuccess={([uploadedFile]) =>
                          uploadedFile
                            ? field.onChange(uploadedFile)
                            : undefined
                        }
                      >
                        {guide ? (
                          <>
                            <Image
                              fill
                              src={guide.url}
                              alt="guide"
                              className="object-cover"
                            />
                            <Button
                              type="button"
                              size="icon"
                              disabled={isPending}
                              variant={"destructive"}
                              aria-label="Remove guide"
                              className="absolute right-2 top-2 h-6 w-6 opacity-0 transition-opacity disabled:opacity-0 group-hover:opacity-100"
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                field.onChange(null)
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        ) : null}
                      </FileUploader>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex w-full flex-col space-y-2">
                <h1 className="text-lg font-semibold">Values</h1>
                <ul className="list-none space-y-4">
                  {fields.map((field, index) => (
                    <li key={field.id}>
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-muted-foreground">
                          {variantName} #{index + 1}
                        </h3>
                        {fields.length > 1 && (
                          <Button
                            type="button"
                            variant={"destructive"}
                            onClick={() => remove(index)}
                            className="h-6 w-6 shrink-0"
                            size={"icon"}
                            disabled={isPending}
                            aria-label={`Remove #${index + 1}`}
                            title={`Remove #${index + 1}`}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <FormField
                          control={form.control}
                          name={`values.${index}.name`}
                          disabled={isPending}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Name</FormLabel>
                              <FormControl>
                                <Input placeholder="White" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`values.${index}.value`}
                          disabled={isPending}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Value</FormLabel>
                              <div className="relative w-full">
                                <FormControl>
                                  <Input
                                    placeholder="#FFFFFF"
                                    className={cn(color && "pl-9")}
                                    {...field}
                                  />
                                </FormControl>
                                {color && (
                                  <Popover>
                                    <PopoverTrigger
                                      disabled={isPending}
                                      className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 rounded-md border disabled:pointer-events-none disabled:opacity-50"
                                      style={{
                                        backgroundColor: field.value
                                          ? field.value
                                          : "hsl(var(--foreground))",
                                      }}
                                    />
                                    <PopoverContent className="w-auto border-0 p-0 shadow-none">
                                      <HexColorPicker
                                        color={field.value}
                                        onChange={field.onChange}
                                      />
                                    </PopoverContent>
                                  </Popover>
                                )}
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </li>
                  ))}
                </ul>

                <Button
                  type="button"
                  variant={"outline"}
                  disabled={isPending}
                  className="ml-auto"
                  icon={PlusCircle}
                  onClick={() =>
                    append({ id: createId(), value: "", name: "" })
                  }
                >
                  Add Value
                </Button>
              </div>
            </form>
          </Form>
        </ModalBody>
        <ModalFooter>
          <ModalClose asChild>
            <Button disabled={isPending} variant={"outline"} type="button">
              Close
            </Button>
          </ModalClose>
          <Button type="submit" form="variant-form" loading={isPending}>
            {!!initialData ? "Update" : "Create"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
