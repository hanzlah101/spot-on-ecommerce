"use client"

import { useCallback } from "react"
import { CircleX } from "lucide-react"
import { useRouter } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import { useModifiedUrl } from "@/hooks/use-modified-url"

type FilterPillProps = {
  value: string
  label: string
  paramKey: string
}

export function FilterPill({ label, value, paramKey }: FilterPillProps) {
  const router = useRouter()
  const { modifyUrl } = useModifiedUrl()

  const handleRemove = useCallback(() => {
    const url = modifyUrl({ [paramKey]: null })
    router.push(url)
  }, [router, modifyUrl, paramKey])

  return (
    <Badge
      variant={"secondary"}
      onClick={handleRemove}
      className="flex w-fit cursor-pointer items-center"
    >
      <span>
        {label}: {value}
      </span>

      <CircleX className="ml-2 size-4 shrink-0 cursor-pointer" />
    </Badge>
  )
}
