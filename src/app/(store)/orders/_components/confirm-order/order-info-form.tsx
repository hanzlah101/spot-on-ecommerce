"use client"

import type { User } from "lucia"
import { toast } from "sonner"
import { useEffect, useMemo } from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { CreditCard, Truck } from "lucide-react"
import { useParams, useSearchParams } from "next/navigation"
import { useMutation } from "@tanstack/react-query"
import { type StripeElementsOptions, loadStripe } from "@stripe/stripe-js"
import { useTheme } from "next-themes"
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js"

import type { CartItem } from "@/utils/types"
import type { getLastOrder } from "@/queries/order"
import { formatPrice, isEqual } from "@/utils"
import { createOrder, updateOrderInfo } from "@/actions/order"
import { Input } from "@/components/ui/input"
import { PhoneInput } from "@/components/ui/phone-input"
import {
  CreateOrderSchema,
  OrderInfoSchema,
  orderInfoSchema,
} from "@/utils/validations/order"

import { AutoComplete } from "@/components/ui/autocomplete"
import { SITE_URL, STATES } from "@/utils/constants"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupCardItem } from "@/components/ui/radio-group"
import { useCartStore } from "@/stores/use-cart-store"
import { useUpdateOrderInfoModal } from "@/stores/use-update-order-info-modal"
import {
  Form,
  FormControl,
  FormError,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

type OrderInfoFormProps = {
  user: User | null
  lastOrder?: Awaited<ReturnType<typeof getLastOrder>>
  couponCode?: string
  items: Omit<CartItem, "isSelected">[]
  initialData?: OrderInfoSchema
  total: number
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!)

export function OrderInfoForm(props: OrderInfoFormProps) {
  const { resolvedTheme } = useTheme()

  const options: StripeElementsOptions = {
    amount: Math.round(props.total * 100),
    mode: "payment",
    currency: "usd",
    appearance: {
      theme: resolvedTheme === "dark" ? "night" : "stripe",
    },
  }

  return (
    <Elements stripe={stripePromise} options={options}>
      <DetailsForm {...props} />
    </Elements>
  )
}

function DetailsForm({
  initialData,
  user,
  lastOrder,
  couponCode,
  items,
  total,
}: OrderInfoFormProps) {
  const { removeAllProducts } = useCartStore()

  const searchParams = useSearchParams()

  const mode = useMemo(() => searchParams.get("mode") ?? "cart", [searchParams])

  const { onOpenChange } = useUpdateOrderInfoModal()
  const { trackingId }: { trackingId: string } = useParams()

  const stripe = useStripe()
  const elements = useElements()

  const defaultValues = initialData
    ? initialData
    : lastOrder
      ? lastOrder
      : user
        ? {
            customerName: user.name,
            email: user.email,
          }
        : {}

  const form = useForm<OrderInfoSchema>({
    resolver: zodResolver(orderInfoSchema),
    defaultValues: {
      ...defaultValues,
      paymentMethod: "credit card",
    },
  })

  const paymentMethod = useWatch({
    control: form.control,
    name: "paymentMethod",
  })

  const { mutate: confirmOrder, isPending: isCreating } = useMutation({
    mutationFn: async (values: CreateOrderSchema) => {
      if (paymentMethod === "credit card") {
        if (!elements || !stripe) return

        const formSubmit = await elements.submit()

        if (formSubmit.error) {
          form.setError("root", {
            message: "Error processing payment",
            type: "validate",
          })
          throw formSubmit.error
        }
      }

      const res = await createOrder(values)

      if (res?.error) {
        form.setError("root", { message: res.error })
        throw res.error
      }

      if (res?.clientSecret && elements && res.trackingId) {
        const payment = await stripe?.confirmPayment({
          elements,
          clientSecret: res.clientSecret,
          confirmParams: {
            return_url: `${SITE_URL}/orders/${res.trackingId}?success=1`,
          },
        })

        if (payment?.error) {
          if (
            payment.error.type === "card_error" ||
            payment.error.type === "validation_error"
          ) {
            form.setError("root", { message: payment.error.message })
          } else {
            form.setError("root", { message: "Error processing payment" })
          }

          throw payment.error
        }
      }
    },
    onSuccess() {
      // TODO
      if (mode === "cart") {
        setTimeout(() => removeAllProducts(), 500)
      }
    },
  })

  const { mutate: updateInfo, isPending: isUpdating } = useMutation({
    mutationKey: ["update-order-info"],
    mutationFn: async (values: OrderInfoSchema) => {
      const { error } = await updateOrderInfo(values, trackingId)
      if (error) {
        form.setError("root", { message: error })
        throw error
      }
    },
    onSuccess() {
      toast.success("Order info updated")
      onOpenChange(false)
    },
  })

  const isPending = isUpdating || isCreating

  const onSubmit = form.handleSubmit((values) => {
    if (initialData) {
      if (isEqual(values, initialData)) return
      updateInfo(values)
    } else {
      confirmOrder({ ...values, couponCode, items })
    }
  })

  useEffect(() => {
    if (initialData) {
      form.setValue("city", initialData?.city)
      form.setValue("state", initialData?.state)
      form.setValue("phoneNumber", initialData?.phoneNumber)
      form.setValue("email", initialData?.email)
      form.setValue("customerName", initialData?.customerName)
      form.setValue("streetAddress", initialData?.streetAddress)
    } else {
      if (lastOrder) {
        form.setValue("streetAddress", lastOrder?.streetAddress)
        form.setValue("city", lastOrder?.city)
        form.setValue("state", lastOrder?.state)
        form.setValue("phoneNumber", lastOrder?.phoneNumber)
        form.setValue("email", lastOrder?.email)
        form.setValue("customerName", lastOrder?.customerName)
      }

      if (!lastOrder && user) {
        form.setValue("email", user.email)
        form.setValue("customerName", user.name)
      }
    }
  }, [form, user, lastOrder, initialData])

  return (
    <div className="w-full space-y-4">
      {!initialData ? (
        <h2 className="text-3xl font-bold">Confirm Order</h2>
      ) : null}

      <Form {...form}>
        <form id="order-info-form" onSubmit={onSubmit} className="space-y-4">
          <FormError />

          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Contact Information</h2>
            <div className="grid grid-cols-1 gap-x-3 gap-y-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="customerName"
                disabled={isPending}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input autoFocus placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                disabled={isPending}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="john@gmail.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-x-3 gap-y-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="phoneNumber"
                disabled={isPending}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <PhoneInput
                        disabled={isPending}
                        placeholder="0306 1234567"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Shipping Information</h2>
            <div className="grid grid-cols-1 gap-x-3 gap-y-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="state"
                disabled={isPending}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <AutoComplete
                        emptyMessage="No results."
                        placeholder="Find your state"
                        onValueChange={(v) => field.onChange(v.value)}
                        value={{ label: field.value, value: field.value }}
                        options={STATES.map((value) => ({
                          label: value,
                          value,
                        }))}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="city"
                disabled={isPending}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="Lahore" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="streetAddress"
              disabled={isPending}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Street Address</FormLabel>
                  <FormControl>
                    <Textarea
                      className="min-h-[60px]"
                      placeholder="House no. 123, Street 45, Sector C, Bahria Town, Lahore"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!initialData ? (
              <FormField
                control={form.control}
                name="paymentMethod"
                disabled={isPending}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Method</FormLabel>
                    <FormControl>
                      <RadioGroup
                        disabled={isPending}
                        defaultValue={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupCardItem value="credit card">
                              <div className="flex items-start gap-x-3">
                                <CreditCard className="h-8 w-8 shrink-0" />
                                <div className="flex flex-col items-start text-start">
                                  <h3 className="text-[17px] text-foreground">
                                    Pay online
                                  </h3>
                                  <h3 className="text-[15px] text-muted-foreground">
                                    Pay securely with your credit card online.
                                  </h3>
                                </div>
                              </div>
                            </RadioGroupCardItem>
                          </FormControl>
                        </FormItem>

                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupCardItem value="cash on delivery">
                              <div className="flex items-start gap-x-3">
                                <Truck className="h-8 w-8 shrink-0" />
                                <div className="flex flex-col items-start text-start">
                                  <h3 className="text-[17px] text-foreground">
                                    Cash on delivery
                                  </h3>
                                  <h3 className="text-[15px] text-muted-foreground">
                                    Pay securely with cash when your order is
                                    delivered to your doorstep.
                                  </h3>
                                </div>
                              </div>
                            </RadioGroupCardItem>
                          </FormControl>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : null}
          </div>

          {paymentMethod === "credit card" && !initialData ? (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Payment Details</h2>
              <PaymentElement options={{ readOnly: isPending }} />
            </div>
          ) : null}

          {!initialData ? (
            <Button
              loading={isPending}
              type="submit"
              size="lg"
              form="order-info-form"
              className="w-full text-base"
            >
              {paymentMethod === "credit card"
                ? `Pay ${formatPrice(total)}`
                : "Confirm Order"}
            </Button>
          ) : null}
        </form>
      </Form>
    </div>
  )
}
