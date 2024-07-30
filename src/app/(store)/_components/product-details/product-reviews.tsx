"use client"

import { toast } from "sonner"
import { use } from "react"
import { format, isEqual } from "date-fns"
import { Trash2 } from "lucide-react"

import type { canReviewProduct, getProductReviews } from "@/queries/review"
import { deleteReview } from "@/actions/review"
import { RatingStarsPreview } from "../rating-stars-preview"
import { Progress } from "@/components/ui/progress"
import { ReviewModal } from "./review-modal"
import { useConfirmModal } from "@/stores/use-confirm-modal"
import { usePagination } from "@/hooks/use-pagination"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

type ProductReviewsProps = {
  userId?: string
  productRating: number
  reviewsPromise: ReturnType<typeof getProductReviews>
  canReviewPromise: ReturnType<typeof canReviewProduct>
}

export function ProductReviews({
  reviewsPromise,
  productRating,
  canReviewPromise,
  userId,
}: ProductReviewsProps) {
  const { total, reviewCounts, data, pageCount } = use(reviewsPromise)
  const { canReview, prevReview } = use(canReviewPromise)
  const { onOpen: onDelete } = useConfirmModal()
  const { currentPage, pages } = usePagination({
    pageCount,
    pageParamName: "review_page",
  })

  const allRatings = [5, 4, 3, 2, 1]

  const fullReviewCounts = allRatings.map((rating) => ({
    rating,
    count: reviewCounts.find((r) => r.rating === rating)?.count ?? 0,
  }))

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
                  ({r.rating})
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
            <ReviewModal canReview={canReview} initialData={prevReview} />
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
                              onSuccess: () => toast.success("Review Deleted"),
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
          <Pagination className="mt-8">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  scroll={false}
                  disabled={currentPage === 1}
                  pageParam={{ ["review_page"]: currentPage - 1 }}
                />
              </PaginationItem>

              {pages.map((page, index) => (
                <PaginationItem key={index}>
                  {page === "..." ? (
                    <PaginationEllipsis />
                  ) : (
                    <PaginationLink
                      scroll={false}
                      isActive={page === currentPage}
                      pageParam={{ ["review_page"]: page }}
                    >
                      {page}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  scroll={false}
                  disabled={currentPage === pageCount}
                  pageParam={{ ["review_page"]: currentPage + 1 }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        ) : null}
      </CardContent>
    </Card>
  )
}
