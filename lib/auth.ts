import { PrismaAdapter } from "@next-auth/prisma-adapter"
import bcrypt from 'bcryptjs'
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { formatPhoneNumber, verifyOTP } from './otp'
import { prisma } from './prisma'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      id: 'credentials',
      name: 'Email & Password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        console.log('Credentials auth: Attempting login for', credentials?.email)

        if (!credentials?.email || !credentials?.password) {
          console.error('Credentials auth: Missing email or password')
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user || !user.password) {
          console.error('Credentials auth: User not found or no password set for', credentials.email)
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          console.error('Credentials auth: Invalid password for', credentials.email)
          return null
        }

        console.log('Credentials auth: Login successful for', user.email, 'role:', user.role)
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      }
    }),
    CredentialsProvider({
      id: 'phone-otp',
      name: 'Phone OTP',
      credentials: {
        phoneNumber: { label: 'Phone Number', type: 'tel' },
        otp: { label: 'OTP', type: 'text' }
      },
      async authorize(credentials) {
        if (!credentials?.phoneNumber || !credentials?.otp) {
          console.error('Phone OTP auth: Missing credentials')
          throw new Error('Missing phone number or OTP')
        }

        console.log('Phone OTP auth: Verifying OTP for', credentials.phoneNumber)

        // Verify OTP
        const otpResult = verifyOTP(credentials.phoneNumber, credentials.otp)
        if (!otpResult.valid) {
          console.error('Phone OTP auth: OTP verification failed', otpResult.message)
          throw new Error(otpResult.message)
        }

        console.log('Phone OTP auth: OTP verified successfully')

        // Format phone number
        const formattedPhone = formatPhoneNumber(credentials.phoneNumber)

        // Find or create user with phone number
        let user = await prisma.user.findUnique({
          where: {
            phoneNumber: formattedPhone
          }
        })

        if (!user) {
          // Create new user with phone number
          user = await prisma.user.create({
            data: {
              phoneNumber: formattedPhone,
              name: `User ${formattedPhone.slice(-4)}`, // Default name
              email: null, // Phone-only users don't need email
              phoneVerified: new Date(),
            }
          })
        } else {
          // Update phone verification timestamp
          user = await prisma.user.update({
            where: { id: user.id },
            data: { phoneVerified: new Date() }
          })
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          phoneNumber: user.phoneNumber,
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  debug: process.env.NODE_ENV === 'development',
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        // Initial sign-in: set all fields from the user object
        token.role = user.role
        token.id = user.id
        token.phoneNumber = (user as any).phoneNumber
        token.picture = (user as any).image || null
        token.customAvatar = (user as any).customAvatarUrl || null
        console.log('JWT callback: Updated token for user', user.id)
      } else if (token.id) {
        // Subsequent requests: re-fetch role from DB so upgrades (e.g. VENDOR) are picked up.
        // Also validates the user ID still exists — catches stale JWTs from old databases
        // (e.g. MongoDB ObjectIds that have no match in the current PostgreSQL users table).
        try {
          const freshUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { role: true, id: true },
          })

          if (!freshUser) {
            // User no longer exists in this database (e.g. stale MongoDB JWT hitting
            // a fresh PostgreSQL DB). Strip all identity fields from the token so the
            // session callback produces an anonymous session and all auth guards fail.
            // NextAuth v4 requires the jwt callback to always return an object — null throws.
            console.warn('JWT callback: stale user ID not found in DB, stripping token:', token.id)
            return {
              iat: token.iat,
              exp: token.exp,
              jti: token.jti,
              error: 'UserNotFound',
            }
          }

          if (freshUser.role !== token.role) {
            console.log('JWT callback: Role changed from', token.role, 'to', freshUser.role)
            token.role = freshUser.role
          }
        } catch (e) {
          // Silently fail — keep existing token role on transient DB errors
        }
      }
      if (account) {
        console.log('JWT callback: Account provider', account.provider)
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        // Stale token (user deleted / DB swapped) — return a session with no identity
        // so all auth guards treat the request as unauthenticated.
        // The client should call signOut() when it receives error === 'UserNotFound'.
        if ((token as any).error === 'UserNotFound') {
          console.warn('Session callback: stale token detected, returning empty session')
            ; (session as any).error = 'UserNotFound'
          return session
        }

        // Base identity
        session.user.id = (token as any).id || token.sub!
        session.user.role = (token as any).role as string
        session.user.phoneNumber = (token as any).phoneNumber as string | undefined

        // Provider & custom images
        const providerImage = (token as any).picture as string | undefined
        const customAvatar = (token as any).customAvatar as string | undefined

        // Effective avatar preference: custom first, fallback to provider
        session.user.image = (customAvatar || providerImage || '') as string

          // Expose both for client decisions
          ; (session.user as any).providerImage = providerImage
          ; (session.user as any).customAvatar = customAvatar

        console.log('Session callback: Created session for user', session.user.id)
      }
      return session
    },
    async signIn({ user, account }) {
      console.log('SignIn callback: Provider', account?.provider, 'User ID', user?.id)
      return true
    },
    async redirect({ url, baseUrl }) {
      console.log('Redirect callback: From', url, 'Base', baseUrl)
      if (url.startsWith("/")) return `${baseUrl}${url}`
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/signin',
  },
  secret: process.env.NEXTAUTH_SECRET,
}

// Helper function to get server session
export async function getCurrentUser() {
  try {
    const { getServerSession } = await import('next-auth/next')
    const session = await getServerSession(authOptions)
    return session?.user
  } catch (_) {
    return null
  }
}

// Helper function to check if user is admin
export async function isAdmin() {
  const user = await getCurrentUser()
  return user?.role === 'ADMIN'
}

// Helper function to check if user is a merchant (VENDOR or ADMIN)
export async function isMerchant() {
  const user = await getCurrentUser()
  return user?.role === 'VENDOR' || user?.role === 'ADMIN'
}

// Helper to get the current merchant's shop
export async function getMerchantShop() {
  const user = await getCurrentUser()
  if (!user?.id) return null
  if (user.role !== 'VENDOR' && user.role !== 'ADMIN') return null

  const shop = await prisma.shop.findFirst({
    where: { ownerId: user.id, isActive: true }
  })
  return shop
}

// Types for NextAuth
declare module 'next-auth' {
  interface User {
    role?: string
    phoneNumber?: string
  }

  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      role?: string
      phoneNumber?: string
    }
    /** Set to 'UserNotFound' when the JWT references a user ID that no longer
     *  exists in the database (e.g. stale cookie from a previous DB). The client
     *  should call signOut() immediately when it detects this value. */
    error?: 'UserNotFound'
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: string
    id?: string
    phoneNumber?: string
  }
}
