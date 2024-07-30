import { cache } from "react"
import { cookies } from "next/headers"
import { Lucia, type Session, type User } from "lucia"
import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle"
import { Google, Facebook } from "arctic"
import { notFound } from "next/navigation"

import { db } from "@/db"
import { sessions, users, User as DatabaseUser } from "@/db/schema"
import { SESSION_COOKIE_NAME, SITE_URL } from "./constants"

const adapter = new DrizzlePostgreSQLAdapter(db, sessions, users)

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    name: SESSION_COOKIE_NAME,
    attributes: {
      secure: process.env.NODE_ENV === "production",
    },
  },
  getUserAttributes: ({ hashedPassword: _, ...rest }) => {
    return rest
  },
  getSessionAttributes(attr) {
    return attr
  },
})

export const getSession = cache(
  async (): Promise<
    { user: User; session: Session } | { user: null; session: null }
  > => {
    const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null

    if (!sessionId) {
      return {
        user: null,
        session: null,
      }
    }

    const result = await lucia.validateSession(sessionId)

    try {
      if (result.session && result.session.fresh) {
        const sessionCookie = lucia.createSessionCookie(result.session.id)

        cookies().set(
          sessionCookie.name,
          sessionCookie.value,
          sessionCookie.attributes,
        )
      }
      if (!result.session) {
        const sessionCookie = lucia.createBlankSessionCookie()

        cookies().set(
          sessionCookie.name,
          sessionCookie.value,
          sessionCookie.attributes,
        )
      }
    } catch {}

    return result
  },
)

export async function verifyAdmin() {
  const { user, session } = await getSession()

  if (!user || !session || user.role === "customer") {
    return notFound()
  }

  return { user, session }
}

export const google = new Google(
  process.env.GOOGLE_CLIENT_ID!,
  process.env.GOOGLE_CLIENT_SECRET!,
  `${SITE_URL}/api/auth/callback/google`,
)

export const facebook = new Facebook(
  process.env.FACEBOOK_CLIENT_ID!,
  process.env.FACEBOOK_CLIENT_SECRET!,
  `${SITE_URL}/api/auth/callback/facebook`,
)

declare module "lucia" {
  // eslint-disable-next-line no-unused-vars
  interface Register {
    Lucia: typeof lucia
    DatabaseUserAttributes: DatabaseUser
    DatabaseSessionAttributes: {
      createdAt: Date
    }
  }
}
