'use client'

import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth, useRequireAuth } from '@/lib/auth-utils'
import { Button } from '@/components/ui/Button'
import {
  ShoppingCart,
  Lock,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Shield,
  Truck,
  Package,
  Zap,
  ArrowLeft,
  Plus,
  CheckCircle2,
  Heart,
  MapPin,
  User,
  Phone,
  ChevronRight,
  ChevronLeft,
  Percent,
  Loader2
} from 'lucide-react'
import toast from '@/components/ui/toast'
import Link from 'next/link'
import Image from 'next/image'
import { useCartStore } from '@/lib/store/cart'
import SmartPhonePrompt from '@/components/PhoneNumberPrompt/SmartPhonePrompt'
import { useCheckoutPhonePrompt } from '@/components/PhoneNumberPrompt/usePhonePrompt'
import PaymentMethodManager from '@/components/PaymentMethods/PaymentMethodManager'

/**
 * TYPES
 */
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
  discount: number
  total: number
  totalItems: number
}

interface RecipientInfo {
  addressId?: string
  recipientName: string
  phone: string
  alternatePhone: string
  addressLine: string
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

type StepId = 'recipient' | 'delivery' | 'payment' | 'review'

interface Step {
  id: StepId
  title: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  description: string
  requireValidation?: boolean
}

/**
 * UI SUB COMPONENTS (inline to keep single-file requirement)
 */
const SectionCard = ({
  title,
  icon: Icon,
  description,
  children,
  accent,
  actions,
  id
}: {
  title: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  description?: string
  children: React.ReactNode
  accent?: 'primary' | 'neutral' | 'danger'
  actions?: React.ReactNode
  id?: string
}) => {
  const accentClasses =
    accent === 'primary'
      ? 'border-primary/30'
      : accent === 'danger'
        ? 'border-red-300'
        : 'border-border/20'

  return (
    <section
      id={id}
      className={`rounded-2xl bg-white/90 backdrop-blur-sm border ${accentClasses} shadow-sm focus-within:ring-2 focus-within:ring-primary/20 transition`}
    >
      <div className="flex items-start gap-3 p-6 pb-0">
        <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0 mt-0.5">
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold leading-tight">{title}</h2>
              {description && (
                <p className="text-xs md:text-sm text-muted-foreground mt-1">
                  {description}
                </p>
              )}
            </div>
            {actions}
          </div>
        </div>
      </div>
      <div className="p-6 pt-4">{children}</div>
    </section>
  )
}

const ProgressStepper = ({
  steps,
  currentStep,
  onNavigate
}: {
  steps: Step[]
  currentStep: StepId
  onNavigate: (id: StepId) => void
}) => {
  return (
    <nav
      aria-label="Checkout progress"
      className="hidden lg:flex items-center gap-6 py-4"
    >
      {steps.map((step, i) => {
        const done =
          steps.findIndex(s => s.id === currentStep) > steps.findIndex(s => s.id === step.id)
        const active = currentStep === step.id
        return (
          <button
            key={step.id}
            type="button"
            onClick={() => {
              if (done || active) onNavigate(step.id)
            }}
            className="group flex items-center gap-3 focus:outline-none"
            aria-current={active ? 'step' : undefined}
          >
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition
                ${done
                  ? 'bg-primary text-white ring-2 ring-primary/30'
                  : active
                    ? 'bg-primary/90 text-white ring-2 ring-primary/30'
                    : 'bg-muted text-muted-foreground group-hover:bg-primary/10'}
              `}
            >
              {done ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
            </div>
            <div className="flex flex-col text-left">
              <span
                className={`text-xs font-medium tracking-wide uppercase ${active
                  ? 'text-primary'
                  : done
                    ? 'text-muted-foreground'
                    : 'text-muted-foreground/70'
                  }`}
              >
                {step.title}
              </span>
              <span className="text-[11px] text-muted-foreground/60 hidden xl:block">
                {step.description}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className="w-14 h-px bg-gradient-to-r from-border/40 via-border/60 to-border/40 ml-4" />
            )}
          </button>
        )
      })}
    </nav>
  )
}

/**
 * MAIN PAGE
 */
export default function CheckoutPage() {
  /**
   * AUTH + ROUTING
   */
  const { isAuthenticated, isLoading } = useRequireAuth()
  const { user } = useAuth()
  const router = useRouter()

  /**
   * STORE
   */
  const {
    items,
    getTotalItems,
    getTotalPrice,
    getShippingCost,
    clearCart,
    setShippingInfo: persistShippingInfo,
    shippingInfo: savedShippingInfo
  } = useCartStore()

  /**
   * PHONE PROMPT HOOK
   */
  const {
    isOpen: phonePromptOpen,
    showPrompt: showPhonePromptModal,
    hidePrompt: hidePhonePrompt,
    savePhoneNumber,
    needsPhoneNumber,
    currentPhone,
    userName
  } = useCheckoutPhonePrompt()

  /**
   * STEPS
   */
  const steps: Step[] = useMemo(
    () => [
      {
        id: 'recipient',
        title: 'Recipient',
        icon: Heart,
        description: 'Who receives the package',
        requireValidation: true
      },
      {
        id: 'delivery',
        title: 'Delivery',
        icon: Truck,
        description: 'Where & how it ships',
        requireValidation: true
      },
      {
        id: 'payment',
        title: 'Payment',
        icon: CreditCard,
        description: 'Select payment method',
        requireValidation: true
      },
      {
        id: 'review',
        title: 'Review',
        icon: CheckCircle,
        description: 'Confirm & place order',
        requireValidation: true
      }
    ],
    []
  )

  const [currentStep, setCurrentStep] = useState<StepId>('recipient')

  const gotoStep = useCallback(
    (id: StepId) => {
      setCurrentStep(id)
      // Smooth scroll for better UX on mobile
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    },
    []
  )

  /**
   * RECIPIENT & ORDER PLACER
   */
  const [recipientInfo, setRecipientInfo] = useState<RecipientInfo>({
    addressId: undefined,
    recipientName: '',
    phone: '',
    alternatePhone: '',
    addressLine: '',
    city: '',
    region: '',
    landmark: '',
    relationship: '',
    notes: ''
  })

  const [orderPlacer, setOrderPlacer] = useState({
    fullName: '',
    phone: '',
    email: ''
  })

  /**
   * SAVED ADDRESSES
   */
  const [savedAddresses, setSavedAddresses] = useState<
    Array<{
      id: string
      label: string
      recipientName: string
      phone: string
      addressLine: string
      city: string
      region: string
      relationship?: string
      notes?: string
    }>
  >([])
  const [selectedSavedAddressId, setSelectedSavedAddressId] = useState<string>('')

  /**
   * DELIVERY
   */
  const [deliveryOption, setDeliveryOption] = useState<'standard' | 'express'>('standard')

  /**
   * PAYMENT
   */
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null)

  /**
   * DISCOUNT
   */
  const [discountCode, setDiscountCode] = useState('')
  const [discountStatus, setDiscountStatus] = useState<'idle' | 'validating' | 'applied' | 'invalid'>('idle')
  const [discountValue, setDiscountValue] = useState<number>(0) // monetary value

  /**
   * FORM STATE
   */
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [showRecipientForm, setShowRecipientForm] = useState(false)
  // omit state variable (only need setter) to avoid unused var diagnostic
  const [, setHasLoadedAddresses] = useState(false)

  /**
   * CART TRANSFORM
   */
  const cartItems: CartItem[] = items.map(i => ({
    id: i.id,
    productId: i.productId,
    name: i.name,
    price: i.price,
    quantity: i.quantity,
    image: i.image,
    variant: i.variant
  }))

  /**
   * MONEY FORMATTER
   */
  const formatMoney = (n: number) =>
    `₵${Number(n ?? 0).toLocaleString('en-GH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`

  /**
   * PREFILL / LOAD
   */
  useEffect(() => {
    if (savedShippingInfo) {
      setRecipientInfo(prev => ({
        ...prev,
        recipientName: prev.recipientName || savedShippingInfo.name || '',
        phone: prev.phone || savedShippingInfo.phone || '',
        addressLine: prev.addressLine || savedShippingInfo.address || '',
        city: prev.city || savedShippingInfo.city || '',
        region: prev.region || savedShippingInfo.region || ''
      }))
    }
    if (user) {
      setOrderPlacer(prev => ({
        ...prev,
        fullName: prev.fullName || user.name || '',
        email: prev.email || user.email || '',
        phone: prev.phone || user.phoneNumber || ''
      }))
    }
  }, [user, savedShippingInfo])

  // Load saved addresses best-effort
  useEffect(() => {
    if (isAuthenticated) {
      ; (async () => {
        try {
          const res = await fetch('/api/user/addresses')
          if (!res.ok) return
          const data = await res.json()
          if (Array.isArray(data?.addresses)) {
            setSavedAddresses(data.addresses)
            if (data.addresses.length === 0) {
              setShowRecipientForm(true)
            }
          }
        } catch {
          // ignore
        } finally {
          setHasLoadedAddresses(true)
        }
      })()
    }
  }, [isAuthenticated])

  /**
   * CART SUMMARY (Derived)
   */
  const baseShipping = getShippingCost()
  const subtotal = getTotalPrice()
  const selectedShippingCost = deliveryOption === 'express' ? baseShipping + 20 : baseShipping
  const tax = subtotal * 0.125
  const discount = discountValue
  const total = Math.max(0, subtotal + selectedShippingCost + tax - discount)

  const cartSummary: CartSummary = {
    subtotal,
    shippingCost: selectedShippingCost,
    tax,
    discount,
    total,
    totalItems: getTotalItems()
  }

  /**
   * VALIDATION
   */
  const validateRecipient = () => {
    const newErrors: Record<string, string> = {}
    if (!recipientInfo.recipientName.trim()) newErrors.recipient_recipientName = 'Recipient name required'
    if (!recipientInfo.phone.trim()) newErrors.recipient_phone = 'Recipient phone required'
    if (!recipientInfo.addressLine.trim()) newErrors.recipient_addressLine = 'Address required'
    if (!recipientInfo.city.trim()) newErrors.recipient_city = 'City required'
    if (!recipientInfo.region.trim()) newErrors.recipient_region = 'Region required'
    if (!recipientInfo.relationship.trim()) newErrors.recipient_relationship = 'Relationship required'
    return newErrors
  }

  const validateOrderPlacer = () => {
    const newErrors: Record<string, string> = {}
    if (!isAuthenticated) {
      if (!orderPlacer.fullName.trim()) newErrors.placer_fullName = 'Your name is required'
      if (!orderPlacer.email.trim()) newErrors.placer_email = 'Email is required'
      else if (!/\S+@\S+\.\S+/.test(orderPlacer.email)) newErrors.placer_email = 'Invalid email'
      if (!orderPlacer.phone.trim()) newErrors.placer_phone = 'Phone is required'
    }
    return newErrors
  }

  const validateStep = (step: StepId): boolean => {
    let stepErrors: Record<string, string> = {}
    if (step === 'recipient') {
      stepErrors = { ...stepErrors, ...validateOrderPlacer(), ...validateRecipient() }
    }
    if (step === 'payment') {
      if (!selectedPaymentMethod) stepErrors.payment_method = 'Please select a payment method'
    }
    setErrors(prev => {
      const merged = { ...prev, ...stepErrors }
      // Remove stale errors if user moved past fix
      return merged
    })
    return Object.keys(stepErrors).length === 0
  }

  /**
   * FIELD HANDLERS
   */
  const handleRecipientChange = (field: keyof RecipientInfo, value: string) => {
    setRecipientInfo(prev => {
      const next = { ...prev, [field]: value, addressId: undefined }
      try {
        persistShippingInfo({
          name: next.recipientName,
          phone: next.phone,
          address: next.addressLine,
          city: next.city,
          region: next.region
        })
      } catch { /* ignore */ }
      return next
    })
    if (errors[`recipient_${field}`]) {
      setErrors(prev => {
        const copy = { ...prev }
        delete copy[`recipient_${field}`]
        return copy
      })
    }
  }

  const handleOrderPlacerChange = (field: string, value: string) => {
    setOrderPlacer(prev => ({ ...prev, [field]: value }))
    if (errors[`placer_${field}`]) {
      setErrors(prev => {
        const copy = { ...prev }
        delete copy[`placer_${field}`]
        return copy
      })
    }
  }

  const handleSavedAddressSelect = (addressId: string) => {
    const address = savedAddresses.find(a => a.id === addressId)
    if (!address) return
    setRecipientInfo(prev => ({
      ...prev,
      addressId,
      recipientName: address.recipientName,
      phone: address.phone,
      addressLine: address.addressLine,
      city: address.city,
      region: address.region,
      landmark: address.notes || '',
      relationship:
        address.relationship ||
        (address.label.match(/Mother|Father|Sister|Brother|Grandmother|Grandfather/)?.[0] || 'Other'),
      notes: prev.notes
    }))
    setSelectedSavedAddressId(addressId)
    // Clear recipient errors
    setErrors(prev => {
      const copy = { ...prev }
      Object.keys(copy)
        .filter(k => k.startsWith('recipient_'))
        .forEach(k => delete copy[k])
      return copy
    })
  }

  /**
   * DISCOUNT HANDLER (simple logic: codes SINGLE5 / SINGLE10 / SINGLE15)
   */
  const applyDiscountCode = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const code = discountCode.trim().toUpperCase()
    if (!code) return
    setDiscountStatus('validating')
    setTimeout(() => {
      const map: Record<string, number> = {
        SINGLE5: 0.05,
        SINGLE10: 0.1,
        SINGLE15: 0.15
      }
      if (map[code]) {
        const value = subtotal * map[code]
        setDiscountValue(value)
        setDiscountStatus('applied')
        toast.success(`Discount applied: ${map[code] * 100}%`)
      } else {
        setDiscountValue(0)
        setDiscountStatus('invalid')
        toast.error('Invalid discount code')
      }
    }, 500)
  }

  const removeDiscount = () => {
    setDiscountCode('')
    setDiscountValue(0)
    setDiscountStatus('idle')
  }

  /**
   * NAVIGATION ACTIONS
   */
  const nextStep = () => {
    const idx = steps.findIndex(s => s.id === currentStep)
    if (idx === -1 || idx === steps.length - 1) return
    const currentRequires = steps[idx].requireValidation
    if (currentRequires && !validateStep(currentStep)) {
      toast.error('Please resolve highlighted fields')
      const firstError = Object.keys(errors)[0]
      if (firstError) {
        const el = document.querySelector(`[data-error-key="${firstError}"]`) as HTMLElement | null
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      return
    }
    // Payment step requires phone number presence
    if (steps[idx + 1].id === 'payment' && needsPhoneNumber) {
      showPhonePromptModal()
      return
    }
    gotoStep(steps[idx + 1].id)
  }

  const prevStep = () => {
    const idx = steps.findIndex(s => s.id === currentStep)
    if (idx > 0) gotoStep(steps[idx - 1].id)
  }

  /**
   * ORDER SUBMISSION
   */
  const submitOrder = async () => {
    if (!validateStep('review')) {
      toast.error('Resolve issues before placing order')
      return
    }
    if (!selectedPaymentMethod) {
      toast.error('Select a payment method')
      gotoStep('payment')
      return
    }
    setSubmitting(true)
    try {
      const orderData = {
        items: cartItems,
        recipient: recipientInfo,
        orderPlacer: isAuthenticated
          ? {
            fullName: user?.name || orderPlacer.fullName,
            email: user?.email || orderPlacer.email,
            phone: user?.phoneNumber || orderPlacer.phone
          }
          : orderPlacer,
        delivery: {
          option: deliveryOption,
          cost: selectedShippingCost
        },
        summary: cartSummary,
        paymentMethod: selectedPaymentMethod,
        discount: {
          code: discountCode || null,
          amount: discountValue
        }
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
      toast.success('Order placed successfully 🎉')
      router.push(`/orders/${orderId}`)
    } catch (e: unknown) {
      toast.error(e?.message || 'Order failed')
    } finally {
      setSubmitting(false)
    }
  }

  /**
   * RENDER GUARDS
   */
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/10">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Preparing your secure checkout...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-background via-background to-primary/10">
        <div className="max-w-md w-full space-y-6 text-center">
          <div className="p-8 rounded-3xl bg-card/60 backdrop-blur border border-border/50 shadow-sm">
            <Lock className="w-14 h-14 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold">Authentication Required</h2>
            <p className="text-muted-foreground text-sm mb-6">
              Please sign in or create your account to continue
            </p>
            <div className="flex flex-col gap-3">
              <Button asChild className="h-12 rounded-xl font-medium">
                <Link href="/auth/signin">Sign In</Link>
              </Button>
              <Button asChild variant="outline" className="h-12 rounded-xl font-medium">
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
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-background via-background to-primary/10">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="p-10 rounded-3xl bg-card/60 backdrop-blur border border-border/50 shadow-sm">
            <div className="w-24 h-24 mx-auto bg-muted rounded-full flex items-center justify-center mb-6">
              <ShoppingCart className="w-12 h-12 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6 text-sm">
              Add some products to begin checkout
            </p>
            <Button asChild className="h-12 w-full rounded-xl">
              <Link href="/products">Browse Products</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  /**
   * STEP CONTENT
   */
  const RecipientStep = (
    <SectionCard
      id="recipient-section"
      title="Recipient Information"
      icon={Heart}
      description="Provide details of the person in Ghana receiving this order"
      actions={
        savedAddresses.length > 0 && !showRecipientForm ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowRecipientForm(true)}
            className="rounded-lg h-9"
          >
            <Plus className="w-4 h-4 mr-1" />
            New Recipient
          </Button>
        ) : null
      }
      accent={Object.keys(errors).some(k => k.startsWith('recipient_')) ? 'danger' : 'neutral'}
    >
      {/* Saved Recipients */}
      {savedAddresses.length > 0 && !showRecipientForm && (
        <div className="space-y-4">
          <div className="grid gap-3">
            {savedAddresses.map(address => {
              const selected = address.id === selectedSavedAddressId
              return (
                <button
                  key={address.id}
                  type="button"
                  onClick={() => handleSavedAddressSelect(address.id)}
                  className={`text-left p-4 rounded-xl border-2 transition group focus:outline-none focus:ring-2 focus:ring-primary/30 ${selected
                    ? 'border-primary bg-primary/5'
                    : 'border-border/30 hover:border-primary/40'
                    }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{address.recipientName}</span>
                        <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
                          {address.label}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {address.phone} • {address.addressLine}, {address.city}
                      </p>
                    </div>
                    {selected && <CheckCircle className="w-5 h-5 text-primary" />}
                  </div>
                </button>
              )
            })}
          </div>
          <div>
            <Button
              variant="outline"
              className="w-full h-11 rounded-xl border-dashed"
              type="button"
              onClick={() => setShowRecipientForm(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add another recipient
            </Button>
          </div>
        </div>
      )}

      {(showRecipientForm || savedAddresses.length === 0) && (
        <div className="space-y-6 mt-2">
          {savedAddresses.length > 0 && (
            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={() => {
                  setShowRecipientForm(false)
                  setRecipientInfo(prev => ({ ...prev, addressId: undefined }))
                }}
                className="h-8 text-primary"
              >
                Use Saved Recipient
              </Button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Recipient Name */}
            <div className="space-y-2" data-error-key="recipient_recipientName">
              <label className="text-sm font-medium flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-primary" /> Full Name *
              </label>
              <input
                value={recipientInfo.recipientName}
                onChange={e => handleRecipientChange('recipientName', e.target.value)}
                placeholder="e.g., Ama Serwaa"
                aria-invalid={!!errors.recipient_recipientName}
                className={`w-full px-4 py-3 rounded-xl border bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition ${errors.recipient_recipientName ? 'border-red-300 bg-red-50' : 'border-input'
                  }`}
              />
              {errors.recipient_recipientName && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.recipient_recipientName}
                </p>
              )}
            </div>

            {/* Relationship */}
            <div className="space-y-2" data-error-key="recipient_relationship">
              <label className="text-sm font-medium">Relationship *</label>
              <select
                value={recipientInfo.relationship}
                onChange={e => handleRecipientChange('relationship', e.target.value)}
                aria-invalid={!!errors.recipient_relationship}
                className={`w-full px-4 py-3 rounded-xl border bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition appearance-none ${errors.recipient_relationship ? 'border-red-300 bg-red-50' : 'border-input'
                  }`}
              >
                <option value="">Select relationship</option>
                {[
                  'Mother',
                  'Father',
                  'Sister',
                  'Brother',
                  'Grandmother',
                  'Grandfather',
                  'Aunt',
                  'Uncle',
                  'Cousin',
                  'Friend',
                  'Spouse',
                  'Child',
                  'Other'
                ].map(r => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              {errors.recipient_relationship && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.recipient_relationship}
                </p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-2" data-error-key="recipient_phone">
              <label className="text-sm font-medium flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-primary" />
                Phone Number *
              </label>
              <input
                type="tel"
                value={recipientInfo.phone}
                onChange={e => handleRecipientChange('phone', e.target.value)}
                placeholder="0XXX XXX XXX"
                aria-invalid={!!errors.recipient_phone}
                className={`w-full px-4 py-3 rounded-xl border bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition ${errors.recipient_phone ? 'border-red-300 bg-red-50' : 'border-input'
                  }`}
              />
              {errors.recipient_phone && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.recipient_phone}
                </p>
              )}
            </div>

            {/* Alt Phone */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Alternative Phone</label>
              <input
                type="tel"
                value={recipientInfo.alternatePhone}
                onChange={e => handleRecipientChange('alternatePhone', e.target.value)}
                placeholder="Backup (optional)"
                className="w-full px-4 py-3 rounded-xl border border-input bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
              />
            </div>

            {/* Address */}
            <div className="md:col-span-2 space-y-2" data-error-key="recipient_addressLine">
              <label className="text-sm font-medium flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                Delivery Address *
              </label>
              <textarea
                value={recipientInfo.addressLine}
                onChange={e => handleRecipientChange('addressLine', e.target.value)}
                rows={3}
                placeholder="Street, house number, area..."
                aria-invalid={!!errors.recipient_addressLine}
                className={`w-full px-4 py-3 rounded-xl border resize-none bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition ${errors.recipient_addressLine ? 'border-red-300 bg-red-50' : 'border-input'
                  }`}
              />
              {errors.recipient_addressLine && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.recipient_addressLine}
                </p>
              )}
            </div>

            {/* City */}
            <div className="space-y-2" data-error-key="recipient_city">
              <label className="text-sm font-medium">City *</label>
              <input
                value={recipientInfo.city}
                onChange={e => handleRecipientChange('city', e.target.value)}
                placeholder="Accra, Kumasi..."
                aria-invalid={!!errors.recipient_city}
                className={`w-full px-4 py-3 rounded-xl border bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition ${errors.recipient_city ? 'border-red-300 bg-red-50' : 'border-input'
                  }`}
              />
              {errors.recipient_city && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.recipient_city}
                </p>
              )}
            </div>

            {/* Region */}
            <div className="space-y-2" data-error-key="recipient_region">
              <label className="text-sm font-medium">Region *</label>
              <select
                value={recipientInfo.region}
                onChange={e => handleRecipientChange('region', e.target.value)}
                aria-invalid={!!errors.recipient_region}
                className={`w-full px-4 py-3 rounded-xl border bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition appearance-none ${errors.recipient_region ? 'border-red-300 bg-red-50' : 'border-input'
                  }`}
              >
                <option value="">Select region</option>
                {[
                  'Greater Accra',
                  'Ashanti',
                  'Western',
                  'Central',
                  'Eastern',
                  'Northern',
                  'Upper East',
                  'Upper West',
                  'Volta',
                  'Brong Ahafo'
                ].map(r => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              {errors.recipient_region && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.recipient_region}
                </p>
              )}
            </div>

            {/* Landmark */}
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-medium">Landmark / Additional Info</label>
              <input
                value={recipientInfo.landmark}
                onChange={e => handleRecipientChange('landmark', e.target.value)}
                placeholder="Near school, mosque etc. (optional)"
                className="w-full px-4 py-3 rounded-xl border border-input bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
              />
            </div>

            {/* Notes */}
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-medium">Special Instructions</label>
              <textarea
                value={recipientInfo.notes}
                onChange={e => handleRecipientChange('notes', e.target.value)}
                rows={2}
                placeholder="Leave at gate, call upon arrival..."
                className="w-full px-4 py-3 rounded-xl border border-input bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition resize-none"
              />
            </div>
          </div>

          {/* Order Placer (Non-auth fields rarely needed but kept for completeness) */}
          {!isAuthenticated && (
            <div className="mt-8 space-y-5">
              <div className="flex items-center gap-2">
                <div className="h-px flex-1 bg-border/50" />
                <span className="text-xs uppercase tracking-wide text-muted-foreground">
                  Your Details
                </span>
                <div className="h-px flex-1 bg-border/50" />
              </div>

              <div className="grid gap-5 md:grid-cols-3">
                <div className="space-y-2" data-error-key="placer_fullName">
                  <label className="text-sm font-medium">Your Name *</label>
                  <input
                    value={orderPlacer.fullName}
                    onChange={e => handleOrderPlacerChange('fullName', e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition ${errors.placer_fullName ? 'border-red-300 bg-red-50' : 'border-input'
                      }`}
                  />
                  {errors.placer_fullName && (
                    <p className="text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.placer_fullName}
                    </p>
                  )}
                </div>
                <div className="space-y-2 md:col-span-2" data-error-key="placer_email">
                  <label className="text-sm font-medium">Email *</label>
                  <input
                    type="email"
                    value={orderPlacer.email}
                    onChange={e => handleOrderPlacerChange('email', e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition ${errors.placer_email ? 'border-red-300 bg-red-50' : 'border-input'
                      }`}
                  />
                  {errors.placer_email && (
                    <p className="text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.placer_email}
                    </p>
                  )}
                </div>
                <div className="space-y-2" data-error-key="placer_phone">
                  <label className="text-sm font-medium">Phone *</label>
                  <input
                    value={orderPlacer.phone}
                    onChange={e => handleOrderPlacerChange('phone', e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition ${errors.placer_phone ? 'border-red-300 bg-red-50' : 'border-input'
                      }`}
                  />
                  {errors.placer_phone && (
                    <p className="text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.placer_phone}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </SectionCard>
  )

  const DeliveryStep = (
    <SectionCard
      id="delivery-section"
      title="Delivery Options"
      icon={Truck}
      description="Choose a delivery speed that matches your needs"
    >
      <div className="grid gap-4 md:grid-cols-2">
        {[
          {
            id: 'standard',
            title: 'Standard',
            eta: '5-7 business days',
            icon: Truck,
            cost: baseShipping,
            highlight: false
          },
          {
            id: 'express',
            title: 'Express',
            eta: '2-3 business days',
            icon: Zap,
            cost: baseShipping + 20,
            highlight: true
          }
        ].map(opt => {
          const selected = deliveryOption === opt.id
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setDeliveryOption(opt.id as 'standard' | 'express')}
              className={`relative p-4 rounded-2xl border-2 text-left transition focus:outline-none focus:ring-2 focus:ring-primary/30 ${selected
                ? 'border-primary bg-primary/5'
                : 'border-border/30 hover:border-primary/40'
                }`}
            >
              {opt.highlight && (
                <span className="absolute -top-2 left-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-[10px] px-2 py-0.5 rounded-full font-medium shadow">
                  Popular
                </span>
              )}
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-xl ${opt.highlight ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
                    }`}
                >
                  <opt.icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold flex items-center gap-2">
                    {opt.title}
                    {selected && <CheckCircle className="w-4 h-4 text-primary" />}
                  </h3>
                  <p className="text-xs text-muted-foreground">{opt.eta}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm">{formatMoney(opt.cost)}</p>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </SectionCard>
  )

  const PaymentStep = (
    <>
      <SectionCard
        id="payment-section"
        title="Payment Method"
        icon={CreditCard}
        description="Select or add a payment method to continue"
        accent={errors.payment_method ? 'danger' : 'neutral'}
      >
        <div className="space-y-6">
          <PaymentMethodManager
            onPaymentMethodSelect={m => {
              setSelectedPaymentMethod(m)
              setErrors(prev => {
                const copy = { ...prev }
                delete copy.payment_method
                return copy
              })
              toast.success('Payment method selected')
            }}
            selectedPaymentMethodId={selectedPaymentMethod?.id}
          />
          {errors.payment_method && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {errors.payment_method}
            </div>
          )}
          {selectedPaymentMethod && (
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/30 text-sm">
              <div className="flex items-center gap-2 font-medium text-primary mb-1">
                <CheckCircle className="w-4 h-4" />
                Ready for checkout
              </div>
              <p className="text-muted-foreground text-xs">
                You can change this method anytime before placing the order.
              </p>
            </div>
          )}
        </div>
      </SectionCard>
    </>
  )

  const ReviewStep = (
    <SectionCard
      id="review-section"
      title="Review & Confirm"
      icon={CheckCircle}
      description="Verify all details before placing your order"
    >
      <div className="space-y-8">
        {/* Items */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Items ({cartSummary.totalItems})
          </h3>
          <div className="space-y-3">
            {cartItems.map(item => (
              <div
                key={item.id}
                className="flex gap-3 p-3 rounded-xl bg-muted/40 border border-border/30"
              >
                <Image
                  src={item.image}
                  alt={item.name}
                  width={56}
                  height={56}
                  className="rounded-lg object-cover w-14 h-14"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.name}</p>
                  {item.variant && (
                    <p className="text-[11px] text-muted-foreground">
                      {item.variant.name}: {item.variant.value}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[11px] text-muted-foreground">
                      Qty: {item.quantity}
                    </span>
                    <span className="text-sm font-semibold">
                      {formatMoney(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div>
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={() => gotoStep('recipient')}
              className="text-xs h-8 px-3"
            >
              Edit Recipient Details
            </Button>
          </div>
        </div>

        {/* Summary */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Order Summary
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatMoney(cartSummary.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping ({deliveryOption === 'express' ? 'Express' : 'Standard'})</span>
              <span>{formatMoney(cartSummary.shippingCost)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax (12.5%)</span>
              <span>{formatMoney(cartSummary.tax)}</span>
            </div>
            {cartSummary.discount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Discount</span>
                <span>-{formatMoney(cartSummary.discount)}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold text-base pt-2 border-t border-border/40">
              <span>Total</span>
              <span className="text-primary">{formatMoney(cartSummary.total)}</span>
            </div>
          </div>
        </div>

        {/* Payment Preview */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Payment Method
          </h3>
          {selectedPaymentMethod ? (
            <div className="p-4 rounded-xl border bg-white flex items-center justify-between">
              <div className="text-sm">
                <p className="font-medium">
                  {selectedPaymentMethod.nickname || selectedPaymentMethod.displayName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {selectedPaymentMethod.type === 'CARD' && selectedPaymentMethod.cardLast4
                    ? `Card •••• ${selectedPaymentMethod.cardLast4}`
                    : selectedPaymentMethod.type.replace('_', ' ')}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => gotoStep('payment')}
                className="h-8 rounded-lg"
              >
                Change
              </Button>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> No payment method selected
            </div>
          )}
        </div>

        {/* Legal */}
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          By placing your order you agree to our{' '}
          <Link href="/terms" className="underline hover:text-primary">
            Terms
          </Link>{' '}
          &{' '}
          <Link href="/privacy" className="underline hover:text-primary">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </SectionCard>
  )

  const DiscountWidget = (
    <SectionCard
      title="Have a Discount Code?"
      icon={Percent}
      description="Apply a promo code to save on your order"
    >
      {discountStatus === 'applied' ? (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span className="font-medium">
              Code <span className="text-primary">{discountCode.toUpperCase()}</span> applied
            </span>
            <span className="text-emerald-600 font-semibold">
              -{formatMoney(discountValue)}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={removeDiscount}
            className="text-xs h-8"
          >
            Remove
          </Button>
        </div>
      ) : (
        <form
          onSubmit={applyDiscountCode}
          className="flex flex-col sm:flex-row gap-3"
          aria-label="Discount code form"
        >
          <input
            value={discountCode}
            onChange={e => {
              setDiscountCode(e.target.value)
              if (discountStatus !== 'idle') setDiscountStatus('idle')
            }}
            placeholder="Enter code (e.g., SINGLE10)"
            className="flex-1 px-4 py-3 rounded-xl border border-input bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
            aria-label="Discount code"
          />
          <Button
            type="submit"
            variant="outline"
            className="h-12 rounded-xl px-5 font-medium"
            disabled={discountStatus === 'validating' || !discountCode.trim()}
          >
            {discountStatus === 'validating' ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Checking
              </span>
            ) : (
              'Apply'
            )}
          </Button>
        </form>
      )}
      {discountStatus === 'invalid' && (
        <p className="mt-2 text-xs text-red-600 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          Invalid or expired code
        </p>
      )}
      {discountStatus === 'idle' && (
        <p className="mt-2 text-[11px] text-muted-foreground">
          Try SINGLE5 / SINGLE10 / SINGLE15 for a demo.
        </p>
      )}
    </SectionCard>
  )

  /**
   * RIGHT SUMMARY SIDEBAR
   */
  const SummarySidebar = (
    <aside className="lg:sticky lg:top-28 space-y-6">
      <div className="rounded-2xl bg-white/90 backdrop-blur-sm border border-border/30 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 bg-primary/10 rounded-xl">
            <Package className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold">Order Summary</h2>
            <p className="text-xs text-muted-foreground">{cartItems.length} items</p>
          </div>
        </div>

        <div className="max-h-[240px] overflow-y-auto pr-1 space-y-3">
          {cartItems.map(item => (
            <div
              key={item.id}
              className="flex gap-3 p-2.5 rounded-xl bg-muted/30 border border-border/20"
            >
              <Image
                src={item.image}
                alt={item.name}
                width={54}
                height={54}
                className="rounded-lg object-cover w-[54px] h-[54px]"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{item.name}</p>
                {item.variant && (
                  <p className="text-[10px] text-muted-foreground">
                    {item.variant.name}: {item.variant.value}
                  </p>
                )}
                <div className="flex items-center justify-between mt-0.5">
                  <span className="text-[10px] text-muted-foreground">Qty {item.quantity}</span>
                  <span className="text-xs font-semibold">
                    {formatMoney(item.price * item.quantity)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatMoney(cartSummary.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>{formatMoney(cartSummary.shippingCost)}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax (12.5%)</span>
            <span>{formatMoney(cartSummary.tax)}</span>
          </div>
          {cartSummary.discount > 0 && (
            <div className="flex justify-between text-emerald-600">
              <span>Discount</span>
              <span>-{formatMoney(cartSummary.discount)}</span>
            </div>
          )}
          <div className="flex justify-between font-semibold text-base pt-3 border-t border-border/30">
            <span>Total</span>
            <span className="text-primary">{formatMoney(cartSummary.total)}</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-6 pt-5 border-t border-border/30">
          <div className="text-center">
            <Shield className="w-5 h-5 mx-auto text-green-600 mb-1" />
            <span className="text-[10px] text-muted-foreground">Secure</span>
          </div>
          <div className="text-center">
            <Truck className="w-5 h-5 mx-auto text-blue-600 mb-1" />
            <span className="text-[10px] text-muted-foreground">Fast</span>
          </div>
          <div className="text-center">
            <CheckCircle className="w-5 h-5 mx-auto text-emerald-600 mb-1" />
            <span className="text-[10px] text-muted-foreground">Reliable</span>
          </div>
        </div>

        {/* Primary action (contextual) */}
        <div className="mt-6">
          {currentStep !== 'review' ? (
            <Button
              onClick={nextStep}
              className="w-full h-12 rounded-xl font-semibold flex items-center justify-center gap-2"
            >
              Continue
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={submitOrder}
              disabled={submitting || !selectedPaymentMethod}
              className="w-full h-12 rounded-xl font-semibold flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  Place Order - {formatMoney(cartSummary.total)}
                </>
              )}
            </Button>
          )}
          <div className="mt-2">
            {currentStep !== 'recipient' && (
              <Button
                type="button"
                variant="ghost"
                onClick={prevStep}
                className="w-full h-10 gap-2 rounded-xl text-xs"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </Button>
            )}
          </div>
          {currentStep === 'review' && !selectedPaymentMethod && (
            <p className="text-[11px] text-red-600 mt-2 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> Select a payment method before placing order
            </p>
          )}
        </div>
      </div>

      {/* Discount */}
      <div>{DiscountWidget}</div>
    </aside>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* HEADER */}
      <header className="sticky top-0 z-40 backdrop-blur border-b bg-white/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="h-9 w-9 p-0 rounded-xl"
                aria-label="Go back to previous page"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-lg font-semibold leading-tight">Checkout</h1>
                <p className="text-[11px] text-muted-foreground -mt-0.5">
                  Securely complete your purchase
                </p>
              </div>
            </div>
            <ProgressStepper
              steps={steps}
              currentStep={currentStep}
              onNavigate={id => gotoStep(id)}
            />
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {currentStep === 'recipient' && RecipientStep}
            {currentStep === 'delivery' && DeliveryStep}
            {currentStep === 'payment' && PaymentStep}
            {currentStep === 'review' && ReviewStep}
          </div>
          <div className="lg:col-span-1 space-y-8">{SummarySidebar}</div>
        </div>
      </main>

      {/* MOBILE BOTTOM BAR */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur border-t border-border/40 p-4 z-50">
        <div className="flex items-center justify-between gap-4">
          {currentStep !== 'recipient' ? (
            <Button
              variant="outline"
              onClick={prevStep}
              className="h-11 flex-1 rounded-xl font-medium gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={() => router.push('/cart')}
              className="h-11 flex-1 rounded-xl font-medium gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              Cart
            </Button>
          )}

          {currentStep !== 'review' ? (
            <Button
              onClick={nextStep}
              className="h-11 flex-[2] rounded-xl font-semibold gap-2"
            >
              Continue
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={submitOrder}
              disabled={submitting || !selectedPaymentMethod}
              className="h-11 flex-[2] rounded-xl font-semibold gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  Place Order
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* SMART PHONE PROMPT */}
      <SmartPhonePrompt
        isOpen={phonePromptOpen}
        onClose={hidePhonePrompt}
        onSave={async (phone: string) => {
          await savePhoneNumber(phone)
          setOrderPlacer(prev => ({ ...prev, phone }))
        }}
        context="checkout"
        currentPhone={currentPhone}
        userName={userName}
      />
    </div>
  )
}
