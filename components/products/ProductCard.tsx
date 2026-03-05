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

  const onSwitchImage = (index: number) => {
    setCurrentImageIndex(index)
  }

  return (
    <div
      className={cn(
        'group relative cursor-pointer overflow-hidden',
        // Borderless at rest — shadow pops on hover (Temu/Jumia pattern)
        'transition-all duration-200 hover:shadow-md hover:-translate-y-0.5',
        'rounded-sm'
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
      {/* Image — fills full tile width, rounded corners on image only */}
      <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted/30">
        {imageLoading && <ImageSkeleton iconSize="h-10 w-10" />}
        {product.images.length > 0 ? (
          <Image
            src={
              product.images[currentImageIndex] || '/placeholder-product.jpg'
            }
            alt={product.name}
            fill
            className={cn(
              'object-cover',
              imageLoading ? 'opacity-0' : 'opacity-100'
            )}
            onLoad={() => setImageLoading(false)}
            onError={() => setImageLoading(false)}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted/40">
            <Package className="h-10 w-10 text-muted-foreground/40" />
          </div>
        )}

        {/* Out of Stock overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
            <span className="text-xs sm:text-sm font-semibold text-muted-foreground bg-background/80 px-3 py-1 rounded-full">
              Out of Stock
            </span>
          </div>
        )}

        {/* Wishlist — appears on hover */}
        <div className="absolute right-1.5 bottom-1.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <WishlistButton
            active={isWishlisted}
            onToggle={handleWishlist}
            size="sm"
          />
        </div>

        {/* Image indicators */}
        {product.images.length > 1 && (
          <div className="absolute bottom-1.5 left-1/2 flex -translate-x-1/2 gap-0.5">
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
                    'h-1 w-3 rounded-full transition-all',
                    active
                      ? 'bg-primary shadow'
                      : 'bg-white/50 hover:bg-white/70'
                  )}
                  aria-label={`Show image ${i + 1}`}
                  aria-current={active}
                />
              )
            })}
          </div>
        )}
      </div>

      {/* Content — compact, directly below image */}
      <div className="space-y-0.5 px-0.5 pt-2 pb-1">
        {/* Featured label — inline like Temu's "MEGA SALE" */}
        {product.isFeatured && (
          <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-primary">
            <Star className="h-2.5 w-2.5 fill-primary" />
            Featured
          </span>
        )}

        {/* Product Name */}
        <h3 className="line-clamp-2 text-[13px] sm:text-sm font-medium leading-snug text-foreground">
          {product.name}
        </h3>

        {/* Price Row + Cart Button */}
        <div className="flex items-center justify-between gap-1">
          <div className="flex items-baseline gap-1.5 flex-wrap min-w-0">
            <span className="text-sm sm:text-base font-bold tracking-tight text-foreground">
              {formatCurrency(product.price)}
            </span>
            {product.comparePrice && product.comparePrice > product.price && (
              <span className="text-[11px] sm:text-xs text-muted-foreground line-through">
                {formatCurrency(product.comparePrice)}
              </span>
            )}
            {discount > 0 && (
              <span className="text-[10px] sm:text-[11px] font-semibold text-destructive bg-destructive/10 px-1 py-0.5 rounded">
                -{discount}%
              </span>
            )}
          </div>

          {/* Cart icon button — Temu/Jumia style */}
          <button
            onClick={handleQuickAdd}
            disabled={isLoading || isOutOfStock}
            className={cn(
              'shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full border flex items-center justify-center transition-colors',
              isOutOfStock
                ? 'border-border/40 bg-muted/50 text-muted-foreground/40 cursor-not-allowed'
                : 'border-border/60 bg-background text-foreground/70 hover:bg-primary hover:text-primary-foreground hover:border-primary'
            )}
            aria-label={isOutOfStock ? 'Out of stock' : 'Add to cart'}
          >
            {isLoading ? (
              <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            )}
          </button>
        </div>

        {/* Rating + meta line */}
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          {product.rating && (
            <div className="flex items-center gap-0.5">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className="font-medium text-foreground/80">{product.rating.toFixed(1)}</span>
              {product.reviewCount && (
                <span>({product.reviewCount.toLocaleString()})</span>
              )}
            </div>
          )}
          {product.rating && product.vendor && (
            <span className="text-border">·</span>
          )}
          {product.vendor && (
            <span className="truncate">{product.vendor}</span>
          )}
        </div>
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
      <GridLayout {...internalProps} />
    </div>
  )
}
