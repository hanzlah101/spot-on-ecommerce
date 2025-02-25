/* eslint-disable no-unused-vars */
import axios from "axios"
import { type ExtractTablesWithRelations, avg, eq } from "drizzle-orm"
import { createId } from "@paralleldrive/cuid2"
import type { PgTransaction } from "drizzle-orm/pg-core"
import type { PostgresJsQueryResultHKT } from "drizzle-orm/postgres-js"
import type * as schema from "@/db/schema"

import { db } from "."
import { generateEmbedding } from "@/utils/embedding"
import { ProductImage } from "@/utils/types"
import { categories, products, reviews, subcategories, users } from "./schema"

const adminId = "cbhgmskdryxf60tu29d91xdy"

type TX = PgTransaction<
  PostgresJsQueryResultHKT,
  typeof schema,
  ExtractTablesWithRelations<typeof schema>
>

const categoriesData = [
  {
    id: createId(),
    name: "Men",
    description: "Premium products for men.",
    createdAt: getRandomDate(),
    updatedAt: getRandomDate(),
    subcategories: [
      {
        id: createId(),
        name: "Shirts",
        description: "Versatile shirts.",
        createdAt: getRandomDate(),
        updatedAt: getRandomDate(),
        slug: "mens-shirts",
      },
      {
        id: createId(),
        name: "Shoes",
        description: "High-quality footwear.",
        createdAt: getRandomDate(),
        updatedAt: getRandomDate(),
        slug: "mens-shoes",
      },
      {
        id: createId(),
        name: "Watches",
        description: "Stylish watches.",
        createdAt: getRandomDate(),
        updatedAt: getRandomDate(),
        slug: "mens-watches",
      },
    ],
  },
  {
    id: createId(),
    name: "Women",
    description: "Curated products for women.",
    createdAt: getRandomDate(),
    updatedAt: getRandomDate(),
    subcategories: [
      {
        id: createId(),
        name: "Dresses",
        description: "Designer dresses.",
        createdAt: getRandomDate(),
        updatedAt: getRandomDate(),
        slug: "womens-dresses",
      },
      {
        id: createId(),
        name: "Jewellery",
        description: "Exquisite jewellery.",
        createdAt: getRandomDate(),
        updatedAt: getRandomDate(),
        slug: "womens-jewellery",
      },
    ],
  },
  {
    id: createId(),
    name: "Electronics",
    description: "Modern electronics.",
    createdAt: getRandomDate(),
    updatedAt: getRandomDate(),
    subcategories: [
      {
        id: createId(),
        name: "Laptops",
        description: "High-performance laptops.",
        createdAt: getRandomDate(),
        updatedAt: getRandomDate(),
        slug: "laptops",
      },
      {
        id: createId(),
        name: "Smartphones",
        description: "Advanced smartphones.",
        createdAt: getRandomDate(),
        updatedAt: getRandomDate(),
        slug: "smartphones",
      },
    ],
  },
  {
    id: createId(),
    name: "Accessories",
    description: "Essential accessories.",
    createdAt: getRandomDate(),
    updatedAt: getRandomDate(),
    subcategories: [
      {
        id: createId(),
        name: "Fragrances",
        description: "Premium fragrances.",
        createdAt: getRandomDate(),
        updatedAt: getRandomDate(),
        slug: "fragrances",
      },
      {
        id: createId(),
        name: "Mobile accessories",
        description: "Mobile device accessories.",
        createdAt: getRandomDate(),
        updatedAt: getRandomDate(),
        slug: "mobile-accessories",
      },
    ],
  },
]

const subcategoriesData = categoriesData.flatMap((category) => {
  return category.subcategories.map((subcategory) => ({
    ...subcategory,
    categoryId: category.id,
  }))
})

async function seedCategories(tx: TX) {
  await tx.insert(categories).values(categoriesData)
  await tx.insert(subcategories).values(subcategoriesData)
}

type DummyProduct = {
  title: string
  description: string
  price: number
  discountPercentage?: number
  stock: number
  tags: string[]
  images: string[]
}

