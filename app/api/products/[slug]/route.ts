import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/products/[slug] - Fetch single product by slug
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params

    if (!slug) {
      return NextResponse.json(
        { success: false, error: 'Product slug is required' },
        { status: 400 }
      )
    }

    const product = await prisma.product.findUnique({
      where: {
        slug,
        isActive: true
      },
      include: {
        variants: {
          where: { isActive: true },
          orderBy: { name: 'asc' }
        }
      }
    })

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      )
    }

    // Get related products from same category
    const relatedProducts = await prisma.product.findMany({
      where: {
        category: product.category,
        id: { not: product.id },
        isActive: true
      },
      take: 4,
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        comparePrice: true,
        images: true,
        shortDescription: true
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        product,
        relatedProducts
      }
    })

  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch product'
      },
      { status: 500 }
    )
  }
}

// PUT /api/products/[slug] - Update product (Admin only)
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    // Check authentication and admin role
    const { getCurrentUser, isAdmin } = await import('@/lib/auth')
    const user = await getCurrentUser()

    if (!user || !(await isAdmin())) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { slug } = await context.params
    const body = await request.json()

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { slug }
    })

    if (!existingProduct) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      )
    }

    const {
      name,
      description,
      shortDescription,
      price,
      comparePrice,
      images,
      category,
      subcategory,
      tags,
      isFeatured,
      isActive,
      stock,
      weight,
      dimensions,
      origin,
      vendor,
      availability
    } = body

    // Update product
    const updatedProduct = await prisma.product.update({
      where: { slug },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(shortDescription !== undefined && { shortDescription }),
        ...(price && { price: parseFloat(price) }),
        ...(comparePrice !== undefined && { comparePrice: comparePrice ? parseFloat(comparePrice) : null }),
        ...(images && { images }),
        ...(category && { category }),
        ...(subcategory !== undefined && { subcategory }),
        ...(tags && { tags }),
        ...(isFeatured !== undefined && { isFeatured }),
        ...(isActive !== undefined && { isActive }),
        ...(stock !== undefined && { stock: parseInt(stock) }),
        ...(weight !== undefined && { weight: weight ? parseFloat(weight) : null }),
        ...(dimensions !== undefined && { dimensions }),
        ...(origin && { origin }),
        ...(vendor !== undefined && { vendor }),
        ...(availability && { availability }),
        updatedAt: new Date()
      },
      include: {
        variants: true
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedProduct
    })

  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update product'
      },
      { status: 500 }
    )
  }
}

// DELETE /api/products/[slug] - Delete product (Admin only)
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    // Check authentication and admin role
    const { getCurrentUser, isAdmin } = await import('@/lib/auth')
    const user = await getCurrentUser()

    if (!user || !(await isAdmin())) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { slug } = await context.params

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { slug }
    })

    if (!existingProduct) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      )
    }

    // Soft delete by setting isActive to false
    const deletedProduct = await prisma.product.update({
      where: { slug },
      data: {
        isActive: false,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully',
      data: deletedProduct
    })

  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete product'
      },
      { status: 500 }
    )
  }
}
