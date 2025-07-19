import twilio from 'twilio'

// Initialize Twilio client
let twilioClient: twilio.Twilio | null = null

const getTwilioClient = () => {
  if (!twilioClient) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN

    if (!accountSid || !authToken) {
      throw new Error('Twilio credentials not configured')
    }

    twilioClient = twilio(accountSid, authToken)
  }

  return twilioClient
}

// Ghana phone number validation
export const validateGhanaPhoneNumber = (phoneNumber: string): boolean => {
  // Remove all non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '')

  // Ghana phone number patterns:
  // - Mobile: 0XXXXXXXXX (10 digits starting with 0)
  // - International: 233XXXXXXXXX (12 digits starting with 233)
  // - With +: +233XXXXXXXXX

  // Check for 10-digit format starting with 0
  if (cleaned.length === 10 && cleaned.startsWith('0')) {
    // Valid Ghana mobile prefixes: 020, 023, 024, 025, 026, 027, 028, 029, 050, 054, 055, 056, 057, 059
    const prefix = cleaned.substring(0, 3)
    const validPrefixes = ['020', '023', '024', '025', '026', '027', '028', '029', '050', '054', '055', '056', '057', '059']
    return validPrefixes.includes(prefix)
  }

  // Check for 12-digit format starting with 233
  if (cleaned.length === 12 && cleaned.startsWith('233')) {
    const localPart = '0' + cleaned.substring(3) // Convert to local format
    return validateGhanaPhoneNumber(localPart)
  }

  return false
}

// Format phone number to international format
export const formatPhoneNumber = (phoneNumber: string): string => {
  const cleaned = phoneNumber.replace(/\D/g, '')

  // If it starts with 0, replace with +233
  if (cleaned.startsWith('0') && cleaned.length === 10) {
    return '+233' + cleaned.substring(1)
  }

  // If it starts with 233, add +
  if (cleaned.startsWith('233') && cleaned.length === 12) {
    return '+' + cleaned
  }

  // If it already has +233, return as is
  if (phoneNumber.startsWith('+233')) {
    return phoneNumber
  }

  throw new Error('Invalid phone number format')
}

// Generate OTP
export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Send OTP via SMS
export const sendOTP = async (phoneNumber: string, otp: string): Promise<boolean> => {
  try {
    if (!validateGhanaPhoneNumber(phoneNumber)) {
      throw new Error('Invalid Ghana phone number')
    }

    const formattedNumber = formatPhoneNumber(phoneNumber)
    const client = getTwilioClient()

    const message = await client.messages.create({
      body: `Your Singlespine verification code is: ${otp}. This code will expire in 10 minutes. Don't share this code with anyone.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedNumber
    })

    console.log(`OTP sent successfully to ${formattedNumber}. Message SID: ${message.sid}`)
    return true
  } catch (error) {
    console.error('Error sending OTP:', error)
    return false
  }
}

// Store OTP in memory (in production, use Redis or database)
const otpStore = new Map<string, { otp: string; expiresAt: Date; attempts: number }>()

// Clean up expired OTPs every 30 minutes
setInterval(() => {
  const now = new Date()
  for (const [phone, data] of otpStore.entries()) {
    if (data.expiresAt < now) {
      otpStore.delete(phone)
    }
  }
}, 30 * 60 * 1000)

// Store OTP with expiration
export const storeOTP = (phoneNumber: string, otp: string): void => {
  const formattedNumber = formatPhoneNumber(phoneNumber)
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

  otpStore.set(formattedNumber, {
    otp,
    expiresAt,
    attempts: 0
  })
}

// Verify OTP
export const verifyOTP = (phoneNumber: string, providedOTP: string): { valid: boolean; message: string } => {
  try {
    const formattedNumber = formatPhoneNumber(phoneNumber)
    const stored = otpStore.get(formattedNumber)

    if (!stored) {
      return { valid: false, message: 'OTP not found or expired. Please request a new one.' }
    }

    if (stored.expiresAt < new Date()) {
      otpStore.delete(formattedNumber)
      return { valid: false, message: 'OTP has expired. Please request a new one.' }
    }

    if (stored.attempts >= 3) {
      otpStore.delete(formattedNumber)
      return { valid: false, message: 'Too many failed attempts. Please request a new OTP.' }
    }

    if (stored.otp !== providedOTP) {
      stored.attempts++
      return { valid: false, message: `Invalid OTP. ${3 - stored.attempts} attempts remaining.` }
    }

    // OTP is valid, remove from store
    otpStore.delete(formattedNumber)
    return { valid: true, message: 'OTP verified successfully!' }
  } catch (error) {
    return { valid: false, message: 'Invalid phone number format.' }
  }
}

// Request OTP (combines generation, storage, and sending)
export const requestOTP = async (phoneNumber: string): Promise<{ success: boolean; message: string }> => {
  try {
    if (!validateGhanaPhoneNumber(phoneNumber)) {
      return { success: false, message: 'Please enter a valid Ghana mobile number.' }
    }

    const formattedNumber = formatPhoneNumber(phoneNumber)

    // Check if OTP was recently sent (rate limiting)
    const existing = otpStore.get(formattedNumber)
    if (existing && existing.expiresAt > new Date(Date.now() + 8 * 60 * 1000)) {
      return { success: false, message: 'Please wait 2 minutes before requesting another OTP.' }
    }

    const otp = generateOTP()
    const sent = await sendOTP(phoneNumber, otp)

    if (!sent) {
      return { success: false, message: 'Failed to send OTP. Please try again.' }
    }

    storeOTP(phoneNumber, otp)

    return {
      success: true,
      message: `OTP sent to ${formattedNumber}. It will expire in 10 minutes.`
    }
  } catch (error) {
    console.error('Error requesting OTP:', error)
    return { success: false, message: 'An error occurred. Please try again.' }
  }
}

// Helper function to mask phone number for display
export const maskPhoneNumber = (phoneNumber: string): string => {
  try {
    const formatted = formatPhoneNumber(phoneNumber)
    if (formatted.length >= 8) {
      return formatted.substring(0, 4) + '****' + formatted.substring(formatted.length - 4)
    }
    return formatted
  } catch {
    return phoneNumber
  }
}

// Ghana mobile network operators
export const getNetworkOperator = (phoneNumber: string): string => {
  try {
    const cleaned = phoneNumber.replace(/\D/g, '')
    let localNumber = cleaned

    // Convert to local format if international
    if (cleaned.startsWith('233') && cleaned.length === 12) {
      localNumber = '0' + cleaned.substring(3)
    }

    if (localNumber.length === 10 && localNumber.startsWith('0')) {
      const prefix = localNumber.substring(0, 3)

      switch (prefix) {
        case '024':
        case '054':
        case '055':
        case '059':
          return 'MTN'
        case '020':
        case '050':
          return 'Vodafone'
        case '027':
        case '057':
          return 'AirtelTigo'
        case '026':
        case '056':
          return 'AirtelTigo'
        case '023':
        case '028':
          return 'Other'
        default:
          return 'Unknown'
      }
    }

    return 'Unknown'
  } catch {
    return 'Unknown'
  }
}
