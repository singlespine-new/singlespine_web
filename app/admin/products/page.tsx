'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { useRequireAdmin } from '@/lib/auth-utils'
import { SearchBar } from '@/components/ui/SearchBar'
import { UIIcon } from '@/components/ui/icon'
import DataEmptyState from '@/components/ui/DataEmptyState'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

interface AdminProduct {
    id: string
    name: string
    slug: string
    price: number
    images: string[]
    category: string
    stock: number
    isActive: boolean
    isFeatured: boolean
    createdAt: string
    shop: { id: string; name: string; slug: string } | null
    _count: { orderItems: number }
}

const FILTER_TABS = [
    { value: '', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'featured', label: 'Featured' },
]

export default function AdminProductsPage() {
    const { isLoading: authLoading, isAdmin } = useRequireAdmin()
    const [products, setProducts] = useState<AdminProduct[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [filter, setFilter] = useState('')
    const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 })

    const fetchProducts = useCallback(async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            if (search) params.set('search', search)
            if (filter) params.set('filter', filter)
            params.set('page', String(pagination.page))

            const res = await fetch(`/api/admin/products?${params}`)
            const data = await res.json()
            if (data.success) {
                setProducts(data.data.products)
                setPagination(data.data.pagination)
            }
        } catch { toast.error('Failed to load products') }
        finally { setLoading(false) }
    }, [search, filter, pagination.page])

    useEffect(() => {
        if (isAdmin) fetchProducts()
    }, [isAdmin, fetchProducts])

    const toggleField = async (productId: string, field: 'isActive' | 'isFeatured', value: boolean) => {
        try {
            const res = await fetch('/api/admin/products', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId, [field]: value }),
            })
            if (res.ok) {
                toast.success(field === 'isFeatured'
                    ? (value ? 'Marked as featured' : 'Removed from featured')
                    : (value ? 'Product activated' : 'Product deactivated')
                )
                fetchProducts()
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
                <h1 className="text-2xl font-bold tracking-tight">Products</h1>
                <p className="text-sm text-muted-foreground mt-1">{pagination.total} products across all shops</p>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                    <SearchBar
                        placeholder="Search products..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        onSearch={setSearch}
                        variant="default"
                        size="sm"
                        clearButton
                    />
                </div>
                <div className="flex gap-2">
                    {FILTER_TABS.map(tab => (
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

            {/* Products List */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <UIIcon name="loading" className="w-6 h-6 text-primary animate-spin" />
                </div>
            ) : products.length === 0 ? (
                <DataEmptyState
                    title="No products found"
                    description="Try adjusting your search or filters"
                    icon={{ name: 'package', tone: 'muted' }}
                    variant="card"
                    size="md"
                />
            ) : (
                <div className="grid gap-2">
                    {products.map(product => (
                        <div
                            key={product.id}
                            className="flex items-center gap-4 p-4 rounded-xl border border-border/40 bg-card hover:shadow-sm transition-shadow"
                        >
                            {/* Image */}
                            <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden shrink-0">
                                {product.images[0] ? (
                                    <Image
                                        src={product.images[0]}
                                        alt={product.name}
                                        width={48}
                                        height={48}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <UIIcon name="package-alt" className="w-5 h-5 text-muted-foreground" />
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                    <span className="text-sm font-semibold truncate">{product.name}</span>
                                    {product.isFeatured && (
                                        <span className="px-1.5 py-0.5 text-[10px] bg-primary/10 text-primary rounded-md font-medium">Featured</span>
                                    )}
                                    {!product.isActive && (
                                        <span className="px-1.5 py-0.5 text-[10px] bg-destructive/10 text-destructive rounded-md font-medium">Inactive</span>
                                    )}
                                </div>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                    <span className="font-medium text-foreground">₵{product.price.toFixed(2)}</span>
                                    <span>{product.stock} stock</span>
                                    <span>{product._count.orderItems} sold</span>
                                    {product.shop && <span className="hidden sm:inline">{product.shop.name}</span>}
                                    <span className="hidden md:inline">{product.category}</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1 shrink-0">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => toggleField(product.id, 'isFeatured', !product.isFeatured)}
                                    aria-label={product.isFeatured ? 'Remove from featured' : 'Add to featured'}
                                    className={product.isFeatured ? 'text-primary' : ''}
                                >
                                    <UIIcon name="star" className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => toggleField(product.id, 'isActive', !product.isActive)}
                                    aria-label={product.isActive ? 'Deactivate product' : 'Activate product'}
                                    className={!product.isActive ? 'text-destructive' : ''}
                                >
                                    <UIIcon name={product.isActive ? 'close' : 'success'} className="w-4 h-4" />
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
