#!/usr/bin/env node

/**
 * Nuclear Fix Script for Singlespine Database
 *
 * This script will forcefully fix the phone number unique constraint issue
 * by dropping and recreating the users collection if necessary.
 *
 * ⚠️  WARNING: This is a nuclear option that will delete ALL users!
 *
 * Usage:
 *   node scripts/nuclear-fix.js
 */

const { PrismaClient } = require('@prisma/client')
const readline = require('readline')

const prisma = new PrismaClient()

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bright: '\x1b[1m'
}

const colorLog = (color, message) => {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

const askConfirmation = (question) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  return new Promise((resolve) => {
    rl.question(`${colors.yellow}${question} (type 'NUCLEAR' to confirm): ${colors.reset}`, (answer) => {
      rl.close()
      resolve(answer === 'NUCLEAR')
    })
  })
}

// Check current database state
async function checkDatabaseState() {
  colorLog('cyan', '🔍 Checking current database state...')

  try {
    const userCount = await prisma.user.count()
    const nullPhoneCount = await prisma.user.count({
      where: { phoneNumber: null }
    })

    console.log(`  Total users: ${userCount}`)
    console.log(`  Users with null phone: ${nullPhoneCount}`)

    return { userCount, nullPhoneCount }
  } catch (error) {
    colorLog('red', `❌ Error checking database: ${error.message}`)
    return { userCount: 0, nullPhoneCount: 0, error: error.message }
  }
}

// Method 1: Delete all users with null phone numbers
async function fixMethod1() {
  colorLog('yellow', '🔧 Method 1: Delete users with null phone numbers')

  try {
    const result = await prisma.user.deleteMany({
      where: {
        phoneNumber: null
      }
    })

    colorLog('green', `✅ Deleted ${result.count} users with null phone numbers`)
    return true
  } catch (error) {
    colorLog('red', `❌ Method 1 failed: ${error.message}`)
    return false
  }
}

// Method 2: Update null phone numbers to unique values
async function fixMethod2() {
  colorLog('yellow', '🔧 Method 2: Assign unique placeholder phone numbers')

  try {
    const usersWithNullPhone = await prisma.user.findMany({
      where: { phoneNumber: null },
      select: { id: true }
    })

    for (let i = 0; i < usersWithNullPhone.length; i++) {
      const user = usersWithNullPhone[i]
      const placeholderPhone = `+233999999${String(i).padStart(3, '0')}`

      await prisma.user.update({
        where: { id: user.id },
        data: { phoneNumber: placeholderPhone }
      })
    }

    colorLog('green', `✅ Updated ${usersWithNullPhone.length} users with placeholder phone numbers`)
    return true
  } catch (error) {
    colorLog('red', `❌ Method 2 failed: ${error.message}`)
    return false
  }
}

// Method 3: Nuclear option - delete all users
async function fixMethod3() {
  colorLog('red', '💥 NUCLEAR METHOD: Delete ALL users')

  const confirmed = await askConfirmation('This will delete ALL users. Are you absolutely sure?')
  if (!confirmed) {
    colorLog('blue', '❌ Nuclear method cancelled.')
    return false
  }

  try {
    // Delete in proper order to avoid foreign key constraints
    await prisma.payment.deleteMany()
    await prisma.orderItem.deleteMany()
    await prisma.order.deleteMany()
    await prisma.cartItem.deleteMany()
    await prisma.wishlist.deleteMany()
    await prisma.address.deleteMany()
    await prisma.session.deleteMany()
    await prisma.account.deleteMany()
    await prisma.verificationToken.deleteMany()

    const result = await prisma.user.deleteMany()

    colorLog('green', `✅ Deleted ALL ${result.count} users and related data`)
    return true
  } catch (error) {
    colorLog('red', `❌ Nuclear method failed: ${error.message}`)
    return false
  }
}

// Method 4: Drop and recreate users collection (MongoDB specific)
async function fixMethod4() {
  colorLog('red', '🗑️  Method 4: Drop and recreate users collection')

  const confirmed = await askConfirmation('This will DROP the entire users collection. Are you sure?')
  if (!confirmed) {
    colorLog('blue', '❌ Collection drop cancelled.')
    return false
  }

  try {
    // Use raw MongoDB commands to drop the collection
    await prisma.$runCommandRaw({
      drop: 'users'
    })

    colorLog('green', '✅ Dropped users collection')

    // Recreate the collection by creating a dummy user and deleting it
    try {
      const tempUser = await prisma.user.create({
        data: {
          name: 'temp',
          email: 'temp@temp.com',
          phoneNumber: '+233999999999'
        }
      })

      await prisma.user.delete({
        where: { id: tempUser.id }
      })

      colorLog('green', '✅ Recreated users collection')
    } catch (error) {
      colorLog('yellow', '⚠️  Collection recreation may have failed, but this is often okay')
    }

    return true
  } catch (error) {
    colorLog('red', `❌ Method 4 failed: ${error.message}`)
    return false
  }
}

