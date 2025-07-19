'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, Filter, Grid, List, Package } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { SearchBar } from '@/components/ui/SearchBar'
import ProductCard from '@/components/products/ProductCard'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Product {
  id: string
  name: string
  slug: string
  description: string
  shortDescription?: string
  price: number
  comparePrice?: number
  images: string[]
  category: string
  subcategory?: string
  tags: string[]
  isFeatured: boolean
  stock: number
  weight?: number
  origin?: string
  vendor?: string
  availability: string
  variants?: {
    id: string;
    name: string;
    value: string;
    price?: number;
    stock?: number;
  }[]
}

interface ProductsResponse {
  success: boolean
  data: {
    products: Product[]
    pagination: {
      currentPage: number
      totalPages: number
      totalCount: number
      hasNextPage: boolean
      hasPreviousPage: boolean
      limit: number
    }
  }
}

const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'food-beverages', label: 'Food & Beverages' },
  { value: 'clothing-accessories', label: 'Clothing & Accessories' },
  { value: 'home-living', label: 'Home & Living' },
  { value: 'health-beauty', label: 'Health & Beauty' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'books-media', label: 'Books & Media' },
  { value: 'crafts-art', label: 'Crafts & Art' },
  { value: 'jewelry', label: 'Jewelry' },
  { value: 'traditional-wear', label: 'Traditional Wear' },
  { value: 'spices-herbs', label: 'Spices & Herbs' }
]

const SORT_OPTIONS = [
  { value: 'createdAt-desc', label: 'Newest First' },
  { value: 'createdAt-asc', label: 'Oldest First' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'name-asc', label: 'Name: A to Z' },
  { value: 'name-desc', label: 'Name: Z to A' }
]

