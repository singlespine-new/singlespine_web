'use client'

import React, { useEffect, useCallback, useState } from 'react'
import { useRequireMerchant } from '@/lib/auth-utils'
import { UIIcon } from '@/components/ui/icon'
import DataEmptyState from '@/components/ui/DataEmptyState'
import { useRouter } from 'next/navigation'

export default function MerchantOrdersPage() {
    const { isLoading: authLoading, isMerchant } = useRequireMerchant()
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    const fetchOrders = useCallback(async () => {
        // Orders API will be connected once products are being sold
        setLoading(false)
    }, [])

    useEffect(() => {
        if (isMerchant) fetchOrders()
    }, [isMerchant, fetchOrders])

    if (authLoading || loading) {
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
                <p className="text-sm text-muted-foreground mt-1">
                    Track and manage customer orders for your products
                </p>
            </div>

            <DataEmptyState
                title="No orders yet"
                description="When customers order your products, their orders will appear here. Start by adding products to your shop."
                icon={{ name: 'shopping-bag', tone: 'muted' }}
                primaryAction={{
                    label: 'Add Products',
                    onClick: () => router.push('/merchant/products?action=new'),
                    iconName: 'package',
                }}
                variant="card"
                size="md"
            />
        </div>
    )
}
