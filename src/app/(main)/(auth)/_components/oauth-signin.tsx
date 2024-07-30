"use client"

import { Button } from "@/components/ui/button"
import {
  createFacebookAuthorizationURL,
  createGoogleAuthorizationURL,
} from "@/actions/auth"

import { toast } from "sonner"
import { useAction } from "next-safe-action/hooks"
import { parseError } from "@/utils/error"
import { FacebookIcon, GoogleIcon } from "@/components/icons/social"

export function OAuthSignIn() {
  const { execute: googleLogin, isExecuting: isGoogleLoading } = useAction(
    createGoogleAuthorizationURL,
    {
      onError({ error }) {
        toast.error(parseError(error))
      },
    },
  )

  const { execute: facebookLogin, isExecuting: isFacebookLoading } = useAction(
    createFacebookAuthorizationURL,
    {
      onError({ error }) {
        toast.error(parseError(error))
      },
    },
  )

  return (
    <div className="space-y-8">
      <div className="mt-8 h-px w-full bg-gradient-to-r from-transparent via-neutral-300 to-transparent dark:via-neutral-700" />
      <div className="flex flex-col space-y-3">
        <Button
          variant={"outline"}
          className="w-full"
          onClick={() => googleLogin()}
          disabled={isGoogleLoading || isFacebookLoading}
          loading={isGoogleLoading}
          icon={GoogleIcon}
        >
          Continue with Google
        </Button>

        <Button
          variant={"outline"}
          className="w-full"
          onClick={() => facebookLogin()}
          disabled={isGoogleLoading || isFacebookLoading}
          loading={isFacebookLoading}
          icon={FacebookIcon}
        >
          Continue with Facebook
        </Button>
      </div>
    </div>
  )
}
