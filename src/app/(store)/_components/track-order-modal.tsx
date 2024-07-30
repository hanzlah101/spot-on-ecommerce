"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAction } from "next-safe-action/hooks"

import { useTrackOrderModal } from "@/stores/use-track-order-modal"
import {
  Modal,
  ModalBody,
  ModalClose,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
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

import {
  ValidateOrderSchema,
  validateOrderSchema,
} from "@/utils/validations/order"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { validateOrderByTrackingId } from "@/actions/order"
import { parseError } from "@/utils/error"

export function TrackOrderModal() {
  const { isOpen, onOpenChange } = useTrackOrderModal()

  const form = useForm<ValidateOrderSchema>({
    resolver: zodResolver(validateOrderSchema),
    defaultValues: {
      trackingId: "",
    },
  })

  const { execute: validate, isExecuting } = useAction(
    validateOrderByTrackingId,

    {
      onSuccess() {
        form.setValue("trackingId", "")
        onOpenChange(false)
      },
      onError({ error }) {
        const message = parseError(error)
        form.setError("root", { message })
      },
    },
  )

  const onSubmit = form.handleSubmit((values) => {
    validate(values)
  })

  return (
    <Modal open={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Track order</ModalTitle>
          <ModalDescription>
            Input your tracking id below to track your order
          </ModalDescription>
        </ModalHeader>

        <ModalBody>
          <Form {...form}>
            <form
              id="validate-tracking-id-form"
              onSubmit={onSubmit}
              className="space-y-4"
            >
              <FormError />
              <FormField
                control={form.control}
                name="trackingId"
                disabled={isExecuting}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tracking Id</FormLabel>
                    <FormControl>
                      <Input autoFocus placeholder="936482946742" {...field} />
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
            <Button disabled={isExecuting} variant={"outline"} type="button">
              Close
            </Button>
          </ModalClose>
          <Button
            type="submit"
            form="validate-tracking-id-form"
            loading={isExecuting}
          >
            Track
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
