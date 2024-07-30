import * as z from "zod"

import {
  productLabelEnum,
  productStatusEnum,
  productTypeEnum,
} from "@/db/schema"

import { imageSchema } from "./image"
import { preprocessStringToNumber } from ".."

export const productDetailsSchema = z.object({
  title: z
    .string({ required_error: "Title is required" })
    .min(1, "Title is required")
    .min(3, "Title must be atleast 3 characters")
    .max(300, "Title must be less than 300 characters"),
  type: z.enum(productTypeEnum.enumValues, {
    required_error: "Please select product type",
  }),
  categoryId: z
    .string({ required_error: "Please select a category" })
    .min(1, "Please select a category"),
  subcategoryId: z
    .string({ required_error: "Please select a subcategory" })
    .min(1, "Please select a subcategory"),
  shortDescription: z
    .string()
    .min(10, "Description must be atleast 10 characters")
    .max(1000, "Description must be less than 1000 characters"),
  longDescription: z.any(),
})

export type ProductDetailsSchema = z.infer<typeof productDetailsSchema>

export const productImageSchema = imageSchema.extend({
  order: z.number().int(),
})

export type ProductImageSchema = z.infer<typeof productImageSchema>

export const inventorySchema = z
  .object({
    price: z.preprocess(
      preprocessStringToNumber,
      z
        .number({
          required_error: "Please enter a price",
          invalid_type_error: "Invalid Price",
        })
        .min(0, "Price must be greater than 0"),
    ),
    stock: z.preprocess(
      preprocessStringToNumber,
      z
        .number({
          required_error: "Please enter product stock",
          invalid_type_error: "Invalid Stock",
        })
        .int("Invalid Stock")
        .min(0, "Stock must be greate than 0"),
    ),
    salePrice: z.preprocess(
      preprocessStringToNumber,
      z
        .number({ invalid_type_error: "Invalid Price" })
        .min(0, "Price must be greater than 0")
        .optional(),
    ),
    saleDuration: z
      .object({
        from: z.coerce.date().optional(),
        to: z.coerce.date().optional(),
      })
      .nullish(),
  })
  .transform((data, ctx) => {
    if (data.salePrice) {
      if (data.salePrice > data.price) {
        ctx.addIssue({
          path: ["salePrice"],
          message: "Sale price must be less than actual price",
          code: z.ZodIssueCode.custom,
        })
      }
    }

    return data
  })

export const simpleProductInventorySchema = inventorySchema.and(
  z.object({
    images: z
      .array(productImageSchema)
      .min(1, "Please select atleast one image")
      .max(10, "You can add up to 10 images per product only"),
  }),
)

export type SimpleProductInventorySchema = z.infer<
  typeof simpleProductInventorySchema
>

export const variableProductInventorySchema = z
  .object({
    variants: z
      .string()
      .min(1)
      .array()
      .min(1, "Please select atleast one variant"),
    values: z.record(
      z.string(),
      z.string().min(1).array().min(1, "Please selsct atleast one variant"),
    ),
    variantValueImages: z.record(
      z.string(),
      z
        .array(productImageSchema)
        .max(10, "You can add up to 10 images per variant only")
        .optional(),
    ),
  })
  .and(simpleProductInventorySchema)

export type VariableProductInventorySchema = z.infer<
  typeof variableProductInventorySchema
>

export const updateProductCombinationsSchema = z.object({
  combinations: z.array(
    z.object({ id: z.string().min(1).cuid2() }).and(inventorySchema),
  ),
})

export type UpdateProductCombinationsSchema = z.infer<
  typeof updateProductCombinationsSchema
>

export const publishProductSchema = z.object({
  status: z.enum(productStatusEnum.enumValues),
  label: z.enum(productLabelEnum.enumValues),
  tags: z.array(z.string().min(1)).min(3, "Please add atleast 3 tags"),
})

export type PublishProductSchema = z.infer<typeof publishProductSchema>

export const updateProductLabelStatusSchema = z.object({
  id: z.string().min(1).cuid2(),
  label: z.enum(productLabelEnum.enumValues).optional(),
  status: z.enum(productStatusEnum.enumValues).optional(),
})

export const updateProductsLabelStatusSchema = z.object({
  ids: z.string().min(1).cuid2().array().min(1),
  label: z.enum(productLabelEnum.enumValues).optional(),
  status: z.enum(productStatusEnum.enumValues).optional(),
})

export const deleteProductsSchema = z.object({
  ids: z.string().min(1).cuid2().array().min(1),
})

export const getProductsSchema = z.object({
  page: z.coerce.number().default(1),
  per_page: z.coerce.number().default(10),
  sort: z.string().optional(),
  title: z.string().optional(),
  status: z.string().optional(),
  label: z.string().optional(),
  type: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  operator: z.enum(["and", "or"]).optional(),
})

export type GetProductsSchema = z.infer<typeof getProductsSchema>

export const searchProductsSchema = z.object({
  page: z.coerce.number().default(1),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  rating: z.coerce.number().optional(),
  sort: z.string().optional(),
  query: z.string().optional(),
  categoryId: z.string().optional(),
  subcategoryId: z.string().optional(),
})

export type SearchProductsSchema = z.infer<typeof searchProductsSchema>
