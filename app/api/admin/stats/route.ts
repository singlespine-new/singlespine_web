import { NextResponse } from 'next/server'
import { getCurrentUser, isAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        const admin = await isAdmin()
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        const [
            totalUsers,
            totalShops,
            totalOrders,
            totalProducts,
            pendingShops,
        ] = await Promise.all([
            prisma.user.count(),
            prisma.shop.count(),
            prisma.order.count(),
            prisma.product.count({ where: { isActive: true } }),
            prisma.shop.count({ where: { isVerified: false } }),
        ])

        // Calculate total revenue from completed orders
        const revenueResult = await prisma.order.aggregate({
            _sum: { total: true },
            where: { status: { in: ['DELIVERED'] } },
        })

        return NextResponse.json({
            success: true,
            data: {
                totalUsers,
                totalShops,
                totalOrders,
                totalProducts,
                pendingShops,
                totalRevenue: revenueResult._sum.total || 0,
            },
        })
    } catch (error) {
        console.error('Admin stats error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
