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
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Missing credentials')
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        })

        if (!user || !user.password) {
          throw new Error('Invalid credentials')
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          throw new Error('Invalid credentials')
        }

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
        // Standard fields
        token.role = user.role
        token.id = user.id
        token.phoneNumber = (user as any).phoneNumber
        // Provider (Google) image
        token.picture = (user as any).image || null
        // Custom uploaded avatar (new field from schema)
        token.customAvatar = (user as any).customAvatarUrl || null

        console.log('JWT callback: Updated token for user', user.id)
      }
      if (account) {
        console.log('JWT callback: Account provider', account.provider)
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
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
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: string
    id?: string
    phoneNumber?: string
  }
}
