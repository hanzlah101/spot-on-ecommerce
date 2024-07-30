import { useState } from "react"
import { Star } from "lucide-react"

import { cn } from "@/utils"

interface EditableRatingStarsProps {
  rating: number
  onRatingChange: (_rating: number) => void
  disabled?: boolean
}

export function EditableRatingStars({
  rating,
  onRatingChange,
  disabled,
}: EditableRatingStarsProps) {
  const [hoverRating, setHoverRating] = useState(0)

  const renderStar = (index: number) => {
    const starValue = index + 1
    const isFilled = starValue <= (hoverRating || rating)

    return (
      <Star
        key={index}
        className={cn(
          "size-6 cursor-pointer transition hover:scale-110",
          isFilled ? "fill-yellow-500 text-yellow-500" : "text-foreground/15",
        )}
        onClick={() => onRatingChange(starValue)}
        onMouseEnter={() => setHoverRating(starValue)}
        onMouseLeave={() => setHoverRating(0)}
      />
    )
  }

  return (
    <div
      className="flex items-center gap-x-2 aria-disabled:pointer-events-none aria-disabled:opacity-50"
      aria-disabled={disabled}
    >
      {Array.from({ length: 5 }).map((_, i) => renderStar(i))}
    </div>
  )
}
