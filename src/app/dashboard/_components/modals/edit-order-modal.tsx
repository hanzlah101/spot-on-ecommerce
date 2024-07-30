"use client"

import { useEffect, useMemo } from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAction } from "next-safe-action/hooks"

import { parseError } from "@/utils/error"
import { Button } from "@/components/ui/button"
import { useEditOrderModal } from "@/stores/use-edit-order-modal"
import { editOrder } from "@/actions/order"
import { Calendar } from "@/components/ui/calendar"
import { EditOrderSchema, editOrderSchema } from "@/utils/validations/order"
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

import {
  orderPaymentMethodsEnum,
  orderPaymentStatusEnum,
  orderStatusEnum,
} from "@/db/schema"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/utils"

export function EditOrderModal() {
  const { isOpen, onOpenChange, initialData } = useEditOrderModal()

  const form = useForm<EditOrderSchema>({
    resolver: zodResolver(editOrderSchema),
    defaultValues: initialData,
  })

  const orderStatus = useWatch({
    control: form.control,
    name: "status",
  })

  const dateField = useMemo(() => {
    switch (orderStatus) {
      case "dispatched":
        return "dispatchedAt"
      case "shipped":
        return "shippedAt"
      case "delivered":
        return "deliveredAt"
      case "cancelled":
        return "cancelledAt"
    }
  }, [orderStatus])

  const { execute: update, isExecuting } = useAction(editOrder, {
    onSuccess() {
      handleOpenChange(false)
    },
    onError({ error }) {
      const message = parseError(error)
      form.setError("root", { message })
    },
  })

  const onSubmit = form.handleSubmit((values) => {
    if (!initialData) return
    update({ ...values, orderId: initialData?.orderId })
  })

  function handleOpenChange(open: boolean) {
    onOpenChange(open)
    if (!open) form.reset()
  }

  useEffect(() => {
    const now = new Date()

    if (initialData) {
      form.setValue("status", initialData?.status)
      form.setValue("paymentStatus", initialData?.paymentStatus)
      form.setValue("paymentMethod", initialData?.paymentMethod)
      form.setValue("estDeliveryDate", initialData?.estDeliveryDate)
      form.setValue("dispatchedAt", initialData?.dispatchedAt ?? now)
      form.setValue("shippedAt", initialData?.shippedAt ?? now)
      form.setValue("deliveredAt", initialData?.deliveredAt ?? now)
      form.setValue("cancelledAt", initialData?.cancelledAt ?? now)
    }
  }, [initialData, form])

  if (!initialData) {
    return null
  }

  return (
    <Modal open={isOpen} onOpenChange={handleOpenChange}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Edit order</ModalTitle>
          <ModalDescription>
            Change order status & respective dates
          </ModalDescription>
        </ModalHeader>

        <ModalBody>
          <Form {...form}>
            <form
              id="edit-order-form"
              onSubmit={onSubmit}
              className="flex flex-col gap-4"
            >
              <FormError />
              <div
                className={cn(
                  "grid grid-cols-1 gap-4",
                  dateField ? "md:grid-cols-2" : "md:grid-cols-1",
                )}
              >
                <FormField
                  control={form.control}
                  name="status"
                  disabled={isExecuting}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isExecuting}
                      >
                        <FormControl>
                          <SelectTrigger disabled={isExecuting}>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {orderStatusEnum.enumValues.map((value) => (
                            <SelectItem
                              key={value}
                              value={value}
                              className="capitalize"
                            >
                              {value}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {dateField ? (
                  <FormField
                    control={form.control}
                    name={dateField}
                    disabled={isExecuting}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="capitalize">
                          {dateField.split("At")[0]} At
                        </FormLabel>
                        <FormControl>
                          <Popover>
                            <FormControl>
                              <PopoverTrigger
                                disabled={isExecuting}
                                className={cn(
                                  "flex h-10 w-full items-center justify-between rounded-md border border-input bg-input/50 px-3.5 text-sm transition disabled:pointer-events-none disabled:opacity-50 data-[state=open]:border-input/50 data-[state=open]:ring-2 data-[state=open]:ring-foreground/30",
                                  !field.value && "text-muted-foreground",
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "LLL dd, yyyy")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </PopoverTrigger>
                            </FormControl>

                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                  date > new Date() ||
                                  date < new Date("1900-01-01") ||
                                  isExecuting
                                }
                              />
                            </PopoverContent>
                          </Popover>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : null}
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="paymentMethod"
                  disabled={isExecuting}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment method</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isExecuting}
                      >
                        <FormControl>
                          <SelectTrigger disabled={isExecuting}>
                            <SelectValue placeholder="Select method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {orderPaymentMethodsEnum.enumValues.map((value) => (
                            <SelectItem
                              key={value}
                              value={value}
                              className="capitalize"
                            >
                              {value}
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
                  name="paymentStatus"
                  disabled={isExecuting}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isExecuting}
                      >
                        <FormControl>
                          <SelectTrigger disabled={isExecuting}>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {orderPaymentStatusEnum.enumValues.map((value) => (
                            <SelectItem
                              key={value}
                              value={value}
                              className="capitalize"
                            >
                              {value}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {orderStatus !== "delivered" && orderStatus !== "cancelled" ? (
                <FormField
                  control={form.control}
                  name={"estDeliveryDate"}
                  disabled={isExecuting}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Est. delivery date</FormLabel>
                      <FormControl>
                        <Popover>
                          <FormControl>
                            <PopoverTrigger
                              disabled={isExecuting}
                              className={cn(
                                "flex h-10 w-full items-center justify-between rounded-md border border-input bg-input/50 px-3.5 text-sm transition disabled:pointer-events-none disabled:opacity-50 data-[state=open]:border-input/50 data-[state=open]:ring-2 data-[state=open]:ring-foreground/30",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              {field.value ? (
                                format(field.value, "LLL dd, yyyy")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </PopoverTrigger>
                          </FormControl>

                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date <
                                  new Date(new Date().setHours(0, 0, 0, 0)) ||
                                isExecuting
                              }
                            />
                          </PopoverContent>
                        </Popover>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : null}
            </form>
          </Form>
        </ModalBody>
        <ModalFooter>
          <ModalClose asChild>
            <Button disabled={isExecuting} variant={"outline"} type="button">
              Close
            </Button>
          </ModalClose>
          <Button type="submit" loading={isExecuting} form="edit-order-form">
            Update
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
