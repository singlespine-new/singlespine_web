'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/auth-utils'

interface UsePhonePromptOptions {
  enabled?: boolean
  context?: 'checkout' | 'profile' | 'cart' | 'general'
  autoShow?: boolean
  delay?: number
}

interface PhonePromptState {
  isOpen: boolean
  context: string
  hasShown: boolean
}

export function usePhonePrompt(options: UsePhonePromptOptions = {}) {
  const {
    enabled = true,
    context = 'general',
    autoShow = false,
    delay = 0
  } = options

  const { user, isAuthenticated } = useAuth()
  const [promptState, setPromptState] = useState<PhonePromptState>({
    isOpen: false,
    context,
    hasShown: false
  })

  // Check if user needs phone number
  const needsPhoneNumber = useCallback(() => {
    if (!isAuthenticated || !user) return false
    return !user.phoneNumber || user.phoneNumber.trim() === ''
  }, [isAuthenticated, user])

  // Show prompt with context
  const showPrompt = useCallback((promptContext?: string) => {
    if (!enabled || !needsPhoneNumber()) return

    const finalContext = promptContext || context

    setPromptState(prev => ({
      ...prev,
      isOpen: true,
      context: finalContext,
      hasShown: true
    }))
  }, [enabled, needsPhoneNumber, context])

  // Hide prompt
  const hidePrompt = useCallback(() => {
    setPromptState(prev => ({
      ...prev,
      isOpen: false
    }))
  }, [])

  // Save phone number
  const savePhoneNumber = useCallback(async (phone: string) => {
    try {
      const response = await fetch('/api/user/update-phone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone }),
      })

      if (!response.ok) {
        throw new Error('Failed to update phone number')
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to update phone number')
      }

      // Refresh user session to get updated phone number
      window.location.reload()

      return { success: true }
    } catch (error) {
      console.error('Error updating phone number:', error)
      throw error
    }
  }, [])

  // Auto-show logic
  useEffect(() => {
    if (!autoShow || !enabled || promptState.hasShown) return
    if (!needsPhoneNumber()) return

    const timer = setTimeout(() => {
      showPrompt()
    }, delay)

    return () => clearTimeout(timer)
  }, [autoShow, enabled, delay, needsPhoneNumber, showPrompt, promptState.hasShown])

  // Smart timing based on context
  const showPromptWithSmartTiming = useCallback((promptContext: string) => {
    const timings = {
      checkout: 0, // Immediate
      cart: 2000, // 2 seconds after cart interaction
      profile: 1000, // 1 second
      general: 3000, // 3 seconds for general prompts
    }

    const contextDelay = timings[promptContext as keyof typeof timings] || 1000

    setTimeout(() => {
      showPrompt(promptContext)
    }, contextDelay)
  }, [showPrompt])

  // Check if should show based on various conditions
  const shouldShow = useCallback((checkContext?: string) => {
    if (!enabled || !isAuthenticated || !user) return false
    if (!needsPhoneNumber()) return false

    // Don't show if already shown in this session for non-critical contexts
    if (promptState.hasShown && checkContext !== 'checkout') return false

    return true
  }, [enabled, isAuthenticated, user, needsPhoneNumber, promptState.hasShown])

  // Session storage for "don't show again" functionality
  const markAsSkipped = useCallback((skipDuration: 'session' | 'day' | 'week' = 'session') => {
    const skipKey = `phone_prompt_skipped_${user?.id || 'anonymous'}`
    const skipUntil = {
      session: new Date().getTime() + (1000 * 60 * 60), // 1 hour
      day: new Date().getTime() + (1000 * 60 * 60 * 24), // 24 hours
      week: new Date().getTime() + (1000 * 60 * 60 * 24 * 7), // 7 days
    }

    sessionStorage.setItem(skipKey, skipUntil[skipDuration].toString())
    hidePrompt()
  }, [user?.id, hidePrompt])

  // Check if user has skipped recently
  const hasRecentlySkipped = useCallback(() => {
    if (!user?.id) return false

    const skipKey = `phone_prompt_skipped_${user.id}`
    const skipUntil = sessionStorage.getItem(skipKey)

    if (!skipUntil) return false

    return new Date().getTime() < parseInt(skipUntil)
  }, [user?.id])

  // Enhanced shouldShow that respects skip preferences
  const shouldShowRespectingSkips = useCallback((checkContext?: string) => {
    if (checkContext === 'checkout') return shouldShow(checkContext) // Always show for checkout
    if (hasRecentlySkipped()) return false
    return shouldShow(checkContext)
  }, [shouldShow, hasRecentlySkipped])

  return {
    // State
    isOpen: promptState.isOpen,
    context: promptState.context,
    needsPhoneNumber: needsPhoneNumber(),
    shouldShow: shouldShowRespectingSkips,
    hasShown: promptState.hasShown,

    // Actions
    showPrompt,
    hidePrompt,
    savePhoneNumber,
    showPromptWithSmartTiming,
    markAsSkipped,

    // User data
    currentPhone: user?.phoneNumber || '',
    userName: user?.name || '',
  }
}

// Hook for specific contexts
export function useCheckoutPhonePrompt() {
  return usePhonePrompt({
    context: 'checkout',
    enabled: true,
    autoShow: false, // Manual trigger for checkout
  })
}

export function useCartPhonePrompt() {
  return usePhonePrompt({
    context: 'cart',
    enabled: true,
    autoShow: true,
    delay: 2000, // Show 2 seconds after cart interaction
  })
}

export function useProfilePhonePrompt() {
  return usePhonePrompt({
    context: 'profile',
    enabled: true,
    autoShow: true,
    delay: 1000,
  })
}
