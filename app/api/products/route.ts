import {
  MOCK_PRODUCTS,
  paginateMockData
} from '@/data/mockData'
import { Product } from '@/types'
import { NextRequest, NextResponse } from 'next/server'

// -------- Search helpers to improve findability --------

const SYNONYMS: Record<string, string[]> = {
  rice: ['jollof', 'basmati', 'long grain'],
  oil: ['cooking oil', 'vegetable oil', 'sunflower', 'canola'],
  pepper: ['shito', 'pepper sauce', 'hot sauce', 'chili'],
  gari: ['garri', 'cassava flakes'],
  yam: ['tuber'],
  beans: ['cowpea', 'black-eyed peas'],
  gift: ['present', 'hamper', 'bundle'],
  spice: ['seasoning', 'herbs', 'condiments'],
  snack: ['biscuits', 'cookies', 'chips'],
  drink: ['beverage', 'juice', 'soda'],
  flour: ['maize', 'corn flour', 'cassava flour'],
  fish: ['tilapia', 'smoked fish'],
  chicken: ['poultry'],
  beef: ['meat'],
  soap: ['detergent', 'cleanser'],
  ghana: ['gh', 'made in ghana'],
}

function normalizeText(s: string) {
  return s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
}

function tokenize(q: string): string[] {
  const base = normalizeText(q)
  return base
    .split(/[^a-z0-9]+/g)
    .map(t => t.trim())
    .filter(Boolean)
}

function expandSynonyms(tokens: string[]): string[] {
  const expanded = new Set<string>()
  for (const t of tokens) {
    expanded.add(t)
    const syns = SYNONYMS[t]
    if (syns) {
      for (const s of syns) {
        tokenize(s).forEach(tt => expanded.add(tt))
      }
    }
  }
  return Array.from(expanded)
}

function buildSearchCorpus(p: any) {
  const parts = [
    p.name || '',
    p.description || '',
    (p.tags || []).join(' '),
    p.vendor || '',
    p.category || '',
    p.origin || '',
    p.subcategory || ''
  ]
  return normalizeText(parts.join(' '))
}

function computeScore(product: any, tokens: string[]): number {
  const text = buildSearchCorpus(product)
  let score = 0

  for (const token of tokens) {
    if (!token) continue

    // Strong matches
    if (normalizeText(product.name || '').includes(token)) score += 5
    if ((product.tags || []).some((t: string) => normalizeText(t).includes(token))) score += 4

    // Medium matches
    if (normalizeText(product.description || '').includes(token)) score += 2

    // Weak matches
    if (normalizeText(product.vendor || '').includes(token)) score += 1
    if (normalizeText(product.category || '').includes(token)) score += 1
    if (normalizeText(product.origin || '').includes(token)) score += 1

    // Starts-with boost on name
    if (normalizeText(product.name || '').split(/\s+/).some((w: string) => w.startsWith(token))) {
      score += 2
    }

    // Full-text fallback
    if (text.includes(token)) score += 1
  }

  // Small boosts for merchandising
  if (product.isFeatured) score += 0.5
  if ((product.availability === 'IN_STOCK') && product.stock > 0) score += 0.5
  if (typeof product.rating === 'number') score += Math.min(product.rating, 5) * 0.1

  return score
}

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

    // Apply other filters (except search)
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

    // Advanced search scoring (tokenization + synonyms + fallback)
    if (search && search.trim()) {
      const rawTokens = tokenize(search)
      const tokens = expandSynonyms(rawTokens)

      // Score products
      const scored = filteredProducts.map(p => ({
        product: p,
        score: computeScore(p, tokens),
      }))

      // Keep positives
      let positives = scored.filter(s => s.score > 0)

      // Fallback 1: If nothing positive, try looser partial matching on name/tags
      if (positives.length === 0) {
        const q = normalizeText(search)
        const loose = filteredProducts.map(p => {
          const inName = normalizeText(p.name || '').includes(q)
          const inTags = (p.tags || []).some((t: string) => normalizeText(t).includes(q))
          const inDesc = normalizeText(p.description || '').includes(q)
          const score = (inName ? 4 : 0) + (inTags ? 3 : 0) + (inDesc ? 1 : 0)
          return { product: p, score }
        }).filter(s => s.score > 0)
        positives = loose
      }

      // Fallback 2: If still nothing, show featured/popular/newest
      if (positives.length === 0) {
        let fallback = filteredProducts.filter(p => p.isFeatured)
        if (fallback.length === 0) {
          fallback = [...filteredProducts]
        }
        positives = fallback.map(p => ({
          product: p,
          score: (p.isFeatured ? 2 : 0) + (p.rating || 0) + (p.reviewCount || 0) * 0.1
        }))
      }

      // Sort by score desc, then by rating/reviews/createdAt
      positives.sort((a, b) => {
        const byScore = b.score - a.score
        if (byScore !== 0) return byScore
        const byRating = (b.product.rating || 0) - (a.product.rating || 0)
        if (byRating !== 0) return byRating
        const byReviews = (b.product.reviewCount || 0) - (a.product.reviewCount || 0)
        if (byReviews !== 0) return byReviews
        return new Date(b.product.createdAt).getTime() - new Date(a.product.createdAt).getTime()
      })

      filteredProducts = positives.map(s => s.product)
    } else {
      // Apply sorting when no search query
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
    }

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
