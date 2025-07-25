'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { Heart, MapPin, Package, ShoppingCart, Star } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useCartStore } from '@/lib/store/cart'
import { formatCurrency } from '@/lib/stripe'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

interface ProductVariant {
  id: string
  name: string
  value: string
  price?: number
  stock?: number
}

interface ProductCardProps {
  product: {
    id: string
    name: string
    slug: string
    description?: string
    shortDescription?: string
    price: number
    comparePrice?: number
    images: string[]
    category: string
    tags: string[]
    isFeatured?: boolean
    stock: number
    weight?: number
    origin?: string
    vendor?: string
    availability: string
    variants?: ProductVariant[]
  }
  className?: string
  showQuickAdd?: boolean
}

export default function ProductCard({ product, className, showQuickAdd = true }: ProductCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const addItem = useCartStore(state => state.addItem)
  // We don't need to open cart automatically after adding to cart
  // const openCart = useCartStore(state => state.openCart)

  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0

  const isOutOfStock = product.availability === 'OUT_OF_STOCK' || product.stock === 0
  const isLowStock = product.availability === 'LOW_STOCK' || (product.stock > 0 && product.stock <= 5)

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (isOutOfStock) return

    setIsLoading(true)

    try {
      addItem({
        id: product.id,
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
      })

      // Show success message with African flair
      toast.success(`${product.name} added to your basket! 🎁`, {
        icon: '🛒',
        style: {
          background: '#FC8120',
          color: 'white',
        },
      })
    } catch (err) {
      console.error(err);
      toast.error('Failed to add item to cart')
    } finally {
      setIsLoading(false)
    }
  }

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsWishlisted(!isWishlisted)

    toast.success(
      isWishlisted ? 'Removed from wishlist' : 'Added to wishlist! 💝',
      {
        icon: isWishlisted ? '💔' : '❤️',
      }
    )
  }

  const handleImageError = () => {
    // Fallback to next image or placeholder
    if (currentImageIndex < product.images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1)
    }
  }

  return (
    <div className={cn(
      "group relative bg-white rounded-xl shadow-sm border border-border/40 overflow-hidden",
      "hover:shadow-lg hover:border-primary/20 transition-all duration-300",
      "dark:bg-card dark:border-border/60",
      className
    )}>
      {/* Product Image */}
      <Link href={`/products/${product.slug}`}>
        <div className="relative aspect-[4/3] overflow-hidden bg-secondary/20">
          {product.images.length > 0 ? (
            <Image
              src={product.images[currentImageIndex] || '/placeholder-product.jpg'}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              onError={handleImageError}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-secondary/30">
              <Package className="w-12 h-12 text-muted-foreground" />
            </div>
          )}

          {/* Overlay badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.isFeatured && (
              <span className="px-2 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                ⭐ Featured
              </span>
            )}
            {discount > 0 && (
              <span className="px-2 py-1 bg-destructive text-destructive-foreground text-xs font-medium rounded-full">
                -{discount}%
              </span>
            )}
            {isLowStock && !isOutOfStock && (
              <span className="px-2 py-1 bg-orange-500 text-white text-xs font-medium rounded-full">
                Low Stock
              </span>
            )}
            {isOutOfStock && (
              <span className="px-2 py-1 bg-gray-500 text-white text-xs font-medium rounded-full">
                Out of Stock
              </span>
            )}
          </div>

          {/* Wishlist button */}
          <button
            onClick={handleWishlist}
            className={cn(
              "absolute top-3 right-3 p-2 rounded-full transition-all duration-200",
              "bg-white/80 hover:bg-white shadow-sm hover:shadow-md",
              "dark:bg-background/80 dark:hover:bg-background",
              isWishlisted ? "text-red-500" : "text-muted-foreground hover:text-red-500"
            )}
          >
            <Heart className={cn("w-4 h-4", isWishlisted && "fill-current")} />
          </button>

          {/* Multiple images indicator */}
          {product.images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-1">
              {product.images.slice(0, 4).map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    "w-1.5 h-1.5 rounded-full transition-colors",
                    index === currentImageIndex ? "bg-white" : "bg-white/50"
                  )}
                />
              ))}
            </div>
          )}
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-4 space-y-3">
        {/* Origin & Category */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            <span>{product.origin || 'Ghana'}</span>
          </div>
          <span className="uppercase tracking-wide font-medium">
            {product.category}
          </span>
        </div>

        {/* Product Name */}
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>

        {/* Description */}
        {product.shortDescription && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {product.shortDescription}
          </p>
        )}

        {/* Vendor */}
        {product.vendor && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span>by</span>
            <span className="font-medium text-primary">{product.vendor}</span>
          </div>
        )}

        {/* Rating (placeholder for future implementation) */}
        <div className="flex items-center gap-1">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className="w-3 h-3 fill-yellow-400 text-yellow-400"
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground ml-1">(4.8)</span>
        </div>

        {/* Tags */}
        {product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {product.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-secondary/50 text-secondary-foreground text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Price & Actions */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-foreground">
                {formatCurrency(product.price)}
              </span>
              {product.comparePrice && (
                <span className="text-sm text-muted-foreground line-through">
                  {formatCurrency(product.comparePrice)}
                </span>
              )}
            </div>
            {product.weight && (
              <span className="text-xs text-muted-foreground">
                ~{product.weight}kg
              </span>
            )}
          </div>

          {/* Quick Add Button */}
          {showQuickAdd && (
            <Button
              size="sm"
              onClick={handleQuickAdd}
              disabled={isOutOfStock || isLoading}
              className={cn(
                "px-3 py-2 text-xs font-medium",
                isOutOfStock
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-primary hover:bg-primary/90"
              )}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <ShoppingCart className="w-3 h-3 mr-1" />
                  {isOutOfStock ? 'Sold Out' : 'Add'}
                </>
              )}
            </Button>
          )}
        </div>

        {/* Stock indicator */}
        {isLowStock && !isOutOfStock && (
          <div className="text-xs text-orange-600 dark:text-orange-400">
            Only {product.stock} left in stock!
          </div>
        )}
      </div>

      {/* African-inspired pattern overlay (subtle) */}
      <div className="absolute inset-0 pointer-events-none opacity-5">
        <div className="w-full h-full" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FC8120' fill-opacity='1'%3E%3Cpath d='M30 30c0-16.569 13.431-30 30-30v60C43.431 60 30 46.569 30 30z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px'
        }} />
      </div>
    </div>
  )
}
