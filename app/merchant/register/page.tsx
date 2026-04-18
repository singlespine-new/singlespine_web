'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useAuth } from '@/lib/auth-utils'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/input'
import { UIIcon } from '@/components/ui/icon'
import DataEmptyState from '@/components/ui/DataEmptyState'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import Link from 'next/link'

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

type Step = 'info' | 'contact' | 'review'

export default function MerchantRegisterPage() {
  const router = useRouter()
  const { update: updateSession } = useSession()
  const { user, isAuthenticated, isLoading } = useAuth()

  const [currentStep, setCurrentStep] = useState<Step>('info')
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [form, setForm] = useState({
    name: '', description: '', category: '',
    phone: '', email: '', city: '', region: '',
  })

  const updateField = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => { const c = { ...prev }; delete c[field]; return c })
    }
  }

  const validateInfo = () => {
    const errs: Record<string, string> = {}
    if (!form.name.trim()) errs.name = 'Shop name is required'
    if (!form.category) errs.category = 'Select a category'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const validateContact = () => {
    const errs: Record<string, string> = {}
    if (!form.phone.trim()) errs.phone = 'Phone number is required'
    if (!form.city.trim()) errs.city = 'City is required'
    if (!form.region) errs.region = 'Select a region'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const nextStep = () => {
    if (currentStep === 'info' && validateInfo()) setCurrentStep('contact')
    else if (currentStep === 'contact' && validateContact()) setCurrentStep('review')
  }

  const prevStep = () => {
    if (currentStep === 'contact') setCurrentStep('info')
    else if (currentStep === 'review') setCurrentStep('contact')
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const res = await fetch('/api/merchant/shop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await res.json()

      if (res.status === 401) {
        // Session is stale (e.g. old MongoDB ID hitting a fresh PostgreSQL DB).
        // Sign the user out so they re-authenticate and get a valid user record.
        toast.error('Your session has expired. Please sign in again.')
        await signOut({ callbackUrl: '/auth/signin' })
        return
      }

      if (!res.ok) { toast.error(data.error || 'Failed to create shop'); return }
      toast.success('Shop created! Welcome to the Merchant Portal.')
      // Force session refresh so JWT picks up the new VENDOR role
      await updateSession()
      // Small delay to let session propagate, then navigate
      await new Promise(r => setTimeout(r, 500))
      router.push('/merchant')
      router.refresh()
    } catch { toast.error('Network error. Please try again.') }
    finally { setSubmitting(false) }
  }

  /* --- Loading / Unauthenticated --- */
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <UIIcon name="loading" className="w-10 h-10 text-primary animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <DataEmptyState
          title="Sign In Required"
          description="Please sign in to register as a merchant"
          icon={{ name: 'building', tone: 'primary' }}
          primaryAction={{
            label: 'Sign In',
            onClick: () => router.push('/auth/signin?callbackUrl=/merchant/register'),
          }}
          variant="card"
          size="md"
        />
      </div>
    )
  }

  /* --- Steps Config --- */
  const steps: { id: Step; label: string; num: number }[] = [
    { id: 'info', label: 'Shop Info', num: 1 },
    { id: 'contact', label: 'Contact', num: 2 },
    { id: 'review', label: 'Review', num: 3 },
  ]
  const currentIndex = steps.findIndex(s => s.id === currentStep)

  const selectClass = (field: string) =>
    cn(
      'flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none md:text-sm appearance-none',
      'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
      errors[field]
        ? 'border-destructive aria-invalid:ring-destructive/20'
        : 'border-input dark:bg-input/30'
    )

  return (
    <div className="min-h-screen bg-background flex items-start justify-center p-4 pt-8 md:pt-16">
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl border border-primary/20 mb-4">
            <UIIcon name="building" className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">Create Your Shop</h1>
          <p className="text-muted-foreground text-sm">
            Set up your merchant account and start selling on Singlespine
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((step, i) => (
            <React.Fragment key={step.id}>
              <div className="flex items-center gap-2">
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors',
                  i <= currentIndex ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                )}>
                  {i < currentIndex
                    ? <UIIcon name="success" className="w-4 h-4" />
                    : step.num}
                </div>
                <span className={cn(
                  'text-xs font-medium hidden sm:block',
                  i === currentIndex ? 'text-foreground' : 'text-muted-foreground'
                )}>
                  {step.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={cn('w-8 sm:w-12 h-px', i < currentIndex ? 'bg-primary' : 'bg-border')} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Form Card */}
        <div className="bg-card border border-border/40 rounded-2xl p-6 md:p-8">

          {/* Step 1: Shop Info */}
          {currentStep === 'info' && (
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium">Shop Name *</label>
                <Input
                  value={form.name}
                  onChange={e => updateField('name', e.target.value)}
                  placeholder="e.g., Accra Fresh Market"
                  aria-invalid={!!errors.name}
                  className="h-11 rounded-xl"
                />
                {errors.name && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <UIIcon name="error" className="w-3 h-3" /> {errors.name}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => updateField('description', e.target.value)}
                  placeholder="Tell customers what your shop offers..."
                  rows={3}
                  className={cn(selectClass('description'), 'h-auto py-2 resize-none rounded-xl')}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1.5">
                  <UIIcon name="tag" className="w-3.5 h-3.5 text-primary" /> Category *
                </label>
                <select
                  value={form.category}
                  onChange={e => updateField('category', e.target.value)}
                  className={cn(selectClass('category'), 'h-11 rounded-xl')}
                  aria-invalid={!!errors.category}
                >
                  <option value="">Select a category</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.category && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <UIIcon name="error" className="w-3 h-3" /> {errors.category}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Contact */}
          {currentStep === 'contact' && (
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1.5">
                  <UIIcon name="phone" className="w-3.5 h-3.5 text-primary" /> Phone Number *
                </label>
                <Input
                  type="tel"
                  value={form.phone}
                  onChange={e => updateField('phone', e.target.value)}
                  placeholder="0XXX XXX XXX"
                  aria-invalid={!!errors.phone}
                  className="h-11 rounded-xl"
                />
                {errors.phone && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <UIIcon name="error" className="w-3 h-3" /> {errors.phone}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1.5">
                  <UIIcon name="mail" className="w-3.5 h-3.5 text-primary" /> Email (optional)
                </label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={e => updateField('email', e.target.value)}
                  placeholder="shop@example.com"
                  className="h-11 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-1.5">
                    <UIIcon name="location" className="w-3.5 h-3.5 text-primary" /> City *
                  </label>
                  <Input
                    value={form.city}
                    onChange={e => updateField('city', e.target.value)}
                    placeholder="Accra, Kumasi..."
                    aria-invalid={!!errors.city}
                    className="h-11 rounded-xl"
                  />
                  {errors.city && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <UIIcon name="error" className="w-3 h-3" /> {errors.city}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Region *</label>
                  <select
                    value={form.region}
                    onChange={e => updateField('region', e.target.value)}
                    className={cn(selectClass('region'), 'h-11 rounded-xl')}
                    aria-invalid={!!errors.region}
                  >
                    <option value="">Select region</option>
                    {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                  {errors.region && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <UIIcon name="error" className="w-3 h-3" /> {errors.region}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {currentStep === 'review' && (
            <div className="space-y-6">
              <div className="text-center">
                <UIIcon name="success" className="w-10 h-10 text-primary mx-auto mb-3" />
                <h3 className="text-lg font-semibold mb-1">Almost There!</h3>
                <p className="text-sm text-muted-foreground">Review your shop details before submitting</p>
              </div>

              <div className="grid gap-3 text-sm">
                {[
                  { label: 'Shop Name', value: form.name },
                  { label: 'Category', value: form.category },
                  { label: 'Description', value: form.description || '—' },
                  { label: 'Phone', value: form.phone },
                  { label: 'Email', value: form.email || '—' },
                  { label: 'Location', value: `${form.city}, ${form.region}` },
                  { label: 'Owner', value: user?.name || user?.email || '—' },
                ].map(row => (
                  <div key={row.label} className="flex justify-between gap-4 py-2 border-b border-border/30 last:border-0">
                    <span className="text-muted-foreground">{row.label}</span>
                    <span className="font-medium text-right">{row.value}</span>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 text-xs text-muted-foreground">
                By creating this shop, your account will be upgraded to a Merchant account.
                You can manage products and track orders from the Merchant Portal.
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border/40">
            {currentStep !== 'info' ? (
              <Button variant="outline" onClick={prevStep} size="lg" className="rounded-xl">
                <UIIcon name="chevron-left" className="w-4 h-4 mr-1" />
                Back
              </Button>
            ) : (
              <Button variant="ghost" asChild className="rounded-xl text-muted-foreground">
                <Link href="/products">Cancel</Link>
              </Button>
            )}

            {currentStep === 'review' ? (
              <Button onClick={handleSubmit} disabled={submitting} size="lg" className="rounded-xl font-semibold px-8">
                {submitting ? (
                  <><UIIcon name="loading" className="w-4 h-4 animate-spin mr-2" /> Creating...</>
                ) : 'Create Shop'}
              </Button>
            ) : (
              <Button onClick={nextStep} size="lg" className="rounded-xl">
                Next <UIIcon name="chevron-right" className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Need help? Contact us at{' '}
          <a href="mailto:support@singlespine.com" className="text-primary hover:underline">
            support@singlespine.com
          </a>
        </p>
      </div>
    </div>
  )
}
