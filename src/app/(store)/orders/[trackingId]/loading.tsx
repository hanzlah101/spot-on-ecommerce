import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="space-y-6 py-8">
      <div>
        <Skeleton className="h-5 w-[280px] rounded" />
        <Skeleton className="h-3.5 w-[180px] rounded" />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-28 w-full" />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[40%_60%]">
        <Skeleton className="h-[450px] w-full" />
        <Skeleton className="h-[500px] w-full" />
      </div>
    </div>
  )
}
