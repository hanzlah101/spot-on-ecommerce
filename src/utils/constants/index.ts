export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

export const SESSION_COOKIE_NAME = "backup-auth.session-token"
export const GOOGLE_STATE_COOKIE = "backup-auth.google-state"
export const GOOGLE_CODE_VERIFIER_COOKIE = "backup-auth.google-code-verifier"

export const LIBRARY_IMAGES_LIMIT = 10

export const REDIRECTS = {
  toLogin: "/sign-in",
  toVerify: "/verify-email",
  afterLogin: "/",
  afterAdminLogin: "/dashboard",
} as const

export const DEFAULT_SHIPPING_PRICE = 200
export const DEFAULT_DELIVERY_TIME = new Date(
  Date.now() + 5 * 24 * 60 * 60 * 1000,
)

export const STATES = [
  "Punjab",
  "Sindh",
  "Khyber Pakhtunkhwa",
  "Balochistan",
  "Islamabad Capital Territory",
  "Gilgit Baltistan",
  "Azad Kashmir",
] as const

export const PRODUCT_REVIEWS_LIMIT = 4
