import type * as React from "react"
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import isEqualWith from "lodash.isequalwith"
import { isAfter, isBefore, isValid, parseISO } from "date-fns"

import { Duration, ProductImage } from "./types"
import type {
  Order,
  ProductVariantValue,
  Variant,
  VariantValue,
} from "@/db/schema"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isEmptyOrUndefinedObj(obj: any): boolean {
  if (typeof obj !== "object" || !obj) return false
  return Object.values(obj).every((value) => value === undefined)
}

export function isEqual(obj1: any, obj2: any) {
  return isEqualWith(obj1, obj2, (val1, val2) => {
    if (isEmptyOrUndefinedObj(val1) && isEmptyOrUndefinedObj(val2)) {
      return true
    } else {
      return undefined
    }
  })
}

export function preprocessStringToNumber(val: any): number | undefined {
  if (val === undefined || val === null || val === "") {
    return undefined
  }

  const parsedValue = Number(val)

  if (isNaN(parsedValue)) {
    return undefined
  }

  return parsedValue
}

export function parseSaleDuration(duration?: Duration | null) {
  if (!duration) return undefined

  return {
    from: duration.from ? new Date(duration.from) : undefined,
    to: duration.to ? new Date(duration.to) : undefined,
  }
}

export function isColor(name?: string) {
  if (!name) return false
  if (name.toLowerCase() === "color" || name.toLowerCase() === "colour") {
    return true
  }

  return false
}

export function isValueColor(value: string) {
  const colorCodeRegex = /^#?([0-9A-Fa-f]{3}){1,2}$/
  return colorCodeRegex.test(value)
}

export function isWhiteOrBlack(hex: string) {
  const isColor = isValueColor(hex)

  if (!isColor) {
    return { isWhite: false, isBlack: false }
  }

  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)

  const brightness = (r * 299 + g * 587 + b * 114) / 1000

  const isWhite = brightness > 200
  const isBlack = brightness < 100

  return { isWhite, isBlack }
}

export function formatBytes(
  bytes: number,
  opts: {
    decimals?: number
    sizeType?: "accurate" | "normal"
  } = {},
) {
  const { decimals = 0, sizeType = "normal" } = opts

  const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
  const accurateSizes = ["Bytes", "KiB", "MiB", "GiB", "TiB"]
  if (bytes === 0) return "0 Byte"
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(decimals)} ${
    sizeType === "accurate"
      ? (accurateSizes[i] ?? "Bytest")
      : (sizes[i] ?? "Bytes")
  }`
}

export function getImageDimensions(
  file: File,
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      const image = new Image()
      image.src = event.target?.result as string

      image.onload = () => {
        const width = image.width
        const height = image.height
        resolve({ width, height })
      }

      image.onerror = (error) => {
        reject(error)
      }
    }

    reader.onerror = (error) => {
      reject(error)
    }

    reader.readAsDataURL(file)
  })
}

type GroupedRecord<T, K extends keyof T> = Record<string, NonNullable<T[K]>[]>

export function groupByAndCollect<T, K extends keyof T, C extends keyof T>(
  array: T[],
  groupByKey: K,
  collectKey: C,
): GroupedRecord<T, C> {
  return array.reduce(
    (acc, item) => {
      const key = String(item[groupByKey])
      const value = item[collectKey]

      if (!acc[key]) {
        acc[key] = []
      }

      if (Array.isArray(value)) {
        const filteredValues = value.filter(
          (v) => v !== null && v !== undefined,
        ) as NonNullable<T[C]>[]

        if (filteredValues.length > 0) {
          acc[key].push(...filteredValues)
        } else {
          delete acc[key]
        }
      } else if (value !== null && value !== undefined) {
        acc[key].push(value as NonNullable<T[C]>)
      }

      return acc
    },
    {} as GroupedRecord<T, C>,
  )
}

export function mergeRefs<T = any>(
  refs: Array<
    React.MutableRefObject<T> | React.LegacyRef<T> | undefined | null
  >,
): React.RefCallback<T> {
  return (value) => {
    refs.forEach((ref) => {
      if (typeof ref === "function") {
        ref(value)
      } else if (ref != null) {
        ;(ref as React.MutableRefObject<T | null>).current = value
      }
    })
  }
}

export function getProductPrice(
  price: number,
  salePrice: number | null,
  saleDuration?: Duration | null,
) {
  const now = new Date()

  if (!salePrice || salePrice >= price) {
    return { isSaleActive: false, price }
  }

  const parseDate = (date: string | Date | null | undefined): Date | null => {
    if (!date) return null
    if (date instanceof Date) return isValid(date) ? date : null
    const parsed = parseISO(date)
    return isValid(parsed) ? parsed : null
  }

  const fromDate = parseDate(saleDuration?.from)
  const toDate = parseDate(saleDuration?.to)

  if (fromDate && toDate) {
    if (isAfter(now, fromDate) && isBefore(now, toDate)) {
      return { isSaleActive: true, price: salePrice }
    }
  } else if (fromDate) {
    if (isAfter(now, fromDate)) {
      return { isSaleActive: true, price: salePrice }
    }
  } else if (toDate) {
    if (isBefore(now, toDate)) {
      return { isSaleActive: true, price: salePrice }
    }
  } else {
    return { isSaleActive: true, price: salePrice }
  }

  return { isSaleActive: false, price }
}

export function formatPrice(price: number) {
  const options: Intl.NumberFormatOptions = {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: price % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }

  const formatted = new Intl.NumberFormat("en-US", options).format(price)
  return formatted
}

export function organizeByVariants(
  data:
    | (ProductVariantValue & {
        variant: Variant
        variantValue: VariantValue
      })[]
    | null,
) {
  if (!data) return null

  const organized: {
    [key: string]: Variant & {
      variantValues: (VariantValue & { images: ProductImage[] | null })[]
    }
  } = {}

  data.forEach((item) => {
    const { variantId, variantValue, variant } = item

    if (!organized[variantId]) {
      organized[variantId] = {
        ...variant,
        variantValues: [],
      }
    }

    organized[variantId].variantValues.push({
      ...variantValue,
      images: item.images,
    })
  })

  return Object.values(organized)
}

export function getOrderDate(order: Order) {
  switch (order.status) {
    case "dispatched":
      return order?.dispatchedAt
    case "shipped":
      return order?.shippedAt
    case "delivered":
      return order?.deliveredAt
    case "cancelled":
      return order?.cancelledAt
    default:
      return null
  }
}
