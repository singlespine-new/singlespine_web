import { getMockProductsByShop, MOCK_SHOPS, paginateMockData } from '@/data/mockData'
import { normalizeShopSlug } from '@/lib/shopSlug'
import { ApiResponse, PaginationInfo, Product } from '@/types'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/shops/[shopId]/products - Fetch products for a specific shop
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ shopId: string }> }
) {
  try {
    const { shopId } = await context.params
    const { searchParams } = new URL(request.url)

    // Query parameters
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const inStock = searchParams.get('inStock') === 'true'

    if (!shopId) {
      return NextResponse.json(
        { success: false, error: 'Shop ID is required' },
        { status: 400 }
      )
    }

    // Calculate offset
    // const offset = (page - 1) * limit  // Removed (unused)

    // Resolve incoming shopId which may actually be a slug
    const normalized = normalizeShopSlug(shopId)
    const shopRecord = MOCK_SHOPS.find(
      s =>
        s.id === shopId ||
        s.id === normalized ||
        normalizeShopSlug(s.slug || '') === normalized
    )

    if (!shopRecord) {
      return NextResponse.json(
        { success: false, error: 'Shop not found' },
        { status: 404 }
      )
    }

    // Get mock products data for the resolved shop id
    const allShopProducts = getMockProductsByShop(shopRecord.id)
    let filteredProducts = [...allShopProducts]

    // Apply filters
    if (search) {
      filteredProducts = filteredProducts.filter(product =>
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.description.toLowerCase().includes(search.toLowerCase()) ||
        product.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
      )
    }

    if (category) {
      filteredProducts = filteredProducts.filter(product => product.category === category)
    }

    if (inStock) {
      filteredProducts = filteredProducts.filter(product =>
        product.availability === 'IN_STOCK' && product.stock > 0
      )
    }

    // Apply sorting
    filteredProducts.sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return sortOrder === 'asc' ? a.price - b.price : b.price - a.price
        case 'name':
          return sortOrder === 'asc'
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name)
        case 'stock':
          return sortOrder === 'asc' ? a.stock - b.stock : b.stock - a.stock
        case 'featured':
          return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0)
        case 'createdAt':
        default:
          const aDate = new Date(a.createdAt).getTime()
          const bDate = new Date(b.createdAt).getTime()
          return sortOrder === 'asc' ? aDate - bDate : bDate - aDate
      }
    })

    // Apply pagination using utility function
    const { items: paginatedProducts, pagination } = paginateMockData(filteredProducts, page, limit)

    /*
    // Future implementation with actual database
    const where = {
      vendor: shopId, // or however shop relationship is structured
      isActive: true,
      ...(category && { category }),
      ...(inStock && {
        availability: 'IN_STOCK',
        stock: { gt: 0 }
      }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { tags: { has: search } }
        ]
      })
    }

    const orderBy = {}
    if (sortBy === 'price') {
      orderBy.price = sortOrder
    } else if (sortBy === 'name') {
      orderBy.name = sortOrder
    } else if (sortBy === 'stock') {
      orderBy.stock = sortOrder
    } else {
      orderBy.createdAt = sortOrder
    }

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
              stock: true
            }
          }
        }
      }),
      prisma.product.count({ where })
    ])
    */

    const response: ApiResponse<{
      products: Product[]
      pagination: PaginationInfo
      shopId: string
    }> = {
      success: true,
      data: {
        products: paginatedProducts,
        pagination,
        shopId
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error fetching shop products:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch shop products'
      },
      { status: 500 }
    )
  }
}

// POST /api/shops/[shopId]/products - Create new product for shop (Shop owner/Admin only)
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ shopId: string }> }
) {
  try {
    // Check authentication and permissions
    const { getCurrentUser } = await import('@/lib/auth')
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { shopId } = await context.params
    const body = await request.json()

    // For now, return mock response
    return NextResponse.json({
      success: true,
      message: 'Product creation functionality not yet implemented',
      data: { shopId, ...body }
    })

    /*
    // Future implementation
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
      variants
    } = body

    // Validate required fields
    if (!name || !slug || !description || !price || !category) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if user owns the shop or is admin
    const shop = await prisma.shop.findUnique({
      where: { id: shopId }
    })

    if (!shop) {
      return NextResponse.json(
        { success: false, error: 'Shop not found' },
        { status: 404 }
      )
    }

    const isOwner = shop.ownerId === user.id
    const isAdminUser = await isAdmin()

    if (!isOwner && !isAdminUser) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
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
        vendor: shop.name,
        shopId: shop.id,
        variants: variants ? {
          create: variants.map(variant => ({
            name: variant.name,
            value: variant.value,
            price: variant.price ? parseFloat(variant.price) : null,
            stock: variant.stock ? parseInt(variant.stock) : 0
          }))
        } : undefined
      },
      include: {
        variants: true
      }
    })

    return NextResponse.json({
      success: true,
      data: product
    })
    */

  } catch (error) {
    console.error('Error creating shop product:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create product'
      },
      { status: 500 }
    )
  }
}
