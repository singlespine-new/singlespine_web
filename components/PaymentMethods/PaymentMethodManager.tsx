'use client'

import * as React from 'react'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { UIIcon } from '@/components/ui/icon'

interface IconAdapterProps extends React.SVGProps<SVGSVGElement> {
  size?: number
}

const CreditCard: React.FC<IconAdapterProps> = ({ size = 20, ...rest }) => (
  <UIIcon name="credit-card" size={size} {...rest} />
)
const Plus: React.FC<IconAdapterProps> = ({ size = 20, ...rest }) => (
  <UIIcon name="plus" size={size} {...rest} />
)
const Trash2: React.FC<IconAdapterProps> = ({ size = 20, ...rest }) => (
  <UIIcon name="trash" size={size} {...rest} />
)
const Shield: React.FC<IconAdapterProps> = ({ size = 20, ...rest }) => (
  <UIIcon name="shield" size={size} {...rest} />
)
const Smartphone: React.FC<IconAdapterProps> = ({ size = 20, ...rest }) => (
  <UIIcon name="smartphone" size={size} {...rest} />
)
const Building2: React.FC<IconAdapterProps> = ({ size = 20, ...rest }) => (
  <UIIcon name="building-2" size={size} {...rest} />
)
const Building: React.FC<IconAdapterProps> = ({ size = 20, ...rest }) => (
  <UIIcon name="building" size={size} {...rest} />
)
const Banknote: React.FC<IconAdapterProps> = ({ size = 20, ...rest }) => (
  <UIIcon name="banknote" size={size} {...rest} />
)
const CheckCircle: React.FC<IconAdapterProps> = ({ size = 20, ...rest }) => (
  <UIIcon name="success" size={size} {...rest} />
)
const AlertCircle: React.FC<IconAdapterProps> = ({ size = 20, ...rest }) => (
  <UIIcon name="error" size={size} {...rest} />
)
// Removed unused Edit3 icon (previous placeholder for future edit actions)

import toast from '@/components/ui/toast'

interface PaymentMethod {
  id: string
  type: 'CARD' | 'MOBILE_MONEY' | 'BANK_TRANSFER' | 'CASH_ON_DELIVERY'
  displayName: string
  nickname?: string
  isDefault: boolean
  cardLast4?: string
  cardBrand?: string
  cardExpiryMonth?: number
  cardExpiryYear?: number
  momoProvider?: string
  bankName?: string
  accountHolderName?: string
  createdAt: string
}

interface PaymentMethodManagerProps {
  onPaymentMethodSelectAction?: (paymentMethod: PaymentMethod) => void
  selectedPaymentMethodId?: string
  showAddButton?: boolean
  className?: string
}

