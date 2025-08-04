'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useRequireAuth } from '@/lib/auth-utils'
import { Button } from '@/components/ui/Button'
import {
  Package,
  CheckCircle,
  Clock,
  Truck,
  MapPin,
  Phone,
  Calendar,

  Search,

  Download,
  Star,
  MessageCircle,
  RefreshCw,
  Eye,
  MoreHorizontal,
  Copy,

  Package2,
  ShoppingBag
} from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import Image from 'next/image'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Order {
  id: string
  orderNumber: string
  status: 'pending' | 'confirmed' | 'preparing' | 'shipped' | 'delivered' | 'cancelled'
  items: Array<{
    id: string
    name: string
    quantity: number
    price: number
    image: string
    variant?: string
  }>
  total: number
  subtotal: number
  shippingCost: number
  taxAmount: number
  shippingInfo: {
    name: string
    phone: string
    address: string
    city: string
    region: string
    postalCode?: string
  }
  paymentMethod: string
  trackingNumber?: string
  estimatedDelivery?: string
  createdAt: string
  deliveryDate?: string
  notes?: string
}

const mockOrders: Order[] = [
  {
    id: '1',
    orderNumber: 'ORD-2024-001',
    status: 'shipped',
    items: [
      {
        id: '1',
        name: 'Premium Ghanaian Cocoa Powder',
        quantity: 2,
        price: 45.00,
        image: '/placeholder-product.jpg',
        variant: '500g'
      },
      {
        id: '2',
        name: 'Handwoven Kente Cloth',
        quantity: 1,
        price: 150.00,
        image: '/placeholder-product.jpg',
        variant: 'Traditional Pattern'
      }
    ],
    total: 240.00,
    subtotal: 195.00,
    shippingCost: 35.00,
    taxAmount: 10.00,
    shippingInfo: {
      name: 'John Doe',
      phone: '+233 20 123 4567',
      address: '123 Independence Avenue',
      city: 'Accra',
      region: 'Greater Accra',
      postalCode: 'GA-123-4567'
    },
    paymentMethod: 'Mobile Money',
    trackingNumber: 'GH123456789',
    estimatedDelivery: '2-3 business days',
    createdAt: '2024-01-15T10:30:00Z',
    deliveryDate: '2024-01-20T14:00:00Z',
    notes: 'Please call before delivery'
  },
  {
    id: '2',
    orderNumber: 'ORD-2024-002',
    status: 'delivered',
    items: [
      {
        id: '3',
        name: 'African Print Ankara Fabric',
        quantity: 3,
        price: 25.00,
        image: '/placeholder-product.jpg',
        variant: 'Blue & Gold'
      }
    ],
    total: 95.00,
    subtotal: 75.00,
    shippingCost: 15.00,
    taxAmount: 5.00,
    shippingInfo: {
      name: 'Jane Smith',
      phone: '+233 24 987 6543',
      address: '456 Ring Road East',
      city: 'Kumasi',
      region: 'Ashanti',
      postalCode: 'AK-456-7890'
    },
    paymentMethod: 'Credit Card',
    trackingNumber: 'GH987654321',
    createdAt: '2024-01-10T14:20:00Z',
    deliveryDate: '2024-01-13T16:45:00Z'
  }
]

