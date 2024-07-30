"use client"

import "react-photo-view/dist/react-photo-view.css"

import { useCallback, useEffect, useMemo, useState } from "react"
import Image from "next/image"
import useCarousel from "embla-carousel-react"
import { PhotoProvider, PhotoView } from "react-photo-view"
import { RotateCw, ZoomIn, ZoomOut } from "lucide-react"

import { cn } from "@/utils"
import type { ProductImage } from "@/utils/types"
import {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

type ProductCarouselProps = {
  images: ProductImage[]
}

export function ProductCarousel({ images }: ProductCarouselProps) {
  const [carouselApi, setCarouselApi] = useState<CarouselApi>()
  const [selectedIndex, setSelectedIndex] = useState(0)

  const [carouselThumbsRef, carouselThumbsApi] = useCarousel({
    containScroll: "keepSnaps",
    dragFree: true,
  })

  const onThumbClick = useCallback(
    (index: number) => {
      if (!carouselApi || !carouselThumbsApi) return
      carouselApi.scrollTo(index)
    },
    [carouselApi, carouselThumbsApi],
  )

  const onSelect = useCallback(() => {
    if (!carouselApi || !carouselThumbsApi) return
    setSelectedIndex(carouselApi.selectedScrollSnap())
    carouselThumbsApi.scrollTo(carouselApi.selectedScrollSnap())
  }, [carouselApi, carouselThumbsApi])

  useEffect(() => {
    if (!carouselApi) return
    carouselApi.on("select", onSelect)
    onSelect()

    return () => {
      carouselApi.off("select", onSelect)
    }
  }, [carouselApi, onSelect])

  const sortedImages = useMemo(() => {
    const uniqueIds = new Set()
    return images
      .sort((a, b) => a.order - b.order)
      .filter((img) => {
        const isDuplicate = uniqueIds.has(img.id)
        uniqueIds.add(img.id)
        return !isDuplicate
      })
  }, [images])

  return (
    <div className="flex flex-col gap-y-4">
      <Carousel setApi={setCarouselApi} className="w-full shrink-0">
        <CarouselContent>
          <PhotoProvider
            loop={false}
            onIndexChange={(index) => carouselApi?.scrollTo(index)}
            toolbarRender={({ scale, onScale, rotate, onRotate }) => (
              <div className="flex items-center gap-x-3 text-[#bfbfbf]">
                <button className="transition-colors hover:text-white">
                  <ZoomIn
                    className="size-5"
                    onClick={() => onScale(scale + 1)}
                  />
                </button>
                <button className="transition-colors hover:text-white">
                  <ZoomOut
                    className="size-5"
                    onClick={() => onScale(scale - 1)}
                  />
                </button>
                <button className="transition-colors hover:text-white">
                  <RotateCw
                    className="size-5"
                    onClick={() => onRotate(rotate + 90)}
                  />
                </button>
              </div>
            )}
          >
            {sortedImages.map((img, index) => (
              <CarouselItem key={img.id + index}>
                <PhotoView src={img.url}>
                  <div className="relative aspect-square w-full cursor-pointer overflow-hidden rounded-xl bg-muted/50">
                    <Image
                      fill
                      src={img.url}
                      alt={img.name}
                      className="rounded-xl object-cover"
                    />
                  </div>
                </PhotoView>
              </CarouselItem>
            ))}
          </PhotoProvider>
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
      <div className="w-full overflow-hidden" ref={carouselThumbsRef}>
        <ul className="flex list-none items-center gap-3">
          {sortedImages.map((img, index) => (
            <li
              key={img.id}
              onClick={() => onThumbClick(index)}
              className={cn(
                "relative size-32 shrink-0 cursor-pointer overflow-hidden rounded-lg bg-muted transition-opacity",
                selectedIndex === index ? "opacity-100" : "opacity-30",
              )}
            >
              <Image
                fill
                src={img.url}
                alt={img.name}
                className="rounded-xl object-cover"
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
