"use client"

import { toast } from "sonner"
import { type ReactNode } from "react"
import { format, isEqual } from "date-fns"
import { Trash2 } from "lucide-react"
import { useQuery, keepPreviousData } from "@tanstack/react-query"
import { useParams, useSearchParams } from "next/navigation"

import { getProductReviews } from "@/queries/review"
import { deleteReview } from "@/actions/review"
import { RatingStarsPreview } from "../rating-stars-preview"
import { Progress } from "@/components/ui/progress"
import { ReviewModal } from "./review-modal"
import { useConfirmModal } from "@/stores/use-confirm-modal"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { PaginationWithLinks } from "@/components/pagination-with-links"
import { Skeleton } from "@/components/ui/skeleton"
import { useInvalidateQueries } from "@/hooks/use-invalidate-queries"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type ProductReviewsProps = {
  userId?: string
  productRating: number
}

export function ProductReviews({ productRating, userId }: ProductReviewsProps) {
  const { onOpen: onDelete } = useConfirmModal()

  const { invalidate } = useInvalidateQueries()

  const { productId }: { productId: string } = useParams()
  const searchParams = useSearchParams()
  const page = Number(searchParams.get("review_page") ?? "1")

  const { data: response, isFetching } = useQuery({
    queryKey: ["product-reviews", productId, page],
    queryFn: async () => await getProductReviews(page, productId),
    placeholderData: keepPreviousData,
  })

  const { total, pageCount, reviewCounts, data } = response ?? {
    total: 0,
    pageCount: 0,
    reviewCounts: [],
    data: [],
  }

  const allRatings = [5, 4, 3, 2, 1]

  const fullReviewCounts = allRatings.map((rating) => ({
    rating,
    count: reviewCounts.find((r) => r.rating === rating)?.count ?? 0,
  }))

  if (isFetching) {
    return (
      <ProductReviewsSkeleton>
        <PaginationWithLinks
          shouldScroll={false}
          pageCount={pageCount}
          pageSearchParam="review_page"
        />
      </ProductReviewsSkeleton>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Reviews</CardTitle>
        <CardDescription>
          {productRating} out of 5 ({total} Ratings)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <ul className="space-y-3">
            {fullReviewCounts.map((r) => (
              <li key={r.rating} className="flex items-center gap-x-3">
                <RatingStarsPreview
                  rating={r.rating}
                  className="hidden md:flex"
                />
                <p className="text-sm text-muted-foreground md:hidden">
                  ({r.rating.toFixed(1)})
                </p>
                <Progress
                  value={r.count}
                  max={total}
                  indicatorCN="bg-yellow-500"
                  className="bg-foreground/5"
                />

                <p className="text-xs">{r.count}</p>
              </li>
            ))}
          </ul>

          <div className="grid grid-cols-1 items-center gap-4 rounded-md bg-muted p-6 dark:bg-muted/60 lg:grid-cols-2">
            <div className="flex h-full flex-col items-center justify-between gap-y-3">
              <h1 className="text-3xl font-semibold">{productRating}</h1>
              <RatingStarsPreview
                rating={productRating}
                starClassName="size-6"
              />
              <p className="text-lg font-semibold">{total} Ratings</p>
            </div>
            <ReviewModal isLoggedIn={!!userId} />
          </div>
        </div>

        {data?.length > 0 && (
          <div className="mt-8 grid w-full grid-cols-1 gap-5 border-t pt-8 md:grid-cols-2">
            {data.map((review) => (
              <Card key={review.id}>
                <CardContent className="space-y-3 pt-6">
                  <div className="group flex items-center justify-between">
                    <RatingStarsPreview rating={review.rating} />
                    {review.userId === userId && (
                      <Tooltip delayDuration={100}>
                        <TooltipTrigger
                          aria-label="Delete Review"
                          className="text-destructive opacity-0 transition-opacity group-hover:opacity-100"
                          onClick={() =>
                            onDelete({
                              description:
                                "Your review will be permanantly deleted.",
                              onConfirm: () =>
                                deleteReview({
                                  reviewId: review.id,
                                  productId: review.productId,
                                }),
                              onSuccess: () => {
                                toast.success("Review Deleted")
                                invalidate(["can-review", "product-reviews"])
                              },
                            })
                          }
                        >
                          <Trash2 className="size-4" />
                        </TooltipTrigger>
                        <TooltipContent>Delete review</TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-x-2">
                      <Avatar>
                        <AvatarImage
                          src={review.user.image ?? "/placeholder-user.jpg"}
                        />
                        <AvatarFallback name={review.user.name} />
                      </Avatar>
                      <div>
                        <h2 className="font-semibold">{review.user.name}</h2>
                        {!isEqual(review.createdAt, review.updatedAt) && (
                          <p className="text-[10px] italic text-muted-foreground">
                            Edited
                          </p>
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground">
                      {format(review.createdAt, "LLL dd, yyyy")}
                    </p>
                  </div>
                  <blockquote className="border-l-2 border-foreground/10 pl-6 italic">
                    {review.description}
                  </blockquote>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {pageCount > 1 ? (
          <PaginationWithLinks
            shouldScroll={false}
            pageCount={pageCount}
            pageSearchParam="review_page"
          />
        ) : null}
      </CardContent>
    </Card>
  )
}

export function ProductReviewsSkeleton({ children }: { children?: ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-7 w-72 rounded" />
        <Skeleton className="mt-2 h-3.5 w-48 rounded" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Skeleton className="h-52 w-full" />
          <Skeleton className="h-52 w-full" />
        </div>

        <div className="mt-8 grid w-full grid-cols-1 gap-5 border-t pt-8 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="space-y-3 pt-6">
                <Skeleton className="h-6 w-48 rounded" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-x-2">
                    <Skeleton className="size-10 rounded-full" />
                    <Skeleton className="h-4 w-20 rounded" />
                  </div>
                  <Skeleton className="h-3 w-20 rounded" />
                </div>

                <div className="border-l-2 border-foreground/10 pl-6">
                  <Skeleton className="h-3.5 w-full rounded" />
                  <Skeleton className="mt-1.5 h-3.5 w-2/3 rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {children}
      </CardContent>
    </Card>
  )
}
