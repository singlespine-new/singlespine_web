#!/usr/bin/env node

/**
 * Database Inspection Script for Singlespine
 *
 * This script provides detailed inspection of the database to identify
 * issues with phone numbers, duplicates, and data integrity.
 *
 * Usage:
 *   node scripts/inspect-db.js
 */

const { PrismaClient } = require('@prisma/client')

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

// Inspect all users and their phone numbers
async function inspectUsers() {
  colorLog('cyan', '👥 Inspecting all users...')

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        role: true,
        createdAt: true,
        emailVerified: true,
        phoneVerified: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    colorLog('blue', `📊 Total users found: ${users.length}`)
    console.log('')

    if (users.length === 0) {
      colorLog('yellow', '⚠️  No users found in database')
      return { users: [], phoneStats: {} }
    }

    // Analyze phone numbers
    const phoneStats = {
      total: users.length,
      withPhone: 0,
      withoutPhone: 0,
      nullPhone: 0,
      undefinedPhone: 0,
      emptyPhone: 0,
      uniquePhones: new Set(),
      duplicatePhones: {},
      phoneFormats: {}
    }

    users.forEach(user => {
      // Check phone number status
      if (user.phoneNumber === null) {
        phoneStats.nullPhone++
      } else if (user.phoneNumber === undefined) {
        phoneStats.undefinedPhone++
      } else if (user.phoneNumber === '') {
        phoneStats.emptyPhone++
      } else {
        phoneStats.withPhone++
        phoneStats.uniquePhones.add(user.phoneNumber)

        // Track duplicates
        if (!phoneStats.duplicatePhones[user.phoneNumber]) {
          phoneStats.duplicatePhones[user.phoneNumber] = []
        }
        phoneStats.duplicatePhones[user.phoneNumber].push(user)

        // Track phone formats
        const format = getPhoneFormat(user.phoneNumber)
        phoneStats.phoneFormats[format] = (phoneStats.phoneFormats[format] || 0) + 1
      }

      if (!user.phoneNumber) {
        phoneStats.withoutPhone++
      }
    })

    // Display detailed user information
    colorLog('yellow', '📋 User Details:')
    users.forEach((user, index) => {
      const phoneDisplay = user.phoneNumber === null ? 'NULL' :
                          user.phoneNumber === undefined ? 'UNDEFINED' :
                          user.phoneNumber === '' ? 'EMPTY' :
                          user.phoneNumber || 'NO_PHONE'

      console.log(`  ${index + 1}. ${user.name || 'No Name'} (${user.role})`)
      console.log(`     ID: ${user.id}`)
      console.log(`     Email: ${user.email || 'No Email'}`)
      console.log(`     Phone: ${phoneDisplay}`)
      console.log(`     Created: ${user.createdAt}`)
      console.log(`     Email Verified: ${user.emailVerified ? 'Yes' : 'No'}`)
      console.log(`     Phone Verified: ${user.phoneVerified ? 'Yes' : 'No'}`)
      console.log('')
    })

    return { users, phoneStats }

  } catch (error) {
    colorLog('red', `❌ Error inspecting users: ${error.message}`)
    throw error
  }
}

// Get phone number format type
function getPhoneFormat(phone) {
  if (!phone) return 'NO_PHONE'

  const cleaned = phone.replace(/\D/g, '')

  if (cleaned.startsWith('233')) {
    return phone.startsWith('+') ? 'INTERNATIONAL_PLUS' : 'INTERNATIONAL_NO_PLUS'
  } else if (cleaned.startsWith('0') && cleaned.length === 10) {
    return 'GHANA_LOCAL'
  } else if (cleaned.length === 9) {
    return 'GHANA_NO_ZERO'
  } else {
    return 'UNKNOWN_FORMAT'
  }
}

