"use client"

import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAction } from "next-safe-action/hooks"

import { signUp } from "@/actions/auth"
import { Button } from "@/components/ui/button"
import { parseError } from "@/utils/error"
import { Input } from "@/components/ui/input"
import { signUpSchema, SignUpSchema } from "@/utils/validations/auth"
import {
  Form,
  FormControl,
  FormError,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

export function SignUpForm() {
  const form = useForm<SignUpSchema>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  const { execute: register, isExecuting } = useAction(signUp, {
    onError: ({ error }) => {
      const message = parseError(error)
      form.setError("root", { message })
    },
    onSuccess: () => {
      toast.success("Account created successfully")
    },
  })

  const onSubmit = form.handleSubmit((values) => {
    register(values)
  })

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-4">
        <FormError />

        <FormField
          control={form.control}
          name="name"
          disabled={isExecuting}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input autoFocus placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          disabled={isExecuting}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                <Input type="email" placeholder="john@gmail.com" {...field} />
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
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input placeholder="••••••••" type="password" {...field} />
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
          Sign Up
        </Button>
      </form>
    </Form>
  )
}
