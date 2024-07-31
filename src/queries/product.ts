"use server"

import {
  type SQL,
  and,
  count,
  desc,
  eq,
  gte,
  inArray,
  lte,
  or,
  sql,
  asc,
  cosineDistance,
  gt,
} from "drizzle-orm"

import {
  unstable_cache as cache,
  unstable_noStore as noStore,
} from "next/cache"

import { db } from "@/db"
import { filterColumn } from "@/utils/helpers"
import { CartItem, DrizzleWhere } from "@/utils/types"
import { LIBRARY_IMAGES_LIMIT } from "@/utils/constants"
import {
  GetProductsSchema,
  SearchProductsSchema,
} from "@/utils/validations/product"

import {
  Product,
  favouriteProducts,
  galleryImages,
  productVariantCombinations,
  productVariantValues,
  products,
} from "@/db/schema"

import { SEARCH_PRODUCTS_LIMIT } from "@/utils/constants/products"
import { generateEmbeddingWithCache } from "@/utils/embedding"

export async function getImages(page = 1) {
  try {
    const images = await db
      .select()
      .from(galleryImages)
      .limit(LIBRARY_IMAGES_LIMIT)
      .offset((page - 1) * LIBRARY_IMAGES_LIMIT)
      .orderBy(desc(galleryImages.createdAt))

    return { images, hasMore: images.length === LIBRARY_IMAGES_LIMIT }
  } catch (error) {
    return { images: [], hasMore: false }
  }
}

export async function getEditProduct(productId: string) {
  try {
    const product = await db.query.products.findFirst({
      where: eq(products.id, productId),
      with: {
        productVariants: true,
        productVariantValues: true,
      },
      columns: {
        id: true,
        title: true,
        type: true,
        images: true,
        shortDescription: true,
        longDescription: true,
        categoryId: true,
        subcategoryId: true,
        label: true,
        status: true,
        tags: true,
        price: true,
        stock: true,
        saleDuration: true,
        salePrice: true,
      },
    })

    if (!product) return null

    return product
  } catch (error) {
    return null
  }
}

export async function getProductCombinations(productId: string) {
  try {
    const combinations = await db.query.productVariantCombinations.findMany({
      where: eq(productVariantCombinations.productId, productId),
      with: {
        combinationVariantValues: {
          with: { variantValue: true },
        },
      },
    })

    return combinations
  } catch (error) {
    return []
  }
}

export async function getFeaturedProducts() {
  return await cache(
    async () => {
      return db.query.products.findMany({
        limit: 8,
        where: and(
          eq(products.label, "featured"),
          eq(products.status, "active"),
        ),
        orderBy: desc(products.labelledAt),
        columns: {
          id: true,
          title: true,
          type: true,
          images: true,
          shortDescription: true,
          longDescription: true,
          categoryId: true,
          subcategoryId: true,
          label: true,
          status: true,
          tags: true,
          price: true,
          stock: true,
          saleDuration: true,
          salePrice: true,
          rating: true,
        },
      })
    },
    ["featured-products"],
    {
      revalidate: 3600, // every hour
      tags: ["featured-products"],
    },
  )()
}

export async function getProductById(productId: string) {
  noStore()

  try {
    return await db.transaction(async (tx) => {
      const product = await tx.query.products.findFirst({
        where: and(eq(products.id, productId), eq(products.status, "active")),
        columns: {
          id: true,
          title: true,
          type: true,
          images: true,
          price: true,
          stock: true,
          saleDuration: true,
          salePrice: true,
          rating: true,
          shortDescription: true,
          longDescription: true,
        },
      })

      if (!product) {
        return null
      }

      if (product.type === "variable") {
        const prodVariants = await tx.query.productVariantValues.findMany({
          where: eq(productVariantValues.productId, product.id),
          with: {
            variantValue: true,
            variant: true,
          },
        })

        const productCombinations =
          await tx.query.productVariantCombinations.findMany({
            where: eq(productVariantValues.productId, product.id),
            with: {
              combinationVariantValues: true,
            },
          })

        return { product, prodVariants, productCombinations }
      }

      return { product, prodVariants: null, productCombinations: null }
    })
  } catch (error) {
    return null
  }
}

