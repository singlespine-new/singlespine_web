import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const checks: Record<string, unknown> = {}

  // 1. Environment variable presence (masked, never expose values)
  checks.env = {
    DATABASE_URL: process.env.DATABASE_URL
      ? `set (${process.env.DATABASE_URL.split('@')[1] ?? 'unknown host'})`
      : 'MISSING',
    DIRECT_URL: process.env.DIRECT_URL
      ? `set (${process.env.DIRECT_URL.split('@')[1] ?? 'unknown host'})`
      : 'MISSING',
    NEXTAUTH_URL: process.env.NEXTAUTH_URL ?? 'MISSING',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'set' : 'MISSING',
    NODE_ENV: process.env.NODE_ENV,
  }

  // 2. Raw database connectivity
  try {
    await prisma.$queryRaw`SELECT 1`
    checks.db_ping = 'ok'
  } catch (err: unknown) {
    checks.db_ping = 'FAILED'
    checks.db_ping_error =
      err instanceof Error
        ? { message: err.message, name: err.name }
        : String(err)
  }

  // 3. Table accessibility — try reading each critical table
  const tables = ['user', 'account', 'session', 'shop'] as const
  checks.tables = {}

  for (const table of tables) {
    try {
      // Each of these just does a COUNT(*) — fast and non-destructive
      const count = await (prisma[table] as any).count()
        ; (checks.tables as Record<string, unknown>)[table] = `ok (${count} rows)`
    } catch (err: unknown) {
      ; (checks.tables as Record<string, unknown>)[table] =
        err instanceof Error ? err.message : String(err)
    }
  }

  // 4. Prisma client info
  try {
    const clientPkg = await import('@prisma/client/package.json')
    checks.prisma_client_version = (clientPkg as any).default?.version ?? (clientPkg as any).version ?? 'unknown'
  } catch {
    checks.prisma_client_version = 'could not read'
  }

  // Determine overall health
  const healthy =
    checks.db_ping === 'ok' &&
    typeof checks.tables === 'object' &&
    Object.values(checks.tables as Record<string, unknown>).every(
      (v) => typeof v === 'string' && v.startsWith('ok')
    )

  return NextResponse.json(
    { status: healthy ? 'healthy' : 'degraded', checks },
    { status: healthy ? 200 : 503 }
  )
}
