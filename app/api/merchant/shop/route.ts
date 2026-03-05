import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/merchant/shop — Create a new shop + upgrade user role to VENDOR
export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser()
        if (!user?.id) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Check if user already has a shop
        const existingShop = await prisma.shop.findFirst({
            where: { ownerId: user.id }
        })
        if (existingShop) {
            return NextResponse.json(
                { success: false, error: 'You already have a shop', data: existingShop },
                { status: 409 }
            )
        }

        const body = await request.json()
        const { name, description, phone, email, city, region, category } = body

        if (!name?.trim()) {
            return NextResponse.json(
                { success: false, error: 'Shop name is required' },
                { status: 400 }
            )
        }

        // Generate slug from name
        const baseSlug = name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '')

        // Check slug uniqueness
        let slug = baseSlug
        let suffix = 1
        while (await prisma.shop.findUnique({ where: { slug } })) {
            slug = `${baseSlug}-${suffix}`
            suffix++
        }

        // Create shop + upgrade user role in a transaction
        const shop = await prisma.$transaction(async (tx) => {
            const newShop = await tx.shop.create({
                data: {
                    ownerId: user.id,
                    name: name.trim(),
                    slug,
                    description: description?.trim() || null,
                    phone: phone?.trim() || null,
                    email: email?.trim() || null,
                    city: city?.trim() || null,
                    region: region?.trim() || null,
                    category: category?.trim() || null,
                }
            })

            // Upgrade user role to VENDOR (unless already ADMIN)
            if (user.role !== 'ADMIN') {
                await tx.user.update({
                    where: { id: user.id },
                    data: { role: 'VENDOR' }
                })
            }

            return newShop
        })

        return NextResponse.json({
            success: true,
            data: shop,
            message: 'Shop created successfully'
        }, { status: 201 })

    } catch (error) {
        console.error('Error creating shop:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to create shop' },
            { status: 500 }
        )
    }
}

// GET /api/merchant/shop — Get current user's shop
export async function GET() {
    try {
        const user = await getCurrentUser()
        if (!user?.id) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const shop = await prisma.shop.findFirst({
            where: { ownerId: user.id },
            include: {
                _count: { select: { products: true } }
            }
        })

        if (!shop) {
            return NextResponse.json(
                { success: false, error: 'No shop found' },
                { status: 404 }
            )
        }

        return NextResponse.json({ success: true, data: shop })

    } catch (error) {
        console.error('Error fetching merchant shop:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch shop' },
            { status: 500 }
        )
    }
}

// PUT /api/merchant/shop — Update merchant's shop
export async function PUT(request: NextRequest) {
    try {
        const user = await getCurrentUser()
        if (!user?.id) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const shop = await prisma.shop.findFirst({
            where: { ownerId: user.id }
        })
        if (!shop) {
            return NextResponse.json(
                { success: false, error: 'No shop found' },
                { status: 404 }
            )
        }

        const body = await request.json()
        const { name, description, phone, email, city, region, category, logo, coverImage, website } = body

        const updatedShop = await prisma.shop.update({
            where: { id: shop.id },
            data: {
                ...(name && { name: name.trim() }),
                ...(description !== undefined && { description: description?.trim() || null }),
                ...(phone !== undefined && { phone: phone?.trim() || null }),
                ...(email !== undefined && { email: email?.trim() || null }),
                ...(city !== undefined && { city: city?.trim() || null }),
                ...(region !== undefined && { region: region?.trim() || null }),
                ...(category !== undefined && { category: category?.trim() || null }),
                ...(logo !== undefined && { logo }),
                ...(coverImage !== undefined && { coverImage }),
                ...(website !== undefined && { website: website?.trim() || null }),
            }
        })

        return NextResponse.json({ success: true, data: updatedShop })

    } catch (error) {
        console.error('Error updating shop:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to update shop' },
            { status: 500 }
        )
    }
}
