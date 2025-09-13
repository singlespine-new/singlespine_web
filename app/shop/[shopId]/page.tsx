'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  Search,
  Filter,
  Grid,
  List,
  Package,
  Clock,
  Star,
  MapPin,
  Phone,
  Globe,
  X,
  RefreshCcw
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { SearchBar } from '@/components/ui/SearchBar'
import ProductCard from '@/components/products/ProductCard'
import ProductDetailsModal from '@/components/products/ProductDetailsModal'
import { SHOP_SORT_OPTIONS } from '@/constants'
import { Shop, Product, ProductVariant } from '@/types'
import { useCartStore } from '@/lib/store/cart'
import { useAuth } from '@/lib/auth-utils'
import { cn } from '@/lib/utils'
import toast from '@/components/ui/toast'

/* -------------------------------------------------------------------------- */
/* Utilities                                                                  */
/* -------------------------------------------------------------------------- */

const STATIC_CATEGORY_PRESET = [
  { value: '', label: 'All Products' },
  { value: 'chocolate-bars', label: 'Chocolate Bars' },
  { value: 'bonbons-pralines', label: 'Bonbons & Pralines' },
  { value: 'gifts-bundles', label: 'Gifts & Bundles' },
  { value: 'chocolate-specialties', label: 'Specialties' },
  { value: 'seasonal', label: 'Seasonal' },
  { value: 'beverages', label: 'Beverages' }
]

const formatCurrency = (v: number) => `₵${v.toFixed(2)}`
const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), max)
const capitalize = (s: string) => s.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

/* -------------------------------------------------------------------------- */
/* Skeletons                                                                  */
/* -------------------------------------------------------------------------- */

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 animate-pulse">
        <div className="h-48 bg-muted rounded-2xl mb-8" />
        <div className="flex flex-col lg:flex-row gap-10">
          <div className="lg:w-64 space-y-6">
            <div className="h-64 bg-muted rounded-2xl" />
            <div className="h-96 bg-muted rounded-2xl" />
          </div>
          <div className="flex-1 grid gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="h-72 bg-muted rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Empty State                                                                */
/* -------------------------------------------------------------------------- */

