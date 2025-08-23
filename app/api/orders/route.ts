import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

// POST - Create new order
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
    const { items, recipient, orderPlacer, delivery, summary, paymentMethod } = body

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { message: 'Order items are required' },
        { status: 400 }
      )
    }

    if (!recipient || !recipient.fullName || !recipient.phone || !recipient.address) {
      return NextResponse.json(
        { message: 'Recipient information is required' },
        { status: 400 }
      )
    }

    if (!paymentMethod || !paymentMethod.id) {
      return NextResponse.json(
        { message: 'Payment method is required' },
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

    // Generate order number in the format ORD-timestamp-randomCode (frontend will add #)
    const timestamp = Date.now()
    const randomCode = Math.random().toString(36).substr(2, 9).toUpperCase()
    const orderNumber = `ORD-${timestamp}-${randomCode}`

    // Create or find recipient address
    const recipientAddress = await prisma.address.create({
      data: {
        userId: user.id,
        name: recipient.fullName,
        phone: recipient.phone,
        streetAddress: recipient.address,
        city: recipient.city,
        region: recipient.region,
        landmark: recipient.landmark || null,
        isDefault: false
      }
    })

    // For now, we'll create the order without order items to avoid ObjectId issues
    // This is a temporary solution until we implement proper product management
    console.log('Creating order with items:', items.map(item => ({
      name: item.name,
      productId: item.productId,
      quantity: item.quantity,
      price: item.price
    })))

    // Create order in database
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: user.id,
        addressId: recipientAddress.id,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        paymentMethod: paymentMethod.type,
        subtotal: summary.subtotal,
        shippingCost: summary.shippingCost,
        tax: summary.tax,
        total: summary.total,
        notes: recipient.notes || null,
        deliveryDate: delivery.option === 'express' ?
          new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) : // 3 days
          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),  // 7 days
      },
      include: {
        address: true
      }
    })

    // Store order items info in a simple format for now
    // This avoids the ObjectId validation issues with mock products
    const orderItemsInfo = items.map((item: any) => ({
      id: `${order.id}-${item.productId}`,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      image: item.image,
      variant: item.variant
    }))

    // Simulate payment processing based on payment method
    let paymentResult = { success: false, transactionId: null }

    switch (paymentMethod.type) {
      case 'card':
        // In real app, integrate with Stripe, PayStack, etc.
        paymentResult = {
          success: true,
          transactionId: `txn_${Date.now()}`
        }
        break

      case 'mobile_money':
        // In real app, integrate with MTN Mobile Money, Vodafone Cash, etc.
        paymentResult = {
          success: true,
          transactionId: `mm_${Date.now()}`
        }
        break

      case 'bank_transfer':
        // In real app, provide bank details for manual transfer
        paymentResult = {
          success: true,
          transactionId: `bt_${Date.now()}`
        }
        break

      default:
        return NextResponse.json(
          { message: 'Invalid payment method' },
          { status: 400 }
        )
    }

    if (!paymentResult.success) {
      // Delete the order if payment fails
      await prisma.order.delete({
        where: { id: order.id }
      })

      return NextResponse.json(
        { message: 'Payment processing failed' },
        { status: 400 }
      )
    }

    // Update order with payment info
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: 'PAID',
        status: 'CONFIRMED',
        trackingNumber: `GH${timestamp.toString().slice(-8)}-${randomCode.slice(0, 4)}`
      }
    })

    // Create payment record
    await prisma.payment.create({
      data: {
        orderId: order.id,
        amount: order.total,
        status: 'PAID',
        method: paymentMethod.type,
        stripePaymentIntentId: paymentResult.transactionId
      }
    })

    // Return success response
    return NextResponse.json(
      {
        message: 'Order created successfully',
        orderId: order.id,
        transactionId: paymentResult.transactionId,
        estimatedDelivery: delivery.option === 'express' ? '2-3 business days' : '5-7 business days',
        order: {
          id: order.id,
          orderNumber: order.orderNumber,
          status: updatedOrder.status,
          paymentStatus: updatedOrder.paymentStatus,
          total: order.total,
          estimatedDelivery: delivery.option === 'express' ? '2-3 business days' : '5-7 business days',
          createdAt: order.createdAt.toISOString(),
          items: orderItemsInfo
        }
      },
      { status: 201 }
    )
  } catch (err) {
    console.error('POST /api/orders error:', err)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET - Fetch user's orders
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

    // Fetch orders from database
    const orders = await prisma.order.findMany({
      where: {
        userId: user.id
      },
      include: {
        address: true,
        payments: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform orders to match frontend interface
    const transformedOrders = orders.map(order => {
      // Map database status to frontend format
      const statusMap: Record<string, string> = {
        'PENDING': 'pending',
        'CONFIRMED': 'confirmed',
        'PROCESSING': 'preparing',
        'SHIPPED': 'shipped',
        'OUT_FOR_DELIVERY': 'shipped',
        'DELIVERED': 'delivered',
        'CANCELLED': 'cancelled',
        'RETURNED': 'cancelled'
      }

      return {
        id: order.id,
        orderNumber: order.orderNumber,
        status: statusMap[order.status] || order.status.toLowerCase(),
        items: [
          {
            id: '1',
            name: 'Premium Ghanaian Product',
            quantity: 2,
            price: 45.00,
            image: '/placeholder-product.jpg',
            variant: null
          }
        ],
        total: order.total,
        subtotal: order.subtotal,
        shippingCost: order.shippingCost,
        taxAmount: order.tax,
        shippingInfo: {
          name: order.address.name,
          phone: order.address.phone,
          address: order.address.streetAddress,
          city: order.address.city,
          region: order.address.region,
          postalCode: order.address.ghanaPostGPS || ''
        },
        paymentMethod: order.paymentMethod || 'Unknown',
        trackingNumber: order.trackingNumber,
        estimatedDelivery: order.deliveryDate ?
          new Date(order.deliveryDate).toLocaleDateString() :
          '5-7 business days',
        createdAt: order.createdAt.toISOString(),
        deliveryDate: order.deliveryDate?.toISOString(),
        notes: order.notes
      }
    })

    return NextResponse.json(
      { orders: transformedOrders },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    )
  } catch (err) {
    console.error('GET /api/orders error:', err)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
