import queryString from "query-string"
import { useState, useCallback, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"

export function useSearchProducts() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const query = searchParams.get("query") || ""

  const [inputValue, setInputValue] = useState(query)

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(event.target.value)
    },
    [],
  )

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()

      if ((!inputValue && !query) || inputValue === query) return

      const url = queryString.stringifyUrl(
        {
          url: "/search",
          query: {
            query: inputValue,
          },
        },
        {
          skipEmptyString: true,
          skipNull: true,
        },
      )

      router.push(url)
    },
    [inputValue, router, query],
  )

  useEffect(() => {
    setInputValue(query)
  }, [query])

  return { inputValue, handleInputChange, handleSubmit }
}
