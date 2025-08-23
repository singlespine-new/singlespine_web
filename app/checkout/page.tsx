'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth, useRequireAuth } from '@/lib/auth-utils'
import { Button } from '@/components/ui/Button'
import { ShoppingCart, Lock, CreditCard, MapPin, User, CheckCircle, Phone, AlertCircle, Shield, Truck, Clock, Star, Package, Gift, ArrowRight, ChevronDown, Zap, TrendingUp, ArrowLeft, Pencil, Plus, Edit3, Trash2, CheckCircle2, Users, Heart, X } from 'lucide-react'
import toast from '@/components/ui/toast'
import Link from 'next/link'
import Image from 'next/image'
import { useCartStore } from '@/lib/store/cart'
import SmartPhonePrompt from '@/components/PhoneNumberPrompt/SmartPhonePrompt'
import { useCheckoutPhonePrompt } from '@/components/PhoneNumberPrompt/usePhonePrompt'
import PaymentMethodManager from '@/components/PaymentMethods/PaymentMethodManager'

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

interface RecipientInfo {
  fullName: string
  phone: string
  alternatePhone: string
  address: string
  city: string
  region: string
  landmark: string
  relationship: string
  notes: string
}

interface PaymentMethod {
  id: string
  type: 'CARD' | 'MOBILE_MONEY' | 'BANK_TRANSFER' | 'CASH_ON_DELIVERY'
  displayName: string
  nickname?: string
  isDefault: boolean
  cardLast4?: string
  cardBrand?: string
  cardExpiryMonth?: number
  cardExpiryYear?: number
  momoProvider?: string
  bankName?: string
  accountHolderName?: string
  createdAt: string
}

