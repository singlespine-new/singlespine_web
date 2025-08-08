'use client'

import { useState, useEffect } from 'react'
import { Phone, X, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import toast from '@/components/ui/toast'

interface SmartPhonePromptProps {
  isOpen: boolean
  onClose: () => void
  onSave: (phone: string) => Promise<void>
  context?: 'checkout' | 'profile' | 'cart' | 'general'
  currentPhone?: string
  userName?: string
}

export default function SmartPhonePrompt({
  isOpen,
  onClose,
  onSave,
  context = 'general',
  currentPhone = '',
  userName = ''
}: SmartPhonePromptProps) {
  const [phone, setPhone] = useState(currentPhone)
  const [isLoading, setIsLoading] = useState(false)
  const [showBenefits, setShowBenefits] = useState(false)

  useEffect(() => {
    setPhone(currentPhone)
  }, [currentPhone])

  if (!isOpen) return null

  const getContextMessage = () => {
    switch (context) {
      case 'checkout':
        return {
          title: 'Add Your Phone Number',
          subtitle: 'We need your phone number to ensure smooth delivery',
          reason: 'Our delivery team will contact you to confirm the exact delivery location and time.',
          urgency: 'high'
        }
      case 'cart':
        return {
          title: 'Quick Setup',
          subtitle: 'Add your phone number for faster checkout',
          reason: 'Save time on your next order and get delivery updates.',
          urgency: 'medium'
        }
      case 'profile':
        return {
          title: 'Complete Your Profile',
          subtitle: 'Add your phone number to enhance your experience',
          reason: 'Get order updates, delivery notifications, and better customer support.',
          urgency: 'low'
        }
      default:
        return {
          title: 'Add Phone Number',
          subtitle: 'Complete your profile for better service',
          reason: 'We use this to send order updates and delivery notifications.',
          urgency: 'medium'
        }
    }
  }

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.startsWith('233')) {
      return '+' + cleaned
    } else if (cleaned.startsWith('0')) {
      return cleaned
    }
    return cleaned
  }

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value)
    setPhone(formatted)
  }

  const isValidGhanaPhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '')
    return (cleaned.length === 10 && cleaned.startsWith('0')) ||
      (cleaned.length === 12 && cleaned.startsWith('233'))
  }

  const handleSave = async () => {
    if (!phone.trim()) {
      toast.error('Please enter your phone number')
      return
    }

    if (!isValidGhanaPhone(phone)) {
      toast.error('Please enter a valid Ghana phone number')
      return
    }

    setIsLoading(true)
    try {
      await onSave(phone)
      toast.success('Phone number updated successfully! 📱', {
        icon: <CheckCircle className="w-5 h-5" />
      })
      onClose()
    } catch (error) {
      console.error('Error saving phone:', error)
      toast.error('Failed to update phone number. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSkip = () => {
    if (context === 'checkout') {
      toast.error('Phone number is required for delivery')
      return
    }
    onClose()
  }

  const contextInfo = getContextMessage()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 w-full max-w-md mx-4 relative">
        {/* Close button - only show if not checkout context */}
        {context !== 'checkout' && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center mx-auto mb-4">
            <Phone className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {contextInfo.title}
          </h2>
          <p className="text-muted-foreground">
            {contextInfo.subtitle}
          </p>
        </div>

        {/* Context explanation */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-blue-800 dark:text-blue-200 font-medium mb-1">
                Why we need this:
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                {contextInfo.reason}
              </p>
            </div>
          </div>
        </div>

        {/* Phone Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-foreground mb-2">
            Phone Number *
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="tel"
              value={phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder="0XXX XXX XXX or +233XXX XXX XXX"
              className="w-full pl-10 pr-4 py-3 border border-input rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
              disabled={isLoading}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Enter your Ghana mobile number for delivery updates
          </p>
        </div>

        {/* Benefits toggle */}
        <div className="mb-6">
          <button
            onClick={() => setShowBenefits(!showBenefits)}
            className="text-sm text-primary hover:text-primary/80 font-medium"
          >
            {showBenefits ? 'Hide' : 'See'} benefits of adding phone number
          </button>

          {showBenefits && (
            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Real-time delivery updates via SMS</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Faster customer support resolution</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Order confirmation and tracking</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Coordinate with delivery team</span>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <Button
            onClick={handleSave}
            disabled={isLoading || !isValidGhanaPhone(phone)}
            className="w-full h-12 font-semibold"
            size="lg"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Saving...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                {currentPhone ? 'Update Phone Number' : 'Add Phone Number'}
              </div>
            )}
          </Button>

          {context !== 'checkout' && (
            <Button
              onClick={handleSkip}
              variant="ghost"
              className="w-full h-10"
              disabled={isLoading}
            >
              Skip for now
            </Button>
          )}
        </div>

        {/* Privacy note */}
        <div className="mt-4 text-center">
          <p className="text-xs text-muted-foreground">
            🔒 Your phone number is secure and will only be used for order-related communications
          </p>
        </div>
      </div>
    </div>
  )
}
