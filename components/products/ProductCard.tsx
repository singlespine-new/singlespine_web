'use client'

import { useState, useCallback, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { makeIcon } from '@/components/ui/icon'

/* Icon adapters generated via makeIcon utility for consistency and reduced boilerplate */
const Heart = makeIcon('heart', { size: 20 })
const Package = makeIcon('package', { size: 20 })
const ShoppingCart = makeIcon('cart', { size: 20 })
const Star = makeIcon('star', { size: 16 })
const Truck = makeIcon('truck', { size: 18 })
const MapPin = makeIcon('location', { size: 16 })
const Clock = makeIcon('clock', { size: 16 })

import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { Product } from '@/types'
import { buildShopHref } from '@/lib/shopSlug'
import { useAuth, triggerAuth } from '@/lib/auth-utils'
import { useCartStore } from '@/lib/store/cart'
import { useWishlistStore } from '@/lib/store/wishlist'
import toast from '@/components/ui/toast'

interface ProductCardProps {
  product: Product
  className?: string
  showQuickAdd?: boolean
  viewMode?: 'grid' | 'list'
  onClickAction?: (product: Product) => void
}

/* -------------------------------------------------------------------------- */
/* Utilities                                                                  */
/* -------------------------------------------------------------------------- */

const formatCurrency = (value: number) => `₵${value.toFixed(2)}`


function calcDiscount(comparePrice?: number | null, price?: number) {
  if (!comparePrice || !price || comparePrice <= price) return 0
  return Math.round(((comparePrice - price) / comparePrice) * 100)
}

function vendorSlugFromProduct(product: Product) {
  // Pass a ProductLike-compatible subset (avoids full Product type mismatch)
  return buildShopHref({ vendor: product.vendor, shopId: product.shopId })
}

const AVAILABILITY_STYLES: Record<
  string,
  { label: string; badge: string; subtle?: string }
> = {
  IN_STOCK: {
    label: 'In Stock',
    badge:
      'text-green-600 dark:text-green-400 bg-green-100/70 dark:bg-green-500/10 border-green-300/50'
  },
  LOW_STOCK: {
    label: 'Low Stock',
    badge:
      'text-amber-600 dark:text-amber-400 bg-amber-100/70 dark:bg-amber-500/10 border-amber-300/50'
  },
  OUT_OF_STOCK: {
    label: 'Out of Stock',
    badge:
      'text-destructive bg-destructive/10 border-destructive/30 dark:text-destructive dark:bg-destructive/15'
  },
  PREORDER: {
    label: 'Pre‑order',
    badge:
      'text-blue-600 dark:text-blue-400 bg-blue-100/70 dark:bg-blue-500/10 border-blue-300/50'
  }
}

/* -------------------------------------------------------------------------- */
/* Sub Components                                                             */
/* -------------------------------------------------------------------------- */

function RatingBadge({ rating, reviewCount, compact = false }: { rating?: number; reviewCount?: number; compact?: boolean }) {
  if (!rating) return null
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-md bg-secondary/60 px-2 py-0.5 text-xs font-semibold text-secondary-foreground',
        compact && 'px-1.5 py-0 gap-0.5'
      )}
    >
      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
      <span>{rating.toFixed(1)}</span>
      {reviewCount ? (
        <span className="ml-0.5 font-normal text-muted-foreground">
          ({reviewCount})
        </span>
      ) : null}
    </div>
  )
}

function PriceBlock({
  price,
  comparePrice,
  size = 'md'
}: {
  price: number
  comparePrice?: number | null
  size?: 'sm' | 'md' | 'lg'
}) {
  const discount = calcDiscount(comparePrice, price)
  const baseClasses =
    size === 'lg'
      ? 'text-2xl'
      : size === 'sm'
        ? 'text-sm'
        : 'text-base sm:text-lg'
  return (
    <div className="flex items-baseline gap-2">
      <span
        className={cn(
          baseClasses,
          'font-bold tracking-tight text-foreground'
        )}
      >
        {formatCurrency(price)}
      </span>
      {comparePrice && comparePrice > price && (
        <span className="text-xs sm:text-sm text-muted-foreground line-through">
          {formatCurrency(comparePrice)}
        </span>
      )}
      {discount > 0 && (
        <span className="rounded-full bg-destructive px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold tracking-wide text-destructive-foreground shadow-sm">
          -{discount}%
          <span className="sr-only"> discount</span>
        </span>
      )}
    </div>
  )
}

