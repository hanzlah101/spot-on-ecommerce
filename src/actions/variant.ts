"use server"

import { z } from "zod"
import { revalidateTag, unstable_noStore as noStore } from "next/cache"
import { eq, inArray } from "drizzle-orm"
import { createId } from "@paralleldrive/cuid2"

import { db } from "@/db"
import { variantValues, variants } from "@/db/schema"
import { adminAction } from "@/utils/action"
import { ActionError } from "@/utils/error"
import { variantSchema } from "@/utils/validations/variant"
import { updateManyWithDifferentValues } from "@/utils/helpers"

export const createVariant = adminAction
  .schema(variantSchema)
  .action(async ({ parsedInput: { values, ...data } }) => {
    noStore()

    await db.transaction(async (tx) => {
      const variantId = createId()

      await tx
        .insert(variants)
        .values({ id: variantId, ...data })
        .catch((e) => {
          if (e.code === "23505") {
            throw new ActionError(
              "CONFLICT",
              "Variant already exists with this slug",
            )
          } else {
            throw e
          }
        })

      await tx
        .insert(variantValues)
        .values(
          values.map((val) => ({
            ...val,
            variantId,
          })),
        )
        .catch((e) => {
          if (e.code === "23505") {
            throw new ActionError(
              "CONFLICT",
              "Value already exists under this variant",
            )
          } else {
            throw e
          }
        })
    })

    revalidateTag("variants")
  })

export const updateVariant = adminAction
  .schema(variantSchema.extend({ variantId: z.string().min(1).cuid2() }))
  .action(async ({ parsedInput: { values, variantId, ...data } }) => {
    noStore()

    await db.transaction(async (tx) => {
      const variant = await tx.query.variants.findFirst({
        where: eq(variants.id, variantId),
        with: {
          variantValues: true,
        },
        columns: {
          id: true,
        },
      })

      if (!variant) {
        throw new ActionError("NOT_FOUND", "Variant not found")
      }

      await tx
        .update(variants)
        .set(data)
        .where(eq(variants.id, variantId))
        .catch((e) => {
          if (e.code === "23505") {
            throw new ActionError(
              "CONFLICT",
              "Variant already exists with this slug",
            )
          } else {
            throw e
          }
        })

      const valuesToInsert = values
        .filter((val) => !variant.variantValues.some(({ id }) => id === val.id))
        .map((val) => ({
          id: val.id,
          name: val.name,
          value: val.value,
          variantId: variant.id,
        }))

      if (valuesToInsert.length > 0) {
        await db
          .insert(variantValues)
          .values(valuesToInsert)
          .catch((e) => {
            if (e.code === "23505") {
              throw new ActionError(
                "CONFLICT",
                "Value already exists under this variant",
              )
            } else {
              throw e
            }
          })
      }

      const valuesToDel = variant.variantValues
        .filter((val) => !values.some((v) => v.id === val?.id))
        .map((val) => val?.id)

      if (valuesToDel.length > 0) {
        await db
          .delete(variantValues)
          .where(inArray(variantValues.id, valuesToDel))
      }

      const valuesToUpdate = values
        .filter((val) =>
          variant.variantValues.some(
            (v) =>
              v?.id === val.id &&
              (v.name !== val.name || v.value !== val.value),
          ),
        )
        .map((val) => ({
          id: val.id,
          name: val.name,
          value: val.value,
        }))

      if (valuesToUpdate.length > 0) {
        await updateManyWithDifferentValues(
          tx,
          variantValues,
          valuesToUpdate,
          "id",
        )
      }

      revalidateTag("variants")
    })
  })

export const deleteVariants = adminAction
  .schema(z.object({ ids: z.string().min(1).cuid2().array().min(1) }))
  .action(async ({ parsedInput: { ids } }) => {
    await db.delete(variants).where(inArray(variants.id, ids))
    revalidateTag("variants")
  })
