import { useState, useCallback } from "react"

interface UseCopyResult {
  copied: boolean
  copy: (_text: string) => Promise<void>
}

export function useCopy(resetInterval = 2000): UseCopyResult {
  const [copied, setCopied] = useState<boolean>(false)

  const copy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), resetInterval)
      } catch (err) {
        console.error("Failed to copy text: ", err)
      }
    },
    [resetInterval],
  )

  return { copied, copy }
}
