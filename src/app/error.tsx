"use client"

import { RotateCcw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useEffect } from "react"

type ErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 p-4">
      <h1 className="text-6xl font-extrabold text-destructive sm:text-7xl">
        500
      </h1>
      <h2 className="text-xl font-semibold sm:text-2xl">
        Something&apos;s terribly wrong.
      </h2>

      <Button onClick={() => reset()} className="group" variant={"outline"}>
        <RotateCcw className="mr-2 size-4 transition group-hover:rotate-45" />{" "}
        Try again
      </Button>
    </div>
  )
}
