'use client'
// NOTE: To properly fix the STATUS_META syntax issue I need the exact lines (with line numbers) around that constant.
// Please provide the portion of the file containing the STATUS_META definition so I can produce a precise edit.
// The current request did not include enough surrounding code to safely patch without risking a mismatch.

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { UIIcon } from '@/components/ui/icon'
import { Button } from '@/components/ui/Button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

/**
 * OrderStatus type must stay in sync with backend / API.
 */
export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'

export interface OrderItem {
  id: string
  name: string
  quantity: number
  price: number
  image: string
  variant?: string
}

export interface OrderSummary {
  id: string
  orderNumber: string
  status: OrderStatus
  total: number
  subtotal: number
  shippingCost: number
  taxAmount: number
  paymentMethod: string
  createdAt: string
  estimatedDelivery?: string
  trackingNumber?: string
  items: OrderItem[]
  shippingInfo?: {
    name: string
    phone?: string
    city?: string
    region?: string
  }
  notes?: string
}

/* -------------------------------------------------------------------------- */
/* Status Mapping                                                             */
/* -------------------------------------------------------------------------- */

interface StatusMeta {
  label: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  badgeTone: 'blue' | 'amber' | 'orange' | 'purple' | 'emerald' | 'red' | 'zinc'
  description: string
}

const STATUS_META: Record<OrderStatus, StatusMeta> = {
  pending: {
    label: 'Pending',
    icon: () => <UIIcon name="clock" size={16} />,
    badgeTone: 'amber',
    description: 'Order is awaiting confirmation'
  },
  confirmed: {
    label: 'Confirmed',
    icon: () => <UIIcon name="success" size={16} />,
    badgeTone: 'blue',
    description: 'Order confirmed and queued'
  },
  preparing: {
    label: 'Preparing',
    icon: () => <UIIcon name="package" size={16} />,
    badgeTone: 'orange',
    description: 'Items being prepared for shipment'
  },
  shipped: {
    label: 'Shipped',
    icon: () => <UIIcon name="truck" size={16} />,
    badgeTone: 'purple',
    description: 'In transit to destination'
  },
  delivered: {
    label: 'Delivered',
    icon: () => <UIIcon name="success" size={16} />,
    badgeTone: 'emerald',
    description: 'Successfully delivered'
  },
  cancelled: {
    label: 'Cancelled',
    icon: () => <UIIcon name="warning" size={16} />,
    badgeTone: 'red',
    description: 'Order was cancelled'
  }
}

const badgeToneClasses: Record<
  StatusMeta['badgeTone'],
  { wrap: string; text: string; border: string }
> = {
  blue: {
    wrap: 'bg-blue-50 dark:bg-blue-500/10',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-200/70 dark:border-blue-400/30'
  },
  amber: {
    wrap: 'bg-amber-50 dark:bg-amber-500/10',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-200/70 dark:border-amber-400/30'
  },
  orange: {
    wrap: 'bg-orange-50 dark:bg-orange-500/10',
    text: 'text-orange-700 dark:text-orange-300',
    border: 'border-orange-200/70 dark:border-orange-400/30'
  },
  purple: {
    wrap: 'bg-purple-50 dark:bg-purple-500/10',
    text: 'text-purple-700 dark:text-purple-300',
    border: 'border-purple-200/70 dark:border-purple-400/30'
  },
  emerald: {
    wrap: 'bg-emerald-50 dark:bg-emerald-500/10',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200/70 dark:border-emerald-400/30'
  },
  red: {
    wrap: 'bg-red-50 dark:bg-red-500/10',
    text: 'text-red-700 dark:text-red-300',
    border: 'border-red-200/70 dark:border-red-400/30'
  },
  zinc: {
    wrap: 'bg-zinc-100 dark:bg-zinc-600/20',
    text: 'text-zinc-700 dark:text-zinc-200',
    border: 'border-zinc-300/70 dark:border-zinc-500/40'
  }
}

/* -------------------------------------------------------------------------- */
/* Props                                                                      */
/* -------------------------------------------------------------------------- */

