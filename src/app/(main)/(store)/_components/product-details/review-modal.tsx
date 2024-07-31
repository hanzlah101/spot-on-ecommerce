"use client"

import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAction } from "next-safe-action/hooks"
import { useParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"

import { Button } from "@/components/ui/button"
import { ReviewSchema, reviewSchema } from "@/utils/validations/review"
import { Textarea } from "@/components/ui/textarea"
import { EditableRatingStars } from "../editable-rating-stars"
import { parseError } from "@/utils/error"
import { createReview, updateReview } from "@/actions/review"
import { useInvalidateQueries } from "@/hooks/use-invalidate-queries"
import { canReviewProduct } from "@/queries/review"
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
  isLoggedIn: boolean
}

export function ReviewModal({ isLoggedIn }: ReviewModalProps) {
  const { productId }: { productId: string } = useParams()
  const { invalidate } = useInvalidateQueries()

  const [open, setOpen] = useState(false)

  const { data, isFetching } = useQuery({
    queryKey: ["can-review", productId],
    queryFn: async () => await canReviewProduct(productId),
  })

  const { canReview, prevReview } = data ?? {
    canReview: false,
    prevReview: null,
  }

  function handleOpenChange(open: boolean) {
    setOpen(open)
    if (!open) {
      form.reset()
    }
  }

  const form = useForm<ReviewSchema>({
    resolver: zodResolver(reviewSchema),
    defaultValues: prevReview ?? {
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
      invalidate(["product-reviews", "can-review"])
    },
  })

  const { isExecuting: isUpdating, execute: update } = useAction(updateReview, {
    onError({ error }) {
      const message = parseError(error)
      form.setError("root", { message })
    },
    onSuccess() {
      handleOpenChange(false)
      invalidate(["product-reviews", "can-review"])
    },
  })

  const isPending = isCreating || isUpdating

  const onSubmit = form.handleSubmit((values) => {
    if (prevReview) {
      update({ ...values, productId, reviewId: prevReview.id })
    } else {
      create({ ...values, productId })
    }
  })

  const buttonLabel = useMemo(() => {
    if (!isLoggedIn) {
      return "Login to review"
    } else if (isFetching) {
      return "Loading..."
    } else if (!!prevReview) {
      return "Edit your review"
    } else if (canReview) {
      return "Write a review"
    } else {
      return "Order to review"
    }
  }, [isLoggedIn, isFetching, prevReview, canReview])

  useEffect(() => {
    form.setValue("rating", prevReview?.rating ?? 5)
    form.setValue("description", prevReview?.description ?? "")
  }, [prevReview, form])

  return (
    <Modal open={open} onOpenChange={handleOpenChange}>
      <ModalTrigger asChild>
        <Button disabled={!canReview} className="h-12 rounded-full text-base">
          {buttonLabel}
        </Button>
      </ModalTrigger>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>{!!prevReview ? "Edit" : "Post"} Review</ModalTitle>
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
            {prevReview ? "Update changes" : "Post"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