function EmptyState({ reset }: { reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20">
      <Search className="w-16 h-16 text-muted-foreground mb-6" />
      <h3 className="text-xl font-semibold mb-2 tracking-tight">No products found</h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-sm">
        Try adjusting your search, filters, or sorting criteria to find what you are looking for.
      </p>
      <Button variant="outline" onClick={reset} className="flex items-center gap-2">
        <RefreshCcw className="w-4 h-4" />
        Clear Filters
      </Button>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Filter Panel                                                               */
/* -------------------------------------------------------------------------- */

interface FiltersProps {
  categories: { value: string; label: string }[]
  selectedCategory: string
  setSelectedCategory: (c: string) => void
  availability: string[]
  setAvailability: (a: string[]) => void
  featuredOnly: boolean
  setFeaturedOnly: (b: boolean) => void
  priceMin: number
  priceMax: number
  priceRange: [number, number]
  setPriceRange: (r: [number, number]) => void
  onClose?: () => void
  isMobile?: boolean
  openingHours: Record<string, string>
}

function OpeningHours({ hours }: { hours: Record<string, string> }) {
  return (
    <div className="space-y-2">
      {Object.entries(hours).map(([day, time]) => (
        <div key={day} className="flex justify-between text-xs sm:text-sm">
          <span className="font-medium text-foreground">{day}</span>
          <span className="text-muted-foreground">{time}</span>
        </div>
      ))}
    </div>
  )
}

function FiltersPanel({
  categories,
  selectedCategory,
  setSelectedCategory,
  availability,
  setAvailability,
  featuredOnly,
  setFeaturedOnly,
  priceMin,
  priceMax,
  priceRange,
  setPriceRange,
  onClose,
  isMobile,
  openingHours
}: FiltersProps) {
  const toggleAvailability = (val: string) => {
    setAvailability(
      availability.includes(val)
        ? availability.filter(v => v !== val)
        : [...availability, val]
    )
  }

  const handlePriceInput = (index: number, value: string) => {
    const n = Number(value)
    if (isNaN(n)) return
    const clamped = clamp(n, priceMin, priceMax)
    const next: [number, number] = index === 0 ? [clamped, priceRange[1]] : [priceRange[0], clamped]
    if (next[0] > next[1]) return
    setPriceRange(next)
  }

  return (
    <div
      className={cn(
        'flex flex-col gap-6',
        isMobile && 'h-full overflow-y-auto pb-24'
      )}
    >
      {isMobile && (
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Filters</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 rounded-full"
            aria-label="Close filters"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      <div className="bg-card border border-border/40 rounded-xl p-5">
        <h3 className="font-semibold mb-4 flex items-center gap-2 text-sm tracking-wide">
          <Clock className="w-4 h-4" />
          Opening Hours
        </h3>
        <OpeningHours hours={openingHours} />
      </div>

      <div className="bg-card border border-border/40 rounded-xl p-5">
        <h3 className="font-semibold mb-4 text-sm tracking-wide">Categories</h3>
        <div className="space-y-1.5">
          {categories.map(cat => {
            const active = selectedCategory === cat.value
            return (
              <button
                key={cat.value || 'all'}
                onClick={() => setSelectedCategory(cat.value)}
                className={cn(
                  'w-full rounded-lg px-3 py-2 text-left text-xs sm:text-sm font-medium transition-colors outline-none',
                  'focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-1 focus-visible:ring-offset-background',
                  active
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-muted/40 hover:bg-muted text-foreground'
                )}
                aria-pressed={active}
              >
                {cat.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="bg-card border border-border/40 rounded-xl p-5 space-y-5">
        <div>
          <h3 className="font-semibold mb-3 text-sm tracking-wide">Price Range</h3>
          <div className="flex items-center gap-2">
            <input
              type="number"
              aria-label="Minimum price"
              className="w-24 rounded-md border border-input bg-background p-2 text-xs"
              value={priceRange[0]}
              min={priceMin}
              max={priceRange[1]}
              onChange={e => handlePriceInput(0, e.target.value)}
            />
            <span className="text-muted-foreground text-xs">to</span>
            <input
              type="number"
              aria-label="Maximum price"
              className="w-24 rounded-md border border-input bg-background p-2 text-xs"
              value={priceRange[1]}
              min={priceRange[0]}
              max={priceMax}
              onChange={e => handlePriceInput(1, e.target.value)}
            />
          </div>
          <div className="mt-4 flex flex-col gap-3">
            <input
              type="range"
              min={priceMin}
              max={priceMax}
              value={priceRange[0]}
              onChange={e => setPriceRange([Number(e.target.value), priceRange[1]])}
              aria-label="Minimum price slider"
            />
            <input
              type="range"
              min={priceMin}
              max={priceMax}
              value={priceRange[1]}
              onChange={e => setPriceRange([priceRange[0], Number(e.target.value)])}
              aria-label="Maximum price slider"
            />
            <style jsx>{`
              /* Price range slider theming */
              input[aria-label="Minimum price slider"],
              input[aria-label="Maximum price slider"] {
                accent-color: var(--color-primary);
                cursor: pointer;
              }

              /* WebKit (Chrome / Edge / Safari) */
              input[aria-label="Minimum price slider"]::-webkit-slider-runnable-track,
              input[aria-label="Maximum price slider"]::-webkit-slider-runnable-track {
                background: var(--color-muted);
                height: 0.5rem;
                border-radius: 9999px;
              }
              input[aria-label="Minimum price slider"]::-webkit-slider-thumb,
              input[aria-label="Maximum price slider"]::-webkit-slider-thumb {
                -webkit-appearance: none;
                appearance: none;
                height: 1rem;
                width: 1rem;
                margin-top: -0.25rem;
                background: var(--color-primary);
                border: 2px solid var(--color-primary);
                border-radius: 9999px;
                box-shadow: 0 0 0 2px var(--color-card);
                transition: background .2s, transform .2s;
              }
              input[aria-label="Minimum price slider"]:hover::-webkit-slider-thumb,
              input[aria-label="Maximum price slider"]:hover::-webkit-slider-thumb {
                transform: scale(1.05);
              }
              input[aria-label="Minimum price slider"]:focus-visible::-webkit-slider-thumb,
              input[aria-label="Maximum price slider"]:focus-visible::-webkit-slider-thumb {
                outline: 2px solid color-mix(in oklab, var(--color-primary) 70%, transparent);
                outline-offset: 2px;
              }

              /* Firefox */
              input[aria-label="Minimum price slider"]::-moz-range-track,
              input[aria-label="Maximum price slider"]::-moz-range-track {
                background: var(--color-muted);
                height: 0.5rem;
                border-radius: 9999px;
              }
              input[aria-label="Minimum price slider"]::-moz-range-thumb,
              input[aria-label="Maximum price slider"]::-moz-range-thumb {
                height: 1rem;
                width: 1rem;
                background: var(--color-primary);
                border: 2px solid var(--color-primary);
                border-radius: 9999px;
                box-shadow: 0 0 0 2px var(--color-card);
                transition: background .2s, transform .2s;
              }
              input[aria-label="Minimum price slider"]:hover::-moz-range-thumb,
              input[aria-label="Maximum price slider"]:hover::-moz-range-thumb {
                transform: scale(1.05);
              }
              input[aria-label="Minimum price slider"]:focus-visible::-moz-range-thumb,
              input[aria-label="Maximum price slider"]:focus-visible::-moz-range-thumb {
                outline: 2px solid color-mix(in oklab, var(--color-primary) 70%, transparent);
                outline-offset: 2px;
              }

              /* High contrast / disabled future-proofing */
              input[aria-label="Minimum price slider"][disabled],
              input[aria-label="Maximum price slider"][disabled] {
                cursor: not-allowed;
                opacity: .6;
              }
            `}</style>
            <div className="text-[11px] text-muted-foreground">
              {formatCurrency(priceRange[0])} — {formatCurrency(priceRange[1])}
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-3 text-sm tracking-wide">Availability</h3>
          <div className="flex flex-wrap gap-2">
            {['IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK', 'PREORDER'].map(status => {
              const active = availability.includes(status)
              return (
                <button
                  key={status}
                  onClick={() => toggleAvailability(status)}
                  className={cn(
                    'px-3 py-1.5 rounded-full border text-[11px] font-medium tracking-wide transition-colors',
                    active
                      ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                      : 'bg-muted/40 border-border hover:border-primary/40'
                  )}
                  aria-pressed={active}
                >
                  {capitalize(status.toLowerCase())}
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-3 text-sm tracking-wide">Featured</h3>
          <button
            onClick={() => setFeaturedOnly(!featuredOnly)}
            className={cn(
              'w-full flex items-center justify-between rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
              featuredOnly
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-muted/40 border-border hover:bg-muted'
            )}
            aria-pressed={featuredOnly}
          >
            <span>Show only featured products</span>
            <span
              className={cn(
                'inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold',
                featuredOnly ? 'bg-primary-foreground text-primary' : 'bg-muted text-muted-foreground'
              )}
            >
              {featuredOnly ? '✓' : '✕'}
            </span>
          </button>
        </div>
      </div>

      {isMobile && (
        <div className="sticky bottom-2 left-0 right-0 z-20 mt-4">
          <div className="mx-auto max-w-sm rounded-xl bg-card/90 backdrop-blur border border-border/60 p-2 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => {
                setSelectedCategory('')
                setAvailability([])
                setFeaturedOnly(false)
                setPriceRange([priceMin, priceMax])
              }}
            >
              Reset
            </Button>
            <Button size="sm" className="flex-1" onClick={onClose}>Done</Button>
          </div>
        </div>
      )}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Shop Header                                                                */
/* -------------------------------------------------------------------------- */

function ShopHeader({ shop }: { shop: Shop }) {
  return (
    <section className="relative border-b border-border/50 bg-card/95 backdrop-blur">
      <div className="container mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Image */}
          <div className="relative w-full md:w-56 h-56 rounded-2xl overflow-hidden bg-muted shadow-sm">
            <Image
              src={shop.image || '/placeholder-shop.jpg'}
              alt={shop.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 224px"
              priority
            />
            {shop.isVerified && (
              <div className="absolute top-3 left-3 bg-primary text-primary-foreground text-[11px] font-semibold px-2 py-1 rounded-md shadow">
                Verified
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 space-y-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
                {shop.name}
              </h1>
              <p className="text-sm md:text-base text-muted-foreground max-w-2xl leading-relaxed">
                {shop.description}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                <span className="font-semibold">{shop.rating?.toFixed(1)}</span>
                <span className="text-muted-foreground">
                  ({shop.reviewCount} reviews)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-muted-foreground" />
                <span>{shop.deliveryTime}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-muted-foreground" />
                <span className="truncate max-w-[220px]">{shop.address}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm font-medium">
              {shop.phone && (
                <a
                  href={`tel:${shop.phone}`}
                  className="inline-flex items-center gap-2 text-primary hover:underline"
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
                  className="inline-flex items-center gap-2 text-primary hover:underline"
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
  )
}

/* -------------------------------------------------------------------------- */
/* Main Page Component                                                        */
/* -------------------------------------------------------------------------- */

export default function ShopPage() {
  const params = useParams()
  const shopId = params.shopId as string
  const { isAuthenticated } = useAuth()
  const { addItem } = useCartStore()
  const router = useRouter()
  const searchParams = useSearchParams()

  /* ------------------------------- Data State ------------------------------- */
  const [shop, setShop] = useState<Shop | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  /* ----------------------------- UI / UX State ------------------------------ */
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(
    (searchParams.get('view') as 'grid' | 'list') || 'grid'
  )
  const [showFilters, setShowFilters] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showProductModal, setShowProductModal] = useState(false)

  /* ------------------------------ Filter State ------------------------------ */
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('cat') || '')
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'featured')
  const [availability, setAvailability] = useState<string[]>([])
  const [featuredOnly, setFeaturedOnly] = useState(false)
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 0])

  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])

  /* -------------------------- Derived Helper Values ------------------------- */
  const priceMin = useMemo(
    () => (products.length ? Math.min(...products.map(p => p.price)) : 0),
    [products]
  )
  const priceMax = useMemo(
    () => (products.length ? Math.max(...products.map(p => p.price)) : 0),
    [products]
  )

  // Initialize price range after products load
  useEffect(() => {
    if (products.length) {
      setPriceRange([priceMin, priceMax])
    }
  }, [products, priceMin, priceMax])

  const categories = useMemo(() => {
    if (!products.length) return STATIC_CATEGORY_PRESET
    const set = new Set<string>()
    products.forEach(p => p.category && set.add(p.category))
    const dynamic = Array.from(set).sort().map(c => ({ value: c, label: capitalize(c) }))
    return [{ value: '', label: 'All Products' }, ...dynamic]
  }, [products])

  /* --------------------------- Persist URL State ---------------------------- */
  useEffect(() => {
    const params = new URLSearchParams()
    if (searchQuery) params.set('q', searchQuery)
    if (selectedCategory) params.set('cat', selectedCategory)
    if (sortBy !== 'featured') params.set('sort', sortBy)
    if (viewMode !== 'grid') params.set('view', viewMode)
    const qs = params.toString()
    const url = qs ? `?${qs}` : ''
    // Use replace to avoid stacking history on each keystroke
    router.replace(url, { scroll: false })
  }, [searchQuery, selectedCategory, sortBy, viewMode, router])

  /* ------------------------------- Data Fetch ------------------------------- */
  useEffect(() => {
    let aborted = false
    const controller = new AbortController()

    async function fetchData() {
      setLoading(true)
      setError(null)
      try {
        const shopRes = await fetch(`/api/shops/${shopId}`, { signal: controller.signal })
        const shopJson = await shopRes.json()
        if (!shopJson.success) throw new Error(shopJson.error || 'Failed to fetch shop')

        const prodRes = await fetch(`/api/shops/${shopId}/products?limit=100`, { signal: controller.signal })
        const prodJson = await prodRes.json()
        if (!prodJson.success) throw new Error(prodJson.error || 'Failed to fetch products')

        if (!aborted) {
          setShop(shopJson.data)
          setProducts(prodJson.data.products || [])
        }
      } catch (e: unknown) {
        if (e instanceof DOMException && e.name === 'AbortError') return
        console.error(e)
        const message = e instanceof Error ? e.message : 'Failed to load shop'
        setError(message)
        toast.error('Failed to load shop')
      } finally {
        if (!aborted) setLoading(false)
      }
    }

    if (shopId) fetchData()
    return () => {
      aborted = true
      controller.abort()
    }
  }, [shopId])

  /* ------------------------------- Filtering -------------------------------- */
  useEffect(() => {
    let result = [...products]

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
      )
    }

    if (selectedCategory) {
      result = result.filter(p => p.category === selectedCategory)
    }

    if (availability.length) {
      result = result.filter(p => availability.includes(p.availability))
    }

    if (featuredOnly) {
      result = result.filter(p => p.isFeatured)
    }

    // Price range
    result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1])

    // Sorting
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        result.sort((a, b) => b.price - a.price)
        break
      case 'name-asc':
        result.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'popularity':
        result.sort((a, b) => b.stock - a.stock)
        break
      case 'featured':
      default:
        result.sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured))
        break
    }

    setFilteredProducts(result)
  }, [
    products,
    searchQuery,
    selectedCategory,
    sortBy,
    availability,
    featuredOnly,
    priceRange
  ])

  /* ---------------------------- Add to Cart Logic --------------------------- */
  const handleAddToCart = useCallback(
    async (productId: string, quantity: number = 1, variantId?: string) => {
      try {
        const product = products.find(p => p.id === productId)
        if (!product) throw new Error('Product not found')

        let variant: ProductVariant | undefined
        if (variantId) {
          variant = product.variants?.find(v => v.id === variantId)
        }
        for (let i = 0; i < quantity; i++) {
          await addItem(
            {
              id: `${productId}-${variantId || 'default'}`,
              productId,
              variantId,
              name: product.name,
              price: variant?.price || product.price,
              image: product.images[0] || '/placeholder-product.jpg',
              maxQuantity: variant?.stock || product.stock,
              variant: variant
                ? { id: variant.id, name: variant.name, value: variant.value }
                : undefined,
              metadata: {
                weight: product.weight,
                origin: product.origin,
                vendor: product.vendor
              }
            },
            isAuthenticated
          )
        }
        toast.success('Added to cart')
        return { success: true }
      } catch (e) {
        console.error(e)
        toast.error('Failed to add to cart')
        return { success: false }
      }
    },
    [addItem, isAuthenticated, products]
  )

  /* ---------------------------- Product Modal Open -------------------------- */
  const openProduct = (p: Product) => {
    setSelectedProduct(p)
    setShowProductModal(true)
  }

  /* ---------------------------- Reset Filters Helper ------------------------ */
  const resetFilters = useCallback(() => {
    setSearchQuery('')
    setSelectedCategory('')
    setAvailability([])
    setFeaturedOnly(false)
    setPriceRange([priceMin, priceMax])
    setSortBy('featured')
  }, [priceMin, priceMax])

  /* ---------------------------- Accessibility Live -------------------------- */
  const productsCountRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    if (productsCountRef.current) {
      productsCountRef.current.textContent = `${filteredProducts.length} products`
    }
  }, [filteredProducts.length])

  /* ------------------------------- Render Paths ----------------------------- */

  if (loading) return <LoadingSkeleton />

  if (error || !shop) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <Package className="w-16 h-16 text-muted-foreground mx-auto mb-5" />
          <h2 className="text-2xl font-bold mb-2 tracking-tight">Shop not found</h2>
          <p className="text-sm text-muted-foreground mb-6">
            {error || 'The shop you are looking for does not exist or is unavailable.'}
          </p>
          <Button onClick={() => window.history.back()} variant="outline">
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-background">
      {/* Background subtle pattern */}
      <div className="pointer-events-none fixed inset-0 opacity-[0.015]">
        <div
          className="h-full w-full"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23FC8120' fill-opacity='1'%3E%3Cpath d='M40 0 50 30 80 40 50 50 40 80 30 50 0 40 30 30z'/%3E%3C/g%3E%3C/svg%3E\")",
            backgroundSize: '80px 80px'
          }}
        />
      </div>

      <ShopHeader shop={shop} />

      {/* Top Controls (Sticky) */}
      <div className="sticky top-0 z-30 border-b border-border/50 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <div className="container mx-auto px-4 py-4 flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="flex-1 flex items-center gap-4">
            <div className="flex-1">
              <SearchBar
                placeholder="Search products..."
                onSearch={val => setSearchQuery(val)}
                value={searchQuery}
                icon={<Search className="text-primary" size={18} />}
              />
            </div>
            <div
              ref={productsCountRef}
              aria-live="polite"
              className="hidden sm:block text-xs font-medium px-2 py-1 rounded-md bg-muted text-muted-foreground"
            >
              {filteredProducts.length} products
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="text-xs font-medium text-muted-foreground">View</div>
              <div className="flex overflow-hidden rounded-md border border-border">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    'p-2 transition-colors',
                    viewMode === 'grid'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-background hover:bg-muted text-foreground'
                  )}
                  aria-label="Grid view"
                  aria-pressed={viewMode === 'grid'}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    'p-2 transition-colors',
                    viewMode === 'list'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-background hover:bg-muted text-foreground'
                  )}
                  aria-label="List view"
                  aria-pressed={viewMode === 'list'}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="sort" className="text-xs font-medium text-muted-foreground">
                Sort
              </label>
              <select
                id="sort"
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="text-xs sm:text-sm rounded-md border border-input bg-background px-2 py-2 outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                {SHOP_SORT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(true)}
              className="lg:hidden flex items-center gap-2"
              aria-expanded={showFilters}
              aria-controls="mobile-filters"
            >
              <Filter className="w-4 h-4" />
              Filters
            </Button>

            {(searchQuery || selectedCategory || availability.length || featuredOnly ||
              priceRange[0] !== priceMin || priceRange[1] !== priceMax || sortBy !== 'featured') && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetFilters}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Reset
                </Button>
              )}
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8 relative z-10">
        <div className="flex flex-col lg:flex-row gap-10 items-start">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-72 shrink-0">
            <div className="sticky top-28 space-y-8">
              <FiltersPanel
                categories={categories}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                availability={availability}
                setAvailability={setAvailability}
                featuredOnly={featuredOnly}
                setFeaturedOnly={setFeaturedOnly}
                priceMin={priceMin}
                priceMax={priceMax}
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                openingHours={shop.openingHours}
              />
            </div>
          </aside>

          {/* Mobile Filters Drawer */}
          {showFilters && (
            <div
              id="mobile-filters"
              className="fixed inset-0 z-40 lg:hidden"
              role="dialog"
              aria-modal="true"
            >
              <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={() => setShowFilters(false)}
              />
              <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] rounded-t-2xl bg-background border-t border-border/60 p-6 shadow-xl animate-in slide-in-from-bottom">
                <FiltersPanel
                  categories={categories}
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  availability={availability}
                  setAvailability={setAvailability}
                  featuredOnly={featuredOnly}
                  setFeaturedOnly={setFeaturedOnly}
                  priceMin={priceMin}
                  priceMax={priceMax}
                  priceRange={priceRange}
                  setPriceRange={setPriceRange}
                  onClose={() => setShowFilters(false)}
                  isMobile
                  openingHours={shop.openingHours}
                />
              </div>
            </div>
          )}

          {/* Product Listing */}
          <section className="flex-1">
            {filteredProducts.length === 0 ? (
              <EmptyState reset={resetFilters} />
            ) : (
              <div
                className={cn(
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6'
                    : 'flex flex-col gap-6'
                )}
              >
                {filteredProducts.map(product => (
                  <div key={product.id}>
                    <ProductCard
                      product={product}
                      className={viewMode === 'list' ? 'flex flex-row' : ''}
                      showQuickAdd
                      viewMode={viewMode}
                      onClick={() => openProduct(product)}
                    />
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Product Modal */}
      <ProductDetailsModal
        product={
          selectedProduct
            ? {
              ...selectedProduct,
              rating: selectedProduct.rating ?? 4.5,
              reviewCount: selectedProduct.reviewCount ?? 23
            }
            : null
        }
        isOpen={showProductModal}
        onClose={() => setShowProductModal(false)}
        onAddToCart={handleAddToCart}
      />
    </div>
  )
}
