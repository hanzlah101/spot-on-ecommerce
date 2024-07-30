import { drizzle } from "drizzle-orm/neon-http"
import { neon } from "@neondatabase/serverless"

import * as schema from "./schema"
// import { sql } from "drizzle-orm"

// ;(async function createExtensions() {
//   sql`CREATE EXTENSION IF NOT EXISTS vector`
// })()

const client = neon(process.env.DATABASE_URL!)
export const db = drizzle(client, { schema })
