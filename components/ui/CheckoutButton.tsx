'use client'

import { useState } from 'react'

import { Button } from '@/components/ui/Button'
import { useAuth } from '@/lib/auth-utils'
import { useCartStore } from '@/lib/store/cart'
import { UIIcon } from '@/components/ui/icon'
import toast from '@/components/ui/toast'

interface CheckoutButtonProps {
  variant?: 'default' | 'outline' | 'ghost' | 'secondary'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
  showIcon?: boolean
  fullWidth?: boolean
  children?: React.ReactNode
}

export default function CheckoutButton({
  variant = 'default',
  size = 'default',
  className = '',
  showIcon = true,
  fullWidth = false,
  children
}: CheckoutButtonProps) {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const { items, getTotalItems, proceedToCheckout } = useCartStore()
  const [isProcessing, setIsProcessing] = useState(false)


  const totalItems = getTotalItems()
  const isEmpty = items.length === 0

  const handleCheckout = async () => {
    setIsProcessing(true)

    try {
      // Check if cart is empty
      if (isEmpty) {
        toast.error('Your cart is empty! Add some items first.', {
          icon: <UIIcon name="cart" size={18} />,
          duration: 3000
        })
        return
      }

      // Use the cart store's proceedToCheckout method which handles authentication
      proceedToCheckout(isAuthenticated)

    } catch (error) {
      console.error('Checkout error:', error)
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const isDisabled = isEmpty || isProcessing || authLoading

  const buttonText = children || (
    <>
      {showIcon && !isProcessing && (
        isAuthenticated ? (
          <UIIcon name="cart" size={16} className="mr-2" />
        ) : (
          <UIIcon name="lock" size={16} className="mr-2" />
        )
      )}
      {isProcessing && (
        <UIIcon name="loading" size={16} spin className="mr-2" />
      )}
      {isProcessing ? (
        'Processing...'
      ) : isEmpty ? (
        'Cart is Empty'
      ) : isAuthenticated ? (
        `Checkout (${totalItems} ${totalItems === 1 ? 'item' : 'items'})`
      ) : (
        'Sign In to Checkout'
      )}
      {!isProcessing && !isEmpty && showIcon && (
        <UIIcon name="arrow-right" size={16} className="ml-2" />
      )}
    </>
  )

  return (
    <Button
      onClick={handleCheckout}
      disabled={isDisabled}
      variant={variant}
      size={size}
      className={`
        ${fullWidth ? 'w-full' : ''}
        ${isEmpty ? 'opacity-50 cursor-not-allowed' : ''}
        ${!isAuthenticated && !isEmpty ? 'bg-orange-600 hover:bg-orange-700' : ''}
        ${className}
      `}
    >
      {buttonText}
    </Button>
  )
}

// Compact version for cart sidebar
export function CompactCheckoutButton() {
  return (
    <CheckoutButton
      size="lg"
      fullWidth
      className="font-semibold cursor-pointer"
      showIcon={true}
    />
  )
}

// Floating checkout button for mobile
export function FloatingCheckoutButton() {
  const { items } = useCartStore()
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)

  if (totalItems === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 md:hidden">
      <CheckoutButton
        size="lg"
        className="rounded-full shadow-lg hover:shadow-xl transition-shadow px-6 py-3"
        showIcon={false}
      >
        <div className="flex items-center gap-2">
          <div className="relative">
            <UIIcon name="cart" size={20} />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {totalItems > 9 ? '9+' : totalItems}
            </span>
          </div>
          {/*<span className="font-medium">Checkout</span>*/}
        </div>
      </CheckoutButton>
    </div>
  )
}

// Checkout button with cart summary
export function CheckoutButtonWithSummary() {
  const { getTotalPrice, getTotalItems } = useCartStore()
  const totalPrice = getTotalPrice()
  const totalItems = getTotalItems()

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>{totalItems} {totalItems === 1 ? 'item' : 'items'}</span>
        <span>₵{totalPrice.toFixed(2)}</span>
      </div>
      <CheckoutButton fullWidth size="lg" />
    </div>
  )
}
