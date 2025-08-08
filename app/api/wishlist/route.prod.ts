import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

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

    // Get wishlist items with product and variant details
    const [wishlistItems, totalCount] = await Promise.all([
      prisma.wishlist.findMany({
        where: {
          userId: user.id
        },
        include: {
          product: {
            include: {
              variants: {
                where: { isActive: true }
              }
            }
          },
          variant: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: offset,
        take: limit
      }),
      prisma.wishlist.count({
        where: {
          userId: user.id
        }
      })
    ])

    // Transform the data to match frontend expectations
    const formattedItems = wishlistItems.map(item => ({
      id: item.id,
      productId: item.productId,
      variantId: item.variantId,
      name: item.product.name,
      price: item.variant?.price || item.product.price,
      comparePrice: item.product.comparePrice,
      image: item.product.images[0] || '/placeholder-product.jpg',
      category: item.product.category,
      availability: item.product.availability,
      stock: item.variant?.stock || item.product.stock,
      isFeatured: item.product.isFeatured,
      variant: item.variant ? {
        id: item.variant.id,
        name: item.variant.name,
        value: item.variant.value
      } : undefined,
      metadata: {
        weight: item.product.weight,
        origin: item.product.origin,
        vendor: item.product.vendor
      },
      addedAt: item.createdAt.toISOString()
    }))

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

    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      )
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: {
        id: productId,
        isActive: true
      },
      include: {
        variants: {
          where: { isActive: true }
        }
      }
    })

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      )
    }

    // Validate variant if provided
    if (variantId) {
      const variant = product.variants.find(v => v.id === variantId)
      if (!variant) {
        return NextResponse.json(
          { success: false, error: 'Product variant not found' },
          { status: 404 }
        )
      }
    }

    // Check if item already exists in wishlist
    const existingItem = await prisma.wishlist.findUnique({
      where: {
        userId_productId_variantId: {
          userId: user.id,
          productId,
          variantId: variantId || null
        }
      }
    })

    if (existingItem) {
      return NextResponse.json(
        { success: false, error: 'Item already in wishlist' },
        { status: 400 }
      )
    }

    // Add item to wishlist
    const wishlistItem = await prisma.wishlist.create({
      data: {
        userId: user.id,
        productId,
        variantId: variantId || null
      },
      include: {
        product: {
          include: {
            variants: {
              where: { isActive: true }
            }
          }
        },
        variant: true
      }
    })

    // Format response
    const formattedItem = {
      id: wishlistItem.id,
      productId: wishlistItem.productId,
      variantId: wishlistItem.variantId,
      name: wishlistItem.product.name,
      price: wishlistItem.variant?.price || wishlistItem.product.price,
      comparePrice: wishlistItem.product.comparePrice,
      image: wishlistItem.product.images[0] || '/placeholder-product.jpg',
      category: wishlistItem.product.category,
      availability: wishlistItem.product.availability,
      stock: wishlistItem.variant?.stock || wishlistItem.product.stock,
      isFeatured: wishlistItem.product.isFeatured,
      variant: wishlistItem.variant ? {
        id: wishlistItem.variant.id,
        name: wishlistItem.variant.name,
        value: wishlistItem.variant.value
      } : undefined,
      metadata: {
        weight: wishlistItem.product.weight,
        origin: wishlistItem.product.origin,
        vendor: wishlistItem.product.vendor
      },
      addedAt: wishlistItem.createdAt.toISOString()
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
    const clearAll = searchParams.get('clearAll') === 'true'

    if (clearAll) {
      // Clear entire wishlist
      await prisma.wishlist.deleteMany({
        where: {
          userId: user.id
        }
      })

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

    // Remove specific item from wishlist
    const deletedItem = await prisma.wishlist.delete({
      where: {
        userId_productId_variantId: {
          userId: user.id,
          productId,
          variantId: variantId || null
        }
      },
      include: {
        product: true
      }
    })

    return NextResponse.json({
      success: true,
      message: `${deletedItem.product.name} removed from wishlist`,
      data: {
        productId: deletedItem.productId,
        variantId: deletedItem.variantId
      }
    })

  } catch (error) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Item not found in wishlist' },
        { status: 404 }
      )
    }

    console.error('Error removing from wishlist:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to remove item from wishlist' },
      { status: 500 }
    )
  }
}
