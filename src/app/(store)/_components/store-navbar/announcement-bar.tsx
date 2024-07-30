"use client"

import { useTrackOrderModal } from "@/stores/use-track-order-modal"

export function AnnouncementBar() {
  const { onOpen } = useTrackOrderModal()

  return (
    <nav className="flex shrink-0 flex-col items-center gap-y-1 bg-muted/50 px-4 py-2 sm:flex-row sm:justify-between md:px-10">
      <p className="text-sm">Free home delivery on orders over 2000!</p>
      <button
        onClick={onOpen}
        className="text-sm text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
      >
        Track Order
      </button>
    </nav>
  )
}
