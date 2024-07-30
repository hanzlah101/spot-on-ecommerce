import Link from "next/link"
import { eq } from "drizzle-orm"
import { isWithinExpirationDate } from "oslo"
import { sha256 } from "oslo/crypto"
import { encodeHex } from "oslo/encoding"
import { AlertTriangle } from "lucide-react"

import { db } from "@/db"
import { Button } from "@/components/ui/button"
import { verificationTokens } from "@/db/schema"
import { ResetPasswordForm } from "../../_components/reset-password/reset-password-form"

type ResetPasswordPageProps = {
  params: {
    token: string
  }
}

export default async function ResetPasswordPage({
  params: { token },
}: ResetPasswordPageProps) {
  const tokenHash = encodeHex(await sha256(new TextEncoder().encode(token)))
  const [verificationToken] = await db
    .select()
    .from(verificationTokens)
    .where(eq(verificationTokens.token, tokenHash))

  if (
    !verificationToken ||
    !isWithinExpirationDate(verificationToken.expiresAt)
  ) {
    return (
      <>
        <div className="flex w-full items-center gap-x-3 rounded-md border border-destructive bg-destructive/15 px-3 py-2 text-[15px] font-medium text-destructive">
          <AlertTriangle className="size-5" />
          Token is invalid or expired
        </div>
        <p className="text-muted-foreground">
          Please Click below to restart the password reset process
        </p>
        <Link href={"/reset-password/verify-email"}>
          <Button className="w-full">Restart process</Button>
        </Link>
      </>
    )
  }

  return <ResetPasswordForm />
}