// Analyze phone number statistics
function analyzePhoneStats(phoneStats) {
  colorLog('cyan', '📊 Phone Number Analysis:')
  console.log(`  Total Users: ${phoneStats.total}`)
  console.log(`  Users with Phone Numbers: ${phoneStats.withPhone}`)
  console.log(`  Users without Phone Numbers: ${phoneStats.withoutPhone}`)
  console.log(`  NULL Phone Numbers: ${phoneStats.nullPhone}`)
  console.log(`  UNDEFINED Phone Numbers: ${phoneStats.undefinedPhone}`)
  console.log(`  EMPTY Phone Numbers: ${phoneStats.emptyPhone}`)
  console.log(`  Unique Phone Numbers: ${phoneStats.uniquePhones.size}`)
  console.log('')

  // Phone formats
  if (Object.keys(phoneStats.phoneFormats).length > 0) {
    colorLog('blue', '📱 Phone Number Formats:')
    Object.entries(phoneStats.phoneFormats).forEach(([format, count]) => {
      console.log(`  ${format}: ${count}`)
    })
    console.log('')
  }

  // Duplicates
  const duplicates = Object.entries(phoneStats.duplicatePhones).filter(([phone, users]) => users.length > 1)
  if (duplicates.length > 0) {
    colorLog('red', `❌ Duplicate Phone Numbers Found: ${duplicates.length}`)
    duplicates.forEach(([phone, users]) => {
      console.log(`  📱 ${phone}: ${users.length} users`)
      users.forEach(user => {
        console.log(`    - ${user.name || 'No Name'} (${user.email || 'No Email'}) - ${user.id}`)
      })
    })
    console.log('')
  } else {
    colorLog('green', '✅ No duplicate phone numbers found')
  }

  return duplicates
}

// Check MongoDB indexes
async function checkIndexes() {
  colorLog('cyan', '🔍 Checking MongoDB indexes...')

  try {
    // Try to get index information using raw MongoDB queries
    const result = await prisma.$runCommandRaw({
      listIndexes: 'users'
    })

    if (result && result.cursor && result.cursor.firstBatch) {
      colorLog('blue', '📋 Current indexes on users collection:')
      result.cursor.firstBatch.forEach(index => {
        console.log(`  - ${index.name}: ${JSON.stringify(index.key)}`)
        if (index.unique) {
          console.log(`    (UNIQUE INDEX)`)
        }
      })
      console.log('')
    }

  } catch (error) {
    colorLog('yellow', '⚠️  Could not retrieve index information directly')
    colorLog('blue', 'This is normal and not an error.')
    console.log('')
  }
}

// Test unique constraint violation
async function testUniqueConstraint() {
  colorLog('cyan', '🧪 Testing potential unique constraint issues...')

  try {
    // Count all users with null phone numbers
    const nullPhoneCount = await prisma.user.count({
      where: {
        phoneNumber: null
      }
    })

    // Count all users with undefined phone numbers (should be 0 in MongoDB)
    const undefinedPhoneCount = await prisma.user.count({
      where: {
        phoneNumber: undefined
      }
    })

    // Count all users with empty string phone numbers
    const emptyPhoneCount = await prisma.user.count({
      where: {
        phoneNumber: ''
      }
    })

    console.log(`  Users with phoneNumber = null: ${nullPhoneCount}`)
    console.log(`  Users with phoneNumber = undefined: ${undefinedPhoneCount}`)
    console.log(`  Users with phoneNumber = '': ${emptyPhoneCount}`)
    console.log('')

    if (nullPhoneCount > 1) {
      colorLog('red', `❌ ISSUE FOUND: ${nullPhoneCount} users have null phone numbers`)
      colorLog('yellow', '   MongoDB cannot create unique index with multiple null values')
      return { hasIssue: true, nullCount: nullPhoneCount }
    } else {
      colorLog('green', '✅ No null phone number issues detected')
      return { hasIssue: false, nullCount: nullPhoneCount }
    }

  } catch (error) {
    colorLog('red', `❌ Error testing unique constraint: ${error.message}`)
    return { hasIssue: true, error: error.message }
  }
}

