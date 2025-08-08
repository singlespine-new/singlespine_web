'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth, useRequireAuth } from '@/lib/auth-utils'
import { Button } from '@/components/ui/Button'
import { ShoppingCart, Lock, CreditCard, MapPin, User, CheckCircle, Phone, AlertCircle } from 'lucide-react'
import toast from '@/components/ui/toast'
import Link from 'next/link'
import Image from 'next/image'
import { useCartStore } from '@/lib/store/cart'
import SmartPhonePrompt from '@/components/PhoneNumberPrompt/SmartPhonePrompt'
import { useCheckoutPhonePrompt } from '@/components/PhoneNumberPrompt/usePhonePrompt'

interface CartItem {
  id: string
  productId: string
  name: string
  price: number
  quantity: number
  image: string
  variant?: {
    id: string
    name: string
    value: string
  }
}

interface CartSummary {
  subtotal: number
  shippingCost: number
  tax: number
  total: number
  totalItems: number
}

export default function CheckoutPage() {
  const { isAuthenticated, isLoading } = useRequireAuth()
  const { user } = useAuth()
  const router = useRouter()
  const { items, getTotalItems, getTotalPrice, getShippingCost, getFinalTotal, clearCart } = useCartStore()

  // Phone prompt hook
  const {
    isOpen: phonePromptOpen,
    showPrompt: showPhonePromptModal,
    hidePrompt: hidePhonePrompt,
    savePhoneNumber,
    needsPhoneNumber,
    currentPhone,
    userName
  } = useCheckoutPhonePrompt()

  const [submitting, setSubmitting] = useState(false)
  const [showPhoneRequired, setShowPhoneRequired] = useState(false)

  // Shipping Information
  const [shippingInfo, setShippingInfo] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    region: '',
    additionalInfo: ''
  })

  // Transform cart store items to local format
  const cartItems: CartItem[] = items.map(item => ({
    id: item.id,
    productId: item.productId,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    image: item.image,
    variant: item.variant
  }))

  const cartSummary: CartSummary = {
    subtotal: getTotalPrice(),
    shippingCost: getShippingCost(),
    tax: getTotalPrice() * 0.125, // 12.5% VAT
    total: getFinalTotal() + (getTotalPrice() * 0.125),
    totalItems: getTotalItems()
  }

  // Pre-fill user information
  useEffect(() => {
    if (user) {
      setShippingInfo(prev => ({
        ...prev,
        fullName: user.name || '',
        email: user.email || '',
        phone: user.phoneNumber || ''
      }))

      // Show gentle alert if phone is missing
      if (!user.phoneNumber && isAuthenticated) {
        const timer = setTimeout(() => {
          setShowPhoneRequired(true)
        }, 1500)
        return () => clearTimeout(timer)
      }
    }
  }, [user, isAuthenticated])

  const handleInputChange = (field: string, value: string) => {
    setShippingInfo(prev => ({
      ...prev,
      [field]: value
    }))

    // Auto-save phone number to user profile when they type it
    if (field === 'phone' && value && user && !user.phoneNumber && value.length >= 10) {
      updateUserPhone(value)
    }
  }

  const updateUserPhone = async (phone: string) => {
    try {
      const response = await fetch('/api/user/update-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      })

      if (response.ok) {
        toast.success('Phone number saved to your profile! 📱', {
          duration: 3000,
          icon: <CheckCircle className="w-4 h-4" />
        })
      }
    } catch (error) {
      console.warn('Failed to auto-save phone number:', error)
    }
  }

  const validateForm = () => {
    const required = ['fullName', 'phone', 'address', 'city', 'region']
    const missing = required.filter(field => !shippingInfo[field as keyof typeof shippingInfo].trim())

    if (missing.length > 0) {
      // If phone is missing and user doesn't have one, show phone prompt
      if (missing.includes('phone') && needsPhoneNumber) {
        showPhonePromptModal('checkout')
        return false
      }
      toast.error(`Please fill in: ${missing.join(', ')}`)
      return false
    }

    return true
  }

  const handleCheckout = async () => {
    if (!validateForm()) return

    if (!cartItems.length) {
      toast.error('Your cart is empty')
      return
    }

    setSubmitting(true)

    try {
      // Update user phone number if they filled it in checkout form and it's different
      if (shippingInfo.phone && shippingInfo.phone !== currentPhone) {
        try {
          await savePhoneNumber(shippingInfo.phone)
        } catch (error) {
          console.warn('Failed to save phone number:', error)
          // Continue with checkout even if phone save fails
        }
      }

      // In a real app, this would create an order
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate API call

      // Clear cart after successful order
      await clearCart()

      toast.success('Order placed successfully! 🎉', {
        duration: 5000,
        icon: <CheckCircle className="w-5 h-5" />
      })

      // Redirect to order confirmation or orders page
      router.push('/orders?success=true')
    } catch (error) {
      console.error('Checkout error:', error)
      toast.error('Failed to place order. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading checkout...</p>
        </div>
      </div>
    )
  }

  // Show empty cart state
  if (!cartItems.length) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <ShoppingCart className="w-24 h-24 text-muted-foreground mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-foreground mb-4">Your cart is empty</h1>
            <p className="text-muted-foreground mb-8">
              Add some products to your cart before proceeding to checkout.
            </p>
            <Button asChild size="lg">
              <Link href="/products">Continue Shopping</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Link href="/" className="hover:text-primary">Home</Link>
            <span>/</span>
            <Link href="/products" className="hover:text-primary">Products</Link>
            <span>/</span>
            <span className="text-foreground">Checkout</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Lock className="w-8 h-8 text-primary" />
            Secure Checkout
          </h1>
          <p className="text-muted-foreground mt-2">
            Complete your order and send love to your family in Ghana
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Shipping Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Phone Number Alert */}
            {showPhoneRequired && needsPhoneNumber && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-medium text-amber-800 mb-1">
                      Phone Number Required
                    </h3>
                    <p className="text-sm text-amber-700 mb-3">
                      We need your phone number to coordinate delivery with you and provide order updates.
                    </p>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => showPhonePromptModal('checkout')}
                        size="sm"
                        className="bg-amber-600 hover:bg-amber-700 text-white"
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        Add Phone Number
                      </Button>
                      <Button
                        onClick={() => setShowPhoneRequired(false)}
                        size="sm"
                        variant="ghost"
                        className="text-amber-700 hover:text-amber-800"
                      >
                        I'll add it below
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* User Info */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Your Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={shippingInfo.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    className="w-full px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={shippingInfo.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
                      placeholder="0XXX XXX XXX"
                    />
                    {needsPhoneNumber && (
                      <button
                        onClick={() => showPhonePromptModal('checkout')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary hover:text-primary/80"
                        title="Use phone prompt"
                      >
                        <Phone className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={shippingInfo.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
                    placeholder="your@email.com"
                  />
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Delivery Address in Ghana
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Street Address *
                  </label>
                  <textarea
                    value={shippingInfo.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
                    placeholder="Enter the full delivery address"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      value={shippingInfo.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className="w-full px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
                      placeholder="e.g., Accra, Kumasi"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Region *
                    </label>
                    <select
                      value={shippingInfo.region}
                      onChange={(e) => handleInputChange('region', e.target.value)}
                      className="w-full px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
                    >
                      <option value="">Select Region</option>
                      <option value="Greater Accra">Greater Accra</option>
                      <option value="Ashanti">Ashanti</option>
                      <option value="Western">Western</option>
                      <option value="Central">Central</option>
                      <option value="Eastern">Eastern</option>
                      <option value="Northern">Northern</option>
                      <option value="Upper East">Upper East</option>
                      <option value="Upper West">Upper West</option>
                      <option value="Volta">Volta</option>
                      <option value="Brong Ahafo">Brong Ahafo</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Additional Information
                  </label>
                  <textarea
                    value={shippingInfo.additionalInfo}
                    onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
                    rows={2}
                    className="w-full px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
                    placeholder="Landmarks, delivery instructions, recipient's phone number, etc."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            {/* Cart Items */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Order Summary</h2>
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-3 p-3 bg-muted/30 rounded-lg">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={64}
                      height={64}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground truncate">{item.name}</h3>
                      {item.variant && (
                        <p className="text-sm text-muted-foreground">
                          {item.variant.name}: {item.variant.value}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-sm text-muted-foreground">Qty: {item.quantity}</span>
                        <span className="font-semibold text-foreground">₵{item.price}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing Summary */}
            {cartSummary && (
              <div className="bg-card border border-border rounded-xl p-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-foreground">
                    <span>Subtotal ({cartSummary.totalItems} items)</span>
                    <span>₵{cartSummary.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-foreground">
                    <span>Delivery Fee</span>
                    <span>{cartSummary.shippingCost > 0 ? `₵${cartSummary.shippingCost.toFixed(2)}` : 'FREE'}</span>
                  </div>
                  <div className="flex justify-between text-foreground">
                    <span>VAT (12.5%)</span>
                    <span>₵{cartSummary.tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-border pt-3">
                    <div className="flex justify-between text-lg font-bold text-foreground">
                      <span>Total</span>
                      <span>₵{cartSummary.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {cartSummary.shippingCost === 0 && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800 font-medium">
                      🎉 Free delivery on orders over ₵100!
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Checkout Button */}
            <Button
              onClick={handleCheckout}
              disabled={submitting || !cartItems.length}
              className="w-full h-12 text-lg font-semibold"
              size="lg"
            >
              {submitting ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Processing...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Place Order - ₵{cartSummary?.total.toFixed(2)}
                </div>
              )}
            </Button>

            {/* Security Notice */}
            <div className="text-center text-sm text-muted-foreground">
              <Lock className="w-4 h-4 inline mr-1" />
              Your information is secure and encrypted
            </div>
          </div>
        </div>
      </div>

      {/* Smart Phone Prompt */}
      <SmartPhonePrompt
        isOpen={phonePromptOpen}
        onClose={hidePhonePrompt}
        onSave={async (phone: string) => {
          await savePhoneNumber(phone)
          // Update shipping info with the new phone number
          setShippingInfo(prev => ({ ...prev, phone }))
          setShowPhoneRequired(false)
        }}
        context="checkout"
        currentPhone={currentPhone}
        userName={userName}
      />
    </div>
  )
}
