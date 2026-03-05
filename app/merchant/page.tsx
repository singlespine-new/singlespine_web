'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRequireMerchant } from '@/lib/auth-utils'
import { UIIcon, IconName } from '@/components/ui/icon'
import DataEmptyState from '@/components/ui/DataEmptyState'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface ShopData {
    id: string
    name: string
    slug: string
    isVerified: boolean
    rating: number
    totalSales: number
    _count?: { products: number }
}

interface DashboardStats {
    totalProducts: number
    totalOrders: number
    revenue: number
    lowStockCount: number
}

export default function MerchantDashboardPage() {
    const { isLoading: authLoading, isMerchant } = useRequireMerchant()
    const [shop, setShop] = useState<ShopData | null>(null)
    const [stats, setStats] = useState<DashboardStats>({
        totalProducts: 0, totalOrders: 0, revenue: 0, lowStockCount: 0,
    })
    const [loading, setLoading] = useState(true)

    const fetchDashboard = useCallback(async () => {
        try {
            const res = await fetch('/api/merchant/shop')
            if (!res.ok) return
            const data = await res.json()
            if (data.success) {
                setShop(data.data)
                setStats({
                    totalProducts: data.data._count?.products || 0,
                    totalOrders: data.data.totalSales || 0,
                    revenue: 0,
                    lowStockCount: 0,
                })
            }
        } catch { /* silently fail */ }
        finally { setLoading(false) }
    }, [])

    useEffect(() => {
        if (isMerchant) fetchDashboard()
    }, [isMerchant, fetchDashboard])

    if (authLoading || loading) {
        return (
            <div className="flex items-center justify-center py-32">
                <UIIcon name="loading" className="w-8 h-8 text-primary animate-spin" />
            </div>
        )
    }

    if (!shop) {
        return (
            <DataEmptyState
                title="No shop found"
                description="Create your shop to get started"
                icon={{ name: 'building', tone: 'primary' }}
                primaryAction={{ label: 'Create Shop', onClick: () => window.location.href = '/merchant/register' }}
                variant="card"
                size="md"
            />
        )
    }

    const statCards: { label: string; value: string | number; icon: IconName; color: string; bg: string; href?: string }[] = [
        { label: 'Products', value: stats.totalProducts, icon: 'package', color: 'text-blue-500', bg: 'bg-blue-500/10', href: '/merchant/products' },
        { label: 'Total Orders', value: stats.totalOrders, icon: 'shopping-bag', color: 'text-emerald-500', bg: 'bg-emerald-500/10', href: '/merchant/orders' },
        { label: 'Revenue', value: `₵${stats.revenue.toFixed(2)}`, icon: 'star', color: 'text-primary', bg: 'bg-primary/10' },
        { label: 'Low Stock', value: stats.lowStockCount, icon: 'warning', color: 'text-amber-500', bg: 'bg-amber-500/10', href: '/merchant/products?filter=low-stock' },
    ]

    const quickActions: { label: string; desc: string; href: string; icon: IconName }[] = [
        { label: 'Add New Product', desc: 'Upload a product to your store', href: '/merchant/products?action=new', icon: 'plus' },
        { label: 'View Orders', desc: 'Check incoming customer orders', href: '/merchant/orders', icon: 'shopping-bag' },
        { label: 'Shop Settings', desc: 'Update your shop profile', href: '/merchant/settings', icon: 'building' },
        { label: 'Performance', desc: 'View sales & analytics', href: '/merchant', icon: 'trending-up' },
    ]

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{shop.name}</h1>
                    <p className="text-muted-foreground text-sm mt-1">Welcome to your merchant dashboard</p>
                </div>
                <Button asChild size="lg" className="rounded-xl">
                    <Link href="/merchant/products?action=new">
                        <UIIcon name="plus" className="w-4 h-4 mr-1.5" /> Add Product
                    </Link>
                </Button>
            </div>

            {/* Verification Banner */}
            {!shop.isVerified && (
                <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-50/50 dark:bg-amber-500/5 flex items-start gap-3">
                    <UIIcon name="warning" className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-amber-800 dark:text-amber-200">Shop Verification Pending</p>
                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                            Your shop is under review. Products will be visible once verified.
                        </p>
                    </div>
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map(card => {
                    const content = (
                        <div className="rounded-xl p-4 md:p-5 border border-border/40 bg-card transition-shadow hover:shadow-md">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-muted-foreground text-xs font-medium">{card.label}</span>
                                <div className={cn('p-2 rounded-lg', card.bg)}>
                                    <UIIcon name={card.icon} className={cn('w-4 h-4', card.color)} />
                                </div>
                            </div>
                            <div className="text-xl md:text-2xl font-bold text-foreground">{card.value}</div>
                        </div>
                    )
                    return card.href
                        ? <Link key={card.label} href={card.href}>{content}</Link>
                        : <div key={card.label}>{content}</div>
                })}
            </div>

            {/* Quick Actions */}
            <div>
                <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {quickActions.map(action => (
                        <Link
                            key={action.label}
                            href={action.href}
                            className="group flex items-center gap-4 p-4 rounded-xl border border-border/40 bg-card hover:shadow-md transition-shadow"
                        >
                            <div className="p-2.5 bg-primary/10 rounded-lg">
                                <UIIcon name={action.icon} className="w-4 h-4 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium">{action.label}</p>
                                <p className="text-xs text-muted-foreground">{action.desc}</p>
                            </div>
                            <UIIcon name="chevron-right" className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}
