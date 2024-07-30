"use client"

import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useParams } from "next/navigation"
import { useAction } from "next-safe-action/hooks"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { resetPassword } from "@/actions/auth"
import { parseError } from "@/utils/error"
import {
  resetPasswordSchema,
  ResetPasswordSchema,
} from "@/utils/validations/auth"

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormError,
} from "@/components/ui/form"

export function ResetPasswordForm() {
  const { token }: { token: string } = useParams()

  const form = useForm<ResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  const { execute: reset, isExecuting } = useAction(resetPassword, {
    onSuccess() {
      form.reset()
      toast.success("Password reset successfully")
      window.localStorage.removeItem("countdown:reset-password")
      window.location.href = "/"
    },
    onError({ error }) {
      const message = parseError(error)
      form.setError("root", { message })
    },
  })

  const onSubmit = form.handleSubmit((values) => {
    reset({
      ...values,
      token,
    })
  })

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-4">
        <FormError />

        <FormField
          control={form.control}
          name="password"
          disabled={isExecuting}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  autoFocus
                  placeholder="••••••••"
                  type="password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          disabled={isExecuting}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input placeholder="••••••••" type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" loading={isExecuting}>
          Update
        </Button>
      </form>
    </Form>
  )
}
