'use client'

import { useEffect, useState } from 'react'
import CartSidebar from '@/components/ui/CartSidebar'
import WishlistSidebar from '@/components/ui/WishlistSidebar'
import { useCartStore } from '@/lib/store/cart'
import { useWishlistStore } from '@/lib/store/wishlist'
import { useAuth } from '@/lib/auth-utils'

interface UIProviderProps {
  children: React.ReactNode
}

export default function UIProvider({ children }: UIProviderProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [cartLoaded, setCartLoaded] = useState(false)
  const [wishlistLoaded, setWishlistLoaded] = useState(false)
  const { isOpen, closeCart, items } = useCartStore()
  const { isOpen: isWishlistOpen, closeWishlist, syncWithBackend } = useWishlistStore()
  const { isAuthenticated, isLoading } = useAuth()

  // Prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Load cart from backend when user is authenticated
  useEffect(() => {
    const loadCartFromBackend = async () => {
      if (!isAuthenticated || cartLoaded || isLoading) return

      try {
        const response = await fetch('/api/cart')
        const data = await response.json()

        if (data.success && data.data.items.length > 0) {
          // Transform backend cart items to frontend format
          const backendItems = data.data.items.map((item: {
            id: string
            productId: string
            variantId?: string
            name: string
            price: number
            image: string
            quantity: number
            maxQuantity: number
            variant?: { id: string; name: string; value: string }
            metadata?: { weight?: number; origin?: string; vendor?: string }
          }) => ({
            id: item.id,
            productId: item.productId,
            variantId: item.variantId,
            name: item.name,
            price: item.price,
            image: item.image,
            quantity: item.quantity,
            maxQuantity: item.maxQuantity,
            variant: item.variant,
            metadata: item.metadata
          }))

          // Update cart store with backend items (but only if local cart is empty)
          if (items.length === 0) {
            useCartStore.setState({ items: backendItems })
          }
        }
      } catch (error) {
        console.warn('Failed to load cart from backend:', error)
      } finally {
        setCartLoaded(true)
      }
    }

    if (isMounted && !isLoading) {
      loadCartFromBackend()
    }
  }, [isAuthenticated, isMounted, isLoading, cartLoaded, items.length])

  // Load wishlist from backend when user is authenticated
  useEffect(() => {
    const loadWishlistFromBackend = async () => {
      if (!isAuthenticated || wishlistLoaded || isLoading) return

      try {
        await syncWithBackend()
      } catch (error) {
        console.warn('Failed to load wishlist from backend:', error)
      } finally {
        setWishlistLoaded(true)
      }
    }

    if (isMounted && !isLoading) {
      loadWishlistFromBackend()
    }
  }, [isAuthenticated, isMounted, isLoading, wishlistLoaded, syncWithBackend])

  if (!isMounted) {
    return <>{children}</>
  }

  return (
    <>
      {children}
      <CartSidebar isOpen={isOpen} onCloseAction={closeCart} />
      <WishlistSidebar isOpen={isWishlistOpen} onCloseAction={closeWishlist} />
    </>
  )
}
