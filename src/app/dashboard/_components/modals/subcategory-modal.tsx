"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { useQuery } from "@tanstack/react-query"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAction } from "next-safe-action/hooks"

import { parseError } from "@/utils/error"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useSubcategoryModal } from "@/stores/use-subcategory-modal"
import { getCategories } from "@/queries/category"
import { createSubcategory, updateSubcategory } from "@/actions/category"
import { useInvalidateQueries } from "@/hooks/use-invalidate-queries"
import {
  SubcategorySchema,
  subcategorySchema,
} from "@/utils/validations/category"

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
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
  SelectItem,
} from "@/components/ui/select"

export function SubategoryModal() {
  const { isOpen, onOpenChange, initialData } = useSubcategoryModal()
  const { invalidate } = useInvalidateQueries()

  const form = useForm<SubcategorySchema>({
    resolver: zodResolver(subcategorySchema),
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
      form.setValue("categoryId", initialData?.categoryId)
    }
  }, [initialData, form])

  const { data: categories, isFetching } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => await getCategories(),
  })

  function onSuccess() {
    handleOpenChange(false)
    invalidate(["subcategories", "categories"])
  }

  const { execute: create, isExecuting: isCreating } = useAction(
    createSubcategory,
    {
      onSuccess,
      onError({ error }) {
        const message = parseError(error)
        form.setError("root", { message })
      },
    },
  )

  const { execute: update, isExecuting: isUpdating } = useAction(
    updateSubcategory,
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
      update({ ...values, subcategoryId: initialData.subcategoryId })
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
            {!!initialData ? "Update" : "Create"} Subategory
          </ModalTitle>
        </ModalHeader>

        <ModalBody>
          <Form {...form}>
            <FormError />
            <form
              id="subcategory-form"
              onSubmit={onSubmit}
              className="flex flex-col gap-4"
            >
              <FormField
                control={form.control}
                name="name"
                disabled={isPending}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input autoFocus placeholder="Shirts" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="categoryId"
                disabled={isPending}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      disabled={isPending}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger loading={isFetching}>
                          <SelectValue placeholder="Select a parent category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories?.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
          <Button type="submit" loading={isPending} form="subcategory-form">
            {!!initialData ? "Update" : "Create"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
