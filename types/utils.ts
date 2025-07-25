import { ApiResponse, CartItem, Order, PaginationInfo, Product, SearchFilters, Shop } from './index'

// Type Guards
export const isProduct = (item: any): item is Product => {
  return (
    typeof item === 'object' &&
    item !== null &&
    typeof item.id === 'string' &&
    typeof item.name === 'string' &&
    typeof item.slug === 'string' &&
    typeof item.price === 'number' &&
    Array.isArray(item.images)
  )
}

export const isShop = (item: any): item is Shop => {
  return (
    typeof item === 'object' &&
    item !== null &&
    typeof item.id === 'string' &&
    typeof item.name === 'string' &&
    typeof item.slug === 'string' &&
    typeof item.rating === 'number' &&
    typeof item.deliveryTime === 'string'
  )
}

export const isOrder = (item: any): item is Order => {
  return (
    typeof item === 'object' &&
    item !== null &&
    typeof item.id === 'string' &&
    typeof item.orderNumber === 'string' &&
    typeof item.status === 'string' &&
    Array.isArray(item.items)
  )
}

export const isCartItem = (item: any): item is CartItem => {
  return (
    typeof item === 'object' &&
    item !== null &&
    typeof item.id === 'string' &&
    typeof item.productId === 'string' &&
    typeof item.name === 'string' &&
    typeof item.price === 'number' &&
    typeof item.quantity === 'number'
  )
}

// API Response Type Guards
export const isApiSuccessResponse = <T>(response: any): response is ApiResponse<T> => {
  return (
    typeof response === 'object' &&
    response !== null &&
    response.success === true &&
    'data' in response
  )
}

export const isApiErrorResponse = (response: any): response is ApiResponse => {
  return (
    typeof response === 'object' &&
    response !== null &&
    response.success === false &&
    typeof response.error === 'string'
  )
}

// Transform Functions
export const transformProductForCard = (product: Product) => {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.shortDescription || product.description,
    price: product.price,
    comparePrice: product.comparePrice,
    images: product.images,
    category: product.category,
    tags: product.tags,
    isFeatured: product.isFeatured,
    stock: product.stock,
    origin: product.origin,
    vendor: product.vendor,
    availability: product.availability,
    rating: product.rating,
    reviewCount: product.reviewCount
  }
}

export const transformShopForCard = (shop: Shop) => {
  return {
    id: shop.id,
    name: shop.name,
    slug: shop.slug,
    description: shop.shortDescription || shop.description,
    image: shop.image,
    rating: shop.rating,
    reviewCount: shop.reviewCount,
    deliveryTime: shop.deliveryTime,
    deliveryFee: shop.deliveryFee,
    minimumOrder: shop.minimumOrder,
    categories: shop.categories,
    tags: shop.tags,
    isVerified: shop.isVerified
  }
}

export const transformProductToCartItem = (
  product: Product,
  quantity: number = 1,
  variantId?: string
): Omit<CartItem, 'id'> => {
  const variant = product.variants?.find(v => v.id === variantId)
  const price = variant?.price || product.price
  const maxQuantity = variant?.stock || product.stock

  return {
    productId: product.id,
    variantId,
    name: product.name,
    price,
    quantity,
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
    }
  }
}

// Validation Functions
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const isValidGhanaPhone = (phone: string): boolean => {
  const ghanaPhoneRegex = /^(\+233|0)[2-9]\d{8}$/
  return ghanaPhoneRegex.test(phone)
}

export const isValidPassword = (password: string): boolean => {
  // At least 8 characters, one uppercase, one lowercase, one number, one special character
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
  return passwordRegex.test(password)
}

export const isValidSlug = (slug: string): boolean => {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
  return slugRegex.test(slug)
}

export const isValidPrice = (price: number): boolean => {
  return typeof price === 'number' && price > 0 && price < 1000000
}

export const isValidQuantity = (quantity: number, maxQuantity: number): boolean => {
  return (
    typeof quantity === 'number' &&
    Number.isInteger(quantity) &&
    quantity > 0 &&
    quantity <= maxQuantity
  )
}

// Filter Functions
export const filterProducts = (products: Product[], filters: SearchFilters): Product[] => {
  return products.filter(product => {
    // Search query filter
    if (filters.query) {
      const query = filters.query.toLowerCase()
      const matchesQuery =
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.tags.some(tag => tag.toLowerCase().includes(query)) ||
        product.vendor.toLowerCase().includes(query)

      if (!matchesQuery) return false
    }

    // Category filter
    if (filters.category && product.category !== filters.category) {
      return false
    }

    // Subcategory filter
    if (filters.subcategory && product.subcategory !== filters.subcategory) {
      return false
    }

    // Price range filter
    if (filters.minPrice && product.price < filters.minPrice) {
      return false
    }
    if (filters.maxPrice && product.price > filters.maxPrice) {
      return false
    }

    // Origin filter
    if (filters.origin && product.origin !== filters.origin) {
      return false
    }

    // Vendor filter
    if (filters.vendor && product.vendor !== filters.vendor) {
      return false
    }

    // Shop filter
    if (filters.shopId && product.shopId !== filters.shopId) {
      return false
    }

    // Availability filter
    if (filters.availability && product.availability !== filters.availability) {
      return false
    }

    // In stock filter
    if (filters.inStock && (product.availability !== 'IN_STOCK' || product.stock === 0)) {
      return false
    }

    // Featured filter
    if (filters.featured && !product.isFeatured) {
      return false
    }

    // Tags filter
    if (filters.tags && filters.tags.length > 0) {
      const hasMatchingTag = filters.tags.some(tag =>
        product.tags.includes(tag)
      )
      if (!hasMatchingTag) return false
    }

    // Rating filter
    if (filters.rating && (!product.rating || product.rating < filters.rating)) {
      return false
    }

    return true
  })
}

