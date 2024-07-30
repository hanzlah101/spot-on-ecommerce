"use client"

import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useCountDown } from "@/hooks/use-countdown"
import { sendResetPasswordLink } from "@/actions/auth"
import { EmailSchema, emailSchema } from "@/utils/validations/auth"
import {
  Form,
  FormControl,
  FormError,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

import { useAction } from "next-safe-action/hooks"
import { parseError } from "@/utils/error"
import { CircleCheckBig } from "lucide-react"

export function VerifyEmailForm() {
  const { timeLeft, startCountDown } = useCountDown("reset-password")

  const form = useForm<EmailSchema>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: "",
    },
  })

  const {
    execute: verifyEmail,
    isExecuting,
    hasSucceeded,
  } = useAction(sendResetPasswordLink, {
    onSuccess() {
      startCountDown()
      toast.success("Check your email", {
        description: "We've sent a verification link",
      })
    },
    onError({ error }) {
      const message = parseError(error)
      form.setError("root", { message })
    },
  })

  const onSubmit = form.handleSubmit((values) => {
    if (timeLeft > 0) {
      return
    }

    verifyEmail(values)
  })

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-4">
        <FormError />
        {hasSucceeded && (
          <div className="flex items-center gap-x-2 rounded-md px-3 py-2">
            <CircleCheckBig />
            Check your email for verificarion link
          </div>
        )}

        <FormField
          control={form.control}
          name="email"
          disabled={isExecuting}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                <Input
                  autoFocus
                  type="email"
                  placeholder="john@gmail.com"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={timeLeft > 0 || isExecuting}
          loading={isExecuting}
        >
          {timeLeft > 0 ? `Resend in ${timeLeft} seconds` : "Continue"}
        </Button>
      </form>
    </Form>
  )
}
