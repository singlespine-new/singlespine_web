import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

type Body = {
  name?: string
  email?: string
  phoneNumber?: string
}

function isValidEmail(email: string) {
  return /^\S+@\S+\.\S+$/.test(email)
}

function normalizePhone(phone: string) {
  return phone.trim()
}

function isValidPhone(phone: string) {
  // Basic validation: at least 10 digits
  const digits = phone.replace(/\D/g, '')
  return digits.length >= 10
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const body = (await req.json()) as Body | null
    if (!body || (body.name == null && body.email == null && body.phoneNumber == null)) {
      return NextResponse.json({ message: 'No changes provided' }, { status: 400 })
    }

    const sid = (session.user as any)?.id as string | undefined
    const emailFromSession = (session.user as any)?.email as string | undefined

    if (!sid && !emailFromSession) {
      return NextResponse.json({ message: 'Unable to resolve current user' }, { status: 400 })
    }

    // Resolve the current user
    const user =
      (sid
        ? await prisma.user.findUnique({ where: { id: sid } })
        : null) ||
      (emailFromSession
        ? await prisma.user.findUnique({ where: { email: emailFromSession } })
        : null)

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    // Build update payload
    const data: Record<string, any> = {}

    if (typeof body.name === 'string') {
      const name = body.name.trim()
      if (!name) {
        return NextResponse.json({ message: 'Name cannot be empty' }, { status: 400 })
      }
      data.name = name
    }

    if (typeof body.email === 'string') {
      const email = body.email.trim().toLowerCase()
      if (!email) {
        return NextResponse.json({ message: 'Email cannot be empty' }, { status: 400 })
      }
      if (!isValidEmail(email)) {
        return NextResponse.json({ message: 'Invalid email address' }, { status: 400 })
      }
      data.email = email
    }

    if (typeof body.phoneNumber === 'string') {
      const phone = normalizePhone(body.phoneNumber)
      if (!phone) {
        return NextResponse.json({ message: 'Phone number cannot be empty' }, { status: 400 })
      }
      if (!isValidPhone(phone)) {
        return NextResponse.json({ message: 'Invalid phone number' }, { status: 400 })
      }
      data.phoneNumber = phone
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ message: 'No valid fields to update' }, { status: 400 })
    }

    // Update user
    let updated
    try {
      updated = await prisma.user.update({
        where: { id: user.id },
        data,
      })
    } catch (err: any) {
      // Handle unique constraint violations for email or phoneNumber
      if (err?.code === 'P2002') {
        const target = Array.isArray(err?.meta?.target) ? err.meta.target.join(', ') : 'field'
        return NextResponse.json(
          { message: `The ${target} is already in use` },
          { status: 409 }
        )
      }
      throw err
    }

    const profile = {
      name: updated.name ?? '',
      email: updated.email ?? '',
      phoneNumber: updated.phoneNumber ?? '',
    }

    return NextResponse.json(
      { profile, message: 'Profile updated successfully' },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    )
  } catch (error) {
    console.error('POST /api/user/update-profile error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
