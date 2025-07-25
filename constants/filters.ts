import { SortOption } from '@/types'
import { PRODUCT_CATEGORIES } from './categories'

// Sort Options
export const SORT_OPTIONS: SortOption[] = [
  {
    value: 'featured',
    label: 'Featured',
    field: 'isFeatured',
    order: 'desc'
  },
  {
    value: 'createdAt-desc',
    label: 'Newest First',
    field: 'createdAt',
    order: 'desc'
  },
  {
    value: 'createdAt-asc',
    label: 'Oldest First',
    field: 'createdAt',
    order: 'asc'
  },
  {
    value: 'price-asc',
    label: 'Price: Low to High',
    field: 'price',
    order: 'asc'
  },
  {
    value: 'price-desc',
    label: 'Price: High to Low',
    field: 'price',
    order: 'desc'
  },
  {
    value: 'name-asc',
    label: 'Name: A to Z',
    field: 'name',
    order: 'asc'
  },
  {
    value: 'name-desc',
    label: 'Name: Z to A',
    field: 'name',
    order: 'desc'
  },
  {
    value: 'rating-desc',
    label: 'Highest Rated',
    field: 'rating',
    order: 'desc'
  },
  {
    value: 'popularity',
    label: 'Most Popular',
    field: 'reviewCount',
    order: 'desc'
  },
  {
    value: 'stock-desc',
    label: 'Stock: High to Low',
    field: 'stock',
    order: 'desc'
  }
]

// Product Availability Filter Options
export const AVAILABILITY_OPTIONS = [
  { value: '', label: 'All Products' },
  { value: 'IN_STOCK', label: 'In Stock' },
  { value: 'LOW_STOCK', label: 'Low Stock' },
  { value: 'OUT_OF_STOCK', label: 'Out of Stock' },
  { value: 'PREORDER', label: 'Pre-order' }
]

// Origin/Country Filter Options
export const ORIGIN_OPTIONS = [
  { value: '', label: 'All Origins', flag: '' },
  { value: 'Ghana', label: 'Ghana', flag: '🇬🇭' },
  { value: 'Nigeria', label: 'Nigeria', flag: '🇳🇬' },
  { value: 'Kenya', label: 'Kenya', flag: '🇰🇪' },
  { value: 'South Africa', label: 'South Africa', flag: '🇿🇦' },
  { value: 'Ethiopia', label: 'Ethiopia', flag: '🇪🇹' },
  { value: 'Senegal', label: 'Senegal', flag: '🇸🇳' },
  { value: 'Morocco', label: 'Morocco', flag: '🇲🇦' },
  { value: 'Egypt', label: 'Egypt', flag: '🇪🇬' },
  { value: 'Tanzania', label: 'Tanzania', flag: '🇹🇿' },
  { value: 'Uganda', label: 'Uganda', flag: '🇺🇬' }
]

// Price Range Options
export const PRICE_RANGES = [
  { value: '', label: 'Any Price', min: null, max: null },
  { value: '0-25', label: 'Under ₵25', min: 0, max: 25 },
  { value: '25-50', label: '₵25 - ₵50', min: 25, max: 50 },
  { value: '50-100', label: '₵50 - ₵100', min: 50, max: 100 },
  { value: '100-200', label: '₵100 - ₵200', min: 100, max: 200 },
  { value: '200-500', label: '₵200 - ₵500', min: 200, max: 500 },
  { value: '500+', label: 'Over ₵500', min: 500, max: null }
]

// Rating Filter Options
export const RATING_OPTIONS = [
  { value: '', label: 'Any Rating' },
  { value: '4+', label: '4+ Stars', min: 4 },
  { value: '3+', label: '3+ Stars', min: 3 },
  { value: '2+', label: '2+ Stars', min: 2 },
  { value: '1+', label: '1+ Stars', min: 1 }
]

