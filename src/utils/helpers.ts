import { PgColumn, PgTable } from "drizzle-orm/pg-core"

import {
  eq,
  ilike,
  isNotNull,
  isNull,
  not,
  notLike,
  sql,
  inArray,
  and,
  type SQL,
  type Column,
  type ColumnBaseConfig,
  type ColumnDataType,
} from "drizzle-orm"

import { type DataTableConfig } from "@/config/data-table"

export async function updateManyWithDifferentValues<
  TTable extends PgTable,
  TUpdateValues extends Record<string, any>,
>(
  db: any,
  table: TTable,
  inputs: (TUpdateValues & { id: string })[],
  idColumn: keyof TTable["_"]["columns"],
  whereClause?: SQL,
) {
  if (inputs.length === 0) {
    return
  }

  const updateColumns = Object.keys(inputs[0]).filter((key) => key !== "id")
  const updates: Record<string, SQL> = {}

  for (const column of updateColumns) {
    const sqlChunks: SQL[] = []
    sqlChunks.push(sql`(case`)

    const columnDef = table[column as keyof TTable] as PgColumn

    for (const input of inputs) {
      const { id: _, ...inputsToUpdate } = input

      const updateValue = {
        value: inputsToUpdate[column],
        pgType: getColumnType(columnDef),
      }

      if (updateValue.pgType === "json") {
        if (!!updateValue.value) {
          sqlChunks.push(
            sql`when ${table[idColumn as keyof TTable]} = ${input.id} then ${JSON.stringify(updateValue.value)}::json`,
          )
        }
      } else {
        sqlChunks.push(
          sql`when ${table[idColumn as keyof TTable]} = ${input.id} then ${updateValue.value}::${sql.raw(updateValue.pgType)}`,
        )
      }
    }

    sqlChunks.push(sql`end)`)
    updates[column] = sql.join(sqlChunks, sql.raw(" "))
  }

  const ids = inputs.map((input) => input.id)

  await db
    .update(table)
    .set(updates)
    .where(
      !!whereClause
        ? //   @ts-ignore
          and(inArray(table[idColumn], ids), whereClause)
        : //   @ts-ignore
          inArray(table[idColumn], ids),
    )
}

function getColumnType(columnDef: PgColumn) {
  if (columnDef.dataType === "number") {
    if (columnDef.columnType === "PgInteger") {
      return "integer"
    } else if (columnDef.columnType === "PgReal") {
      return "real"
    } else if (columnDef.columnType === "PgBigInt") {
      return "bigint"
    } else if (columnDef.columnType === "PgNumeric") {
      return "numeric"
    } else {
      return "numeric"
    }
  } else if (columnDef.columnType === "PgTimestamp") {
    return "timestamp"
  } else if (columnDef.columnType === "PgJson") {
    return "json"
  } else if (columnDef.columnType === "PgBoolean") {
    return "boolean"
  } else {
    return "text"
  }
}

export function filterColumn({
  column,
  value,
  isSelectable,
}: {
  column: Column<ColumnBaseConfig<ColumnDataType, string>, object, object>
  value: string
  isSelectable?: boolean
}) {
  const [filterValue, filterOperator] = (value?.split("~").filter(Boolean) ??
    []) as [
    string,
    DataTableConfig["comparisonOperators"][number]["value"] | undefined,
  ]

  if (!filterValue) return

  if (isSelectable) {
    switch (filterOperator) {
      case "eq":
        return inArray(column, filterValue?.split(".").filter(Boolean) ?? [])
      case "notEq":
        return not(
          inArray(column, filterValue?.split(".").filter(Boolean) ?? []),
        )
      case "isNull":
        return isNull(column)
      case "isNotNull":
        return isNotNull(column)
      default:
        return inArray(column, filterValue?.split(".") ?? [])
    }
  }

  switch (filterOperator) {
    case "ilike":
      return ilike(column, `%${filterValue}%`)
    case "notIlike":
      return notLike(column, `%${filterValue}%`)
    case "startsWith":
      return ilike(column, `${filterValue}%`)
    case "endsWith":
      return ilike(column, `%${filterValue}`)
    case "eq":
      return eq(column, filterValue)
    case "notEq":
      return not(eq(column, filterValue))
    case "isNull":
      return isNull(column)
    case "isNotNull":
      return isNotNull(column)
    default:
      return ilike(column, `%${filterValue}%`)
  }
}
