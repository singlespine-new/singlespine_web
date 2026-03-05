'use client'

import React, { useState, useEffect } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/input'
import { UIIcon } from '@/components/ui/icon'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function AdminLoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [checking, setChecking] = useState(true)

    // Check if already authenticated as admin
    useEffect(() => {
        const checkAuth = async () => {
            const session = await getSession()
            if (session?.user?.role === 'ADMIN') {
                router.push('/admin')
            }
            setChecking(false)
        }
        checkAuth()
    }, [router])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!email.trim() || !password.trim()) {
            toast.error('Email and password are required')
            return
        }

        setIsLoading(true)
        try {
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
            })

            if (result?.error) {
                toast.error('Invalid credentials. Access denied.')
                return
            }

            if (result?.ok) {
                // Verify the user is actually an admin
                const session = await getSession()
                if (session?.user?.role !== 'ADMIN') {
                    toast.error('Access denied. Admin privileges required.')
                    return
                }
                toast.success('Welcome, Admin')
                router.push('/admin')
                router.refresh()
            }
        } catch {
            toast.error('Authentication failed. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    if (checking) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <UIIcon name="loading" className="w-8 h-8 text-primary animate-spin" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background decorations */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-violet-500/5 rounded-full blur-3xl" />
                {/* Grid pattern */}
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                        backgroundSize: '40px 40px',
                    }}
                />
            </div>

            <div className="w-full max-w-sm relative z-10">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 border border-white/10 mb-5 backdrop-blur-sm">
                        <UIIcon name="settings" className="w-7 h-7 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold text-white tracking-tight mb-1.5">
                        Admin Access
                    </h1>
                    <p className="text-sm text-gray-500">
                        Restricted area. Authorized personnel only.
                    </p>
                </div>

                {/* Login Card */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="bg-white/3 border border-white/6 rounded-2xl p-6 space-y-5 backdrop-blur-sm">
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Email
                            </label>
                            <Input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="admin@singlespine.com"
                                autoComplete="email"
                                autoFocus
                                className={cn(
                                    'h-11 bg-white/4 border-white/8 text-white placeholder:text-gray-600',
                                    'focus-visible:border-primary/50 focus-visible:ring-primary/20'
                                )}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Password
                            </label>
                            <div className="relative">
                                <Input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    autoComplete="current-password"
                                    className={cn(
                                        'h-11 pr-10 bg-white/4 border-white/8 text-white placeholder:text-gray-600',
                                        'focus-visible:border-primary/50 focus-visible:ring-primary/20'
                                    )}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                                >
                                    <UIIcon
                                        name={showPassword ? 'close' : 'eye'}
                                        className="w-4 h-4"
                                    />
                                </button>
                            </div>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        disabled={isLoading || !email || !password}
                        size="lg"
                        className="w-full h-12 rounded-xl font-semibold text-sm"
                    >
                        {isLoading ? (
                            <>
                                <UIIcon name="loading" className="w-4 h-4 animate-spin mr-2" />
                                Authenticating...
                            </>
                        ) : (
                            <>
                                <UIIcon name="lock" className="w-4 h-4 mr-2" />
                                Sign In to Admin
                            </>
                        )}
                    </Button>
                </form>

                {/* Footer */}
                <div className="mt-8 text-center space-y-3">
                    <p className="text-[11px] text-gray-600">
                        This portal is monitored. Unauthorized access attempts are logged.
                    </p>
                    <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-700">
                        <UIIcon name="lock" className="w-3 h-3" />
                        <span>Encrypted connection</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
