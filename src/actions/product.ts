"use server"

import { z } from "zod"
import { and, eq, inArray } from "drizzle-orm"
import { createId } from "@paralleldrive/cuid2"
import { redirect } from "next/navigation"
import { revalidatePath, revalidateTag } from "next/cache"

import { db } from "@/db"
import { adminAction, authenticatedAction } from "@/utils/action"
import { isEqual } from "@/utils"
import { generateEmbedding } from "@/utils/embedding"
import { ActionError } from "@/utils/error"
import { updateManyWithDifferentValues } from "@/utils/helpers"
import { isFavouriteProduct } from "@/queries/product"
import {
  type Product,
  combinationVariantValues,
  favouriteProducts,
  productVariantCombinations,
  productVariantValues,
  productVariants,
  products,
} from "@/db/schema"

import {
  productDetailsSchema,
  variableProductInventorySchema,
  simpleProductInventorySchema,
  updateProductCombinationsSchema,
  publishProductSchema,
  updateProductsLabelStatusSchema,
  deleteProductsSchema,
  updateProductLabelStatusSchema,
} from "@/utils/validations/product"

export const createProduct = adminAction
  .schema(productDetailsSchema)
  .action(
    async ({ parsedInput: { longDescription, ...input }, ctx: { user } }) => {
      const productId = createId()
      const embedding = await generateEmbedding(
        `${input.title}. ${input.shortDescription}`,
      )

      const description =
        typeof longDescription === "string"
          ? JSON.parse(longDescription)
          : longDescription

      await db.insert(products).values({
        id: productId,
        embedding,
        userId: user.id,
        longDescription: description,
        ...input,
      })

      revalidatePath("/dashboard/products")
      revalidatePath(`/dashboard/products/e/${productId}`)

      redirect(`/dashboard/products/e/${productId}?step=1`)
    },
  )

export const updateProductDetails = adminAction
  .schema(productDetailsSchema.extend({ productId: z.string().min(1) }))
  .action(async ({ parsedInput: { productId, longDescription, ...input } }) => {
    const [product] = await db
      .select({ title: products.title, description: products.shortDescription })
      .from(products)
      .where(eq(products.id, productId))

    if (!product) {
      throw new ActionError("NOT_FOUND", "Product not found")
    }

    const description =
      typeof longDescription === "string"
        ? JSON.parse(longDescription)
        : longDescription

    if (
      product.title !== input.title ||
      product.description !== input.shortDescription
    ) {
      const embedding = await generateEmbedding(
        `${input.title}. ${input.shortDescription}`,
      )

      await db
        .update(products)
        .set({ embedding, longDescription: description, ...input })
        .where(eq(products.id, productId))
    } else {
      await db
        .update(products)
        .set({ longDescription: description, ...input })
        .where(eq(products.id, productId))
    }

    revalidatePath("/dashboard/products")
    revalidatePath(`/dashboard/products/e/${productId}`)

    redirect(`/dashboard/products/e/${productId}?step=1`)
  })

export const updateSimpleProductInventory = adminAction
  .schema(
    simpleProductInventorySchema.and(
      z.object({ productId: z.string().min(1) }),
    ),
  )
  .action(async ({ parsedInput: { productId, ...input } }) => {
    await db.update(products).set(input).where(eq(products.id, productId))

    revalidatePath("/dashboard/products")
    revalidatePath(`/dashboard/products/e/${productId}`)

    redirect(`/dashboard/products/e/${productId}?step=2`)
  })

