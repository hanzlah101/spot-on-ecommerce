import * as z from "zod"
import { isValidNumberForRegion } from "libphonenumber-js"
import {
  orderPaymentMethodsEnum,
  orderPaymentStatusEnum,
  orderStatusEnum,
} from "@/db/schema"

export const orderInfoSchema = z.object({
  customerName: z
    .string({ required_error: "Plase enter your name" })
    .min(1, "Plase enter your name"),
  email: z
    .string({ required_error: "Please enter your email" })
    .min(1, "Please enter your email")
    .email("Invalid email"),
  phoneNumber: z
    .string({ required_error: "Please enter your phone number" })
    .refine((v) => isValidNumberForRegion(v, "PK"), "Invalid phone number"),
  city: z
    .string({ required_error: "Please select a city" })
    .min(1, "Please select a city"),
  state: z
    .string({ required_error: "Please select a state" })
    .min(1, "Please select a state"),
  streetAddress: z
    .string({ required_error: "Please enter your street address" })
    .min(1, "Please enter your street address"),
  paymentMethod: z
    .enum(orderPaymentMethodsEnum.enumValues)
    .default("cash on delivery"),
  couponCode: z.string().optional(),
})

export type OrderInfoSchema = z.infer<typeof orderInfoSchema>

export const createOrderSchema = orderInfoSchema.extend({
  items: z
    .array(
      z.object({
        productId: z.string().min(1).cuid2(),
        combinationId: z.string().cuid2().optional(),
        quantity: z.number().int().min(1).positive(),
      }),
    )
    .min(1, "Please select atleast one item"),
})

export type CreateOrderSchema = z.infer<typeof createOrderSchema>

export const validateOrderSchema = z.object({
  trackingId: z
    .string({ required_error: "Please enter a tracking id" })
    .min(1, "Please enter a tracking id"),
})

export type ValidateOrderSchema = z.infer<typeof validateOrderSchema>

export const deleteOrdersSchema = z.object({
  ids: z.string().min(1).cuid2().array().min(1),
})

export const updateOrdersPaymentMethodStatusSchema = z.object({
  ids: z.string().min(1).cuid2().array().min(1),
  paymentMethod: z.enum(orderPaymentMethodsEnum.enumValues).optional(),
  paymentStatus: z.enum(orderPaymentStatusEnum.enumValues).optional(),
  status: z.enum(orderStatusEnum.enumValues).optional(),
})

export const editOrderSchema = z.object({
  paymentStatus: z.enum(orderPaymentStatusEnum.enumValues),
  paymentMethod: z.enum(orderPaymentMethodsEnum.enumValues),
  status: z.enum(orderStatusEnum.enumValues),
  estDeliveryDate: z.coerce.date().optional(),
  dispatchedAt: z.coerce.date().optional(),
  shippedAt: z.coerce.date().optional(),
  deliveredAt: z.coerce.date().optional(),
  cancelledAt: z.coerce.date().optional(),
})

export type EditOrderSchema = z.infer<typeof editOrderSchema>

export const getOrdersSchema = z.object({
  page: z.coerce.number().default(1),
  per_page: z.coerce.number().default(10),
  sort: z.string().optional(),
  trackingId: z.string().optional(),
  email: z.string().optional(),
  phoneNumber: z.string().optional(),
  customerName: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  streetAddress: z.string().optional(),
  status: z.string().optional(),
  paymentStatus: z.string().optional(),
  paymentMethod: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  operator: z.enum(["and", "or"]).optional(),
})

export type GetOrdersSchema = z.infer<typeof getOrdersSchema>
