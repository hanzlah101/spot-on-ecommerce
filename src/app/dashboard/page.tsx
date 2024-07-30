import { getDashboardAnalytics } from "@/queries/order"
import { SalesAnalytics } from "./_components/sales-analytics"
import { verifyAdmin } from "@/utils/auth"

export default async function page() {
  const analyticsPromise = getDashboardAnalytics()

  const { user } = await verifyAdmin()

  return (
    <div className="w-full pt-4">
      <div className="mb-6 space-y-1">
        <h1 className="text-2xl font-bold sm:text-3xl md:text-4xl">
          Welcome back, {user.name} 👋
        </h1>
        <p className="text-muted-foreground md:text-lg">
          As the store {user.role}, you&apos;ll manage daily operations.
        </p>
      </div>
      <SalesAnalytics analyticsPromise={analyticsPromise} />
    </div>
  )
}
