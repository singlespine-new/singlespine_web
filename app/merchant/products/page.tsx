'use client'

import React, { useState, useEffect, useCallback, Suspense } from 'react'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { useRequireMerchant } from '@/lib/auth-utils'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/input'
import { SearchBar } from '@/components/ui/SearchBar'
import { UIIcon } from '@/components/ui/icon'
import DataEmptyState from '@/components/ui/DataEmptyState'
import {
    Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetDescription
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

interface MerchantProduct {
    id: string
    name: string
    slug: string
    description: string
    shortDescription?: string | null
    price: number
    comparePrice?: number | null
    images: string[]
    category: string
    subcategory?: string | null
    tags: string[]
    stock: number
    isFeatured: boolean
    isActive: boolean
    availability: string
    createdAt: string
    _count?: { orderItems: number }
}

const CATEGORIES = [
    'Grocery & Food', 'Electronics', 'Fashion & Clothing', 'Health & Beauty',
    'Home & Kitchen', 'Baby & Kids', 'Sports & Outdoor', 'Books & Stationery',
    'Automotive', 'Agriculture', 'Other'
]

const selectClass = cn(
    'flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none md:text-sm appearance-none',
    'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
    'border-input dark:bg-input/30'
)

function MerchantProductsContent() {
    const { isLoading: authLoading, isMerchant } = useRequireMerchant()
    const router = useRouter()
    const searchParams = useSearchParams()

    const [products, setProducts] = useState<MerchantProduct[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [filterCategory, setFilterCategory] = useState('')
    const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 })

    // Product form state
    const [showForm, setShowForm] = useState(false)
    const [editingProduct, setEditingProduct] = useState<MerchantProduct | null>(null)
    const [saving, setSaving] = useState(false)
    const [formErrors, setFormErrors] = useState<Record<string, string>>({})
    const [form, setForm] = useState({
        name: '', description: '', shortDescription: '',
        price: '', comparePrice: '', category: '',
        subcategory: '', stock: '0', weight: '',
        isFeatured: false, tags: '',
        images: [] as string[],
    })

    const resetForm = () => {
        setForm({
            name: '', description: '', shortDescription: '',
            price: '', comparePrice: '', category: '',
            subcategory: '', stock: '0', weight: '',
            isFeatured: false, tags: '',
            images: [],
        })
        setEditingProduct(null)
        setFormErrors({})
    }

    const fetchProducts = useCallback(async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            if (search) params.set('search', search)
            if (filterCategory) params.set('category', filterCategory)
            params.set('page', String(pagination.page))

            const res = await fetch(`/api/merchant/products?${params}`)
            const data = await res.json()
            if (data.success) {
                setProducts(data.data.products)
                setPagination(data.data.pagination)
            }
        } catch { toast.error('Failed to load products') }
        finally { setLoading(false) }
    }, [search, filterCategory, pagination.page])

    useEffect(() => {
        if (isMerchant) fetchProducts()
    }, [isMerchant, fetchProducts])

    useEffect(() => {
        if (searchParams.get('action') === 'new') {
            resetForm()
            setShowForm(true)
            router.replace('/merchant/products', { scroll: false })
        }
    }, [searchParams, router])

    const openEdit = (product: MerchantProduct) => {
        setEditingProduct(product)
        setForm({
            name: product.name,
            description: product.description,
            shortDescription: product.shortDescription || '',
            price: String(product.price),
            comparePrice: product.comparePrice ? String(product.comparePrice) : '',
            category: product.category,
            subcategory: product.subcategory || '',
            stock: String(product.stock),
            weight: '',
            isFeatured: product.isFeatured,
            tags: product.tags.join(', '),
            images: product.images,
        })
        setFormErrors({})
        setShowForm(true)
    }

    const validateForm = () => {
        const errs: Record<string, string> = {}
        if (!form.name.trim()) errs.name = 'Required'
        if (!form.description.trim()) errs.description = 'Required'
        if (!form.price || isNaN(Number(form.price))) errs.price = 'Valid price required'
        if (!form.category) errs.category = 'Required'
        setFormErrors(errs)
        return Object.keys(errs).length === 0
    }

    const handleSave = async () => {
        if (!validateForm()) return
        setSaving(true)
        try {
            const payload = {
                ...form,
                tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
            }
            const url = editingProduct
                ? `/api/merchant/products/${editingProduct.id}`
                : '/api/merchant/products'
            const method = editingProduct ? 'PUT' : 'POST'

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })
            const data = await res.json()

            if (!res.ok) { toast.error(data.error || 'Failed to save'); return }
            toast.success(editingProduct ? 'Product updated!' : 'Product created!')
            setShowForm(false)
            resetForm()
            fetchProducts()
        } catch { toast.error('Network error') }
        finally { setSaving(false) }
    }

    const handleDelete = async (product: MerchantProduct) => {
        if (!confirm(`Delete "${product.name}"? This action cannot be undone.`)) return
        try {
            const res = await fetch(`/api/merchant/products/${product.id}`, { method: 'DELETE' })
            if (res.ok) { toast.success('Product deleted'); fetchProducts() }
            else { toast.error('Failed to delete') }
        } catch { toast.error('Network error') }
    }

    const updateField = (field: string, value: string | boolean | string[]) => {
        setForm(prev => ({ ...prev, [field]: value }))
        if (formErrors[field]) {
            setFormErrors(prev => { const c = { ...prev }; delete c[field]; return c })
        }
    }

    if (authLoading) {
        return (
            <div className="flex items-center justify-center py-32">
                <UIIcon name="loading" className="w-8 h-8 text-primary animate-spin" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Products</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        {pagination.total} product{pagination.total !== 1 ? 's' : ''} in your shop
                    </p>
                </div>
                <Button onClick={() => { resetForm(); setShowForm(true) }} size="lg" className="rounded-xl">
                    <UIIcon name="plus" className="w-4 h-4 mr-1.5" /> Add Product
                </Button>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                    <SearchBar
                        placeholder="Search products..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        onSearch={setSearch}
                        variant="default"
                        size="sm"
                        clearButton
                    />
                </div>
                <div className="relative">
                    <select
                        value={filterCategory}
                        onChange={e => setFilterCategory(e.target.value)}
                        className={cn(selectClass, 'w-full sm:w-48 h-10 rounded-full pr-8')}
                    >
                        <option value="">All Categories</option>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <UIIcon name="chevron-down" className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
            </div>

            {/* Product Grid */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <UIIcon name="loading" className="w-6 h-6 text-primary animate-spin" />
                </div>
            ) : products.length === 0 ? (
                <DataEmptyState
                    title="No products yet"
                    description="Add your first product to start selling"
                    icon={{ name: 'package', tone: 'primary' }}
                    primaryAction={{
                        label: 'Add Product',
                        onClick: () => { resetForm(); setShowForm(true) },
                        iconName: 'plus',
                    }}
                    variant="card"
                    size="md"
                />
            ) : (
                <div className="grid gap-3">
                    {products.map(product => (
                        <div
                            key={product.id}
                            className="flex items-center gap-4 p-4 rounded-xl border border-border/40 bg-card hover:shadow-md transition-shadow"
                        >
                            {/* Image */}
                            <div className="w-16 h-16 rounded-lg bg-muted overflow-hidden shrink-0">
                                {product.images[0] ? (
                                    <Image
                                        src={product.images[0]}
                                        alt={product.name}
                                        width={64}
                                        height={64}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <UIIcon name="package-alt" className="w-6 h-6 text-muted-foreground" />
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="text-sm font-semibold truncate">{product.name}</h3>
                                    {product.isFeatured && (
                                        <span className="px-1.5 py-0.5 text-[10px] bg-primary/10 text-primary rounded-md font-medium">Featured</span>
                                    )}
                                    {!product.isActive && (
                                        <span className="px-1.5 py-0.5 text-[10px] bg-destructive/10 text-destructive rounded-md font-medium">Inactive</span>
                                    )}
                                </div>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                    <span>₵{product.price.toFixed(2)}</span>
                                    <span>{product.stock} in stock</span>
                                    <span>{product._count?.orderItems || 0} sold</span>
                                    <span className="hidden sm:inline">{product.category}</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1 shrink-0">
                                <Button variant="ghost" size="icon" onClick={() => openEdit(product)} aria-label="Edit product">
                                    <UIIcon name="edit" className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant="ghost" size="icon"
                                    onClick={() => handleDelete(product)}
                                    className="hover:text-destructive hover:bg-destructive/10"
                                    aria-label="Delete product"
                                >
                                    <UIIcon name="trash" className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4">
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
                        <button
                            key={p}
                            onClick={() => setPagination(prev => ({ ...prev, page: p }))}
                            className={cn(
                                'w-8 h-8 rounded-lg text-xs font-medium transition',
                                p === pagination.page ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted'
                            )}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            )}

            {/* Add/Edit Product Sheet */}
            <Sheet open={showForm} onOpenChange={(open) => { if (!open) { setShowForm(false); resetForm() } }}>
                <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</SheetTitle>
                        <SheetDescription>
                            {editingProduct ? 'Update product details below' : 'Fill in the details to create a new product'}
                        </SheetDescription>
                    </SheetHeader>

                    <div className="px-4 pb-4 space-y-5">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Product Name *</label>
                            <Input
                                value={form.name}
                                onChange={e => updateField('name', e.target.value)}
                                placeholder="e.g., Organic Shea Butter"
                                aria-invalid={!!formErrors.name}
                                className="h-10"
                            />
                            {formErrors.name && <p className="text-xs text-destructive flex items-center gap-1"><UIIcon name="error" className="w-3 h-3" /> {formErrors.name}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Description *</label>
                            <textarea
                                value={form.description}
                                onChange={e => updateField('description', e.target.value)}
                                placeholder="Describe your product..."
                                rows={3}
                                className={cn(selectClass, 'h-auto py-2 resize-none', formErrors.description && 'border-destructive')}
                            />
                            {formErrors.description && <p className="text-xs text-destructive flex items-center gap-1"><UIIcon name="error" className="w-3 h-3" /> {formErrors.description}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Price (₵) *</label>
                                <Input
                                    type="number" step="0.01"
                                    value={form.price}
                                    onChange={e => updateField('price', e.target.value)}
                                    placeholder="0.00"
                                    aria-invalid={!!formErrors.price}
                                    className="h-10"
                                />
                                {formErrors.price && <p className="text-xs text-destructive flex items-center gap-1"><UIIcon name="error" className="w-3 h-3" /> {formErrors.price}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Compare Price (₵)</label>
                                <Input
                                    type="number" step="0.01"
                                    value={form.comparePrice}
                                    onChange={e => updateField('comparePrice', e.target.value)}
                                    placeholder="Original price"
                                    className="h-10"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Category *</label>
                                <select
                                    value={form.category}
                                    onChange={e => updateField('category', e.target.value)}
                                    className={cn(selectClass, 'h-10', formErrors.category && 'border-destructive')}
                                >
                                    <option value="">Select category</option>
                                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                                {formErrors.category && <p className="text-xs text-destructive flex items-center gap-1"><UIIcon name="error" className="w-3 h-3" /> {formErrors.category}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Stock</label>
                                <Input
                                    type="number"
                                    value={form.stock}
                                    onChange={e => updateField('stock', e.target.value)}
                                    placeholder="0"
                                    className="h-10"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Tags (comma-separated)</label>
                            <Input
                                value={form.tags}
                                onChange={e => updateField('tags', e.target.value)}
                                placeholder="organic, handmade, ghana"
                                className="h-10"
                            />
                        </div>

                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox" id="isFeatured"
                                checked={form.isFeatured}
                                onChange={e => updateField('isFeatured', e.target.checked)}
                                className="w-4 h-4 rounded border-input text-primary focus:ring-primary/20"
                            />
                            <label htmlFor="isFeatured" className="text-sm font-medium cursor-pointer">
                                Mark as Featured Product
                            </label>
                        </div>
                    </div>

                    <SheetFooter>
                        <Button variant="outline" onClick={() => { setShowForm(false); resetForm() }}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={saving}>
                            {saving ? (
                                <><UIIcon name="loading" className="w-4 h-4 animate-spin mr-1.5" /> Saving...</>
                            ) : (
                                editingProduct ? 'Update Product' : 'Create Product'
                            )}
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </div>
    )
}

export default function MerchantProductsPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center py-32">
                <UIIcon name="loading" className="w-8 h-8 text-primary animate-spin" />
            </div>
        }>
            <MerchantProductsContent />
        </Suspense>
    )
}
