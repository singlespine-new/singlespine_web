import { NextRequest, NextResponse } from 'next/server'
import { isAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/admin/users — List users with pagination, search, role filter
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
        const role = searchParams.get('role')?.trim() || ''

        const where: any = {}

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { phoneNumber: { contains: search } },
            ]
        }

        if (role && ['USER', 'VENDOR', 'ADMIN'].includes(role)) {
            where.role = role
        }

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phoneNumber: true,
                    role: true,
                    image: true,
                    createdAt: true,
                    _count: { select: { orders: true, shops: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.user.count({ where }),
        ])

        return NextResponse.json({
            success: true,
            data: {
                users,
                pagination: { page, total, totalPages: Math.ceil(total / limit) },
            },
        })
    } catch (error) {
        console.error('Admin users list error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// PATCH /api/admin/users — Update user role
export async function PATCH(req: NextRequest) {
    try {
        const admin = await isAdmin()
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        const body = await req.json()
        const { userId, role } = body

        if (!userId || !role) {
            return NextResponse.json({ error: 'userId and role are required' }, { status: 400 })
        }

        if (!['USER', 'VENDOR', 'ADMIN'].includes(role)) {
            return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
        }

        const user = await prisma.user.update({
            where: { id: userId },
            data: { role },
            select: { id: true, name: true, email: true, role: true },
        })

        return NextResponse.json({ success: true, data: user })
    } catch (error) {
        console.error('Admin update user error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
