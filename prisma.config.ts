import { resolve } from 'node:path'
import { config } from 'dotenv'
import { defineConfig } from 'prisma/config'

// Load .env before prisma.config is evaluated — the Prisma CLI evaluates this
// module before it processes .env itself, so env vars are not yet in process.env.
config({ path: resolve(process.cwd(), '.env') })

export default defineConfig({
  schema: resolve('prisma', 'schema.prisma'),
  datasource: {
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
  },
})
