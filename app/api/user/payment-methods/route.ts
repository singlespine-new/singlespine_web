import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

// GET - Fetch user's payment methods
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

    // Find user
    let user = null
    if (sid) {
      user = await prisma.user.findUnique({ where: { id: sid } })
    }
    if (!user && email) {
      user = await prisma.user.findUnique({ where: { email } })
    }

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }

    // Fetch payment methods (mock data for now - replace with actual payment provider integration)
    const paymentMethods = [
      // This would typically come from Stripe, PayStack, or other payment providers
      // For now, we'll return mock data structure
    ]

    return NextResponse.json(
      { paymentMethods },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    )
  } catch (err) {
    console.error('GET /api/user/payment-methods error:', err)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Add new payment method
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { type, details, isDefault } = body

    if (!type || !details) {
      return NextResponse.json(
        { message: 'Payment method type and details are required' },
        { status: 400 }
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

    // Find user
    let user = null
    if (sid) {
      user = await prisma.user.findUnique({ where: { id: sid } })
    }
    if (!user && email) {
      user = await prisma.user.findUnique({ where: { email } })
    }

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }

    // Validate payment method type
    const validTypes = ['card', 'mobile_money', 'bank_transfer']
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { message: 'Invalid payment method type' },
        { status: 400 }
      )
    }

    // For now, we'll store payment methods in a simple format
    // In production, this would integrate with actual payment providers
    const paymentMethod = {
      id: `pm_${Date.now()}`,
      type,
      details,
      isDefault: isDefault || false,
      createdAt: new Date(),
      userId: user.id
    }

    // Here you would typically:
    // 1. Validate the payment method with the payment provider (Stripe, PayStack, etc.)
    // 2. Store the payment method securely
    // 3. Return the sanitized payment method info

    return NextResponse.json(
      {
        message: 'Payment method added successfully',
        paymentMethod: {
          id: paymentMethod.id,
          type: paymentMethod.type,
          details: {
            // Return sanitized details (e.g., masked card numbers)
            ...paymentMethod.details,
            cardNumber: paymentMethod.details.cardNumber ?
              `****-****-****-${paymentMethod.details.cardNumber.slice(-4)}` : undefined
          },
          isDefault: paymentMethod.isDefault
        }
      },
      { status: 201 }
    )
  } catch (err) {
    console.error('POST /api/user/payment-methods error:', err)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Remove payment method
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const paymentMethodId = searchParams.get('id')

    if (!paymentMethodId) {
      return NextResponse.json(
        { message: 'Payment method ID is required' },
        { status: 400 }
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

    // Find user
    let user = null
    if (sid) {
      user = await prisma.user.findUnique({ where: { id: sid } })
    }
    if (!user && email) {
      user = await prisma.user.findUnique({ where: { email } })
    }

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }

    // Here you would typically:
    // 1. Verify the payment method belongs to the user
    // 2. Remove it from the payment provider
    // 3. Remove it from your database

    return NextResponse.json(
      { message: 'Payment method removed successfully' },
      { status: 200 }
    )
  } catch (err) {
    console.error('DELETE /api/user/payment-methods error:', err)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
