'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRequireMerchant } from '@/lib/auth-utils'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/input'
import { UIIcon } from '@/components/ui/icon'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

const REGIONS = [
    'Greater Accra', 'Ashanti', 'Western', 'Central', 'Eastern',
    'Northern', 'Upper East', 'Upper West', 'Volta', 'Brong Ahafo',
    'Savannah', 'Bono East', 'Ahafo', 'Oti', 'North East', 'Western North'
]

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

interface ShopData {
    id: string
    name: string
    slug: string
    description: string | null
    phone: string | null
    email: string | null
    city: string | null
    region: string | null
    category: string | null
    website: string | null
    logo: string | null
    coverImage: string | null
    isVerified: boolean
}

export default function MerchantSettingsPage() {
    const { isLoading: authLoading, isMerchant } = useRequireMerchant()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [shop, setShop] = useState<ShopData | null>(null)
    const [form, setForm] = useState({
        name: '', description: '', phone: '', email: '',
        city: '', region: '', category: '', website: '',
    })

    const fetchShop = useCallback(async () => {
        try {
            const res = await fetch('/api/merchant/shop')
            const data = await res.json()
            if (data.success && data.data) {
                setShop(data.data)
                setForm({
                    name: data.data.name || '',
                    description: data.data.description || '',
                    phone: data.data.phone || '',
                    email: data.data.email || '',
                    city: data.data.city || '',
                    region: data.data.region || '',
                    category: data.data.category || '',
                    website: data.data.website || '',
                })
            }
        } catch { toast.error('Failed to load shop') }
        finally { setLoading(false) }
    }, [])

    useEffect(() => {
        if (isMerchant) fetchShop()
    }, [isMerchant, fetchShop])

    const handleSave = async () => {
        if (!form.name.trim()) { toast.error('Shop name is required'); return }
        setSaving(true)
        try {
            const res = await fetch('/api/merchant/shop', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            })
            const data = await res.json()
            if (data.success) { toast.success('Shop settings saved!'); setShop(data.data) }
            else { toast.error(data.error || 'Failed to save') }
        } catch { toast.error('Network error') }
        finally { setSaving(false) }
    }

    const updateField = (field: string, value: string) => {
        setForm(prev => ({ ...prev, [field]: value }))
    }

    if (authLoading || loading) {
        return (
            <div className="flex items-center justify-center py-32">
                <UIIcon name="loading" className="w-8 h-8 text-primary animate-spin" />
            </div>
        )
    }

    if (!shop) return null

    return (
        <div className="space-y-8 max-w-2xl">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Shop Settings</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Manage your shop profile and contact information
                    </p>
                </div>
                {shop.isVerified && (
                    <span className="px-3 py-1 text-xs bg-emerald-500/10 text-emerald-600 rounded-full font-medium">
                        Verified
                    </span>
                )}
            </div>

            {/* Shop Info */}
            <section className="bg-card border border-border/40 rounded-2xl p-6 space-y-5">
                <h2 className="text-base font-semibold flex items-center gap-2">
                    <UIIcon name="building" className="w-4 h-4 text-primary" /> Shop Information
                </h2>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Shop Name</label>
                    <Input value={form.name} onChange={e => updateField('name', e.target.value)} className="h-10" />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <textarea
                        value={form.description}
                        onChange={e => updateField('description', e.target.value)}
                        rows={3}
                        className={cn(selectClass, 'h-auto py-2 resize-none')}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-1.5">
                        <UIIcon name="tag" className="w-3.5 h-3.5 text-primary" /> Category
                    </label>
                    <select value={form.category} onChange={e => updateField('category', e.target.value)} className={cn(selectClass, 'h-10')}>
                        <option value="">Select category</option>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
            </section>

            {/* Contact */}
            <section className="bg-card border border-border/40 rounded-2xl p-6 space-y-5">
                <h2 className="text-base font-semibold flex items-center gap-2">
                    <UIIcon name="phone" className="w-4 h-4 text-primary" /> Contact Details
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-1.5">
                            <UIIcon name="phone" className="w-3.5 h-3.5" /> Phone
                        </label>
                        <Input type="tel" value={form.phone} onChange={e => updateField('phone', e.target.value)} className="h-10" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-1.5">
                            <UIIcon name="mail" className="w-3.5 h-3.5" /> Email
                        </label>
                        <Input type="email" value={form.email} onChange={e => updateField('email', e.target.value)} className="h-10" />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-1.5">
                        <UIIcon name="globe" className="w-3.5 h-3.5" /> Website
                    </label>
                    <Input type="url" value={form.website} onChange={e => updateField('website', e.target.value)} placeholder="https://your-shop.com" className="h-10" />
                </div>
            </section>

            {/* Location */}
            <section className="bg-card border border-border/40 rounded-2xl p-6 space-y-5">
                <h2 className="text-base font-semibold flex items-center gap-2">
                    <UIIcon name="location" className="w-4 h-4 text-primary" /> Location
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">City</label>
                        <Input value={form.city} onChange={e => updateField('city', e.target.value)} className="h-10" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Region </label>
                        <select value={form.region} onChange={e => updateField('region', e.target.value)} className={cn(selectClass, 'h-10')}>
                            <option value="">Select region</option>
                            {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </div>
                </div>
            </section>

            {/* Save */}
            <div className="flex justify-end">
                <Button onClick={handleSave} disabled={saving} size="lg" className="rounded-xl px-8">
                    {saving ? (
                        <><UIIcon name="loading" className="w-4 h-4 animate-spin mr-1.5" /> Saving...</>
                    ) : (
                        <><UIIcon name="save" className="w-4 h-4 mr-1.5" /> Save Changes</>
                    )}
                </Button>
            </div>

            {/* Slug */}
            <div className="text-xs text-muted-foreground text-center pt-2">
                Your shop slug: <code className="px-1.5 py-0.5 bg-muted rounded font-mono">{shop.slug}</code>
            </div>
        </div>
    )
}
