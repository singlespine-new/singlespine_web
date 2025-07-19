import type { Stripe as StripeJS } from '@stripe/stripe-js'
import { loadStripe } from '@stripe/stripe-js'

// Singleton pattern for Stripe instance
let stripePromise: Promise<StripeJS | null>

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
    )
  }
  return stripePromise
}

// Helper function to format amount for Stripe (convert to smallest currency unit)
export const formatAmountForStripe = (amount: number, currency: string = 'usd'): number => {
  // Ghana Cedis uses 2 decimal places like USD
  const currencyMultipliers: Record<string, number> = {
    usd: 100,
    ghs: 100, // Ghana Cedi
    eur: 100,
    gbp: 100,
  }

  const multiplier = currencyMultipliers[currency.toLowerCase()] || 100
  return Math.round(amount * multiplier)
}

// Helper function to format amount for display
export const formatAmountFromStripe = (amount: number, currency: string = 'usd'): number => {
  const currencyMultipliers: Record<string, number> = {
    usd: 100,
    ghs: 100, // Ghana Cedi
    eur: 100,
    gbp: 100,
  }

  const multiplier = currencyMultipliers[currency.toLowerCase()] || 100
  return amount / multiplier
}

// Currency formatting for display
export const formatCurrency = (amount: number, currency: string = 'GHS'): string => {
  const currencySymbols: Record<string, string> = {
    GHS: '₵',
    USD: '$',
    EUR: '€',
    GBP: '£',
  }

  const symbol = currencySymbols[currency.toUpperCase()] || currency

  return new Intl.NumberFormat('en-GH', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount).replace(/^/, symbol)
}

// African-specific payment methods and configurations
export const SUPPORTED_PAYMENT_METHODS = {
  card: {
    name: 'Credit/Debit Card',
    description: 'Visa, Mastercard, and local cards',
    icon: '💳'
  },
  // Future integrations
  mobile_money: {
    name: 'Mobile Money',
    description: 'MTN Mobile Money, AirtelTigo Money',
    icon: '📱',
    coming_soon: true
  },
  bank_transfer: {
    name: 'Bank Transfer',
    description: 'Direct bank transfer',
    icon: '🏦',
    coming_soon: true
  }
}

// Shipping zones for Ghana
export const GHANA_SHIPPING_ZONES = {
  greater_accra: {
    name: 'Greater Accra',
    baseRate: 15,
    freeShippingThreshold: 300
  },
  ashanti: {
    name: 'Ashanti Region',
    baseRate: 25,
    freeShippingThreshold: 400
  },
  western: {
    name: 'Western Region',
    baseRate: 30,
    freeShippingThreshold: 450
  },
  central: {
    name: 'Central Region',
    baseRate: 20,
    freeShippingThreshold: 350
  },
  eastern: {
    name: 'Eastern Region',
    baseRate: 25,
    freeShippingThreshold: 400
  },
  volta: {
    name: 'Volta Region',
    baseRate: 35,
    freeShippingThreshold: 500
  },
  northern: {
    name: 'Northern Region',
    baseRate: 45,
    freeShippingThreshold: 600
  },
  upper_east: {
    name: 'Upper East Region',
    baseRate: 50,
    freeShippingThreshold: 650
  },
  upper_west: {
    name: 'Upper West Region',
    baseRate: 50,
    freeShippingThreshold: 650
  },
  brong_ahafo: {
    name: 'Bono Region',
    baseRate: 30,
    freeShippingThreshold: 450
  }
}
