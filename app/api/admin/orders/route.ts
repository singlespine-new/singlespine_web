import { NextRequest, NextResponse } from 'next/server'
import { isAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/admin/orders — List all orders with pagination, search, status filter
export async function GET(req: NextRequest) {
    try {
        const admin = await isAdmin()
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        const { searchParams } = new URL(req.url)
        const page = Math.max(1, Number(searchParams.get('page')) || 1)
        const limit = Math.min(50, Math.max(1, Number(searchParams.get('limit')) || 20))
        const status = searchParams.get('status')?.trim() || ''
        const search = searchParams.get('search')?.trim() || ''

        const where: any = {}

        if (status) where.status = status

        if (search) {
            where.OR = [
                { id: { contains: search, mode: 'insensitive' } },
                { user: { name: { contains: search, mode: 'insensitive' } } },
                { user: { email: { contains: search, mode: 'insensitive' } } },
            ]
        }

        const [orders, total] = await Promise.all([
            prisma.order.findMany({
                where,
                include: {
                    user: { select: { id: true, name: true, email: true } },
                    items: {
                        take: 3,
                        include: { product: { select: { name: true, images: true } } },
                    },
                    _count: { select: { items: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.order.count({ where }),
        ])

        return NextResponse.json({
            success: true,
            data: {
                orders,
                pagination: { page, total, totalPages: Math.ceil(total / limit) },
            },
        })
    } catch (error) {
        console.error('Admin orders list error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// PATCH /api/admin/orders — Update order status
export async function PATCH(req: NextRequest) {
    try {
        const admin = await isAdmin()
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        const body = await req.json()
        const { orderId, status } = body

        if (!orderId || !status) {
            return NextResponse.json({ error: 'orderId and status are required' }, { status: 400 })
        }

        const validStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'RETURNED']
        if (!validStatuses.includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
        }

        const order = await prisma.order.update({
            where: { id: orderId },
            data: { status },
            select: { id: true, status: true },
        })

        return NextResponse.json({ success: true, data: order })
    } catch (error) {
        console.error('Admin update order error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
