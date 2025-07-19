'use client'

import { useEffect, useState } from 'react'
import CartSidebar from '@/components/ui/CartSidebar'
import { useCartStore } from '@/lib/store/cart'

interface CartProviderProps {
  children: React.ReactNode
}

export default function CartProvider({ children }: CartProviderProps) {
  const [isMounted, setIsMounted] = useState(false)
  const { isOpen, closeCart } = useCartStore()

  // Prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return <>{children}</>
  }

  return (
    <>
      {children}
      <CartSidebar isOpen={isOpen} onClose={closeCart} />
    </>
  )
}
