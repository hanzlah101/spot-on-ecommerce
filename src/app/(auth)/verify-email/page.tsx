import { redirect } from "next/navigation"

import { getSession } from "@/utils/auth"
import { OtpForm } from "../_components/otp-form"
import { REDIRECTS } from "@/utils/constants"

export default async function VerifyEmailPage() {
  const { user } = await getSession()

  if (!user) {
    redirect(REDIRECTS.toLogin)
  } else if (user.emailVerified) {
    if (user.role === "customer") {
      redirect(REDIRECTS.afterLogin)
    } else {
      redirect(REDIRECTS.afterAdminLogin)
    }
  }

  return (
    <div className="mx-auto w-full max-w-sm space-y-5 px-4 py-32">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold sm:text-3xl">Verify Email</h1>
        <p className="text-muted-foreground">
          Enter the OTP code that was sent to{" "}
          <span className="font-medium text-foreground">{user.email}</span>
        </p>
      </div>
      <OtpForm />
    </div>
  )
}