export interface OrderCardProps {
  order: OrderSummary
  /**
   * When true, renders compressed layout (mobile / dense lists).
   */
  compact?: boolean
  /**
   * If provided, used to build internal "View Details" link (e.g. /orders/[id])
   */
  detailsHrefBuilderAction?: (orderId: string) => string
  /**
   * Action callbacks
   */
  onViewDetailsAction?: (order: OrderSummary) => void
  onTrackAction?: (order: OrderSummary) => void
  onReorderAction?: (order: OrderSummary) => void
  onDownloadInvoiceAction?: (order: OrderSummary) => void
  onCopyOrderNumberAction?: (order: OrderSummary) => void
  /**
   * Override className
   */
  className?: string
  /**
   * Loading skeleton mode flag (internal convenience).
   */
  loading?: boolean
}

/* -------------------------------------------------------------------------- */
/* Skeleton                                                                   */
/* -------------------------------------------------------------------------- */

export const OrderCardSkeleton: React.FC<{ compact?: boolean; className?: string }> = ({
  compact,
  className
}) => {
  return (
    <div
      className={cn(
        'animate-pulse relative rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm overflow-hidden',
        compact ? 'p-4' : 'p-6',
        className
      )}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="h-6 w-32 rounded bg-muted" />
          <div className="h-6 w-20 rounded-full bg-muted" />
        </div>
        <div className="h-8 w-24 rounded bg-muted" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-3 w-24 bg-muted rounded" />
            <div className="h-4 w-16 bg-muted/70 rounded" />
          </div>
        ))}
      </div>
      <div className="h-20 bg-muted/50 rounded mb-4" />
      <div className="grid grid-cols-2 gap-3">
        <div className="h-16 bg-muted/40 rounded" />
        <div className="h-16 bg-muted/40 rounded" />
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Subcomponents                                                              */
/* -------------------------------------------------------------------------- */

const StatusBadge: React.FC<{ status: OrderStatus; className?: string }> = ({
  status,
  className
}) => {
  const meta = STATUS_META[status]
  const tone = badgeToneClasses[meta.badgeTone]
  const Icon = meta.icon
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium shadow-sm',
        tone.wrap,
        tone.border,
        tone.text,
        className
      )}
      aria-label={`Status: ${meta.label}`}
      title={meta.description}
    >
      <Icon />
      <span>{meta.label}</span>
    </span>
  )
}