function WishlistButton({
  active,
  onToggle,
  size = 'md'
}: {
  active: boolean
  onToggle: (e: React.MouseEvent) => void
  size?: 'sm' | 'md'
}) {
  return (
    <button
      onClick={onToggle}
      aria-pressed={active}
      aria-label={active ? 'Remove from wishlist' : 'Add to wishlist'}
      className={cn(
        'rounded-full backdrop-blur-sm transition-all border relative inline-flex items-center justify-center outline-none',
        'focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-1 focus-visible:ring-offset-background',
        size === 'sm'
          ? 'h-8 w-8 text-xs'
          : 'h-9 w-9',
        active
          ? 'text-red-500 border-red-300/60 bg-red-50/80 dark:bg-red-500/10'
          : 'text-muted-foreground hover:text-red-500 border-border/60 bg-card/80 hover:bg-card'
      )}
    >
      <Heart
        className={cn(
          'h-4 w-4 transition-colors',
          active && 'fill-current'
        )}
      />
    </button>
  )
}

function AvailabilityBadge({
  status,
  stock
}: {
  status: string
  stock: number
}) {
  const style = AVAILABILITY_STYLES[status] || AVAILABILITY_STYLES['IN_STOCK']
  const low = status === 'LOW_STOCK' && stock > 0
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium tracking-wide',
        style.badge
      )}
    >
      {style.label}
      {low && (
        <span className="ml-1 font-normal opacity-80">
          • {stock}
        </span>
      )}
    </span>
  )
}

function ImageSkeleton({ iconSize = 'h-10 w-10' }: { iconSize?: string }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-muted/30 animate-pulse">
      <Package className={cn(iconSize, 'text-muted-foreground/40')} />
    </div>
  )
}

interface InternalCardProps {
  product: Product
  handleCardClick: () => void
  handleWishlist: (e: React.MouseEvent) => void
  handleQuickAdd: (e: React.MouseEvent) => void
  isWishlisted: boolean
  isLoading: boolean
  showQuickAdd: boolean
  isOutOfStock: boolean
  isLowStock: boolean
}
/* -------------------------------------------------------------------------- */
/* List Layout                                                                */
/* -------------------------------------------------------------------------- */

