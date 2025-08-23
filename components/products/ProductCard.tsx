'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { Heart, MapPin, Package, ShoppingCart, Star, Truck, Eye, Clock } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { Product } from '@/types'
import { useAuth, triggerAuth } from '@/lib/auth-utils'
import { useCartStore } from '@/lib/store/cart'
import { useWishlistStore } from '@/lib/store/wishlist'
import toast from '@/components/ui/toast'

interface ProductCardProps {
  product: Product
  className?: string
  showQuickAdd?: boolean
  viewMode?: 'grid' | 'list'
  onClick?: (product: Product) => void
}

export default function ProductCard({
  product,
  className,
  showQuickAdd = true,
  viewMode = 'grid',
  onClick
}: ProductCardProps) {
  const { isAuthenticated } = useAuth()
  const { addItem } = useCartStore()
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isItemInWishlist } = useWishlistStore()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)

  // Check if item is in wishlist
  const isWishlisted = isItemInWishlist(product.id)

  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0

  const isOutOfStock = product.availability === 'OUT_OF_STOCK' || product.stock === 0
  const isLowStock = product.availability === 'LOW_STOCK' || (product.stock > 0 && product.stock <= 5)

  const formatPrice = (price: number, comparePrice?: number) => {
    const formattedPrice = `₵${price.toFixed(2)}`
    if (comparePrice && comparePrice > price) {
      return (
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-foreground">{formattedPrice}</span>
          <span className="text-sm text-muted-foreground line-through">₵{comparePrice.toFixed(2)}</span>
        </div>
      )
    }
    return <span className="text-xl font-bold text-foreground">{formattedPrice}</span>
  }

  const getDeliveryTime = () => {
    return "30-45 min"
  }

  const getAvailabilityInfo = () => {
    switch (product.availability) {
      case 'IN_STOCK':
        return { text: 'In Stock', color: 'text-emerald-600', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200' }
      case 'LOW_STOCK':
        return { text: 'Low Stock', color: 'text-amber-600', bgColor: 'bg-amber-50', borderColor: 'border-amber-200' }
      case 'OUT_OF_STOCK':
        return { text: 'Out of Stock', color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200' }
      case 'PREORDER':
        return { text: 'Pre-order', color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' }
      default:
        return { text: 'Available', color: 'text-emerald-600', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200' }
    }
  }

  const handleClick = () => {
    if (onClick) {
      onClick(product)
    }
  }

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (isOutOfStock) return

    // Check authentication first
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
      // Use cart store's addItem method
      addItem({
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
      }, isAuthenticated)

    } catch (err) {
      console.error(err)
      toast.error('Failed to add item to cart')
    } finally {
      setIsLoading(false)
    }
  }

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // Check authentication for wishlist
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
    }
  }

  const handleImageError = () => {
    if (currentImageIndex < product.images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1)
    }
    setImageLoading(false)
  }

  const handleImageLoad = () => {
    setImageLoading(false)
  }

  const availability = getAvailabilityInfo()

  if (viewMode === 'list') {
    return (
      <div
        className={cn(
          "group relative bg-card rounded-2xl border border-border/60 overflow-hidden",
          "hover:border-primary/30 hover:shadow-lg transition-all duration-300 cursor-pointer flex",
          "backdrop-blur-sm bg-card/95",
          className
        )}
        onClick={handleClick}
      >
        {/* Image Section */}
        <div className="relative w-64 h-48 flex-shrink-0 overflow-hidden">
          {imageLoading && (
            <div className="absolute inset-0 bg-secondary/30 animate-pulse flex items-center justify-center">
              <Package className="w-8 h-8 text-secondary-foreground/50" />
            </div>
          )}
          <Image
            src={product.images[0] || '/placeholder-product.jpg'}
            alt={product.name}
            fill
            className={cn(
              "object-cover transition-all duration-500 group-hover:scale-105",
              imageLoading ? "opacity-0" : "opacity-100"
            )}
            onError={handleImageError}
            onLoad={handleImageLoad}
            sizes="256px"
          />

          {/* Overlay Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.isFeatured && (
              <div className="bg-primary/90 backdrop-blur-sm text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                <Star className="w-3 h-3" />
                Featured
              </div>
            )}
            {discount > 0 && (
              <div className="bg-destructive/90 backdrop-blur-sm text-destructive-foreground px-3 py-1 rounded-full text-xs font-semibold">
                -{discount}% OFF
              </div>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            onClick={handleWishlist}
            className={cn(
              "absolute top-3 right-3 p-2.5 rounded-full transition-all duration-200 backdrop-blur-sm",
              "bg-card/80 hover:bg-card shadow-sm hover:shadow-md border border-border/50",
              isWishlisted
                ? "text-red-500 bg-red-50/80 border-red-200/50"
                : "text-muted-foreground hover:text-red-500"
            )}
          >
            <Heart className={cn("w-4 h-4", isWishlisted && "fill-current")} />
          </button>
        </div>

        {/* Content Section */}
        <div className="flex-1 p-6 flex flex-col justify-between min-w-0">
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <Link href={`/products/${product.slug}`}>
                  <h3 className="font-bold text-xl text-foreground line-clamp-2 hover:text-primary transition-colors leading-tight">
                    {product.name}
                  </h3>
                </Link>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {product.shortDescription || product.description}
                </p>
              </div>

              {product.rating && (
                <div className="flex items-center gap-1 bg-secondary/50 px-2 py-1 rounded-lg flex-shrink-0">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="font-semibold text-sm">{product.rating.toFixed(1)}</span>
                  {product.reviewCount && (
                    <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
                  )}
                </div>
              )}
            </div>

            {/* Meta Information */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {product.origin && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{product.origin}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Truck className="w-4 h-4" />
                <span>{getDeliveryTime()}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span className="capitalize">{product.category.replace('-', ' ')}</span>
              </div>
            </div>

            {/* Availability Status */}
            <div className={cn(
              "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border",
              availability.color, availability.bgColor, availability.borderColor
            )}>
              {availability.text}
              {isLowStock && !isOutOfStock && (
                <span className="ml-1">• Only {product.stock} left</span>
              )}
            </div>
          </div>

          {/* Bottom Section */}
          <div className="flex items-center justify-between pt-4 border-t border-border/50">
            <div className="space-y-1">
              {formatPrice(product.price, product.comparePrice)}
              {product.vendor && (
                <p className="text-xs text-muted-foreground">by {product.vendor}</p>
              )}
            </div>

            {showQuickAdd && !isOutOfStock && (
              <Button
                onClick={handleQuickAdd}
                disabled={isLoading}
                className={cn(
                  "bg-primary hover:bg-primary/90 text-primary-foreground",
                  "px-6 py-2.5 rounded-xl font-semibold shadow-sm hover:shadow-md",
                  "transition-all duration-200 disabled:opacity-50"
                )}
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Add to Cart
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Grid View
  return (
    <div
      className={cn(
        "group relative bg-card rounded-2xl border border-border/60 overflow-hidden",
        "hover:border-primary/30 hover:shadow-xl transition-all duration-300 cursor-pointer",
        "backdrop-blur-sm bg-card/95 hover:-translate-y-1",
        className
      )}
      onClick={handleClick}
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-secondary/20">
        {imageLoading && (
          <div className="absolute inset-0 bg-secondary/30 animate-pulse flex items-center justify-center">
            <Package className="w-12 h-12 text-secondary-foreground/50" />
          </div>
        )}

        {product.images.length > 0 ? (
          <Image
            src={product.images[currentImageIndex] || '/placeholder-product.jpg'}
            alt={product.name}
            fill
            className={cn(
              "object-cover transition-all duration-500 group-hover:scale-110",
              imageLoading ? "opacity-0" : "opacity-100"
            )}
            onError={handleImageError}
            onLoad={handleImageLoad}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-secondary/30">
            <Package className="w-12 h-12 text-secondary-foreground/50" />
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Top Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.isFeatured && (
            <div className="bg-primary/90 backdrop-blur-sm text-primary-foreground px-2 py-0.5 rounded text-xs font-semibold flex items-center gap-1 shadow-lg">
              <Star className="w-2.5 h-2.5" />
              Featured
            </div>
          )}
          {discount > 0 && (
            <div className="bg-destructive/90 backdrop-blur-sm text-destructive-foreground px-2 py-0.5 rounded text-xs font-semibold shadow-lg">
              -{discount}%
            </div>
          )}
          {/* {isLowStock && !isOutOfStock && (
            <div className="bg-amber-500/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg">
              Low Stock
            </div>
          )} */}
          {/* {isOutOfStock && (
            <div className="bg-red-500/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg">
              Sold Out
            </div>
          )} */}
        </div>

        {/* Top Right Actions */}
        <div className="absolute top-2 right-2 flex gap-1">
          <button
            onClick={handleWishlist}
            className={cn(
              "p-1.5 rounded-full transition-all duration-200 backdrop-blur-sm shadow-lg",
              "bg-card/90 hover:bg-card border border-border/50",
              isWishlisted
                ? "text-red-500 bg-red-50/90 border-red-200/50"
                : "text-muted-foreground hover:text-red-500"
            )}
          >
            <Heart className={cn("w-3 h-3", isWishlisted && "fill-current")} />
          </button>
        </div>

        {/* Bottom Actions - Show on Hover */}
        <div className="absolute bottom-2 left-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
          {showQuickAdd && !isOutOfStock && (
            <Button
              onClick={handleQuickAdd}
              disabled={isLoading}
              size="sm"
              className="flex-1 bg-primary/90 backdrop-blur-sm hover:bg-primary text-primary-foreground shadow-lg text-xs h-7"
            >
              {isLoading ? (
                <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <ShoppingCart className="w-3 h-3 mr-1" />
                  Add
                </>
              )}
            </Button>
          )}
        </div>

        {/* Image Indicators */}
        {product.images.length > 1 && (
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-1">
            {product.images.slice(0, 3).map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation()
                  setCurrentImageIndex(index)
                }}
                className={cn(
                  "w-1.5 h-1.5 rounded-full transition-all duration-200",
                  index === currentImageIndex
                    ? "bg-primary shadow-lg"
                    : "bg-white/60 hover:bg-white/80"
                )}
              />
            ))}
            {product.images.length > 3 && (
              <div className="text-white/80 text-xs ml-1">+{product.images.length - 3}</div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 space-y-2">
        {/* Header Section */}
        <div className="space-y-1">
          <div className="flex items-start justify-between gap-1">
            <div className="min-w-0 flex-1">
              <Link href={`/products/${product.slug}`}>
                <h3 className="font-semibold text-sm text-foreground line-clamp-2 hover:text-primary transition-colors leading-tight">
                  {product.name}
                </h3>
              </Link>
            </div>

            {product.rating && (
              <div className="flex items-center gap-0.5 bg-secondary/50 px-1.5 py-0.5 rounded flex-shrink-0">
                <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                <span className="font-semibold text-xs">{product.rating.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Meta Info */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-0.5">
            <MapPin className="w-2.5 h-2.5" />
            <span className="truncate">{product.origin}</span>
          </div>
        </div>

        {/* Availability */}
        <div className={cn(
          "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border",
          availability.color, availability.bgColor, availability.borderColor
        )}>
          {availability.text}
          {isLowStock && !isOutOfStock && (
            <span className="ml-1 font-normal">• {product.stock}</span>
          )}
        </div>

        {/* Tags - Hide in grid view to save space */}

        {/* Price and Vendor */}
        <div className="space-y-1 pt-1 border-t border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span className="text-base font-bold text-foreground">₵{product.price.toFixed(2)}</span>
              {product.comparePrice && product.comparePrice > product.price && (
                <span className="text-xs text-muted-foreground line-through">₵{product.comparePrice.toFixed(2)}</span>
              )}
            </div>
            {product.reviewCount && (
              <span className="text-xs text-muted-foreground">
                ({product.reviewCount})
              </span>
            )}
          </div>

          {product.vendor && (
            <p className="text-xs text-muted-foreground truncate">
              by <span className="font-medium text-primary">{product.vendor}</span>
            </p>
          )}
        </div>
      </div>

      {/* Decorative Pattern Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02] group-hover:opacity-[0.04] transition-opacity duration-300">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FC8120' fill-opacity='1'%3E%3Cpath d='M30 30c0-16.569 13.431-30 30-30v60C43.431 60 30 46.569 30 30z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }}
        />
      </div>
    </div>
  )
}
