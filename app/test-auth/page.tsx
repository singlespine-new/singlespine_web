'use client'

import { useSession, signIn, signOut, getProviders } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'

export default function TestAuthPage() {
  const { data: session, status } = useSession()
  const [providers, setProviders] = useState<any>(null)

  useEffect(() => {
    const getAuthProviders = async () => {
      const providers = await getProviders()
      setProviders(providers)
    }
    getAuthProviders()
  }, [])

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Authentication Debug Page</h1>

        {/* Session Status */}
        <div className="bg-card border border-border rounded-xl p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Session Status</h2>
          <div className="space-y-2">
            <p><strong>Status:</strong> <span className={`px-2 py-1 rounded text-sm font-medium ${status === 'authenticated' ? 'bg-green-100 text-green-800' :
                status === 'loading' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
              }`}>{status}</span></p>

            {session && (
              <>
                <p><strong>User ID:</strong> {session.user?.id || 'N/A'}</p>
                <p><strong>Name:</strong> {session.user?.name || 'N/A'}</p>
                <p><strong>Email:</strong> {session.user?.email || 'N/A'}</p>
                <p><strong>Phone:</strong> {session.user?.phoneNumber || 'N/A'}</p>
                <p><strong>Role:</strong> {session.user?.role || 'N/A'}</p>
                <p><strong>Image:</strong> {session.user?.image || 'N/A'}</p>
              </>
            )}
          </div>
        </div>

        {/* Available Providers */}
        <div className="bg-card border border-border rounded-xl p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Available Auth Providers</h2>
          {providers ? (
            <div className="space-y-2">
              {Object.values(providers).map((provider: any) => (
                <div key={provider.name} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p><strong>Name:</strong> {provider.name}</p>
                    <p><strong>ID:</strong> {provider.id}</p>
                    <p><strong>Type:</strong> {provider.type}</p>
                  </div>
                  {!session && (
                    <Button
                      onClick={() => signIn(provider.id)}
                      size="sm"
                    >
                      Sign in with {provider.name}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p>Loading providers...</p>
          )}
        </div>

        {/* Environment Variables */}
        <div className="bg-card border border-border rounded-xl p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Environment Check</h2>
          <div className="space-y-2 text-sm font-mono">
            <p><strong>NEXTAUTH_URL:</strong> {process.env.NEXT_PUBLIC_NEXTAUTH_URL || 'Not set (using default)'}</p>
            <p><strong>Google OAuth:</strong> {providers?.google ? '✅ Configured' : '❌ Not configured'}</p>
            <p><strong>Phone OTP:</strong> {providers?.['phone-otp'] ? '✅ Available' : '❌ Not available'}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-card border border-border rounded-xl p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Actions</h2>
          <div className="flex flex-wrap gap-4">
            {!session ? (
              <>
                <Button onClick={() => signIn()}>
                  Sign In (Default)
                </Button>
                <Button onClick={() => signIn('google')} variant="outline">
                  Sign In with Google
                </Button>
                <Button onClick={() => signIn('phone-otp')} variant="outline">
                  Sign In with Phone
                </Button>
              </>
            ) : (
              <Button onClick={() => signOut()} variant="destructive">
                Sign Out
              </Button>
            )}
          </div>
        </div>

        {/* Raw Session Data */}
        {session && (
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Raw Session Data</h2>
            <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto">
              {JSON.stringify(session, null, 2)}
            </pre>
          </div>
        )}

        {/* Debug Info */}
        <div className="bg-card border border-border rounded-xl p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">Debug Information</h2>
          <div className="text-sm space-y-2">
            <p><strong>Current URL:</strong> {typeof window !== 'undefined' ? window.location.href : 'Server-side'}</p>
            <p><strong>User Agent:</strong> {typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A'}</p>
            <p><strong>Timestamp:</strong> {new Date().toISOString()}</p>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4 text-blue-800">Instructions</h2>
          <div className="text-blue-700 space-y-2">
            <p>1. Check if your desired auth providers are listed above</p>
            <p>2. Try signing in with different methods</p>
            <p>3. Check the browser console for any error messages</p>
            <p>4. Verify your environment variables are set correctly</p>
            <p>5. If Google OAuth isn't working, make sure you've added the correct redirect URI in Google Console:</p>
            <code className="bg-blue-100 px-2 py-1 rounded text-sm">http://localhost:3000/api/auth/callback/google</code>
          </div>
        </div>
      </div>
    </div>
  )
}
