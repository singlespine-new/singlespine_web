'use client'

import React, {
  useEffect,
  useMemo,
  useState,
  useRef
} from 'react'
import { useRouter } from 'next/navigation'
import { useAuth, useRequireAuth } from '@/lib/auth-utils'
import { Button } from '@/components/ui/Button'
import toast from '@/components/ui/toast'
import PaymentMethodManager from '@/components/PaymentMethods/PaymentMethodManager'
import {
  User as UserIcon,
  Mail,
  Phone,
  Save,
  Loader2,
  MapPin,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  Star,
  X,
  CreditCard,
  ArrowLeft,
  Settings,
  Shield,
  Search,
  Tag,
  Globe2,
  Check,
  AlertCircle,
  Lock
} from 'lucide-react'
import Image from 'next/image'

/**
 * Types
 */
type ProfileForm = {
  name: string
  email: string
  phoneNumber: string
}

type Address = {
  id: string
  label: string
  recipientName: string
  phone: string
  addressLine: string
  city: string
  region: string
  relationship?: string
  notes?: string
  isDefault?: boolean
}

/**
 * Reusable Section Shell
 */
const SectionCard: React.FC<{
  title: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  description?: string
  actions?: React.ReactNode
  children: React.ReactNode
  id?: string
  padded?: boolean
}> = ({ title, icon: Icon, description, actions, children, id, padded = true }) => {
  return (
    <section
      id={id}
      className="group rounded-2xl bg-white/90 backdrop-blur-sm border border-border/30 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 transition"
    >
      <header className="flex items-start justify-between gap-4 px-5 py-5 border-b border-border/40">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base md:text-lg font-semibold leading-tight">{title}</h2>
            {description && (
              <p className="text-xs md:text-sm text-muted-foreground mt-1">
                {description}
              </p>
            )}
          </div>
        </div>
        {actions && <div className="flex-shrink-0">{actions}</div>}
      </header>
      <div className={padded ? 'p-5 md:p-6' : ''}>{children}</div>
    </section>
  )
}

/**
 * Tab Navigation (Desktop)
 */
const DesktopNav: React.FC<{
  current: string
  onChange: (id: 'overview' | 'profile' | 'addresses' | 'payments') => void
  counts: Record<string, number>
}> = ({ current, onChange, counts }) => {
  const items: Array<{ id: 'overview' | 'profile' | 'addresses' | 'payments'; label: string; icon: React.ComponentType<React.SVGProps<SVGSVGElement>> }> = [
    { id: 'overview', label: 'Overview', icon: Settings },
    { id: 'profile', label: 'Profile', icon: UserIcon },
    { id: 'addresses', label: 'Addresses', icon: MapPin },
    { id: 'payments', label: 'Payments', icon: CreditCard }
  ]

  return (
    <nav aria-label="Account navigation" className="hidden lg:block">
      <ul className="space-y-1">
        {items.map(item => {
          const active = current === item.id
            ; return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => onChange(item.id)}
                  aria-current={active ? 'page' : undefined}
                  className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-primary/30
                  ${active
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-white/70 text-foreground hover:bg-white'}
                `}
                >
                  <span className="flex items-center gap-3">
                    <item.icon className={`w-4 h-4 ${active ? 'opacity-90' : 'text-muted-foreground'}`} />
                    {item.label}
                  </span>
                  {counts[item.id] !== undefined && counts[item.id] > 0 && (
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full
                      ${active ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground'}
                    `}>
                      {counts[item.id]}
                    </span>
                  )}
                </button>
              </li>
            )
        })}
      </ul>
    </nav>
  )
}

/**
 * Mobile Tab Switcher
 */
const MobileTabs: React.FC<{
  current: 'overview' | 'profile' | 'addresses' | 'payments'
  onChange: (id: 'overview' | 'profile' | 'addresses' | 'payments') => void
}> = ({ current, onChange }) => {
  const items = [
    { id: 'overview', label: 'Overview' },
    { id: 'profile', label: 'Profile' },
    { id: 'addresses', label: 'Addresses' },
    { id: 'payments', label: 'Payments' }
  ]
  return (
    <div className="lg:hidden rounded-xl p-1 bg-muted/40 flex gap-1 mb-6">
      {items.map(i => {
        const active = current === i.id
        return (
          <button
            key={i.id}
            onClick={() => onChange(i.id as 'overview' | 'profile' | 'addresses' | 'payments')}
            className={`flex-1 h-9 text-xs font-medium rounded-lg transition
              ${active ? 'bg-white shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}
            `}
          >
            {i.label}
          </button>
        )
      })}
    </div>
  )
}

