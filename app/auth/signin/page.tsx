'use client'

import { useEffect, useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Phone, ArrowLeft, Shield, CheckCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import OtpInput from 'react-otp-input'
import Image from 'next/image'

type AuthMode = 'select' | 'phone' | 'otp'

export default function SignInPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'

  const [mode, setMode] = useState<AuthMode>('select')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [otp, setOtp] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  // Check if user is already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const session = await getSession()
      if (session) {
        router.push(callbackUrl)
      }
    }
    checkAuth()
  }, [callbackUrl, router])

  // Cooldown timer for OTP resend
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  // Google Sign In
  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true)
      await signIn('google', { callbackUrl })
    } catch (error) {
      console.error('Google sign in error:', error)
      toast.error('Failed to sign in with Google. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Request OTP
  const handleRequestOTP = async () => {
    if (!phoneNumber.trim()) {
      toast.error('Please enter your phone number')
      return
    }

    try {
      setIsLoading(true)
      const response = await fetch('/api/auth/otp/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: phoneNumber.trim() })
      })

      const data = await response.json()

      if (data.success) {
        setOtpSent(true)
        setMode('otp')
        setResendCooldown(120) // 2 minutes cooldown
        toast.success(data.message, {
          duration: 5000,
          icon: '📱'
        })
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.error('OTP request error:', error)
      toast.error('Failed to send OTP. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Verify OTP
  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      toast.error('Please enter the complete 6-digit code')
      return
    }

    try {
      setIsLoading(true)

      // First verify OTP with our API
      const verifyResponse = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, otp })
      })

      const verifyData = await verifyResponse.json()

      if (verifyData.success) {
        // If OTP is valid, sign in with NextAuth
        const result = await signIn('phone-otp', {
          phoneNumber,
          otp,
          callbackUrl,
          redirect: false
        })

        if (result?.error) {
          toast.error(result.error)
        } else if (result?.ok) {
          toast.success('Successfully signed in! 🎉')
          router.push(callbackUrl)
        }
      } else {
        toast.error(verifyData.message)
        if (verifyData.message.includes('expired') || verifyData.message.includes('Too many')) {
          setMode('phone')
          setOtp('')
          setOtpSent(false)
        }
      }
    } catch (error) {
      console.error('OTP verification error:', error)
      toast.error('Failed to verify OTP. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Image
              src="/singlespine_logo.png" // Ensure this path is correct
              alt="Singlespine Logo"
              width={140}
              height={40}
              priority
              className="h-auto w-auto"
            />
            {/* <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-yellow-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div> */}
          </div>
          {/* <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back
          </h1> */}
          <p className="text-gray-600 dark:text-gray-400">
            Sign in to continue your shopping journey
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-6">
          {mode === 'select' && (
            <div className="space-y-4">
              {/* Google Sign In */}
              <Button
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full h-12 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-2 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 relative"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <div className="absolute left-4 w-5 h-5 bg-white rounded flex items-center justify-center">
                      <svg viewBox="0 0 24 24" className="w-4 h-4">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                    </div>
                    Continue with Google
                  </>
                )}
              </Button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">or</span>
                </div>
              </div>

              {/* Phone Sign In */}
              <Button
                onClick={() => setMode('phone')}
                variant="outline"
                className="w-full h-12 border-2 border-orange-200 dark:border-orange-700 text-orange-700 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20"
              >
                <Phone className="w-5 h-5 mr-2" />
                Continue with Phone Number
              </Button>

              {/* Sign Up Link */}
              <div className="text-center pt-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Don't have an account?{' '}
                  <Link
                    href="/auth/signup"
                    className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 font-medium"
                  >
                    Sign up
                  </Link>
                </p>
              </div>
            </div>
          )}

          {mode === 'phone' && (
            <div className="space-y-4">
              {/* Back Button */}
              <Button
                onClick={() => setMode('select')}
                variant="ghost"
                size="sm"
                className="mb-2"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Enter your phone number
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  We'll send you a verification code to sign in
                </p>
              </div>

              {/* Phone Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="0XXX XXX XXX or +233XXX XXX XXX"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Enter your Ghana mobile number
                </p>
              </div>

              <Button
                onClick={handleRequestOTP}
                disabled={isLoading || !isValidGhanaPhone(phoneNumber)}
                className="w-full h-12"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : (
                  <Phone className="w-5 h-5 mr-2" />
                )}
                Send Verification Code
              </Button>
            </div>
          )}

          {mode === 'otp' && (
            <div className="space-y-4">
              {/* Back Button */}
              <Button
                onClick={() => {
                  setMode('phone')
                  setOtp('')
                }}
                variant="ghost"
                size="sm"
                className="mb-2"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Enter verification code
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  We sent a 6-digit code to<br />
                  <span className="font-medium text-gray-900 dark:text-white">
                    {phoneNumber}
                  </span>
                </p>
              </div>

              {/* OTP Input */}
              <div className="flex justify-center mb-6">
                <OtpInput
                  value={otp}
                  onChange={setOtp}
                  numInputs={6}
                  separator={<span className="mx-1"></span>}
                  inputStyle={{
                    width: '45px',
                    height: '45px',
                    margin: '0 2px',
                    fontSize: '18px',
                    borderRadius: '8px',
                    border: '2px solid #e5e7eb',
                    backgroundColor: 'white',
                    color: '#111827'
                  }}
                  focusStyle={{
                    border: '2px solid #f97316',
                    outline: 'none'
                  }}
                  isDisabled={isLoading}
                />
              </div>

              <Button
                onClick={handleVerifyOTP}
                disabled={isLoading || otp.length !== 6}
                className="w-full h-12"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : null}
                Verify Code
              </Button>

              {/* Resend OTP */}
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Didn't receive the code?{' '}
                  {resendCooldown > 0 ? (
                    <span className="text-gray-500">
                      Resend in {Math.floor(resendCooldown / 60)}:{(resendCooldown % 60).toString().padStart(2, '0')}
                    </span>
                  ) : (
                    <button
                      onClick={() => {
                        setMode('phone')
                        setOtp('')
                      }}
                      className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 font-medium"
                    >
                      Resend code
                    </button>
                  )}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Security Note */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            🔒 Your information is secure and encrypted
          </p>
        </div>
      </div>
    </div>
  )
}