function ListLayout(props: InternalCardProps) {
  const {
    product,
    handleCardClick,
    handleWishlist,
    handleQuickAdd,
    isWishlisted,
    isLoading,
    showQuickAdd,
    isOutOfStock,
    isLowStock
  } = props

  const [imageLoading, setImageLoading] = useState(true)

  const availabilityStatus = product.availability
  const discount = calcDiscount(product.comparePrice, product.price)

  return (
    <div
      className={cn(
        'group relative flex cursor-pointer overflow-hidden rounded-2xl border border-border/60 bg-card/95 backdrop-blur-sm',
        'transition-all duration-300 hover:border-primary/30 hover:shadow-lg'
      )}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleCardClick()
        }
      }}
      aria-label={`View details for ${product.name}`}
    >
      {/* Image */}
      <div className="relative h-48 w-64 shrink-0 overflow-hidden">
        {imageLoading && <ImageSkeleton iconSize="h-8 w-8" />}
        <Image
          src={product.images[0] || '/placeholder-product.jpg'}
          alt={product.name}
          fill
          priority={false}
          className={cn(
            'object-cover transition-transform duration-500 group-hover:scale-105',
            imageLoading ? 'opacity-0' : 'opacity-100'
          )}
          onLoad={() => setImageLoading(false)}
          onError={() => setImageLoading(false)}
          sizes="256px"
        />
        {/* Overlays */}
        <div className="absolute left-3 top-3 flex flex-col gap-2">
          {product.isFeatured && (
            <div className="inline-flex items-center gap-1 rounded-full bg-primary/90 px-3 py-1 text-[11px] font-semibold text-primary-foreground shadow backdrop-blur">
              <Star className="h-3 w-3" />
              Featured
            </div>
          )}
          {discount > 0 && (
            <div className="rounded-full bg-destructive/90 px-3 py-1 text-[11px] font-semibold text-destructive-foreground shadow backdrop-blur">
              -{discount}%
            </div>
          )}
        </div>
        {/* Wishlist */}
        <div className="absolute right-3 top-3">
          <WishlistButton
            active={isWishlisted}
            onToggle={handleWishlist}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col justify-between p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1 space-y-1">
              <Link
                href={`/products/${product.slug}`}
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="line-clamp-2 text-xl font-bold leading-tight tracking-tight text-foreground transition-colors hover:text-primary">
                  {product.name}
                </h3>
              </Link>
              <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                {product.shortDescription || product.description}
              </p>
            </div>
            <RatingBadge
              rating={product.rating}
              reviewCount={product.reviewCount}
            />
          </div>

          {/* Meta */}
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
            {product.origin && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {product.origin}
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <Truck className="h-4 w-4" />
              30–45 min
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span className="capitalize">
                {product.category.replace('-', ' ')}
              </span>
            </span>
          </div>

          {/* Availability */}
          <div className="flex items-center gap-2">
            <AvailabilityBadge
              status={availabilityStatus}
              stock={product.stock}
            />
            {isLowStock && !isOutOfStock && (
              <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                Only {product.stock} left
              </span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-4">
          <div className="space-y-1">
            <PriceBlock
              price={product.price}
              comparePrice={product.comparePrice}
              size="md"
            />
            {product.vendor && (
              <Link
                href={vendorSlugFromProduct(product)}
                className="text-xs text-muted-foreground hover:text-primary"
                onClick={(e) => e.stopPropagation()}
              >
                by {product.vendor}
              </Link>
            )}
          </div>
          {showQuickAdd && !isOutOfStock && (
            <Button
              onClick={handleQuickAdd}
              disabled={isLoading}
              className="h-10 rounded-xl px-5 font-semibold shadow-sm transition-all hover:shadow-md"
            >
              {isLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground" />
              ) : (
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  Add
                </div>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Grid Layout                                                                */
/* -------------------------------------------------------------------------- */

function GridLayout(props: InternalCardProps) {
  const {
    product,
    handleCardClick,
    handleWishlist,
    handleQuickAdd,
    isWishlisted,
    isLoading,
    showQuickAdd,
    isOutOfStock,

  } = props

  const [imageLoading, setImageLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const discount = calcDiscount(product.comparePrice, product.price)
  const availabilityStatus = product.availability

  const onSwitchImage = (index: number) => {
    setCurrentImageIndex(index)
  }

  return (
    <div
      className={cn(
        'group relative cursor-pointer overflow-hidden rounded-2xl border border-border/60 bg-card/95 backdrop-blur-sm',
        'transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl'
      )}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      aria-label={`View details for ${product.name}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleCardClick()
        }
      }}
    >
      {/* Image */}
      <div className="relative aspect-square w-full overflow-hidden bg-secondary/20">
        {imageLoading && <ImageSkeleton iconSize="h-12 w-12" />}
        {product.images.length > 0 ? (
          <Image
            src={
              product.images[currentImageIndex] || '/placeholder-product.jpg'
            }
            alt={product.name}
            fill
            className={cn(
              'object-cover transition-transform duration-500 group-hover:scale-110',
              imageLoading ? 'opacity-0' : 'opacity-100'
            )}
            onLoad={() => setImageLoading(false)}
            onError={() => setImageLoading(false)}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-secondary/30">
            <Package className="h-12 w-12 text-secondary-foreground/50" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Badges */}
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {product.isFeatured && (
            <div className="inline-flex items-center gap-1 rounded-md bg-primary/90 px-2 py-0.5 text-[10px] font-semibold text-primary-foreground shadow backdrop-blur">
              <Star className="h-3 w-3" />
              Featured
            </div>
          )}
          {discount > 0 && (
            <div className="rounded-md bg-destructive/90 px-2 py-0.5 text-[10px] font-semibold text-destructive-foreground shadow backdrop-blur">
              -{discount}%
            </div>
          )}
        </div>

        {/* Action top-right */}
        <div className="absolute right-2 top-2">
          <WishlistButton
            active={isWishlisted}
            onToggle={handleWishlist}
            size="sm"
          />
        </div>

        {/* Hover actions (bottom) */}
        <div className="absolute inset-x-2 bottom-2 flex gap-1 opacity-0 translate-y-2 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          {showQuickAdd && !isOutOfStock && (
            <Button
              size="sm"
              disabled={isLoading}
              onClick={handleQuickAdd}
              className="flex-1 h-7 bg-primary/90 text-primary-foreground backdrop-blur-sm hover:bg-primary shadow-sm"
            >
              {isLoading ? (
                <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <div className="flex items-center gap-1 text-xs font-semibold">
                  <ShoppingCart className="h-3 w-3" />
                  Add
                </div>
              )}
            </Button>
          )}
        </div>

        {/* Image indicators */}
        {product.images.length > 1 && (
          <div className="absolute bottom-9 left-1/2 flex -translate-x-1/2 gap-1">
            {product.images.slice(0, 4).map((_, i) => {
              const active = i === currentImageIndex
              return (
                <button
                  key={i}
                  onClick={(e) => {
                    e.stopPropagation()
                    onSwitchImage(i)
                  }}
                  className={cn(
                    'h-1.5 w-4 rounded-full transition-all',
                    active
                      ? 'bg-primary shadow'
                      : 'bg-white/60 hover:bg-white/80'
                  )}
                  aria-label={`Show image ${i + 1}`}
                  aria-current={active}
                />
              )
            })}
            {product.images.length > 4 && (
              <div className="ml-1 text-[10px] text-white/80">
                +{product.images.length - 4}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="space-y-2 p-3">
        {/* Title + rating */}
        <div className="space-y-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <Link
                href={`/products/${product.slug}`}
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="line-clamp-2 text-sm font-semibold leading-tight tracking-tight text-foreground transition-colors hover:text-primary">
                  {product.name}
                </h3>
              </Link>
            </div>
            <RatingBadge
              rating={product.rating}
              reviewCount={product.reviewCount}
              compact
            />
          </div>
        </div>

        {/* Single meta line (origin) */}
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <div className="flex items-center gap-1 truncate">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">{product.origin}</span>
          </div>
          <AvailabilityBadge
            status={availabilityStatus}
            stock={product.stock}
          />
        </div>

        {/* Price + vendor */}
        <div className="space-y-1 border-t border-border/60 pt-2">
          <div className="flex items-center justify-between">
            <PriceBlock
              price={product.price}
              comparePrice={product.comparePrice}
              size="sm"
            />
            {product.reviewCount && (
              <span className="text-[11px] text-muted-foreground">
                ({product.reviewCount})
              </span>
            )}
          </div>
          {product.vendor && (
            <p className="truncate text-[11px] text-muted-foreground">
              by{' '}
              <Link
                href={vendorSlugFromProduct(product)}
                onClick={(e) => e.stopPropagation()}
                className="font-medium text-primary hover:underline"
              >
                {product.vendor}
              </Link>
            </p>
          )}
        </div>
      </div>

      {/* Decorative pattern */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.025] transition-opacity duration-300 group-hover:opacity-[0.05]">
        <div
          className="h-full w-full"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FC8120' fill-opacity='1'%3E%3Cpath d='M30 30c0-16.569 13.431-30 30-30v60C43.431 60 30 46.569 30 30z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
            backgroundSize: '60px 60px'
          }}
        />
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Main Component                                                             */
/* -------------------------------------------------------------------------- */

// (InternalCardProps interface moved above ListLayout)

export default function ProductCard({
  product,
  className,
  showQuickAdd = true,
  viewMode = 'grid',
  onClickAction
}: ProductCardProps) {
  const { isAuthenticated } = useAuth()
  const { addItem } = useCartStore()
  const {
    addItem: addToWishlist,
    removeItem: removeFromWishlist,
    isItemInWishlist
  } = useWishlistStore()

  const isWishlisted = isItemInWishlist(product.id)
  const [isLoading, setIsLoading] = useState(false)

  const isOutOfStock =
    product.availability === 'OUT_OF_STOCK' || product.stock === 0
  const isLowStock =
    product.availability === 'LOW_STOCK' ||
    (product.stock > 0 && product.stock <= 5)

  const handleCardClick = useCallback(() => {
    onClickAction?.(product)
  }, [onClickAction, product])

  const handleQuickAdd = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (isOutOfStock) return
      if (!isAuthenticated) {
        triggerAuth({
          callbackUrl: window.location.href,
          message: 'Please sign in to add items to your cart 🛒',
          action: 'signin'
        })
        return
      }
      setIsLoading(true)
      try {
        await addItem(
          {
            id: `${product.id}-default`,
            productId: product.id,
            name: product.name,
            price: product.price,
            image: product.images[0] || '/placeholder-product.jpg',
            maxQuantity: product.stock,
            metadata: {
              weight: product.weight,
              origin: product.origin,
              vendor: product.vendor
            }
          },
          isAuthenticated
        )
        toast.success('Added to cart', {
          icon: <ShoppingCart className="h-5 w-5" />
        })
      } catch (err) {
        console.error(err)
        toast.error('Failed to add item to cart')
      } finally {
        setIsLoading(false)
      }
    },
    [addItem, isAuthenticated, isOutOfStock, product]
  )

  const handleWishlist = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (!isAuthenticated) {
        triggerAuth({
          callbackUrl: window.location.href,
          message: 'Please sign in to add items to your wishlist ❤️',
          action: 'signin'
        })
        return
      }
      if (isWishlisted) {
        removeFromWishlist(product.id)
        toast.success('Removed from wishlist')
      } else {
        addToWishlist({
          id: product.id,
          productId: product.id,
          name: product.name,
          price: product.price,
          comparePrice: product.comparePrice,
          image: product.images[0] || '/placeholder-product.jpg',
          category: product.category,
          availability: product.availability,
          stock: product.stock,
          isFeatured: product.isFeatured,
          metadata: {
            weight: product.weight,
            origin: product.origin,
            vendor: product.vendor,
            shopId: product.shopId
          }
        })
        toast.success('Added to wishlist', { icon: <Heart className="h-5 w-5" /> })
      }
    },
    [
      addToWishlist,
      isAuthenticated,
      isWishlisted,
      product,
      removeFromWishlist
    ]
  )

  const internalProps: InternalCardProps = useMemo(
    () => ({
      product,
      handleCardClick,
      handleWishlist,
      handleQuickAdd,
      isWishlisted,
      isLoading,
      showQuickAdd,
      isOutOfStock,
      isLowStock
    }),
    [
      product,
      handleCardClick,
      handleWishlist,
      handleQuickAdd,
      isWishlisted,
      isLoading,
      showQuickAdd,
      isOutOfStock,
      isLowStock
    ]
  )

  return (
    <div className={cn(className)}>
      {viewMode === 'list' ? (
        <ListLayout {...internalProps} />
      ) : (
        <GridLayout {...internalProps} />
      )}
    </div>
  )
}
