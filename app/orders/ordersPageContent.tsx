'use client'

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  KeyboardEvent,
  useId
} from 'react'
import Link from 'next/link'
// import Image from 'next/image' // removed unused
import { useSearchParams, useRouter } from 'next/navigation'
import { useRequireAuth } from '@/lib/auth-utils'
import { Button } from '@/components/ui/Button'
import { UIIcon, IconName } from '@/components/ui/icon'
import toast from '@/components/ui/toast'
import OrderCard, {
  OrderSummary,
  OrderStatus
} from '@/components/orders/OrderCard'
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger
// } from '@/components/ui/dropdown-menu'

/* ---------------------------------------------------------------------------------------------- */
/* Hook: Reduced Motion                                                                           */
/* ---------------------------------------------------------------------------------------------- */

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const apply = () => setReduced(mq.matches)
    apply()
    if (mq.addEventListener) mq.addEventListener('change', apply)
    else mq.addListener(apply)
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', apply)
      else mq.removeListener(apply)
    }
  }, [])
  return reduced
}

/* ---------------------------------------------------------------------------------------------- */
/* Types (Local API placeholder)                                                                  */
/* ---------------------------------------------------------------------------------------------- */

interface RawOrder {
  id: string
  orderNumber: string
  status: OrderStatus
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

/* ---------------------------------------------------------------------------------------------- */
/* Timeline Component                                                                             */
/* ---------------------------------------------------------------------------------------------- */

const TIMELINE_STEPS: Array<{
  key: 'placed' | 'confirmed' | 'preparing' | 'shipped' | 'delivered'
  label: string
  icon: IconName
}> = [
    { key: 'placed', label: 'Placed', icon: 'clock' },
    { key: 'confirmed', label: 'Confirmed', icon: 'success' },
    { key: 'preparing', label: 'Preparing', icon: 'package' },
    { key: 'shipped', label: 'Shipped', icon: 'truck' },
    { key: 'delivered', label: 'Delivered', icon: 'success' }
  ]

function mapStatusToTimelineKey(status: OrderStatus): typeof TIMELINE_STEPS[number]['key'] {
  switch (status) {
    case 'pending':
      return 'placed'
    case 'confirmed':
      return 'confirmed'
    case 'preparing':
      return 'preparing'
    case 'shipped':
      return 'shipped'
    case 'delivered':
      return 'delivered'
    default:
      return 'placed'
  }
}

const OrderTimeline: React.FC<{ status: OrderStatus }> = ({ status }) => {
  const currentKey = mapStatusToTimelineKey(status)
  const currentIndex = TIMELINE_STEPS.findIndex(s => s.key === currentKey)

  return (
    <div className="relative mt-5 mb-2">
      <div className="flex items-center justify-between gap-2">
        {TIMELINE_STEPS.map((step, idx) => {
          const reached = idx <= currentIndex
            || (status === 'cancelled' && idx <= currentIndex)
          const isCurrent = idx === currentIndex
          const cancelled = status === 'cancelled'
          return (
            <div
              key={step.key}
              className="flex-1 flex flex-col items-center min-w-0"
              aria-current={isCurrent ? 'step' : undefined}
            >
              <div className="w-full flex items-center">
                {idx > 0 && (
                  <div
                    className={[
                      'h-[3px] flex-1 rounded-full transition-colors',
                      reached ? (cancelled ? 'bg-red-400/70 dark:bg-red-500/60' : 'bg-primary/60') : 'bg-border'
                    ].join(' ')}
                  />
                )}
                <div
                  className={[
                    'relative z-10 w-8 h-8 rounded-full border flex items-center justify-center transition-all',
                    reached
                      ? (cancelled
                        ? 'bg-red-500/90 border-red-500 text-white shadow'
                        : 'bg-primary text-primary-foreground border-primary/70 shadow')
                      : 'bg-background border-border text-muted-foreground'
                  ].join(' ')}
                  title={step.label}
                >
                  <UIIcon
                    name={step.icon}
                    size={16}
                    decorative
                    className={reached ? 'opacity-100' : 'opacity-60'}
                  />
                </div>
                {idx < TIMELINE_STEPS.length - 1 && (
                  <div
                    className={[
                      'h-[3px] flex-1 rounded-full transition-colors',
                      idx < currentIndex
                        ? (cancelled ? 'bg-red-400/70 dark:bg-red-500/60' : 'bg-primary/60')
                        : 'bg-border'
                    ].join(' ')}
                  />
                )}
              </div>
              <span
                className={[
                  'mt-2 text-[10px] sm:text-xs font-medium tracking-wide truncate max-w-[70px]',
                  reached
                    ? (cancelled ? 'text-red-600 dark:text-red-400' : 'text-foreground')
                    : 'text-muted-foreground'
                ].join(' ')}
              >
                {step.label}
              </span>
            </div>
          )
        })}
      </div>
      {status === 'cancelled' && (
        <div className="mt-3 flex items-center justify-center gap-1 text-xs text-red-600 dark:text-red-400 font-medium">
          <UIIcon name="warning" size={14} />
          <span>Order Cancelled</span>
        </div>
      )}
    </div>
  )
}

/* ---------------------------------------------------------------------------------------------- */
/* Accessible Combobox (for Status + Sort)                                                        */
/* ---------------------------------------------------------------------------------------------- */

interface ComboOption<T extends string> {
  value: T
  label: string
  icon?: IconName
}

interface ComboboxProps<T extends string> {
  label: string
  options: ComboOption<T>[]
  value: T
  onChange: (v: T) => void
  className?: string
  placeholder?: string
  ariaLabel?: string
  widthClass?: string
}

function Combobox<T extends string>({
  label,
  options,
  value,
  onChange,
  className,
  placeholder,
  ariaLabel,
  widthClass = 'min-w-[160px]'
}: ComboboxProps<T>) {
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [activeIndex, setActiveIndex] = useState<number>(-1)
  const listRef = useRef<HTMLUListElement | null>(null)
  const id = useId()

  const filtered = useMemo(
    () =>
      options.filter(o =>
        o.label.toLowerCase().includes(inputValue.trim().toLowerCase())
      ),
    [options, inputValue]
  )

  useEffect(() => {
    if (!open) {
      setInputValue('')
      setActiveIndex(-1)
    }
  }, [open])

  const commitValue = (opt: ComboOption<T>) => {
    onChange(opt.value)
    setOpen(false)
  }

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setOpen(true)
        setActiveIndex(i =>
          Math.min(filtered.length - 1, i + 1 === filtered.length ? 0 : i + 1)
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setOpen(true)
        setActiveIndex(i =>
          i <= 0 ? filtered.length - 1 : i - 1
        )
        break
      case 'Home':
        e.preventDefault()
        setActiveIndex(0)
        break
      case 'End':
        e.preventDefault()
        setActiveIndex(filtered.length - 1)
        break
      case 'Enter':
        if (open && activeIndex >= 0 && filtered[activeIndex]) {
          e.preventDefault()
          commitValue(filtered[activeIndex])
        }
        break
      case 'Escape':
        if (open) {
          e.preventDefault()
          setOpen(false)
        }
        break
    }
  }

