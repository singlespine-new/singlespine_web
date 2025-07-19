import { verifyOTP } from '@/lib/otp'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, otp } = await request.json()

    if (!phoneNumber || !otp) {
      return NextResponse.json(
        { success: false, message: 'Phone number and OTP are required' },
        { status: 400 }
      )
    }

    const result = verifyOTP(phoneNumber, otp)

    return NextResponse.json({
      success: result.valid,
      message: result.message
    }, {
      status: result.valid ? 200 : 400
    })
  } catch (error) {
    console.error('Error verifying OTP:', error)
    return NextResponse.json(
      { success: false, message: 'An error occurred while verifying OTP' },
      { status: 500 }
    )
  }
}
