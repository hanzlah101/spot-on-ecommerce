"use client"

import { useEffect, useRef } from "react"
import { useInView, useMotionValue, useSpring } from "framer-motion"

import { cn } from "@/utils"

export function NumberTicker({
  value,
  delay = 0,
  className,
}: {
  value: number
  className?: string
  delay?: number // delay in s
}) {
  const ref = useRef<HTMLDivElement>(null)
  const motionValue = useMotionValue(0)
  const springValue = useSpring(motionValue, {
    damping: 60,
    stiffness: 100,
  })
  const isInView = useInView(ref, { once: true, margin: "0px" })

  useEffect(() => {
    if (isInView) {
      setTimeout(() => {
        motionValue.set(value)
      }, delay * 1000)
    }
  }, [motionValue, isInView, delay, value])

  useEffect(() => {
    const unsubscribe = springValue.on("change", (latest) => {
      if (ref.current) {
        const formattedValue = Intl.NumberFormat("en-US").format(
          Math.abs(latest.toFixed(0)),
        )
        ref.current.textContent = formattedValue === "0" ? "0" : formattedValue
      }
    })

    return () => unsubscribe()
  }, [springValue])

  useEffect(() => {
    if (ref.current) {
      ref.current.textContent = Intl.NumberFormat("en-US").format(0)
    }
  }, [, value])

  return (
    <div
      className={cn("inline-block tabular-nums tracking-wider", className)}
      ref={ref}
    />
  )
}
