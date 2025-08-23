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

    // Fetch payment methods from database
    const paymentMethods = await prisma.paymentMethod.findMany({
      where: {
        userId: user.id,
        isActive: true
      },
      orderBy: [
        { isDefault: 'desc' }, // Default payment methods first
        { createdAt: 'desc' }   // Then by most recent
      ]
    })

    // Transform payment methods for safe return (don't expose sensitive data)
    const sanitizedPaymentMethods = paymentMethods.map((pm) => ({
      id: pm.id,
      type: pm.type,
      displayName: pm.displayName,
      nickname: pm.nickname,
      isDefault: pm.isDefault,
      expiresAt: pm.expiresAt,
      createdAt: pm.createdAt,
      // Only return safe card details
      cardLast4: pm.cardLast4,
      cardBrand: pm.cardBrand,
      cardExpiryMonth: pm.cardExpiryMonth,
      cardExpiryYear: pm.cardExpiryYear,
      // Mobile money provider (safe to expose)
      momoProvider: pm.momoProvider,
      // Bank name (safe to expose)
      bankName: pm.bankName,
      accountHolderName: pm.accountHolderName
    }))

    return NextResponse.json(
      { paymentMethods: sanitizedPaymentMethods },
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
    const { type, details, isDefault, nickname } = body

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
    const validTypes = ['CARD', 'MOBILE_MONEY', 'BANK_TRANSFER', 'CASH_ON_DELIVERY']
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { message: 'Invalid payment method type' },
        { status: 400 }
      )
    }

    // If this is going to be the default, unset other defaults
    if (isDefault) {
      await prisma.paymentMethod.updateMany({
        where: {
          userId: user.id,
          isDefault: true
        },
        data: {
          isDefault: false
        }
      })
    }

    // Prepare payment method data based on type
    const paymentMethodData: any = {
      userId: user.id,
      type: type,
      isDefault: isDefault || false,
      nickname: nickname || null,
      provider: details.provider || null,
      metadata: {
        createdFromIP: request.headers.get('x-forwarded-for') || 'unknown'
      }
    }

    let displayName = ''

    // Handle different payment method types
    switch (type) {
      case 'CARD':
        if (!details.cardNumber || !details.expiryMonth || !details.expiryYear || !details.cvv) {
          return NextResponse.json(
            { message: 'Card details are incomplete' },
            { status: 400 }
          )
        }

        // In production, you would tokenize the card with Stripe/PayStack here
        // For now, we'll store minimal safe details
        paymentMethodData.cardLast4 = details.cardNumber.slice(-4)
        paymentMethodData.cardBrand = details.cardBrand || 'Unknown'
        paymentMethodData.cardExpiryMonth = parseInt(details.expiryMonth)
        paymentMethodData.cardExpiryYear = parseInt(details.expiryYear)
        paymentMethodData.expiresAt = new Date(
          parseInt(details.expiryYear),
          parseInt(details.expiryMonth) - 1,
          1
        )

        displayName = `${paymentMethodData.cardBrand} ending in ${paymentMethodData.cardLast4}`
        break

      case 'MOBILE_MONEY':
        if (!details.provider || !details.phoneNumber) {
          return NextResponse.json(
            { message: 'Mobile money details are incomplete' },
            { status: 400 }
          )
        }

        paymentMethodData.momoProvider = details.provider
        paymentMethodData.momoNumber = details.phoneNumber

        displayName = `${details.provider} Mobile Money (${details.phoneNumber})`
        break

      case 'BANK_TRANSFER':
        if (!details.bankName || !details.accountNumber || !details.accountHolderName) {
          return NextResponse.json(
            { message: 'Bank transfer details are incomplete' },
            { status: 400 }
          )
        }

        paymentMethodData.bankName = details.bankName
        paymentMethodData.accountNumber = details.accountNumber // In production, encrypt this
        paymentMethodData.accountHolderName = details.accountHolderName

        displayName = `${details.bankName} (${details.accountHolderName})`
        break

      case 'CASH_ON_DELIVERY':
        displayName = 'Cash on Delivery'
        break

      default:
        return NextResponse.json(
          { message: 'Unsupported payment method type' },
          { status: 400 }
        )
    }

    paymentMethodData.displayName = displayName

    // Create payment method in database
    const paymentMethod = await prisma.paymentMethod.create({
      data: paymentMethodData
    })

    // Return sanitized payment method
    const sanitizedPaymentMethod = {
      id: paymentMethod.id,
      type: paymentMethod.type,
      displayName: paymentMethod.displayName,
      nickname: paymentMethod.nickname,
      isDefault: paymentMethod.isDefault,
      cardLast4: paymentMethod.cardLast4,
      cardBrand: paymentMethod.cardBrand,
      cardExpiryMonth: paymentMethod.cardExpiryMonth,
      cardExpiryYear: paymentMethod.cardExpiryYear,
      momoProvider: paymentMethod.momoProvider,
      bankName: paymentMethod.bankName,
      accountHolderName: paymentMethod.accountHolderName,
      createdAt: paymentMethod.createdAt
    }

    return NextResponse.json(
      {
        message: 'Payment method added successfully',
        paymentMethod: sanitizedPaymentMethod
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

    // Find the payment method and verify ownership
    const paymentMethod = await prisma.paymentMethod.findFirst({
      where: {
        id: paymentMethodId,
        userId: user.id
      }
    })

    if (!paymentMethod) {
      return NextResponse.json(
        { message: 'Payment method not found' },
        { status: 404 }
      )
    }

    // Soft delete (mark as inactive) instead of hard delete for audit purposes
    await prisma.paymentMethod.update({
      where: {
        id: paymentMethodId
      },
      data: {
        isActive: false,
        isDefault: false // Remove default status when deleting
      }
    })

    // If this was the default payment method, make another one default
    if (paymentMethod.isDefault) {
      const nextPaymentMethod = await prisma.paymentMethod.findFirst({
        where: {
          userId: user.id,
          isActive: true,
          id: {
            not: paymentMethodId
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      if (nextPaymentMethod) {
        await prisma.paymentMethod.update({
          where: {
            id: nextPaymentMethod.id
          },
          data: {
            isDefault: true
          }
        })
      }
    }

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

// PUT - Update payment method (e.g., set as default)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { paymentMethodId, isDefault, nickname } = body

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

    // Find the payment method and verify ownership
    const paymentMethod = await prisma.paymentMethod.findFirst({
      where: {
        id: paymentMethodId,
        userId: user.id,
        isActive: true
      }
    })

    if (!paymentMethod) {
      return NextResponse.json(
        { message: 'Payment method not found' },
        { status: 404 }
      )
    }

    // If setting as default, unset other defaults first
    if (isDefault && !paymentMethod.isDefault) {
      await prisma.paymentMethod.updateMany({
        where: {
          userId: user.id,
          isDefault: true
        },
        data: {
          isDefault: false
        }
      })
    }

    // Update the payment method
    const updatedPaymentMethod = await prisma.paymentMethod.update({
      where: {
        id: paymentMethodId
      },
      data: {
        ...(typeof isDefault === 'boolean' && { isDefault }),
        ...(nickname !== undefined && { nickname })
      }
    })

    // Return sanitized payment method
    const sanitizedPaymentMethod = {
      id: updatedPaymentMethod.id,
      type: updatedPaymentMethod.type,
      displayName: updatedPaymentMethod.displayName,
      nickname: updatedPaymentMethod.nickname,
      isDefault: updatedPaymentMethod.isDefault,
      cardLast4: updatedPaymentMethod.cardLast4,
      cardBrand: updatedPaymentMethod.cardBrand,
      cardExpiryMonth: updatedPaymentMethod.cardExpiryMonth,
      cardExpiryYear: updatedPaymentMethod.cardExpiryYear,
      momoProvider: updatedPaymentMethod.momoProvider,
      bankName: updatedPaymentMethod.bankName,
      accountHolderName: updatedPaymentMethod.accountHolderName,
      createdAt: updatedPaymentMethod.createdAt,
      updatedAt: updatedPaymentMethod.updatedAt
    }

    return NextResponse.json(
      {
        message: 'Payment method updated successfully',
        paymentMethod: sanitizedPaymentMethod
      },
      { status: 200 }
    )
  } catch (err) {
    console.error('PUT /api/user/payment-methods error:', err)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
