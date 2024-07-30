import { relations, sql } from "drizzle-orm"
import { createId } from "@paralleldrive/cuid2"
import {
  index,
  integer,
  json,
  pgEnum,
  pgTable,
  primaryKey,
  real,
  text,
  timestamp,
  uniqueIndex,
  vector,
} from "drizzle-orm/pg-core"

import type { Duration, ProductImage, DbImage } from "@/utils/types"

const lifecycleDates = {
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .default(sql`current_timestamp`)
    .$onUpdate(() => new Date()),
}

export const userRoleEnum = pgEnum("user_role", [
  "customer",
  "admin",
  "moderator",
])

export const users = pgTable(
  "users",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    emailVerified: timestamp("email_verified"),
    image: text("image"),
    hashedPassword: text("hashed_password"),
    role: userRoleEnum("role").notNull().default("customer"),
    ...lifecycleDates,
  },
  (table) => ({
    emailIdx: uniqueIndex("email_idx").on(table.email),
  }),
)

export const userRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  accounts: many(oAuthAccounts),
  verificationTokens: many(verificationTokens),
  products: many(products),
  orders: many(orders),
  reviews: many(reviews),
  favouriteProducts: many(favouriteProducts),
}))

export type User = typeof users.$inferSelect

export const oAuthAccounts = pgTable(
  "oauth_accounts",
  {
    provider: text("provider").$type<"google" | "facebook">().notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    accessToken: text("access_token").notNull(),
    refreshToken: text("refresh_token"),
    expiresAt: timestamp("expires_at"),
    ...lifecycleDates,
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => ({
    pk: primaryKey({
      columns: [table.provider, table.providerAccountId],
    }),
  }),
)

export const oAuthAccountRelations = relations(oAuthAccounts, ({ one }) => ({
  user: one(users, {
    fields: [oAuthAccounts.userId],
    references: [users.id],
  }),
}))

export type OAuthAccount = typeof oAuthAccounts.$inferSelect

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  ...lifecycleDates,
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
})

export const sessionRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}))

export type Session = typeof sessions.$inferSelect

export const verificationTokenTypeEnum = pgEnum("verification_token_type", [
  "verify email",
  "reset password",
])

export const verificationTokens = pgTable("verification_tokens", {
  id: text("id").primaryKey().$defaultFn(createId),
  token: text("token").notNull(),
  type: verificationTokenTypeEnum("type").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  ...lifecycleDates,
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
})

export const verificationTokenRelations = relations(
  verificationTokens,
  ({ one }) => ({
    user: one(users, {
      fields: [verificationTokens.userId],
      references: [users.id],
    }),
  }),
)

export type VerificationToken = typeof verificationTokens.$inferSelect

export const productTypeEnum = pgEnum("product_type", ["simple", "variable"])

export const productStatusEnum = pgEnum("product_status", [
  "draft",
  "archived",
  "active",
])

export const productLabelEnum = pgEnum("product_label", [
  "featured",
  "new arrival",
  "none",
])

export const products = pgTable(
  "products",
  {
    id: text("id").primaryKey().$defaultFn(createId),
    title: text("title").notNull(),
    type: productTypeEnum("product_type").notNull().default("simple"),
    shortDescription: text("short_description").notNull(),
    longDescription: json("long_description"),
    price: real("price"),
    stock: integer("stock"),
    salePrice: real("sale_price"),
    saleDuration: json("sale_duration").$type<Duration>(),
    rating: real("rating").notNull().default(0),
    status: productStatusEnum("product_status").notNull().default("draft"),
    label: productLabelEnum("product_label").notNull().default("none"),
    tags: text("tags")
      .array()
      .notNull()
      .default(sql`ARRAY[]::text[]`),
    images: json("images")
      .array()
      .$type<ProductImage[]>()
      .notNull()
      .default(sql`'{}'::json[]`),
    embedding: vector("embedding", { dimensions: 768 }).notNull(),
    ...lifecycleDates,
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "no action" }),
    categoryId: text("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
    subcategoryId: text("subcategory_id")
      .notNull()
      .references(() => subcategories.id, { onDelete: "restrict" }),
  },
  (table) => ({
    categoryIdIdx: index("products_category_id_idx").on(table.categoryId),
    subcategoryIdIdx: index("products_subcategory_id_idx").on(
      table.subcategoryId,
    ),
    embeddingIdx: index("products_embedding_idx").using(
      "hnsw",
      table.embedding.op("vector_cosine_ops"),
    ),
  }),
)

