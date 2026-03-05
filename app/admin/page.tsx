'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRequireAdmin } from '@/lib/auth-utils'
import { UIIcon, IconName } from '@/components/ui/icon'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface AdminStats {
    totalUsers: number
    totalShops: number
    totalOrders: number
    totalProducts: number
    pendingShops: number
    totalRevenue: number
}

export default function AdminDashboardPage() {
    const { isLoading: authLoading, isAdmin } = useRequireAdmin()
    const [stats, setStats] = useState<AdminStats>({
        totalUsers: 0, totalShops: 0, totalOrders: 0,
        totalProducts: 0, pendingShops: 0, totalRevenue: 0,
    })
    const [loading, setLoading] = useState(true)

    const fetchStats = useCallback(async () => {
        try {
            const res = await fetch('/api/admin/stats')
            if (res.ok) {
                const data = await res.json()
                if (data.success) setStats(data.data)
            }
        } catch { /* silently fail */ }
        finally { setLoading(false) }
    }, [])

    useEffect(() => {
        if (isAdmin) fetchStats()
    }, [isAdmin, fetchStats])

    if (authLoading || loading) {
        return (
            <div className="flex items-center justify-center py-32">
                <UIIcon name="loading" className="w-8 h-8 text-primary animate-spin" />
            </div>
        )
    }

    const statCards: { label: string; value: string | number; icon: IconName; color: string; bg: string; href: string }[] = [
        { label: 'Total Users', value: stats.totalUsers, icon: 'user', color: 'text-blue-500', bg: 'bg-blue-500/10', href: '/admin/users' },
        { label: 'Shops', value: stats.totalShops, icon: 'building', color: 'text-emerald-500', bg: 'bg-emerald-500/10', href: '/admin/shops' },
        { label: 'Orders', value: stats.totalOrders, icon: 'shopping-bag', color: 'text-violet-500', bg: 'bg-violet-500/10', href: '/admin/orders' },
        { label: 'Products', value: stats.totalProducts, icon: 'package', color: 'text-primary', bg: 'bg-primary/10', href: '/admin/products' },
        { label: 'Revenue', value: `₵${stats.totalRevenue.toFixed(2)}`, icon: 'trending-up', color: 'text-emerald-500', bg: 'bg-emerald-500/10', href: '/admin/orders' },
        { label: 'Pending Shops', value: stats.pendingShops, icon: 'warning', color: 'text-amber-500', bg: 'bg-amber-500/10', href: '/admin/shops?filter=pending' },
    ]

    const quickActions: { label: string; desc: string; href: string; icon: IconName }[] = [
        { label: 'Manage Users', desc: 'View, edit roles, disable accounts', href: '/admin/users', icon: 'user' },
        { label: 'Review Shops', desc: 'Verify pending vendor applications', href: '/admin/shops', icon: 'building' },
        { label: 'View Orders', desc: 'Monitor all platform orders', href: '/admin/orders', icon: 'shopping-bag' },
        { label: 'Moderate Products', desc: 'Flag, feature, or remove products', href: '/admin/products', icon: 'package' },
    ]

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Admin Dashboard</h1>
                <p className="text-muted-foreground text-sm mt-1">Platform overview and management</p>
            </div>

            {/* Pending Shops Banner */}
            {stats.pendingShops > 0 && (
                <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-50/50 dark:bg-amber-500/5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <UIIcon name="warning" className="w-5 h-5 text-amber-500 shrink-0" />
                        <div>
                            <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                                {stats.pendingShops} shop{stats.pendingShops > 1 ? 's' : ''} pending verification
                            </p>
                            <p className="text-xs text-amber-600 dark:text-amber-400">
                                Review and approve new vendor applications
                            </p>
                        </div>
                    </div>
                    <Button asChild variant="outline" size="sm" className="rounded-lg shrink-0">
                        <Link href="/admin/shops?filter=pending">Review</Link>
                    </Button>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {statCards.map(card => (
                    <Link key={card.label} href={card.href}>
                        <div className="rounded-xl p-4 md:p-5 border border-border/40 bg-card transition-shadow hover:shadow-md">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-muted-foreground text-xs font-medium">{card.label}</span>
                                <div className={cn('p-2 rounded-lg', card.bg)}>
                                    <UIIcon name={card.icon} className={cn('w-4 h-4', card.color)} />
                                </div>
                            </div>
                            <div className="text-xl md:text-2xl font-bold text-foreground">{card.value}</div>
                        </div>
                    </Link>
                ))}
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