export default function CheckoutPage() {
  const { isAuthenticated, isLoading } = useRequireAuth()
  const { user } = useAuth()
  const router = useRouter()
  const { items, getTotalItems, getTotalPrice, getShippingCost, getFinalTotal, clearCart, setShippingInfo: persistShippingInfo, shippingInfo: savedShippingInfo } = useCartStore()

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
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [deliveryOption, setDeliveryOption] = useState<'standard' | 'express'>('standard')
  const [savedAddresses, setSavedAddresses] = useState<Array<{ id: string, label: string, fullName: string, phone: string, address: string, city: string, region: string, additionalInfo?: string }>>([])
  const [selectedSavedAddressId, setSelectedSavedAddressId] = useState<string>('')
  const [showRecipientForm, setShowRecipientForm] = useState(false)
  const [hasCheckedSavedRecipients, setHasCheckedSavedRecipients] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null)
  const [showPaymentStep, setShowPaymentStep] = useState(false)

  // Recipient Information (Primary focus for diaspora orders)
  const [recipientInfo, setRecipientInfo] = useState<RecipientInfo>({
    fullName: '',
    phone: '',
    alternatePhone: '',
    address: '',
    city: '',
    region: '',
    landmark: '',
    relationship: '',
    notes: ''
  })

  // Your Information (Order placer)
  const [orderPlacer, setOrderPlacer] = useState({
    fullName: '',
    phone: '',
    email: ''
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

  const baseShipping = getShippingCost()
  const subtotal = getTotalPrice()
  const selectedShippingCost = deliveryOption === 'express' ? baseShipping + 20 : baseShipping
  const tax = subtotal * 0.125 // 12.5% VAT
  const cartSummary: CartSummary = {
    subtotal,
    shippingCost: selectedShippingCost,
    tax,
    total: subtotal + selectedShippingCost + tax,
    totalItems: getTotalItems()
  }

  const formatMoney = (n: number) =>
    `₵${Number(n ?? 0).toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  // Pre-fill user information and load saved data/addresses
  useEffect(() => {
    // Merge persisted shipping info first for recipient
    if (savedShippingInfo) {
      setRecipientInfo(prev => ({
        ...prev,
        fullName: prev.fullName || savedShippingInfo.name || '',
        phone: prev.phone || savedShippingInfo.phone || '',
        address: prev.address || savedShippingInfo.address || '',
        city: prev.city || savedShippingInfo.city || '',
        region: prev.region || savedShippingInfo.region || ''
      }))
    }

    // Fill order placer info with user data
    if (user) {
      setOrderPlacer(prev => ({
        ...prev,
        fullName
          : prev.fullName || user.name || '',
        email: prev.email || user.email || '',
        phone: prev.phone || user.phoneNumber || ''
      }))

      // Show gentle alert if phone is missing
      if (!user.phoneNumber && isAuthenticated) {
        const timer = setTimeout(() => {
          setShowPhoneRequired(true)
        }, 1500)
        return () => clearTimeout(timer)
      }
    }

    // Fetch saved addresses (best effort)
    if (isAuthenticated) {
      let active = true
        ; (async () => {
          try {
            const res = await fetch('/api/user/addresses')
            if (!res.ok) return
            const data = await res.json()
            if (!active) return
            if (Array.isArray(data?.addresses)) {
              setSavedAddresses(data.addresses)
              setHasCheckedSavedRecipients(true)
              // If no saved recipients, show the form immediately
              if (data.addresses.length === 0) {
                setShowRecipientForm(true)
              }
            }
          } catch {
            // ignore
          }
        })()
      return () => { active = false }
    }
  }, [user, isAuthenticated, savedShippingInfo])

  const handleRecipientChange = (field: keyof RecipientInfo, value: string) => {
    setRecipientInfo(prev => {
      const next = { ...prev, [field]: value }

      // Persist recipient info to cart store/localStorage for prefill
      try {
        persistShippingInfo({
          name: next.fullName,
          phone: next.phone,
          address: next.address,
          city: next.city,
          region: next.region
        } as any)
      } catch { }

      return next
    })

    // Clear field error as user types
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleOrderPlacerChange = (field: string, value: string) => {
    setOrderPlacer(prev => ({ ...prev, [field]: value }))
    // Clear field error as user types
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Validate order placer (only if not authenticated)
    if (!isAuthenticated) {
      if (!orderPlacer.fullName.trim()) {
        newErrors.placer_fullName = 'Your name is required'
      }
      if (!orderPlacer.email.trim()) {
        newErrors.placer_email = 'Your email is required'
      } else if (!/\S+@\S+\.\S+/.test(orderPlacer.email)) {
        newErrors.placer_email = 'Please enter a valid email'
      }
      if (!orderPlacer.phone.trim()) {
        newErrors.placer_phone = 'Your phone number is required'
      }
    }

    // Validate recipient information
    if (!recipientInfo.fullName.trim()) {
      newErrors.recipient_fullName = "Recipient's name is required"
    }
    if (!recipientInfo.phone.trim()) {
      newErrors.recipient_phone = "Recipient's phone is required"
    }
    if (!recipientInfo.address.trim()) {
      newErrors.recipient_address = 'Delivery address is required'
    }
    if (!recipientInfo.city.trim()) {
      newErrors.recipient_city = 'City is required'
    }
    if (!recipientInfo.region.trim()) {
      newErrors.recipient_region = 'Region is required'
    }
    if (!recipientInfo.relationship.trim()) {
      newErrors.recipient_relationship = 'Relationship is required'
    }

    setErrors(newErrors)

    // Debug logging
    if (Object.keys(newErrors).length > 0) {
      console.log('Validation errors:', newErrors)
      console.log('Recipient info:', recipientInfo)
      console.log('Order placer:', orderPlacer)
      console.log('Is authenticated:', isAuthenticated)
    }

    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      // Show specific error for missing fields
      const errorCount = Object.keys(errors).length
      if (errorCount === 1) {
        const fieldName = Object.keys(errors)[0].replace('recipient_', '').replace('placer_', '')
        toast.error(`Please fill in the ${fieldName.replace(/([A-Z])/g, ' $1').toLowerCase()} field`)
      } else {
        toast.error(`Please fill in ${errorCount} required fields`)
      }

      // Scroll to first error
      const firstErrorElement = document.querySelector('[aria-invalid="true"]')
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      return
    }

    if (needsPhoneNumber) {
      showPhonePromptModal()
      return
    }

    // Check if payment method is selected
    if (!selectedPaymentMethod) {
      setShowPaymentStep(true)
      return
    }

    setSubmitting(true)

    try {
      const orderData = {
        items: cartItems,
        recipient: recipientInfo,
        orderPlacer: isAuthenticated ? {

          fullName: user?.name || orderPlacer.fullName,
          email: user?.email || orderPlacer.email,
          phone: user?.phoneNumber || orderPlacer.phone
        } : orderPlacer,
        delivery: {
          option: deliveryOption,
          cost: selectedShippingCost
        },
        summary: cartSummary,
        paymentMethod: selectedPaymentMethod
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(error || 'Failed to create order')
      }

      const { orderId } = await response.json()
      clearCart()
      toast.success('Order placed successfully! 🎉')
      router.push(`/orders/${orderId}`)
    } catch (error) {
      console.error('Order submission error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create order. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSavedAddressSelect = (addressId: string) => {
    const address = savedAddresses.find(addr => addr.id === addressId)
    if (address) {
      setRecipientInfo(prev => ({
        ...prev,
        fullName: address.fullName,
        phone: address.phone,
        address: address.address,
        city: address.city,
        region: address.region,
        landmark: address.additionalInfo || '',
        // Try to extract relationship from label or set default
        relationship: address.label.includes('Mother') ? 'Mother' :
          address.label.includes('Father') ? 'Father' :
            address.label.includes('Sister') ? 'Sister' :
              address.label.includes('Brother') ? 'Brother' :
                address.label.includes('Grandmother') ? 'Grandmother' :
                  address.label.includes('Grandfather') ? 'Grandfather' :
                    'Other',
        notes: prev.notes // Keep any existing notes
      }))
      setSelectedSavedAddressId(addressId)

      // Clear any recipient-related errors when an address is selected
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors.recipient_fullName
        delete newErrors.recipient_phone
        delete newErrors.recipient_address
        delete newErrors.recipient_city
        delete newErrors.recipient_region
        delete newErrors.recipient_relationship
        return newErrors
      })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading checkout...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
        <div className="text-center space-y-6 max-w-md">
          <div className="p-6 bg-card/50 backdrop-blur border border-border/50 rounded-3xl">
            <Lock className="w-16 h-16 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
            <p className="text-muted-foreground mb-6">Please sign in to continue with your checkout</p>
            <div className="space-y-3">
              <Button asChild className="w-full h-12 rounded-xl">
                <Link href="/auth/signin">Sign In</Link>
              </Button>
              <Button asChild variant="outline" className="w-full h-12 rounded-xl">
                <Link href="/auth/signup">Create Account</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
        <div className="text-center space-y-6 max-w-md">
          <div className="p-8 bg-card/50 backdrop-blur border border-border/50 rounded-3xl">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Your Cart is Empty</h2>
            <p className="text-muted-foreground mb-6">Add some products to continue with checkout</p>
            <Button asChild className="w-full h-12 rounded-xl">
              <Link href="/products">Browse Products</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="p-2 h-auto rounded-xl"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">Checkout</h1>
                <p className="text-sm text-muted-foreground">Complete your order</p>
              </div>
            </div>

            {/* Progress Steps */}
            <div className="hidden md:flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium text-primary">Cart</span>
              </div>
              <div className="w-8 h-0.5 bg-primary"></div>
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${showPaymentStep ? 'bg-primary text-white' : 'bg-primary text-white'
                  }`}>
                  {showPaymentStep ? <CheckCircle2 className="w-4 h-4" /> : '1'}
                </div>
                <span className={`text-sm font-medium ${showPaymentStep ? 'text-primary' : 'text-primary'}`}>Details</span>
              </div>
              <div className={`w-8 h-0.5 ${showPaymentStep ? 'bg-primary' : 'bg-muted'}`}></div>
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${showPaymentStep ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                  }`}>
                  {showPaymentStep && selectedPaymentMethod ? <CheckCircle2 className="w-4 h-4" /> : '2'}
                </div>
                <span className={`text-sm ${showPaymentStep ? 'font-medium text-primary' : 'text-muted-foreground'}`}>Payment</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column - Form */}
          <div className="lg:col-span-2 space-y-6">

            {/* Recipient Selection */}
            <div className={`bg-white rounded-2xl border p-6 shadow-sm ${Object.keys(errors).some(key => key.startsWith('recipient_'))
              ? 'border-red-200 bg-red-50/30'
              : 'border-border/20'}`}>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <Heart className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Send to Ghana</h2>
                  <p className="text-sm text-muted-foreground">Who will receive this order?</p>
                </div>
              </div>

              {/* Saved Recipients */}
              {savedAddresses.length > 0 && !showRecipientForm && (
                <div className="space-y-4">
                  <div className="grid gap-3">
                    {savedAddresses.map((address) => (
                      <div
                        key={address.id}
                        onClick={() => handleSavedAddressSelect(address.id)}
                        className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${selectedSavedAddressId === address.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border/30 hover:border-border/60'
                          }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">{address.fullName}</h3>
                              <span className="text-xs bg-muted px-2 py-1 rounded-full">{address.label}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">{address.phone}</p>
                            <p className="text-sm text-muted-foreground">{address.city}, {address.region}</p>
                          </div>
                          {selectedSavedAddressId === address.id && (
                            <CheckCircle className="w-5 h-5 text-primary" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => setShowRecipientForm(true)}
                    className="w-full h-12 rounded-xl border-dashed"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Recipient
                  </Button>
                </div>
              )}

              {/* New Recipient Form */}
              {(showRecipientForm || savedAddresses.length === 0) && (
                <div className="space-y-6">
                  {savedAddresses.length > 0 && (
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">New Recipient Details</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowRecipientForm(false)}
                        className="text-muted-foreground"
                      >
                        Cancel
                      </Button>
                    </div>
                  )}

                  {Object.keys(errors).some(key => key.startsWith('recipient_')) && (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                      <div className="flex items-center gap-2 text-amber-800 text-sm font-medium">
                        <AlertCircle className="w-4 h-4" />
                        Please complete all required recipient information
                      </div>
                      <p className="text-xs text-amber-700 mt-1">
                        All fields marked with * are required to ensure successful delivery
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Full Name *</label>
                      <input
                        type="text"
                        value={recipientInfo.fullName}
                        onChange={(e) => handleRecipientChange('fullName', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${errors.recipient_fullName ? 'border-red-300 bg-red-50' : 'border-input'}`}
                        placeholder="e.g., Kwame Asante"
                        aria-invalid={!!errors.recipient_fullName}
                      />
                      {errors.recipient_fullName && (
                        <p className="text-xs text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.recipient_fullName}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Relationship *</label>
                      <select
                        value={recipientInfo.relationship}
                        onChange={(e) => handleRecipientChange('relationship', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none ${errors.recipient_relationship ? 'border-red-300 bg-red-50' : 'border-input'}`}
                        aria-invalid={!!errors.recipient_relationship}
                      >
                        <option value="">Select relationship</option>
                        <option value="Mother">Mother</option>
                        <option value="Father">Father</option>
                        <option value="Sister">Sister</option>
                        <option value="Brother">Brother</option>
                        <option value="Grandmother">Grandmother</option>
                        <option value="Grandfather">Grandfather</option>
                        <option value="Aunt">Aunt</option>
                        <option value="Uncle">Uncle</option>
                        <option value="Cousin">Cousin</option>
                        <option value="Friend">Friend</option>
                        <option value="Spouse">Spouse</option>
                        <option value="Child">Child</option>
                        <option value="Other">Other</option>
                      </select>
                      {errors.recipient_relationship && (
                        <p className="text-xs text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.recipient_relationship}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Phone Number *</label>
                      <input
                        type="tel"
                        value={recipientInfo.phone}
                        onChange={(e) => handleRecipientChange('phone', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${errors.recipient_phone ? 'border-red-300 bg-red-50' : 'border-input'}`}
                        placeholder="0XXX XXX XXX"
                        aria-invalid={!!errors.recipient_phone}
                      />
                      {errors.recipient_phone && (
                        <p className="text-xs text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.recipient_phone}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Alternative Phone</label>
                      <input
                        type="tel"
                        value={recipientInfo.alternatePhone}
                        onChange={(e) => handleRecipientChange('alternatePhone', e.target.value)}
                        className="w-full px-4 py-3 border border-input rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        placeholder="Backup contact (optional)"
                      />
                    </div>

                    <div className="md:col-span-2 space-y-2">
                      <label className="text-sm font-medium">Delivery Address *</label>
                      <textarea
                        value={recipientInfo.address}
                        onChange={(e) => handleRecipientChange('address', e.target.value)}
                        rows={3}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none ${errors.recipient_address ? 'border-red-300 bg-red-50' : 'border-input'}`}
                        placeholder="Street address, house number, area..."
                        aria-invalid={!!errors.recipient_address}
                      />
                      {errors.recipient_address && (
                        <p className="text-xs text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.recipient_address}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">City *</label>
                      <input
                        type="text"
                        value={recipientInfo.city}
                        onChange={(e) => handleRecipientChange('city', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${errors.recipient_city ? 'border-red-300 bg-red-50' : 'border-input'}`}
                        placeholder="e.g., Accra, Kumasi"
                        aria-invalid={!!errors.recipient_city}
                      />
                      {errors.recipient_city && (
                        <p className="text-xs text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.recipient_city}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">

                      <label className="text-sm font-medium">Region *</label>
                      <select
                        value={recipientInfo.region}
                        onChange={(e) => handleRecipientChange('region', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none ${errors.recipient_region ? 'border-red-300 bg-red-50' : 'border-input'}`}
                        aria-invalid={!!errors.recipient_region}
                      >
                        <option value="">Select region</option>
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
                      {errors.recipient_region && (
                        <p className="text-xs text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.recipient_region}
                        </p>
                      )}
                    </div>

                    <div className="md:col-span-2 space-y-2">
                      <label className="text-sm font-medium">Landmark/Additional Info</label>
                      <input
                        type="text"
                        value={recipientInfo.landmark}
                        onChange={(e) => handleRecipientChange('landmark', e.target.value)}
                        className="w-full px-4 py-3 border border-input rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        placeholder="Near mosque, school, etc. (optional)"
                      />
                    </div>

                    <div className="md:col-span-2 space-y-2">
                      <label className="text-sm font-medium">Special Instructions</label>
                      <textarea
                        value={recipientInfo.notes}
                        onChange={(e) => handleRecipientChange('notes', e.target.value)}
                        rows={2}
                        className="w-full px-4 py-3 border border-input rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                        placeholder="Any special delivery instructions... (optional)"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Delivery Options */}
            <div className="bg-white rounded-2xl border border-border/20 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <Truck className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Delivery Options</h2>
                  <p className="text-sm text-muted-foreground">Choose your preferred delivery speed</p>
                </div>
              </div>

              <div className="grid gap-4">
                <div
                  onClick={() => setDeliveryOption('standard')}
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${deliveryOption === 'standard'
                    ? 'border-primary bg-primary/5'
                    : 'border-border/30 hover:border-border/60'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <Truck className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Standard Delivery</h3>
                        <p className="text-sm text-muted-foreground">5-7 business days</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatMoney(baseShipping)}</p>
                      {deliveryOption === 'standard' && (
                        <CheckCircle className="w-5 h-5 text-primary ml-2 inline" />
                      )}
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => setDeliveryOption('express')}
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${deliveryOption === 'express'
                    ? 'border-primary bg-primary/5'
                    : 'border-border/30 hover:border-border/60'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-50 rounded-lg">
                        <Zap className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Express Delivery</h3>
                        <p className="text-sm text-muted-foreground">2-3 business days</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatMoney(baseShipping + 20)}</p>
                      {deliveryOption === 'express' && (
                        <CheckCircle className="w-5 h-5 text-primary ml-2 inline" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-border/20 p-6 shadow-sm sticky top-24">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <Package className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Order Summary</h2>
                  <p className="text-sm text-muted-foreground">{cartItems.length} items</p>
                </div>
              </div>

              {/* Cart Items */}
              <div className="space-y-4 mb-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-3 p-3 bg-muted/30 rounded-xl">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={60}
                      height={60}
                      className="w-15 h-15 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm truncate">{item.name}</h3>
                      {item.variant && (
                        <p className="text-xs text-muted-foreground">
                          {item.variant.name}: {item.variant.value}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-muted-foreground">Qty: {item.quantity}</span>
                        <span className="font-semibold text-sm">{formatMoney(item.price * item.quantity)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="space-y-3 pt-4 border-t border-border/20">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{formatMoney(cartSummary.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>{formatMoney(cartSummary.shippingCost)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax (12.5%)</span>
                  <span>{formatMoney(cartSummary.tax)}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg pt-3 border-t border-border/20">
                  <span>Total</span>
                  <span className="text-primary">{formatMoney(cartSummary.total)}</span>
                </div>
              </div>

              {/* Trust Badges
 */}
              <div className="grid grid-cols-3 gap-2 mt-6 pt-6 border-t border-border/20">
                <div className="text-center">
                  <Shield className="w-6 h-6 text-green-500 mx-auto mb-1" />
                  <span className="text-xs text-muted-foreground">Secure</span>
                </div>
                <div className="text-center">
                  <Truck className="w-6 h-6 text-blue-500 mx-auto mb-1" />
                  <span className="text-xs text-muted-foreground">Fast</span>
                </div>
                <div className="text-center">
                  <CheckCircle className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
                  <span className="text-xs text-muted-foreground">Reliable</span>
                </div>
              </div>

              {/* Place Order Button */}
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className={`w-full h-14 mt-6 rounded-xl text-lg font-semibold ${Object.keys(errors).length > 0
                  ? 'bg-red-600 hover:bg-red-700'
                  : ''
                  }`}
              >
                {submitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Processing...
                  </div>
                ) : Object.keys(errors).length > 0 ? (
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Fix {Object.keys(errors).length} Error{Object.keys(errors).length > 1 ? 's' : ''}
                  </div>
                ) : selectedPaymentMethod ? (
                  <div className="flex items-center gap-2">
                    <Lock className="w-5 h-5" />
                    Place Order - {formatMoney(cartSummary.total)}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Continue to Payment
                  </div>
                )}
              </Button>

              {Object.keys(errors).length > 0 && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <div className="flex items-center gap-2 text-red-800 text-sm font-medium mb-2">
                    <AlertCircle className="w-4 h-4" />
                    Please fix the following errors:
                  </div>
                  <ul className="text-xs text-red-700 space-y-1 mb-3">
                    {Object.entries(errors).map(([key, message]) => (
                      <li key={key} className="flex items-center gap-1">
                        <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                        {message}
                      </li>
                    ))}
                  </ul>
                  <div className="flex items-center gap-2 text-xs text-red-600">
                    <CheckCircle className="w-3 h-3" />
                    <span>Tip: Select a saved address above or fill in all required fields manually</span>
                  </div>
                </div>
              )}

              <p className="text-xs text-muted-foreground text-center mt-3">
                By placing this order, you agree to our terms and conditions
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Method Selection Modal */}
      {
        showPaymentStep && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold">Select Payment Method</h2>
                  <p className="text-sm text-muted-foreground">Choose how you'd like to pay</p>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => setShowPaymentStep(false)}
                  className="p-2"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <PaymentMethodManager
                onPaymentMethodSelect={(paymentMethod) => {
                  setSelectedPaymentMethod(paymentMethod)
                  setShowPaymentStep(false)
                  setCurrentStep(3)
                  toast.success('Payment method selected!')
                }}
                selectedPaymentMethodId={selectedPaymentMethod?.id}
                className="mb-6"
              />

              {selectedPaymentMethod && (
                <div className="p-4 bg-primary/5 rounded-xl border border-primary/20 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-primary" />
                    <span className="font-medium text-primary">Payment Method Selected</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    You can proceed with your order using the selected payment method.
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowPaymentStep(false)}
                  className="flex-1 h-12 rounded-xl"
                >
                  Back to Details
                </Button>
                <Button
                  onClick={() => {
                    if (selectedPaymentMethod) {
                      setShowPaymentStep(false)
                      handleSubmit()
                    } else {
                      toast.error('Please select a payment method')
                    }
                  }}
                  disabled={!selectedPaymentMethod}
                  className="flex-1 h-12 rounded-xl"
                >
                  Continue to Order
                </Button>
              </div>
            </div>
          </div>
        )
      }

      {/* Smart Phone Prompt */}
      <SmartPhonePrompt
        isOpen={phonePromptOpen}
        onClose={hidePhonePrompt}
        onSave={async (phone: string) => {
          await savePhoneNumber(phone)
          setOrderPlacer(prev => ({ ...prev, phone }))
          setShowPhoneRequired(false)
        }}
        context="checkout"
        currentPhone={currentPhone}
        userName={userName}
      />
    </div >
  )
}
