import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/merchant/products — List merchant's products
export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser()
        if (!user?.id) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const shop = await prisma.shop.findFirst({
            where: { ownerId: user.id, isActive: true }
        })
        if (!shop) {
            return NextResponse.json({ success: false, error: 'No shop found' }, { status: 404 })
        }

        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '20')
        const search = searchParams.get('search') || ''
        const category = searchParams.get('category') || ''
        const availability = searchParams.get('availability') || ''

        const where: Record<string, unknown> = { shopId: shop.id }
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ]
        }
        if (category) where.category = category
        if (availability) where.availability = availability

        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                include: {
                    variants: { where: { isActive: true }, select: { id: true, name: true, value: true, price: true, stock: true } },
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
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            },
        })
    } catch (error) {
        console.error('Error fetching merchant products:', error)
        return NextResponse.json({ success: false, error: 'Failed to fetch products' }, { status: 500 })
    }
}

// POST /api/merchant/products — Create a product
export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser()
        if (!user?.id) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const shop = await prisma.shop.findFirst({
            where: { ownerId: user.id, isActive: true }
        })
        if (!shop) {
            return NextResponse.json({ success: false, error: 'No shop found' }, { status: 404 })
        }

        const body = await request.json()
        const {
            name, description, shortDescription, price, comparePrice,
            images, category, subcategory, tags, stock, weight,
            isFeatured, variants
        } = body

        if (!name?.trim() || !description?.trim() || !price || !category?.trim()) {
            return NextResponse.json(
                { success: false, error: 'Name, description, price, and category are required' },
                { status: 400 }
            )
        }

        // Generate slug
        const baseSlug = name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '')
        let slug = baseSlug
        let suffix = 1
        while (await prisma.product.findUnique({ where: { slug } })) {
            slug = `${baseSlug}-${suffix}`
            suffix++
        }

        const product = await prisma.product.create({
            data: {
                name: name.trim(),
                slug,
                description: description.trim(),
                shortDescription: shortDescription?.trim() || null,
                price: parseFloat(price),
                comparePrice: comparePrice ? parseFloat(comparePrice) : null,
                images: images || [],
                category: category.trim(),
                subcategory: subcategory?.trim() || null,
                tags: tags || [],
                stock: parseInt(stock) || 0,
                weight: weight ? parseFloat(weight) : null,
                isFeatured: !!isFeatured,
                vendor: shop.name,
                shopId: shop.id,
                availability: parseInt(stock) > 0 ? 'IN_STOCK' : 'OUT_OF_STOCK',
                ...(variants?.length && {
                    variants: {
                        create: variants.map((v: { name: string; value: string; price?: string; stock?: string }) => ({
                            name: v.name,
                            value: v.value,
                            price: v.price ? parseFloat(v.price) : null,
                            stock: v.stock ? parseInt(v.stock) : 0,
                        }))
                    }
                })
            },
            include: { variants: true },
        })

        return NextResponse.json({ success: true, data: product }, { status: 201 })
    } catch (error) {
        console.error('Error creating product:', error)
        return NextResponse.json({ success: false, error: 'Failed to create product' }, { status: 500 })
    }
}