  useEffect(() => {
    if (open && activeIndex >= 0 && listRef.current) {
      const el = listRef.current.querySelectorAll('[role="option"]')[activeIndex] as HTMLElement
      if (el) el.scrollIntoView({ block: 'nearest' })
    }
  }, [activeIndex, open])

  const selected = options.find(o => o.value === value)

  return (
    <div className={['relative', className, widthClass].filter(Boolean).join(' ')}>
      <label
        htmlFor={id}
        className="sr-only"
      >
        {label}
      </label>
      <div
        className={[
          'flex items-center gap-2 rounded-xl border border-border/60 bg-background/80',
          'focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50 transition shadow-sm'
        ].join(' ')}
      >
        <UIIcon
          name="filter"
          size={16}
          className="ml-3 text-muted-foreground"
          aria-hidden
        />
        <input
          id={id}
          role="combobox"
          aria-expanded={open}
          aria-controls={open ? `${id}-listbox` : undefined}
          aria-activedescendant={
            open && activeIndex >= 0 ? `${id}-opt-${activeIndex}` : undefined
          }
          aria-autocomplete="list"
          aria-label={ariaLabel || label}
          placeholder={placeholder || label}
          value={open ? inputValue : (selected?.label || '')}
          onChange={e => {
            setInputValue(e.target.value)
            if (!open) setOpen(true)
          }}
          onKeyDown={onKeyDown}
          onClick={() => setOpen(o => !o)}
          className="w-full bg-transparent outline-none border-0 py-3 pr-10 text-sm placeholder:text-muted-foreground/70"
        />
        <button
          type="button"
          aria-label="Toggle options"
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-muted transition"
          onClick={() => setOpen(o => !o)}
        >
          <UIIcon name="chevron-down" size={16} className="text-muted-foreground" />
        </button>
      </div>
      {open && (
        <ul
          id={`${id}-listbox`}
          role="listbox"
          aria-label={label}
          ref={listRef}
          className="absolute z-30 mt-2 max-h-72 w-full overflow-auto rounded-lg border border-border/60 bg-popover shadow-lg focus:outline-none p-1 backdrop-blur-sm"
        >
          {filtered.length === 0 && (
            <li
              className="px-3 py-2 text-xs text-muted-foreground select-none"
              role="option"
              aria-disabled="true"
              aria-selected="false"
            >
              No matches
            </li>
          )}
          {filtered.map((opt, i) => {
            const active = i === activeIndex
            const selectedState = opt.value === value
            return (
              <li
                id={`${id}-opt-${i}`}
                key={opt.value}
                role="option"
                aria-selected={selectedState}
                className={[
                  'flex items-center gap-2 px-3 py-2 rounded-md text-sm cursor-pointer',
                  active
                    ? 'bg-primary/10 text-foreground'
                    : 'text-foreground hover:bg-muted/70',
                  selectedState ? 'font-medium' : 'font-normal'
                ].join(' ')}
                onMouseDown={e => {
                  e.preventDefault()
                  commitValue(opt)
                }}
                onMouseEnter={() => setActiveIndex(i)}
              >
                {opt.icon && (
                  <UIIcon
                    name={opt.icon}
                    size={14}
                    className="text-primary"
                    decorative
                  />
                )}
                <span className="truncate">{opt.label}</span>
                {selectedState && (
                  <UIIcon
                    name="success"
                    size={14}
                    className="ml-auto text-emerald-500"
                    decorative
                  />
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

/* ---------------------------------------------------------------------------------------------- */
/* Helper: Convert RawOrder -> OrderSummary (OrderCard input)                                     */
/* ---------------------------------------------------------------------------------------------- */

function toOrderSummary(o: RawOrder): OrderSummary {
  return {
    id: o.id,
    orderNumber: o.orderNumber,
    status: o.status,
    total: o.total,
    subtotal: o.subtotal,
    shippingCost: o.shippingCost,
    taxAmount: o.taxAmount,
    paymentMethod: o.paymentMethod,
    createdAt: o.createdAt,
    estimatedDelivery: o.estimatedDelivery,
    trackingNumber: o.trackingNumber,
    items: o.items.map(i => ({
      id: i.id,
      name: i.name,
      quantity: i.quantity,
      price: i.price,
      image: i.image,
      variant: i.variant
    })),
    shippingInfo: {
      name: o.shippingInfo.name,
      phone: o.shippingInfo.phone,
      city: o.shippingInfo.city,
      region: o.shippingInfo.region
    },
    notes: o.notes
  }
}

/* ---------------------------------------------------------------------------------------------- */
/* Invoice PDF Stub                                                                               */
/* ---------------------------------------------------------------------------------------------- */

async function generateInvoicePDF(order: OrderSummary): Promise<Blob> {
  // Extremely small valid-ish PDF stub (not a real invoice yet)
  const lines = [
    '%PDF-1.3',
    '1 0 obj <</Type /Catalog /Pages 2 0 R>> endobj',
    '2 0 obj <</Type /Pages /Kids [3 0 R] /Count 1>> endobj',
    '3 0 obj <</Type /Page /Parent 2 0 R /MediaBox [0 0 300 200] /Contents 4 0 R>> endobj',
    '4 0 obj <</Length 55>> stream',
    `BT /F1 12 Tf 30 170 Td (Invoice) Tj T* (Order #${order.orderNumber}) Tj ET`,
    'endstream endobj',
    'xref 0 5',
    '0000000000 65535 f ',
    '0000000010 00000 n ',
    '0000000060 00000 n ',
    '0000000114 00000 n ',
    '0000000210 00000 n ',
    'trailer <</Size 5/Root 1 0 R>>',
    'startxref',
    '300',
    '%%EOF'
  ]
  return new Blob([lines.join('\n')], { type: 'application/pdf' })
}

async function downloadInvoice(order: OrderSummary) {
  try {
    const blob = await generateInvoicePDF(order)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `invoice-${order.orderNumber}.pdf`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
    toast.success('Invoice download started', {
      icon: <UIIcon name="download" size={18} />
    })
  } catch (e) {
    toast.error('Failed to generate invoice.')
    console.error(e)
  }
}

/* ---------------------------------------------------------------------------------------------- */
/* Orders Page Component                                                                          */
/* ---------------------------------------------------------------------------------------------- */

export default function OrdersPageContent() {
  const { isAuthenticated, isLoading } = useRequireAuth()
  const searchParams = useSearchParams()
  const router = useRouter()
  const reducedMotion = useReducedMotion()

  const [rawOrders, setRawOrders] = useState<RawOrder[]>([])
  const [initialLoading, setInitialLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'amount'>('newest')

  // Virtualization dynamic import
  const [Virtuoso, setVirtuoso] = useState<React.ComponentType<{
    totalCount: number
    itemContent: (index: number) => React.ReactNode
    components?: Record<string, unknown>
    style?: React.CSSProperties
  }> | null>(null)

  useEffect(() => {
    if (rawOrders.length > 30) {
      // Optional dependency: only attempts load if library present at runtime
      // Dynamic import guarded at runtime (optional peer dependency; safe if types absent)
      import('react-virtuoso')
        .then((mod: { Virtuoso: React.ComponentType<{ totalCount: number; itemContent: (index: number) => React.ReactNode; components?: Record<string, unknown>; style?: React.CSSProperties }> }) =>
          setVirtuoso(() => mod.Virtuoso)
        )
        .catch(() => {
          // Silently ignore if not installed
        })
    }
  }, [rawOrders.length])

  const success = searchParams.get('success') === 'true'

  /* -------------------------------------- Fetching ------------------------------------------- */

  const fetchOrders = useCallback(async () => {
    if (!isAuthenticated) return
    try {
      if (initialLoading) setInitialLoading(true)
      const res = await fetch('/api/orders')
      if (res.ok) {
        const data = await res.json()
        setRawOrders(data.orders || [])
        if (data.message && (!data.orders || data.orders.length === 0)) {
          console.log('Orders API message:', data.message)
        }
      } else {
        const err = await res.json().catch(() => ({ message: 'Unknown error' }))
        console.error('Orders API error', res.status, err.message)
        setRawOrders([])
        if (res.status >= 500) {
          toast.error('Server error loading orders.')
        }
      }
    } catch (e) {
      console.error(e)
      setRawOrders([])
      toast.error('Unable to connect to server.')
    } finally {
      setInitialLoading(false)
    }
  }, [isAuthenticated, initialLoading])

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders()
    }
  }, [isAuthenticated, fetchOrders])

  // Success toast
  useEffect(() => {
    if (success) {
      toast.success('Order placed successfully.', {
        duration: 5000,
        icon: <UIIcon name="success" size={20} />
      })
    }
  }, [success])

  const refetchOrders = async () => {
    if (!isAuthenticated) return
    setRefreshing(true)
    try {
      const res = await fetch('/api/orders')
      if (res.ok) {
        const data = await res.json()
        setRawOrders(data.orders || [])
        toast.success('Orders refreshed!', {
          icon: <UIIcon name="refresh" size={18} />
        })
      } else {
        if (res.status >= 500) toast.error('Server error. Please try again.')
      }
    } catch {
      toast.error('Refresh failed.')
    } finally {
      // Add a tiny delay so shimmer is perceptible (optimistic UI)
      setTimeout(() => setRefreshing(false), 400)
    }
  }

  const copyOrderNumber = (orderNumber: string) => {
    navigator.clipboard.writeText(orderNumber)
    toast.success('Order number copied!', {
      icon: <UIIcon name="copy" size={18} />
    })
  }

  /* -------------------------------------- Derived Data --------------------------------------- */

  const orderSummaries: OrderSummary[] = useMemo(
    () => rawOrders.map(toOrderSummary),
    [rawOrders]
  )

  const filteredOrders = useMemo(() => {
    return orderSummaries
      .filter(order => {
        const matchesSearch =
          order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.items.some(i =>
            i.name.toLowerCase().includes(searchQuery.toLowerCase())
          )
        const matchesStatus =
          statusFilter === 'all' || order.status === statusFilter
        return matchesSearch && matchesStatus
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'newest':
            return (
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            )
          case 'oldest':
            return (
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            )
          case 'amount':
            return b.total - a.total
          default:
            return 0
        }
      })
  }, [orderSummaries, searchQuery, statusFilter, sortBy])

  const stats = useMemo(() => {
    const total = orderSummaries.length
    const delivered = orderSummaries.filter(o => o.status === 'delivered').length
    const pending = orderSummaries.filter(o => o.status === 'pending').length
    const totalSpent = orderSummaries.reduce(
      (sum, o) => sum + (o.total || 0),
      0
    )
    return { total, delivered, pending, totalSpent }
  }, [orderSummaries])

  /* -------------------------------------- Render Helpers ------------------------------------- */

  const listContainerRef = useRef<HTMLDivElement | null>(null)

  const orderCardWrapperClass = [
    'relative rounded-2xl border border-border/50 bg-gradient-to-br from-card to-card/80 shadow-sm',
    reducedMotion ? 'transition-shadow' : 'hover:shadow-xl transition-all duration-300',
    reducedMotion ? '' : 'group hover:-translate-y-[2px]'
  ].join(' ')

  const renderOrderCard = (order: OrderSummary) => {
    return (
      <div key={order.id} className={orderCardWrapperClass}>
        <div className="p-4 md:p-5">
          <OrderCard
            order={order}
            onCopyOrderNumberAction={() => copyOrderNumber(order.orderNumber)}
            onDownloadInvoiceAction={() => downloadInvoice(order)}
            onViewDetailsAction={() => router.push(`/orders/${order.id}`)}
            onTrackAction={() => {
              if (order.trackingNumber) {
                toast.info('Opening tracking...', {
                  icon: <UIIcon name="truck" size={18} />
                })
              }
            }}
            onReorderAction={() =>
              toast.success('Reorder started', {
                icon: <UIIcon name="refresh" size={18} />
              })
            }
            className="border-0 shadow-none hover:shadow-none bg-transparent p-0"
          />
          {/* Timeline (outside of OrderCard visual structure to keep card generic) */}
          <OrderTimeline status={order.status} />
        </div>
      </div>
    )
  }

  /* -------------------------------------- Loading Skeleton ----------------------------------- */

  if (isLoading || initialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-primary/5">
        <div className="container mx-auto px-4 py-6 md:py-8">
          <div className="max-w-7xl mx-auto">
            <div className="animate-pulse space-y-10">
              <div className="space-y-4">
                <div className="h-4 w-40 rounded bg-muted" />
                <div className="h-10 w-72 rounded bg-muted" />
                <div className="h-5 w-96 rounded bg-muted" />
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-32 rounded-2xl border border-border/50 bg-card"
                  />
                ))}
              </div>
              <div className="space-y-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-64 rounded-2xl border border-border/50 bg-card"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  /* -------------------------------------- Empty State ---------------------------------------- */

  const showEmpty =
    !refreshing && filteredOrders.length === 0 && orderSummaries.length > 0

  const showNoOrdersEver =
    !refreshing && orderSummaries.length === 0 && filteredOrders.length === 0

  /* -------------------------------------- Main Render ----------------------------------------- */

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-primary/5">
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="max-w-7xl mx-auto relative">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link
              href="/"
              className="hover:text-primary transition-colors font-medium"
            >
              Home
            </Link>
            <span className="text-muted-foreground/60">/</span>
            <span className="text-foreground font-semibold">Orders</span>
          </div>

          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 mb-8">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl" />
                  <div className="relative p-3 bg-gradient-to-br from-primary/10 to-primary/20 rounded-2xl border border-primary/20">
                    <UIIcon name="package" size={32} className="text-primary" />
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
                disabled={refreshing}
                className="border-border/60 hover:border-primary/50"
              >
                <UIIcon
                  name="refresh"
                  size={16}
                  className={refreshing ? 'animate-spin' : ''}
                />
                <span className="ml-2">Refresh</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="hidden md:flex border-border/60 hover:border-primary/50"
                onClick={() =>
                  toast.info('Export not implemented yet', {
                    icon: <UIIcon name="download" size={16} />
                  })
                }
              >
                <UIIcon name="download" size={16} />
                <span className="ml-2">Export Orders</span>
              </Button>
              <Button
                asChild
                size="sm"
                className="shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Link href="/products">
                  <UIIcon name="shopping-bag" size={16} />
                  <span className="ml-2">Continue Shopping</span>
                </Link>
              </Button>
            </div>
          </div>

          {/* Success Banner */}
          {success && (
            <div className="mb-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-green-500/10 blur-3xl" />
              <div className="relative p-6 md:p-8 bg-gradient-to-r from-emerald-50/90 to-green-50/90 border border-emerald-200/60 rounded-2xl shadow-lg backdrop-blur-sm">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-lg" />
                    <div className="relative p-3 bg-gradient-to-br from-emerald-500 to-green-500 rounded-full shadow-lg">
                      <UIIcon name="success" size={24} className="text-white" />
                    </div>
                  </div>
                  <div className="flex-1 space-y-3">
                    <h3 className="font-bold text-emerald-900 text-xl flex items-center gap-2">
                      <UIIcon
                        name="success"
                        size={18}
                        className="text-emerald-600"
                      />
                      Order Placed Successfully
                    </h3>
                    <p className="text-emerald-800 text-base leading-relaxed">
                      Your order has been received and is being processed. You’ll
                      receive real-time updates via SMS and email.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-white/80 hover:bg-white border-emerald-200 text-emerald-700"
                        onClick={() => {
                          if (orderSummaries[0]) {
                            router.push(`/orders/${orderSummaries[0].id}`)
                          }
                        }}
                      >
                        <UIIcon name="eye" size={16} />
                        <span className="ml-2">View Order Details</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-white/80 hover:bg-white border-emerald-200 text-emerald-700"
                        onClick={() => toast.info('Tracking demo only')}
                      >
                        <UIIcon name="truck" size={16} />
                        <span className="ml-2">Track Package</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            <div
              className={[
                'group relative overflow-hidden rounded-2xl p-4 md:p-6 border border-border/50 bg-gradient-to-br from-card to-card/80 shadow-sm',
                reducedMotion ? 'transition-shadow' : 'hover:shadow-xl transition-all duration-300',
                reducedMotion ? '' : 'hover:-translate-y-[2px]'
              ].join(' ')}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-muted-foreground text-sm font-medium">
                    Total Orders
                  </span>
                  <div className="p-2 bg-blue-500/10 rounded-xl">
                    <UIIcon name="package" size={20} className="text-blue-500" />
                  </div>
                </div>
                <div className="text-2xl md:text-3xl font-bold text-foreground mb-1">
                  {stats.total}
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <UIIcon name="trending-up" size={12} />
                  <span>All time</span>
                </div>
              </div>
            </div>

            <div
              className={[
                'group relative overflow-hidden rounded-2xl p-4 md:p-6 border border-border/50 bg-gradient-to-br from-card to-card/80 shadow-sm',
                reducedMotion ? 'transition-shadow' : 'hover:shadow-xl transition-all duration-300',
                reducedMotion ? '' : 'hover:-translate-y-[2px]'
              ].join(' ')}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-muted-foreground text-sm font-medium">
                    Delivered
                  </span>
                  <div className="p-2 bg-emerald-500/10 rounded-xl">
                    <UIIcon
                      name="success"
                      size={20}
                      className="text-emerald-500"
                    />
                  </div>
                </div>
                <div className="text-2xl md:text-3xl font-bold text-foreground mb-1">
                  {stats.delivered}
                </div>
                <div className="flex items-center gap-1 text-xs text-emerald-600">
                  <UIIcon name="shield" size={12} />
                  <span>Successfully</span>
                </div>
              </div>
            </div>

            <div
              className={[
                'group relative overflow-hidden rounded-2xl p-4 md:p-6 border border-border/50 bg-gradient-to-br from-card to-card/80 shadow-sm',
                reducedMotion ? 'transition-shadow' : 'hover:shadow-xl transition-all duration-300',
                reducedMotion ? '' : 'hover:-translate-y-[2px]'
              ].join(' ')}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-muted-foreground text-sm font-medium">
                    Pending
                  </span>
                  <div className="p-2 bg-amber-500/10 rounded-xl">
                    <UIIcon name="clock" size={20} className="text-amber-500" />
                  </div>
                </div>
                <div className="text-2xl md:text-3xl font-bold text-foreground mb-1">
                  {stats.pending}
                </div>
                <div className="flex items-center gap-1 text-xs text-amber-600">
                  <UIIcon name="zap" size={12} />
                  <span>Processing</span>
                </div>
              </div>
            </div>

            <div
              className={[
                'group relative overflow-hidden rounded-2xl p-4 md:p-6 border border-border/50 bg-gradient-to-br from-card to-card/80 shadow-sm',
                reducedMotion ? 'transition-shadow' : 'hover:shadow-xl transition-all duration-300',
                reducedMotion ? '' : 'hover:-translate-y-[2px]'
              ].join(' ')}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-muted-foreground text-sm font-medium">
                    Total Spent
                  </span>
                  <div className="p-2 bg-primary/10 rounded-xl">
                    <UIIcon name="star" size={20} className="text-primary" />
                  </div>
                </div>
                <div className="text-2xl md:text-3xl font-bold text-foreground mb-1">
                  ₵{stats.totalSpent.toFixed(2)}
                </div>
                <div className="flex items-center gap-1 text-xs text-primary">
                  <UIIcon name="trending-up" size={12} />
                  <span>Lifetime value</span>
                </div>
              </div>
            </div>
          </div>

          {/* Filter + Search */}
          <div className="mb-8 p-4 md:p-6 bg-gradient-to-r from-card/80 to-card rounded-2xl border border-border/50 shadow-lg backdrop-blur-sm space-y-4">
            <div className="flex flex-col xl:flex-row gap-4">
              <div className="flex-1">
                <div className="relative group">
                  <UIIcon
                    name="search"
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors"
                  />
                  <input
                    type="text"
                    placeholder="Search orders by number or product name..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 md:py-4 border border-border/60 rounded-xl bg-background/80 focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all placeholder:text-muted-foreground/70 text-sm"
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Combobox
                  label="Status"
                  value={statusFilter}
                  onChange={v => setStatusFilter(v)}
                  options={[
                    { value: 'all', label: 'All Status', icon: 'filter' },
                    { value: 'pending', label: 'Pending', icon: 'clock' },
                    { value: 'confirmed', label: 'Confirmed', icon: 'success' },
                    { value: 'preparing', label: 'Preparing', icon: 'package' },
                    { value: 'shipped', label: 'Shipped', icon: 'truck' },
                    { value: 'delivered', label: 'Delivered', icon: 'success' },
                    { value: 'cancelled', label: 'Cancelled', icon: 'warning' }
                  ]}
                  placeholder="Status"
                  widthClass="min-w-[170px]"
                />
                <Combobox
                  label="Sort By"
                  value={sortBy}
                  onChange={(v: 'newest' | 'oldest' | 'amount') => setSortBy(v)}
                  options={[
                    { value: 'newest', label: 'Newest First', icon: 'sort-desc' },
                    { value: 'oldest', label: 'Oldest First', icon: 'sort-desc' },
                    { value: 'amount', label: 'Highest Amount', icon: 'trending-up' }
                  ]}
                  placeholder="Sort orders"
                  widthClass="min-w-[180px]"
                />
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              Showing {filteredOrders.length} of {orderSummaries.length} orders
            </div>
          </div>

          {/* Empty States */}
          {showNoOrdersEver && (
            <div className="text-center py-16 md:py-24">
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-primary/10 rounded-full blur-3xl w-32 h-32 mx-auto" />
                <div className="relative p-8 bg-gradient-to-br from-muted/20 to-muted/40 rounded-full w-32 h-32 mx-auto flex items-center justify-center border border-border/50">
                  <UIIcon
                    name="package"
                    size={64}
                    className="text-muted-foreground"
                    decorative
                  />
                </div>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                No orders yet
              </h2>
              <p className="text-muted-foreground mb-8 max-w-lg mx-auto text-lg leading-relaxed">
                Your orders will appear here once you place them. Send love to
                your family and friends in Ghana by shopping our amazing products!
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  asChild
                  size="lg"
                  className="shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Link href="/products">
                    <UIIcon name="shopping-bag" size={20} />
                    <span className="ml-2">Start Shopping</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/how-it-works">Learn How It Works</Link>
                </Button>
              </div>
            </div>
          )}

          {showEmpty && (
            <div className="text-center py-20">
              <UIIcon
                name="search"
                size={48}
                className="text-muted-foreground/50 mb-4"
              />
              <h3 className="text-xl font-semibold mb-2">No orders found</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Try adjusting your search criteria or filters to find what
                you are looking for.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('')
                  setStatusFilter('all')
                }}
              >
                Reset Filters
              </Button>
            </div>
          )}

          {/* Order List */}
          {!showEmpty && !showNoOrdersEver && filteredOrders.length > 0 && (
            <div
              ref={listContainerRef}
              className="relative space-y-6"
            >
              {Virtuoso ? (
                <div className="rounded-xl border border-border/40">
                  <Virtuoso
                    style={{
                      height: 'calc(100vh - 320px)',
                      maxHeight: '1400px'
                    }}
                    totalCount={filteredOrders.length}
                    itemContent={(index: number) =>
                      renderOrderCard(filteredOrders[index])
                    }
                    components={{
                      Footer: () => <div className="h-8" />
                    }}
                  />
                </div>
              ) : (
                filteredOrders.map(order => renderOrderCard(order))
              )}

              {/* Optimistic refresh overlay */}
              {refreshing && (
                <div className="pointer-events-none absolute inset-0 rounded-2xl bg-background/60 backdrop-blur-sm flex flex-col gap-4 p-6">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <UIIcon
                      name="refresh"
                      size={16}
                      className="animate-spin text-primary"
                    />
                    Refreshing orders...
                  </div>
                  <div className="grid gap-4">
                    {Array.from({ length: Math.min(3, filteredOrders.length || 3) }).map(
                      (_, i) => (
                        <div
                          key={i}
                          className="h-40 rounded-xl border border-border/40 bg-gradient-to-r from-muted/30 via-muted/10 to-muted/30 animate-pulse"
                        />
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Help Section */}
          <div className="mt-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 blur-3xl" />
            <div className="relative p-6 md:p-8 bg-gradient-to-r from-primary/5 to-secondary/10 border border-primary/20 rounded-2xl backdrop-blur-sm">
              <div className="text-center max-w-3xl mx-auto">
                <div className="flex items-center justify-center mb-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg" />
                    <div className="relative p-4 bg-gradient-to-br from-primary/10 to-primary/20 rounded-full border border-primary/30">
                      <UIIcon name="message" size={32} className="text-primary" />
                    </div>
                  </div>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                  Need Help with Your Order?
                </h3>
                <p className="text-muted-foreground mb-8 text-base md:text-lg leading-relaxed">
                  Our dedicated customer support team is here to assist you with
                  any questions about your orders, shipping, or returns. We’re
                  available 24/7 to help!
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    variant="outline"
                    className="bg-white/80 hover:bg-white shadow-sm hover:shadow-lg transition-all duration-200 border-primary/20 p-4 h-auto"
                    onClick={() => toast.info('Chat coming soon')}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <UIIcon name="message" size={20} className="text-primary" />
                      <span className="font-medium">Live Chat</span>
                      <span className="text-xs text-muted-foreground">
                        Available 24/7
                      </span>
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-white/80 hover:bg-white shadow-sm hover:shadow-lg transition-all duration-200 border-primary/20 p-4 h-auto"
                    onClick={() =>
                      toast.info('Dial +233 20 123 4567', {
                        icon: <UIIcon name="phone" size={16} />
                      })
                    }
                  >
                    <div className="flex flex-col items-center gap-2">
                      <UIIcon name="phone" size={20} className="text-primary" />
                      <span className="font-medium">Call Us</span>
                      <span className="text-xs text-muted-foreground">
                        +233 20 123 4567
                      </span>
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-white/80 hover:bg-white shadow-sm hover:shadow-lg transition-all duration-200 border-primary/20 p-4 h-auto"
                    onClick={() =>
                      toast.info('Tracking info soon', {
                        icon: <UIIcon name="truck" size={16} />
                      })
                    }
                  >
                    <div className="flex flex-col items-center gap-2">
                      <UIIcon name="truck" size={20} className="text-primary" />
                      <span className="font-medium">Shipping Info</span>
                      <span className="text-xs text-muted-foreground">
                        Track & FAQs
                      </span>
                    </div>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <footer className="mt-16 pb-10 text-center text-xs text-muted-foreground">
            <span>
              Orders interface refactored with unified icons, accessible filters,
              timeline, invoice stub, virtualization & optimistic refresh.
            </span>
          </footer>
        </div>
      </div>
    </div>
  )
}
