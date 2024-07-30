import Link from "next/link"
import { redirect } from "next/navigation"

import { getSession } from "@/utils/auth"
import { OAuthSignIn } from "../_components/oauth-signin"
import { SignUpForm } from "../_components/sign-up-form"
import { REDIRECTS } from "@/utils/constants"

export default async function SignUpPage() {
  const { user } = await getSession()

  if (user) {
    if (!user.emailVerified) {
      redirect(REDIRECTS.toVerify)
    } else {
      if (user.role === "customer") {
        redirect(REDIRECTS.afterLogin)
      } else {
        redirect(REDIRECTS.afterAdminLogin)
      }
    }
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-5 px-4 py-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold sm:text-3xl">Sign Up</h1>
        <p className="text-muted-foreground">
          Enter your information below to create an account
        </p>
      </div>
      <SignUpForm />
      <OAuthSignIn />
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
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
