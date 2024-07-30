"use sever"

import {
  and,
  asc,
  count,
  desc,
  eq,
  gte,
  lte,
  or,
  sql,
  type SQL,
} from "drizzle-orm"

import { db } from "@/db"
import { users, type User } from "@/db/schema"
import { GetUsersSchema } from "@/utils/validations/user"
import { filterColumn } from "@/utils/helpers"
import { DrizzleWhere } from "@/utils/types"

export async function getUsers(input: GetUsersSchema, role: User["role"]) {
  const { name, sort, page, per_page, from, to, operator } = input

  try {
    const offset = (page - 1) * per_page
    const [column, order] = (sort?.split(".").filter(Boolean) ?? [
      "createdAt",
      "desc",
    ]) as [keyof User | undefined, "asc" | "desc" | undefined]

    const fromDay = from ? sql`to_date(${from}, 'yyyy-mm-dd')` : undefined
    const toDay = to ? sql`to_date(${to}, 'yyyy-mm-dd')` : undefined

    const expressions: (SQL<unknown> | undefined)[] = [
      eq(users.role, role),
      name
        ? or(
            filterColumn({
              column: users.name,
              value: name,
            }),
            filterColumn({
              column: users.email,
              value: name,
            }),
          )
        : undefined,
      fromDay && toDay
        ? and(gte(users.createdAt, fromDay), lte(users.createdAt, toDay))
        : undefined,
    ]

    const where: DrizzleWhere<User> =
      !operator || operator === "and" ? and(...expressions) : or(...expressions)

    const { data, total } = await db.transaction(async (tx) => {
      const data = await db
        .select({
          id: users.id,
          email: users.email,
          role: users.role,
          name: users.name,
          image: users.image,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        })
        .from(users)
        .where(where)
        .limit(per_page)
        .offset(offset)
        .orderBy(
          column && column in users
            ? order === "asc"
              ? asc(users[column])
              : desc(users[column])
            : desc(users.createdAt),
        )

      const total = await tx
        .select({ count: count() })
        .from(users)
        .where(where)
        .execute()
        .then((res) => res[0]?.count ?? 0)

      return { data, total }
    })

    const pageCount = Math.ceil(total / per_page)
    return { data, pageCount }
  } catch (error) {
    return { pageCount: 0, data: [] }
  }
}
