'use client'

import { signIn, useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

// Hook to check if user is authenticated
export function useAuth() {
  const { data: session, status } = useSession()

  return {
    user: session?.user,
    isAuthenticated: !!session,
    isLoading: status === 'loading',
    session
  }
}

// Hook to require authentication - redirects to signin if not authenticated
export function useRequireAuth(redirectTo = '/auth/signin') {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const currentUrl = window.location.pathname + window.location.search
      const callbackUrl = encodeURIComponent(currentUrl)
      router.push(`${redirectTo}?callbackUrl=${callbackUrl}`)
    }
  }, [isAuthenticated, isLoading, router, redirectTo])

  return { isAuthenticated, isLoading }
}

// Hook to handle authentication flow after successful login
export function useAuthRedirect() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      const callbackUrl = searchParams.get('callbackUrl')

      if (callbackUrl) {
        try {
          // Validate that the callback URL is safe (same origin)
          const url = new URL(callbackUrl, window.location.origin)
          if (url.origin === window.location.origin) {
            router.push(callbackUrl)
            return
          }
        } catch (error) {
          console.error('Invalid callback URL:', error)
        }
      }

      // Default redirect to products page
      router.push('/products')
    }
  }, [isAuthenticated, isLoading, router, searchParams])
}

// Hook to handle cart authentication
export function useCartAuth() {
  const { isAuthenticated } = useAuth()
  const [showAuthPrompt, setShowAuthPrompt] = useState(false)
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null)

  const requireAuth = (action: () => void, message = 'Please sign in to continue') => {
    if (isAuthenticated) {
      action()
    } else {
      setPendingAction(() => action)
      setShowAuthPrompt(true)
      toast.error(message)
    }
  }

  const handleAuthSuccess = () => {
    if (pendingAction) {
      pendingAction()
      setPendingAction(null)
    }
    setShowAuthPrompt(false)
  }

  const handleAuthCancel = () => {
    setPendingAction(null)
    setShowAuthPrompt(false)
  }

  return {
    requireAuth,
    showAuthPrompt,
    handleAuthSuccess,
    handleAuthCancel,
    isAuthenticated
  }
}

// Utility to get signin URL with callback
export function getSignInUrl(callbackUrl?: string) {
  const params = new URLSearchParams()
  if (callbackUrl) {
    params.set('callbackUrl', callbackUrl)
  }
  return `/auth/signin${params.toString() ? `?${params}` : ''}`
}

// Utility to get signup URL with callback
export function getSignUpUrl(callbackUrl?: string) {
  const params = new URLSearchParams()
  if (callbackUrl) {
    params.set('callbackUrl', callbackUrl)
  }
  return `/auth/signup${params.toString() ? `?${params}` : ''}`
}

// Helper to trigger authentication with better UX
export function triggerAuth(options?: {
  callbackUrl?: string
  provider?: string
  action?: 'signin' | 'signup'
  message?: string
}) {
  const {
    callbackUrl = window.location.href,
    provider,
    action = 'signin',
    message = 'Please sign in to continue'
  } = options || {}

  // Show toast message
  toast.error(message, {
    duration: 3000,
    icon: '🔐'
  })

  // If provider is specified, sign in directly
  if (provider) {
    signIn(provider, { callbackUrl })
    return
  }

  // Otherwise redirect to auth page
  const authUrl = action === 'signup'
    ? getSignUpUrl(callbackUrl)
    : getSignInUrl(callbackUrl)

  window.location.href = authUrl
}

// Check if user has specific role
export function useHasRole(role: string) {
  const { user } = useAuth()
  return user?.role === role
}

// Check if user is admin
export function useIsAdmin() {
  return useHasRole('ADMIN')
}

// Storage utilities for auth state
export const authStorage = {
  setRedirectUrl: (url: string) => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('auth_redirect_url', url)
    }
  },

  getRedirectUrl: (): string | null => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('auth_redirect_url')
    }
    return null
  },

  clearRedirectUrl: () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('auth_redirect_url')
    }
  },

  setCartAction: (action: string) => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('pending_cart_action', action)
    }
  },

  getCartAction: (): string | null => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('pending_cart_action')
    }
    return null
  },

  clearCartAction: () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('pending_cart_action')
    }
  }
}

// Auth event handlers
export const authEvents = {
  onSignInSuccess: (callbackUrl?: string) => {
    toast.success('Welcome back! 🎉', {
      duration: 3000,
      icon: '👋'
    })

    // Store a safe callback URL for potential post-auth redirects
    if (callbackUrl) {
      try {
        const url = new URL(callbackUrl, window.location.origin)
        if (url.origin === window.location.origin) {
          authStorage.setRedirectUrl(url.pathname + url.search + url.hash)
        }
      } catch (error) {
        console.log(error)
        // ignore invalid callback URL
      }
    }

    // Handle any pending cart actions
    const pendingAction = authStorage.getCartAction()
    if (pendingAction) {
      authStorage.clearCartAction()
      // You can dispatch custom events here for cart actions
      window.dispatchEvent(new CustomEvent('auth:cart-action', {
        detail: { action: pendingAction }
      }))
    }
  },

  onSignInError: (error: string) => {
    toast.error(`Sign in failed: ${error}`, {
      duration: 5000,
      icon: '❌'
    })
  },

  onSignOut: () => {
    toast.success('Signed out successfully', {
      duration: 2000,
      icon: '👋'
    })

    // Clear any stored auth data
    authStorage.clearRedirectUrl()
    authStorage.clearCartAction()
  }
}
