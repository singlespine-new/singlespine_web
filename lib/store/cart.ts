import toast from 'react-hot-toast'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

// Types for cart items
export interface CartItem {
  id: string
  productId: string
  variantId?: string
  name: string
  price: number
  image: string
  quantity: number
  maxQuantity: number
  variant?: {
    id: string
    name: string
    value: string
  }
  metadata?: {
    weight?: number
    origin?: string
    vendor?: string
  }
}

export interface ShippingInfo {
  name: string
  phone: string
  address: string
  city: string
  region: string
  ghanaPostGPS?: string
  landmark?: string
}

interface CartStore {
  items: CartItem[]
  isOpen: boolean
  shippingInfo: ShippingInfo | null

  // Cart actions
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void

  // UI state
  openCart: () => void
  closeCart: () => void

  // Shipping
  setShippingInfo: (info: ShippingInfo) => void

  // Computed values
  getTotalItems: () => number
  getTotalPrice: () => number
  getShippingCost: () => number
  getTotalWeight: () => number
  getFinalTotal: () => number

  // Helper functions
  isItemInCart: (productId: string, variantId?: string) => boolean
  getItemQuantity: (productId: string, variantId?: string) => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      shippingInfo: null,

      addItem: (newItem) => {
        const state = get()
        const existingItemIndex = state.items.findIndex(
          item => item.productId === newItem.productId &&
            item.variantId === newItem.variantId
        )

        if (existingItemIndex > -1) {
          // Item exists, update quantity
          const existingItem = state.items[existingItemIndex]
          const newQuantity = existingItem.quantity + 1

          if (newQuantity > existingItem.maxQuantity) {
            toast.error(`Only ${existingItem.maxQuantity} items available for ${existingItem.name}`)
            return
          }

          set(state => ({
            items: state.items.map((item, index) =>
              index === existingItemIndex
                ? { ...item, quantity: newQuantity }
                : item
            )
          }))

          toast.success(`${existingItem.name} quantity updated in your cart! 🛒`, {
            icon: '🎁',
            style: {
              background: '#FC8120',
              color: 'white',
            },
          })
        } else {
          // New item
          const cartItem: CartItem = {
            ...newItem,
            quantity: 1,
            id: `${newItem.productId}-${newItem.variantId || 'default'}`
          }

          set(state => ({
            items: [...state.items, cartItem]
          }))

          toast.success(`${newItem.name} added to your cart! 🎉`, {
            icon: '🎁',
            style: {
              background: '#FC8120',
              color: 'white',
            },
          })
        }
      },

      removeItem: (itemId) => {
        const state = get()
        const item = state.items.find(item => item.id === itemId)

        set(state => ({
          items: state.items.filter(item => item.id !== itemId)
        }))

        if (item) {
          toast.success(`${item.name} removed from cart`, {
            icon: '🗑️',
          })
        }
      },

      updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(itemId)
          return
        }

        const state = get()
        const item = state.items.find(item => item.id === itemId)

        if (!item) return

        if (quantity > item.maxQuantity) {
          toast.error(`Only ${item.maxQuantity} items available`)
          return
        }

        set(state => ({
          items: state.items.map(item =>
            item.id === itemId
              ? { ...item, quantity }
              : item
          )
        }))
      },

      clearCart: () => {
        set({ items: [] })
        toast.success('Cart cleared! 🧹', {
          icon: '🛒',
        })
      },

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      setShippingInfo: (info) => set({ shippingInfo: info }),

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },

      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + (item.price * item.quantity), 0)
      },

      getShippingCost: () => {
        const state = get()
        const totalWeight = state.getTotalWeight()
        const totalValue = state.getTotalPrice()

        // Free shipping for orders over 500 GHS
        if (totalValue >= 500) {
          return 0
        }

        // Weight-based shipping calculation
        // Base rate: 15 GHS for first 2kg, then 5 GHS per additional kg
        const baseRate = 15
        const additionalRate = 5
        const freeWeightLimit = 2

        if (totalWeight <= freeWeightLimit) {
          return baseRate
        }

        const additionalWeight = Math.ceil(totalWeight - freeWeightLimit)
        return baseRate + (additionalWeight * additionalRate)
      },

      getTotalWeight: () => {
        return get().items.reduce((total, item) => {
          const weight = item.metadata?.weight || 0.5 // Default 0.5kg if no weight specified
          return total + (weight * item.quantity)
        }, 0)
      },

      getFinalTotal: () => {
        const state = get()
        return state.getTotalPrice() + state.getShippingCost()
      },

      isItemInCart: (productId, variantId) => {
        return get().items.some(
          item => item.productId === productId &&
            item.variantId === variantId
        )
      },

      getItemQuantity: (productId, variantId) => {
        const item = get().items.find(
          item => item.productId === productId &&
            item.variantId === variantId
        )
        return item?.quantity || 0
      }
    }),
    {
      name: 'singlespine-cart-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
        shippingInfo: state.shippingInfo
      })
    }
  )
)

// Selectors for performance optimization
export const useCartItems = () => useCartStore(state => state.items)
export const useCartTotal = () => useCartStore(state => state.getTotalPrice())
export const useCartCount = () => useCartStore(state => state.getTotalItems())
export const useCartOpen = () => useCartStore(state => state.isOpen)
export const useShippingInfo = () => useCartStore(state => state.shippingInfo)

// African-inspired motivational messages for empty cart
export const getEmptyCartMessage = () => {
  const messages = [
    "Your cart is waiting for some Ghanaian love! 🇬🇭",
    "Time to fill your basket with gifts from home! 🎁",
    "Asante sana! Your family is waiting for your thoughtful gifts 💝",
    "Start your gifting journey - Akwaaba to shopping! 🛍️",
    "Your cart feels empty like fufu without soup! Add some items 🍲",
    "Spread joy across the continent - add gifts to your cart! 🌍"
  ]

  return messages[Math.floor(Math.random() * messages.length)]
}