function OrdersPageContent() {
  const { isAuthenticated, isLoading } = useRequireAuth()
  const searchParams = useSearchParams()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'amount'>('newest')

  const success = searchParams.get('success')

  useEffect(() => {
    if (success === 'true') {
      toast.success('Order placed successfully! 🎉', {
        duration: 5000,
        icon: '🛍️'
      })
    }
  }, [success])

  useEffect(() => {
    if (isAuthenticated) {
      // Simulate loading orders
      setTimeout(() => {
        setOrders(mockOrders)
        setLoading(false)
      }, 1500)
    }
  }, [isAuthenticated])

  const getStatusInfo = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return {
          label: 'Pending',
          color: 'text-amber-700',
          bg: 'bg-amber-50 border-amber-200',
          icon: Clock,
          description: 'Order is being reviewed'
        }
      case 'confirmed':
        return {
          label: 'Confirmed',
          color: 'text-blue-700',
          bg: 'bg-blue-50 border-blue-200',
          icon: CheckCircle,
          description: 'Order confirmed and processing'
        }
      case 'preparing':
        return {
          label: 'Preparing',
          color: 'text-orange-700',
          bg: 'bg-orange-50 border-orange-200',
          icon: Package,
          description: 'Items are being prepared'
        }
      case 'shipped':
        return {
          label: 'Shipped',
          color: 'text-purple-700',
          bg: 'bg-purple-50 border-purple-200',
          icon: Truck,
          description: 'Package is on the way'
        }
      case 'delivered':
        return {
          label: 'Delivered',
          color: 'text-emerald-700',
          bg: 'bg-emerald-50 border-emerald-200',
          icon: CheckCircle,
          description: 'Successfully delivered'
        }
      case 'cancelled':
        return {
          label: 'Cancelled',
          color: 'text-red-700',
          bg: 'bg-red-50 border-red-200',
          icon: Clock,
          description: 'Order was cancelled'
        }
      default:
        return {
          label: 'Unknown',
          color: 'text-gray-700',
          bg: 'bg-gray-50 border-gray-200',
          icon: Clock,
          description: 'Status unknown'
        }
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const copyOrderNumber = (orderNumber: string) => {
    navigator.clipboard.writeText(orderNumber)
    toast.success('Order number copied!', { icon: '📋' })
  }

  const filteredOrders = orders
    .filter(order => {
      const matchesSearch = order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case 'amount':
          return b.total - a.total
        default:
          return 0
      }
    })

  const getOrderStats = () => {
    const total = orders.length
    const delivered = orders.filter(o => o.status === 'delivered').length
    const pending = orders.filter(o => o.status === 'pending').length
    const totalSpent = orders.reduce((sum, order) => sum + order.total, 0)
    return { total, delivered, pending, totalSpent }
  }

  const stats = getOrderStats()

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Loading Skeleton */}
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
              <div className="h-12 bg-muted rounded w-1/2 mb-8"></div>

              {/* Stats skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-card rounded-xl p-6 border">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-8 bg-muted rounded w-1/2"></div>
                  </div>
                ))}
              </div>

              {/* Orders skeleton */}
              <div className="space-y-6">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="bg-card rounded-xl p-6 border">
                    <div className="h-6 bg-muted rounded w-1/3 mb-4"></div>
                    <div className="h-20 bg-muted rounded mb-4"></div>
                    <div className="h-16 bg-muted rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <Link href="/" className="hover:text-primary transition-colors">Home</Link>
              <span>/</span>
              <span className="text-foreground font-medium">Orders</span>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div>
                <h1 className="text-4xl font-bold text-foreground flex items-center gap-3 mb-2">
                  <div className="p-2 bg-primary/10 rounded-xl">
                    <Package className="w-8 h-8 text-primary" />
                  </div>
                  Your Orders
                </h1>
                <p className="text-muted-foreground text-lg">
                  Track your orders and manage your purchases
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" className="hidden sm:flex">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button asChild>
                  <Link href="/products">
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    Continue Shopping
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Success Message */}
          {success === 'true' && (
            <div className="mb-8 p-6 bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-200 rounded-xl shadow-sm">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-emerald-500 rounded-full">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-emerald-900 text-lg mb-1">Order Placed Successfully!</h3>
                  <p className="text-emerald-800 mb-3">
                    Your order has been received and is being processed. You&apos;ll receive updates via SMS and email.
                  </p>
                  <Button variant="outline" size="sm" className="bg-white">
                    <Eye className="w-4 h-4 mr-2" />
                    View Order Details
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-card rounded-xl p-6 border shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-muted-foreground text-sm font-medium">Total Orders</span>
                <Package2 className="w-5 h-5 text-blue-500" />
              </div>
              <div className="text-2xl font-bold text-foreground">{stats.total}</div>
            </div>

            <div className="bg-card rounded-xl p-6 border shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-muted-foreground text-sm font-medium">Delivered</span>
                <CheckCircle className="w-5 h-5 text-emerald-500" />
              </div>
              <div className="text-2xl font-bold text-foreground">{stats.delivered}</div>
            </div>

            <div className="bg-card rounded-xl p-6 border shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-muted-foreground text-sm font-medium">Pending</span>
                <Clock className="w-5 h-5 text-amber-500" />
              </div>
              <div className="text-2xl font-bold text-foreground">{stats.pending}</div>
            </div>

            <div className="bg-card rounded-xl p-6 border shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-muted-foreground text-sm font-medium">Total Spent</span>
                <Star className="w-5 h-5 text-amber-500" />
              </div>
              <div className="text-2xl font-bold text-foreground">₵{stats.totalSpent.toFixed(2)}</div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="mb-8 p-6 bg-card rounded-xl border shadow-sm">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search orders by number or product name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-3 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="preparing">Preparing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'amount')}
                  className="px-4 py-3 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="amount">Highest Amount</option>
                </select>
              </div>
            </div>
          </div>

          {/* Orders List */}
          {filteredOrders.length === 0 ? (
            <div className="text-center py-16">
              <div className="p-6 bg-muted/30 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                <Package className="w-12 h-12 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                {searchQuery || statusFilter !== 'all' ? 'No orders found' : 'No orders yet'}
              </h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                {searchQuery || statusFilter !== 'all'
                  ? "Try adjusting your search or filters to find what you're looking for."
                  : 'When you place your first order, it will appear here. Start shopping to send some love to Ghana!'
                }
              </p>
              {!searchQuery && statusFilter === 'all' && (
                <Button asChild size="lg" className="shadow-lg hover:shadow-xl transition-shadow">
                  <Link href="/products">
                    <ShoppingBag className="w-5 h-5 mr-2" />
                    Start Shopping
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {filteredOrders.map((order) => {
                const statusInfo = getStatusInfo(order.status)
                const StatusIcon = statusInfo.icon

                return (
                  <div key={order.id} className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
                    {/* Order Header */}
                    <div className="p-6 border-b border-border bg-gradient-to-r from-muted/30 to-muted/10">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="text-xl font-bold text-foreground">
                              #{order.orderNumber}
                            </h3>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyOrderNumber(order.orderNumber)}
                              className="h-6 w-6 p-0"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border ${statusInfo.bg} ${statusInfo.color}`}>
                              <StatusIcon className="w-4 h-4" />
                              {statusInfo.label}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Calendar className="w-4 h-4" />
                              <span>Ordered: {formatDate(order.createdAt)}</span>
                            </div>
                            {order.trackingNumber && (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Package className="w-4 h-4" />
                                <span>Tracking: {order.trackingNumber}</span>
                              </div>
                            )}
                            {order.estimatedDelivery && (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Clock className="w-4 h-4" />
                                <span>ETA: {order.estimatedDelivery}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <span>Payment: {order.paymentMethod}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-3xl font-bold text-foreground">₵{order.total.toFixed(2)}</div>
                            <div className="text-sm text-muted-foreground">
                              {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
                            </div>
                          </div>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Order Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              {order.trackingNumber && (
                                <DropdownMenuItem>
                                  <Truck className="w-4 h-4 mr-2" />
                                  Track Package
                                </DropdownMenuItem>
                              )}
                              {order.status === 'delivered' && (
                                <>
                                  <DropdownMenuItem>
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Reorder
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Star className="w-4 h-4 mr-2" />
                                    Leave Review
                                  </DropdownMenuItem>
                                </>
                              )}
                              <DropdownMenuItem>
                                <Download className="w-4 h-4 mr-2" />
                                Download Invoice
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <MessageCircle className="w-4 h-4 mr-2" />
                                Contact Support
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="p-6">
                      <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                        <Package2 className="w-4 h-4" />
                        Order Items
                      </h4>
                      <div className="space-y-4">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex items-center gap-4 p-4 bg-muted/20 rounded-lg hover:bg-muted/30 transition-colors">
                            <div className="relative w-16 h-16 flex-shrink-0">
                              <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                className="object-cover rounded-lg"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-foreground truncate">{item.name}</h4>
                              {item.variant && (
                                <p className="text-sm text-muted-foreground">{item.variant}</p>
                              )}
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-sm text-muted-foreground">Qty: {item.quantity}</span>
                                <span className="font-bold text-foreground">₵{(item.price * item.quantity).toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Order Summary */}
                      <div className="mt-6 pt-6 border-t border-border">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Shipping Info */}
                          <div>
                            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              Delivery Address
                            </h4>
                            <div className="bg-muted/20 rounded-lg p-4">
                              <div className="font-medium text-foreground mb-1">{order.shippingInfo.name}</div>
                              <div className="text-sm text-muted-foreground space-y-1">
                                <div>{order.shippingInfo.address}</div>
                                <div>{order.shippingInfo.city}, {order.shippingInfo.region}</div>
                                {order.shippingInfo.postalCode && (
                                  <div>{order.shippingInfo.postalCode}</div>
                                )}
                                <div className="flex items-center gap-1 pt-2">
                                  <Phone className="w-3 h-3" />
                                  {order.shippingInfo.phone}
                                </div>
                              </div>
                            </div>
                            {order.notes && (
                              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                <div className="text-sm font-medium text-amber-800 mb-1">Delivery Notes:</div>
                                <div className="text-sm text-amber-700">{order.notes}</div>
                              </div>
                            )}
                          </div>

                          {/* Price Breakdown */}
                          <div>
                            <h4 className="font-semibold text-foreground mb-3">Order Summary</h4>
                            <div className="bg-muted/20 rounded-lg p-4 space-y-3">
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span className="text-foreground">₵{order.subtotal.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Shipping</span>
                                <span className="text-foreground">₵{order.shippingCost.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Tax</span>
                                <span className="text-foreground">₵{order.taxAmount.toFixed(2)}</span>
                              </div>
                              <div className="border-t border-border pt-3">
                                <div className="flex justify-between font-bold text-lg">
                                  <span className="text-foreground">Total</span>
                                  <span className="text-foreground">₵{order.total.toFixed(2)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Help Section */}
          <div className="mt-12 p-8 bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-xl">
            <div className="text-center max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-foreground mb-3">Need Help with Your Order?</h3>
              <p className="text-muted-foreground mb-6 text-lg">
                Our customer support team is here to assist you with any questions about your orders, shipping, or returns.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button variant="outline" className="bg-white shadow-sm hover:shadow-md">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Live Chat Support
                </Button>
                <Button variant="outline" className="bg-white shadow-sm hover:shadow-md">
                  <Phone className="w-4 h-4 mr-2" />
                  Call Us: +233 20 123 4567
                </Button>
                <Button variant="outline" className="bg-white shadow-sm hover:shadow-md">
                  <Truck className="w-4 h-4 mr-2" />
                  Shipping Info
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrdersPageContent
