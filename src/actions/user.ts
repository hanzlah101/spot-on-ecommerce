"use server"

import { z } from "zod"
import { eq, inArray } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { hash, verify } from "@node-rs/argon2"
import { DEFAULT_SERVER_ERROR_MESSAGE } from "next-safe-action"

import { db } from "@/db"
import { users } from "@/db/schema"
import { createSession } from "./auth"
import { onlyAdminAction } from "@/utils/action"
import { getSession, lucia } from "@/utils/auth"
import {
  UpdateUserPasswordSchema,
  UpdateUserProfileSchema,
} from "@/utils/validations/user"

export async function updateUserProfile(input: UpdateUserProfileSchema) {
  try {
    const { user } = await getSession()

    if (!user) {
      return { error: "Unauthorized" }
    }

    await db.update(users).set(input).where(eq(users.id, user.id))

    revalidatePath("/", "layout")
    return { error: null }
  } catch (error) {
    return { error: DEFAULT_SERVER_ERROR_MESSAGE }
  }
}

export async function updateUserPassword({
  oldPassword,
  newPassword,
}: UpdateUserPasswordSchema) {
  try {
    const { user } = await getSession()

    if (!user) {
      return { error: "Unauthorized" }
    }

    const [userWithPw] = await db
      .select({ hashedPassword: users.hashedPassword })
      .from(users)
      .where(eq(users.id, user.id))

    if (!userWithPw) {
      return { error: "Unauthorized" }
    }

    if (!userWithPw.hashedPassword) {
      return { error: "Your account is linked with a social provider" }
    }

    const isPasswordCorrect = await verify(
      userWithPw.hashedPassword,
      oldPassword,
    )

    if (!isPasswordCorrect) {
      return { error: "Old password is invalid" }
    }

    const newPasswordHash = await hash(newPassword)

    await db
      .update(users)
      .set({ hashedPassword: newPasswordHash })
      .where(eq(users.id, user.id))

    await lucia.invalidateUserSessions(user.id)
    await createSession(user.id)

    return { error: null }
  } catch (error) {
    return { error: DEFAULT_SERVER_ERROR_MESSAGE }
  }
}

export const updateUsersRole = onlyAdminAction
  .schema(
    z.object({
      ids: z.string().min(1).cuid2().array().min(1),
      role: z.enum(["moderator", "customer"]),
    }),
  )
  .action(async ({ parsedInput: { ids, role } }) => {
    await db.update(users).set({ role }).where(inArray(users.id, ids))
    revalidatePath("/dashboard/moderators")
    revalidatePath("/dashboard/customers")
  })

export const deleteUsers = onlyAdminAction
  .schema(z.object({ ids: z.string().min(1).cuid2().array().min(1) }))
  .action(async ({ parsedInput: { ids } }) => {
    await db.delete(users).where(inArray(users.id, ids))
    revalidatePath("/dashboard/moderators")
    revalidatePath("/dashboard/customers")
  })
