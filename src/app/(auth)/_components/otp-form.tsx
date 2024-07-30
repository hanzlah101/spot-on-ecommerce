"use client"

import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAction } from "next-safe-action/hooks"

import { Button } from "@/components/ui/button"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"

import { useCountDown } from "@/hooks/use-countdown"
import { useIsClient } from "@/hooks/use-is-client"
import { resendVerificationCode, verifyCode } from "@/actions/auth"
import { OtpSchema, otpSchema } from "@/utils/validations/auth"
import { parseError } from "@/utils/error"
import {
  Form,
  FormControl,
  FormError,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

export function OtpForm() {
  const isClient = useIsClient()
  const { timeLeft, startCountDown, clearCountDown } =
    useCountDown("verify-email")

  const form = useForm<OtpSchema>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      code: "",
    },
  })

  const { execute: verify, isExecuting: isVerifying } = useAction(verifyCode, {
    onSuccess: () => {
      clearCountDown()
      toast.success("Email verified successfully", {
        description: "You can now access your account",
      })
    },
    onError({ error }) {
      const message = parseError(error)
      form.setError("root", { message })
    },
  })

  const { execute: resend, isExecuting: isResending } = useAction(
    resendVerificationCode,
    {
      onSuccess() {
        startCountDown()
        toast.success("Check your email", {
          description: "We've sent you a 6-digit verification code",
        })
      },
      onError({ error }) {
        const message = parseError(error)
        form.setError("root", { message })
      },
    },
  )

  function onResend() {
    form.clearErrors("root")
    if (timeLeft > 0) return
    resend()
  }

  const onSubmit = form.handleSubmit((values: OtpSchema) => {
    verify(values)
  })

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={onSubmit}>
        <FormError />

        <FormField
          control={form.control}
          name="code"
          disabled={isVerifying}
          render={({ field }) => (
            <FormItem>
              <FormLabel>One-Time Password</FormLabel>
              <FormControl>
                <InputOTP
                  maxLength={6}
                  autoFocus
                  onComplete={(code) => verify({ code })}
                  disabled={isVerifying}
                  {...field}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" loading={isVerifying}>
          Submit
        </Button>
      </form>

      {isClient &&
        (timeLeft > 0 ? (
          <p className="text-sm text-muted-foreground">
            Retry in {timeLeft} seconds
          </p>
        ) : (
          <Button
            variant="link"
            size="fit"
            type="button"
            disabled={isVerifying || isResending}
            onClick={onResend}
          >
            Didn&apos;t receive a code?
          </Button>
        ))}
    </Form>
  )
}
