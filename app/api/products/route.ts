import { prisma } from '@/lib/prisma'
import { Prisma, ProductAvailability } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/products - Fetch products with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Query parameters
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const featured = searchParams.get('featured') === 'true'
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const origin = searchParams.get('origin')
    const vendor = searchParams.get('vendor')
    const availability = searchParams.get('availability') as ProductAvailability | undefined

    // Calculate offset
    const offset = (page - 1) * limit

    // Build where clause
    const where: Prisma.ProductWhereInput = {
      isActive: true,
    }

    if (category) {
      where.category = category
    }

    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          tags: {
            has: search,
          },
        },
      ]
    }

    if (featured) {
      where.isFeatured = true
    }

    if (minPrice || maxPrice) {
      where.price = {}
      if (minPrice) where.price.gte = parseFloat(minPrice)
      if (maxPrice) where.price.lte = parseFloat(maxPrice)
    }

    if (origin) {
      where.origin = origin
    }

    if (vendor) {
      where.vendor = vendor
    }

    if (availability) {
      where.availability = availability
    }

    // Build orderBy clause
    const orderBy: Prisma.ProductOrderByWithRelationInput = {}
    if (sortBy === 'price') {
      orderBy.price = sortOrder as Prisma.SortOrder
    } else if (sortBy === 'name') {
      orderBy.name = sortOrder as Prisma.SortOrder
    } else {
      orderBy.createdAt = sortOrder as Prisma.SortOrder
    }

    // Fetch products
    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip: offset,
        take: limit,
        include: {
          variants: {
            where: { isActive: true },
            select: {
              id: true,
              name: true,
              value: true,
              price: true,
              stock: true,
            },
          },
        },
      }),
      prisma.product.count({ where }),
    ])

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit)
    const hasNextPage = page < totalPages
    const hasPreviousPage = page > 1

    return NextResponse.json({
      success: true,
      data: {
        products,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          hasNextPage,
          hasPreviousPage,
          limit,
        },
      },
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch products',
      },
      { status: 500 }
    )
  }
}

interface VariantInput {
  name: string
  value: string
  price?: string | number
  stock?: string | number
  sku?: string
}

// POST /api/products - Create new product (Admin only)
export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const {
      name,
      slug,
      description,
      shortDescription,
      price,
      comparePrice,
      images,
      category,
      subcategory,
      tags,
      isFeatured = false,
      stock = 0,
      weight,
      dimensions,
      origin = 'Ghana',
      vendor,
      availability = 'IN_STOCK',
      variants,
    } = body

    // Validate required fields
    if (!name || !slug || !description || !price || !category) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if slug already exists
    const existingProduct = await prisma.product.findUnique({
      where: { slug },
    })

    if (existingProduct) {
      return NextResponse.json(
        { success: false, error: 'Product with this slug already exists' },
        { status: 400 }
      )
    }

    // Create product
    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        shortDescription,
        price: parseFloat(price),
        comparePrice: comparePrice ? parseFloat(comparePrice) : null,
        images: images || [],
        category,
        subcategory,
        tags: tags || [],
        isFeatured,
        stock: parseInt(stock),
        weight: weight ? parseFloat(weight) : null,
        dimensions,
        origin,
        vendor,
        availability,
        variants: variants
          ? {
            create: variants.map((variant: VariantInput) => ({
              name: variant.name,
              value: variant.value,
              price: variant.price ? parseFloat(String(variant.price)) : null,
              stock: variant.stock ? parseInt(String(variant.stock)) : 0,
              sku: variant.sku,
            })),
          }
          : undefined,
      },
      include: {
        variants: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: product,
    })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create product',
      },
      { status: 500 }
    )
  }
}
