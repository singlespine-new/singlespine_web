'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth, useRequireAuth } from '@/lib/auth-utils'
import { Button } from '@/components/ui/Button'
import { UIIcon } from '@/components/ui/icon'
import toast from '@/components/ui/toast'

/* -----------------------------------------------------------------------------
 * Types
 * ---------------------------------------------------------------------------*/
interface Order {
  id: string
  orderNumber: string
  status: string
  paymentStatus: string
  total: number
  estimatedDelivery: string | null
  createdAt: string
  recipientName: string
  recipientPhone: string
  recipientAddress: string
  recipientCity: string
  recipientRegion: string
  paymentMethod: string
  transactionId?: string
}

/* -----------------------------------------------------------------------------
 * Status Flow
 * ---------------------------------------------------------------------------*/
const STATUS_FLOW = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'completed'
] as const
type StatusKey = typeof STATUS_FLOW[number]

function normalizeStatus(raw: string | null | undefined): StatusKey {
  const val = (raw || '').toLowerCase()
  return (STATUS_FLOW.includes(val as StatusKey) ? val : 'pending') as StatusKey
}

const statusMeta: Record<
  StatusKey,
  { label: string; description: string; icon: string }
> = {
  pending: { label: 'Pending', description: 'Awaiting confirmation', icon: 'clock' },
  confirmed: { label: 'Confirmed', description: 'Order confirmed', icon: 'success' },
  processing: { label: 'Processing', description: 'Preparing your items', icon: 'package' },
  shipped: { label: 'Shipped', description: 'In transit', icon: 'truck' },
  delivered: { label: 'Delivered', description: 'Delivered to recipient', icon: 'success' },
  completed: { label: 'Completed', description: 'Order finalized', icon: 'success' }
}

function badgeTone(status: StatusKey) {
  switch (status) {
    case 'completed':
    case 'delivered':
      return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/15'
    case 'processing':
      return 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/15'
    case 'shipped':
      return 'bg-violet-50 text-violet-700 ring-1 ring-violet-600/15'
    case 'confirmed':
      return 'bg-primary/10 text-primary ring-1 ring-primary/20'
    case 'pending':
    default:
      return 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/15'
  }
}

/* -----------------------------------------------------------------------------
 * Small UI Helpers
 * ---------------------------------------------------------------------------*/
const Icon = ({ name, size = 20, className }: { name: string; size?: number; className?: string }) => (
  <UIIcon name={name as any} size={size} className={className} />
)

