'use client'

import { useEffect, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { X, ShoppingCart, Trash2, Heart, Package, ShoppingBag, Eye } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useWishlistStore, getEmptyWishlistMessage } from '@/lib/store/wishlist'
import { useCartStore } from '@/lib/store/cart'
import { formatCurrency } from '@/lib/stripe'
import { cn } from '@/lib/utils'
import toast from '@/components/ui/toast'
import { useAuth } from '@/lib/auth-utils'

interface WishlistSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function WishlistSidebar({ isOpen, onClose }: WishlistSidebarProps) {
  const {
    items,
    removeItem,
    clearWishlist,
    moveToCart,
    getTotalItems,
    syncWithBackend
  } = useWishlistStore()
  const { addItem: addToCart } = useCartStore()
  const { isAuthenticated } = useAuth()

  const totalItems = getTotalItems()
  const emptyMessage = getEmptyWishlistMessage()

  // Sync with backend when component mounts
  useEffect(() => {
    if (isAuthenticated && isOpen) {
      syncWithBackend()
    }
  }, [isAuthenticated, isOpen, syncWithBackend])

  // Close sidebar when clicking outside
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

  // Calculate categories and price stats
  const stats = useMemo(() => {
    const categories = new Set(items.map(item => item.category))
    const totalValue = items.reduce((sum, item) => sum + item.price, 0)
    const avgPrice = items.length > 0 ? totalValue / items.length : 0
    const inStockItems = items.filter(item => item.availability === 'IN_STOCK' && item.stock > 0)

    return {
      totalCategories: categories.size,
      totalValue,
      avgPrice,
      inStockCount: inStockItems.length,
      outOfStockCount: items.length - inStockItems.length
    }
  }, [items])

  const handleRemoveItem = (productId: string, variantId?: string) => {
    removeItem(productId, variantId)
  }

  const handleMoveToCart = async (productId: string, variantId?: string) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to add items to cart')
      return
    }

    const item = items.find(item =>
      item.productId === productId && item.variantId === variantId
    )

    if (!item) return

    try {
      // Add to cart
      await addToCart({
        id: `${item.productId}-${item.variantId || 'default'}`,
        productId: item.productId,
        variantId: item.variantId,
        name: item.name,
        price: item.price,
        image: item.image,
        maxQuantity: item.stock,
        variant: item.variant,
        metadata: item.metadata
      }, isAuthenticated, 1)

      // Remove from wishlist
      removeItem(productId, variantId)

      toast.success(`${item.name} moved to cart!`)
    } catch (error) {
      toast.error('Failed to move item to cart')
    }
  }

  const handleClearWishlist = () => {
    if (items.length === 0) return

    if (window.confirm('Are you sure you want to clear your entire wishlist?')) {
      clearWishlist()
    }
  }

  const getAvailabilityInfo = (availability: string, stock: number) => {
    if (availability === 'OUT_OF_STOCK' || stock === 0) {
      return {
        text: 'Out of Stock',
        color: 'text-red-600 bg-red-50 border-red-200',
        icon: '❌'
      }
    }
    if (stock < 5) {
      return {
        text: `Only ${stock} left`,
        color: 'text-orange-600 bg-orange-50 border-orange-200',
        icon: '⚠️'
      }
    }
    return {
      text: 'In Stock',
      color: 'text-green-600 bg-green-50 border-green-200',
      icon: '✅'
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className={cn(
        "fixed right-0 top-0 h-full w-full max-w-md bg-background border-l border-border shadow-xl z-50 transition-transform duration-300 ease-in-out flex flex-col",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-card">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-50 rounded-lg">
              <Heart className="w-5 h-5 text-red-500 fill-current" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">My Wishlist</h2>
              <p className="text-sm text-muted-foreground">
                {totalItems} {totalItems === 1 ? 'item' : 'items'}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {items.length === 0 ? (
            /* Empty State */
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <div className="relative mb-6">
                <Heart className="w-16 h-16 text-muted-foreground/50" />
                <Package className="w-6 h-6 text-red-500 absolute -top-1 -right-1" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Your wishlist is empty
              </h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                {emptyMessage}
              </p>
              <Button asChild className="w-full">
                <Link href="/products" onClick={onClose}>
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Start Shopping
                </Link>
              </Button>
            </div>
          ) : (
            <>
              {/* Stats Bar */}
              <div className="p-4 bg-muted/30 border-b border-border">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Total Value:</span>
                    <span className="font-semibold text-foreground ml-1">
                      {formatCurrency(stats.totalValue, 'GHS')}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Categories:</span>
                    <span className="font-semibold text-foreground ml-1">
                      {stats.totalCategories}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">In Stock:</span>
                    <span className="font-semibold text-green-600 ml-1">
                      {stats.inStockCount}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Avg Price:</span>
                    <span className="font-semibold text-foreground ml-1">
                      {formatCurrency(stats.avgPrice, 'GHS')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {items.map((item) => {
                  const availability = getAvailabilityInfo(item.availability, item.stock)

                  return (
                    <div key={`${item.productId}-${item.variantId || 'default'}`}
                      className="bg-card border border-border rounded-xl p-4 hover:shadow-md transition-shadow">
                      <div className="flex gap-3">
                        {/* Product Image */}
                        <div className="relative w-16 h-16 flex-shrink-0">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover rounded-lg"
                            sizes="64px"
                          />
                          {item.isFeatured && (
                            <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs px-1 rounded-full">
                              ⭐
                            </div>
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-foreground truncate mb-1">
                            {item.name}
                          </h3>

                          {item.variant && (
                            <p className="text-xs text-muted-foreground mb-1">
                              {item.variant.name}: {item.variant.value}
                            </p>
                          )}

                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-bold text-foreground">
                              {formatCurrency(item.price, 'GHS')}
                            </span>
                            {item.comparePrice && item.comparePrice > item.price && (
                              <span className="text-xs text-muted-foreground line-through">
                                {formatCurrency(item.comparePrice, 'GHS')}
                              </span>
                            )}
                          </div>

                          {/* Availability Status */}
                          <div className={cn(
                            "inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border",
                            availability.color
                          )}>
                            <span>{availability.icon}</span>
                            {availability.text}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2 mt-3">
                            <Button
                              size="sm"
                              onClick={() => handleMoveToCart(item.productId, item.variantId)}
                              disabled={item.availability === 'OUT_OF_STOCK' || item.stock === 0}
                              className="flex-1 text-xs h-8"
                            >
                              <ShoppingCart className="w-3 h-3 mr-1" />
                              Add to Cart
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveItem(item.productId, item.variantId)}
                              className="px-2 h-8"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Footer Actions */}
              <div className="p-4 border-t border-border bg-card space-y-3">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleClearWishlist}
                    className="flex-1"
                    disabled={items.length === 0}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear All
                  </Button>
                  <Button asChild className="flex-1">
                    <Link href="/products" onClick={onClose}>
                      <Eye className="w-4 h-4 mr-2" />
                      Browse More
                    </Link>
                  </Button>
                </div>

                {stats.inStockCount > 0 && (
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">
                      {stats.inStockCount} of {items.length} items available for purchase
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
