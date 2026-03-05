'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRequireAdmin } from '@/lib/auth-utils'
import { SearchBar } from '@/components/ui/SearchBar'
import { UIIcon } from '@/components/ui/icon'
import DataEmptyState from '@/components/ui/DataEmptyState'
import {
    DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

interface AdminOrder {
    id: string
    status: string
    total: number
    createdAt: string
    user: { id: string; name: string | null; email: string | null }
    items: { product: { name: string; images: string[] } }[]
    _count: { items: number }
}

const STATUSES = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'RETURNED']

const statusColor = (s: string) => {
    const map: Record<string, string> = {
        PENDING: 'bg-amber-500/10 text-amber-600',
        CONFIRMED: 'bg-sky-500/10 text-sky-600',
        PROCESSING: 'bg-blue-500/10 text-blue-600',
        SHIPPED: 'bg-violet-500/10 text-violet-600',
        OUT_FOR_DELIVERY: 'bg-indigo-500/10 text-indigo-600',
        DELIVERED: 'bg-emerald-500/10 text-emerald-600',
        CANCELLED: 'bg-destructive/10 text-destructive',
        RETURNED: 'bg-orange-500/10 text-orange-600',
    }
    return map[s] || 'bg-muted text-muted-foreground'
}

export default function AdminOrdersPage() {
    const { isLoading: authLoading, isAdmin } = useRequireAdmin()
    const [orders, setOrders] = useState<AdminOrder[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('')
    const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 })

    const fetchOrders = useCallback(async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            if (search) params.set('search', search)
            if (statusFilter) params.set('status', statusFilter)
            params.set('page', String(pagination.page))

            const res = await fetch(`/api/admin/orders?${params}`)
            const data = await res.json()
            if (data.success) {
                setOrders(data.data.orders)
                setPagination(data.data.pagination)
            }
        } catch { toast.error('Failed to load orders') }
        finally { setLoading(false) }
    }, [search, statusFilter, pagination.page])

    useEffect(() => {
        if (isAdmin) fetchOrders()
    }, [isAdmin, fetchOrders])

    const updateStatus = async (orderId: string, status: string) => {
        try {
            const res = await fetch('/api/admin/orders', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId, status }),
            })
            if (res.ok) {
                toast.success(`Order status updated to ${status}`)
                fetchOrders()
            } else { toast.error('Failed to update') }
        } catch { toast.error('Network error') }
    }

    if (authLoading) {
        return (
            <div className="flex items-center justify-center py-32">
                <UIIcon name="loading" className="w-8 h-8 text-primary animate-spin" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
                <p className="text-sm text-muted-foreground mt-1">{pagination.total} total orders</p>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                    <SearchBar
                        placeholder="Search by order ID or customer..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        onSearch={setSearch}
                        variant="default"
                        size="sm"
                        clearButton
                    />
                </div>
                <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
                    {['', ...STATUSES].map(s => (
                        <button
                            key={s || 'all'}
                            onClick={() => { setStatusFilter(s); setPagination(p => ({ ...p, page: 1 })) }}
                            className={cn(
                                'px-2.5 py-1 rounded-full text-[10px] font-medium transition-colors border whitespace-nowrap',
                                statusFilter === s
                                    ? 'bg-primary text-white border-primary'
                                    : 'bg-card text-muted-foreground border-border hover:border-primary/40'
                            )}
                        >
                            {s || 'All'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Orders List */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <UIIcon name="loading" className="w-6 h-6 text-primary animate-spin" />
                </div>
            ) : orders.length === 0 ? (
                <DataEmptyState
                    title="No orders found"
                    description="Try adjusting your search or filters"
                    icon={{ name: 'shopping-bag', tone: 'muted' }}
                    variant="card"
                    size="md"
                />
            ) : (
                <div className="grid gap-2">
                    {orders.map(order => (
                        <div
                            key={order.id}
                            className="flex items-center gap-4 p-4 rounded-xl border border-border/40 bg-card hover:shadow-sm transition-shadow"
                        >
                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                    <span className="text-xs font-mono text-muted-foreground">#{order.id.slice(0, 8)}</span>
                                    <span className={cn('px-1.5 py-0.5 text-[10px] rounded-md font-medium', statusColor(order.status))}>
                                        {order.status}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                    <span className="font-medium text-foreground">₵{order.total.toFixed(2)}</span>
                                    <span>{order.user?.name || order.user?.email || 'Unknown'}</span>
                                    <span>{order._count.items} item{order._count.items > 1 ? 's' : ''}</span>
                                    <span className="hidden sm:inline">
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>

                            {/* Status Dropdown */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" aria-label="Update order status">
                                        <UIIcon name="chevron-down" className="w-4 h-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    {STATUSES.map(s => (
                                        <DropdownMenuItem
                                            key={s}
                                            onClick={() => updateStatus(order.id, s)}
                                            className={cn('text-xs', order.status === s && 'font-semibold text-primary')}
                                        >
                                            {s}
                                            {order.status === s && <UIIcon name="success" className="w-3 h-3 ml-auto text-primary" />}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4">
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
                        <button
                            key={p}
                            onClick={() => setPagination(prev => ({ ...prev, page: p }))}
                            className={cn(
                                'w-8 h-8 rounded-lg text-xs font-medium transition',
                                p === pagination.page ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted'
                            )}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
