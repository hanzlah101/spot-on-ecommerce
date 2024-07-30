"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"

import { cn } from "@/utils"
import logo from "../../public/logoipsum.svg"

type LogoProps = {
  notAsLink?: boolean
  className?: string
}

export function Logo({ notAsLink, className }: LogoProps) {
  const pathname = usePathname()

  const Comp = notAsLink ? "div" : Link
  const href = pathname.startsWith("/dashboard") ? "/dashboard" : "/"

  return (
    <Comp href={href} className="w-fit">
      <Image
        src={logo}
        alt="Logo"
        className={cn(
          "size-8 select-none object-contain md:size-10 lg:size-12",
          className,
        )}
      />
    </Comp>
  )
}
