import Link from "next/link"

import { VerifyEmailForm } from "../../_components/reset-password/verify-email-form"

export default function SendResetPasswordTokenPage() {
  return (
    <div className="mx-auto w-full max-w-md space-y-5 px-4 py-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold sm:text-3xl">Reset Password</h1>
        <p className="text-muted-foreground">
          Enter your email below to reset your password
        </p>
      </div>
      <VerifyEmailForm />
      <p className="text-center text-sm text-muted-foreground">
        Go back{" "}
        <Link
          href="/sign-in"
          className="font-medium text-foreground underline underline-offset-4"
        >
          Login
        </Link>
      </p>
    </div>
  )
}
