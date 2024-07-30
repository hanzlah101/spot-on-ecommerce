"use server"

import { z } from "zod"
import { redirect } from "next/navigation"
import { hash, verify } from "@node-rs/argon2"
import { createId } from "@paralleldrive/cuid2"
import { and, eq } from "drizzle-orm"
import { cookies } from "next/headers"
import { TimeSpan, createDate, isWithinExpirationDate } from "oslo"
import { alphabet, generateRandomString, sha256 } from "oslo/crypto"
import { encodeHex } from "oslo/encoding"
import { generateIdFromEntropySize } from "lucia"
import { generateCodeVerifier, generateState } from "arctic"
import { revalidatePath } from "next/cache"

import { db } from "@/db"
import { ActionError } from "@/utils/error"
import { sendMail } from "@/utils/send-email"
import { action } from "@/utils/action"
import { resetPasswordEmail, verificationEmail } from "@/utils/emails"
import { users, verificationTokens } from "@/db/schema"
import { facebook, getSession, google, lucia } from "@/utils/auth"
import {
  GOOGLE_CODE_VERIFIER_COOKIE,
  GOOGLE_STATE_COOKIE,
  REDIRECTS,
  SITE_URL,
} from "@/utils/constants"

import {
  emailSchema,
  otpSchema,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
} from "@/utils/validations/auth"

export async function createSession(userId: string) {
  const session = await lucia.createSession(userId, {
    createdAt: new Date(),
  })

  const sessionCookie = lucia.createSessionCookie(session.id)

  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes,
  )
}

export const signIn = action
  .schema(signInSchema)
  .action(async ({ parsedInput: { email, password } }) => {
    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        password: users.hashedPassword,
        emailVerified: users.emailVerified,
        role: users.role,
      })
      .from(users)
      .where(eq(users.email, email))

    if (!user) {
      throw new ActionError("FORBIDDEN", "Invalid email or password")
    }

    if (!user.password) {
      throw new ActionError(
        "FORBIDDEN",
        "This account is linked to social provider",
      )
    }

    const isPasswordValid = await verify(user.password, password)
    if (!isPasswordValid) {
      throw new ActionError("FORBIDDEN", "Invalid email or password")
    }

    await createSession(user.id)

    if (!user.emailVerified) {
      const { error } = await sendVerificationCode(user.id, user.email)
      if (error) {
        throw new ActionError("CONFLICT", error)
      }

      redirect(REDIRECTS.toVerify)
    }

    if (user.role === "customer") {
      redirect(REDIRECTS.afterLogin)
    } else {
      redirect(REDIRECTS.afterAdminLogin)
    }
  })

async function sendVerificationCode(userId: string, email: string) {
  await db
    .delete(verificationTokens)
    .where(
      and(
        eq(verificationTokens.userId, userId),
        eq(verificationTokens.type, "verify email"),
      ),
    )

  const code = generateRandomString(6, alphabet("0-9"))

  await db.insert(verificationTokens).values({
    userId: userId,
    token: code,
    type: "verify email",
    expiresAt: createDate(new TimeSpan(15, "m")),
  })

  const mail = verificationEmail({ code })

  const { error } = await sendMail({
    to: email,
    subject: "Confirm your email address",
    ...mail,
  })

  if (error) {
    return { error: "Error sending verification code, try again later" }
  }

  return { error: null }
}

export const resendVerificationCode = action.action(async () => {
  // TODO: rate limit
  const { user } = await getSession()

  if (!user) {
    throw new ActionError("UNAUTHORIZED", "Unauthorized")
  }

  const { error } = await sendVerificationCode(user.id, user.email)
  if (error) {
    throw new ActionError("CONFLICT", error)
  }

  return { success: true }
})

export const signUp = action
  .schema(signUpSchema)
  .action(async ({ parsedInput: { password, name, email } }) => {
    const hashedPassword = await hash(password)
    const userId = createId()

    await db
      .insert(users)
      .values({ id: userId, name, email, hashedPassword })
      .catch((e) => {
        if (e.code === "23505") {
          throw new ActionError("CONFLICT", "User already exists")
        } else {
          throw e
        }
      })

    await createSession(userId)

    const { error } = await sendVerificationCode(userId, email)
    if (error) {
      throw new ActionError("CONFLICT", error)
    }

    redirect(REDIRECTS.toVerify)
  })