const ORIGINS = [
  { value: '', label: 'All Origins' },
  { value: 'Ghana', label: 'Ghana 🇬🇭' },
  { value: 'Nigeria', label: 'Nigeria 🇳🇬' },
  { value: 'Kenya', label: 'Kenya 🇰🇪' },
  { value: 'South Africa', label: 'South Africa 🇿🇦' },
  { value: 'Ethiopia', label: 'Ethiopia 🇪🇹' }
]

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)

  // Filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [category, setCategory] = useState('')
  const [sortBy, setSortBy] = useState('createdAt-desc')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [origin, setOrigin] = useState('')
  const [featured, setFeatured] = useState(false)
  const [inStock, setInStock] = useState(false)

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  // Fetch products
  const fetchProducts = useCallback(async (page = 1) => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        ...(searchQuery && { search: searchQuery }),
        ...(category && { category }),
        ...(sortBy && {
          sortBy: sortBy.split('-')[0],
          sortOrder: sortBy.split('-')[1]
        }),
        ...(minPrice && { minPrice }),
        ...(maxPrice && { maxPrice }),
        ...(origin && { origin }),
        ...(featured && { featured: 'true' }),
        ...(inStock && { availability: 'IN_STOCK' })
      })

      const response = await fetch(`/api/products?${params}`)

      if (!response.ok) {
        throw new Error('Failed to fetch products')
      }

      const data: ProductsResponse = await response.json()

      if (data.success) {
        setProducts(data.data.products)
        setCurrentPage(data.data.pagination.currentPage)
        setTotalPages(data.data.pagination.totalPages)
        setTotalCount(data.data.pagination.totalCount)
      } else {
        throw new Error('Failed to load products')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }, [searchQuery, category, sortBy, minPrice, maxPrice, origin, featured, inStock]);

  // Initial load and when filters change
  useEffect(() => {
    fetchProducts(1)
    setCurrentPage(1)
  }, [fetchProducts])

  // Handle page change
  const handlePageChange = (page: number) => {
    fetchProducts(page)
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  // Clear filters
  const clearFilters = () => {
    setSearchQuery('')
    setCategory('')
    setSortBy('createdAt-desc')
    setMinPrice('')
    setMaxPrice('')
    setOrigin('')
    setFeatured(false)
    setInStock(false)
  }

  // Get active filters count
  const activeFiltersCount = [
    searchQuery,
    category,
    minPrice,
    maxPrice,
    origin,
    featured,
    inStock
  ].filter(Boolean).length

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/10 via-secondary/20 to-primary/10 border-b border-border/40">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Discover Authentic African Gifts
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Handpicked treasures from across the continent, delivered with love to your family in Ghana
            </p>

            {/* Main Search */}
            <div className="max-w-2xl mx-auto">
              <SearchBar
                placeholder="Search for gifts, food, crafts, and more..."
                onSearch={handleSearch}
                value={searchQuery}
                size="lg"
                containerClassName="shadow-lg"
                icon={<Search className="text-primary" size={20} />}
              />
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className={cn(
            "lg:w-64 space-y-6",
            showFilters ? "block" : "hidden lg:block"
          )}>
            <div className="bg-card border border-border/40 rounded-xl p-6 sticky top-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Filters</h3>
                {activeFiltersCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-primary hover:text-primary/80"
                  >
                    Clear ({activeFiltersCount})
                  </Button>
                )}
              </div>

              <div className="space-y-6">
                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2 border border-input rounded-md bg-background text-foreground"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Origin */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Origin
                  </label>
                  <select
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    className="w-full p-2 border border-input rounded-md bg-background text-foreground"
                  >
                    {ORIGINS.map(orig => (
                      <option key={orig.value} value={orig.value}>
                        {orig.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Price Range (₵)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="flex-1 p-2 border border-input rounded-md bg-background text-foreground"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="flex-1 p-2 border border-input rounded-md bg-background text-foreground"
                    />
                  </div>
                </div>

                {/* Checkboxes */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={featured}
                      onChange={(e) => setFeatured(e.target.checked)}
                      className="rounded border-input"
                    />
                    <span className="text-sm text-foreground">Featured Products</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={inStock}
                      onChange={(e) => setInStock(e.target.checked)}
                      className="rounded border-input"
                    />
                    <span className="text-sm text-foreground">In Stock Only</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <span className="ml-2 bg-primary text-white text-xs rounded-full px-2 py-1">
                      {activeFiltersCount}
                    </span>
                  )}
                </Button>

                <div className="text-sm text-muted-foreground">
                  {loading ? 'Loading...' : `${totalCount} products found`}
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="p-2 border border-input rounded-md bg-background text-foreground text-sm"
                >
                  {SORT_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                {/* View Mode */}
                <div className="flex border border-input rounded-md overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={cn(
                      "p-2 text-sm",
                      viewMode === 'grid' ? "bg-primary text-white" : "bg-background text-foreground"
                    )}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={cn(
                      "p-2 text-sm",
                      viewMode === 'list' ? "bg-primary text-white" : "bg-background text-foreground"
                    )}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="bg-card border border-border/40 rounded-xl p-4 animate-pulse">
                    <div className="aspect-[4/3] bg-muted rounded-lg mb-4" />
                    <div className="h-4 bg-muted rounded mb-2" />
                    <div className="h-3 bg-muted rounded w-2/3 mb-2" />
                    <div className="h-6 bg-muted rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Oops! Something went wrong
                </h3>
                <p className="text-muted-foreground mb-4">{error}</p>
                <Button onClick={() => fetchProducts(currentPage)}>
                  Try Again
                </Button>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No products found
                </h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search or filter criteria
                </p>
                <Button onClick={clearFilters} variant="outline">
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className={cn(
                viewMode === 'grid'
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                  : "space-y-6"
              )}>
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    className={viewMode === 'list' ? "flex flex-row" : ""}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-12">
                <Button
                  variant="outline"
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  Previous
                </Button>

                {[...Array(totalPages)].map((_, i) => (
                  <Button
                    key={i}
                    variant={currentPage === i + 1 ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(i + 1)}
                    className="w-10 h-10"
                  >
                    {i + 1}
                  </Button>
                ))}

                <Button
                  variant="outline"
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* African Pattern Background */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.02] z-0">
        <div className="w-full h-full" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23FC8120' fill-opacity='1'%3E%3Cpolygon points='50 0 60 40 100 50 60 60 50 100 40 60 0 50 40 40'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '100px 100px'
        }} />
      </div>
    </div>
  )
}
