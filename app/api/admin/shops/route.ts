import { NextRequest, NextResponse } from 'next/server'
import { isAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/admin/shops — List shops with pagination, search, verification filter
export async function GET(req: NextRequest) {
    try {
        const admin = await isAdmin()
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        const { searchParams } = new URL(req.url)
        const page = Math.max(1, Number(searchParams.get('page')) || 1)
        const limit = Math.min(50, Math.max(1, Number(searchParams.get('limit')) || 20))
        const search = searchParams.get('search')?.trim() || ''
        const filter = searchParams.get('filter')?.trim() || ''

        const where: any = { isActive: true }

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { slug: { contains: search, mode: 'insensitive' } },
                { owner: { name: { contains: search, mode: 'insensitive' } } },
            ]
        }

        if (filter === 'pending') where.isVerified = false
        else if (filter === 'verified') where.isVerified = true

        const [shops, total] = await Promise.all([
            prisma.shop.findMany({
                where,
                include: {
                    owner: { select: { id: true, name: true, email: true } },
                    _count: { select: { products: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.shop.count({ where }),
        ])

        return NextResponse.json({
            success: true,
            data: {
                shops,
                pagination: { page, total, totalPages: Math.ceil(total / limit) },
            },
        })
    } catch (error) {
        console.error('Admin shops list error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// PATCH /api/admin/shops — Verify or update shop
export async function PATCH(req: NextRequest) {
    try {
        const admin = await isAdmin()
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        const body = await req.json()
        const { shopId, isVerified, isActive } = body

        if (!shopId) {
            return NextResponse.json({ error: 'shopId is required' }, { status: 400 })
        }

        const updateData: any = {}
        if (typeof isVerified === 'boolean') updateData.isVerified = isVerified
        if (typeof isActive === 'boolean') updateData.isActive = isActive

        const shop = await prisma.shop.update({
            where: { id: shopId },
            data: updateData,
            select: { id: true, name: true, isVerified: true, isActive: true },
        })

        return NextResponse.json({ success: true, data: shop })
    } catch (error) {
        console.error('Admin update shop error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