export const verifyCode = action
  .schema(otpSchema)
  .action(async ({ parsedInput: { code } }) => {
    const { user } = await getSession()

    if (!user) {
      throw new ActionError("UNAUTHORIZED", "Unauthorized")
    }

    const [token] = await db
      .select()
      .from(verificationTokens)
      .where(
        and(
          eq(verificationTokens.userId, user.id),
          eq(verificationTokens.token, code),
          eq(verificationTokens.type, "verify email"),
        ),
      )

    if (!token) {
      throw new ActionError("FORBIDDEN", "Invalid otp code")
    }

    await db
      .delete(verificationTokens)
      .where(eq(verificationTokens.id, token.id))

    if (!isWithinExpirationDate(token.expiresAt)) {
      throw new ActionError("FORBIDDEN", "Invalid otp code")
    }

    await db
      .update(users)
      .set({ emailVerified: new Date() })
      .where(eq(users.id, user.id))

    if (user.role === "customer") {
      redirect(REDIRECTS.afterLogin)
    } else {
      redirect(REDIRECTS.afterAdminLogin)
    }
  })

export const sendResetPasswordLink = action
  .schema(emailSchema)
  .action(async ({ parsedInput: { email } }) => {
    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))

    if (!user) {
      throw new ActionError("UNAUTHORIZED", "Unauthorized")
    }

    await db
      .delete(verificationTokens)
      .where(
        and(
          eq(verificationTokens.userId, user.id),
          eq(verificationTokens.type, "reset password"),
        ),
      )

    const tokenId = generateIdFromEntropySize(25)
    const tokenHash = encodeHex(await sha256(new TextEncoder().encode(tokenId)))

    await db.insert(verificationTokens).values({
      id: tokenId,
      token: tokenHash,
      type: "reset password",
      userId: user.id,
      expiresAt: createDate(new TimeSpan(15, "m")),
    })

    const url = `${SITE_URL}/reset-password/${tokenId}`

    const mail = resetPasswordEmail({ url })

    const { error } = await sendMail({
      to: email,
      subject: "Reset your password",
      ...mail,
    })

    if (error) {
      throw new ActionError(
        "INTERNAL_SERVER_ERROR",
        "Error sending code, try again later",
      )
    }

    return { success: true }
  })

export const resetPassword = action
  .schema(resetPasswordSchema.and(z.object({ token: z.string().min(1) })))
  .action(async ({ parsedInput: { password, token } }) => {
    const tokenHash = encodeHex(await sha256(new TextEncoder().encode(token)))
    const [verificationToken] = await db
      .select()
      .from(verificationTokens)
      .where(eq(verificationTokens.token, tokenHash))

    if (verificationToken) {
      await db
        .delete(verificationTokens)
        .where(eq(verificationTokens.id, verificationToken.id))
    }

    if (
      !verificationToken ||
      !isWithinExpirationDate(verificationToken.expiresAt)
    ) {
      throw new ActionError("FORBIDDEN", "Token invalid or has been expired")
    }

    await lucia.invalidateUserSessions(verificationToken.userId)
    const hashedPassword = await hash(password)

    await db
      .update(users)
      .set({ hashedPassword })
      .where(eq(users.id, verificationToken.userId))

    await createSession(verificationToken.userId)

    return { success: true }
  })

export const createGoogleAuthorizationURL = action.action(async () => {
  const state = generateState()
  const codeVerifier = generateCodeVerifier()

  cookies().set(GOOGLE_CODE_VERIFIER_COOKIE, codeVerifier, {
    path: "/",
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 60 * 10,
    sameSite: "lax",
  })

  cookies().set(GOOGLE_STATE_COOKIE, state, {
    path: "/",
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 60 * 10,
    sameSite: "lax",
  })

  const url = await google.createAuthorizationURL(state, codeVerifier, {
    scopes: ["email", "profile"],
  })

  redirect(url.toString())
})

export const createFacebookAuthorizationURL = action.action(async () => {
  const state = generateState()

  const url = await facebook.createAuthorizationURL(state, {
    scopes: ["email", "public_profile"],
  })

  redirect(url.toString())
})

export const signOut = action.action(async () => {
  const { user, session } = await getSession()
  if (!user || !session) {
    throw new ActionError("UNAUTHORIZED", "Unauthorized")
  }

  await lucia.invalidateSession(session.id)
  const sessionCookie = lucia.createBlankSessionCookie()
  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes,
  )

  revalidatePath("/", "layout")
})
