import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"

import * as schema from "./schema"
// import { sql } from "drizzle-orm"

// ;(async function createExtensions() {
//   sql`CREATE EXTENSION IF NOT EXISTS vector`
// })()

const client = postgres(process.env.DATABASE_URL!)
export const db = drizzle(client, { schema })
