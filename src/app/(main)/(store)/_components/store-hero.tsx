"use client"

import Image from "next/image"
import Fade from "embla-carousel-fade"
import Autoplay from "embla-carousel-autoplay"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"

export function HeroSection() {
  return (
    <Carousel
      opts={{ loop: true }}
      plugins={[Fade(), Autoplay({ delay: 7000 })]}
    >
      <CarouselContent>
        {Array.from({ length: 3 }).map((_, index) => (
          <CarouselItem key={index}>
            <div className="relative h-[550px] w-full">
              <Image
                fill
                alt="Hero"
                src={`/hero-${index + 1}.webp`}
                className="w-full rounded-xl object-cover"
              />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  )
}
