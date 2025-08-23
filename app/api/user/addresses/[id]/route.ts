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

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params
    if (!requiredString(id)) {
      return NextResponse.json({ message: 'Invalid address id' }, { status: 400 })
    }

    const existing = await prisma.address.findFirst({
      where: { id, userId: user.id },
    })
    if (!existing) {
      return NextResponse.json({ message: 'Address not found' }, { status: 404 })
    }

    const body = await req.json().catch(() => ({} as any))

    // Accept flexible payload from both Profile and Checkout UIs
    const labelProvided = 'label' in body || 'landmark' in body || 'notes' in body || 'additionalInfo' in body
    const label: string | undefined = body.label ?? body.landmark
    const notes: string | undefined = body.notes ?? body.additionalInfo

    const recipientName: string | undefined = body.recipientName ?? body.fullName ?? body.name
    const phone: string | undefined = body.phone
    const addressLine: string | undefined = body.addressLine ?? body.address ?? body.streetAddress
    const city: string | undefined = body.city
    const region: string | undefined = body.region
    const ghanaPostGPS: string | undefined = body.ghanaPostGPS
    const isDefault: boolean | undefined = typeof body.isDefault === 'boolean' ? body.isDefault : undefined

    // Validate provided fields (only those present)
    const errors: Record<string, string> = {}
    if ('recipientName' in body || 'fullName' in body || 'name' in body) {
      if (!requiredString(recipientName)) errors.recipientName = 'Recipient name cannot be empty'
    }
    if ('phone' in body) {
      if (!requiredString(phone)) errors.phone = 'Phone number cannot be empty'
      else if (!isValidPhone(phone!)) errors.phone = 'Enter a valid phone number'
    }
    if ('addressLine' in body || 'address' in body || 'streetAddress' in body) {
      if (!requiredString(addressLine)) errors.addressLine = 'Street address cannot be empty'
    }
    if ('city' in body) {
      if (!requiredString(city)) errors.city = 'City cannot be empty'
    }
    if ('region' in body) {
      if (!requiredString(region)) errors.region = 'Region cannot be empty'
    }

    if (Object.keys(errors).length) {
      return NextResponse.json({ message: 'Invalid input', errors }, { status: 400 })
    }

    // Prepare update payload
    const data: Record<string, any> = {}

    if (recipientName !== undefined) data.name = recipientName
    if (phone !== undefined) data.phone = phone
    if (addressLine !== undefined) data.streetAddress = addressLine
    if (city !== undefined) data.city = city
    if (region !== undefined) data.region = region
    if (ghanaPostGPS !== undefined) data.ghanaPostGPS = ghanaPostGPS

    // Update landmark meta (label + notes) only if relevant fields provided
    if (labelProvided) {
      let currentLabel = 'Address'
      let currentNotes = ''
      if (typeof existing.landmark === 'string' && existing.landmark.trim().startsWith('{')) {
        try {
          const meta = JSON.parse(existing.landmark)
          if (meta && typeof meta === 'object') {
            if (typeof meta.label === 'string') currentLabel = meta.label
            if (typeof meta.notes === 'string') currentNotes = meta.notes
          }
        } catch {
          // ignore parse error
        }
      }

      const nextLabel = typeof label === 'string' && label.trim() ? label : currentLabel
      const nextNotes = typeof notes === 'string' ? notes : currentNotes
      data.landmark = JSON.stringify({ label: nextLabel, notes: nextNotes })
    }

    // Handle default toggling
    if (isDefault === true) {
      // Unset other defaults for this user
      await prisma.address.updateMany({
        where: { userId: user.id, isDefault: true, NOT: { id } },
        data: { isDefault: false },
      })
      data.isDefault = true
    } else if (isDefault === false) {
      data.isDefault = false
    }

    const updated = await prisma.address.update({
      where: { id },
      data,
    })

    return NextResponse.json(
      { address: toClientAddress(updated) },
      { status: 200, headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (err) {
    console.error('PUT /api/user/addresses/[id] error:', err)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(_req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params
    if (!requiredString(id)) {
      return NextResponse.json({ message: 'Invalid address id' }, { status: 400 })
    }

    const existing = await prisma.address.findFirst({
      where: { id, userId: user.id },
    })
    if (!existing) {
      return NextResponse.json({ message: 'Address not found' }, { status: 404 })
    }

    // Check if this address is used in any orders
    const ordersUsingAddress = await prisma.order.findFirst({
      where: { addressId: id },
    })

    if (ordersUsingAddress) {
      // Cannot delete address that has been used in orders
      // Instead, we can mark it as inactive or return an error
      return NextResponse.json({
        message: 'Cannot delete address that has been used in orders. This address is referenced in your order history.',
        error: 'ADDRESS_IN_USE',
        canDelete: false
      }, { status: 400 })
    }

    // If no orders reference this address, safe to delete
    await prisma.address.delete({
      where: { id },
    })

    return new NextResponse(null, { status: 204 })
  } catch (err) {
    console.error('DELETE /api/user/addresses/[id] error:', err)

    // Check if this is a foreign key constraint error
    if (err instanceof Error && err.message.includes('relation') && err.message.includes('AddressToOrder')) {
      return NextResponse.json({
        message: 'Cannot delete address that has been used in orders. This address is referenced in your order history.',
        error: 'ADDRESS_IN_USE',
        canDelete: false
      }, { status: 400 })
    }

    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