export async function getCartProducts(
  items: Omit<CartItem, "quantity" | "isSelected">[],
  skipOutOfStock = false,
) {
  if (!items?.length) return []

  function isValidValue<T>(value: T | null | undefined | ""): value is T {
    return value !== null && value !== undefined && value !== ""
  }

  const productIds = items?.map((id) => id.productId)?.filter(isValidValue)
  const combinationIds = items
    ?.map((id) => id.combinationId)
    ?.filter(isValidValue)

  try {
    const productsWithCombinations = await db.query.products.findMany({
      where: and(
        inArray(products.id, productIds),
        eq(products.status, "active"),
        skipOutOfStock ? gte(products.stock, 1) : undefined,
      ),
      columns: {
        id: true,
        title: true,
        images: true,
        price: true,
        stock: true,
        saleDuration: true,
        salePrice: true,
      },
      with: {
        productVariantCombinations: {
          where:
            combinationIds?.length > 0
              ? skipOutOfStock
                ? and(
                    gte(productVariantCombinations.stock, 1),
                    inArray(productVariantCombinations.id, combinationIds),
                  )
                : inArray(productVariantCombinations.id, combinationIds)
              : eq(productVariantCombinations.id, "-1"),
          with: {
            combinationVariantValues: {
              with: {
                variantValue: true,
              },
              columns: {},
            },
          },
        },
      },
    })

    const result = productsWithCombinations
      .map(({ productVariantCombinations, ...product }) => {
        if (productVariantCombinations.length === 0) {
          return [{ ...product, combination: null }]
        } else {
          return productVariantCombinations.map((combination) => ({
            ...product,
            combination,
          }))
        }
      })
      .flat()

    return result
  } catch (error) {
    console.error({ error })
    return []
  }
}

type CheckoutProducts =
  | {
      mode: "cart"
      cartItems: Omit<CartItem, "quantity" | "isSelected">[]
    }
  | {
      mode: "buy-now"
      productId: string
      quantity: number
      combinationId?: string
    }

export async function getCheckoutProducts(props: CheckoutProducts) {
  try {
    if (props.mode === "cart") {
      const data = await getCartProducts(props.cartItems, true)
      return data
    } else {
      const item = {
        productId: props.productId,
        combinationId: props.combinationId,
      }
      const data = await getCartProducts([item], true)
      return data
    }
  } catch (error) {
    return []
  }
}

export async function getDashboardProducts(input: GetProductsSchema) {
  noStore()

  const {
    page,
    per_page,
    sort,
    title,
    status,
    type,
    label,
    operator,
    from,
    to,
  } = input

  try {
    const offset = (page - 1) * per_page
    const [column, order] = (sort?.split(".").filter(Boolean) ?? [
      "updatedAt",
      "desc",
    ]) as [keyof Product | undefined, "asc" | "desc" | undefined]

    const fromDay = from ? sql`to_date(${from}, 'yyyy-mm-dd')` : undefined
    const toDay = to ? sql`to_date(${to}, 'yyyy-mm-dd')` : undefined

    const expressions: (SQL<unknown> | undefined)[] = [
      title
        ? filterColumn({
            column: products.title,
            value: title,
          })
        : undefined,
      !!status
        ? filterColumn({
            column: products.status,
            value: status,
            isSelectable: true,
          })
        : undefined,
      !!type
        ? filterColumn({
            column: products.type,
            value: type,
            isSelectable: true,
          })
        : undefined,
      !!label
        ? filterColumn({
            column: products.label,
            value: label,
            isSelectable: true,
          })
        : undefined,
      fromDay && toDay
        ? and(gte(products.createdAt, fromDay), lte(products.createdAt, toDay))
        : undefined,
    ]

    const where: DrizzleWhere<Product> =
      !operator || operator === "and" ? and(...expressions) : or(...expressions)

    const { data, total } = await db.transaction(async (tx) => {
      const data = await tx.query.products.findMany({
        limit: per_page,
        offset,
        where,
        orderBy:
          column && column in products
            ? order === "asc"
              ? asc(products[column])
              : desc(products[column])
            : desc(products.updatedAt),
        columns: {
          id: true,
          title: true,
          type: true,
          images: true,
          label: true,
          status: true,
          price: true,
          stock: true,
          createdAt: true,
          updatedAt: true,
        },
      })

      const total = await tx
        .select({ count: count() })
        .from(products)
        .where(where)
        .execute()
        .then((res) => res[0]?.count ?? 0)

      return { data, total }
    })

    const pageCount = Math.ceil(total / per_page)
    return { data, pageCount }
  } catch (error) {
    return { data: [], pageCount: 0 }
  }
}

