import {
  MOCK_PRODUCTS,
  paginateMockData
} from '@/data/mockData'
import { Product } from '@/types'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/products - Fetch products with filtering and pagination using mock data
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
    const availability = searchParams.get('availability')
    const inStock = searchParams.get('inStock') === 'true'

    // Start with all active products
    let filteredProducts = MOCK_PRODUCTS.filter(product => product.isActive)

    // Apply category filter
    if (category) {
      filteredProducts = filteredProducts.filter(product => product.category === category)
    }

    // Apply search filter
    if (search) {
      filteredProducts = filteredProducts.filter(product =>
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.description.toLowerCase().includes(search.toLowerCase()) ||
        product.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase())) ||
        (product.vendor && product.vendor.toLowerCase().includes(search.toLowerCase()))
      )
    }

    // Apply other filters
    if (featured) {
      filteredProducts = filteredProducts.filter(product => product.isFeatured)
    }

    if (minPrice || maxPrice) {
      filteredProducts = filteredProducts.filter(product => {
        const price = product.price
        if (minPrice && price < parseFloat(minPrice)) return false
        if (maxPrice && price > parseFloat(maxPrice)) return false
        return true
      })
    }

    if (origin) {
      filteredProducts = filteredProducts.filter(product => product.origin === origin)
    }

    if (vendor) {
      filteredProducts = filteredProducts.filter(product => product.vendor === vendor)
    }

    if (availability) {
      filteredProducts = filteredProducts.filter(product => product.availability === availability)
    }

    if (inStock) {
      filteredProducts = filteredProducts.filter(product =>
        product.availability === 'IN_STOCK' && product.stock > 0
      )
    }

    // Apply sorting
    filteredProducts.sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case 'price':
          comparison = a.price - b.price
          break
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'rating':
          comparison = (a.rating || 0) - (b.rating || 0)
          break
        case 'stock':
          comparison = a.stock - b.stock
          break
        case 'reviewCount':
          comparison = (a.reviewCount || 0) - (b.reviewCount || 0)
          break
        case 'featured':
          comparison = (a.isFeatured ? 1 : 0) - (b.isFeatured ? 1 : 0)
          break
        case 'createdAt':
        default:
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          break
      }

      return sortOrder === 'desc' ? -comparison : comparison
    })

    // Apply pagination
    const paginatedResult = paginateMockData(filteredProducts, page, limit)

    return NextResponse.json({
      success: true,
      data: {
        products: paginatedResult.items,
        pagination: paginatedResult.pagination,
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

// POST /api/products - Create new product (Mock implementation)
export async function POST(request: NextRequest) {
  try {
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
    const existingProduct = MOCK_PRODUCTS.find(product => product.slug === slug)
    if (existingProduct) {
      return NextResponse.json(
        { success: false, error: 'Product with this slug already exists' },
        { status: 400 }
      )
    }

    // Create new product (in a real app, this would be saved to database)
    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      name,
      slug,
      description,
      shortDescription,
      price: parseFloat(price),
      comparePrice: comparePrice ? parseFloat(comparePrice) : undefined,
      images: images || [],
      category,
      subcategory,
      tags: tags || [],
      isFeatured,
      stock: parseInt(stock),
      weight: weight ? parseFloat(weight) : undefined,
      dimensions,
      origin,
      vendor: vendor || 'Unknown Vendor',
      shopId: undefined, // Would be set based on authenticated user's shop
      availability,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      variants: variants?.map((variant: { name: string, value: string, price?: string, stock?: string, sku?: string }, index: number) => ({
        id: `var-${Date.now()}-${index}`,
        productId: `prod-${Date.now()}`,
        name: variant.name,
        value: variant.value,
        price: variant.price ? parseFloat(variant.price) : undefined,
        stock: variant.stock ? parseInt(variant.stock) : 0,
        sku: variant.sku,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })),
      rating: 0,
      reviewCount: 0
    }

    // In a real app, you would save to database
    // For now, we just return the created product
    console.log('Mock product created:', newProduct)

    return NextResponse.json({
      success: true,
      data: newProduct,
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