// Sort Functions
export const sortProducts = (
  products: Product[],
  sortBy: string,
  sortOrder: 'asc' | 'desc' = 'desc'
): Product[] => {
  const sorted = [...products].sort((a, b) => {
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
      case 'reviewCount':
        comparison = (a.reviewCount || 0) - (b.reviewCount || 0)
        break
      case 'stock':
        comparison = a.stock - b.stock
        break
      case 'createdAt':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        break
      case 'featured':
        comparison = (a.isFeatured ? 1 : 0) - (b.isFeatured ? 1 : 0)
        break
      default:
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    }

    return sortOrder === 'asc' ? comparison : -comparison
  })

  return sorted
}

// Pagination Functions
export const paginateItems = <T>(
  items: T[],
  page: number,
  limit: number
): { items: T[]; pagination: PaginationInfo } => {
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit
  const paginatedItems = items.slice(startIndex, endIndex)

  const pagination: PaginationInfo = {
    currentPage: page,
    totalPages: Math.ceil(items.length / limit),
    totalCount: items.length,
    hasNextPage: endIndex < items.length,
    hasPreviousPage: page > 1,
    limit
  }

  return {
    items: paginatedItems,
    pagination
  }
}

// String Utilities
export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength).trim() + '...'
}

export const formatCurrency = (
  amount: number,
  currency: string = 'GHS',
  locale: string = 'en-GH'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

export const formatNumber = (
  number: number,
  locale: string = 'en-GH'
): string => {
  return new Intl.NumberFormat(locale).format(number)
}

// Date Utilities
export const formatDate = (
  date: string | Date,
  format: 'short' | 'long' | 'full' | 'time' = 'short'
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date

  const options: Intl.DateTimeFormatOptions = {
    short: { month: 'short', day: 'numeric', year: 'numeric' },
    long: { month: 'long', day: 'numeric', year: 'numeric' },
    full: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' },
    time: { hour: 'numeric', minute: '2-digit', hour12: true }
  }[format]

  return dateObj.toLocaleDateString('en-US', options)
}

export const formatDateTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

export const isDateInPast = (date: string | Date): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj < new Date()
}

export const getTimeAgo = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000)

  if (diffInSeconds < 60) return 'just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}mo ago`
  return `${Math.floor(diffInSeconds / 31536000)}y ago`
}

// Array Utilities
export const removeDuplicates = <T>(array: T[], key?: keyof T): T[] => {
  if (!key) {
    return [...new Set(array)]
  }

  const seen = new Set()
  return array.filter(item => {
    const value = item[key]
    if (seen.has(value)) {
      return false
    }
    seen.add(value)
    return true
  })
}

export const groupBy = <T, K extends keyof T>(
  array: T[],
  key: K
): Record<string, T[]> => {
  return array.reduce((groups, item) => {
    const group = String(item[key])
    if (!groups[group]) {
      groups[group] = []
    }
    groups[group].push(item)
    return groups
  }, {} as Record<string, T[]>)
}

// Object Utilities
export const omit = <T, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> => {
  const result = { ...obj }
  keys.forEach(key => delete result[key])
  return result
}

export const pick = <T, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> => {
  const result = {} as Pick<T, K>
  keys.forEach(key => {
    if (key in obj) {
      result[key] = obj[key]
    }
  })
  return result
}

export const isEmpty = (value: any): boolean => {
  if (value == null) return true
  if (typeof value === 'string') return value.trim().length === 0
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.keys(value).length === 0
  return false
}

// Error Handling Utilities
export const createError = (message: string, code?: string, details?: any) => {
  const error = new Error(message) as any
  if (code) error.code = code
  if (details) error.details = details
  return error
}

export const isNetworkError = (error: any): boolean => {
  return (
    error?.code === 'NETWORK_ERROR' ||
    error?.message?.includes('network') ||
    error?.message?.includes('fetch')
  )
}

// Local Storage Utilities
export const safelyParseJSON = <T>(json: string, fallback: T): T => {
  try {
    return JSON.parse(json)
  } catch {
    return fallback
  }
}

export const safelyStringifyJSON = (obj: any): string | null => {
  try {
    return JSON.stringify(obj)
  } catch {
    return null
  }
}
