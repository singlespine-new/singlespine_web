'use client'

import { useState, useEffect } from 'react'
import { X, Plus, Minus, ShoppingCart, Star, Truck, Package, Heart, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import toast from '@/components/ui/toast'
import { Product, ProductVariant } from '@/types'
import { getMockShopById } from '@/data/mockData'
import { useCartStore } from '@/lib/store/cart'
import { useWishlistStore } from '@/lib/store/wishlist'
import { useAuth } from '@/lib/auth-utils'

interface ProductDetailsModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
  onAddToCart?: (productId: string, quantity: number, variantId?: string) => void
}

export default function ProductDetailsModal({
  product,
  isOpen,
  onClose,
  onAddToCart
}: ProductDetailsModalProps) {
  const { addItem } = useCartStore()
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isItemInWishlist } = useWishlistStore()
  const { isAuthenticated } = useAuth()
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isAddingToCart, setIsAddingToCart] = useState(false)

  // Check if item is in wishlist
  const isFavorited = product ? isItemInWishlist(product.id, selectedVariant?.id) : false

  // Get delivery time from shop data
  const getDeliveryTime = () => {
    if (product?.shopId) {
      const shop = getMockShopById(product.shopId)
      return shop?.deliveryTime || "30-45 min"
    }
    return "30-45 min"
  }

  // Reset state when product changes
  useEffect(() => {
    if (product) {
      setQuantity(1)
      setSelectedVariant(product.variants?.[0] || null)
      setSelectedImageIndex(0)
    }
  }, [product])

  // Sync wishlist with backend when component mounts
  useEffect(() => {
    if (isAuthenticated) {
      const { syncWithBackend } = useWishlistStore.getState()
      syncWithBackend()
    }
  }, [isAuthenticated])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen || !product) return null

  const currentPrice = selectedVariant?.price || product.price
  const currentStock = selectedVariant?.stock || product.stock
  const maxQuantity = Math.min(currentStock, 10) // Limit to 10 items max

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= maxQuantity) {
      setQuantity(newQuantity)
    }
  }

  const handleAddToCart = async () => {
    if (!product) return

    setIsAddingToCart(true)
    try {
      // Add to cart store (this handles both frontend and backend sync)
      await addItem({
        id: `${product.id}-${selectedVariant?.id || 'default'}`,
        productId: product.id,
        variantId: selectedVariant?.id,
        name: product.name,
        price: selectedVariant?.price || product.price,
        image: product.images[0] || '/placeholder-product.jpg',
        maxQuantity: selectedVariant?.stock || product.stock,
        variant: selectedVariant ? {
          id: selectedVariant.id,
          name: selectedVariant.name,
          value: selectedVariant.value
        } : undefined,
        metadata: {
          weight: product.weight,
          origin: product.origin,
          vendor: product.vendor
        }
      }, isAuthenticated, quantity)

      // onAddToCart prop removed to prevent duplicate cart additions
      // The cart store already handles the addition above

      // Show success toast
      const itemText = quantity === 1 ? 'item' : 'items'
      toast.success(`${quantity} ${itemText} added to your cart!`, {
        icon: <ShoppingCart className="w-5 h-5" />
      })
    } catch (error) {
      console.error('Failed to add to cart:', error)
      toast.error('Failed to add to cart')
    } finally {
      setIsAddingToCart(false)
    }
  }

  const handleWishlistToggle = () => {
    if (!product) return

    if (!isAuthenticated) {
      toast.error('Please sign in to add items to your wishlist')
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
        price: selectedVariant?.price || product.price,
        comparePrice: product.comparePrice,
        image: product.images[0] || '/placeholder-product.jpg',
        category: product.category,
        availability: product.availability,
        stock: selectedVariant?.stock || product.stock,
        isFeatured: product.isFeatured,
        variant: selectedVariant ? {
          id: selectedVariant.id,
          name: selectedVariant.name,
          value: selectedVariant.value
        } : undefined,
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
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href
        })
      } catch {
        // User cancelled or error occurred
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      toast.success('Product link copied to clipboard!')
    }
  }

  const getAvailabilityText = (availability: string, stock: number) => {
    if (availability === 'OUT_OF_STOCK' || stock === 0) {
      return { text: 'Out of Stock', color: 'text-red-600' }
    }
    if (stock < 5) {
      return { text: `Only ${stock} left!`, color: 'text-orange-600' }
    }
    return { text: 'In Stock', color: 'text-green-600' }
  }

  const availabilityInfo = getAvailabilityText(product.availability, currentStock)

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-border/40 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Product Details</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="p-2"
            >
              <Share2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleWishlistToggle}
              className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all duration-200"
              title={isFavorited ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart className={cn("w-5 h-5 transition-colors", isFavorited ? "fill-red-500 text-red-500" : "text-gray-500 hover:text-red-500")} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all duration-200 hover:scale-105 border border-transparent hover:border-red-200 dark:hover:border-red-800 min-w-[32px] min-h-[32px] flex items-center justify-center"
              aria-label="Close modal"
              title="Close"
            >
              <X className="w-6 h-6 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors" />
              <span className="sr-only">✕</span>
            </Button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Product Images */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative aspect-square rounded-xl overflow-hidden bg-muted">
                <Image
                  src={product.images[selectedImageIndex] || '/placeholder-product.jpg'}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                {product.comparePrice && product.comparePrice > product.price && (
                  <div className="absolute top-4 left-4 bg-red-500 text-white px-2 py-1 rounded-md text-sm font-medium">
                    -{Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}%
                  </div>
                )}
                {product.isFeatured && (
                  <div className="absolute top-4 right-4 bg-primary text-white px-2 py-1 rounded-md text-xs font-medium">
                    Featured
                  </div>
                )}
              </div>

              {/* Thumbnail Images */}
              {product.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={cn(
                        "relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2",
                        selectedImageIndex === index
                          ? "border-primary"
                          : "border-transparent"
                      )}
                    >
                      <Image
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              {/* Basic Info */}
              <div>
                <div className="flex items-start justify-between mb-2">
                  <h1 className="text-2xl font-bold text-foreground">
                    {product.name}
                  </h1>
                  <div className={cn("text-sm font-medium", availabilityInfo.color)}>
                    {availabilityInfo.text}
                  </div>
                </div>

                {product.vendor && (
                  <Link
                    href={`/shop/${encodeURIComponent(product.vendor.toLowerCase().replace(/\s+/g, '-'))}`}
                    className="text-primary hover:text-primary/80 text-sm font-medium mb-2 inline-block"
                  >
                    by {product.vendor}
                  </Link>
                )}

                {product.rating && (
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "w-4 h-4",
                            i < Math.floor(product.rating!)
                              ? "text-yellow-400 fill-current"
                              : "text-gray-300"
                          )}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {product.rating} ({product.reviewCount || 0} reviews)
                    </span>
                  </div>
                )}

                <p className="text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-foreground">
                  ₵{currentPrice.toFixed(2)}
                </span>
                {product.comparePrice && product.comparePrice > currentPrice && (
                  <span className="text-lg text-muted-foreground line-through">
                    ₵{product.comparePrice.toFixed(2)}
                  </span>
                )}
              </div>

              {/* Variants */}
              {product.variants && product.variants.length > 0 && (
                <div>
                  <h3 className="font-semibold text-foreground mb-3">
                    {product.variants[0]?.name || 'Options'}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((variant) => (
                      <button
                        key={variant.id}
                        onClick={() => setSelectedVariant(variant)}
                        className={cn(
                          "px-3 py-2 rounded-lg border text-sm font-medium transition-colors",
                          selectedVariant?.id === variant.id
                            ? "border-primary bg-primary text-white"
                            : "border-border hover:border-primary"
                        )}
                      >
                        {variant.value}
                        {variant.price && variant.price !== product.price && (
                          <span className="ml-1">
                            (+₵{(variant.price - product.price).toFixed(2)})
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div>
                <h3 className="font-semibold text-foreground mb-3">Quantity</h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-border rounded-lg">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                      className="p-2 h-10 w-10"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                      min="1"
                      max={maxQuantity}
                      className="w-16 text-center border-0 focus:ring-0 bg-transparent"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={quantity >= maxQuantity}
                      className="p-2 h-10 w-10"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {maxQuantity} available
                  </span>
                </div>
              </div>

              {/* Add to Cart */}
              <div className="space-y-4">
                <Button
                  onClick={handleAddToCart}
                  disabled={isAddingToCart || product.availability === 'OUT_OF_STOCK' || currentStock === 0}
                  className="w-full h-12 font-semibold"
                  size="lg"
                >
                  {isAddingToCart ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Adding to Cart...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="w-5 h-5" />
                      Add to Cart - ₵{(currentPrice * quantity).toFixed(2)}
                    </div>
                  )}
                </Button>

                {/* Delivery Info */}
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Truck className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium text-foreground">
                      Delivery: {getDeliveryTime()}
                    </span>
                  </div>
                  {product.weight && (
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {product.weight}kg
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Product Details */}
              <div className="space-y-3 text-sm">
                {product.origin && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Origin:</span>
                    <span className="text-foreground">{product.origin}</span>
                  </div>
                )}
                {product.category && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Category:</span>
                    <span className="text-foreground capitalize">
                      {product.category.replace('-', ' ')}
                    </span>
                  </div>
                )}
                {product.tags.length > 0 && (
                  <div>
                    <span className="text-muted-foreground">Tags:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {product.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
