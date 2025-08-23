'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth, useRequireAuth } from '@/lib/auth-utils'
import { Button } from '@/components/ui/Button'
import { CheckCircle, Package, Truck, Clock, Star, Phone, MapPin, CreditCard, ArrowLeft, Download, Share, Copy } from 'lucide-react'
import toast from '@/components/ui/toast'
import Link from 'next/link'

interface Order {
  id: string
  orderNumber: string
  status: string
  paymentStatus: string
  total: number
  estimatedDelivery: string
  createdAt: string
  recipientName: string
  recipientPhone: string
  recipientAddress: string
  recipientCity: string
  recipientRegion: string
  paymentMethod: string
  transactionId?: string
}

export default function OrderConfirmationPage() {
  const { isAuthenticated, isLoading } = useRequireAuth()
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const orderId = params.orderId as string

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated || !orderId) return

    fetchOrder()
  }, [isAuthenticated, orderId])

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}`)
      if (!response.ok) {
        throw new Error('Order not found')
      }

      const data = await response.json()
      setOrder(data.order)
    } catch (error) {
      console.error('Error fetching order:', error)
      setError('Failed to load order details')
    } finally {
      setLoading(false)
    }
  }

  const formatMoney = (amount: number) =>
    `₵${Number(amount ?? 0).toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
      case 'completed':
        return 'text-green-600 bg-green-50'
      case 'pending':
        return 'text-yellow-600 bg-yellow-50'
      case 'processing':
        return 'text-blue-600 bg-blue-50'
      case 'shipped':
        return 'text-purple-600 bg-purple-50'
      case 'delivered':
        return 'text-emerald-600 bg-emerald-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const handleCopyOrderId = () => {
    const orderNumber = order?.orderNumber || orderId
    navigator.clipboard.writeText(orderNumber)
    toast.success('Order number copied to clipboard')
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My Singlespine Order',
        text: `Order ${order?.orderNumber || orderId} has been confirmed!`,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Order link copied to clipboard')
    }
  }

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading order details...</p>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
        <div className="text-center space-y-6 max-w-md">
          <div className="p-8 bg-card/50 backdrop-blur border border-border/50 rounded-3xl">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-10 h-10 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Order Not Found</h2>
            <p className="text-muted-foreground mb-6">
              {error || 'The order you are looking for does not exist or you do not have permission to view it.'}
            </p>
            <div className="space-y-3">
              <Button asChild className="w-full h-12 rounded-xl">
                <Link href="/orders">View All Orders</Link>
              </Button>
              <Button asChild variant="outline" className="w-full h-12 rounded-xl">
                <Link href="/products">Continue Shopping</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-border/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
              <h1 className="text-2xl font-bold">Order Confirmation</h1>
              <p className="text-muted-foreground">Thank you for your order!</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Message */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl border border-green-200 p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-green-800 mb-2">Order Confirmed!</h2>
            <p className="text-green-700 mb-4">
              Your order has been successfully placed and payment confirmed.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-green-600">
              <span>Order Number:</span>
              <code className="bg-green-50 px-2 py-1 rounded font-mono">{order.orderNumber || order.id}</code>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyOrderId}
                className="p-1 h-auto text-green-600 hover:text-green-700"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Status */}
            <div className="bg-white rounded-2xl border border-border/20 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">Order Status</h3>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={handleShare} className="p-2">
                    <Share className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="p-2">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Package className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">Order Status</p>
                      <p className="text-sm text-muted-foreground">Current order status</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CreditCard className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold">Payment Status</p>
                      <p className="text-sm text-muted-foreground">Payment confirmation</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.paymentStatus)}`}>
                    {order.paymentStatus}
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Truck className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold">Estimated Delivery</p>
                      <p className="text-sm text-muted-foreground">Expected delivery time</p>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">
                    {order.estimatedDelivery}
                  </span>
                </div>
              </div>
            </div>

            {/* Delivery Information */}
            <div className="bg-white rounded-2xl border border-border/20 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Delivery Information</h3>
                  <p className="text-sm text-muted-foreground">Where your order will be delivered</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Recipient</label>
                  <p className="font-semibold">{order.recipientName}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <p className="font-semibold">{order.recipientPhone}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Delivery Address</label>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground mt-1" />
                    <div>
                      <p className="font-semibold">{order.recipientAddress}</p>
                      <p className="text-sm text-muted-foreground">{order.recipientCity}, {order.recipientRegion}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-white rounded-2xl border border-border/20 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <CreditCard className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Payment Information</h3>
                  <p className="text-sm text-muted-foreground">Payment method and transaction details</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Payment Method</span>
                  <span className="font-semibold capitalize">{order.paymentMethod.replace('_', ' ')}</span>
                </div>

                {order.transactionId && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Transaction ID</span>
                    <code className="text-sm bg-muted px-2 py-1 rounded font-mono">{order.transactionId}</code>
                  </div>
                )}

                <div className="flex items-center justify-between text-lg font-semibold border-t border-border/20 pt-4">
                  <span>Total Paid</span>
                  <span className="text-primary">{formatMoney(order.total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Next Steps */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-border/20 p-6 shadow-sm sticky top-8">
              <h3 className="text-xl font-semibold mb-6">What's Next?</h3>

              <div className="space-y-6">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-primary">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Order Processing</h4>
                    <p className="text-sm text-muted-foreground">
                      We're preparing your order for shipment. You'll receive an update within 24 hours.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-muted-foreground">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Shipment</h4>
                    <p className="text-sm text-muted-foreground">
                      Your order will be shipped to Ghana and you'll receive tracking information.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-muted-foreground">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Delivery</h4>
                    <p className="text-sm text-muted-foreground">
                      Your order will be delivered to {order.recipientName} in {order.recipientCity}.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 space-y-3">
                <Button asChild className="w-full h-12 rounded-xl">
                  <Link href="/orders">View All Orders</Link>
                </Button>
                <Button asChild variant="outline" className="w-full h-12 rounded-xl">
                  <Link href="/products">Continue Shopping</Link>
                </Button>
              </div>

              <div className="mt-6 p-4 bg-muted/20 rounded-xl">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  Need Help?
                </h4>
                <p className="text-sm text-muted-foreground mb-3">
                  If you have any questions about your order, our support team is here to help.
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  Contact Support
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
