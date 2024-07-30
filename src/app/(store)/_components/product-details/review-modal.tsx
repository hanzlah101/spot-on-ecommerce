"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAction } from "next-safe-action/hooks"
import { useParams } from "next/navigation"

import type { Review } from "@/db/schema"
import { Button } from "@/components/ui/button"
import { ReviewSchema, reviewSchema } from "@/utils/validations/review"
import { Textarea } from "@/components/ui/textarea"
import { EditableRatingStars } from "../editable-rating-stars"
import { parseError } from "@/utils/error"
import { createReview, updateReview } from "@/actions/review"
import {
  Modal,
  ModalBody,
  ModalClose,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  ModalTrigger,
} from "@/components/ui/modal"

import {
  Form,
  FormControl,
  FormError,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

type ReviewModalProps = {
  canReview: boolean
  initialData: Review | null
}

export function ReviewModal({ initialData, canReview }: ReviewModalProps) {
  const { productId }: { productId: string } = useParams()

  const [open, setOpen] = useState(false)

  function handleOpenChange(open: boolean) {
    setOpen(open)
    if (!open) {
      form.reset()
    }
  }

  const form = useForm<ReviewSchema>({
    resolver: zodResolver(reviewSchema),
    defaultValues: initialData ?? {
      rating: 5,
      description: "",
    },
  })

  const { isExecuting: isCreating, execute: create } = useAction(createReview, {
    onError({ error }) {
      const message = parseError(error)
      form.setError("root", { message })
    },
    onSuccess() {
      handleOpenChange(false)
    },
  })

  const { isExecuting: isUpdating, execute: update } = useAction(updateReview, {
    onError({ error }) {
      const message = parseError(error)
      form.setError("root", { message })
    },
    onSuccess() {
      handleOpenChange(false)
    },
  })

  const isPending = isCreating || isUpdating

  const onSubmit = form.handleSubmit(async (values) => {
    if (initialData) {
      update({ ...values, productId, reviewId: initialData.id })
    } else {
      create({ ...values, productId })
    }
  })

  useEffect(() => {
    form.setValue("rating", initialData?.rating ?? 5)
    form.setValue("description", initialData?.description ?? "")
  }, [initialData, form])

  return (
    <Modal open={open} onOpenChange={handleOpenChange}>
      <ModalTrigger asChild>
        <Button disabled={!canReview} className="h-12 rounded-full text-base">
          {!!initialData
            ? "Edit your review"
            : canReview
              ? "Write a review"
              : "Order to review"}
        </Button>
      </ModalTrigger>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>{!!initialData ? "Edit" : "Post"} Review</ModalTitle>
          <ModalDescription>
            Kindly provide your feedback on the product you&apos;ve purchased
          </ModalDescription>
        </ModalHeader>
        <ModalBody>
          <Form {...form}>
            <form id="review-form" onSubmit={onSubmit} className="space-y-4">
              <FormError />
              <FormField
                control={form.control}
                name="rating"
                disabled={isPending}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <EditableRatingStars
                        disabled={isPending}
                        rating={field.value}
                        onRatingChange={field.onChange}
                      />
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
                    <FormLabel>Wtite your review</FormLabel>
                    <FormControl>
                      <Textarea
                        autoFocus
                        placeholder="Best product I've ever used in my life"
                        {...field}
                      />
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
          <Button type="submit" form="review-form" loading={isPending}>
            {initialData ? "Update changes" : "Post"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
