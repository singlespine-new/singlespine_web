'use client'

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  KeyboardEvent as ReactKeyboardEvent
} from 'react'
import {
  X,
  Plus,
  Minus,
  ShoppingCart,
  Star,
  Truck,
  Package,
  Heart,
  Share2
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import toast from '@/components/ui/toast'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { Product, ProductVariant } from '@/types'
import { getMockShopById } from '@/data/mockData'
import { useCartStore } from '@/lib/store/cart'
import { useWishlistStore } from '@/lib/store/wishlist'
import { useAuth } from '@/lib/auth-utils'

interface ProductDetailsModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
  onAddToCart?: (productId: string, quantity: number, variantId?: string) => void // still accepted but handled internally
}

/* --------------------------------- Helpers --------------------------------- */

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max)

const formatCurrency = (value: number) => `₵${value.toFixed(2)}`

/* ---------------------------- Sub Presentational --------------------------- */

function RatingStars({ rating }: { rating?: number }) {
  if (!rating) return null
  return (
    <div className="flex items-center gap-2 mb-2">
      <div className="flex items-center">
        {Array.from({ length: 5 }).map((_, i) => {
          const filled = i < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : 'text-muted-foreground/30'
          return <Star key={i} className={cn('w-4 h-4', filled)} />
        })}
      </div>
      <span className="text-xs font-medium text-muted-foreground">
        {rating.toFixed(1)}
      </span>
    </div>
  )
}

interface VariantSelectorProps {
  variants: ProductVariant[]
  selected: ProductVariant | null
  basePrice: number
  onSelect: (v: ProductVariant) => void
}

