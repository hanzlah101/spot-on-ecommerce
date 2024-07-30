import * as z from "zod"

export const reviewSchema = z.object({
  rating: z
    .number({ required_error: "Please select a rating" })
    .int("Invalid Rating")
    .min(1)
    .max(5),
  description: z
    .string({ required_error: "Please describe your experience" })
    .min(1, "Please describe your experience")
    .max(300, "Description must be less than 300 characters."),
})

export type ReviewSchema = z.infer<typeof reviewSchema>