// Create admin user after cleanup
async function createAdminUser() {
  colorLog('yellow', '👤 Creating admin user...')

  try {
    const bcrypt = require('bcryptjs')
    const hashedPassword = await bcrypt.hash('admin123', 12)

    const admin = await prisma.user.create({
      data: {
        name: 'Admin User',
        email: 'admin@singlespine.com',
        password: hashedPassword,
        phoneNumber: '+233200000000',
        role: 'ADMIN',
        emailVerified: new Date(),
        phoneVerified: new Date()
      }
    })

    colorLog('green', '✅ Admin user created successfully!')
    colorLog('cyan', '   Email: admin@singlespine.com')
    colorLog('cyan', '   Password: admin123')
    colorLog('cyan', '   Phone: +233200000000')

    return admin
  } catch (error) {
    colorLog('red', `❌ Failed to create admin user: ${error.message}`)
    return null
  }
}

// Test the fix by running prisma db push
async function testFix() {
  colorLog('yellow', '🧪 Testing the fix by running Prisma DB push...')

  const { spawn } = require('child_process')

  return new Promise((resolve) => {
    const process = spawn('npx', ['prisma', 'db', 'push'], {
      stdio: 'pipe',
      shell: true
    })

    let output = ''
    let errorOutput = ''

    process.stdout.on('data', (data) => {
      output += data.toString()
    })

    process.stderr.on('data', (data) => {
      errorOutput += data.toString()
    })

    process.on('close', (code) => {
      if (code === 0) {
        colorLog('green', '✅ Prisma DB push successful! Unique constraint applied.')
        resolve(true)
      } else {
        colorLog('red', '❌ Prisma DB push failed!')
        console.log('Output:', output)
        console.log('Error:', errorOutput)
        resolve(false)
      }
    })
  })
}

// Main function
async function main() {
  colorLog('magenta', '💥 Nuclear Fix Script for Phone Number Issues')
  colorLog('red', '================================================')
  console.log('')

  colorLog('red', '⚠️  WARNING: This script contains destructive operations!')
  colorLog('yellow', 'It will attempt to fix phone number unique constraint issues')
  colorLog('yellow', 'by using increasingly aggressive methods.')
  console.log('')

  // Check current state
  const state = await checkDatabaseState()
  if (state.error) {
    colorLog('red', '❌ Cannot proceed due to database connection issues')
    return
  }

  console.log('')

  if (state.nullPhoneCount <= 1) {
    colorLog('green', '✅ No multiple null phone numbers detected')
    colorLog('blue', 'Trying Prisma DB push directly...')

    const success = await testFix()
    if (success) {
      colorLog('bright', '🎉 Issue resolved! No nuclear option needed.')
      return
    }
  }

  colorLog('yellow', '🔧 Attempting fix methods in order of severity...')
  console.log('')

  // Method 1: Delete users with null phone numbers
  if (state.nullPhoneCount > 0) {
    const method1Success = await fixMethod1()
    if (method1Success) {
      const testSuccess = await testFix()
      if (testSuccess) {
        colorLog('bright', '🎉 Fixed with Method 1!')
        await createAdminUser()
        return
      }
    }
  }

  // Method 2: Assign placeholder phone numbers
  console.log('')
  const method2Success = await fixMethod2()
  if (method2Success) {
    const testSuccess = await testFix()
    if (testSuccess) {
      colorLog('bright', '🎉 Fixed with Method 2!')
      return
    }
  }

  // Method 3: Nuclear - delete all users
  console.log('')
  colorLog('red', '💥 Previous methods failed. Proceeding to nuclear options...')
  const method3Success = await fixMethod3()
  if (method3Success) {
    const testSuccess = await testFix()
    if (testSuccess) {
      colorLog('bright', '🎉 Fixed with Nuclear Method 3!')
      await createAdminUser()
      return
    }
  }

  // Method 4: Drop collection
  console.log('')
  const method4Success = await fixMethod4()
  if (method4Success) {
    const testSuccess = await testFix()
    if (testSuccess) {
      colorLog('bright', '🎉 Fixed with Nuclear Method 4!')
      await createAdminUser()
      return
    }
  }

  // If all methods fail
  console.log('')
  colorLog('red', '❌ All fix methods failed!')
  colorLog('yellow', 'Possible solutions:')
  console.log('1. Check your MongoDB connection')
  console.log('2. Manually connect to MongoDB and drop the users collection')
  console.log('3. Create a new database')
  console.log('4. Contact your database administrator')
}

// Handle cleanup on exit
process.on('SIGINT', async () => {
  colorLog('yellow', '\n🛑 Nuclear fix interrupted by user.')
  await prisma.$disconnect()
  process.exit(0)
})

// Run the script
if (require.main === module) {
  main()
    .then(async () => {
      await prisma.$disconnect()
      colorLog('blue', '👋 Nuclear fix completed.')
    })
    .catch(async (error) => {
      colorLog('red', `❌ Nuclear fix failed: ${error.message}`)
      await prisma.$disconnect()
      process.exit(1)
    })
}

module.exports = { fixMethod1, fixMethod2, fixMethod3, fixMethod4, createAdminUser, testFix }
