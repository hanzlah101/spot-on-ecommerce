"use client"

import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"

import {
  updateUserPasswordSchema,
  UpdateUserPasswordSchema,
} from "@/utils/validations/user"

import { Input } from "@/components/ui/input"
import { updateUserPassword } from "@/actions/user"
import { useUpdateUserModal } from "@/stores/use-update-user-modal"
import {
  Form,
  FormControl,
  FormError,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

export function UpdatePasswordForm() {
  const { onOpenChange } = useUpdateUserModal()

  const form = useForm<UpdateUserPasswordSchema>({
    resolver: zodResolver(updateUserPasswordSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  const { isPending, mutate: updatePassword } = useMutation({
    mutationKey: ["update-user-password"],
    mutationFn: async (values: UpdateUserPasswordSchema) => {
      const { error } = await updateUserPassword(values)
      if (error) {
        form.setError("root", { message: error })
        throw error
      }
    },
    onSuccess() {
      toast.success("Password updated successfully!")
      onOpenChange(false)
      form.reset()
    },
  })

  const onSubmit = form.handleSubmit((values) => {
    updatePassword(values)
  })

  return (
    <Form {...form}>
      <form
        id="update-user-password-form"
        onSubmit={onSubmit}
        className="my-4 space-y-4"
      >
        <FormError />
        <FormField
          control={form.control}
          name="oldPassword"
          disabled={isPending}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Old Password</FormLabel>
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
          name="newPassword"
          disabled={isPending}
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Password</FormLabel>
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
          disabled={isPending}
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
      </form>
    </Form>
  )
}