function VariantSelector({
  variants,
  selected,
  basePrice,
  onSelect
}: VariantSelectorProps) {
  if (!variants?.length) return null
  const groupLabel = variants[0]?.name || 'Options'
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold tracking-wide text-foreground">
        {groupLabel}
      </h3>
      <div className="flex flex-wrap gap-2">
        {variants.map(v => {
          const isActive = selected?.id === v.id
          const priceDelta =
            v.price && v.price !== basePrice
              ? ` (+${formatCurrency(v.price - basePrice)})`
              : ''
          return (
            <button
              key={v.id}
              type="button"
              onClick={() => onSelect(v)}
              className={cn(
                'relative px-3 py-2 rounded-lg border text-xs sm:text-sm font-medium transition-colors outline-none',
                'focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-1 focus-visible:ring-offset-background',
                isActive
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                  : 'border-border bg-background hover:border-primary/60 hover:bg-muted/60'
              )}
              aria-pressed={isActive}
              aria-label={`${v.value}${priceDelta}`}
            >
              {v.value}
              {v.price && v.price !== basePrice && (
                <span className="ml-1 text-[11px] opacity-80">
                  (+{formatCurrency(v.price - basePrice)})
                </span>
              )}
              {isActive && (
                <span className="pointer-events-none absolute inset-0 rounded-lg ring-2 ring-primary/40 animate-in fade-in" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

interface QuantityInputProps {
  value: number
  max: number
  onChange: (q: number) => void
}

function QuantityInput({ value, max, onChange }: QuantityInputProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold tracking-wide text-foreground">
        Quantity
      </h3>
      <div className="flex items-center gap-4">
        <div className="group flex items-center rounded-lg border border-border bg-background">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onChange(value - 1)}
            disabled={value <= 1}
            className="p-0 w-10 h-10 rounded-l-lg data-[disabled=true]:opacity-40"
            aria-label="Decrease quantity"
          >
            <Minus className="w-4 h-4" />
          </Button>
          <input
            type="number"
            inputMode="numeric"
            aria-label="Quantity"
            value={value}
            min={1}
            max={max}
            onChange={(e) =>
              onChange(clamp(parseInt(e.target.value) || 1, 1, max))
            }
            className="w-14 text-center bg-transparent text-sm font-medium outline-none focus-visible:ring-0"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onChange(value + 1)}
            disabled={value >= max}
            className="p-0 w-10 h-10 rounded-r-lg data-[disabled=true]:opacity-40"
            aria-label="Increase quantity"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <span className="text-xs sm:text-sm text-muted-foreground">
          {max} available
        </span>
      </div>
    </div>
  )
}

function AvailabilityBadge({
  availability,
  stock
}: {
  availability: string
  stock: number
}) {
  const info = (() => {
    if (availability === 'OUT_OF_STOCK' || stock === 0)
      return { label: 'Out of Stock', cls: 'text-destructive' }
    if (stock < 5)
      return { label: `Only ${stock} left`, cls: 'text-orange-500' }
    return { label: 'In Stock', cls: 'text-green-600 dark:text-green-400' }
  })()
  return (
    <span
      className={cn(
        'text-xs font-semibold tracking-wide',
        'px-2 py-1 rounded-full bg-muted/60',
        info.cls
      )}
      aria-live="polite"
    >
      {info.label}
    </span>
  )
}

/* ------------------------------ Main Component ------------------------------ */

export default function ProductDetailsModal({
  product,
  isOpen,
  onClose
}: ProductDetailsModalProps) {
  const { addItem } = useCartStore()
  const {
    addItem: addToWishlist,
    removeItem: removeFromWishlist,
    isItemInWishlist
  } = useWishlistStore()
  const { isAuthenticated } = useAuth()

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    null
  )
  const [quantity, setQuantity] = useState(1)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isAddingToCart, setIsAddingToCart] = useState(false)

  // Refs for a11y / focus management
  const dialogRef = useRef<HTMLDivElement | null>(null)
  const firstInteractiveRef = useRef<HTMLButtonElement | null>(null)
  const previouslyFocusedEl = useRef<Element | null>(null)
  const thumbnailsContainerRef = useRef<HTMLDivElement | null>(null)

  const isFavorited = product
    ? isItemInWishlist(product.id, selectedVariant?.id)
    : false

  const currentPrice = selectedVariant?.price || product?.price || 0
  const currentStock = selectedVariant?.stock || product?.stock || 0
  const maxQuantity = Math.min(currentStock, 10)

  /* ----------------------------- Derived Utilities ----------------------------- */

  const deliveryTime = (() => {
    if (product?.shopId) {
      const shop = getMockShopById(product.shopId)
      return shop?.deliveryTime || '30-45 min'
    }
    return '30-45 min'
  })()

  const savings =
    product?.comparePrice && product.comparePrice > currentPrice
      ? product.comparePrice - currentPrice
      : 0

  const discountPct =
    product?.comparePrice && product.comparePrice > currentPrice
      ? Math.round(
        ((product.comparePrice - currentPrice) / product.comparePrice) * 100
      )
      : 0

  /* ---------------------------------- Effects --------------------------------- */

  // Reset when product changes
  useEffect(() => {
    if (product) {
      setSelectedVariant(product.variants?.[0] || null)
      setQuantity(1)
      setSelectedImageIndex(0)
    }
  }, [product])

  // Sync wishlist with backend when auth changes
  useEffect(() => {
    if (isAuthenticated) {
      const { syncWithBackend } = useWishlistStore.getState()
      syncWithBackend()
    }
  }, [isAuthenticated])

  // Open / close side effects
  useEffect(() => {
    if (!isOpen) return
    previouslyFocusedEl.current = document.activeElement
    const body = document.body
    const prevOverflow = body.style.overflow
    body.style.overflow = 'hidden'
    // Focus first actionable
    setTimeout(() => {
      firstInteractiveRef.current?.focus()
    }, 30)

    return () => {
      body.style.overflow = prevOverflow
      if (previouslyFocusedEl.current instanceof HTMLElement) {
        previouslyFocusedEl.current.focus()
      }
    }
  }, [isOpen])

  // Escape + focus trap
  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
      if (e.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input:not([disabled]), select, [tabindex]:not([tabindex="-1"])'
        )
        if (!focusable.length) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault()
            last.focus()
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault()
            first.focus()
          }
        }
      }
      if (
        (e.key === 'ArrowRight' || e.key === 'ArrowLeft') &&
        thumbnailsContainerRef.current
      ) {
        // Keyboard navigation for images
        setSelectedImageIndex(prev => {
          const total = product?.images.length || 0
          if (total === 0) return prev
          if (e.key === 'ArrowRight') return (prev + 1) % total
          return (prev - 1 + total) % total
        })
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose, product?.images])

  /* --------------------------------- Handlers --------------------------------- */

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleQuantityChange = (q: number) => {
    setQuantity(clamp(q, 1, maxQuantity))
  }

  const handleAddToCart = async () => {
    if (!product) return
    setIsAddingToCart(true)
    try {
      await addItem(
        {
          id: `${product.id}-${selectedVariant?.id || 'default'}`,
          productId: product.id,
          variantId: selectedVariant?.id,
          name: product.name,
          price: currentPrice,
          image: product.images[0] || '/placeholder-product.jpg',
          maxQuantity: currentStock,
          variant: selectedVariant
            ? {
              id: selectedVariant.id,
              name: selectedVariant.name,
              value: selectedVariant.value
            }
            : undefined,
          metadata: {
            weight: product.weight,
            origin: product.origin,
            vendor: product.vendor
          }
        },
        isAuthenticated,
        quantity
      )
      toast.success(
        `${quantity} ${quantity === 1 ? 'item' : 'items'} added to your cart`,
        { icon: <ShoppingCart className="w-5 h-5" /> }
      )
    } catch (err) {
      console.error(err)
      toast.error('Failed to add to cart')
    } finally {
      setIsAddingToCart(false)
    }
  }

  const handleWishlistToggle = () => {
    if (!product) return
    if (!isAuthenticated) {
      toast.error('Please sign in to manage your wishlist')
      return
    }
    if (isFavorited) {
      removeFromWishlist(product.id, selectedVariant?.id)
    } else {
      addToWishlist({
        id: `${product.id}-${selectedVariant?.id || 'default'}`,
        productId: product.id,
        variantId: selectedVariant?.id,
        name: product.name,
        price: currentPrice,
        comparePrice: product.comparePrice,
        image: product.images[0] || '/placeholder-product.jpg',
        category: product.category,
        availability: product.availability,
        stock: currentStock,
        isFeatured: product.isFeatured,
        variant: selectedVariant
          ? {
            id: selectedVariant.id,
            name: selectedVariant.name,
            value: selectedVariant.value
          }
          : undefined,
        metadata: {
          weight: product.weight,
          origin: product.origin,
          vendor: product.vendor,
          shopId: product.shopId
        }
      })
    }
  }

  const handleShare = async () => {
    if (!product) return
    try {
      if (navigator.share) {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href
        })
      } else {
        await navigator.clipboard.writeText(window.location.href)
        toast.success('Link copied to clipboard')
      }
    } catch {
      // user aborted or not supported
    }
  }

  const handleThumbnailKey = (
    e: ReactKeyboardEvent<HTMLButtonElement>,
    index: number
  ) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setSelectedImageIndex(index)
    }
  }

  const setVariant = useCallback(
    (v: ProductVariant) => {
      setSelectedVariant(v)
      // Reset quantity to 1 if selected variant has less stock than current quantity
      setQuantity(q => clamp(q, 1, Math.min(v.stock, 10)))
    },
    []
  )

  /* --------------------------------- Early Exit -------------------------------- */

  if (!isOpen || !product) return null

  /* ---------------------------------- Render ---------------------------------- */

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-start sm:items-center justify-center px-3 py-6 sm:p-6',
        'bg-black/50 backdrop-blur-sm',
        'animate-in fade-in duration-150'
      )}
      role="dialog"
      aria-modal="true"
      aria-label="Product details"
      onMouseDown={handleOverlayClick}
    >
      <div
        ref={dialogRef}
        className={cn(
          'relative w-full max-w-5xl overflow-hidden rounded-2xl shadow-xl border border-border',
          'bg-card text-card-foreground',
          'animate-in zoom-in-95 fade-in slide-in-from-top-4 duration-200'
        )}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between gap-2 border-b border-border/60 bg-card/95 px-5 py-4 backdrop-blur supports-[backdrop-filter]:bg-card/80">
          <h2 className="text-base sm:text-lg font-semibold tracking-tight">
            Product Details
          </h2>
          <div className="flex items-center gap-1.5">
            <Button
              ref={firstInteractiveRef}
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="h-9 w-9 p-0 rounded-full hover:bg-muted"
              aria-label="Share product"
            >
              <Share2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleWishlistToggle}
              className={cn(
                'h-9 w-9 p-0 rounded-full hover:bg-muted relative transition',
                isFavorited && 'text-red-500'
              )}
              aria-pressed={isFavorited}
              aria-label={isFavorited ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart
                className={cn(
                  'w-5 h-5 transition-colors',
                  isFavorited
                    ? 'fill-red-500 text-red-500'
                    : 'text-muted-foreground'
                )}
              />
              <span className="sr-only">
                {isFavorited ? 'Remove from wishlist' : 'Add to wishlist'}
              </span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-9 w-9 p-0 rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-8 p-6 overflow-y-auto max-h-[calc(100vh-5rem)]">
          {/* Images */}
          <div className="flex flex-col gap-5">
            <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-muted">
              <Image
                key={product.images[selectedImageIndex] || 'placeholder'}
                src={
                  product.images[selectedImageIndex] ||
                  '/placeholder-product.jpg'
                }
                alt={product.name}
                fill
                className="object-cover animate-in fade-in"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
              {discountPct > 0 && (
                <div className="absolute top-4 left-4 rounded-md bg-destructive px-2 py-1 text-[11px] font-semibold tracking-wide text-destructive-foreground shadow">
                  -{discountPct}%
                </div>
              )}
              {product.isFeatured && (
                <div className="absolute top-4 right-4 rounded-md bg-primary px-2 py-1 text-[11px] font-semibold tracking-wide text-primary-foreground shadow">
                  Featured
                </div>
              )}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1">
                {product.images.map((_, i) => (
                  <span
                    key={i}
                    className={cn(
                      'h-1.5 w-4 rounded-full bg-white/40 transition-all',
                      i === selectedImageIndex && 'bg-white/90 w-6'
                    )}
                    aria-hidden="true"
                  />
                ))}
              </div>
            </div>

            {product.images.length > 1 && (
              <div
                ref={thumbnailsContainerRef}
                className="flex gap-3 overflow-x-auto pb-1"
                aria-label="Product images"
              >
                {product.images.map((img, i) => {
                  const active = i === selectedImageIndex
                  return (
                    <button
                      key={img + i}
                      type="button"
                      onClick={() => setSelectedImageIndex(i)}
                      onKeyDown={(e) => handleThumbnailKey(e, i)}
                      className={cn(
                        'relative aspect-square h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border transition',
                        active
                          ? 'border-primary ring-2 ring-primary/40'
                          : 'border-border hover:border-primary/60 hover:bg-muted/40'
                      )}
                      aria-label={`View image ${i + 1}`}
                      aria-current={active}
                      tabIndex={0}
                    >
                      <Image
                        src={img}
                        alt={`${product.name} ${i + 1}`}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col gap-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1 max-w-[70%]">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight leading-snug">
                    {product.name}
                  </h1>
                  {product.vendor && (
                    <Link
                      href={`/shop/${encodeURIComponent(
                        product.vendor.toLowerCase().replace(/\s+/g, '-')
                      )}`}
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      by {product.vendor}
                    </Link>
                  )}
                  <RatingStars rating={product.rating} />
                </div>
                <AvailabilityBadge
                  availability={product.availability}
                  stock={currentStock}
                />
              </div>

              <p className="text-sm leading-relaxed text-muted-foreground line-clamp-[10]">
                {product.description}
              </p>
            </div>

            {/* Pricing */}
            <div className="space-y-1">
              <div className="flex items-end gap-3 flex-wrap">
                <span className="text-3xl font-bold tracking-tight">
                  {formatCurrency(currentPrice)}
                </span>
                {product.comparePrice &&
                  product.comparePrice > currentPrice && (
                    <span className="text-lg font-medium text-muted-foreground line-through">
                      {formatCurrency(product.comparePrice)}
                    </span>
                  )}
                {savings > 0 && (
                  <span className="rounded-full bg-secondary px-2 py-1 text-xs font-semibold text-secondary-foreground">
                    Save {formatCurrency(savings)}
                  </span>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                Inclusive of VAT (where applicable)
              </div>
            </div>

            {/* Variants */}
            {product.variants?.length ? (
              <VariantSelector
                variants={product.variants}
                selected={selectedVariant}
                basePrice={product.price}
                onSelect={setVariant}
              />
            ) : null}

            {/* Quantity */}
            <QuantityInput
              value={quantity}
              max={maxQuantity}
              onChange={handleQuantityChange}
            />

            {/* Actions */}
            <div className="space-y-4">
              <Button
                onClick={handleAddToCart}
                disabled={
                  isAddingToCart ||
                  product.availability === 'OUT_OF_STOCK' ||
                  currentStock === 0
                }
                className="w-full h-12 font-semibold text-sm sm:text-base relative overflow-hidden"
                size="lg"
                aria-live="polite"
              >
                {isAddingToCart ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Adding...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    Add to Cart · {formatCurrency(currentPrice * quantity)}
                  </div>
                )}
              </Button>

              <div className="flex items-center justify-between rounded-lg border border-border/70 bg-muted/40 px-4 py-3 text-xs sm:text-sm">
                <div className="flex items-center gap-2 font-medium text-foreground">
                  <Truck className="h-4 w-4 text-primary" />
                  Delivery: {deliveryTime}
                </div>
                {product.weight && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Package className="h-4 w-4" />
                    {product.weight}kg
                  </div>
                )}
              </div>
            </div>

            {/* Meta */}
            <div className="grid gap-2 text-xs sm:text-sm">
              {product.origin && (
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Origin</span>
                  <span className="font-medium">{product.origin}</span>
                </div>
              )}
              {product.category && (
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Category</span>
                  <span className="font-medium capitalize">
                    {product.category.replace(/-/g, ' ')}
                  </span>
                </div>
              )}
              {product.tags?.length > 0 && (
                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground">Tags</span>
                  <div className="flex flex-wrap gap-1.5">
                    {product.tags.map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