/**
 * Loading Screen
 */
const FullScreenLoading: React.FC<{ label?: string }> = ({ label = 'Loading...' }) => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/10">
    <div className="text-center space-y-4">
      <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
      <p className="text-muted-foreground text-sm">{label}</p>
    </div>
  </div>
)

/**
 * Profile Page
 */
export default function ProfilePage() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useRequireAuth()
  const { user } = useAuth()

  const [activeTab, setActiveTab] = useState<'overview' | 'profile' | 'addresses' | 'payments'>('overview')

  // Profile state
  const [profileLoading, setProfileLoading] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [profile, setProfile] = useState<ProfileForm>({
    name: '',
    email: '',
    phoneNumber: ''
  })
  const [profileErrors, setProfileErrors] = useState<Record<keyof ProfileForm, string>>({
    name: '',
    email: '',
    phoneNumber: ''
  })

  // Avatar logic (provider + custom override)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const avatarInputRef = useRef<HTMLInputElement | null>(null)
  const [avatarLoading, setAvatarLoading] = useState(false)
  interface SessionUserExtras { providerImage?: string; customAvatar?: string; image?: string; phoneNumber?: string }
  const sessionUser = (user ?? {}) as SessionUserExtras
  const providerAvatar = sessionUser.providerImage || sessionUser.image || null
  const [isCustomAvatar, setIsCustomAvatar] = useState<boolean>(!!sessionUser.customAvatar)

  // Initialize effective avatar from custom (if exists) else provider
  useEffect(() => {
    if (!avatarUrl) {
      if (sessionUser.customAvatar) {
        setAvatarUrl(sessionUser.customAvatar)
        setIsCustomAvatar(true)
      } else if (providerAvatar) {
        setAvatarUrl(providerAvatar)
        setIsCustomAvatar(false)
      }
    }
  }, [avatarUrl, providerAvatar, user, sessionUser.customAvatar])

  const handleRevertAvatar = async () => {
    if (!providerAvatar) return
    try {
      await fetch('/api/user/avatar', { method: 'DELETE' })
      setAvatarUrl(providerAvatar)
      setIsCustomAvatar(false)
      toast.success('Reverted to Google profile photo')
    } catch {
      // Fallback local revert even if network fails
      setAvatarUrl(providerAvatar)
      setIsCustomAvatar(false)
      toast.error('Reverted locally (network issue)')
    }
  }

  // Addresses
  const [addresses, setAddresses] = useState<Address[]>([])
  const [addressesLoading, setAddressesLoading] = useState(true)
  const [addressModalOpen, setAddressModalOpen] = useState(false)
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null)
  const [addressSaving, setAddressSaving] = useState(false)
  const [addressErrors, setAddressErrors] = useState<Record<string, string>>({})
  const [addressSearch, setAddressSearch] = useState('')
  const [addressForm, setAddressForm] = useState<Omit<Address, 'id'>>({
    label: '',
    recipientName: '',
    phone: '',
    addressLine: '',
    city: '',
    region: '',
    relationship: '',
    notes: '',
    isDefault: false
  })

  // Derived
  const pageLoading = isLoading || profileLoading
  const filteredAddresses = useMemo(() => {
    if (!addressSearch.trim()) return addresses
    const q = addressSearch.toLowerCase()
    return addresses.filter(a =>
      [a.label, a.recipientName, a.city, a.region].some(
        s => (s || '').toLowerCase().includes(q)
      )
    )
  }, [addresses, addressSearch])

  // Regions (extended)
  const regions = useMemo(
    () => [
      'Greater Accra', 'Ashanti', 'Western', 'Central', 'Eastern',
      'Northern', 'Upper East', 'Upper West', 'Volta', 'Brong Ahafo',
      'Savannah', 'Bono East', 'Ahafo', 'Oti', 'North East', 'Western North'
    ],
    []
  )

  /**
   * Initial load
   */
  useEffect(() => {
    if (!isAuthenticated) return
    let active = true
    const load = async () => {
      try {
        setProfileLoading(true)
        if (user) {
          setProfile(prev => ({
            name: prev.name || user.name || '',
            email: prev.email || user.email || '',
            phoneNumber: prev.phoneNumber || (user as { phoneNumber?: string } | null)?.phoneNumber || ''
          }))
        }
        const [profileRes, addressesRes] = await Promise.allSettled([
          fetch('/api/user/profile'),
          fetch('/api/user/addresses')
        ])
        if (active && profileRes.status === 'fulfilled' && profileRes.value.ok) {
          const data = await profileRes.value.json()
          if (data?.profile) {
            setProfile({
              name: data.profile.name ?? '',
              email: data.profile.email ?? '',
              phoneNumber: data.profile.phoneNumber ?? ''
            })
          }
        }
        if (active && addressesRes.status === 'fulfilled' && addressesRes.value.ok) {
          const data = await addressesRes.value.json()
          if (Array.isArray(data?.addresses)) {
            setAddresses(data.addresses)
          }
        }
      } catch (e) {
        console.error('Profile load error', e)
      } finally {
        if (active) {
          setProfileLoading(false)
          setAddressesLoading(false)
        }
      }
    }
    load()
    return () => { active = false }
  }, [isAuthenticated, user])

  /**
   * Profile Save
   */
  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileErrors({ name: '', email: '', phoneNumber: '' })
    const errors: Record<keyof ProfileForm, string> = { name: '', email: '', phoneNumber: '' }

    if (!profile.name.trim()) errors.name = 'Name is required'
    if (!profile.email.trim()) errors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(profile.email)) errors.email = 'Invalid email address'
    if (profile.phoneNumber && profile.phoneNumber.replace(/\D/g, '').length < 9) {
      errors.phoneNumber = 'Enter a valid phone'
    }

    if (Object.values(errors).some(Boolean)) {
      setProfileErrors(errors)
      toast.error('Please correct the highlighted fields')
      return
    }

    setSavingProfile(true)
    try {
      const res = await fetch('/api/user/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || 'Failed')
      }
      toast.success('Profile updated')
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Update failed')
    } finally {
      setSavingProfile(false)
    }
  }
  /**
   * Avatar (mock) handler
   */
  const handleAvatarPick = () => {
    avatarInputRef.current?.click()
  }
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return
    const file = e.target.files[0]
    setAvatarLoading(true)

    // Local preview first
    const reader = new FileReader()
    reader.onload = async () => {
      const dataUrl = reader.result as string
      setAvatarUrl(dataUrl)

      // In real impl: upload to storage & get a permanent URL.
      // For now we post the dataUrl (NOT ideal for production).
      try {
        // Placeholder: you should replace with an actual uploaded URL.
        const fauxUploadUrl = dataUrl
        const res = await fetch('/api/user/avatar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: fauxUploadUrl })
        })
        if (!res.ok) {
          toast.error('Failed to persist avatar (demo fallback applied)')
        } else {
          toast.success('Avatar updated')
        }
        setIsCustomAvatar(true)
      } catch {
        toast.error('Network issue saving avatar')
      } finally {
        setAvatarLoading(false)
      }
    }
    reader.readAsDataURL(file)
  }

  /**
   * Address Modal Helpers
   */
  const openAddAddress = () => {
    setEditingAddressId(null)
    setAddressForm({
      label: '',
      recipientName: '',
      phone: '',
      addressLine: '',
      city: '',
      region: '',
      relationship: '',
      notes: '',
      isDefault: addresses.length === 0
    })
    setAddressErrors({})
    setAddressModalOpen(true)
  }

  const openEditAddress = (address: Address) => {
    setEditingAddressId(address.id)
    setAddressForm({
      label: address.label || '',
      recipientName: address.recipientName || '',
      phone: address.phone || '',
      addressLine: address.addressLine || '',
      city: address.city || '',
      region: address.region || '',
      relationship: address.relationship || '',
      notes: address.notes || '',
      isDefault: !!address.isDefault
    })
    setAddressErrors({})
    setAddressModalOpen(true)
  }

  const validateAddress = (): boolean => {
    const err: Record<string, string> = {}
    if (!addressForm.label.trim()) err.label = 'Label required'
    if (!addressForm.recipientName.trim()) err.recipientName = 'Recipient name required'
    if (!addressForm.phone.trim()) err.phone = 'Phone required'
    else if (addressForm.phone.replace(/\D/g, '').length < 9) err.phone = 'Invalid phone number'
    if (!addressForm.addressLine.trim()) err.addressLine = 'Address required'
    if (!addressForm.city.trim()) err.city = 'City required'
    if (!addressForm.region.trim()) err.region = 'Region required'
    setAddressErrors(err)
    return Object.keys(err).length === 0
  }

  const handleSaveAddress = async () => {
    if (!validateAddress()) {
      toast.error('Fix highlighted fields')
      return
    }
    setAddressSaving(true)
    try {
      if (editingAddressId) {
        const res = await fetch(`/api/user/addresses/${editingAddressId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(addressForm)
        })
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
            ; toast.error(data?.message || 'Update failed')
        } else {
          setAddresses(prev => prev.map(a => a.id === editingAddressId ? { ...a, ...addressForm, id: editingAddressId } : a))
          toast.success('Address updated')
          setAddressModalOpen(false)
        }
      } else {
        const res = await fetch('/api/user/addresses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(addressForm)
        })
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
            ; toast.error(data?.message || 'Creation failed')
        } else {
          const data = await res.json().catch(() => ({}))
          const created: Address = data?.address ?? { id: crypto.randomUUID(), ...addressForm }
          setAddresses(prev => {
            const cleaned = addressForm.isDefault ? prev.map(a => ({ ...a, isDefault: false })) : prev
            return [...cleaned, created]
          })
          toast.success('Address added')
          setAddressModalOpen(false)
        }
      }
    } catch {
      toast.error('Network error')
    } finally {
      setAddressSaving(false)
    }
  }

  const handleDeleteAddress = async (id: string) => {
    if (!confirm('Delete this address?')) return
    try {
      const res = await fetch(`/api/user/addresses/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setAddresses(prev => prev.filter(a => a.id !== id))
        toast.success('Address deleted')
      } else {
        const data = await res.json().catch(() => ({}))
          ; toast.error(data?.message || 'Delete failed')
      }
    } catch {
      toast.error('Delete failed')
    }
  }

  const handleSetDefault = async (id: string) => {
    try {
      const res = await fetch(`/api/user/addresses/${id}/default`, { method: 'POST' })
      if (!res.ok) {
        toast.error('Server did not confirm, applying locally')
      }
    } catch {
      // ignore network error, still set locally
    } finally {
      setAddresses(prev => prev.map(a => ({ ...a, isDefault: a.id === id })))
      toast.success('Default address updated')
    }
  }

  /**
   * Render Blocks
   */
  const OverviewTab = (
    <div className="space-y-6">
      <SectionCard
        title="Account Snapshot"
        icon={UserIcon}
        description="Quick glance at your account status & frequently used info"
      >
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20">
            <p className="text-xs uppercase font-medium tracking-wide text-primary mb-1">Addresses</p>
            <p className="text-2xl font-semibold">{addresses.length}</p>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-100/30 via-emerald-50 to-transparent border border-emerald-200">
            <p className="text-xs uppercase font-medium tracking-wide text-emerald-700 mb-1">Default Address</p>
            <p className="text-sm font-medium line-clamp-2">
              {addresses.find(a => a.isDefault)?.label || 'Not set'}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-100/30 via-indigo-50 to-transparent border border-indigo-200">
            <p className="text-xs uppercase font-medium tracking-wide text-indigo-700 mb-1">Payment Methods</p>
            <p className="text-sm font-medium">Manage in payments tab</p>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Security Notice"
        icon={Shield}
        description="Keep your contact information up to date so we can reach you about orders."
      >
        <ul className="text-sm text-muted-foreground space-y-2">
          <li className="flex gap-2">
            <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
            We never share your personal info with third parties without consent.
          </li>
          <li className="flex gap-2">
            <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
            Add accurate Ghana delivery addresses to avoid delays.
          </li>
          <li className="flex gap-2">
            <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
            Set a default address for a faster checkout flow.
          </li>
        </ul>
      </SectionCard>
    </div>
  )

  const ProfileTab = (
    <div className="space-y-6">
      <SectionCard
        title="Personal Information"
        icon={UserIcon}
        description="Update the details linked to your account"
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveTab('addresses')}
            className="hidden sm:inline-flex"
          >
            Manage Addresses
          </Button>
        }
      >
        <form onSubmit={handleProfileSave} className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary/20 via-primary/10 to-white border border-primary/30 overflow-hidden flex items-center justify-center">
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt="Avatar"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <UserIcon className="w-12 h-12 text-primary/70" />
                  )}
                </div>
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                  <button
                    type="button"
                    onClick={handleAvatarPick}
                    className="px-3 py-1.5 rounded-full bg-primary text-white text-[11px] font-medium shadow focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-60"
                    disabled={avatarLoading}
                  >
                    {avatarLoading ? 'Uploading...' : isCustomAvatar ? 'Change' : (avatarUrl ? 'Change' : 'Upload')}
                  </button>
                  {isCustomAvatar && providerAvatar && (
                    <button
                      type="button"
                      onClick={handleRevertAvatar}
                      className="px-3 py-1.5 rounded-full bg-muted text-foreground text-[11px] font-medium shadow focus:outline-none focus:ring-2 focus:ring-primary/30 hover:bg-muted/70"
                    >
                      Revert
                    </button>
                  )}
                </div>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>
              <p className="text-[11px] text-muted-foreground max-w-[8rem] text-center">
                PNG/JPG under 2MB
              </p>
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-xs font-medium flex items-center gap-1">
                  <UserIcon className="w-3.5 h-3.5 text-primary" /> Full Name
                </label>
                <input
                  value={profile.name}
                  onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                  className={`w-full px-4 py-3 rounded-xl border bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm ${profileErrors.name ? 'border-red-300 bg-red-50' : 'border-input'}`}
                  placeholder="Your full name"
                  aria-invalid={!!profileErrors.name}
                />
                {profileErrors.name && (
                  <p className="text-[11px] text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {profileErrors.name}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-primary" /> Email
                </label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={e => setProfile(p => ({ ...p, email: e.target.value }))}
                  className={`w-full px-4 py-3 rounded-xl border bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm ${profileErrors.email ? 'border-red-300 bg-red-50' : 'border-input'}`}
                  placeholder="you@example.com"
                  aria-invalid={!!profileErrors.email}
                />
                {profileErrors.email && (
                  <p className="text-[11px] text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {profileErrors.email}
                  </p>
                )}
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-medium flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-primary" /> Phone
                </label>
                <input
                  value={profile.phoneNumber}
                  onChange={e => setProfile(p => ({ ...p, phoneNumber: e.target.value }))}
                  className={`w-full px-4 py-3 rounded-xl border bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm ${profileErrors.phoneNumber ? 'border-red-300 bg-red-50' : 'border-input'}`}
                  placeholder="0XXX XXX XXX"
                  aria-invalid={!!profileErrors.phoneNumber}
                />
                {profileErrors.phoneNumber && (
                  <p className="text-[11px] text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {profileErrors.phoneNumber}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div>
            <Button
              type="submit"
              disabled={savingProfile || avatarLoading}
              className="h-12 px-8 rounded-xl font-semibold"
            >
              {savingProfile ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Save className="w-4 h-4" /> Save Changes
                </span>
              )}
            </Button>
          </div>
        </form>
      </SectionCard>
    </div>
  )

  const AddressesTab = (
    <div className="space-y-6">
      <SectionCard
        title="Saved Addresses"
        icon={MapPin}
        description="Manage delivery destinations within Ghana"
        actions={
          <Button size="sm" className="rounded-lg" onClick={openAddAddress}>
            <Plus className="w-4 h-4 mr-1" /> Add
          </Button>
        }
      >
        <div className="mb-4 flex flex-col md:flex-row gap-3 md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={addressSearch}
              onChange={e => setAddressSearch(e.target.value)}
              placeholder="Search label, city or region..."
              className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-input bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
            />
          </div>
          <div className="flex gap-2 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {addresses.length} total</span>
            <span className="flex items-center gap-1"><Star className="w-3 h-3" /> {addresses.filter(a => a.isDefault).length} default</span>
          </div>
        </div>

        {addressesLoading ? (
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="h-20 rounded-xl bg-muted/40 animate-pulse" />
            ))}
          </div>
        ) : filteredAddresses.length > 0 ? (
          <ul className="space-y-3">
            {filteredAddresses.map(a => (
              <li
                key={a.id}
                className={`relative p-4 rounded-xl border-2 transition group bg-white ${a.isDefault ? 'border-primary bg-primary/5' : 'border-border/30 hover:border-primary/40'
                  }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold text-sm">{a.label}</span>
                      {a.isDefault && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary text-white flex items-center gap-1">
                          <Check className="w-3 h-3" /> Default
                        </span>
                      )}
                      {a.relationship && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted flex items-center gap-1">
                          <Tag className="w-3 h-3" /> {a.relationship}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {a.recipientName} • {a.phone}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {a.addressLine}, {a.city}, {a.region}
                    </p>
                    {a.notes && (
                      <p className="text-[11px] text-muted-foreground mt-1 italic">
                        “{a.notes}”
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1 flex-wrap">
                    {!a.isDefault && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 rounded-lg text-[11px]"
                        onClick={() => handleSetDefault(a.id)}
                      >
                        Set Default
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 rounded-lg text-[11px]"
                      onClick={() => openEditAddress(a)}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 rounded-lg text-[11px] text-red-600 hover:bg-red-50"
                      onClick={() => handleDeleteAddress(a.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-10">
            <div className="w-16 h-16 rounded-full bg-muted mx-auto flex items-center justify-center mb-4">
              <MapPin className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-base font-semibold mb-1">No Addresses</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Add at least one delivery address to speed up checkout.
            </p>
            <Button onClick={openAddAddress}>
              <Plus className="w-4 h-4 mr-2" /> Add Your First Address
            </Button>
          </div>
        )}
      </SectionCard>
    </div>
  )

  const PaymentsTab = (
    <div className="space-y-6">
      <SectionCard
        title="Payment Methods"
        icon={CreditCard}
        description="Securely manage how you pay for orders"
      >
        <div className="mb-4 text-xs text-muted-foreground flex flex-wrap gap-4">
          <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> Encrypted storage</span>
          <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> Verified provider</span>
          <span className="flex items-center gap-1"><Globe2 className="w-3 h-3" /> International friendly</span>
        </div>
        <PaymentMethodManager />
      </SectionCard>
    </div>
  )

  if (pageLoading) {
    return <FullScreenLoading label="Loading your account..." />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header / Hero */}
        <div className="flex flex-col lg:flex-row lg:items-start gap-8 mb-10">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="h-10 w-10 p-0 rounded-xl"
                aria-label="Go back"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Account Settings</h1>
                <p className="text-sm text-muted-foreground">
                  Manage and optimize your Singlespine experience
                </p>
              </div>
            </div>

            <MobileTabs current={activeTab} onChange={id => setActiveTab(id)} />

            <div className="grid lg:grid-cols-[240px_1fr] gap-8">
              <div>
                <DesktopNav
                  current={activeTab}
                  onChange={id => setActiveTab(id)}
                  counts={{
                    overview: 0,
                    profile: 0,
                    addresses: addresses.length,
                    payments: 0
                  }}
                />
              </div>
              <div className="space-y-10">
                {activeTab === 'overview' && OverviewTab /* overview section */}
                {activeTab === 'profile' && ProfileTab /* profile section */}
                {activeTab === 'addresses' && AddressesTab /* addresses section */}
                {activeTab === 'payments' && PaymentsTab /* payments section */}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Address Modal */}
      {addressModalOpen && (
        <div
          aria-modal="true"
          role="dialog"
          className="fixed inset-0 z-50 flex items-start justify-center px-4 py-10 overflow-y-auto"
        >
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setAddressModalOpen(false)}
          />
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-border/40 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-border/40 bg-gradient-to-r from-primary/5 to-transparent">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">
                    {editingAddressId ? 'Edit Address' : 'Add Address'}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {editingAddressId
                      ? 'Modify the existing delivery information'
                      : 'Provide full and accurate delivery details'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAddressModalOpen(false)}
                className="p-2 rounded-lg hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-medium">Label</label>
                  <input
                    value={addressForm.label}
                    onChange={e => {
                      setAddressForm(f => ({ ...f, label: e.target.value }))
                      if (addressErrors.label) setAddressErrors(er => ({ ...er, label: '' }))
                    }}
                    className={`w-full px-4 py-3 rounded-xl border bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm ${addressErrors.label ? 'border-red-300 bg-red-50' : 'border-input'}`}
                    placeholder="Home, Mom, Office..."
                    aria-invalid={!!addressErrors.label}
                  />
                  {addressErrors.label && <p className="text-[11px] text-red-600">{addressErrors.label}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium">Recipient Name</label>
                  <input
                    value={addressForm.recipientName}
                    onChange={e => {
                      setAddressForm(f => ({ ...f, recipientName: e.target.value }))
                      if (addressErrors.recipientName) setAddressErrors(er => ({ ...er, recipientName: '' }))
                    }}
                    className={`w-full px-4 py-3 rounded-xl border bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm ${addressErrors.recipientName ? 'border-red-300 bg-red-50' : 'border-input'}`}
                    placeholder="e.g., Ama Serwaa"
                    aria-invalid={!!addressErrors.recipientName}
                  />
                  {addressErrors.recipientName && <p className="text-[11px] text-red-600">{addressErrors.recipientName}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium">Phone</label>
                  <input
                    value={addressForm.phone}
                    onChange={e => {
                      setAddressForm(f => ({ ...f, phone: e.target.value }))
                      if (addressErrors.phone) setAddressErrors(er => ({ ...er, phone: '' }))
                    }}
                    className={`w-full px-4 py-3 rounded-xl border bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm ${addressErrors.phone ? 'border-red-300 bg-red-50' : 'border-input'}`}
                    placeholder="0XXX XXX XXX"
                    aria-invalid={!!addressErrors.phone}
                  />
                  {addressErrors.phone && <p className="text-[11px] text-red-600">{addressErrors.phone}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium">Region</label>
                  <select
                    value={addressForm.region}
                    onChange={e => {
                      setAddressForm(f => ({ ...f, region: e.target.value }))
                      if (addressErrors.region) setAddressErrors(er => ({ ...er, region: '' }))
                    }}
                    className={`w-full px-4 py-3 rounded-xl border bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm ${addressErrors.region ? 'border-red-300 bg-red-50' : 'border-input'}`}
                    aria-invalid={!!addressErrors.region}
                  >
                    <option value="">Select region</option>
                    {regions.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                  {addressErrors.region && <p className="text-[11px] text-red-600">{addressErrors.region}</p>}
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-medium">Street / Address</label>
                  <textarea
                    value={addressForm.addressLine}
                    onChange={e => {
                      setAddressForm(f => ({ ...f, addressLine: e.target.value }))
                      if (addressErrors.addressLine) setAddressErrors(er => ({ ...er, addressLine: '' }))
                    }}
                    rows={3}
                    className={`w-full px-4 py-3 rounded-xl border bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm resize-none ${addressErrors.addressLine ? 'border-red-300 bg-red-50' : 'border-input'}`}
                    placeholder="House number, street, area, landmark..."
                    aria-invalid={!!addressErrors.addressLine}
                  />
                  {addressErrors.addressLine && <p className="text-[11px] text-red-600">{addressErrors.addressLine}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium">City</label>
                  <input
                    value={addressForm.city}
                    onChange={e => {
                      setAddressForm(f => ({ ...f, city: e.target.value }))
                      if (addressErrors.city) setAddressErrors(er => ({ ...er, city: '' }))
                    }}
                    className={`w-full px-4 py-3 rounded-xl border bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm ${addressErrors.city ? 'border-red-300 bg-red-50' : 'border-input'}`}
                    placeholder="Accra, Kumasi..."
                    aria-invalid={!!addressErrors.city}
                  />
                  {addressErrors.city && <p className="text-[11px] text-red-600">{addressErrors.city}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium">Relationship</label>
                  <select
                    value={addressForm.relationship}
                    onChange={e => setAddressForm(f => ({ ...f, relationship: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm border-input"
                  >
                    <option value="">Select relationship</option>
                    {['Mother', 'Father', 'Sister', 'Brother', 'Grandmother', 'Grandfather', 'Aunt', 'Uncle', 'Cousin', 'Friend', 'Spouse', 'Child', 'Other'].map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium">Additional Notes</label>
                  <input
                    value={addressForm.notes || ''}
                    onChange={e => setAddressForm(f => ({ ...f, notes: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm border-input"
                    placeholder="Delivery instructions, timing, etc."
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="inline-flex items-center gap-2 text-xs font-medium">
                    <input
                      type="checkbox"
                      checked={!!addressForm.isDefault}
                      onChange={e => setAddressForm(f => ({ ...f, isDefault: e.target.checked }))}
                    />
                    Set as default address
                  </label>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-border/40 flex items-center justify-end gap-3">
              <Button
                variant="ghost"
                onClick={() => setAddressModalOpen(false)}
                className="rounded-lg"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveAddress}
                disabled={addressSaving}
                className="rounded-lg font-semibold"
              >
                {addressSaving ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Save className="w-4 h-4" /> Save Address
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
