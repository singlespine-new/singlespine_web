'use client'

import { useState } from 'react'
import { Phone, X, CheckCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import toast from '@/components/ui/toast'

interface PhoneNumberModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (phone: string) => Promise<void>
  userName?: string
}

export default function PhoneNumberModal({
  isOpen,
  onClose,
  onSave,
  userName
}: PhoneNumberModalProps) {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  if (!isOpen) return null

  // Format phone number as user types
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
    setPhoneNumber(formatted)
  }

  const isValidGhanaPhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '')
    return (cleaned.length === 10 && cleaned.startsWith('0')) ||
      (cleaned.length === 12 && cleaned.startsWith('233'))
  }

  const handleSave = async () => {
    if (!phoneNumber.trim()) {
      toast.error('Please enter your phone number')
      return
    }

    if (!isValidGhanaPhone(phoneNumber)) {
      toast.error('Please enter a valid Ghana phone number')
      return
    }

    try {
      setIsLoading(true)
      await onSave(phoneNumber.trim())
      toast.success('Phone number updated successfully!', {
        icon: <CheckCircle className="w-5 h-5" />
      })
      onClose()
    } catch (error) {
      console.error('Error saving phone number:', error)
      toast.error('Failed to update phone number. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    }
    if (e.key === 'Escape') {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 w-full max-w-md mx-4 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Phone className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Add Your Phone Number
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {userName ? `Hi ${userName}! ` : ''}
            We need your phone number to send order updates and ensure smooth delivery to Ghana.
          </p>
        </div>

        {/* Phone Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Phone Number
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => handlePhoneChange(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="0XXX XXX XXX or +233XXX XXX XXX"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary dark:bg-gray-700 dark:text-white transition-colors"
              disabled={isLoading}
              autoFocus
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Enter your Ghana mobile number for order notifications
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1"
          >
            Skip for Now
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading || !isValidGhanaPhone(phoneNumber)}
            className="flex-1"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Save Phone Number
              </div>
            )}
          </Button>
        </div>

        {/* Security Note */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            🔒 Your information is secure and will only be used for order updates
          </p>
        </div>
      </div>
    </div>
  )
}
