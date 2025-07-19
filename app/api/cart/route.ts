import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/cart - Get user's cart items
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const cartItems = await prisma.cartItem.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            images: true,
            stock: true,
            availability: true,
            weight: true,
            origin: true,
            vendor: true
          }
        },
        variant: {
          select: {
            id: true,
            name: true,
            value: true,
            price: true,
            stock: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform cart items for frontend
    const transformedItems = cartItems.map(item => ({
      id: `${item.productId}-${item.variantId || 'default'}`,
      productId: item.productId,
      variantId: item.variantId,
      name: item.product.name,
      price: item.variant?.price || item.product.price,
      image: item.product.images[0] || '/placeholder-product.jpg',
      quantity: item.quantity,
      maxQuantity: item.variant?.stock || item.product.stock,
      variant: item.variant ? {
        id: item.variant.id,
        name: item.variant.name,
        value: item.variant.value
      } : undefined,
      metadata: {
        weight: item.product.weight,
        origin: item.product.origin,
        vendor: item.product.vendor
      }
    }))

    // Calculate totals
    const subtotal = transformedItems.reduce((total, item) =>
      total + (item.price * item.quantity), 0
    )

    const totalWeight = transformedItems.reduce((total, item) => {
      const weight = item.metadata.weight || 0.5
      return total + (weight * item.quantity)
    }, 0)

    // Calculate shipping cost
    const shippingCost = subtotal >= 500 ? 0 :
      totalWeight <= 2 ? 15 : 15 + (Math.ceil(totalWeight - 2) * 5)

    return NextResponse.json({
      success: true,
      data: {
        items: transformedItems,
        summary: {
          subtotal,
          shippingCost,
          total: subtotal + shippingCost,
          totalItems: transformedItems.reduce((total, item) => total + item.quantity, 0),
          totalWeight
        }
      }
    })

  } catch (error) {
    console.error('Error fetching cart:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch cart' },
      { status: 500 }
    )
  }
}

// POST /api/cart - Add item to cart
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { productId, variantId, quantity = 1 } = body

    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      )
    }

    // Verify product exists and is available
    const product = await prisma.product.findUnique({
      where: { id: productId, isActive: true },
      include: {
        variants: variantId ? {
          where: { id: variantId, isActive: true }
        } : false
      }
    })

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      )
    }

    // Check stock availability
    const variant = variantId ? product.variants?.[0] : null
    const availableStock = variant?.stock || product.stock

    if (availableStock < quantity) {
      return NextResponse.json(
        { success: false, error: 'Insufficient stock' },
        { status: 400 }
      )
    }

    // Check if item already exists in cart
    const existingCartItem = await prisma.cartItem.findFirst({
      where: {
        userId: session.user.id,
        productId,
        variantId: variantId || null
      }
    })

    let cartItem

    if (existingCartItem) {
      const newQuantity = existingCartItem.quantity + quantity

      if (newQuantity > availableStock) {
        return NextResponse.json(
          { success: false, error: 'Cannot add more items than available stock' },
          { status: 400 }
        )
      }

      cartItem = await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: {
          quantity: newQuantity,
          updatedAt: new Date()
        },
        include: {
          product: {
            select: {
              name: true,
              images: true,
              price: true
            }
          },
          variant: {
            select: {
              name: true,
              value: true,
              price: true
            }
          }
        }
      })
    } else {
      cartItem = await prisma.cartItem.create({
        data: {
          userId: session.user.id,
          productId,
          variantId: variantId || null,
          quantity
        },
        include: {
          product: {
            select: {
              name: true,
              images: true,
              price: true
            }
          },
          variant: {
            select: {
              name: true,
              value: true,
              price: true
            }
          }
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: `${cartItem.product.name} added to cart successfully! 🎁`,
      data: cartItem
    })

  } catch (error) {
    console.error('Error adding to cart:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to add item to cart' },
      { status: 500 }
    )
  }
}

// PUT /api/cart - Update cart item quantity
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { productId, variantId, quantity } = body

    if (!productId || quantity === undefined) {
      return NextResponse.json(
        { success: false, error: 'Product ID and quantity are required' },
        { status: 400 }
      )
    }

    if (quantity < 0) {
      return NextResponse.json(
        { success: false, error: 'Quantity must be non-negative' },
        { status: 400 }
      )
    }

    // Find cart item
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        userId: session.user.id,
        productId,
        variantId: variantId || null
      },
      include: {
        product: { select: { stock: true, name: true } },
        variant: { select: { stock: true } }
      }
    })

    if (!cartItem) {
      return NextResponse.json(
        { success: false, error: 'Cart item not found' },
        { status: 404 }
      )
    }

    // If quantity is 0, remove the item
    if (quantity === 0) {
      await prisma.cartItem.delete({
        where: { id: cartItem.id }
      })

      return NextResponse.json({
        success: true,
        message: `${cartItem.product.name} removed from cart`,
        data: null
      })
    }

    // Check stock availability
    const availableStock = cartItem.variant?.stock || cartItem.product.stock

    if (quantity > availableStock) {
      return NextResponse.json(
        { success: false, error: `Only ${availableStock} items available` },
        { status: 400 }
      )
    }

    // Update quantity
    const updatedCartItem = await prisma.cartItem.update({
      where: { id: cartItem.id },
      data: {
        quantity,
        updatedAt: new Date()
      },
      include: {
        product: {
          select: {
            name: true,
            images: true,
            price: true
          }
        },
        variant: {
          select: {
            name: true,
            value: true,
            price: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Cart updated successfully',
      data: updatedCartItem
    })

  } catch (error) {
    console.error('Error updating cart:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update cart' },
      { status: 500 }
    )
  }
}

// DELETE /api/cart - Clear entire cart or remove specific item
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    const variantId = searchParams.get('variantId')

    if (productId) {
      // Remove specific item
      const deleted = await prisma.cartItem.deleteMany({
        where: {
          userId: session.user.id,
          productId,
          variantId: variantId || null
        }
      })

      if (deleted.count === 0) {
        return NextResponse.json(
          { success: false, error: 'Cart item not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Item removed from cart successfully'
      })
    } else {
      // Clear entire cart
      await prisma.cartItem.deleteMany({
        where: {
          userId: session.user.id
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Cart cleared successfully! 🧹'
      })
    }

  } catch (error) {
    console.error('Error clearing cart:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to clear cart' },
      { status: 500 }
    )
  }
}
