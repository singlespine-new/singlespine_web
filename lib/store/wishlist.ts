import { UIIcon } from '@/components/ui/icon'
import toast from '@/components/ui/toast'
import React from 'react'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

// Types for wishlist items
export interface WishlistItem {
  id: string
  productId: string
  variantId?: string
  name: string
  price: number
  comparePrice?: number
  image: string
  category: string
  availability: string
  stock: number
  isFeatured: boolean
  variant?: {
    id: string
    name: string
    value: string
  }
  metadata?: {
    weight?: number
    origin?: string
    vendor?: string
    shopId?: string
  }
  addedAt: string
}

interface WishlistStore {
  items: WishlistItem[]
  isOpen: boolean

  // Wishlist actions
  addItem: (item: Omit<WishlistItem, 'addedAt'>) => void
  removeItem: (productId: string, variantId?: string) => void
  clearWishlist: () => void
  moveToCart: (productId: string, variantId?: string) => void

  // UI state
  openWishlist: () => void
  closeWishlist: () => void

  // Computed values
  getTotalItems: () => number
  isItemInWishlist: (productId: string, variantId?: string) => boolean
  getWishlistItem: (productId: string, variantId?: string) => WishlistItem | undefined

  // Sync with backend
  syncWithBackend: () => Promise<void>
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (newItem) => {
        const state = get()
        // Normalize variantId for consistent comparison
        const normalizedVariantId = newItem.variantId || null
        const existingItem = state.items.find(
          item => item.productId === newItem.productId &&
            (item.variantId || null) === normalizedVariantId
        )

        if (existingItem) {
          toast.info('Item is already in your wishlist!')
          return
        }

        const wishlistItem: WishlistItem = {
          ...newItem,
          addedAt: new Date().toISOString()
        }

        // Update frontend state
        set(state => ({
          items: [...state.items, wishlistItem]
        }))

        // Sync with backend asynchronously
        const syncWithBackend = async () => {
          try {
            const response = await fetch('/api/wishlist', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                productId: newItem.productId,
                variantId: newItem.variantId
              })
            })

            if (!response.ok) {
              const error = await response.json()
              console.warn('Failed to sync wishlist with backend:', error.error)
            }
          } catch (error) {
            console.warn('Failed to sync wishlist with backend:', error)
          }
        }

        syncWithBackend()

        toast.success(`${newItem.name} added to your wishlist.`, {
          icon: React.createElement(UIIcon, { name: 'heart', size: 16, className: 'text-primary' })
        })
      },

      removeItem: (productId, variantId) => {
        const state = get()
        // Normalize variantId for consistent comparison
        const normalizedVariantId = variantId || null
        const item = state.items.find(
          item => item.productId === productId && (item.variantId || null) === normalizedVariantId
        )

        if (!item) return

        // Update frontend state
        set(state => ({
          items: state.items.filter(
            item => !(item.productId === productId && (item.variantId || null) === normalizedVariantId)
          )
        }))

        // Sync with backend asynchronously
        const syncWithBackend = async () => {
          try {
            const params = new URLSearchParams({ productId })
            if (variantId) params.append('variantId', variantId)

            const response = await fetch(`/api/wishlist?${params}`, {
              method: 'DELETE'
            })

            if (!response.ok) {
              const error = await response.json()
              console.warn('Failed to sync wishlist removal with backend:', error.error)
            }
          } catch (error) {
            console.warn('Failed to sync wishlist removal with backend:', error)
          }
        }

        syncWithBackend()

        toast.info(`${item.name} removed from wishlist.`, {
          icon: React.createElement(UIIcon, { name: 'trash', size: 16, className: 'text-muted-foreground' })
        })
      },

      clearWishlist: () => {
        // Update frontend state
        set({ items: [] })

        // Sync with backend asynchronously
        const syncWithBackend = async () => {
          try {
            const response = await fetch('/api/wishlist?clearAll=true', {
              method: 'DELETE'
            })

            if (!response.ok) {
              const error = await response.json()
              console.warn('Failed to sync wishlist clear with backend:', error.error)
            }
          } catch (error) {
            console.warn('Failed to sync wishlist clear with backend:', error)
          }
        }

        syncWithBackend()

        toast.info('Wishlist cleared.', {
          icon: React.createElement(UIIcon, { name: 'heart', size: 16 })
        })
      },

      moveToCart: (productId, variantId) => {
        const state = get()
        // Normalize variantId for consistent comparison
        const normalizedVariantId = variantId || null
        const item = state.items.find(
          item => item.productId === productId && (item.variantId || null) === normalizedVariantId
        )

        if (!item) return

        // Import cart store dynamically to avoid circular dependency
        import('./cart').then(({ useCartStore }) => {
          const { addItem: addToCart } = useCartStore.getState()

          // Add to cart
          addToCart({
            id: `${item.productId}-${item.variantId || 'default'}`,
            productId: item.productId,
            variantId: item.variantId,
            name: item.name,
            price: item.price,
            image: item.image,
            maxQuantity: item.stock,
            variant: item.variant,
            metadata: item.metadata
          }, true, 1)

          // Remove from wishlist
          get().removeItem(productId, variantId)

          toast.success(`${item.name} moved to cart!`)
        })
      },

      openWishlist: () => set({ isOpen: true }),
      closeWishlist: () => set({ isOpen: false }),

      getTotalItems: () => {
        return get().items.length
      },

      isItemInWishlist: (productId, variantId) => {
        // Normalize variantId for consistent comparison
        const normalizedVariantId = variantId || null
        return get().items.some(
          item => item.productId === productId && (item.variantId || null) === normalizedVariantId
        )
      },

      getWishlistItem: (productId, variantId) => {
        // Normalize variantId for consistent comparison
        const normalizedVariantId = variantId || null
        return get().items.find(
          item => item.productId === productId && (item.variantId || null) === normalizedVariantId
        )
      },

      syncWithBackend: async () => {
        try {
          const response = await fetch('/api/wishlist')
          const data = await response.json()

          if (data.success) {
            set({ items: data.data.items })
          }
        } catch (error) {
          console.warn('Failed to sync wishlist with backend:', error)
        }
      }
    }),
    {
      name: 'singlespine-wishlist-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items
      })
    }
  )
)

// Selectors for performance optimization
export const useWishlistItems = () => useWishlistStore(state => state.items)
export const useWishlistCount = () => useWishlistStore(state => state.getTotalItems())
export const useWishlistOpen = () => useWishlistStore(state => state.isOpen)

// Helper function to check if item is wishlisted
export const useIsWishlisted = (productId: string, variantId?: string) => {
  return useWishlistStore(state => state.isItemInWishlist(productId, variantId))
}

// African-inspired motivational messages for empty wishlist
export const getEmptyWishlistMessage = () => {
  const messages = [
    "Your wishlist is empty — start adding items you love.",
    "Curate thoughtful gifts for loved ones back home.",
    "Save products now and check out when you're ready.",
    "Build a collection of authentic items from Ghana.",
    "Organize the items that matter most in one place.",
    "Add a few items and we'll keep them here for quick access."
  ]

  return messages[Math.floor(Math.random() * messages.length)]
}