export const updateProductVariants = adminAction
  .schema(
    variableProductInventorySchema.and(
      z.object({ productId: z.string().min(1) }),
    ),
  )
  .action(
    async ({
      parsedInput: {
        productId,
        values: inputVariantValues,
        variants: inputVariants,
        variantValueImages,
        ...data
      },
    }) => {
      await db.transaction(async (tx) => {
        await tx.update(products).set(data).where(eq(products.id, productId))

        const product = await tx.query.products.findFirst({
          where: eq(products.id, productId),
          with: {
            productVariants: true,
            productVariantValues: true,
          },
          columns: { id: true },
        })

        if (!product) {
          throw new ActionError("NOT_FOUND", "Product not found")
        }

        async function deleteProductVariantValues(ids?: string[]) {
          const deletedValues = await tx
            .delete(productVariantValues)
            .where(
              and(
                eq(productVariantValues.productId, productId),
                !!ids
                  ? inArray(productVariantValues.variantValueId, ids)
                  : inArray(productVariantValues.variantId, variantsToDelete),
              ),
            )
            .returning({ id: productVariantValues.variantValueId })

          if (deletedValues.length > 0) {
            const deletedCombinations = await tx
              .delete(combinationVariantValues)
              .where(
                and(
                  eq(combinationVariantValues.productId, productId),
                  inArray(
                    combinationVariantValues.variantValueId,
                    deletedValues.map(({ id }) => id),
                  ),
                ),
              )
              .returning({ id: combinationVariantValues.combinationId })

            if (deletedCombinations.length > 0) {
              await tx.delete(productVariantCombinations).where(
                inArray(
                  productVariantCombinations.id,
                  deletedCombinations.map(({ id }) => id),
                ),
              )
            }
          }
        }

        const variantsToDelete = Array.from(
          new Set(
            product.productVariants
              .filter(
                (v) => !inputVariants.some((id: string) => id === v.variantId),
              )
              .map((v) => v.variantId),
          ),
        )

        if (variantsToDelete.length > 0) {
          await tx
            .delete(productVariants)
            .where(
              and(
                eq(productVariants.productId, productId),
                inArray(productVariants.variantId, variantsToDelete),
              ),
            )

          await deleteProductVariantValues()
        }

        const variantsToInsert = Array.from(
          new Set(
            inputVariants.filter(
              (variantId) =>
                !product.productVariantValues.some(
                  (v) => v.variantId === variantId,
                ),
            ),
          ),
        ).map((variantId) => ({
          variantId,
          productId,
        }))

        if (variantsToInsert.length > 0) {
          await tx.insert(productVariants).values(variantsToInsert)
        }

        const values = Array.from(
          new Set(Object.values(inputVariantValues).flat()),
        )

        const variantValuesToDelete = product.productVariantValues
          .filter((v) => !values.some((id) => id === v.variantValueId))
          .map((v) => v.variantValueId)

        if (variantValuesToDelete.length > 0) {
          await db
            .delete(productVariantValues)
            .where(
              and(
                eq(productVariantValues.productId, productId),
                inArray(
                  productVariantValues.variantValueId,
                  variantValuesToDelete,
                ),
              ),
            )

          await deleteProductVariantValues(variantValuesToDelete)
        }

        const variantValuesToInsert = values
          .filter(
            (valueId) =>
              !product.productVariantValues.some(
                (v) => v.variantValueId === valueId,
              ),
          )
          .map((variantValueId) => {
            const variantId = Object.keys(inputVariantValues).find(
              (variantId) =>
                inputVariantValues[variantId].includes(variantValueId),
            ) as string

            return {
              variantValueId,
              variantId,
              productId,
              images: variantValueImages[variantValueId] || [],
            }
          })

        if (variantValuesToInsert.length > 0) {
          await tx.insert(productVariantValues).values(variantValuesToInsert)
        }

        const variantValuesToUpdate = product.productVariantValues.filter((v) =>
          values.some((id) => id === v.variantValueId),
        )

        if (variantValuesToUpdate.length > 0) {
          await Promise.all(
            variantValuesToUpdate.map(async (value) => {
              const images = variantValueImages[value.variantValueId] ?? []
              if (isEqual(value.images, images)) return

              return await tx
                .update(productVariantValues)
                .set({ images })
                .where(
                  and(
                    eq(productVariantValues.productId, productId),
                    eq(
                      productVariantValues.variantValueId,
                      value.variantValueId,
                    ),
                  ),
                )
            }),
          )
        }
      })

      revalidatePath("/dashboard/products")
      revalidatePath(`/dashboard/products/e/${productId}`)

      redirect(`/dashboard/products/e/${productId}?step=2`)
    },
  )

