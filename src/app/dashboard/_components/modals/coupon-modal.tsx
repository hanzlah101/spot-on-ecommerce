"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAction } from "next-safe-action/hooks"

import { SaleDuration } from "../sale-duration"

import { parseError } from "@/utils/error"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { couponCodeAmountTypeEnum } from "@/db/schema"
import { useCouponModal } from "@/stores/use-coupon-modal"
import { createCoupon, updateCoupon } from "@/actions/coupon"
import { CouponSchema, couponSchema } from "@/utils/validations/coupon"
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

export function CouponModal() {
  const { isOpen, onOpenChange, initialData } = useCouponModal()

  const form = useForm<CouponSchema>({
    resolver: zodResolver(couponSchema),
    defaultValues: initialData
      ? initialData
      : {
          amountType: "percentage",
        },
  })

  const { execute: create, isExecuting: isCreating } = useAction(createCoupon, {
    onSuccess() {
      handleOpenChange(false)
    },
    onError({ error }) {
      const message = parseError(error)
      form.setError("root", { message })
    },
  })

  const { execute: update, isExecuting: isUpdating } = useAction(updateCoupon, {
    onSuccess() {
      handleOpenChange(false)
    },
    onError({ error }) {
      const message = parseError(error)
      form.setError("root", { message })
    },
  })

  const isPending = isUpdating || isCreating

  const onSubmit = form.handleSubmit((values) => {
    if (!!initialData) {
      update({ ...values, couponId: initialData.couponId })
    } else {
      create(values)
    }
  })

  function handleOpenChange(open: boolean) {
    onOpenChange(open)
    if (!open) form.reset()
  }

  useEffect(() => {
    if (initialData) {
      form.setValue("amount", initialData?.amount)
      form.setValue("amountType", initialData?.amountType)
      form.setValue("code", initialData?.code)
      form.setValue("usageLimit", initialData?.usageLimit)
      form.setValue("minOrderAmount", initialData?.minOrderAmount)
      form.setValue("validityDuration", initialData?.validityDuration)
    }
  }, [initialData, form])

  return (
    <Modal open={isOpen} onOpenChange={handleOpenChange}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>
            {!!initialData ? "Update" : "Create"} coupon code
          </ModalTitle>
          <ModalDescription>
            Generate discount coupons for your store
          </ModalDescription>
        </ModalHeader>

        <ModalBody>
          <Form {...form}>
            <form
              id="coupon-form"
              onSubmit={onSubmit}
              className="flex flex-col gap-4"
            >
              <FormError />

              <FormField
                control={form.control}
                name="code"
                disabled={isPending}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Code</FormLabel>
                    <FormControl>
                      <Input autoFocus placeholder="EID2024" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amountType"
                disabled={isPending}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount Type</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isPending}
                    >
                      <FormControl>
                        <SelectTrigger disabled={isPending}>
                          <SelectValue placeholder="Select amount type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {couponCodeAmountTypeEnum.enumValues.map((item) => (
                          <SelectItem
                            key={item}
                            value={item}
                            className="capitalize"
                          >
                            {item}
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
                name="amount"
                disabled={isPending}
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input placeholder="300" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="minOrderAmount"
                disabled={isPending}
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Min Order Amount</FormLabel>
                    <FormControl>
                      <Input placeholder="500" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="usageLimit"
                disabled={isPending}
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Max Orders Limit</FormLabel>
                    <FormControl>
                      <Input placeholder="50" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="validityDuration"
                disabled={isPending}
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Validity Duration</FormLabel>
                    <SaleDuration
                      value={field.value}
                      onChange={field.onChange}
                    />
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
          <Button type="submit" loading={isPending} form="coupon-form">
            {!!initialData ? "Update" : "Create"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
