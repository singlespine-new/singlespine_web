import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// PUT /api/merchant/products/[id] — Update a product
export async function PUT(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser()
        if (!user?.id) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await context.params

        // Verify product belongs to merchant's shop
        const shop = await prisma.shop.findFirst({
            where: { ownerId: user.id, isActive: true }
        })
        if (!shop) {
            return NextResponse.json({ success: false, error: 'No shop found' }, { status: 404 })
        }

        const existing = await prisma.product.findFirst({
            where: { id, shopId: shop.id }
        })
        if (!existing) {
            return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 })
        }

        const body = await request.json()
        const {
            name, description, shortDescription, price, comparePrice,
            images, category, subcategory, tags, stock, weight,
            isFeatured, isActive, availability
        } = body

        const product = await prisma.product.update({
            where: { id },
            data: {
                ...(name && { name: name.trim() }),
                ...(description && { description: description.trim() }),
                ...(shortDescription !== undefined && { shortDescription: shortDescription?.trim() || null }),
                ...(price !== undefined && { price: parseFloat(price) }),
                ...(comparePrice !== undefined && { comparePrice: comparePrice ? parseFloat(comparePrice) : null }),
                ...(images && { images }),
                ...(category && { category: category.trim() }),
                ...(subcategory !== undefined && { subcategory: subcategory?.trim() || null }),
                ...(tags && { tags }),
                ...(stock !== undefined && { stock: parseInt(stock) }),
                ...(weight !== undefined && { weight: weight ? parseFloat(weight) : null }),
                ...(isFeatured !== undefined && { isFeatured }),
                ...(isActive !== undefined && { isActive }),
                ...(availability && { availability }),
            },
            include: { variants: true },
        })

        return NextResponse.json({ success: true, data: product })
    } catch (error) {
        console.error('Error updating product:', error)
        return NextResponse.json({ success: false, error: 'Failed to update product' }, { status: 500 })
    }
}

// DELETE /api/merchant/products/[id] — Soft-delete a product
export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser()
        if (!user?.id) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await context.params

        const shop = await prisma.shop.findFirst({
            where: { ownerId: user.id, isActive: true }
        })
        if (!shop) {
            return NextResponse.json({ success: false, error: 'No shop found' }, { status: 404 })
        }

        const existing = await prisma.product.findFirst({
            where: { id, shopId: shop.id }
        })
        if (!existing) {
            return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 })
        }

        // Soft delete
        await prisma.product.update({
            where: { id },
            data: { isActive: false }
        })

        return NextResponse.json({ success: true, message: 'Product deleted' })
    } catch (error) {
        console.error('Error deleting product:', error)
        return NextResponse.json({ success: false, error: 'Failed to delete product' }, { status: 500 })
    }
}
