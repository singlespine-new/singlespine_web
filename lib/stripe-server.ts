import Stripe from 'stripe'

// Server-side Stripe instance
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
  typescript: true,
})

// Payment intent creation options
export interface CreatePaymentIntentOptions {
  amount: number
  currency?: string
  orderId: string
  customerEmail?: string
  customerName?: string
  shippingAddress?: {
    line1: string
    line2?: string
    city: string
    state: string
    country: string
    postal_code?: string
  }
  metadata?: Record<string, string>
}

// Create payment intent for Ghana-specific payments
export const createPaymentIntent = async (options: CreatePaymentIntentOptions) => {
  const {
    amount,
    currency = 'ghs',
    orderId,
    customerEmail,
    customerName,
    shippingAddress,
    metadata = {}
  } = options

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: formatAmountForStripe(amount, currency),
      currency: currency.toLowerCase(),
      automatic_payment_methods: {
        enabled: true,
      },
      receipt_email: customerEmail,
      description: `Singlespine Order #${orderId}`,
      shipping: shippingAddress && customerName ? {
        name: customerName,
        address: {
          line1: shippingAddress.line1,
          line2: shippingAddress.line2,
          city: shippingAddress.city,
          state: shippingAddress.state,
          country: shippingAddress.country,
          postal_code: shippingAddress.postal_code,
        }
      } : undefined,
      metadata: {
        orderId,
        source: 'singlespine_web',
        ...metadata
      }
    })

    return paymentIntent
  } catch (error) {
    console.error('Error creating payment intent:', error)
    throw error
  }
}

// Update payment intent
export const updatePaymentIntent = async (
  paymentIntentId: string,
  updates: Partial<Stripe.PaymentIntentUpdateParams>
) => {
  try {
    const paymentIntent = await stripe.paymentIntents.update(
      paymentIntentId,
      updates
    )
    return paymentIntent
  } catch (error) {
    console.error('Error updating payment intent:', error)
    throw error
  }
}

// Retrieve payment intent
export const retrievePaymentIntent = async (paymentIntentId: string) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
    return paymentIntent
  } catch (error) {
    console.error('Error retrieving payment intent:', error)
    throw error
  }
}

// Create customer for future payments
export const createCustomer = async (options: {
  email: string
  name?: string
  phone?: string
  address?: Stripe.AddressParam
}) => {
  try {
    const customer = await stripe.customers.create({
      email: options.email,
      name: options.name,
      phone: options.phone,
      address: options.address,
      metadata: {
        source: 'singlespine_web'
      }
    })
    return customer
  } catch (error) {
    console.error('Error creating customer:', error)
    throw error
  }
}

// Webhook signature verification
export const verifyWebhookSignature = (
  payload: string | Buffer,
  signature: string,
  secret: string
): Stripe.Event => {
  try {
    return stripe.webhooks.constructEvent(payload, signature, secret)
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    throw error
  }
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
