import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

// GET - Fetch individual order details
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ orderId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { orderId } = await context.params

    if (!orderId) {
      return NextResponse.json(
        { message: 'Order ID is required' },
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

    // Fetch order from database
    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
        userId: user.id // Ensure order belongs to the user
      },
      include: {
        address: true,
        payments: true
      }
    })

    if (!order) {
      return NextResponse.json(
        { message: 'Order not found' },
        { status: 404 }
      )
    }

    // Transform order data to match frontend interface
    const transformedOrder = {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      total: order.total,
      estimatedDelivery: order.deliveryDate ?
        Math.ceil((new Date(order.deliveryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) + ' days' :
        '5-7 business days',
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),

      // Order details
      subtotal: order.subtotal,
      shippingCost: order.shippingCost,
      tax: order.tax,

      // Recipient information
      recipientName: order.address.name,
      recipientPhone: order.address.phone,
      recipientAddress: order.address.streetAddress,
      recipientCity: order.address.city,
      recipientRegion: order.address.region,
      recipientLandmark: order.address.landmark,
      recipientNotes: order.notes,

      // Order placer information
      orderPlacerName: user.name || 'Customer',
      orderPlacerPhone: user.phoneNumber || '',
      orderPlacerEmail: user.email || '',

      // Delivery information
      trackingNumber: order.trackingNumber,

      // Payment information
      paymentMethod: order.paymentMethod || 'unknown',
      transactionId: order.payments[0]?.stripePaymentIntentId || null,

      // Mock order items for now (since we're not storing them in database yet)
      items: [
        {
          id: '1',
          productId: 'mock-product-1',
          name: 'Premium Ghanaian Product',
          price: 45.00,
          quantity: 2,
          image: '/placeholder-product.jpg',
          variant: null
        }
      ]
    }

    return NextResponse.json(
      {
        message: 'Order retrieved successfully',
        order: transformedOrder
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    )
  } catch (err) {
    console.error('GET /api/orders/[orderId] error:', err)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update order (for order modifications, cancellations, etc.)
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ orderId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { orderId } = await context.params
    const body = await request.json()
    const { action, data } = body

    if (!orderId) {
      return NextResponse.json(
        { message: 'Order ID is required' },
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

    // Handle different update actions
    switch (action) {
      case 'cancel':
        // In production, implement order cancellation logic
        return NextResponse.json(
          { message: 'Order cancellation initiated' },
          { status: 200 }
        )

      case 'update_address':
        // In production, implement address update logic
        return NextResponse.json(
          { message: 'Delivery address updated' },
          { status: 200 }
        )

      default:
        return NextResponse.json(
          { message: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (err) {
    console.error('PUT /api/orders/[orderId] error:', err)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