export default function PaymentMethodManager({
  onPaymentMethodSelectAction,
  selectedPaymentMethodId,
  showAddButton = true,
  className = ''
}: PaymentMethodManagerProps) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null)

  useEffect(() => {
    fetchPaymentMethods()
  }, [])

  useEffect(() => {
    if (selectedPaymentMethodId) {
      setSelectedMethod(selectedPaymentMethodId)
    }
  }, [selectedPaymentMethodId])

  const fetchPaymentMethods = async () => {
    try {
      const response = await fetch('/api/user/payment-methods')
      if (!response.ok) throw new Error('Failed to fetch payment methods')

      const data = await response.json()
      setPaymentMethods(data.paymentMethods || [])
    } catch (error) {
      console.error('Error fetching payment methods:', error)
      toast.error('Failed to load payment methods')
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentMethodSelect = (paymentMethod: PaymentMethod) => {
    setSelectedMethod(paymentMethod.id)
    onPaymentMethodSelectAction?.(paymentMethod)
  }

  const handleDeletePaymentMethod = async (paymentMethodId: string) => {
    if (!confirm('Are you sure you want to remove this payment method?')) return

    try {
      const response = await fetch(`/api/user/payment-methods?id=${paymentMethodId}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete payment method')

      setPaymentMethods(prev => prev.filter(pm => pm.id !== paymentMethodId))
      if (selectedMethod === paymentMethodId) {
        setSelectedMethod(null)
      }
      toast.success('Payment method removed successfully')
    } catch (error) {
      console.error('Error deleting payment method:', error)
      toast.error('Failed to remove payment method')
    }
  }

  const getPaymentMethodIcon = (type: string) => {
    switch (type) {
      case 'CARD':
        return <CreditCard className="w-5 h-5" />
      case 'MOBILE_MONEY':
        return <Smartphone className="w-5 h-5" />
      case 'BANK_TRANSFER':
        return <Building className="w-5 h-5" />
      case 'CASH_ON_DELIVERY':
        return <Banknote className="w-5 h-5" />
      default:
        return <CreditCard className="w-5 h-5" />
    }
  }

  const getPaymentMethodTitle = (paymentMethod: PaymentMethod) => {
    return paymentMethod.displayName || 'Payment Method'
  }

  const getPaymentMethodSubtitle = (paymentMethod: PaymentMethod) => {
    if (paymentMethod.nickname) {
      return paymentMethod.nickname
    }

    switch (paymentMethod.type) {
      case 'CARD':
        return paymentMethod.cardExpiryMonth && paymentMethod.cardExpiryYear
          ? `Expires ${paymentMethod.cardExpiryMonth.toString().padStart(2, '0')}/${paymentMethod.cardExpiryYear}`
          : 'Credit/Debit Card'
      case 'MOBILE_MONEY':
        return paymentMethod.momoProvider || 'Mobile Money'
      case 'BANK_TRANSFER':
        return paymentMethod.accountHolderName || 'Bank Transfer'
      case 'CASH_ON_DELIVERY':
        return 'Pay when you receive your order'
      default:
        return ''
    }
  }

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="animate-pulse space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-16 bg-muted/50 rounded-xl"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Payment Methods List */}
      {paymentMethods.length > 0 ? (
        <div className="space-y-3">
          {paymentMethods.map((paymentMethod) => (
            <div
              key={paymentMethod.id}
              onClick={() => handlePaymentMethodSelect(paymentMethod)}
              className={`p-4 border-2 rounded-xl cursor-pointer transition-all hover:shadow-md ${selectedMethod === paymentMethod.id
                ? 'border-primary bg-primary/5 shadow-sm'
                : 'border-border/30 hover:border-border/60'
                }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${paymentMethod.type === 'CARD' ? 'bg-blue-50 text-blue-600' :
                    paymentMethod.type === 'MOBILE_MONEY' ? 'bg-green-50 text-green-600' :
                      paymentMethod.type === 'BANK_TRANSFER' ? 'bg-purple-50 text-purple-600' :
                        'bg-orange-50 text-orange-600'
                    }`}>
                    {getPaymentMethodIcon(paymentMethod.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm">
                        {getPaymentMethodTitle(paymentMethod)}
                      </h3>
                      {paymentMethod.isDefault && (
                        <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full font-medium">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {getPaymentMethodSubtitle(paymentMethod)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {selectedMethod === paymentMethod.id && (
                    <CheckCircle className="w-5 h-5 text-primary" />
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeletePaymentMethod(paymentMethod.id)
                    }}
                    className="p-2 h-auto text-muted-foreground hover:text-red-600"
                  >
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
            <CreditCard className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold mb-2">No Payment Methods</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Add a payment method to complete your orders
          </p>
        </div>
      )}

      {/* Add New Payment Method Button */}
      {showAddButton && (
        <Button
          variant="outline"
          onClick={() => setShowAddForm(true)}
          className="w-full h-12 rounded-xl border-dashed"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Payment Method
        </Button>
      )}

      {/* Add Payment Method Form Modal */}
      {showAddForm && (
        <AddPaymentMethodForm
          onClose={() => setShowAddForm(false)}
          onSuccess={(newPaymentMethod) => {
            setPaymentMethods(prev => [...prev, newPaymentMethod])
            setShowAddForm(false)
            toast.success('Payment method added successfully')
          }}
        />
      )}

      {/* Security Notice */}
      <div className="flex items-start gap-3 p-4 bg-muted/20 rounded-xl border border-border/20">
        <Shield className="w-5 h-5 text-green-600 mt-0.5" />
        <div>
          <h4 className="font-medium text-sm mb-1">Secure Payment</h4>
          <p className="text-xs text-muted-foreground">
            Your payment information is encrypted and securely stored. We never store your full card details.
          </p>
        </div>
      </div>
    </div>
  )
}

// Add Payment Method Form Component
interface AddPaymentMethodFormProps {
  onClose: () => void
  onSuccess: (paymentMethod: PaymentMethod) => void
}

function AddPaymentMethodForm({ onClose, onSuccess }: AddPaymentMethodFormProps) {
  const [selectedType, setSelectedType] = useState<'card' | 'mobile_money' | 'bank_transfer'>('card')
  const [formData, setFormData] = useState({
    // Card details
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cardholderName: '',
    cvv: '',
    // Mobile money details
    mobileNumber: '',
    provider: 'MTN',
    // Bank transfer details
    bankName: '',
    accountNumber: '',
    accountName: '',
    isDefault: false
  })
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setErrors({})

    try {
      // Validate form
      const newErrors: Record<string, string> = {}

      if (selectedType === 'card') {
        if (!formData.cardNumber) newErrors.cardNumber = 'Card number is required'
        if (!formData.expiryMonth) newErrors.expiryMonth = 'Expiry month is required'
        if (!formData.expiryYear) newErrors.expiryYear = 'Expiry year is required'
        if (!formData.cardholderName) newErrors.cardholderName = 'Cardholder name is required'
        if (!formData.cvv) newErrors.cvv = 'CVV is required'
      } else if (selectedType === 'mobile_money') {
        if (!formData.mobileNumber) newErrors.mobileNumber = 'Mobile number is required'
        if (!formData.provider) newErrors.provider = 'Provider is required'
      } else if (selectedType === 'bank_transfer') {
        if (!formData.bankName) newErrors.bankName = 'Bank name is required'
        if (!formData.accountNumber) newErrors.accountNumber = 'Account number is required'
        if (!formData.accountName) newErrors.accountName = 'Account name is required'
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors)
        return
      }

      // Prepare payment method details
      let details = {}
      if (selectedType === 'card') {
        details = {
          cardNumber: formData.cardNumber,
          expiryMonth: formData.expiryMonth,
          expiryYear: formData.expiryYear,
          cardholderName: formData.cardholderName,
          brand: 'Visa' // This would be detected from the card number
        }
      } else if (selectedType === 'mobile_money') {
        details = {
          mobileNumber: formData.mobileNumber,
          provider: formData.provider
        }
      } else if (selectedType === 'bank_transfer') {
        details = {
          bankName: formData.bankName,
          accountNumber: formData.accountNumber,
          accountName: formData.accountName
        }
      }

      const response = await fetch('/api/user/payment-methods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: selectedType,
          details,
          isDefault: formData.isDefault
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to add payment method')
      }

      const data = await response.json()
      onSuccess(data.paymentMethod)
    } catch (error) {
      console.error('Error adding payment method:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to add payment method')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Add Payment Method</h2>
          <Button variant="ghost" onClick={onClose} className="p-2">
            ✕
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Payment Type Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Payment Type</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { type: 'card', label: 'Card', icon: CreditCard },
                { type: 'mobile_money', label: 'Mobile Money', icon: Smartphone },
                { type: 'bank_transfer', label: 'Bank', icon: Building2 }
              ].map(({ type, label, icon: Icon }) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSelectedType(type as 'card' | 'mobile_money' | 'bank_transfer')}
                  className={`p-3 border-2 rounded-xl text-center transition-all ${selectedType === type
                    ? 'border-primary bg-primary/5'
                    : 'border-border/30 hover:border-border/60'
                    }`}
                >
                  <Icon className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-xs font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Form Fields based on selected type */}
          {selectedType === 'card' && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Card Number</label>
                <input
                  type="text"
                  value={formData.cardNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, cardNumber: e.target.value }))}
                  className="w-full px-4 py-3 border border-input rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="1234 5678 9012 3456"
                />
                {errors.cardNumber && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.cardNumber}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Expiry Month</label>
                  <select
                    value={formData.expiryMonth}
                    onChange={(e) => setFormData(prev => ({ ...prev, expiryMonth: e.target.value }))}
                    className="w-full px-4 py-3 border border-input rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none"
                  >
                    <option value="">Month</option>
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                        {String(i + 1).padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Expiry Year</label>
                  <select
                    value={formData.expiryYear}
                    onChange={(e) => setFormData(prev => ({ ...prev, expiryYear: e.target.value }))}
                    className="w-full px-4 py-3 border border-input rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none"
                  >
                    <option value="">Year</option>
                    {Array.from({ length: 10 }, (_, i) => {
                      const year = new Date().getFullYear() + i
                      return (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      )
                    })}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Cardholder Name</label>
                <input
                  type="text"
                  value={formData.cardholderName}
                  onChange={(e) => setFormData(prev => ({ ...prev, cardholderName: e.target.value }))}
                  className="w-full px-4 py-3 border border-input rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="text-sm font-medium">CVV</label>
                <input
                  type="text"
                  value={formData.cvv}
                  onChange={(e) => setFormData(prev => ({ ...prev, cvv: e.target.value }))}
                  className="w-full px-4 py-3 border border-input rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="123"
                  maxLength={4}
                />
              </div>
            </div>
          )}

          {selectedType === 'mobile_money' && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Provider</label>
                <select
                  value={formData.provider}
                  onChange={(e) => setFormData(prev => ({ ...prev, provider: e.target.value }))}
                  className="w-full px-4 py-3 border border-input rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none"
                >
                  <option value="MTN">MTN Mobile Money</option>
                  <option value="Vodafone">Vodafone Cash</option>
                  <option value="AirtelTigo">AirtelTigo Money</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Mobile Number</label>
                <input
                  type="tel"
                  value={formData.mobileNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, mobileNumber: e.target.value }))}
                  className="w-full px-4 py-3 border border-input rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="0XXX XXX XXX"
                />
              </div>
            </div>
          )}

          {selectedType === 'bank_transfer' && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Bank Name</label>
                <input
                  type="text"
                  value={formData.bankName}
                  onChange={(e) => setFormData(prev => ({ ...prev, bankName: e.target.value }))}
                  className="w-full px-4 py-3 border border-input rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="e.g., GCB Bank"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Account Number</label>
                <input
                  type="text"
                  value={formData.accountNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, accountNumber: e.target.value }))}
                  className="w-full px-4 py-3 border border-input rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="Account number"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Account Name</label>
                <input
                  type="text"
                  value={formData.accountName}
                  onChange={(e) => setFormData(prev => ({ ...prev, accountName: e.target.value }))}
                  className="w-full px-4 py-3 border border-input rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="Account holder name"
                />
              </div>
            </div>
          )}

          {/* Set as Default */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isDefault"
              checked={formData.isDefault}
              onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
              className="rounded border-input"
            />
            <label htmlFor="isDefault" className="text-sm font-medium">
              Set as default payment method
            </label>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 h-12 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="flex-1 h-12 rounded-xl"
            >
              {submitting ? 'Adding...' : 'Add Payment Method'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
