import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // Get current authenticated user
    const user = await getCurrentUser()

    if (!user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { phone } = body

    if (!phone || typeof phone !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Phone number is required' },
        { status: 400 }
      )
    }

    // Validate Ghana phone number format
    const cleanedPhone = phone.replace(/\D/g, '')
    const isValidGhanaPhone =
      (cleanedPhone.length === 10 && cleanedPhone.startsWith('0')) ||
      (cleanedPhone.length === 12 && cleanedPhone.startsWith('233'))

    if (!isValidGhanaPhone) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid Ghana phone number' },
        { status: 400 }
      )
    }

    // Normalize phone number format
    let normalizedPhone = phone.trim()
    if (normalizedPhone.startsWith('0')) {
      // Convert 0XXX format to +233XXX format for consistency
      normalizedPhone = '+233' + normalizedPhone.substring(1)
    } else if (!normalizedPhone.startsWith('+')) {
      // Add + prefix if missing
      normalizedPhone = '+' + normalizedPhone
    }

    // Check if phone number is already taken by another user
    const existingUser = await prisma.user.findFirst({
      where: {
        phoneNumber: normalizedPhone,
        id: { not: user.id } // Exclude current user
      }
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'This phone number is already registered to another account' },
        { status: 409 }
      )
    }

    // Update user's phone number
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        phoneNumber: normalizedPhone,
        updatedAt: new Date()
      },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        updatedAt: true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Phone number updated successfully',
      data: {
        user: updatedUser
      }
    })

  } catch (error) {
    console.error('Error updating phone number:', error)

    // Handle specific Prisma errors
    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'This phone number is already registered' },
        { status: 409 }
      )
    }

    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update phone number' },
      { status: 500 }
    )
  }
}

// GET endpoint to retrieve current user's phone number
export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true
      }
    })

    if (!userData) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        user: userData,
        hasPhone: !!userData.phoneNumber
      }
    })

  } catch (error) {
    console.error('Error fetching user data:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user data' },
      { status: 500 }
    )
  }
}
