'use client'

import { useEffect, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { X, Minus, Plus, ShoppingBag, Trash2, MapPin, Package, Heart } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useCartStore, getEmptyCartMessage } from '@/lib/store/cart'
import { formatCurrency } from '@/lib/stripe'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import { CompactCheckoutButton } from '@/components/ui/CheckoutButton'
import { useAuth } from '@/lib/auth-utils'

interface CartSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    getTotalItems,
    getTotalPrice,
    getShippingCost,
    getFinalTotal
  } = useCartStore()

  const { isAuthenticated } = useAuth()
  const totalItems = getTotalItems()
  const subtotal = getTotalPrice()
  const shippingCost = getShippingCost()
  const total = getFinalTotal()

  // Memoize the empty cart message so it doesn't change on every render
  const emptyMessage = useMemo(() => getEmptyCartMessage(), [])

  // Handle quantity changes with optimistic updates
  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity < 0) return

    if (newQuantity === 0) {
      handleRemoveItem(itemId)
      return
    }

    const item = items.find(item => item.id === itemId)
    if (!item) return

    if (newQuantity > item.maxQuantity) {
      toast.error(`Sorry! Only ${item.maxQuantity} items available 😔`, {
        icon: '📦',
        style: {
          background: '#FC8120',
          color: 'white',
        },
      })
      return
    }

    updateQuantity(itemId, newQuantity)
  }

  const handleRemoveItem = (itemId: string) => {
    const item = items.find(item => item.id === itemId)
    if (item) {
      removeItem(itemId)
      toast.success(`${item.name} removed from your basket! 🗑️`, {
        icon: '👋',
        style: {
          background: '#FC8120',
          color: 'white',
        },
      })
    }
  }

  const handleClearCart = () => {
    if (items.length === 0) return

    clearCart()
    toast.success('Your basket is now empty and ready for new treasures! 🧹', {
      icon: '✨',
      style: {
        background: '#FC8120',
        color: 'white',
      },
    })
  }

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className={cn(
        "fixed right-0 top-0 h-full w-full max-w-md bg-background border-l border-border shadow-2xl z-50",
        "transform transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border/40 bg-gradient-to-r from-primary/5 to-secondary/10">
            <div className="flex items-center gap-3">
              <div className="relative">
                <ShoppingBag className="w-6 h-6 text-primary" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Your Basket</h2>
                <p className="text-sm text-muted-foreground">
                  {totalItems === 0 ? 'Empty basket' : `${totalItems} item${totalItems === 1 ? '' : 's'}`}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto">
            {items.length === 0 ? (
              /* Empty State */
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <div className="relative mb-6">
                  <ShoppingBag className="w-16 h-16 text-muted-foreground/50" />
                  <Heart className="w-6 h-6 text-primary absolute -top-1 -right-1" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Your basket is waiting!
                </h3>
                <p className="text-muted-foreground text-sm mb-6 max-w-xs leading-relaxed">
                  {emptyMessage}
                </p>
                <Button asChild className="w-full max-w-xs">
                  <Link href="/products" onClick={onClose}>
                    Start Shopping
                  </Link>
                </Button>

                {/* African-inspired empty state illustration */}
                <div className="absolute bottom-0 left-0 right-0 h-32 opacity-5">
                  <div className="w-full h-full" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23FC8120' fill-opacity='1'%3E%3Cpath d='M100 0L120 80L200 100L120 120L100 200L80 120L0 100L80 80Z'/%3E%3C/g%3E%3C/svg%3E")`,
                    backgroundSize: '100px 100px',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                  }} />
                </div>
              </div>
            ) : (
              <div className="p-4 space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="bg-card border border-border/40 rounded-xl p-4 space-y-3 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex gap-3">
                      {/* Product Image */}
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-secondary/20 flex-shrink-0">
                        <Image
                          src={item.image || '/placeholder-product.jpg'}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground text-sm line-clamp-2 mb-1">
                          {item.name}
                        </h4>

                        {/* Variant */}
                        {item.variant && (
                          <p className="text-xs text-muted-foreground mb-1">
                            {item.variant.name}: {item.variant.value}
                          </p>
                        )}

                        {/* Origin & Weight */}
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                          {item.metadata?.origin && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              <span>{item.metadata.origin}</span>
                            </div>
                          )}
                          {item.metadata?.weight && (
                            <div className="flex items-center gap-1">
                              <Package className="w-3 h-3" />
                              <span>{item.metadata.weight}kg</span>
                            </div>
                          )}
                        </div>

                        {/* Price */}
                        <div className="font-semibold text-foreground text-sm">
                          {formatCurrency(item.price)}
                        </div>
                      </div>

                      {/* Remove Button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8 text-muted-foreground hover:text-destructive flex-shrink-0"
                        onClick={() => handleRemoveItem(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="w-8 h-8"
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>

                        <span className="w-12 text-center font-medium text-foreground">
                          {item.quantity}
                        </span>

                        <Button
                          variant="outline"
                          size="icon"
                          className="w-8 h-8"
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.maxQuantity}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>

                      <div className="text-right">
                        <div className="font-semibold text-foreground">
                          {formatCurrency(item.price * item.quantity)}
                        </div>
                        {item.maxQuantity <= 5 && (
                          <div className="text-xs text-orange-600 dark:text-orange-400">
                            Only {item.maxQuantity} left
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Clear Cart Button */}
                {items.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearCart}
                    className="w-full text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear All Items
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Footer - Order Summary & Checkout */}
          {items.length > 0 && (
            <div className="border-t border-border/40 p-6 space-y-4 bg-gradient-to-t from-secondary/5 to-transparent">
              {/* Order Summary */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal ({totalItems} items)</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>

                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span>
                    {shippingCost === 0 ? (
                      <span className="text-green-600 font-medium">FREE! 🎉</span>
                    ) : (
                      formatCurrency(shippingCost)
                    )}
                  </span>
                </div>

                {shippingCost === 0 && subtotal >= 500 && (
                  <div className="text-xs text-green-600 dark:text-green-400 text-center py-1">
                    🎊 You saved {formatCurrency(15)} on shipping!
                  </div>
                )}

                {subtotal < 500 && (
                  <div className="text-xs text-muted-foreground text-center py-1">
                    Add {formatCurrency(500 - subtotal)} more for FREE shipping! 🚚
                  </div>
                )}

                <div className="flex justify-between font-semibold text-foreground pt-2 border-t border-border/40">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <div onClick={onClose}>
                  <CompactCheckoutButton />
                </div>

                <Button
                  variant="outline"
                  asChild
                  className="w-full"
                  onClick={onClose}
                >
                  <Link href="/products">
                    Continue Shopping
                  </Link>
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="text-center text-xs text-muted-foreground">
                <div className="flex items-center justify-center gap-4 pt-2">
                  <span>🔒 Secure Checkout</span>
                  <span>🚚 Fast Delivery</span>
                  <span>💝 Gift Ready</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* African Pattern Overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.01] z-0">
          <div className="w-full h-full" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23FC8120' fill-opacity='1'%3E%3Cpath d='M0 0h80v80H0V0zm20 20v40h40V20H20zm20 35a15 15 0 1 1 0-30 15 15 0 0 1 0 30z'/%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '80px 80px'
          }} />
        </div>
      </div>
    </>
  )
}
