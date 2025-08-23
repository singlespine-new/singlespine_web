import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'

// Utility: normalize response shape for multiple consumers (Profile and Checkout pages)
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

  // Ensure sensible fallback for label
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

function isValidPhone(phone: string) {
  const digits = phone.replace(/\D/g, '')
  return digits.length >= 10
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

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const addresses = await prisma.address.findMany({
      where: { userId: user.id },
      orderBy: [{ isDefault: 'desc' }, { updatedAt: 'desc' as const }],
    })

    return NextResponse.json(
      { addresses: addresses.map(toClientAddress) },
      { status: 200, headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (err) {
    console.error('GET /api/user/addresses error:', err)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json().catch(() => ({} as any))

    // Accept flexible payload from both Profile and Checkout UIs
    const label: string = body.label || body.landmark || ''
    const recipientName: string = body.recipientName || body.fullName || body.name || ''
    const phone: string = body.phone || ''
    const addressLine: string = body.addressLine || body.address || body.streetAddress || ''
    const city: string = body.city || ''
    const region: string = body.region || ''
    const ghanaPostGPS: string | undefined = body.ghanaPostGPS || undefined
    const notes: string | undefined = body.notes || body.additionalInfo || undefined
    const isDefault: boolean = !!body.isDefault

    // Validation
    const errors: Record<string, string> = {}
    if (!requiredString(recipientName)) errors.recipientName = 'Recipient name is required'
    if (!requiredString(phone)) errors.phone = 'Phone number is required'
    else if (!isValidPhone(phone)) errors.phone = 'Enter a valid phone number'
    if (!requiredString(addressLine)) errors.addressLine = 'Street address is required'
    if (!requiredString(city)) errors.city = 'City is required'
    if (!requiredString(region)) errors.region = 'Region is required'

    if (Object.keys(errors).length) {
      return NextResponse.json({ message: 'Invalid input', errors }, { status: 400 })
    }

    // Landmark stores JSON with label and notes (so we don't lose notes due to schema limits)
    const landmarkMeta = JSON.stringify({ label: label || 'Address', notes: notes || '' })

    // If new address is default, unset other defaults
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: user.id, isDefault: true },
        data: { isDefault: false },
      })
    }

    const created = await prisma.address.create({
      data: {
        userId: user.id,
        name: recipientName,
        phone,
        streetAddress: addressLine,
        city,
        region,
        country: 'Ghana',
        ghanaPostGPS: ghanaPostGPS || null,
        landmark: landmarkMeta, // store meta JSON
        isDefault,
      },
    })

    return NextResponse.json(
      { address: toClientAddress(created) },
      { status: 201 }
    )
  } catch (err) {
    console.error('POST /api/user/addresses error:', err)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
