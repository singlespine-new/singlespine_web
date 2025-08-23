'use client'

import React, { useEffect, useMemo, useState } from 'react'
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
  Home,
  Building2,
  UserRound,
  Star,
  X,
  CreditCard,
  ArrowLeft
} from 'lucide-react'

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
  notes?: string
  isDefault?: boolean
}

export default function ProfilePage() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useRequireAuth()
  const { user } = useAuth()

  // Tab state
  const [activeTab, setActiveTab] = useState<'profile' | 'addresses' | 'payments'>('profile')

  // Profile state
  const [profileLoading, setProfileLoading] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [profile, setProfile] = useState<ProfileForm>({
    name: '',
    email: '',
    phoneNumber: '',
  })
  const [profileErrors, setProfileErrors] = useState<Record<keyof ProfileForm, string>>({
    name: '',
    email: '',
    phoneNumber: '',
  })

  // Addresses state
  const [addresses, setAddresses] = useState<Address[]>([])
  const [addressesLoading, setAddressesLoading] = useState(true)
  const [addressModalOpen, setAddressModalOpen] = useState(false)
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null)
  const [addressSaving, setAddressSaving] = useState(false)
  const [addressErrors, setAddressErrors] = useState<Record<string, string>>({})
  const [addressForm, setAddressForm] = useState<Omit<Address, 'id'>>({
    label: '',
    recipientName: '',
    phone: '',
    addressLine: '',
    city: '',
    region: '',
    notes: '',
    isDefault: false,
  })

  const pageLoading = isLoading || profileLoading

  // Pre-fill profile from session and fetch stored profile + addresses
  useEffect(() => {
    if (!isAuthenticated) return
    let active = true

    const load = async () => {
      try {
        setProfileLoading(true)

        // Pre-fill from session while we fetch
        if (user) {
          setProfile(prev => ({
            name: prev.name || user.name || '',
            email: prev.email || user.email || '',
            phoneNumber: prev.phoneNumber || (user as any).phoneNumber || '',
          }))
        }

        // Fetch profile and addresses
        const [profileRes, addressesRes] = await Promise.allSettled([
          fetch('/api/user/profile'),
          fetch('/api/user/addresses')
        ])

        if (profileRes.status === 'fulfilled' && profileRes.value.ok) {
          const profileData = await profileRes.value.json()
          if (active && profileData.profile) {
            setProfile({
              name: profileData.profile.name ?? '',
              email: profileData.profile.email ?? '',
              phoneNumber: profileData.profile.phoneNumber ?? '',
            })
          }
        }

        if (addressesRes.status === 'fulfilled' && addressesRes.value.ok) {
          const addressesData = await addressesRes.value.json()
          if (active && addressesData.addresses) {
            setAddresses(addressesData.addresses)
          }
        }
      } catch (error) {
        console.error('Error loading profile data:', error)
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

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingProfile(true)
    setProfileErrors({ name: '', email: '', phoneNumber: '' })

    try {
      const errors: Record<keyof ProfileForm, string> = { name: '', email: '', phoneNumber: '' }

      if (!profile.name.trim()) errors.name = 'Name is required'
      if (!profile.email.trim()) errors.email = 'Email is required'
      else if (!/\S+@\S+\.\S+/.test(profile.email)) errors.email = 'Please enter a valid email'

      if (Object.values(errors).some(error => error)) {
        setProfileErrors(errors)
        return
      }

      const response = await fetch('/api/user/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(error || 'Failed to update profile')
      }

      toast.success('Profile updated successfully!')
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update profile')
    } finally {
      setSavingProfile(false)
    }
  }

  const openAddAddress = () => {
    setEditingAddressId(null)
    setAddressForm({
      label: '',
      recipientName: '',
      phone: '',
      addressLine: '',
      city: '',
      region: '',
      notes: '',
      isDefault: addresses.length === 0,
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
      notes: address.notes || '',
      isDefault: !!address.isDefault,
    })
    setAddressErrors({})
    setAddressModalOpen(true)
  }

  const validateAddress = (): boolean => {
    const err: Record<string, string> = {}
    if (!addressForm.label.trim()) err.label = 'Please enter a label (e.g., Home, Mom, Office)'
    if (!addressForm.recipientName.trim()) err.recipientName = 'Please enter the recipient\'s name'
    if (!addressForm.phone.trim()) err.phone = 'Please enter a phone number'
    else if (addressForm.phone.replace(/\D/g, '').length < 10) err.phone = 'Enter a valid phone number'
    if (!addressForm.addressLine.trim()) err.addressLine = 'Please enter the full address'
    if (!addressForm.city.trim()) err.city = 'Please enter the city'
    if (!addressForm.region.trim()) err.region = 'Please select the region'
    setAddressErrors(err)
    return Object.keys(err).length === 0
  }

  const handleSaveAddress = async () => {
    if (!validateAddress()) {
      toast.error('Please fix the highlighted fields')
      return
    }

    setAddressSaving(true)
    try {
      if (editingAddressId) {
        const res = await fetch(`/api/user/addresses/${editingAddressId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(addressForm),
        })
        if (res.ok) {
          setAddresses(prev => prev.map(a => a.id === editingAddressId ? { ...a, ...addressForm, id: editingAddressId } : a))
          toast.success('Address updated')
          setAddressModalOpen(false)
        } else {
          const data = await res.json()
          toast.error(data?.message || 'Failed to update address')
        }
      } else {
        const res = await fetch('/api/user/addresses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(addressForm),
        })
        if (res.ok) {
          const data = await res.json()
          const created: Address = data?.address ?? {
            id: crypto.randomUUID(),
            ...addressForm,
          }
          setAddresses(prev => {
            const next = addressForm.isDefault ? prev.map(a => ({ ...a, isDefault: false })) : prev.slice()
            return [...next, created]
          })
          toast.success('Address added')
          setAddressModalOpen(false)
        } else {
          const data = await res.json()
          toast.error(data?.message || 'Failed to add address')
        }
      }
    } catch (e) {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setAddressSaving(false)
    }
  }

  const handleDeleteAddress = async (id: string) => {
    const confirm = window.confirm('Delete this address? Note: Addresses that have been used in orders cannot be deleted to preserve order history.')
    if (!confirm) return
    try {
      const res = await fetch(`/api/user/addresses/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setAddresses(prev => prev.filter(a => a.id !== id))
        toast.success('Address deleted')
      } else {
        const data = await res.json()

        // Handle specific error for addresses used in orders
        if (data?.error === 'ADDRESS_IN_USE') {
          toast.error('Cannot delete this address because it has been used in your orders. Your order history needs this address information.')
        } else {
          toast.error(data?.message || 'Failed to delete address')
        }
      }
    } catch {
      toast.error('Failed to delete address')
    }
  }

  const handleSetDefault = async (id: string) => {
    try {
      const res = await fetch(`/api/user/addresses/${id}/default`, { method: 'POST' })
      if (res.ok) {
        setAddresses(prev => prev.map(a => ({ ...a, isDefault: a.id === id })))
        toast.success('Default address updated')
      } else {
        setAddresses(prev => prev.map(a => ({ ...a, isDefault: a.id === id })))
        toast.success('Default address updated (local)')
      }
    } catch {
      setAddresses(prev => prev.map(a => ({ ...a, isDefault: a.id === id })))
      toast.success('Default address updated (local)')
    }
  }

  const regions = useMemo(
    () => [
      'Greater Accra',
      'Ashanti',
      'Western',
      'Central',
      'Eastern',
      'Northern',
      'Upper East',
      'Upper West',
      'Volta',
      'Brong Ahafo',
      'Savannah',
      'Bono East',
      'Ahafo',
      'Oti',
      'North East',
      'Western North',
    ],
    []
  )

  const renderProfileTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-border/20 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary/10 rounded-xl">
            <UserIcon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Personal Information</h2>
            <p className="text-sm text-muted-foreground">Update your account details</p>
          </div>
        </div>

        <form onSubmit={handleProfileSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 border border-input rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                placeholder="Your full name"
              />
              {profileErrors.name && (
                <p className="text-xs text-red-600">{profileErrors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Email Address</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-4 py-3 border border-input rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                placeholder="your@email.com"
              />
              {profileErrors.email && (
                <p className="text-xs text-red-600">{profileErrors.email}</p>
              )}
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-medium">Phone Number</label>
              <input
                type="tel"
                value={profile.phoneNumber}
                onChange={(e) => setProfile(prev => ({ ...prev, phoneNumber: e.target.value }))}
                className="w-full px-4 py-3 border border-input rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                placeholder="0XXX XXX XXX"
              />
              {profileErrors.phoneNumber && (
                <p className="text-xs text-red-600">{profileErrors.phoneNumber}</p>
              )}
            </div>
          </div>

          <Button
            type="submit"
            disabled={savingProfile}
            className="w-full md:w-auto h-12 rounded-xl"
          >
            {savingProfile ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                Save Changes
              </div>
            )}
          </Button>
        </form>
      </div>
    </div>
  )

  const renderAddressesTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-border/20 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Saved Addresses</h2>
              <p className="text-sm text-muted-foreground">Manage your delivery addresses</p>
            </div>
          </div>
          <Button
            onClick={openAddAddress}
            className="h-10 rounded-xl"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Address
          </Button>
        </div>

        {addressesLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-20 bg-muted/50 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : addresses.length > 0 ? (
          <div className="space-y-3">
            {addresses.map((address) => (
              <div key={address.id} className="p-4 border border-border/30 rounded-xl">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{address.label}</h3>
                      {address.isDefault && (
                        <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{address.recipientName}</p>
                    <p className="text-sm text-muted-foreground">{address.addressLine}</p>
                    <p className="text-sm text-muted-foreground">{address.city}, {address.region}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" className="p-2" onClick={() => openEditAddress(address)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="p-2 text-red-600" onClick={() => handleDeleteAddress(address.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold mb-2">No Addresses Added</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Add delivery addresses for faster checkout
            </p>
            <Button onClick={openAddAddress} className="h-10 rounded-xl">
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Address
            </Button>
          </div>
        )}
      </div>
    </div>
  )

  const renderPaymentsTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-border/20 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary/10 rounded-xl">
            <CreditCard className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Payment Methods</h2>
            <p className="text-sm text-muted-foreground">Manage your payment options for faster checkout</p>
          </div>
        </div>

        <PaymentMethodManager />
      </div>
    </div>
  )

  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="p-2 h-auto rounded-xl"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Account Settings</h1>
              <p className="text-muted-foreground">Manage your account preferences</p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-muted/20 p-1 rounded-xl">
            {[
              { id: 'profile', label: 'Profile', icon: UserIcon },
              { id: 'addresses', label: 'Addresses', icon: MapPin },
              { id: 'payments', label: 'Payments', icon: CreditCard }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === id
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'profile' && renderProfileTab()}
        {activeTab === 'addresses' && renderAddressesTab()}
        {activeTab === 'payments' && renderPaymentsTab()}
      </div>

      {/* Address Modal */}
      {addressModalOpen && (
        <div aria-modal="true" role="dialog" className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setAddressModalOpen(false)} />
          <div className="absolute inset-x-0 top-[10%] mx-auto w-[95%] max-w-2xl">
            <div className="bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">
                      {editingAddressId ? 'Edit Address' : 'Add New Address'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Used during checkout and delivery coordination
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setAddressModalOpen(false)}
                  className="p-2 rounded hover:bg-muted"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="px-6 py-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Label</label>
                    <input
                      type="text"
                      value={addressForm.label}
                      onChange={(e) => {
                        setAddressForm(prev => ({ ...prev, label: e.target.value }))
                        if (addressErrors.label) setAddressErrors(prev => ({ ...prev, label: '' }))
                      }}
                      className="w-full px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
                      placeholder="Home, Work, Mom, etc."
                      aria-invalid={!!addressErrors.label}
                    />
                    {addressErrors.label && <p className="mt-1 text-xs text-red-600">{addressErrors.label}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Recipient Name</label>
                    <input
                      type="text"
                      value={addressForm.recipientName}
                      onChange={(e) => {
                        setAddressForm(prev => ({ ...prev, recipientName: e.target.value }))
                        if (addressErrors.recipientName) setAddressErrors(prev => ({ ...prev, recipientName: '' }))
                      }}
                      className="w-full px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
                      placeholder="e.g., Ama Asante"
                      aria-invalid={!!addressErrors.recipientName}
                    />
                    {addressErrors.recipientName && <p className="mt-1 text-xs text-red-600">{addressErrors.recipientName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Phone</label>
                    <input
                      type="tel"
                      inputMode="tel"
                      value={addressForm.phone}
                      onChange={(e) => {
                        setAddressForm(prev => ({ ...prev, phone: e.target.value }))
                        if (addressErrors.phone) setAddressErrors(prev => ({ ...prev, phone: '' }))
                      }}
                      className="w-full px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
                      placeholder="0XXX XXX XXX"
                      aria-invalid={!!addressErrors.phone}
                    />
                    {addressErrors.phone && <p className="mt-1 text-xs text-red-600">{addressErrors.phone}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Region</label>
                    <select
                      value={addressForm.region}
                      onChange={(e) => {
                        setAddressForm(prev => ({ ...prev, region: e.target.value }))
                        if (addressErrors.region) setAddressErrors(prev => ({ ...prev, region: '' }))
                      }}
                      className="w-full px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
                      aria-invalid={!!addressErrors.region}
                    >
                      <option value="">Select Region</option>
                      {regions.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                    {addressErrors.region && <p className="mt-1 text-xs text-red-600">{addressErrors.region}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-foreground mb-2">Street Address</label>
                    <textarea
                      value={addressForm.addressLine}
                      onChange={(e) => {
                        setAddressForm(prev => ({ ...prev, addressLine: e.target.value }))
                        if (addressErrors.addressLine) setAddressErrors(prev => ({ ...prev, addressLine: '' }))
                      }}
                      rows={3}
                      className="w-full px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
                      placeholder="House number, street name, landmark, etc."
                      aria-invalid={!!addressErrors.addressLine}
                    />
                    {addressErrors.addressLine && <p className="mt-1 text-xs text-red-600">{addressErrors.addressLine}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">City</label>
                    <input
                      type="text"
                      value={addressForm.city}
                      onChange={(e) => {
                        setAddressForm(prev => ({ ...prev, city: e.target.value }))
                        if (addressErrors.city) setAddressErrors(prev => ({ ...prev, city: '' }))
                      }}
                      className="w-full px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
                      placeholder="e.g., Accra, Kumasi"
                      aria-invalid={!!addressErrors.city}
                    />
                    {addressErrors.city && <p className="mt-1 text-xs text-red-600">{addressErrors.city}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Notes (optional)</label>
                    <input
                      type="text"
                      value={addressForm.notes ?? ''}
                      onChange={(e) => setAddressForm(prev => ({ ...prev, notes: e.target.value }))}
                      className="w-full px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
                      placeholder="Delivery instructions, recipient's schedule, etc."
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="inline-flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={!!addressForm.isDefault}
                      onChange={(e) => setAddressForm(prev => ({ ...prev, isDefault: e.target.checked }))}
                    />
                    Set as default address
                  </label>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-3">
                <Button variant="ghost" onClick={() => setAddressModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveAddress} disabled={addressSaving} className="font-semibold">
                  {addressSaving ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Save className="w-4 h-4" />
                      Save Address
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