// Common Tags for Filtering
export const COMMON_TAGS = [
  'organic',
  'handmade',
  'authentic',
  'traditional',
  'premium',
  'artisan',
  'fair-trade',
  'eco-friendly',
  'vegan',
  'gluten-free',
  'natural',
  'vintage',
  'modern',
  'classic',
  'limited-edition',
  'bestseller',
  'trending',
  'gift-ready',
  'customizable',
  'sustainable'
]

// Search Filters Default State
export const DEFAULT_FILTERS = {
  query: '',
  category: '',
  subcategory: '',
  minPrice: undefined,
  maxPrice: undefined,
  origin: '',
  vendor: '',
  shopId: '',
  availability: '',
  inStock: false,
  featured: false,
  tags: [],
  rating: undefined
}

// Filter utility functions
export const getSortOption = (value: string): SortOption | undefined => {
  return SORT_OPTIONS.find(option => option.value === value)
}

export const getPriceRange = (value: string) => {
  return PRICE_RANGES.find(range => range.value === value)
}

export const getOriginByValue = (value: string) => {
  return ORIGIN_OPTIONS.find(origin => origin.value === value)
}

export const getAvailabilityByValue = (value: string) => {
  return AVAILABILITY_OPTIONS.find(availability => availability.value === value)
}

// View Mode Options
export const VIEW_MODES = [
  { value: 'grid', label: 'Grid View', icon: 'Grid' },
  { value: 'list', label: 'List View', icon: 'List' }
] as const

export type ViewMode = typeof VIEW_MODES[number]['value']

// Items per page options
export const ITEMS_PER_PAGE_OPTIONS = [
  { value: 12, label: '12 per page' },
  { value: 24, label: '24 per page' },
  { value: 36, label: '36 per page' },
  { value: 48, label: '48 per page' }
]

// Default pagination settings
export const DEFAULT_PAGINATION = {
  page: 1,
  limit: 12,
  sort: 'featured',
  order: 'desc'
}

// Filter Labels for Display
export const FILTER_LABELS = {
  query: 'Search',
  category: 'Category',
  subcategory: 'Subcategory',
  minPrice: 'Min Price',
  maxPrice: 'Max Price',
  origin: 'Origin',
  vendor: 'Vendor',
  shopId: 'Shop',
  availability: 'Availability',
  inStock: 'In Stock Only',
  featured: 'Featured Only',
  tags: 'Tags',
  rating: 'Rating'
}

// Filter Types for Validation
export const FILTER_TYPES = {
  query: 'string',
  category: 'string',
  subcategory: 'string',
  minPrice: 'number',
  maxPrice: 'number',
  origin: 'string',
  vendor: 'string',
  shopId: 'string',
  availability: 'string',
  inStock: 'boolean',
  featured: 'boolean',
  tags: 'array',
  rating: 'number'
} as const

// Quick Filter Presets
// Category Filter Options
export const CATEGORY_SELECT_OPTIONS = [
  { value: '', label: 'All Categories' },
  ...PRODUCT_CATEGORIES.map(category => ({
    value: category.id,
    label: category.name,
    slug: category.slug
  }))
]

export const QUICK_FILTERS = [
  {
    id: 'featured',
    label: 'Featured Products',
    filters: { featured: true }
  },
  {
    id: 'new-arrivals',
    label: 'New Arrivals',
    filters: { sort: 'newest' }
  },
  {
    id: 'on-sale',
    label: 'On Sale',
    filters: { hasDiscount: true }
  },
  {
    id: 'under-50',
    label: 'Under ₵50',
    filters: { maxPrice: 50 }
  },
  {
    id: 'organic',
    label: 'Organic Products',
    filters: { tags: ['organic'] }
  },
  {
    id: 'handmade',
    label: 'Handmade Items',
    filters: { tags: ['handmade'] }
  },
  {
    id: 'local-ghana',
    label: 'Made in Ghana',
    filters: { origin: 'Ghana' }
  },
  {
    id: 'gift-ready',
    label: 'Gift Ready',
    filters: { tags: ['gift-ready'] }
  }
]
