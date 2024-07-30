import {
  DEFAULT_SERVER_ERROR_MESSAGE,
  createSafeActionClient,
} from "next-safe-action"

import { ActionError } from "./error"
import { getSession } from "./auth"

export const action = createSafeActionClient({
  defaultValidationErrorsShape: "flattened",
  handleServerErrorLog: console.error,
  handleReturnedServerError(error: any) {
    if (error instanceof ActionError) {
      return error.message
    } else if (error.code === "23503") {
      error.detail
        ? `This item is still ${error.detail.split("is still")[1]}`
        : DEFAULT_SERVER_ERROR_MESSAGE
    } else {
      return DEFAULT_SERVER_ERROR_MESSAGE
    }
  },
})

export const authenticatedAction = action.use(async ({ next }) => {
  const { user, session } = await getSession()

  if (!user || !session || !user.emailVerified) {
    throw new ActionError("UNAUTHORIZED", "Unauthorized")
  }

  return next({
    ctx: {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    },
  })
})

export const adminAction = authenticatedAction.use(
  async ({ next, ctx: { user } }) => {
    if (user.role === "customer") {
      throw new ActionError("UNAUTHORIZED", "Unauthorized")
    }

    return next({ ctx: { user } })
  },
)

export const onlyAdminAction = authenticatedAction.use(
  async ({ next, ctx: { user } }) => {
    if (user.role !== "admin") {
      throw new ActionError("UNAUTHORIZED", "Unauthorized")
    }

    return next({ ctx: { user } })
  },
)