const Money: React.FC<{ value: number; className?: string }> = ({ value, className }) => (
  <span className={cn('tabular-nums', className)}>
    ₵{Number(value ?? 0).toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
  </span>
)

/* -------------------------------------------------------------------------- */
/* Main Component                                                             */
/* -------------------------------------------------------------------------- */

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  compact,
  detailsHrefBuilderAction,
  onViewDetailsAction,
  onTrackAction,
  onReorderAction,
  onDownloadInvoiceAction,
  onCopyOrderNumberAction,
  className,
  loading
}) => {
  if (loading) {
    return <OrderCardSkeleton compact={compact} className={className} />
  }

  const itemCount = order.items.reduce((sum, i) => sum + i.quantity, 0)
  const firstItems = compact ? order.items.slice(0, 2) : order.items.slice(0, 4)
  const moreCount = order.items.length - firstItems.length

  const detailsHref = detailsHrefBuilderAction
    ? detailsHrefBuilderAction(order.id)
    : `/orders/${order.id}`

  const handleCopy = () => {
    navigator.clipboard.writeText(order.orderNumber)
    onCopyOrderNumberAction?.(order)
  }

  return (
    <article
      className={cn(
        'group relative rounded-2xl border border-border/50 bg-gradient-to-br from-card to-card/80 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden',
        'focus-within:ring-2 focus-within:ring-primary/30 outline-none',
        'hover:-translate-y-[2px]',
        className
      )}
      tabIndex={0}
      aria-labelledby={`order-${order.id}-heading`}
    >
      {/* Header */}
      <header
        className={cn(
          'px-5 py-5 md:px-6 md:py-6 border-b border-border/40 bg-gradient-to-r from-muted/20 to-muted/10',
          compact && 'py-4'
        )}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex-1 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-center gap-3">
                <h3
                  id={`order-${order.id}-heading`}
                  className="text-lg md:text-xl font-bold tracking-tight"
                >
                  #{order.orderNumber}
                </h3>
                <button
                  onClick={handleCopy}
                  className="h-7 w-7 inline-flex items-center justify-center rounded-lg bg-muted/60 hover:bg-muted transition-colors"
                  aria-label="Copy order number"
                >
                  <UIIcon name="copy" size={14} className="opacity-80" />
                </button>
              </div>
              <StatusBadge status={order.status} />
            </div>

            <div
              className={cn(
                'grid gap-3 text-xs md:text-sm text-muted-foreground',
                compact
                  ? 'grid-cols-2 sm:grid-cols-3'
                  : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
              )}
            >
              <div className="inline-flex items-center gap-1.5">
                <UIIcon name="calendar" size={14} className="text-primary/60" />
                <span>
                  Ordered:{' '}
                  {new Date(order.createdAt).toLocaleDateString('en-GH', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
              </div>
              {order.trackingNumber && (
                <div className="inline-flex items-center gap-1.5">
                  <UIIcon name="package" size={14} className="text-primary/60" />
                  <span>Tracking: {order.trackingNumber}</span>
                </div>
              )}
              {order.estimatedDelivery && (
                <div className="inline-flex items-center gap-1.5">
                  <UIIcon name="truck" size={14} className="text-primary/60" />
                  <span>ETA: {order.estimatedDelivery}</span>
                </div>
              )}
              <div className="inline-flex items-center gap-1.5">
                <UIIcon name="credit-card" size={14} className="text-primary/60" />
                <span className="capitalize">{order.paymentMethod.replace(/_/g, ' ')}</span>
              </div>
            </div>
          </div>

          {/* Total + Actions */}
          <div className="flex items-start sm:items-center gap-4">
            <div className="text-right">
              <div className="text-xl md:text-2xl font-bold">
                <Money value={order.total} />
              </div>
              <div className="text-xs md:text-sm text-muted-foreground">
                {itemCount} {itemCount === 1 ? 'item' : 'items'}
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="shrink-0 h-9 w-9 border-border/60 hover:border-primary/50"
                  aria-label="Open order actions"
                >
                  <UIIcon name="more" size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel>Order Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => onViewDetailsAction?.(order)}
                >
                  <UIIcon name="eye" size={14} className="mr-2" />
                  View Details
                </DropdownMenuItem>
                {order.trackingNumber && (
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => onTrackAction?.(order)}
                  >
                    <UIIcon name="truck" size={14} className="mr-2" />
                    Track Package
                    <UIIcon
                      name="external-link"
                      size={12}
                      className="ml-auto opacity-60"
                    />
                  </DropdownMenuItem>
                )}
                {order.status === 'delivered' && (
                  <>
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => onReorderAction?.(order)}
                    >
                      <UIIcon name="refresh" size={14} className="mr-2" />
                      Reorder Items
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer">
                      <UIIcon name="star" size={14} className="mr-2" />
                      Leave Review
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => onDownloadInvoiceAction?.(order)}
                >
                  <UIIcon name="download" size={14} className="mr-2" />
                  Download Invoice
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={handleCopy}
                >
                  <UIIcon name="copy" size={14} className="mr-2" />
                  Copy Order #
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Items */}
      <div className={cn('px-5 md:px-6 py-5', compact && 'py-4')}>
        <h4 className="font-semibold text-sm md:text-base mb-4 flex items-center gap-2">
          <UIIcon name="package-alt" size={18} className="text-primary" />
          Order Items
          <span className="text-xs font-normal text-muted-foreground">
            ({order.items.length})
          </span>
        </h4>
        <div
          className={cn(
            'grid gap-3',
            compact
              ? 'grid-cols-1 sm:grid-cols-2'
              : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
          )}
        >
          {firstItems.map(item => (
            <div
              key={item.id}
              className={cn(
                'flex items-center gap-3 rounded-xl border border-border/30 bg-gradient-to-r from-muted/10 to-muted/20',
                'hover:from-muted/20 hover:to-muted/30 transition-colors px-3 py-2.5'
              )}
            >
              <div className="relative h-14 w-14 flex-shrink-0 rounded-lg overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{item.name}</p>
                {item.variant && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {item.variant}
                  </p>
                )}
                <div className="mt-1 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Qty: {item.quantity}</span>
                  <span className="font-semibold">
                    <Money value={item.price * item.quantity} />
                  </span>
                </div>
              </div>
            </div>
          ))}
          {moreCount > 0 && (
            <div className="flex items-center justify-center rounded-xl border border-dashed border-border/40 bg-muted/20 text-xs text-muted-foreground">
              +{moreCount} more
            </div>
          )}
        </div>

        {/* Summary + Shipping */}
        {!compact && (
          <div className="mt-6 pt-6 border-t border-border/50 grid gap-6 lg:grid-cols-2">
            {/* Shipping */}
            <div className="space-y-3">
              <h5 className="font-semibold text-sm flex items-center gap-2">
                <UIIcon name="location" size={16} className="text-primary" />
                Delivery
              </h5>
              <div className="rounded-xl border border-border/30 bg-muted/10 p-4 space-y-2 text-sm">
                <div className="font-medium">
                  {order.shippingInfo?.name || 'Recipient'}
                </div>
                {order.shippingInfo?.city && (
                  <div className="text-muted-foreground">
                    {order.shippingInfo.city}
                    {order.shippingInfo.region
                      ? `, ${order.shippingInfo.region}`
                      : ''}
                  </div>
                )}
                {order.shippingInfo?.phone && (
                  <div className="flex items-center gap-2 pt-2 border-t border-border/30 text-muted-foreground">
                    <UIIcon name="phone" size={14} className="text-primary/80" />
                    <span>{order.shippingInfo.phone}</span>
                  </div>
                )}
                {order.notes && (
                  <div className="pt-2 border-t border-border/30">
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                      {order.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Price Summary */}
            <div className="space-y-3">
              <h5 className="font-semibold text-sm flex items-center gap-2">
                <UIIcon name="star" size={16} className="text-primary" />
                Summary
              </h5>
              <div className="rounded-xl border border-border/30 bg-muted/10 p-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">
                    <Money value={order.subtotal} />
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium">
                    <Money value={order.shippingCost} />
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span className="font-medium">
                    <Money value={order.taxAmount} />
                  </span>
                </div>
                <div className="border-t border-border/40 pt-3 flex justify-between font-semibold">
                  <span>Total</span>
                  <span className="text-primary">
                    <Money value={order.total} />
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewDetailsAction?.(order)}
                  className="flex items-center gap-1.5"
                >
                  <UIIcon name="eye" size={14} />
                  Details
                </Button>
                {order.trackingNumber && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onTrackAction?.(order)}
                    className="flex items-center gap-1.5"
                  >
                    <UIIcon name="truck" size={14} />
                    Track
                    <UIIcon name="external-link" size={12} className="opacity-60" />
                  </Button>
                )}
                {order.status === 'delivered' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onReorderAction?.(order)}
                    className="flex items-center gap-1.5"
                  >
                    <UIIcon name="refresh" size={14} />
                    Reorder
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDownloadInvoiceAction?.(order)}
                  className="flex items-center gap-1.5"
                >
                  <UIIcon name="download" size={14} />
                  Invoice
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer call-to-action (compact) */}
      {compact && (
        <footer className="px-5 md:px-6 pb-5">
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetailsAction?.(order)}
              className="flex items-center gap-1.5"
            >
              <UIIcon name="eye" size={14} />
              Details
            </Button>
            {order.trackingNumber && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onTrackAction?.(order)}
                className="flex items-center gap-1.5"
              >
                <UIIcon name="truck" size={14} />
                Track
              </Button>
            )}
            <Button
              asChild
              size="sm"
              className="ml-auto flex items-center gap-1.5"
            >
              <Link href={detailsHref}>
                View <UIIcon name="arrow-right" size={14} />
              </Link>
            </Button>
          </div>
        </footer>
      )}
    </article>
  )
}

/* -------------------------------------------------------------------------- */
/* Usage Reference (inline documentation)                                     */
/* -------------------------------------------------------------------------- */
/**
 * Example:
 *
 *  <OrderCard
 *    order={order}
 *    onViewDetails={(o) => router.push(`/orders/${o.id}`)}
 *    onTrack={(o) => openTracking(o.trackingNumber)}
 *    onDownloadInvoice={(o) => downloadInvoice(o.id)}
 *    onReorder={(o) => reorder(o.id)}
 *    onCopyOrderNumber={() => toast.success('Copied order number')}
 *  />
 *
 *  <OrderCardSkeleton />
 */

export default OrderCard
