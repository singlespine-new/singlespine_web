import { getCurrentUser } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'
import { MOCK_PRODUCTS } from '@/data/mockData'

// Mock wishlist storage (in production this would be in database)
let MOCK_WISHLIST: Array<{
  id: string
  userId: string
  productId: string
  variantId?: string
  createdAt: string
}> = []

// GET /api/wishlist - Get user's wishlist items
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    // Get user's wishlist items from mock data
    const userWishlistItems = MOCK_WISHLIST.filter(item => item.userId === user.id)

    // Get the products for these wishlist items
    const formattedItems = userWishlistItems
      .map(wishlistItem => {
        const product = MOCK_PRODUCTS.find(p => p.id === wishlistItem.productId)
        if (!product) return null

        const variant = wishlistItem.variantId
          ? product.variants?.find(v => v.id === wishlistItem.variantId)
          : undefined

        return {
          id: wishlistItem.id,
          productId: wishlistItem.productId,
          variantId: wishlistItem.variantId,
          name: product.name,
          price: variant?.price || product.price,
          comparePrice: product.comparePrice,
          image: product.images[0] || '/placeholder-product.jpg',
          category: product.category,
          availability: product.availability,
          stock: variant?.stock || product.stock,
          isFeatured: product.isFeatured,
          variant: variant ? {
            id: variant.id,
            name: variant.name,
            value: variant.value
          } : undefined,
          metadata: {
            weight: product.weight,
            origin: product.origin,
            vendor: product.vendor
          },
          addedAt: wishlistItem.createdAt
        }
      })
      .filter(Boolean)
      .slice(offset, offset + limit)

    const totalCount = userWishlistItems.length
    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      success: true,
      data: {
        items: formattedItems,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    })

  } catch (error) {
    console.error('Error fetching wishlist:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch wishlist' },
      { status: 500 }
    )
  }
}

// POST /api/wishlist - Add item to wishlist
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user?.id) {

      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { productId, variantId } = body

    // Normalize variantId - convert undefined to null for consistent comparison
    const normalizedVariantId = variantId || null



    if (!productId) {

      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      )
    }

    // Check if product exists in mock data
    const product = MOCK_PRODUCTS.find(p => p.id === productId && p.isActive)

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      )
    }

    // Validate variant if provided
    if (normalizedVariantId) {
      const variant = product.variants?.find(v => v.id === normalizedVariantId && v.isActive)
      if (!variant) {
        return NextResponse.json(
          { success: false, error: 'Product variant not found' },
          { status: 404 }
        )
      }
    }

    // Check if item already exists in wishlist
    const existingItem = MOCK_WISHLIST.find(item =>
      item.userId === user.id &&
      item.productId === productId &&
      (item.variantId || null) === normalizedVariantId
    )



    if (existingItem) {

      return NextResponse.json(
        { success: false, error: 'Item already in wishlist' },
        { status: 400 }
      )
    }

    // Add item to mock wishlist
    const newWishlistItem = {
      id: `wishlist-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: user.id,
      productId,
      variantId: normalizedVariantId,
      createdAt: new Date().toISOString()
    }

    MOCK_WISHLIST.push(newWishlistItem)

    // Get variant info for response
    const variant = normalizedVariantId
      ? product.variants?.find(v => v.id === normalizedVariantId)
      : undefined

    // Format response
    const formattedItem = {
      id: newWishlistItem.id,
      productId: newWishlistItem.productId,
      variantId: newWishlistItem.variantId,
      name: product.name,
      price: variant?.price || product.price,
      comparePrice: product.comparePrice,
      image: product.images[0] || '/placeholder-product.jpg',
      category: product.category,
      availability: product.availability,
      stock: variant?.stock || product.stock,
      isFeatured: product.isFeatured,
      variant: variant ? {
        id: variant.id,
        name: variant.name,
        value: variant.value
      } : undefined,
      metadata: {
        weight: product.weight,
        origin: product.origin,
        vendor: product.vendor
      },
      addedAt: newWishlistItem.createdAt
    }

    return NextResponse.json({
      success: true,
      message: 'Item added to wishlist successfully',
      data: formattedItem
    })

  } catch (error) {
    console.error('Error adding to wishlist:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to add item to wishlist' },
      { status: 500 }
    )
  }
}

// DELETE /api/wishlist - Remove item from wishlist or clear entire wishlist
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    const variantId = searchParams.get('variantId')
    const normalizedVariantId = variantId || null
    const clearAll = searchParams.get('clearAll') === 'true'

    if (clearAll) {
      // Clear entire wishlist for user
      MOCK_WISHLIST = MOCK_WISHLIST.filter(item => item.userId !== user.id)

      return NextResponse.json({
        success: true,
        message: 'Wishlist cleared successfully'
      })
    }

    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      )
    }

    // Find the item to remove
    const itemIndex = MOCK_WISHLIST.findIndex(item =>
      item.userId === user.id &&
      item.productId === productId &&
      (item.variantId || null) === normalizedVariantId
    )

    if (itemIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Item not found in wishlist' },
        { status: 404 }
      )
    }

    // Get product name for response
    const product = MOCK_PRODUCTS.find(p => p.id === productId)
    const productName = product?.name || 'Item'

    // Remove item from wishlist
    MOCK_WISHLIST.splice(itemIndex, 1)

    return NextResponse.json({
      success: true,
      message: `${productName} removed from wishlist`,
      data: {
        productId,
        variantId: normalizedVariantId
      }
    })

  } catch (error) {
    console.error('Error removing from wishlist:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to remove item from wishlist' },
      { status: 500 }
    )
  }
}
