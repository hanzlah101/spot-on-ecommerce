import { Button } from "@/components/ui/button"
import { getSession } from "@/utils/auth"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function NotFound() {
  const { user } = await getSession()

  const isAdmin = user?.role === "admin" || user?.role === "moderator"

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 p-4">
      <h1 className="text-6xl font-extrabold text-primary sm:text-7xl">404</h1>
      <h2 className="text-xl font-semibold sm:text-2xl">
        Something&apos;s missing.
      </h2>
      <p className="max-w-md text-center text-muted-foreground">
        Sorry, we can&apos;t find that page. You&apos;ll find lots to explore.
      </p>
      <Link href={isAdmin ? "/dashboard" : "/"}>
        <Button className="group" variant={"outline"}>
          <ArrowLeft className="mr-2 size-4 transition group-hover:-translate-x-1" />{" "}
          Back to {isAdmin ? "Dashboard" : "Homepage"}
        </Button>
      </Link>
    </div>
  )
}