async function productsData() {
  const data = await Promise.all(
    subcategoriesData.map(async (subcat) => {
      const { data } = await axios.get<{ products: DummyProduct[] }>(
        `https://dummyjson.com/products/category/${subcat.slug}`,
      )

      return await Promise.all(
        data.products.map(async (product) => {
          const embedding = await generateEmbedding(
            `${product.title}. ${product.description}`,
          )

          const { price, discountPercentage, description } = product

          const salePrice = discountPercentage
            ? price * (1 - discountPercentage / 100)
            : null

          const images: ProductImage[] = product.images.map((url, index) => ({
            url,
            id: `${index + 1}`,
            order: index + 1,
            name: product.title,
          }))

          return {
            ...product,
            id: createId(),
            salePrice,
            embedding,
            userId: adminId,
            shortDescription: description,
            categoryId: subcat.categoryId,
            subcategoryId: subcat.id,
            images,
            status: "active",
            createdAt: getRandomDate(),
            updatedAt: getRandomDate(),
          } as const
        }),
      )
    }),
  )

  return data.flat()
}

async function seedProducts(tx: TX) {
  const prodData = await productsData()
  await tx.insert(products).values(prodData)
  return prodData
}

const hashedPassword =
  "$argon2id$v=19$m=19456,t=2,p=1$BoYTcQ59BlCys117eUfFag$wTYm8NHRdNKmtvMaoGFAdaJfxkgta4CCuSEx9lY2yh8"

const usersData: (typeof users.$inferInsert)[] = Array.from({
  length: 20,
}).map((_, index) => ({
  id: createId(),
  name: "User " + (index + 1),
  email: `user${index + 1}@gmail.com`,
  role: index + 1 >= 10 ? "moderator" : "customer",
  hashedPassword,
  emailVerified: new Date(),
  createdAt: getRandomDate(),
  updatedAt: getRandomDate(),
}))

async function seedUsers(tx: TX) {
  await tx.insert(users).values(usersData)
}

async function seedReviews(
  tx: TX,
  prodData: Awaited<ReturnType<typeof productsData>>,
) {
  const productsAndUsers = usersData.flatMap((user) =>
    prodData.map((product) => ({
      product,
      user,
    })),
  )

  const uniqueProductsAndUsers: typeof productsAndUsers = Array.from(
    new Set(
      productsAndUsers.map((item) =>
        JSON.stringify({ user: item.user, product: item.product }),
      ),
    ).values(),
  ).map((item) => JSON.parse(item))

  const ratingDescriptions: Record<number, string> = {
    1: "Terrible experience. The product was defective, and the customer service was unresponsive. I wouldn't recommend this to anyone.",
    2: "Poor experience. The product did not meet expectations and had several issues. The service was lacking, and I am generally dissatisfied.",
    3: "Average experience. The product was okay, but it had some noticeable flaws. Customer service was average, and while it wasn't bad, it didn't stand out either.",
    4: "Good experience. The product worked well and met most of my expectations. The service was helpful and efficient, though there were minor issues.",
    5: "Excellent experience. The product exceeded expectations, and the customer service was outstanding. Everything was perfect, and I would highly recommend this to others.",
  }

  function getRatingAndDescription(): { rating: number; description: string } {
    const rating = Math.floor(Math.random() * 5) + 1
    const description = ratingDescriptions[rating]
    return { rating, description }
  }

  const reviewsData = uniqueProductsAndUsers.map(({ user, product }) => {
    const { rating, description } = getRatingAndDescription()
    return {
      rating,
      description,
      userId: user.id,
      productId: product.id,
      createdAt: getRandomDate(),
      updatedAt: getRandomDate(),
    }
  })

  await tx.insert(reviews).values(reviewsData)
  const p = await tx.select({ id: products.id }).from(products)

  for (const product of p) {
    const [avgRating] = await tx
      .select({ averageRating: avg(reviews.rating) })
      .from(reviews)
      .where(eq(reviews.productId, product.id))

    const newRating = parseFloat(avgRating?.averageRating ?? "0").toFixed(1)

    await tx
      .update(products)
      .set({ rating: parseFloat(newRating) })
      .where(eq(products.id, product.id))
  }
}

// ;(async function () {
//   await db.transaction(async (tx) => {
//     console.log("SEEDING CATEGORIES")
//     await seedCategories(tx)
//     console.log("SEEDING USERS")
//     await seedUsers(tx)
//     console.log("SEEDING PRODUCTS")
//     const seededProducts = await seedProducts(tx)
//     console.log("SEEDING REVIEWS")
//     await seedReviews(tx, seededProducts)
//   })
// })()
//   .catch(console.error)
//   .finally(() => process.exit(1))

function getRandomDate(): Date {
  const startDate = new Date("2024-01-01").getTime()
  const endDate = new Date().getTime()

  const randomTime =
    Math.floor(Math.random() * (endDate - startDate + 1)) + startDate

  return new Date(randomTime)
}
