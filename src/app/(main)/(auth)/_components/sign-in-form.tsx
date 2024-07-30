"use client"

import Link from "next/link"
import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAction } from "next-safe-action/hooks"

import { parseError } from "@/utils/error"
import { signIn } from "@/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { signInSchema, SignInSchema } from "@/utils/validations/auth"
import {
  Form,
  FormControl,
  FormError,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

export function SignInForm() {
  const form = useForm<SignInSchema>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const { execute: login, isExecuting } = useAction(signIn, {
    onError: ({ error }) => {
      const message = parseError(error)
      form.setError("root", { message })
    },
    onSuccess: () => {
      toast.success("Logged in successfully!")
    },
  })

  const onSubmit = form.handleSubmit((values) => {
    login(values)
  })

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-4">
        <FormError />

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

        <FormField
          control={form.control}
          name="password"
          disabled={isExecuting}
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>Password</FormLabel>
                <Link
                  href="/reset-password/verify-email"
                  className="text-sm transition-colors hover:text-foreground/80 hover:underline hover:underline-offset-4"
                >
                  Forgot Password?
                </Link>
              </div>
              <FormControl>
                <Input placeholder="••••••••" type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" loading={isExecuting}>
          Login
        </Button>
      </form>
    </Form>
  )
}
