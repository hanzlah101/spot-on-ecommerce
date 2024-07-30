import { z } from "zod"

import { imageSchema } from "./image"

export const variantSchema = z.object({
  name: z
    .string({ required_error: "Variant name is required" })
    .min(1, "Variant name is required")
    .max(64, "Variant name must be less than 64 characters"),
  slug: z
    .string({ required_error: "Variant slug is required" })
    .min(1, "Variant slug is required")
    .max(64, "Variant slug must be less than 64 characters")
    .regex(/^[a-z0-9_-]+$/, "Invalid variant slug"),
  guideImage: imageSchema.nullish(),
  values: z
    .object({
      id: z.string().min(1).cuid2(),
      name: z
        .string({ required_error: "Name is required" })
        .min(1, "Name is required")
        .max(64, "Name must be less than 64 characters"),
      value: z
        .string({ required_error: "Value is required" })
        .min(1, "Value is required")
        .max(64, "Value must be less than 64 characters"),
    })
    .array()
    .min(1, "At least one value is required"),
})

export type VariantSchema = z.infer<typeof variantSchema>
