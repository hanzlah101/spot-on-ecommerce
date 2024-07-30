import * as z from "zod"

export const signUpSchema = z
  .object({
    name: z
      .string({ required_error: "Name is required" })
      .min(1, "Name is required")
      .min(3, "Name must be at least 3 characters")
      .max(64, "Name must be less than 64 characters"),
    email: z
      .string({ required_error: "Email is required" })
      .min(1, "Email is required")
      .email("Must be a valid email"),
    password: z
      .string({ required_error: "Password is required" })
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters")
      .max(200, "Password must be less than 200 characters"),
    confirmPassword: z
      .string({ required_error: "Please confirm your password" })
      .min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

export type SignUpSchema = z.infer<typeof signUpSchema>

export const signInSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .min(1, "Email is required")
    .email("Must be a valid email"),
  password: z
    .string({ required_error: "Password is required" })
    .min(1, "Password is required"),
})

export type SignInSchema = z.infer<typeof signInSchema>

export const otpSchema = z.object({
  code: z
    .string({ required_error: "OTP is required" })
    .min(1, "OTP is required")
    .min(6, "OTP must be at least 6 characters")
    .max(6, "OTP must be less than 6 characters")
    .regex(/^\d+$/, "OTP must be a number"),
})

export type OtpSchema = z.infer<typeof otpSchema>

export const emailSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .min(1, "Email is required")
    .email("Must be a valid email"),
})

export type EmailSchema = z.infer<typeof emailSchema>

export const resetPasswordSchema = z
  .object({
    password: z
      .string({ required_error: "Password is required" })
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters")
      .max(200, "Password must be less than 200 characters"),
    confirmPassword: z
      .string({ required_error: "Please confirm your password" })
      .min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>
