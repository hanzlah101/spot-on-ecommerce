import axios from "axios"
import type { NextRequest } from "next/server"
import { ApiError } from "next/dist/server/api-utils"
import { createId } from "@paralleldrive/cuid2"
import { and, eq } from "drizzle-orm"
import { cookies } from "next/headers"

import { db } from "@/db"
import { facebook } from "@/utils/auth"
import { oAuthAccounts, users } from "@/db/schema"
import { SITE_URL } from "@/utils/constants"
import { apiErrorHandler } from "@/utils/error"
import { createSession } from "@/actions/auth"

type FacebookUser = {
  name: string
  id: string
  email: string
  picture: {
    height: number
    is_silhouette: boolean
    url: string
    width: number
  }
}

export const dynamic = "force-dynamic"

async function facebookCallback(req: NextRequest) {
  const { searchParams } = new URL(req.url)

  const code = searchParams.get("code")
  const redirectTo = cookies().get("redirect-to")?.value ?? "/"

  if (!code) {
    throw new ApiError(400, "Invalid request")
  }

  const { accessToken, accessTokenExpiresAt } =
    await facebook.validateAuthorizationCode(code)

  const { data } = await axios.get<FacebookUser>(
    `https://graph.facebook.com/me?access_token=${accessToken}&fields=id,name,email,picture`,
  )

  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, data.email))

  if (!existingUser) {
    const userId = createId()

    await db.insert(users).values({
      id: userId,
      name: data.name,
      email: data.email,
      image: data.picture.url,
      emailVerified: new Date(),
    })

    await db.insert(oAuthAccounts).values({
      userId,
      provider: "facebook",
      providerAccountId: data.id,
      accessToken,
      expiresAt: accessTokenExpiresAt,
    })

    await createSession(userId)
  } else {
    const [existingOAuthAccount] = await db
      .select()
      .from(oAuthAccounts)
      .where(
        and(
          eq(oAuthAccounts.provider, "facebook"),
          eq(oAuthAccounts.providerAccountId, data.id),
          eq(oAuthAccounts.userId, existingUser.id),
        ),
      )

    if (!existingOAuthAccount) {
      await db.insert(oAuthAccounts).values({
        userId: existingUser.id,
        provider: "facebook",
        providerAccountId: data.id,
        accessToken,
        expiresAt: accessTokenExpiresAt,
      })
    } else {
      await db
        .update(oAuthAccounts)
        .set({ accessToken, expiresAt: accessTokenExpiresAt })
        .where(
          and(
            eq(oAuthAccounts.provider, "facebook"),
            eq(oAuthAccounts.providerAccountId, data.id),
            eq(oAuthAccounts.userId, existingUser.id),
          ),
        )
    }

    await createSession(existingUser.id)
  }

  cookies().delete("redirect-to")

  return Response.redirect(new URL(redirectTo, SITE_URL))
}

export const GET = apiErrorHandler(facebookCallback)