const Money: React.FC<{ value: number; className?: string }> = ({ value, className }) => (
  <span className={className}>
    ₵{Number(value ?? 0).toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
  </span>
)

const SectionCard: React.FC<{
  title?: string
  subtitle?: string
  icon?: React.ReactNode
  actions?: React.ReactNode
  className?: string
  children: React.ReactNode
}> = ({ title, subtitle, icon, actions, className, children }) => (
  <section
    className={`rounded-2xl border border-border/40 bg-white/90 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow ${className || ''}`}
  >
    {(title || actions) && (
      <header className="flex items-start justify-between gap-4 px-6 pt-6">
        <div className="flex items-center gap-3">
          {icon}
          <div>
            {title && <h3 className="text-lg font-semibold tracking-tight">{title}</h3>}
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </header>
    )}
    <div className="px-6 pb-6 pt-4">{children}</div>
  </section>
)

const InfoRow: React.FC<{ label: string; value: React.ReactNode; mono?: boolean }> = ({
  label,
  value,
  mono
}) => (
  <div className="flex items-center justify-between gap-4">
    <span className="text-sm text-muted-foreground">{label}</span>
    <span className={`text-sm font-medium truncate ${mono ? 'font-mono bg-muted px-2 py-0.5 rounded' : ''}`}>
      {value}
    </span>
  </div>
)

const Timeline: React.FC<{ current: StatusKey }> = ({ current }) => {
  const currentIndex = STATUS_FLOW.indexOf(current)
  return (
    <ol className="relative flex flex-col gap-6 md:gap-4 md:flex-row md:items-stretch">
      {STATUS_FLOW.map((step, idx) => {
        const active = idx <= currentIndex
        const last = idx === STATUS_FLOW.length - 1
        const meta = statusMeta[step]
        return (
          <li key={step} className="relative flex-1">
            {!last && (
              <div
                className={`hidden md:block absolute top-5 left-9 right-0 h-0.5 rounded-full transition-colors ${idx < currentIndex ? 'bg-primary/70' : 'bg-border'
                  }`}
              />
            )}
            <div className="flex items-start md:items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ring-1 ring-inset transition-colors ${active ? 'bg-primary/10 text-primary ring-primary/20' : 'bg-muted text-muted-foreground ring-border'
                  }`}
              >
                <Icon name={meta.icon} size={18} />
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-medium">{meta.label}</p>
                {active ? (
                  <p className="text-xs text-primary font-medium">
                    {idx === currentIndex ? 'In progress' : 'Completed'}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">Pending</p>
                )}
              </div>
            </div>
          </li>
        )
      })}
    </ol>
  )
}

const LoadingSkeleton: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 animate-pulse">
      <div className="h-10 w-64 bg-muted rounded-lg" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="h-64 bg-white/60 rounded-2xl border border-border/40" />
          <div className="h-72 bg-white/60 rounded-2xl border border-border/40" />
          <div className="h-56 bg-white/60 rounded-2xl border border-border/40" />
        </div>
        <div className="space-y-6">
          <div className="h-96 bg-white/60 rounded-2xl border border-border/40" />
        </div>
      </div>
    </div>
  </div>
)

/* -----------------------------------------------------------------------------
 * Page Component
 * ---------------------------------------------------------------------------*/
export default function OrderConfirmationPage() {
  const { isAuthenticated, isLoading } = useRequireAuth()
  useAuth() // reserved for future personalization
  const params = useParams()
  const router = useRouter()
  const orderId = params.orderId as string

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOrder = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/orders/${orderId}`, { cache: 'no-store' })
      if (!res.ok) throw new Error('Order not found')
      const data = await res.json()
      setOrder(data.order)
    } catch (e) {
      console.error(e)
      setError('Failed to load order details')
    } finally {
      setLoading(false)
    }
  }, [orderId])

  useEffect(() => {
    if (!isAuthenticated || !orderId) return
    fetchOrder()
  }, [isAuthenticated, orderId, fetchOrder])

  const copyOrderNumber = useCallback(() => {
    const id = order?.orderNumber || orderId
    navigator.clipboard.writeText(id)
    toast.success('Order number copied')
  }, [order, orderId])

  const shareOrder = useCallback(() => {
    if (navigator.share) {
      navigator
        .share({
          title: 'Singlespine Order',
          text: `Order ${order?.orderNumber || orderId} status: ${order?.status}`,
          url: window.location.href
        })
        .catch(() => { })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Share link copied')
    }
  }, [order, orderId])

  const downloadInvoice = useCallback(() => {
    toast.info('Invoice generation coming soon')
  }, [])

  const printPage = useCallback(() => {
    window.print()
  }, [])

  if (isLoading || loading) return <LoadingSkeleton />

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
        <div className="text-center space-y-6 max-w-md">
          <div className="p-8 bg-card/60 backdrop-blur border border-border/50 rounded-3xl">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 ring-1 ring-red-600/20">
              <Icon name="package" size={40} className="text-red-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2 tracking-tight">Order Not Found</h2>
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
              <Button variant="ghost" className="w-full h-12 rounded-xl" onClick={fetchOrder}>
                Retry
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const statusKey = normalizeStatus(order.status)
  const paymentOk = ['paid', 'confirmed', 'successful', 'success'].includes(order.paymentStatus.toLowerCase())
  const paymentStatusClass = paymentOk
    ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/15'
    : 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/15'

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 print:bg-white">
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-border/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="p-2 h-auto rounded-xl"
              aria-label="Go back"
            >
              <Icon name="arrow-left" size={20} />
            </Button>
            <div className="space-y-0.5">
              <h1 className="text-xl font-semibold leading-none">
                {['delivered', 'completed'].includes(statusKey) ? 'Order Summary' : 'Order Confirmation'}
              </h1>
              <p className="text-xs text-muted-foreground">
                Placed{' '}
                {new Date(order.createdAt).toLocaleString(undefined, {
                  dateStyle: 'medium',
                  timeStyle: 'short'
                })}
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={copyOrderNumber}
              aria-label="Copy order number"
              className="rounded-lg"
            >
              <Icon name="copy" size={16} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={shareOrder}
              aria-label="Share order"
              className="rounded-lg"
            >
              <Icon name="share" size={16} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={downloadInvoice}
              aria-label="Download invoice"
              className="rounded-lg"
            >
              <Icon name="download" size={16} />
            </Button>
            <Button variant="outline" size="sm" onClick={printPage} className="rounded-lg hidden md:inline-flex">
              Print
            </Button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl border border-border/40 bg-gradient-to-br from-primary/15 via-white to-white">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-10 -left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
          </div>
          <div className="relative p-8 md:p-10 text-center">
            <div className="mx-auto w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 ring-1 ring-primary/20">
              <Icon name="success" size={42} className="text-primary" />
            </div>
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mb-3">
              {['delivered', 'completed'].includes(statusKey)
                ? 'Thank you! Your order is complete.'
                : 'Order Confirmed'}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-5">
              {['delivered', 'completed'].includes(statusKey)
                ? 'Below is a full summary of your purchase and delivery details.'
                : 'We have received your order and will keep you updated as it progresses.'}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
              <div className="flex items-center gap-1.5 bg-white/70 px-3 py-1.5 rounded-full border border-border/40">
                <span className="text-muted-foreground">Order</span>
                <code className="font-mono text-primary">{order.orderNumber || order.id}</code>
                <Button
                  variant='ghost'
                  onClick={copyOrderNumber}
                  className="text-primary hover:text-primary/80 transition-colors cursor-pointer"
                  aria-label="Copy order number"
                >
                  <Icon name="copy" size={16} />
                </Button>
              </div>
              <div className={`px-3 py-1.5 rounded-full text-xs font-medium ${badgeTone(statusKey)}`}>
                {statusMeta[statusKey].label}
              </div>
              <div className="px-3 py-1.5 rounded-full bg-white/70 border border-border/40">
                Total <Money value={order.total} />
              </div>
            </div>
          </div>
          <div className="px-6 pb-8">
            <Timeline current={statusKey} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Status */}
            <SectionCard
              title="Order Status"
              subtitle="Live progression"
              icon={
                <div className="p-2 bg-primary/10 rounded-xl">
                  <Icon name="package" size={20} className="text-primary" />
                </div>
              }
              actions={
                <>
                  <Button variant="ghost" size="sm" onClick={shareOrder} aria-label="Share" className="p-2 rounded-lg">
                    <Icon name="share" size={16} />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={downloadInvoice} aria-label="Invoice" className="p-2 rounded-lg">
                    <Icon name="download" size={16} />
                  </Button>
                </>
              }
            >
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 p-4 rounded-xl bg-muted/40 border border-border/40 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon name="package" size={20} className="text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Current Status</p>
                        <p className="text-xs text-muted-foreground">Auto-updates</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${badgeTone(statusKey)}`}>
                      {statusMeta[statusKey].label}
                    </span>
                  </div>
                  <div className="flex-1 p-4 rounded-xl bg-muted/40 border border-border/40 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-emerald-100">
                        <Icon name="credit-card" size={20} className="text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-medium">Payment</p>
                        <p className="text-xs text-muted-foreground">Verification state</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${paymentStatusClass}`}>
                      {order.paymentStatus}
                    </span>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-muted/30 border border-border/40 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-100">
                      <Icon name="truck" size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Estimated Delivery</p>
                      <p className="text-xs text-muted-foreground">Projected window</p>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">
                    {order.estimatedDelivery || 'Pending'}
                  </span>
                </div>
              </div>
            </SectionCard>

            {/* Delivery */}
            <SectionCard
              title="Delivery Information"
              subtitle="Destination & recipient"
              icon={
                <div className="p-2 bg-primary/10 rounded-xl">
                  <Icon name="location" size={20} className="text-primary" />
                </div>
              }
            >
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Recipient
                  </p>
                  <p className="font-semibold">{order.recipientName}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Phone
                  </p>
                  <div className="flex items-center gap-2">
                    <Icon name="phone" size={16} className="text-muted-foreground" />
                    <span className="font-medium">{order.recipientPhone}</span>
                  </div>
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Address
                  </p>
                  <div className="flex items-start gap-2">
                    <Icon name="location" size={16} className="text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">{order.recipientAddress}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.recipientCity}, {order.recipientRegion}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* Payment */}
            <SectionCard
              title="Payment"
              subtitle="Method & transaction"
              icon={
                <div className="p-2 bg-primary/10 rounded-xl">
                  <Icon name="credit-card" size={20} className="text-primary" />
                </div>
              }
            >
              <div className="space-y-5">
                <InfoRow label="Payment Method" value={order.paymentMethod.replace(/_/g, ' ')} />
                {order.transactionId && <InfoRow label="Transaction ID" value={order.transactionId} mono />}
                <div className="pt-4 border-t border-border/40 flex items-center justify-between">
                  <span className="text-sm font-medium">Total Paid</span>
                  <span className="text-lg font-semibold text-primary">
                    <Money value={order.total} />
                  </span>
                </div>
              </div>
            </SectionCard>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            <SectionCard
              title="Next Steps"
              subtitle="What to expect"
              icon={
                <div className="p-2 bg-primary/10 rounded-xl">
                  <Icon name="clock" size={20} className="text-primary" />
                </div>
              }
            >
              <div className="space-y-6">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-primary">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Processing</h4>
                    <p className="text-xs text-muted-foreground">
                      We verify payment and prepare the items. You will be notified of any issues.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-muted-foreground">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Shipment</h4>
                    <p className="text-xs text-muted-foreground">
                      Order travels to destination. Tracking appears once dispatched.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-muted-foreground">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Delivery</h4>
                    <p className="text-xs text-muted-foreground">
                      Final handoff to {order.recipientName} in {order.recipientCity}.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 space-y-3">
                <Button asChild className="w-full h-11 rounded-xl">
                  <Link href="/orders">View All Orders</Link>
                </Button>
                <Button asChild variant="outline" className="w-full h-11 rounded-xl">
                  <Link href="/products">Continue Shopping</Link>
                </Button>
              </div>

              <div className="mt-6 p-4 bg-muted/30 rounded-xl border border-border/40">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Icon name="star" size={16} className="text-yellow-500" />
                  Need Help?
                </h4>
                <p className="text-xs text-muted-foreground mb-3">
                  Have a question about this order? Our support team is ready to help.
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  Contact Support
                </Button>
              </div>
            </SectionCard>

            <SectionCard
              title="Quick Actions"
              subtitle="Utilities"
              icon={
                <div className="p-2 bg-primary/10 rounded-xl">
                  <Icon name="package" size={20} className="text-primary" />
                </div>
              }
            >
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyOrderNumber}
                  className="justify-start gap-2 rounded-lg"
                >
                  <Icon name="copy" size={16} /> Copy ID
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={shareOrder}
                  className="justify-start gap-2 rounded-lg"
                >
                  <Icon name="share" size={16} /> Share
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadInvoice}
                  className="justify-start gap-2 rounded-lg"
                >
                  <Icon name="download" size={16} /> Invoice
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={printPage}
                  className="justify-start gap-2 rounded-lg"
                >
                  <Icon name="download" size={16} className="rotate-90" /> Print
                </Button>
              </div>
            </SectionCard>
          </div>
        </div>
      </div>
    </div>
  )
}
