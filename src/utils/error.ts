import {
  DEFAULT_SERVER_ERROR_MESSAGE,
  FlattenedValidationErrors,
} from "next-safe-action"

import type { NextRequest } from "next/server"
import { ApiError } from "next/dist/server/api-utils"

const ERROR_CODES = {
  UNAUTHORIZED: "UNAUTHORIZED",
  INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  CONFLICT: "CONFLICT",
} as const

export class ActionError extends Error {
  errCode: keyof typeof ERROR_CODES
  constructor(code: keyof typeof ERROR_CODES, message: string) {
    super(message)
    this.errCode = code
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}

export function parseError({
  validationErrors,
  serverError,
}: {
  serverError?: string
  validationErrors?: FlattenedValidationErrors<any>
}) {
  if (!!validationErrors && !!validationErrors.formErrors?.length) {
    return validationErrors.formErrors?.[0] ?? DEFAULT_SERVER_ERROR_MESSAGE
  } else if (serverError) {
    return serverError
  } else {
    return DEFAULT_SERVER_ERROR_MESSAGE
  }
}

export const apiErrorHandler =
  (handler: Function) => async (req: NextRequest, args: any) => {
    try {
      return await handler(req, args)
    } catch (error: any) {
      if (error instanceof ApiError) {
        return Response.json(
          { message: error.message },
          { status: error.statusCode },
        )
      } else {
        console.error(error)
        return Response.json(
          { message: DEFAULT_SERVER_ERROR_MESSAGE },
          { status: 500 },
        )
      }
    }
  }
