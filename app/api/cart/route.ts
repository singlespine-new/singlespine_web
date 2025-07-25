import { getMockProductById } from '@/data/mockData'
import { NextRequest, NextResponse } from 'next/server'

// Mock cart storage (in a real app, this would be in a database or session storage)
const mockCart: {
  id: string
  userId: string
  items: Array<{
    id: string
    productId: string
    variantId?: string
    quantity: number
    addedAt: string
  }>
} = {
  id: 'mock-cart-1',
  userId: 'mock-user-1',
  items: []
}

// GET /api/cart - Get user's cart items
export async function GET() {
  try {
    // In a real app, you would get the user session here
    // const session = await getServerSession(authOptions)
    // if (!session?.user?.id) {
    //   return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    // }

    const cartItemsWithProducts = mockCart.items.map(item => {
      const product = getMockProductById(item.productId)
      const variant = product?.variants?.find(v => v.id === item.variantId)

      if (!product) {
        return null
      }

      const effectivePrice = variant?.price || product.price
      const maxQuantity = variant?.stock || product.stock

      return {
        id: item.id,
        productId: item.productId,
        variantId: item.variantId,
        name: product.name,
        price: effectivePrice,
        quantity: item.quantity,
        maxQuantity,
        image: product.images[0] || '/placeholder-product.jpg',
        variant: variant ? {
          id: variant.id,
          name: variant.name,
          value: variant.value
        } : undefined,
        metadata: {
          weight: product.weight,
          origin: product.origin,
          vendor: product.vendor,
          shopId: product.shopId
        },
        addedAt: item.addedAt
      }
    }).filter(Boolean)

    // Calculate cart summary
    const subtotal = cartItemsWithProducts.reduce((sum, item) => {
      return sum + (item!.price * item!.quantity)
    }, 0)

    const shippingCost = subtotal > 100 ? 0 : 10 // Free shipping over ₵100
    const tax = subtotal * 0.125 // 12.5% VAT
    const total = subtotal + shippingCost + tax
    const totalItems = cartItemsWithProducts.reduce((sum, item) => sum + item!.quantity, 0)
    const totalWeight = cartItemsWithProducts.reduce((sum, item) => {
      return sum + ((item!.metadata?.weight || 0) * item!.quantity)
    }, 0)

    const cartSummary = {
      subtotal,
      shippingCost,
      tax,
      total,
      totalItems,
      totalWeight
    }

    return NextResponse.json({
      success: true,
      data: {
        items: cartItemsWithProducts,
        summary: cartSummary
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
    // In a real app, you would get the user session here
    // const session = await getServerSession(authOptions)
    // if (!session?.user?.id) {
    //   return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    // }

    const body = await request.json()
    const { productId, variantId, quantity = 1 } = body

    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      )
    }

    // Validate product exists
    const product = getMockProductById(productId)
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      )
    }

    // Validate variant if provided
    let variant = null
    if (variantId) {
      variant = product.variants?.find(v => v.id === variantId)
      if (!variant) {
        return NextResponse.json(
          { success: false, error: 'Product variant not found' },
          { status: 404 }
        )
      }
    }

    // Check stock availability
    const availableStock = variant?.stock || product.stock
    if (availableStock < quantity) {
      return NextResponse.json(
        { success: false, error: 'Insufficient stock' },
        { status: 400 }
      )
    }

    // Check if item already exists in cart
    const existingItemIndex = mockCart.items.findIndex(item =>
      item.productId === productId && item.variantId === variantId
    )

    if (existingItemIndex >= 0) {
      // Update existing item quantity
      const existingItem = mockCart.items[existingItemIndex]
      const newQuantity = existingItem.quantity + quantity

      if (newQuantity > availableStock) {
        return NextResponse.json(
          { success: false, error: 'Cannot add more items than available stock' },
          { status: 400 }
        )
      }

      mockCart.items[existingItemIndex].quantity = newQuantity
    } else {
      // Add new item to cart
      const newItem = {
        id: `cart-item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        productId,
        variantId,
        quantity,
        addedAt: new Date().toISOString()
      }

      mockCart.items.push(newItem)
    }

    return NextResponse.json({
      success: true,
      message: 'Item added to cart successfully'
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
    const body = await request.json()
    const { itemId, quantity } = body

    if (!itemId || quantity < 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid parameters' },
        { status: 400 }
      )
    }

    const itemIndex = mockCart.items.findIndex(item => item.id === itemId)
    if (itemIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Cart item not found' },
        { status: 404 }
      )
    }

    const item = mockCart.items[itemIndex]
    const product = getMockProductById(item.productId)
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      )
    }

    const variant = product.variants?.find(v => v.id === item.variantId)
    const availableStock = variant?.stock || product.stock

    if (quantity > availableStock) {
      return NextResponse.json(
        { success: false, error: 'Insufficient stock' },
        { status: 400 }
      )
    }

    if (quantity === 0) {
      // Remove item from cart
      mockCart.items.splice(itemIndex, 1)
    } else {
      // Update quantity
      mockCart.items[itemIndex].quantity = quantity
    }

    return NextResponse.json({
      success: true,
      message: 'Cart updated successfully'
    })
  } catch (error) {
    console.error('Error updating cart:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update cart' },
      { status: 500 }
    )
  }
}

// DELETE /api/cart - Remove item from cart or clear entire cart
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const itemId = searchParams.get('itemId')

    if (itemId) {
      // Remove specific item
      const itemIndex = mockCart.items.findIndex(item => item.id === itemId)
      if (itemIndex === -1) {
        return NextResponse.json(
          { success: false, error: 'Cart item not found' },
          { status: 404 }
        )
      }

      mockCart.items.splice(itemIndex, 1)
      return NextResponse.json({
        success: true,
        message: 'Item removed from cart'
      })
    } else {
      // Clear entire cart
      mockCart.items = []
      return NextResponse.json({
        success: true,
        message: 'Cart cleared'
      })
    }
  } catch (error) {
    console.error('Error removing from cart:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to remove item from cart' },
      { status: 500 }
    )
  }
}
