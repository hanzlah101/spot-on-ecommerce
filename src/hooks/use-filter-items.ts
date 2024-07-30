import { useMemo } from "react"

interface FilterConfig<T> {
  keys: (keyof T | string)[]
  query: any | any[]
}

const getKey = (obj: any, keys: string[]): any => {
  return keys.reduce(
    (o, key) => (o && typeof o === "object" ? o[key] : undefined),
    obj,
  )
}

export function useFilterItems<T>(data: T[], filters: FilterConfig<T>[]): T[] {
  return useMemo(() => {
    return data.filter((item) =>
      filters.every((filter) => {
        const { keys, query } = filter

        if (query == null || (Array.isArray(query) && query.length === 0))
          return true

        const compare = (itemValue: any, queryValue: any) => {
          if (typeof itemValue === "string" && typeof queryValue === "string") {
            itemValue = itemValue.toLowerCase()
            queryValue = queryValue.toLowerCase()
          }

          if (typeof itemValue === "object" && typeof queryValue === "object") {
            for (const nestedKey in queryValue) {
              if (
                !compare(
                  getKey(itemValue, nestedKey.split(".")),
                  queryValue[nestedKey],
                )
              ) {
                return false
              }
            }
            return true
          }

          return typeof itemValue === "string" && itemValue.includes(queryValue)
        }

        return keys.some((key) => {
          const itemValue = getKey(item, String(key).split("."))
          if (Array.isArray(query)) {
            return query.some((q) => compare(itemValue, q))
          } else {
            return compare(itemValue, query)
          }
        })
      }),
    )
  }, [data, filters])
}