export async function searchProducts(input: SearchProductsSchema) {
  noStore()

  const {
    page,
    sort,
    query,
    minPrice,
    maxPrice,
    rating,
    categoryId,
    subcategoryId,
  } = input

  try {
    const offset = (page - 1) * SEARCH_PRODUCTS_LIMIT

    const [column, order] = (
      (sort?.split(".").filter(Boolean) ?? query)
        ? ["similarity", "desc"]
        : ["rating", "desc"]
    ) as [keyof Product | undefined, "asc" | "desc" | undefined]

    const expressions: SQL<unknown>[] = [
      eq(products.status, "active"),
      categoryId ? eq(products.categoryId, categoryId) : undefined,
      subcategoryId ? eq(products.subcategoryId, subcategoryId) : undefined,
      minPrice ? gte(products.price, minPrice) : undefined,
      maxPrice ? lte(products.price, maxPrice) : undefined,
      rating ? gte(products.rating, rating) : undefined,
    ].filter((expr): expr is SQL<unknown> => expr !== undefined)

    const select = {
      id: products.id,
      title: products.title,
      type: products.type,
      images: products.images,
      price: products.price,
      salePrice: products.salePrice,
      saleDuration: products.saleDuration,
      stock: products.stock,
      rating: products.rating,
      shortDescription: products.shortDescription,
      longDescription: products.longDescription,
    } as const

    const { data, total } = await db.transaction(async (tx) => {
      if (!query || query.trim() === "") {
        const data = await tx
          .select(select)
          .from(products)
          .where(and(...expressions))
          .limit(SEARCH_PRODUCTS_LIMIT)
          .offset(offset)
          .orderBy(
            column && column in products
              ? order === "asc"
                ? asc(products[column])
                : desc(products[column])
              : desc(products.rating),
          )

        const total = await tx
          .select({ count: count() })
          .from(products)
          .where(and(...expressions))
          .execute()
          .then((res) => res[0]?.count ?? 0)

        return { data, total }
      } else {
        const embedding = await generateEmbeddingWithCache(query)
        const similarity = sql<number>`1 - (${cosineDistance(products.embedding, embedding)})`

        const data = await tx
          .select({ ...select, similarity })
          .from(products)
          .where(and(...expressions, gt(similarity, 0.63)))
          .limit(SEARCH_PRODUCTS_LIMIT)
          .offset(offset)
          .orderBy((t) =>
            column && column in products
              ? order === "asc"
                ? asc(products[column])
                : desc(products[column])
              : desc(t.similarity),
          )

        const total = await tx
          .select({ count: count() })
          .from(products)
          .where(and(...expressions, gt(similarity, 0.7)))
          .execute()
          .then((res) => res[0]?.count ?? 0)

        return { data, total }
      }
    })

    const pageCount = Math.ceil(total / SEARCH_PRODUCTS_LIMIT)
    return { pageCount, data, total }
  } catch (error) {
    console.error({ error })
    return { data: [], pageCount: 0 }
  }
}

export async function isFavouriteProduct(productId: string, userId?: string) {
  try {
    if (!userId) return false

    const [isFavourite] = await db
      .select({})
      .from(favouriteProducts)
      .where(
        and(
          eq(favouriteProducts.userId, userId),
          eq(favouriteProducts.productId, productId),
        ),
      )

    return !!isFavourite
  } catch (error) {
    return false
  }
}