export const loadProductCombinationVariantValues = adminAction
  .schema(z.object({ productId: z.string().min(1).cuid2() }))
  .action(async ({ parsedInput: { productId } }) => {
    const product = await db.query.products.findFirst({
      where: eq(products.id, productId),
      columns: {
        price: true,
        salePrice: true,
        saleDuration: true,
      },
      with: {
        productVariantValues: {
          with: {
            variantValue: {
              columns: {
                id: true,
              },
              with: {
                variant: {
                  columns: {
                    id: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!product) {
      throw new ActionError("NOT_FOUND", "Product not found")
    }

    if (!product.productVariantValues?.length) {
      throw new ActionError(
        "FORBIDDEN",
        "This product has no variants assigned",
      )
    }

    const varValues = product.productVariantValues?.map((v) => v.variantValue)

    const variantValuesMap = varValues.reduce(
      (acc, vv) => {
        if (!acc[vv.variant.id]) acc[vv.variant.id] = []
        acc[vv.variant.id].push(vv)
        return acc
      },
      {} as Record<string, { id: string }[]>,
    )

    const generateCombinations = (
      variants: string[],
      current: { variantId: string; variantValueId: string }[] = [],
    ): { variantId: string; variantValueId: string }[][] => {
      if (variants.length === 0) return [current]
      const [first, ...rest] = variants
      return variantValuesMap[first]?.flatMap((vv) =>
        generateCombinations(rest, [
          ...current,
          { variantId: first, variantValueId: vv.id },
        ]),
      )
    }

    const allCombinations = generateCombinations(Object.keys(variantValuesMap))

    const existingCombinations = await db
      .select({
        combinationId: productVariantCombinations.id,
        variantValueId: combinationVariantValues.variantValueId,
      })
      .from(productVariantCombinations)
      .innerJoin(
        combinationVariantValues,
        eq(
          combinationVariantValues.combinationId,
          productVariantCombinations.id,
        ),
      )
      .where(eq(productVariantCombinations.productId, productId))

    const existingCombinationsMap = new Map<string, string[]>()
    existingCombinations.forEach((ec) => {
      if (!existingCombinationsMap.has(ec.combinationId)) {
        existingCombinationsMap.set(ec.combinationId, [])
      }
      existingCombinationsMap.get(ec.combinationId)!.push(ec.variantValueId)
    })

    const existingCombinationSet = new Set<string>(
      Array.from(existingCombinationsMap.values()).map((values) =>
        values.sort().join(","),
      ),
    )

    const newCombinations = allCombinations.filter(
      (combo) =>
        !existingCombinationSet.has(
          combo
            .map((c) => c.variantValueId)
            .sort()
            .join(","),
        ),
    )

    if (newCombinations?.length > 0) {
      for (const combination of newCombinations) {
        await db.transaction(async (tx) => {
          const [newCombination] = await tx
            .insert(productVariantCombinations)
            .values({
              productId,
              price: product.price ?? 0,
              salePrice: product.salePrice,
              saleDuration: product.saleDuration,
            })
            .returning()

          await tx.insert(combinationVariantValues).values(
            combination.map((combo) => ({
              productId,
              variantId: combo.variantId,
              variantValueId: combo.variantValueId,
              combinationId: newCombination.id,
            })),
          )
        })
      }
    }

    revalidatePath("/dashboard/products")
    revalidatePath(`/dashboard/products/e/${productId}`)

    return { success: true }
  })

export const updateProductCombinations = adminAction
  .schema(
    updateProductCombinationsSchema.extend({
      productId: z.string().min(1).cuid2(),
    }),
  )
  .action(async ({ parsedInput: { combinations, productId } }) => {
    await updateManyWithDifferentValues(
      db,
      productVariantCombinations,
      combinations,
      "id",
    )

    revalidatePath("/dashboard/products")
    revalidatePath(`/dashboard/products/e/${productId}`)

    redirect(`/dashboard/products/e/${productId}?step=3`)
  })

export const deleteProductCombinations = adminAction
  .schema(z.object({ productId: z.string().min(1).cuid2() }))
  .action(async ({ parsedInput: { productId } }) => {
    await db
      .delete(productVariantCombinations)
      .where(eq(productVariantCombinations.productId, productId))

    revalidatePath("/dashboard/products")
    revalidatePath(`/dashboard/products/e/${productId}`)
  })

export const deleteProductCombinationById = adminAction
  .schema(
    z.object({
      combinationId: z.string().min(1).cuid2(),
      productId: z.string().min(1).cuid2(),
    }),
  )
  .action(async ({ parsedInput: { combinationId, productId } }) => {
    await db
      .delete(productVariantCombinations)
      .where(eq(productVariantCombinations.id, combinationId))

    revalidatePath("/dashboard/products")
    revalidatePath(`/dashboard/products/e/${productId}`)
  })

export const publishProduct = adminAction
  .schema(publishProductSchema.extend({ productId: z.string().min(1).cuid2() }))
  .action(async ({ parsedInput: { productId, ...input }, ctx: { user } }) => {
    if (user.role === "moderator") {
      const [product] = await db
        .select({ label: products.label, status: products.status })
        .from(products)
        .where(eq(products.id, productId))

      if (!product) {
        throw new ActionError("NOT_FOUND", "Product not found")
      }

      if (product.label !== input.label || product.status !== input.status) {
        throw new ActionError("UNAUTHORIZED", "Only admins can change that")
      }
    }

    await db
      .update(products)
      .set({ ...input, labelledAt: getLabelledAt(input.label) })
      .where(eq(products.id, productId))

    revalidateTag("featured-products")
    revalidatePath("/dashboard/products")
    revalidatePath(`/dashboard/products/e/${productId}`)

    redirect(`/dashboard/products`)
  })

export const updateProductsStatusLabel = adminAction
  .schema(updateProductsLabelStatusSchema)
  .action(async ({ parsedInput: { ids, label, status } }) => {
    await db
      .update(products)
      .set({ label, status, labelledAt: getLabelledAt(label) })
      .where(inArray(products.id, ids))

    revalidateTag("featured-products")
    revalidatePath("/dashboard/products")

    ids.map((id) => {
      revalidatePath(`/dashboard/products/e/${id}`)
    })
  })

export const updateProductStatusLabel = adminAction
  .schema(updateProductLabelStatusSchema)
  .action(async ({ parsedInput: { id, label, status } }) => {
    await db
      .update(products)
      .set({ label, status, labelledAt: getLabelledAt(label) })
      .where(eq(products.id, id))

    revalidateTag("featured-products")
    revalidatePath("/dashboard/products")
    revalidatePath(`/dashboard/products/e/${id}`)
  })

export const deleteProducts = adminAction
  .schema(deleteProductsSchema)
  .action(async ({ parsedInput: { ids } }) => {
    await db.delete(products).where(inArray(products.id, ids))

    revalidateTag("featured-products")
    revalidatePath("/dashboard/products")

    ids.map((id) => {
      revalidatePath(`/dashboard/products/e/${id}`)
    })
  })

export const favouriteProduct = authenticatedAction
  .schema(z.object({ productId: z.string().min(1).cuid2() }))
  .action(async ({ parsedInput: { productId }, ctx: { user } }) => {
    const isFavourite = await isFavouriteProduct(productId, user.id)

    if (isFavourite) {
      await db
        .delete(favouriteProducts)
        .where(
          and(
            eq(favouriteProducts.userId, user.id),
            eq(favouriteProducts.productId, productId),
          ),
        )
    } else {
      await db.insert(favouriteProducts).values({ userId: user.id, productId })
    }

    revalidatePath(`/product/${productId}`)
    revalidatePath("/product/favourites")

    return isFavourite
  })

function getLabelledAt(label?: Product["label"]) {
  if (!label) return undefined
  if (label === "none") return null
  return new Date()
}
