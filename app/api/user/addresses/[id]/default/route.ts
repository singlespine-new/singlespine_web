import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

function toClientAddress(a: any) {
  let label = a.landmark || ''
  let notes: string | undefined
  // Try to parse landmark as JSON meta: { label, notes }
  if (typeof a.landmark === 'string' && a.landmark.trim().startsWith('{')) {
    try {
      const meta = JSON.parse(a.landmark)
      if (meta && typeof meta === 'object') {
        if (typeof meta.label === 'string') label = meta.label
        if (typeof meta.notes === 'string') notes = meta.notes
      }
    } catch {
      // leave as-is
    }
  }

  if (!label) label = 'Address'

  return {
    id: a.id,
    // For profile UI
    label,
    recipientName: a.name || '',
    phone: a.phone || '',
    addressLine: a.streetAddress || '',
    city: a.city || '',
    region: a.region || '',
    isDefault: !!a.isDefault,
    ghanaPostGPS: a.ghanaPostGPS || '',
    landmark: a.landmark || '',
    notes: notes || undefined,

    // For checkout saved addresses UI compatibility
    fullName: a.name || '',
    address: a.streetAddress || '',
    additionalInfo: notes || undefined,
  }
}

function requiredString(v: any) {
  return typeof v === 'string' && v.trim().length > 0
}

async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return null

  const sid = (session.user as any)?.id as string | undefined
  const email = (session.user as any)?.email as string | undefined

  if (!sid && !email) return null

  const user =
    (sid ? await prisma.user.findUnique({ where: { id: sid } }) : null) ||
    (email ? await prisma.user.findUnique({ where: { email } }) : null)

  return user
}

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const id = params?.id
    if (!requiredString(id)) {
      return NextResponse.json({ message: 'Invalid address id' }, { status: 400 })
    }

    const address = await prisma.address.findFirst({
      where: { id, userId: user.id },
    })

    if (!address) {
      return NextResponse.json({ message: 'Address not found' }, { status: 404 })
    }

    // Make this address default, unset existing defaults
    const [, updated] = await prisma.$transaction([
      prisma.address.updateMany({
        where: { userId: user.id, isDefault: true, NOT: { id } },
        data: { isDefault: false },
      }),
      prisma.address.update({
        where: { id },
        data: { isDefault: true },
      }),
    ])

    return NextResponse.json(
      { address: toClientAddress(updated) },
      { status: 200, headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (err) {
    console.error('POST /api/user/addresses/[id]/default error:', err)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
