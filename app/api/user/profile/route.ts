import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const sid = (session.user as any)?.id as string | undefined
    const email = (session.user as any)?.email as string | undefined

    if (!sid && !email) {
      return NextResponse.json(
        { message: 'Unable to resolve current user' },
        { status: 400 }
      )
    }

    // Try by id first, then fallback to email
    let user = null as Awaited<ReturnType<typeof prisma.user.findUnique>> | null

    if (sid) {
      user = await prisma.user.findUnique({
        where: { id: sid },
      })
    }

    if (!user && email) {
      user = await prisma.user.findUnique({
        where: { email },
      })
    }

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }

    const profile = {
      name: user.name ?? '',
      email: user.email ?? '',
      phoneNumber: user.phoneNumber ?? '',
    }

    return NextResponse.json(
      { profile },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    )
  } catch (err) {
    console.error('GET /api/user/profile error:', err)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
