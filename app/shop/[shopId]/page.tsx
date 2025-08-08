'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Search, Filter, Grid, List, Package, Clock, Star, MapPin, Phone, Globe } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { SearchBar } from '@/components/ui/SearchBar'
import ProductCard from '@/components/products/ProductCard'
import ProductDetailsModal from '@/components/products/ProductDetailsModal'
import { cn } from '@/lib/utils'
import toast from '@/components/ui/toast'
import Image from 'next/image'
import { Shop, Product } from '@/types'
import { SHOP_SORT_OPTIONS } from '@/constants'
import { useCartStore } from '@/lib/store/cart'
import { useAuth } from '@/lib/auth-utils'

// Types imported from @/types

const CATEGORIES = [
  { value: '', label: 'All Products' },
  { value: 'chocolate-bars', label: 'Chocolate Bars' },
  { value: 'bonbons-pralines', label: 'Bonbons and Pralines' },
  { value: 'gifts-bundles', label: 'Gifts and Bundles' },
  { value: 'chocolate-specialties', label: 'Chocolate Specialties' },
  { value: 'seasonal', label: 'Seasonal Items' },
  { value: 'beverages', label: 'Beverages' }
]



export default function ShopPage() {
  const params = useParams()
  const shopId = params.shopId as string

  const [shop, setShop] = useState<Shop | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showProductModal, setShowProductModal] = useState(false)
  const { addItem } = useCartStore()
  const { isAuthenticated } = useAuth()

  // Filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [sortBy, setSortBy] = useState('featured')



  // Fetch shop data
  useEffect(() => {
    const fetchShopData = async () => {
      setLoading(true)
      try {
        // Fetch shop details
        const shopResponse = await fetch(`/api/shops/${shopId}`)
        const shopData = await shopResponse.json()

        if (!shopData.success) {
          throw new Error(shopData.error || 'Failed to fetch shop')
        }

        // Fetch shop products
        const productsResponse = await fetch(`/api/shops/${shopId}/products?limit=50`)
        const productsData = await productsResponse.json()

        if (!productsData.success) {
          throw new Error(productsData.error || 'Failed to fetch products')
        }

        setShop(shopData.data)
        setProducts(productsData.data.products)
        setFilteredProducts(productsData.data.products)
      } catch (err) {
        console.error('Error fetching shop data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load shop data')
        toast.error('Failed to load shop')
      } finally {
        setLoading(false)
      }
    }

    if (shopId) {
      fetchShopData()
    }
  }, [shopId])

  // Filter products
  useEffect(() => {
    let filtered = [...products]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(product => product.category === selectedCategory)
    }

    // Sort
    switch (sortBy) {
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price)
        break
      case 'name-asc':
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'popularity':
        filtered.sort((a, b) => b.stock - a.stock)
        break
      case 'featured':
      default:
        filtered.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0))
        break
    }

    setFilteredProducts(filtered)
  }, [products, searchQuery, selectedCategory, sortBy])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleAddToCart = async (productId: string, quantity: number = 1, variantId?: string) => {
    try {
      // Find the product to add
      const product = products.find(p => p.id === productId)
      if (!product) {
        throw new Error('Product not found')
      }

      // Find the variant if specified
      const variant = variantId ? product.variants?.find(v => v.id === variantId) : undefined

      // Add to cart store (this will handle both frontend and backend sync)
      for (let i = 0; i < quantity; i++) {
        await addItem({
          id: `${productId}-${variantId || 'default'}`,
          productId,
          variantId,
          name: product.name,
          price: variant?.price || product.price,
          image: product.images[0] || '/placeholder-product.jpg',
          maxQuantity: variant?.stock || product.stock,
          variant: variant ? {
            id: variant.id,
            name: variant.name,
            value: variant.value
          } : undefined,
          metadata: {
            weight: product.weight,
            origin: product.origin,
            vendor: product.vendor
          }
        }, isAuthenticated)
      }

      return { success: true };
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  }

  const formatOpeningHours = (hours: { [key: string]: string }) => {
    return Object.entries(hours).map(([days, time]) => (
      <div key={days} className="flex justify-between text-sm">
        <span className="font-medium text-foreground">{days}</span>
        <span className="text-muted-foreground">{time}</span>
      </div>
    ))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-48 bg-muted rounded-xl mb-8" />
            <div className="flex gap-8">
              <div className="w-64 space-y-4">
                <div className="h-32 bg-muted rounded-xl" />
                <div className="h-48 bg-muted rounded-xl" />
              </div>
              <div className="flex-1">
                <div className="grid grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-64 bg-muted rounded-xl" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !shop) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Shop not found
          </h3>
          <p className="text-muted-foreground mb-4">
            {error || 'The shop you are looking for does not exist'}
          </p>
          <Button onClick={() => window.history.back()}>
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Shop Header */}
      <section className="bg-white border-b border-border/40">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Shop Image */}
            <div className="relative w-full md:w-48 h-48 rounded-xl overflow-hidden bg-muted">
              <Image
                src={shop.image || "/placeholder-shop.jpg"}
                alt={shop.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 192px"
              />
            </div>

            {/* Shop Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-foreground mb-2">
                    {shop.name}
                  </h1>
                  <p className="text-muted-foreground mb-3">
                    {shop.description}
                  </p>
                </div>
              </div>

              {/* Shop Stats */}
              <div className="flex flex-wrap items-center gap-6 mb-4">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  <span className="font-semibold text-foreground">
                    {shop.rating}
                  </span>
                  <span className="text-muted-foreground">
                    ({shop.reviewCount} reviews)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                  <span className="text-foreground">{shop.deliveryTime}</span>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-muted-foreground" />
                  <span className="text-foreground">{shop.address}</span>
                </div>
              </div>

              {/* Contact Info */}
              <div className="flex flex-wrap items-center gap-4 text-sm">
                {shop.phone && (
                  <a
                    href={`tel:${shop.phone}`}
                    className="flex items-center gap-2 text-primary hover:text-primary/80"
                  >
                    <Phone className="w-4 h-4" />
                    {shop.phone}
                  </a>
                )}
                {shop.website && (
                  <a
                    href={shop.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary hover:text-primary/80"
                  >
                    <Globe className="w-4 h-4" />
                    Website
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className={cn(
            "lg:w-64 space-y-6",
            showFilters ? "block" : "hidden lg:block"
          )}>
            {/* Opening Hours */}
            <div className="bg-card border border-border/40 rounded-xl p-6">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Opening Hours
              </h3>
              <div className="space-y-2">
                {formatOpeningHours(shop.openingHours)}
              </div>
            </div>

            {/* Categories */}
            <div className="bg-card border border-border/40 rounded-xl p-6 sticky top-6">
              <h3 className="font-semibold text-foreground mb-4">Categories</h3>
              <div className="space-y-2">
                {CATEGORIES.map(category => (
                  <button
                    key={category.value}
                    onClick={() => setSelectedCategory(category.value)}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                      selectedCategory === category.value
                        ? "bg-primary text-white"
                        : "text-foreground hover:bg-muted"
                    )}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Search and Controls */}
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <div className="flex-1">
                  <SearchBar
                    placeholder="Search products..."
                    onSearch={handleSearch}
                    value={searchQuery}
                    icon={<Search className="text-primary" size={18} />}
                  />
                </div>
              </div>

              {/* Toolbar */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden"
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Categories
                  </Button>

                  <div className="text-sm text-muted-foreground">
                    {filteredProducts.length} products found
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Sort */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="p-2 border border-input rounded-md bg-background text-foreground text-sm"
                  >
                    {SHOP_SORT_OPTIONS.map(option => (
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
            </div>

            {/* Products Grid */}
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No products found
                </h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search or category filter
                </p>
                <Button
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedCategory('')
                  }}
                  variant="outline"
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className={cn(
                viewMode === 'grid'
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                  : "space-y-6"
              )}>
                {filteredProducts.map((product) => {
                  // Transform product data for the enhanced ProductCard
                  const transformedProduct = {
                    id: product.id,
                    name: product.name,
                    slug: product.slug,
                    description: product.description,
                    shortDescription: product.shortDescription,
                    price: product.price,
                    comparePrice: product.comparePrice,
                    images: product.images,
                    category: product.category,
                    tags: product.tags,
                    isFeatured: product.isFeatured,
                    stock: product.stock,
                    weight: product.weight,
                    origin: product.origin,
                    vendor: product.vendor,
                    availability: product.availability,
                    variants: product.variants,
                    isActive: product.isActive,
                    createdAt: product.createdAt,
                    updatedAt: product.updatedAt
                  }

                  return (
                    <div
                      key={product.id}
                      onClick={() => {
                        setSelectedProduct(product)
                        setShowProductModal(true)
                      }}
                      className="cursor-pointer"
                    >
                      <ProductCard
                        product={transformedProduct}
                        className={viewMode === 'list' ? "flex flex-row" : ""}
                        showQuickAdd={true}
                      />
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Product Details Modal */}
      <ProductDetailsModal
        product={selectedProduct ? {
          ...selectedProduct,
          rating: 4.5,
          reviewCount: 23,
        } : null}
        isOpen={showProductModal}
        onClose={() => setShowProductModal(false)}
        onAddToCart={handleAddToCart}
      />

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
