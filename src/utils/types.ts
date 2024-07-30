import type { SQL } from "drizzle-orm"

import type { getProductById } from "@/queries/product"

export type Duration = {
  from?: Date
  to?: Date
}

export type DbImage = {
  id: string
  url: string
  name: string
}

export type ProductImage = DbImage & {
  order: number
}

export type PreviewProduct = Exclude<
  Awaited<ReturnType<typeof getProductById>>,
  null
>["product"]

export type CartItem = {
  productId: string
  combinationId?: string
  quantity: number
  isSelected: boolean
}

export interface SearchParams {
  [key: string]: string | string[] | undefined
}

export interface Option {
  label: string
  value: string
  icon?: React.ComponentType<{ className?: string }>
  withCount?: boolean
}

export interface DataTableFilterField<TData> {
  label: string
  value: keyof TData
  placeholder?: string
  options?: Option[]
}

export interface DataTableFilterOption<TData> {
  id: string
  label: string
  value: keyof TData
  options: Option[]
  filterValues?: string[]
  filterOperator?: string
  isMulti?: boolean
}

export type DrizzleWhere<T> =
  | SQL<unknown>
  | ((_aliases: T) => SQL<T> | undefined)
  | undefined
