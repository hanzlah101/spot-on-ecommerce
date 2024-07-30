import axios from "axios"
import type { NextRequest } from "next/server"
import { ApiError } from "next/dist/server/api-utils"
import { cookies } from "next/headers"
import { createId } from "@paralleldrive/cuid2"
import { and, eq } from "drizzle-orm"

import { google } from "@/utils/auth"
import { db } from "@/db"
import { oAuthAccounts, users } from "@/db/schema"
import { apiErrorHandler } from "@/utils/error"
import {
  GOOGLE_CODE_VERIFIER_COOKIE,
  GOOGLE_STATE_COOKIE,
  SITE_URL,
} from "@/utils/constants"

import { createSession } from "@/actions/auth"

type GoogleUser = {
  id: string
  email: string
  verified_email: boolean
  name: string
  given_name: string
  picture: string
  locale: string
}

export const dynamic = "force-dynamic"

async function googleCallback(req: NextRequest) {
  const { searchParams } = new URL(req.url)

  const code = searchParams.get("code")
  const state = searchParams.get("state")

  if (!code || !state) {
    throw new ApiError(400, "Invalid request")
  }

  const codeVerifier = cookies().get(GOOGLE_CODE_VERIFIER_COOKIE)?.value
  const savedState = cookies().get(GOOGLE_STATE_COOKIE)?.value

  if (!codeVerifier || !savedState) {
    throw new ApiError(400, "Code verifier or saved state not exists")
  }

  if (savedState !== state) {
    throw new ApiError(400, "Invalid state")
  }

  const { accessToken, refreshToken, accessTokenExpiresAt } =
    await google.validateAuthorizationCode(code, codeVerifier)

  const { data } = await axios.get<GoogleUser>(
    "https://www.googleapis.com/oauth2/v1/userinfo",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )

  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, data.email))

  if (!existingUser) {
    const userId = createId()

    await db.insert(users).values({
      id: userId,
      email: data.email,
      name: data.name,
      image: data.picture,
      emailVerified: new Date(),
    })

    await db.insert(oAuthAccounts).values({
      userId,
      provider: "google",
      providerAccountId: data.id,
      accessToken,
      refreshToken,
      expiresAt: accessTokenExpiresAt,
    })

    await createSession(userId)
  } else {
    const [existingOAuthAccount] = await db
      .select()
      .from(oAuthAccounts)
      .where(
        and(
          eq(oAuthAccounts.provider, "google"),
          eq(oAuthAccounts.providerAccountId, data.id),
          eq(oAuthAccounts.userId, existingUser.id)
        )
      )

    if (!existingOAuthAccount) {
      await db.insert(oAuthAccounts).values({
        userId: existingUser.id,
        provider: "google",
        providerAccountId: data.id,
        accessToken,
        refreshToken,
        expiresAt: accessTokenExpiresAt,
      })
    } else {
      await db
        .update(oAuthAccounts)
        .set({ accessToken, refreshToken, expiresAt: accessTokenExpiresAt })
        .where(
          and(
            eq(oAuthAccounts.provider, "google"),
            eq(oAuthAccounts.providerAccountId, data.id),
            eq(oAuthAccounts.userId, existingUser.id)
          )
        )
    }

    await createSession(existingUser.id)
  }

  cookies().set(GOOGLE_STATE_COOKIE, "", {
    expires: new Date(0),
  })

  cookies().set(GOOGLE_CODE_VERIFIER_COOKIE, "", {
    expires: new Date(0),
  })

  return Response.redirect(new URL(SITE_URL))
}

export const GET = apiErrorHandler(googleCallback)
