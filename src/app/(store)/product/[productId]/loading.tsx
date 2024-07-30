import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/utils"

export default function Loading() {
  return (
    <div className="grid w-full grid-cols-1 gap-x-8 gap-y-6 pt-12 lg:grid-cols-2">
      <div className="w-full space-y-4 overflow-hidden">
        <Skeleton className="aspect-square w-full" />
        <div className="flex items-center gap-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="size-32 shrink-0" />
          ))}
        </div>
      </div>

      <div>
        <Skeleton className="h-6 w-2/3 rounded" />
        <Skeleton className="mt-3 h-7 w-36 rounded" />
        <Skeleton className="mt-3 h-3 w-24 rounded" />
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="mt-4 space-y-2.5">
              <Skeleton className="h-3 w-48" />
              <ul className="flex list-none flex-wrap items-center gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton
                    key={i}
                    className={cn(
                      "size-10",
                      index == 0 ? "rounded-none" : "rounded-full",
                    )}
                  />
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Skeleton className="mt-6 h-3 w-28 rounded" />

        <div className="mt-3 space-y-1.5">
          <Skeleton className="h-3 w-24 rounded" />
          <Skeleton className="h-8 w-40 rounded-full" />
        </div>

        <div className="mt-4">
          <Skeleton className="mb-3 h-12 w-full rounded-full md:h-14" />
          <Skeleton className="h-12 w-full rounded-full md:h-14" />
          <Skeleton className="ml-4 mt-3 h-4 w-48 rounded" />
        </div>

        <div>
          <Skeleton className="ml-4 mt-4 h-3 w-full rounded" />
          <Skeleton className="ml-4 mt-2 h-3 w-1/2 rounded" />
        </div>
      </div>
    </div>
  )
}
