import { NextRequest, NextResponse } from 'next/server'
import { isAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/admin/products — List all products with pagination, search, filter
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
        const category = searchParams.get('category')?.trim() || ''
        const filter = searchParams.get('filter')?.trim() || ''

        const where: any = {}

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { vendor: { contains: search, mode: 'insensitive' } },
            ]
        }

        if (category) where.category = category
        if (filter === 'featured') where.isFeatured = true
        if (filter === 'inactive') where.isActive = false
        if (filter === 'active') where.isActive = true

        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                include: {
                    shop: { select: { id: true, name: true, slug: true } },
                    _count: { select: { orderItems: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.product.count({ where }),
        ])

        return NextResponse.json({
            success: true,
            data: {
                products,
                pagination: { page, total, totalPages: Math.ceil(total / limit) },
            },
        })
    } catch (error) {
        console.error('Admin products list error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// PATCH /api/admin/products — Toggle product active/featured status
export async function PATCH(req: NextRequest) {
    try {
        const admin = await isAdmin()
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        const body = await req.json()
        const { productId, isActive, isFeatured } = body

        if (!productId) {
            return NextResponse.json({ error: 'productId is required' }, { status: 400 })
        }

        const updateData: any = {}
        if (typeof isActive === 'boolean') updateData.isActive = isActive
        if (typeof isFeatured === 'boolean') updateData.isFeatured = isFeatured

        const product = await prisma.product.update({
            where: { id: productId },
            data: updateData,
            select: { id: true, name: true, isActive: true, isFeatured: true },
        })

        return NextResponse.json({ success: true, data: product })
    } catch (error) {
        console.error('Admin update product error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
