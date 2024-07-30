import { Star, StarHalf } from "lucide-react"

import { cn } from "@/utils"

interface RatingStarsPreviewProps {
  rating: number
  className?: string
  starClassName?: string
}

export function RatingStarsPreview({
  rating,
  className,
  starClassName,
}: RatingStarsPreviewProps) {
  const renderStar = (index: number) => {
    const fillPercentage = Math.min(Math.max(rating - index, 0), 1)

    if (fillPercentage > 0.5) {
      return (
        <Star
          key={index}
          className={cn(
            "size-5 fill-yellow-500 text-yellow-500",
            starClassName,
          )}
        />
      )
    } else if (fillPercentage > 0 && fillPercentage <= 0.5) {
      return (
        <div key={index} className="relative">
          <Star className={cn("size-5 text-yellow-500", starClassName)} />
          <StarHalf
            className={cn(
              "absolute left-0 top-0 size-5 fill-yellow-500 text-yellow-500",
              starClassName,
            )}
          />
        </div>
      )
    } else {
      return (
        <Star
          key={index}
          fill="currentColor"
          data-state="empty"
          className={cn(
            "size-5 text-[#dadada] dark:text-[#39393b]",
            starClassName,
          )}
        />
      )
    }
  }

  return (
    <div className={cn("flex items-center gap-x-1", className)}>
      {Array.from({ length: 5 }).map((_, i) => renderStar(i))}
    </div>
  )
}