// Suggest fixes
function suggestFixes(duplicates, constraintTest) {
  colorLog('cyan', '💡 Suggested Fixes:')
  console.log('')

  if (constraintTest.hasIssue && constraintTest.nullCount > 1) {
    colorLog('yellow', '1. Fix NULL phone number issue:')
    console.log('   - Delete users with null phone numbers that have no email')
    console.log('   - Or assign unique placeholder values to null phone numbers')
    console.log('   - Command: npm run db:clear:users')
    console.log('')
  }

  if (duplicates.length > 0) {
    colorLog('yellow', '2. Fix duplicate phone numbers:')
    console.log('   - Keep the most recent user for each phone number')
    console.log('   - Delete or update older duplicate entries')
    console.log('   - Command: npm run db:fix:phones')
    console.log('')
  }

  colorLog('yellow', '3. Database reset options:')
  console.log('   - Complete reset: npm run db:reset')
  console.log('   - Clear users only: npm run db:clear:users')
  console.log('   - Clear test data: npm run db:clear:test')
  console.log('')

  colorLog('green', '4. After fixing data:')
  console.log('   - Run: npx prisma db push')
  console.log('   - This will add the unique constraint back')
  console.log('')
}

// Show database collections info
async function showCollectionInfo() {
  colorLog('cyan', '🗃️  Database Collections Overview:')

  try {
    const collections = [
      'users',
      'accounts',
      'sessions',
      'verification_tokens',
      'addresses',
      'wishlists',
      'products',
      'product_variants',
      'cart_items',
      'orders',
      'order_items',
      'payments'
    ]

    for (const collection of collections) {
      try {
        let count = 0
        switch (collection) {
          case 'users':
            count = await prisma.user.count()
            break
          case 'accounts':
            count = await prisma.account.count()
            break
          case 'sessions':
            count = await prisma.session.count()
            break
          case 'verification_tokens':
            count = await prisma.verificationToken.count()
            break
          case 'addresses':
            count = await prisma.address.count()
            break
          case 'wishlists':
            count = await prisma.wishlist.count()
            break
          case 'products':
            count = await prisma.product.count()
            break
          case 'product_variants':
            count = await prisma.productVariant.count()
            break
          case 'cart_items':
            count = await prisma.cartItem.count()
            break
          case 'orders':
            count = await prisma.order.count()
            break
          case 'order_items':
            count = await prisma.orderItem.count()
            break
          case 'payments':
            count = await prisma.payment.count()
            break
          default:
            count = 0
        }

        console.log(`  ${collection.padEnd(20)}: ${count} records`)
      } catch (error) {
        console.log(`  ${collection.padEnd(20)}: Error (${error.message})`)
      }
    }
    console.log('')

  } catch (error) {
    colorLog('red', `❌ Error getting collection info: ${error.message}`)
  }
}

// Main inspection function
async function main() {
  colorLog('magenta', '🔍 Singlespine Database Inspector')
  colorLog('cyan', '=================================')
  console.log('')

  try {
    // Show collections overview
    await showCollectionInfo()

    // Inspect users in detail
    const { users, phoneStats } = await inspectUsers()

    // Analyze phone statistics
    const duplicates = analyzePhoneStats(phoneStats)

    // Check MongoDB indexes
    await checkIndexes()

    // Test unique constraint issues
    const constraintTest = await testUniqueConstraint()

    // Suggest fixes
    suggestFixes(duplicates, constraintTest)

    colorLog('bright', '🎯 Inspection completed!')

  } catch (error) {
    colorLog('red', `❌ Inspection failed: ${error.message}`)
    console.error(error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Handle cleanup on exit
process.on('SIGINT', async () => {
  colorLog('yellow', '\n🛑 Inspection interrupted by user.')
  await prisma.$disconnect()
  process.exit(0)
})

// Run the script
if (require.main === module) {
  main().catch(async (error) => {
    colorLog('red', `❌ Script failed: ${error.message}`)
    await prisma.$disconnect()
    process.exit(1)
  })
}

module.exports = { inspectUsers, analyzePhoneStats, testUniqueConstraint }
