"use client"

import dynamic from "next/dynamic"
import { useEffect, useMemo, useRef, useState } from "react"

import { cn } from "@/utils"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type ProductDescriptionProps = {
  description: unknown | null
}

export function ProductDescription({ description }: ProductDescriptionProps) {
  const Editor = useMemo(
    () =>
      dynamic(() => import("@/components/editor"), {
        ssr: false,
        loading: () => (
          <div className="flex h-[94vh] w-full flex-col items-center justify-center gap-y-1">
            <Spinner />
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        ),
      }),
    [],
  )

  const [expanded, setExpanded] = useState(false)
  const [isOverflowing, setIsOverflowing] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const content = contentRef.current
    if (!content) return

    function checkOverflow() {
      if (!content) return
      const viewportHeight = window.innerHeight
      const maxHeight = viewportHeight * 0.94 // 94vh
      setIsOverflowing(content?.scrollHeight > maxHeight)
    }

    checkOverflow()

    const resizeObserver = new ResizeObserver(checkOverflow)
    resizeObserver.observe(content)

    window.addEventListener("resize", checkOverflow)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener("resize", checkOverflow)
    }
  }, [description])

  if (!description) {
    return null
  }

  return (
    <Card>
      <CardHeader className="pb-0">
        <CardTitle>Product Description</CardTitle>
      </CardHeader>
      <CardContent className="relative w-full p-0">
        <div
          ref={contentRef}
          className={cn(
            "overflow-hidden transition-all duration-300",
            expanded ? "max-h-none" : "max-h-[94vh]",
          )}
        >
          <Editor editable={false} initialValue={description} />
        </div>
        {isOverflowing && !expanded && (
          <div className="absolute inset-x-0 bottom-0 h-64 rounded-b-md bg-gradient-to-t from-background to-transparent" />
        )}
        {isOverflowing && (
          <Button
            variant="outline"
            className="absolute inset-x-1/2 bottom-4 w-fit -translate-x-1/2"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? "View Less" : "View More"}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