export const productRelations = relations(products, ({ one, many }) => ({
  user: one(users, {
    fields: [products.userId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  subcategory: one(subcategories, {
    fields: [products.subcategoryId],
    references: [subcategories.id],
  }),
  productVariants: many(productVariants),
  productVariantValues: many(productVariantValues),
  productVariantCombinations: many(productVariantCombinations),
  combinationVariantValues: many(combinationVariantValues),
  orderItems: many(orderItems),
  reviews: many(reviews),
  favouriteProducts: many(favouriteProducts),
}))

export type Product = typeof products.$inferSelect

export const favouriteProducts = pgTable(
  "favourite_products",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
  },
  (table) => ({
    pk: primaryKey({
      columns: [table.userId, table.productId],
    }),
  }),
)

export const favouriteProductRelations = relations(
  favouriteProducts,
  ({ one }) => ({
    user: one(users, {
      fields: [favouriteProducts.userId],
      references: [users.id],
    }),
    product: one(products, {
      fields: [favouriteProducts.productId],
      references: [products.id],
    }),
  }),
)

export type FavouriteProduct = typeof favouriteProducts.$inferSelect

export const categories = pgTable(
  "categories",
  {
    id: text("id").primaryKey().$defaultFn(createId),
    name: text("name").notNull(),
    description: text("description").notNull(),
    ...lifecycleDates,
  },
  (table) => ({
    nameIdx: uniqueIndex("name_idx").on(table.name),
  }),
)

export const categoryRelations = relations(categories, ({ many }) => ({
  products: many(products),
  subcategories: many(subcategories),
}))

export type Category = typeof categories.$inferSelect

export const subcategories = pgTable(
  "subcategories",
  {
    id: text("id").primaryKey().$defaultFn(createId),
    name: text("name").notNull(),
    description: text("description").notNull(),
    ...lifecycleDates,
    categoryId: text("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
  },
  (table) => ({
    nameCategoryIdIdx: uniqueIndex("name_category_id_idx").on(
      table.categoryId,
      table.name,
    ),
  }),
)

export const subcategoryRelations = relations(
  subcategories,
  ({ one, many }) => ({
    products: many(products),
    category: one(categories, {
      fields: [subcategories.categoryId],
      references: [categories.id],
    }),
  }),
)

export type Subcategory = typeof subcategories.$inferSelect

export const variants = pgTable(
  "variants",
  {
    id: text("id").primaryKey().$defaultFn(createId),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    guideImage: json("guide_image").$type<DbImage>(),
    ...lifecycleDates,
  },
  (table) => ({
    variantSlugIdx: uniqueIndex("variant_slug_idx").on(table.slug),
  }),
)

export const variantRelations = relations(variants, ({ many }) => ({
  variantValues: many(variantValues),
  productVariants: many(productVariants),
  productVariantValues: many(productVariantValues),
  combinationVariantValues: many(combinationVariantValues),
}))

export type Variant = typeof variants.$inferSelect

export const productVariants = pgTable(
  "product_variants",
  {
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    variantId: text("variant_id")
      .notNull()
      .references(() => variants.id, { onDelete: "restrict" }),
  },
  (table) => ({
    pk: primaryKey({
      columns: [table.productId, table.variantId],
    }),
  }),
)

export const productVariantRelations = relations(
  productVariants,
  ({ one }) => ({
    product: one(products, {
      fields: [productVariants.productId],
      references: [products.id],
    }),
    variant: one(variants, {
      fields: [productVariants.variantId],
      references: [variants.id],
    }),
  }),
)

export type ProductVariant = typeof productVariants.$inferSelect

export const variantValues = pgTable(
  "variant_values",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    value: text("value").notNull(),
    variantId: text("variant_id")
      .notNull()
      .references(() => variants.id, { onDelete: "cascade" }),
  },
  (table) => ({
    valueNameIdx: uniqueIndex("variant_values_variant_id_name_idx").on(
      table.value,
      table.variantId,
    ),
  }),
)

export const variantValuesRelations = relations(
  variantValues,
  ({ one, many }) => ({
    variant: one(variants, {
      fields: [variantValues.variantId],
      references: [variants.id],
    }),
    productsVariantValues: many(productVariantValues),
    combinationVariantValues: many(combinationVariantValues),
  }),
)

export type VariantValue = typeof variantValues.$inferSelect

export const productVariantValues = pgTable(
  "product_variant_values",
  {
    images: json("images")
      .array()
      .$type<ProductImage[]>()
      .default(sql`'{}'::json[]`),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    variantValueId: text("variant_value_id")
      .notNull()
      .references(() => variantValues.id, { onDelete: "cascade" }),
    variantId: text("variant_id")
      .notNull()
      .references(() => variants.id, { onDelete: "cascade" }),
  },
  (table) => ({
    pk: primaryKey({
      columns: [table.productId, table.variantValueId],
    }),
  }),
)

export const productVariantValueRelations = relations(
  productVariantValues,
  ({ one }) => ({
    product: one(products, {
      fields: [productVariantValues.productId],
      references: [products.id],
    }),
    variantValue: one(variantValues, {
      fields: [productVariantValues.variantValueId],
      references: [variantValues.id],
    }),
    variant: one(variants, {
      fields: [productVariantValues.variantId],
      references: [variants.id],
    }),
  }),
)

export type ProductVariantValue = typeof productVariantValues.$inferSelect

export const productVariantCombinations = pgTable(
  "product_variant_combinations",
  {
    id: text("id").primaryKey().$defaultFn(createId),
    price: real("price").notNull(),
    stock: integer("stock").notNull().default(0),
    salePrice: real("sale_price"),
    saleDuration: json("sale_duration").$type<Duration>(),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
  },
  (table) => ({
    productIdIdx: index("combinations_product_id_idx").on(table.productId),
  }),
)

export const productCombinationRelations = relations(
  productVariantCombinations,
  ({ one, many }) => ({
    product: one(products, {
      fields: [productVariantCombinations.productId],
      references: [products.id],
    }),
    combinationVariantValues: many(combinationVariantValues),
  }),
)

export type ProductVariantCombinations =
  typeof productVariantCombinations.$inferSelect

export const combinationVariantValues = pgTable(
  "combination_variant_values",
  {
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    combinationId: text("combination_id")
      .notNull()
      .references(() => productVariantCombinations.id, { onDelete: "cascade" }),
    variantValueId: text("variant_value_id")
      .notNull()
      .references(() => variantValues.id, { onDelete: "cascade" }),
    variantId: text("variant_id")
      .notNull()
      .references(() => variants.id, { onDelete: "cascade" }),
  },
  (table) => ({
    pk: primaryKey({
      columns: [table.combinationId, table.variantValueId],
      name: "combination_variant_value_pk",
    }),
    variantValueCombinationIdx: uniqueIndex("combination_variant_value_idx").on(
      table.variantValueId,
      table.combinationId,
    ),
  }),
)

export const combinationVariantValuesRelations = relations(
  combinationVariantValues,
  ({ one }) => ({
    product: one(products, {
      fields: [combinationVariantValues.productId],
      references: [products.id],
    }),
    combination: one(productVariantCombinations, {
      fields: [combinationVariantValues.combinationId],
      references: [productVariantCombinations.id],
    }),
    variantValue: one(variantValues, {
      fields: [combinationVariantValues.variantValueId],
      references: [variantValues.id],
    }),
    variant: one(variants, {
      fields: [combinationVariantValues.variantId],
      references: [variants.id],
    }),
  }),
)

export type CombinationVariantValues =
  typeof combinationVariantValues.$inferSelect

export const galleryImages = pgTable("gallery_images", {
  id: text("id").primaryKey().$defaultFn(createId),
  key: text("key").notNull(),
  url: text("url").notNull(),
  name: text("name").notNull(),
  ...lifecycleDates,
})

export type GalleryImage = typeof galleryImages.$inferSelect

export const orderStatusEnum = pgEnum("order_status", [
  "processing",
  "dispatched",
  "shipped",
  "delivered",
  "on hold",
  "cancelled",
])

export const orderPaymentStatusEnum = pgEnum("order_payment_status", [
  "paid",
  "unpaid",
  "refunded",
])

export const orderPaymentMethodsEnum = pgEnum("order_payment_method", [
  "cash on delivery",
  "credit card",
])

export const orders = pgTable(
  "orders",
  {
    id: text("id").primaryKey(),
    trackingId: text("tracking_id").notNull(),
    email: text("email").notNull(),
    phoneNumber: text("phone_number").notNull(),
    customerName: text("customer_name").notNull(),
    discount: real("discount"),
    subtotal: real("subtotal").notNull(),
    shippingFee: real("shipping_fee").notNull(),
    taxes: real("taxes").notNull().default(0),
    city: text("city").notNull(),
    state: text("state").notNull(),
    streetAddress: text("street_address").notNull(),
    estDeliveryDate: timestamp("estimated_delivery_date").notNull(),
    dispatchedAt: timestamp("dispatched_at"),
    shippedAt: timestamp("shipped_at"),
    deliveredAt: timestamp("deliveredA_at"),
    cancelledAt: timestamp("cancelled_at"),
    status: orderStatusEnum("order_status").notNull().default("processing"),
    paymentStatus: orderPaymentStatusEnum("payment_status")
      .notNull()
      .default("unpaid"),
    paymentMethod: orderPaymentMethodsEnum("payment_method")
      .notNull()
      .default("cash on delivery"),
    userId: text("user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    ...lifecycleDates,
  },
  (table) => ({
    trackingIdIdx: uniqueIndex("order_tracking_id_idx").on(table.trackingId),
    emailIdx: index("order_email_idx").on(table.email),
    phoneNumberIdx: index("order_phone_idx").on(table.phoneNumber),
  }),
)

export const orderRelations = relations(orders, ({ one, many }) => ({
  orderItems: many(orderItems),
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
}))

export type Order = typeof orders.$inferSelect

export const orderItems = pgTable("order_items", {
  id: text("id").primaryKey().$defaultFn(createId),
  // Fallback data if product doesn't exist
  title: text("title").notNull(),
  imageUrl: text("image_url").notNull(),
  price: real("price").notNull(),
  quantity: integer("quantity").notNull().default(1),
  combinations: text("combinations")
    .array()
    .default(sql`ARRAY[]::text[]`),
  ...lifecycleDates,
  productId: text("product_id").references(() => products.id, {
    onDelete: "set null",
  }),
  orderId: text("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
})

export const orderItemRelations = relations(orderItems, ({ one }) => ({
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
}))

export type OrderItem = typeof orderItems.$inferSelect

export const couponCodeAmountTypeEnum = pgEnum("coupon_code_amount_type", [
  "percentage",
  "fixed amount",
])

export const couponCodes = pgTable(
  "coupon_codes",
  {
    id: text("id").primaryKey().$defaultFn(createId),
    code: text("code").notNull(),
    amount: real("amount").notNull(),
    amountType: couponCodeAmountTypeEnum("amount_type")
      .notNull()
      .default("percentage"),
    minOrderAmount: real("min_order_amount").notNull(),
    usageLimit: integer("usage_limit"),
    validityDuration: json("validity_duration").$type<Duration>(),
    ...lifecycleDates,
  },
  (table) => ({
    couponCodeIdx: uniqueIndex("coupon_code_idx").on(table.code),
  }),
)

export type CouponCode = typeof couponCodes.$inferSelect

export const reviews = pgTable(
  "reviews",
  {
    id: text("id").primaryKey().$defaultFn(createId),
    rating: integer("rating").notNull(),
    description: text("description").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    ...lifecycleDates,
  },
  (table) => ({
    productUserIdx: uniqueIndex("product_id_user_id_idx").on(
      table.userId,
      table.productId,
    ),
    productIdx: index("product_id").on(table.productId),
  }),
)

export const reviewRelations = relations(reviews, ({ one }) => ({
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [reviews.productId],
    references: [products.id],
  }),
}))

export type Review = typeof reviews.$inferSelect
