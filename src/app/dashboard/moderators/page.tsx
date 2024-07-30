import { Suspense } from "react"
import { notFound } from "next/navigation"

import { getUsers } from "@/queries/user"
import { verifyAdmin } from "@/utils/auth"
import { SearchParams } from "@/utils/types"
import { getUsersSchema } from "@/utils/validations/user"
import { UsersTable } from "../_components/tables/users-table"
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton"

type ModeratorsPageProps = {
  searchParams: SearchParams
}

export default async function ModeratorsPage({
  searchParams,
}: ModeratorsPageProps) {
  const { user } = await verifyAdmin()

  if (user.role !== "admin") notFound()

  const input = getUsersSchema.parse(searchParams)
  const usersPromise = getUsers(input, "moderator")

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold sm:text-3xl">Moderators</h1>

      <Suspense
        fallback={
          <DataTableSkeleton
            columnCount={5}
            searchableColumnCount={1}
            filterableColumnCount={0}
            shrinkZero
            withPagination={false}
            cellWidths={[
              { width: "1.25rem", height: "1.25rem" },
              { width: "2.5rem", height: "2.5rem" },
              { width: "10rem" },
              { width: "15rem" },
              { width: "12.5rem" },
              { width: "12.5rem" },
            ]}
          />
        }
      >
        <UsersTable usersPromise={usersPromise} type="moderators" />
      </Suspense>
    </div>
  )
}
