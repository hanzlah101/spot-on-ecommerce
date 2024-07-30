"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAction } from "next-safe-action/hooks"

import { parseError } from "@/utils/error"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCategoryModal } from "@/stores/use-category-modal"
import { Textarea } from "@/components/ui/textarea"
import { createCategory, updateCategory } from "@/actions/category"
import { CategorySchema, categorySchema } from "@/utils/validations/category"
import { useInvalidateQueries } from "@/hooks/use-invalidate-queries"
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

export function CategoryModal() {
  const { isOpen, onOpenChange, initialData } = useCategoryModal()
  const { invalidate } = useInvalidateQueries()

  const form = useForm<CategorySchema>({
    resolver: zodResolver(categorySchema),
    defaultValues: initialData
      ? initialData
      : {
          name: "",
          description: "",
        },
  })

  useEffect(() => {
    if (initialData) {
      form.setValue("name", initialData?.name)
      form.setValue("description", initialData?.description)
    }
  }, [initialData, form])

  function onSuccess() {
    handleOpenChange(false)
    invalidate(["subcategories", "categories"])
  }

  const { execute: create, isExecuting: isCreating } = useAction(
    createCategory,
    {
      onSuccess,
      onError({ error }) {
        const message = parseError(error)
        form.setError("root", { message })
      },
    },
  )

  const { execute: update, isExecuting: isUpdating } = useAction(
    updateCategory,
    {
      onSuccess,
      onError({ error }) {
        const message = parseError(error)
        form.setError("root", { message })
      },
    },
  )

  const isPending = isUpdating || isCreating

  const onSubmit = form.handleSubmit((values) => {
    if (!!initialData) {
      update({ ...values, categoryId: initialData.categoryId })
    } else {
      create(values)
    }
  })

  function handleOpenChange(open: boolean) {
    onOpenChange(open)
    if (!open) form.reset()
  }

  return (
    <Modal open={isOpen} onOpenChange={handleOpenChange}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>
            {!!initialData ? "Update" : "Create"} Category
          </ModalTitle>
        </ModalHeader>

        <ModalBody>
          <Form {...form}>
            <form
              id="category-form"
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
                      <Input autoFocus placeholder="Accessories" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                disabled={isPending}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Short description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </ModalBody>
        <ModalFooter>
          <ModalClose asChild>
            <Button disabled={isPending} variant={"outline"} type="button">
              Close
            </Button>
          </ModalClose>
          <Button type="submit" loading={isPending} form="category-form">
            {!!initialData ? "Update" : "Create"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
