#!/usr/bin/env node

/**
 * Phone Number Cleanup Script for Singlespine
 *
 * This script fixes duplicate phone number issues by:
 * 1. Finding users with duplicate phone numbers
 * 2. Keeping the most recent user for each phone number
 * 3. Removing or updating duplicate entries
 * 4. Cleaning up null phone numbers if needed
 *
 * Usage:
 *   node scripts/fix-phone-numbers.js
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
    rl.question(`${colors.yellow}${question} (type 'yes' to confirm): ${colors.reset}`, (answer) => {
      rl.close()
      resolve(answer.toLowerCase() === 'yes')
    })
  })
}

// Find duplicate phone numbers
async function findDuplicatePhoneNumbers() {
  colorLog('yellow', '🔍 Analyzing phone number duplicates...')

  try {
    const users = await prisma.user.findMany({
      where: {
        phoneNumber: {
          not: null
        }
      },
      select: {
        id: true,
        phoneNumber: true,
        createdAt: true,
        email: true,
        name: true,
        role: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Group users by phone number
    const phoneGroups = {}
    users.forEach(user => {
      if (!phoneGroups[user.phoneNumber]) {
        phoneGroups[user.phoneNumber] = []
      }
      phoneGroups[user.phoneNumber].push(user)
    })

    // Find duplicates
    const duplicates = Object.entries(phoneGroups).filter(([phone, users]) => users.length > 1)

    if (duplicates.length === 0) {
      colorLog('green', '✅ No duplicate phone numbers found!')
      return []
    }

    colorLog('red', `❌ Found ${duplicates.length} phone numbers with duplicates:`)
    console.log('')

    duplicates.forEach(([phone, users]) => {
      colorLog('cyan', `📱 Phone: ${phone}`)
      users.forEach((user, index) => {
        const marker = index === 0 ? '👑 (KEEP)' : '❌ (REMOVE)'
        console.log(`  ${marker} User: ${user.name || 'No name'} (${user.email || 'No email'}) - ${user.role} - Created: ${user.createdAt}`)
      })
      console.log('')
    })

    return duplicates

  } catch (error) {
    colorLog('red', `❌ Error finding duplicates: ${error.message}`)
    throw error
  }
}

// Remove duplicate phone numbers
async function removeDuplicatePhoneNumbers(duplicates) {
  if (duplicates.length === 0) return

  colorLog('yellow', '🧹 Preparing to remove duplicate phone numbers...')
  colorLog('cyan', 'Strategy: Keep the most recent user for each phone number')
  console.log('')

  const confirmed = await askConfirmation('Do you want to proceed with removing duplicates?')
  if (!confirmed) {
    colorLog('blue', '❌ Operation cancelled.')
    return
  }

  try {
    let removedCount = 0
    let updatedCount = 0

    for (const [phoneNumber, users] of duplicates) {
      const [keepUser, ...removeUsers] = users // Keep first (most recent), remove others

      colorLog('blue', `📱 Processing phone: ${phoneNumber}`)
      colorLog('green', `  👑 Keeping: ${keepUser.name || 'No name'} (${keepUser.email || 'No email'})`)

      for (const user of removeUsers) {
        if (user.role === 'ADMIN') {
          // Don't remove admin users, just clear their phone number
          await prisma.user.update({
            where: { id: user.id },
            data: { phoneNumber: null }
          })
          colorLog('yellow', `  ⚠️  Admin user phone cleared: ${user.name || 'No name'}`)
          updatedCount++
        } else if (user.email) {
          // If user has email, clear phone number instead of deleting
          await prisma.user.update({
            where: { id: user.id },
            data: { phoneNumber: null }
          })
          colorLog('blue', `  📧 Email user phone cleared: ${user.name || 'No name'}`)
          updatedCount++
        } else {
          // Delete users with no email and duplicate phone
          await prisma.user.delete({
            where: { id: user.id }
          })
          colorLog('red', `  🗑️  Deleted: ${user.name || 'No name'}`)
          removedCount++
        }
      }
    }

    colorLog('green', `✅ Cleanup completed!`)
    colorLog('cyan', `  📊 Users removed: ${removedCount}`)
    colorLog('cyan', `  📊 Phone numbers cleared: ${updatedCount}`)

  } catch (error) {
    colorLog('red', `❌ Error removing duplicates: ${error.message}`)
    throw error
  }
}

// Clean up null phone numbers if there are too many
async function cleanNullPhoneNumbers() {
  try {
    const nullPhoneUsers = await prisma.user.count({
      where: {
        phoneNumber: null
      }
    })

    colorLog('blue', `📊 Users with null phone numbers: ${nullPhoneUsers}`)

    if (nullPhoneUsers > 100) {
      colorLog('yellow', '⚠️  Many users have null phone numbers.')
      const shouldClean = await askConfirmation('Do you want to remove users with null phones and no email?')

      if (shouldClean) {
        const result = await prisma.user.deleteMany({
          where: {
            phoneNumber: null,
            email: null
          }
        })
        colorLog('green', `✅ Removed ${result.count} users with null phone and email`)
      }
    }

  } catch (error) {
    colorLog('red', `❌ Error cleaning null phones: ${error.message}`)
  }
}

// Show current statistics
async function showStats() {
  try {
    const stats = {
      totalUsers: await prisma.user.count(),
      usersWithPhone: await prisma.user.count({
        where: { phoneNumber: { not: null } }
      }),
      usersWithEmail: await prisma.user.count({
        where: { email: { not: null } }
      }),
      usersWithBoth: await prisma.user.count({
        where: {
          AND: [
            { phoneNumber: { not: null } },
            { email: { not: null } }
          ]
        }
      }),
      adminUsers: await prisma.user.count({
        where: { role: 'ADMIN' }
      })
    }

    colorLog('cyan', '📊 Current Database Statistics:')
    console.log(`  Total Users: ${stats.totalUsers}`)
    console.log(`  Users with Phone: ${stats.usersWithPhone}`)
    console.log(`  Users with Email: ${stats.usersWithEmail}`)
    console.log(`  Users with Both: ${stats.usersWithBoth}`)
    console.log(`  Admin Users: ${stats.adminUsers}`)
    console.log('')

  } catch (error) {
    colorLog('red', `❌ Error fetching stats: ${error.message}`)
  }
}

// Main function
async function main() {
  colorLog('magenta', '📱 Singlespine Phone Number Cleanup Tool')
  colorLog('cyan', '========================================')
  console.log('')

  try {
    // Show current stats
    await showStats()

    // Find duplicates
    const duplicates = await findDuplicatePhoneNumbers()

    if (duplicates.length > 0) {
      // Remove duplicates
      await removeDuplicatePhoneNumbers(duplicates)
      console.log('')

      // Show stats after cleanup
      colorLog('bright', '📊 Statistics after cleanup:')
      await showStats()
    }

    // Clean null phone numbers if needed
    await cleanNullPhoneNumbers()

    colorLog('green', '✅ Phone number cleanup completed!')

  } catch (error) {
    colorLog('red', `❌ Cleanup failed: ${error.message}`)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Handle cleanup on exit
process.on('SIGINT', async () => {
  colorLog('yellow', '\n🛑 Operation interrupted by user.')
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

module.exports = { findDuplicatePhoneNumbers, removeDuplicatePhoneNumbers, cleanNullPhoneNumbers }
