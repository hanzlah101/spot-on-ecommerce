import { z } from "zod"

export const categorySchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  description: z
    .string({ required_error: "Description is required" })
    .min(1, "Description is required")
    .max(400, "Description must be less than 400 characters"),
})

export type CategorySchema = z.infer<typeof categorySchema>

export const subcategorySchema = categorySchema.extend({
  categoryId: z
    .string({ required_error: "Please select a category" })
    .min(1, "Please select a category"),
})

export type SubcategorySchema = z.infer<typeof subcategorySchema>
