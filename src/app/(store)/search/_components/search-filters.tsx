"use client"

import { useCallback, useEffect, useState } from "react"
import { Check, Filter } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

import { cn } from "@/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { useIsClient } from "@/hooks/use-is-client"
import { useMediaQuery } from "@/hooks/use-media-query"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useModifiedUrl } from "@/hooks/use-modified-url"
import { RatingStarsPreview } from "../../_components/rating-stars-preview"
import { FilterPill } from "./filter-pill"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import {
  Sheet,
  SheetBody,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

export function SearchFilters() {
  const [open, setOpen] = useState(false)

  const isMobile = useMediaQuery("(max-width: 768px)")
  const isClient = useIsClient()
  const searchParams = useSearchParams()
  const minPrice = searchParams.get("minPrice")
  const maxPrice = searchParams.get("maxPrice")
  const rating = searchParams.get("rating")

  useEffect(() => {
    setOpen(false)
  }, [minPrice, maxPrice, rating])

  if (!isClient) {
    return (
      <>
        <Skeleton className="hidden h-[500px] w-full md:block" />
        <Skeleton className="h-10 w-24 md:hidden" />
      </>
    )
  }

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger>
          <Button size="sm" variant={"outline"} className="md:hidden">
            <Filter className="mr-2 size-4" />
            Filters
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
          </SheetHeader>
          <SheetBody>
            <Filters />
          </SheetBody>
          <SheetFooter className="mt-auto w-full">
            <SheetClose asChild>
              <Button size="sm">Close</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <div className="w-full space-y-2">
      <h1 className="text-lg font-semibold">Filters</h1>
      <Filters />
    </div>
  )
}

function Filters() {
  const searchParams = useSearchParams()
  const paramsMinPrice = searchParams.get("minPrice")
  const paramsMaxPrice = searchParams.get("maxPrice")
  const paramsRating = searchParams.get("rating")

  const numberMinPrice = paramsMinPrice ? Number(paramsMinPrice) : undefined
  const numberMaxPrice = paramsMaxPrice ? Number(paramsMaxPrice) : undefined

  const numberRating = paramsRating ? Number(paramsRating) : undefined

  const [minPrice, setMinPrice] = useState(numberMinPrice)
  const [maxPrice, setMaxPrice] = useState(numberMaxPrice)

  const router = useRouter()
  const { modifyUrl } = useModifiedUrl()

  const applyPriceFilter = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      const url = modifyUrl({ minPrice, maxPrice })
      router.push(url)
    },
    [modifyUrl, minPrice, maxPrice, router],
  )

  const applyRatingFilter = useCallback(
    (rating: number) => {
      if (numberRating && numberRating === rating) {
        const url = modifyUrl({ rating: null })
        router.push(url)
      } else {
        const url = modifyUrl({ rating })
        router.push(url)
      }
    },
    [modifyUrl, router, numberRating],
  )

  useEffect(() => {
    setMinPrice(numberMinPrice)
    setMaxPrice(numberMaxPrice)
  }, [numberMinPrice, numberMaxPrice])

  return (
    <Accordion
      type="multiple"
      defaultValue={["price", "rating"]}
      className="w-full"
    >
      <AccordionItem value="price">
        <AccordionTrigger>Price</AccordionTrigger>
        <AccordionContent className="w-full space-y-2 px-2">
          <div className="flex flex-wrap items-center gap-2">
            {paramsMinPrice && (
              <FilterPill
                label="Min price"
                paramKey={"minPrice"}
                value={paramsMinPrice}
              />
            )}
            {paramsMaxPrice && (
              <FilterPill
                label="Max price"
                paramKey={"maxPrice"}
                value={paramsMaxPrice}
              />
            )}
          </div>
          <form
            onSubmit={applyPriceFilter}
            className="flex items-center gap-x-2"
          >
            <div className="grid w-full grid-cols-2 gap-2">
              <Input
                type="number"
                placeholder="Low"
                value={minPrice ?? ""}
                onChange={(e) => setMinPrice(e.target.valueAsNumber)}
              />
              <Input
                type="number"
                placeholder="High"
                value={maxPrice ?? ""}
                onChange={(e) => setMaxPrice(e.target.valueAsNumber)}
              />
            </div>
            <Tooltip delayDuration={100}>
              <TooltipTrigger asChild>
                <Button
                  type="submit"
                  size="icon"
                  className="shrink-0"
                  aria-label="Applay"
                >
                  <Check className="size-[18px]" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">Apply</TooltipContent>
            </Tooltip>
          </form>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="rating">
        <AccordionTrigger>Rating</AccordionTrigger>
        <AccordionContent className="space-y-0.5">
          {[5, 4, 3, 2, 1].map((rating) => {
            const isSelected = numberRating === rating

            return (
              <button
                key={rating}
                onClick={() => applyRatingFilter(rating)}
                className={cn(
                  "flex items-center gap-x-2 rounded-md px-3 py-1",
                  isSelected && "bg-primary/15",
                )}
              >
                <RatingStarsPreview key={rating} rating={rating} />
                {rating !== 5 && <p className="text-[10px]">and up</p>}
              </button>
            )
          })}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
