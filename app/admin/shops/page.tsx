'use client'

import React, { useState, useEffect, useCallback, Suspense } from 'react'
import { useRequireAdmin } from '@/lib/auth-utils'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { SearchBar } from '@/components/ui/SearchBar'
import { UIIcon } from '@/components/ui/icon'
import DataEmptyState from '@/components/ui/DataEmptyState'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

interface AdminShop {
    id: string
    name: string
    slug: string
    description: string | null
    category: string | null
    city: string | null
    region: string | null
    phone: string | null
    isVerified: boolean
    isActive: boolean
    createdAt: string
    owner: { id: string; name: string | null; email: string | null }
    _count: { products: number }
}

function AdminShopsContent() {
    const { isLoading: authLoading, isAdmin } = useRequireAdmin()
    const searchParams = useSearchParams()
    const [shops, setShops] = useState<AdminShop[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [filter, setFilter] = useState(searchParams.get('filter') || '')
    const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 })

    const fetchShops = useCallback(async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            if (search) params.set('search', search)
            if (filter) params.set('filter', filter)
            params.set('page', String(pagination.page))

            const res = await fetch(`/api/admin/shops?${params}`)
            const data = await res.json()
            if (data.success) {
                setShops(data.data.shops)
                setPagination(data.data.pagination)
            }
        } catch { toast.error('Failed to load shops') }
        finally { setLoading(false) }
    }, [search, filter, pagination.page])

    useEffect(() => {
        if (isAdmin) fetchShops()
    }, [isAdmin, fetchShops])

    const toggleVerification = async (shopId: string, isVerified: boolean) => {
        try {
            const res = await fetch('/api/admin/shops', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ shopId, isVerified }),
            })
            if (res.ok) {
                toast.success(isVerified ? 'Shop verified!' : 'Shop unverified')
                fetchShops()
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

    const filterTabs = [
        { value: '', label: 'All' },
        { value: 'pending', label: 'Pending' },
        { value: 'verified', label: 'Verified' },
    ]

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Shops</h1>
                <p className="text-sm text-muted-foreground mt-1">{pagination.total} registered shops</p>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                    <SearchBar
                        placeholder="Search shops or owners..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        onSearch={setSearch}
                        variant="default"
                        size="sm"
                        clearButton
                    />
                </div>
                <div className="flex gap-2">
                    {filterTabs.map(tab => (
                        <button
                            key={tab.value}
                            onClick={() => { setFilter(tab.value); setPagination(p => ({ ...p, page: 1 })) }}
                            className={cn(
                                'px-3 py-1.5 rounded-full text-xs font-medium transition-colors border',
                                filter === tab.value
                                    ? 'bg-primary text-white border-primary'
                                    : 'bg-card text-muted-foreground border-border hover:border-primary/40'
                            )}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Shop List */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <UIIcon name="loading" className="w-6 h-6 text-primary animate-spin" />
                </div>
            ) : shops.length === 0 ? (
                <DataEmptyState
                    title="No shops found"
                    description="Try adjusting your search or filters"
                    icon={{ name: 'building', tone: 'muted' }}
                    variant="card"
                    size="md"
                />
            ) : (
                <div className="grid gap-3">
                    {shops.map(shop => (
                        <div
                            key={shop.id}
                            className="flex items-center gap-4 p-4 rounded-xl border border-border/40 bg-card hover:shadow-sm transition-shadow"
                        >
                            {/* Icon */}
                            <div className={cn(
                                'w-10 h-10 rounded-lg flex items-center justify-center shrink-0',
                                shop.isVerified ? 'bg-emerald-500/10' : 'bg-amber-500/10'
                            )}>
                                <UIIcon
                                    name={shop.isVerified ? 'success' : 'warning'}
                                    className={cn('w-5 h-5', shop.isVerified ? 'text-emerald-500' : 'text-amber-500')}
                                />
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                    <span className="text-sm font-semibold truncate">{shop.name}</span>
                                    {shop.isVerified ? (
                                        <span className="px-1.5 py-0.5 text-[10px] bg-emerald-500/10 text-emerald-600 rounded-md font-medium">Verified</span>
                                    ) : (
                                        <span className="px-1.5 py-0.5 text-[10px] bg-amber-500/10 text-amber-600 rounded-md font-medium">Pending</span>
                                    )}
                                </div>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                    <span>{shop.owner?.name || shop.owner?.email || 'Unknown'}</span>
                                    <span>{shop._count.products} products</span>
                                    {shop.category && <span className="hidden sm:inline">{shop.category}</span>}
                                    {shop.city && <span className="hidden md:inline">{shop.city}, {shop.region}</span>}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1.5 shrink-0">
                                <Button
                                    variant={shop.isVerified ? 'outline' : 'default'}
                                    size="sm"
                                    className="rounded-lg text-xs"
                                    onClick={() => toggleVerification(shop.id, !shop.isVerified)}
                                >
                                    <UIIcon name={shop.isVerified ? 'close' : 'success'} className="w-3.5 h-3.5 mr-1" />
                                    {shop.isVerified ? 'Unverify' : 'Verify'}
                                </Button>
                            </div>
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

export default function AdminShopsPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center py-32">
                <UIIcon name="loading" className="w-8 h-8 text-primary animate-spin" />
            </div>
        }>
            <AdminShopsContent />
        </Suspense>
    )
}
