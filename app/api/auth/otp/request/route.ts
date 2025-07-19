import { requestOTP } from '@/lib/otp'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber } = await request.json()

    if (!phoneNumber) {
      return NextResponse.json(
        { success: false, message: 'Phone number is required' },
        { status: 400 }
      )
    }

    const result = await requestOTP(phoneNumber)

    return NextResponse.json(result, {
      status: result.success ? 200 : 400
    })
  } catch (error) {
    console.error('Error requesting OTP:', error)
    return NextResponse.json(
      { success: false, message: 'An error occurred while requesting OTP' },
      { status: 500 }
    )
  }
}
