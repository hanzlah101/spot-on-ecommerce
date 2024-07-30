import * as z from "zod"

export const getUsersSchema = z.object({
  page: z.coerce.number().default(1),
  per_page: z.coerce.number().default(10),
  sort: z.string().optional(),
  name: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  operator: z.enum(["and", "or"]).optional(),
})

export type GetUsersSchema = z.infer<typeof getUsersSchema>

export const updateUserProfileSchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .min(1, "Name is required")
    .min(3, "Name must be at least 3 characters")
    .max(64, "Name must be less than 64 characters"),
  image: z.string().nullish(),
})

export type UpdateUserProfileSchema = z.infer<typeof updateUserProfileSchema>

export const updateUserPasswordSchema = z
  .object({
    oldPassword: z
      .string({ required_error: "Old password is required" })
      .min(1, "Old password is required"),
    newPassword: z
      .string({ required_error: "New password is required" })
      .min(1, "New password is required")
      .min(8, "Password must be at least 8 characters")
      .max(200, "Password must be less than 200 characters"),
    confirmPassword: z
      .string({ required_error: "Please confirm your password" })
      .min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

export type UpdateUserPasswordSchema = z.infer<typeof updateUserPasswordSchema>
