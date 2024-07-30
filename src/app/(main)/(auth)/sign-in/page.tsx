import Link from "next/link"
import { redirect } from "next/navigation"

import { getSession } from "@/utils/auth"
import { SignInForm } from "../_components/sign-in-form"
import { OAuthSignIn } from "../_components/oauth-signin"
import { REDIRECTS } from "@/utils/constants"

export default async function SignInPage() {
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
    <>
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold sm:text-3xl">Sign In</h1>
        <p className="text-muted-foreground">
          Enter your information below to sign in
        </p>
      </div>
      <SignInForm />
      <OAuthSignIn />
      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          href="/sign-up"
          className="font-medium text-foreground underline underline-offset-4"
        >
          Sign Up
        </Link>
      </p>
    </>
  )
}
