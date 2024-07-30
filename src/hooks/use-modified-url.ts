import queryString from "query-string"
import { usePathname, useSearchParams } from "next/navigation"

export function useModifiedUrl() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const modifyUrl = (
    paramsToModify: Record<string, string | number | null | undefined>,
  ) => {
    const currentParams = queryString.parse(searchParams.toString())

    const filteredParams = Object.entries(paramsToModify).reduce(
      (acc, [key, value]) => {
        if (typeof value === "number" && isNaN(value)) {
          acc[key] = null
        } else {
          acc[key] = value
        }

        return acc
      },
      {} as Record<string, string | number | null | undefined>,
    )

    const url = queryString.stringifyUrl(
      {
        url: pathname,
        query: { ...currentParams, ...filteredParams },
      },
      {
        skipNull: true,
        skipEmptyString: true,
      },
    )

    return url
  }

  return { modifyUrl }
}
