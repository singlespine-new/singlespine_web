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
  ShoppingBag,
  TrendingUp,
  Shield,
  Zap,
  Filter,
  SortDesc,
  ChevronDown,
  ExternalLink,
  ArrowUpRight
} from 'lucide-react'
import Link from 'next/link'
import toast from '@/components/ui/toast'
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

// Real order fetching will replace mock data

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
        icon: <CheckCircle className="w-5 h-5" />
      })
    }
  }, [success])

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders()
    }
  }, [isAuthenticated])

  const fetchOrders = async () => {
    if (!isAuthenticated) return

    try {
      setLoading(true)
      const response = await fetch('/api/orders')

      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders || [])

        // Show helpful message if no orders found
        if (data.message && (!data.orders || data.orders.length === 0)) {
          console.log('Orders API message:', data.message)
        }
      } else {
        // Handle non-200 responses gracefully
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }))
        console.error('Orders API error:', response.status, errorData.message)

        // Still show empty state instead of error for better UX
        setOrders([])

        // Only show toast error for actual server errors, not empty results
        if (response.status >= 500) {
          toast.error('Server error loading orders. Please try again later.')
        }
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
      // Network or other errors - show empty state
      setOrders([])
      toast.error('Unable to connect to server. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

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
  const formatMoney = (amount: number) =>
    `₵${Number(amount ?? 0).toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const refetchOrders = async () => {
    if (!isAuthenticated) return

    try {
      setLoading(true)
      const response = await fetch('/api/orders')

      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders || [])
        toast.success('Orders refreshed!')

        // Show message if no orders found
        if (data.message && (!data.orders || data.orders.length === 0)) {
          toast.info(data.message)
        }
      } else {
        // Handle errors gracefully
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }))
        console.error('Refresh orders error:', response.status, errorData.message)

        if (response.status >= 500) {
          toast.error('Server error. Please try again.')
        } else {
          // For other errors, just set empty orders
          setOrders([])
          toast.info('No orders found')
        }
      }
    } catch (error) {
      console.error('Error refreshing orders:', error)
      toast.error('Unable to refresh. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  const copyOrderNumber = (orderNumber: string) => {
    navigator.clipboard.writeText(orderNumber)
    toast.success('Order number copied!', { icon: <Copy className="w-4 h-4" /> })
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
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-primary/5">
        <div className="container mx-auto px-4 py-6 md:py-8">
          <div className="max-w-7xl mx-auto">
            {/* Enhanced Loading Skeleton */}
            <div className="animate-pulse">
              {/* Header Skeleton */}
              <div className="mb-8">
                <div className="h-4 bg-muted rounded w-32 mb-3"></div>
                <div className="h-10 bg-muted rounded w-64 mb-4"></div>
                <div className="h-5 bg-muted rounded w-96 mb-6"></div>
              </div>

              {/* Stats skeleton with better spacing */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-card rounded-2xl p-4 md:p-6 border border-border/50 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div className="h-3 bg-muted rounded w-16"></div>
                      <div className="h-5 w-5 bg-muted rounded-full"></div>
                    </div>
                    <div className="h-8 bg-muted rounded w-12 mb-1"></div>
                    <div className="h-3 bg-muted rounded w-20"></div>
                  </div>
                ))}
              </div>

              {/* Enhanced Orders skeleton */}
              <div className="space-y-4 md:space-y-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-card rounded-2xl p-4 md:p-6 border border-border/50 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-6 bg-muted rounded w-32"></div>
                        <div className="h-6 bg-muted rounded-full w-20"></div>
                      </div>
                      <div className="h-8 bg-muted rounded w-24 mt-2 md:mt-0"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                      {[...Array(4)].map((_, j) => (
                        <div key={j} className="h-4 bg-muted rounded"></div>
                      ))}
                    </div>
                    <div className="h-20 bg-muted rounded mb-4"></div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="h-24 bg-muted rounded"></div>
                      <div className="h-24 bg-muted rounded"></div>
                    </div>
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
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-primary/5">
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="max-w-7xl mx-auto">
          {/* Enhanced Header */}
          <div className="mb-8">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
              <Link href="/" className="hover:text-primary transition-colors font-medium">Home</Link>
              <span className="text-muted-foreground/60">/</span>
              <span className="text-foreground font-semibold">Orders</span>
            </div>

            {/* Header Content */}
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 mb-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl"></div>
                    <div className="relative p-3 bg-gradient-to-br from-primary/10 to-primary/20 rounded-2xl border border-primary/20">
                      <Package className="w-8 h-8 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                      Your Orders
                    </h1>
                    <p className="text-muted-foreground text-base md:text-lg">
                      Track deliveries and manage your purchases
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refetchOrders}
                  disabled={loading}
                  className="border-border/60 hover:border-primary/50"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button variant="outline" size="sm" className="hidden md:flex border-border/60 hover:border-primary/50">
                  <Download className="w-4 h-4 mr-2" />
                  Export Orders
                </Button>
                <Button asChild className="shadow-lg hover:shadow-xl transition-all duration-200">
                  <Link href="/products">
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    Continue Shopping
                  </Link>
                </Button>
              </div>
            </div>

            {/* Order System Notice */}
            <div className="mb-6 p-4 bg-blue-50/50 border border-blue-200/50 rounded-xl">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Package className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900 mb-1">Order Tracking System</h3>
                  <p className="text-sm text-blue-800">
                    Your orders are now being tracked! All new orders will appear here with real-time status updates.
                    Previous orders may show placeholder data as we complete the system setup.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Success Message */}
          {success === 'true' && (
            <div className="mb-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-green-500/10 blur-3xl"></div>
              <div className="relative p-6 md:p-8 bg-gradient-to-r from-emerald-50/90 to-green-50/90 border border-emerald-200/60 rounded-2xl shadow-lg backdrop-blur-sm">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-lg"></div>
                    <div className="relative p-3 bg-gradient-to-br from-emerald-500 to-green-500 rounded-full shadow-lg">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 space-y-3">
                    <h3 className="font-bold text-emerald-900 text-xl mb-2">🎉 Order Placed Successfully!</h3>
                    <p className="text-emerald-800 text-base leading-relaxed">
                      Your order has been received and is being processed. You&apos;ll receive real-time updates via SMS and email throughout the delivery process.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button variant="outline" size="sm" className="bg-white/80 hover:bg-white border-emerald-200 text-emerald-700">
                        <Eye className="w-4 h-4 mr-2" />
                        View Order Details
                      </Button>
                      <Button variant="outline" size="sm" className="bg-white/80 hover:bg-white border-emerald-200 text-emerald-700">
                        <Truck className="w-4 h-4 mr-2" />
                        Track Package
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            <div className="group relative overflow-hidden bg-gradient-to-br from-card to-card/80 rounded-2xl p-4 md:p-6 border border-border/50 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-muted-foreground text-sm font-medium">Total Orders</span>
                  <div className="p-2 bg-blue-500/10 rounded-xl">
                    <Package2 className="w-4 h-4 md:w-5 md:h-5 text-blue-500" />
                  </div>
                </div>
                <div className="text-2xl md:text-3xl font-bold text-foreground mb-1">{stats.total}</div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <TrendingUp className="w-3 h-3" />
                  <span>All time</span>
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden bg-gradient-to-br from-card to-card/80 rounded-2xl p-4 md:p-6 border border-border/50 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-muted-foreground text-sm font-medium">Delivered</span>
                  <div className="p-2 bg-emerald-500/10 rounded-xl">
                    <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-emerald-500" />
                  </div>
                </div>
                <div className="text-2xl md:text-3xl font-bold text-foreground mb-1">{stats.delivered}</div>
                <div className="flex items-center gap-1 text-xs text-emerald-600">
                  <Shield className="w-3 h-3" />
                  <span>Successfully</span>
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden bg-gradient-to-br from-card to-card/80 rounded-2xl p-4 md:p-6 border border-border/50 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-muted-foreground text-sm font-medium">Pending</span>
                  <div className="p-2 bg-amber-500/10 rounded-xl">
                    <Clock className="w-4 h-4 md:w-5 md:h-5 text-amber-500" />
                  </div>
                </div>
                <div className="text-2xl md:text-3xl font-bold text-foreground mb-1">{stats.pending}</div>
                <div className="flex items-center gap-1 text-xs text-amber-600">
                  <Zap className="w-3 h-3" />
                  <span>Processing</span>
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden bg-gradient-to-br from-card to-card/80 rounded-2xl p-4 md:p-6 border border-border/50 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-muted-foreground text-sm font-medium">Total Spent</span>
                  <div className="p-2 bg-primary/10 rounded-xl">
                    <Star className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                  </div>
                </div>
                <div className="text-2xl md:text-3xl font-bold text-foreground mb-1">₵{stats.totalSpent.toFixed(2)}</div>
                <div className="flex items-center gap-1 text-xs text-primary">
                  <TrendingUp className="w-3 h-3" />
                  <span>Lifetime value</span>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Filters and Search */}
          <div className="mb-8 p-4 md:p-6 bg-gradient-to-r from-card/80 to-card rounded-2xl border border-border/50 shadow-lg backdrop-blur-sm">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 group-focus-within:text-primary transition-colors" />
                  <input
                    type="text"
                    placeholder="Search orders by number, product name, or recipient..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 md:py-4 border border-border/60 rounded-xl bg-background/80 focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all duration-200 placeholder:text-muted-foreground/70"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="pl-10 pr-8 py-3 md:py-4 border border-border/60 rounded-xl bg-background/80 focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all duration-200 appearance-none cursor-pointer min-w-[140px]"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="preparing">Preparing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 pointer-events-none" />
                </div>

                <div className="relative">
                  <SortDesc className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'amount')}
                    className="pl-10 pr-8 py-3 md:py-4 border border-border/60 rounded-xl bg-background/80 focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all duration-200 appearance-none cursor-pointer min-w-[160px]"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="amount">Highest Amount</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Orders List */}
          {filteredOrders.length === 0 ? (
            <div className="text-center py-16 md:py-24">
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-primary/10 rounded-full blur-3xl w-32 h-32 mx-auto"></div>
                <div className="relative p-8 bg-gradient-to-br from-muted/20 to-muted/40 rounded-full w-32 h-32 mx-auto flex items-center justify-center border border-border/50">
                  <Package className="w-16 h-16 text-muted-foreground" />
                </div>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                {searchQuery || statusFilter !== 'all' ? 'No orders found' : 'No orders yet'}
              </h2>
              <p className="text-muted-foreground mb-8 max-w-lg mx-auto text-lg leading-relaxed">
                {searchQuery || statusFilter !== 'all'
                  ? "Try adjusting your search criteria or filters to find what you're looking for."
                  : 'Your orders will appear here once you place them. Send love to your family and friends in Ghana by shopping our amazing products!'
                }
              </p>
              {!searchQuery && statusFilter === 'all' && (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button asChild size="lg" className="shadow-lg hover:shadow-xl transition-all duration-200">
                    <Link href="/products">
                      <ShoppingBag className="w-5 h-5 mr-2" />
                      Start Shopping
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link href="/how-it-works">
                      Learn How It Works
                    </Link>
                  </Button>
                </div>
              )}

            </div>
          ) : (
            <div className="space-y-4 md:space-y-6">
              {filteredOrders.map((order) => {
                const statusInfo = getStatusInfo(order.status)
                const StatusIcon = statusInfo.icon

                return (
                  <div key={order.id} className="group bg-gradient-to-br from-card to-card/80 border border-border/50 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden hover:-translate-y-1">
                    {/* Enhanced Order Header */}
                    <div className="p-4 md:p-6 border-b border-border/50 bg-gradient-to-r from-muted/20 to-muted/10">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex-1 space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                            <div className="flex items-center gap-3">
                              <h3 className="text-lg md:text-xl font-bold text-foreground">
                                #{order.orderNumber}
                              </h3>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyOrderNumber(order.orderNumber)}
                                className="h-7 w-7 p-0 hover:bg-primary/10 rounded-lg"
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                            </div>
                            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border ${statusInfo.bg} ${statusInfo.color} shadow-sm`}>
                              <StatusIcon className="w-4 h-4" />
                              {statusInfo.label}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Calendar className="w-4 h-4 text-primary/60" />
                              <span>Ordered: {formatDate(order.createdAt)}</span>
                            </div>
                            {order.trackingNumber && (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Package className="w-4 h-4 text-primary/60" />
                                <span>Tracking: {order.trackingNumber}</span>
                              </div>
                            )}
                            {order.estimatedDelivery && (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Clock className="w-4 h-4 text-primary/60" />
                                <span>ETA: {order.estimatedDelivery}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <span>Payment: {order.paymentMethod}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                          <div className="text-right">
                            <div className="text-2xl md:text-3xl font-bold text-foreground">₵{order.total.toFixed(2)}</div>
                            <div className="text-sm text-muted-foreground">
                              {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
                            </div>
                          </div>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm" className="border-border/60 hover:border-primary/50 shadow-sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuLabel>Order Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="cursor-pointer">
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              {order.trackingNumber && (
                                <DropdownMenuItem className="cursor-pointer">
                                  <Truck className="w-4 h-4 mr-2" />
                                  Track Package
                                  <ExternalLink className="w-3 h-3 ml-auto" />
                                </DropdownMenuItem>
                              )}
                              {order.status === 'delivered' && (
                                <>
                                  <DropdownMenuItem className="cursor-pointer">
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Reorder Items
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="cursor-pointer">
                                    <Star className="w-4 h-4 mr-2" />
                                    Leave Review
                                  </DropdownMenuItem>
                                </>
                              )}
                              <DropdownMenuItem className="cursor-pointer">
                                <Download className="w-4 h-4 mr-2" />
                                Download Invoice
                              </DropdownMenuItem>
                              <DropdownMenuItem className="cursor-pointer">
                                <MessageCircle className="w-4 h-4 mr-2" />
                                Contact Support
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Order Items */}
                    <div className="p-4 md:p-6">
                      <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                        <Package2 className="w-5 h-5 text-primary" />
                        Order Items
                        <span className="text-sm font-normal text-muted-foreground">
                          ({order.items.length} {order.items.length === 1 ? 'item' : 'items'})
                        </span>
                      </h4>
                      <div className="space-y-3">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex items-center gap-4 p-3 md:p-4 bg-gradient-to-r from-muted/10 to-muted/20 rounded-xl hover:from-muted/20 hover:to-muted/30 transition-all duration-200 border border-border/30">
                            <div className="relative w-16 h-16 md:w-20 md:h-20 flex-shrink-0">
                              <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                className="object-cover rounded-lg shadow-sm"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-foreground truncate text-sm md:text-base">{item.name}</h4>
                              {item.variant && (
                                <p className="text-sm text-muted-foreground mt-1">{item.variant}</p>
                              )}
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-sm text-muted-foreground">Qty: {item.quantity}</span>
                                <span className="font-bold text-foreground text-sm md:text-base">₵{(item.price * item.quantity).toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Enhanced Order Summary */}
                      <div className="mt-6 pt-6 border-t border-border/50">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Enhanced Shipping Info */}
                          <div className="space-y-4">
                            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                              <MapPin className="w-5 h-5 text-primary" />
                              Delivery Address
                            </h4>
                            <div className="bg-gradient-to-br from-muted/10 to-muted/20 rounded-xl p-4 border border-border/30">
                              <div className="font-semibold text-foreground mb-2">{order.shippingInfo.name}</div>
                              <div className="text-sm text-muted-foreground space-y-1">
                                <div className="font-medium">{order.shippingInfo.address}</div>
                                <div>{order.shippingInfo.city}, {order.shippingInfo.region}</div>
                                {order.shippingInfo.postalCode && (
                                  <div className="font-mono text-xs bg-muted/50 px-2 py-1 rounded inline-block">
                                    {order.shippingInfo.postalCode}
                                  </div>
                                )}
                                <div className="flex items-center gap-2 pt-2 mt-3 border-t border-border/30">
                                  <Phone className="w-4 h-4 text-primary" />
                                  <span className="font-medium">{order.shippingInfo.phone}</span>
                                </div>
                              </div>
                            </div>
                            {order.notes && (
                              <div className="p-4 bg-gradient-to-r from-amber-50/80 to-orange-50/80 border border-amber-200/60 rounded-xl">
                                <div className="text-sm font-semibold text-amber-800 mb-2 flex items-center gap-2">
                                  <MessageCircle className="w-4 h-4" />
                                  Delivery Notes:
                                </div>
                                <div className="text-sm text-amber-700 leading-relaxed">{order.notes}</div>
                              </div>
                            )}
                          </div>

                          {/* Enhanced Price Breakdown */}
                          <div className="space-y-4">
                            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                              <Star className="w-5 h-5 text-primary" />
                              Order Summary
                            </h4>
                            <div className="bg-gradient-to-br from-muted/10 to-muted/20 rounded-xl p-4 border border-border/30 space-y-3">
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span className="font-medium text-foreground">₵{order.subtotal.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Shipping</span>
                                <span className="font-medium text-foreground">₵{order.shippingCost.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Tax (12.5%)</span>
                                <span className="font-medium text-foreground">₵{order.taxAmount.toFixed(2)}</span>
                              </div>
                              <div className="border-t border-border/50 pt-3">
                                <div className="flex justify-between font-bold text-lg">
                                  <span className="text-foreground">Total Amount</span>
                                  <span className="text-primary">₵{order.total.toFixed(2)}</span>
                                </div>
                              </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="flex flex-col sm:flex-row gap-2 pt-2">
                              {order.trackingNumber && (
                                <Button variant="outline" size="sm" className="flex-1">
                                  <Truck className="w-4 h-4 mr-2" />
                                  Track Order
                                  <ArrowUpRight className="w-3 h-3 ml-auto" />
                                </Button>
                              )}
                              <Button variant="outline" size="sm" className="flex-1">
                                <Download className="w-4 h-4 mr-2" />
                                Invoice
                              </Button>
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

          {/* Enhanced Help Section */}
          <div className="mt-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 blur-3xl"></div>
            <div className="relative p-6 md:p-8 bg-gradient-to-r from-primary/5 to-secondary/10 border border-primary/20 rounded-2xl backdrop-blur-sm">
              <div className="text-center max-w-3xl mx-auto">
                <div className="flex items-center justify-center mb-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg"></div>
                    <div className="relative p-4 bg-gradient-to-br from-primary/10 to-primary/20 rounded-full border border-primary/30">
                      <MessageCircle className="w-8 h-8 text-primary" />
                    </div>
                  </div>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Need Help with Your Order?</h3>
                <p className="text-muted-foreground mb-8 text-base md:text-lg leading-relaxed">
                  Our dedicated customer support team is here to assist you with any questions about your orders, shipping, or returns. We're available 24/7 to help!
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" className="bg-white/80 hover:bg-white shadow-sm hover:shadow-lg transition-all duration-200 border-primary/20 p-4 h-auto">
                    <div className="flex flex-col items-center gap-2">
                      <MessageCircle className="w-5 h-5 text-primary" />
                      <span className="font-medium">Live Chat</span>
                      <span className="text-xs text-muted-foreground">Available 24/7</span>
                    </div>
                  </Button>
                  <Button variant="outline" className="bg-white/80 hover:bg-white shadow-sm hover:shadow-lg transition-all duration-200 border-primary/20 p-4 h-auto">
                    <div className="flex flex-col items-center gap-2">
                      <Phone className="w-5 h-5 text-primary" />
                      <span className="font-medium">Call Us</span>
                      <span className="text-xs text-muted-foreground">+233 20 123 4567</span>
                    </div>
                  </Button>
                  <Button variant="outline" className="bg-white/80 hover:bg-white shadow-sm hover:shadow-lg transition-all duration-200 border-primary/20 p-4 h-auto">
                    <div className="flex flex-col items-center gap-2">
                      <Truck className="w-5 h-5 text-primary" />
                      <span className="font-medium">Shipping Info</span>
                      <span className="text-xs text-muted-foreground">Track & FAQs</span>
                    </div>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrdersPageContent
