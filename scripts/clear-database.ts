#!/usr/bin/env ts-node

/**
 * Database Cleanup Script for Singlespine
 *
 * This script provides various options to clean up the database:
 * - Clear all data (complete reset)
 * - Clear specific collections
 * - Clear user data only
 * - Clear test data
 *
 * Usage:
 *   npm run db:clear:all        # Clear all data
 *   npm run db:clear:users      # Clear only user-related data
 *   npm run db:clear:products   # Clear only product data
 *   npm run db:clear:orders     # Clear only order data
 *   npm run db:clear:test       # Clear test/dev data only
 */

import { PrismaClient } from '@prisma/client'
import * as readline from 'readline'

const prisma = new PrismaClient()

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m',
  bright: '\x1b[1m'
}

// Helper function to create colored output
const colorLog = (color: keyof typeof colors, message: string) => {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

// Helper function to ask for confirmation
const askConfirmation = (question: string): Promise<boolean> => {
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

// Clear all data from the database
async function clearAllData() {
  colorLog('red', '🚨 WARNING: This will delete ALL data from the database!')
  colorLog('yellow', 'This includes:')
  console.log('  - All users and authentication data')
  console.log('  - All products and variants')
  console.log('  - All orders and payments')
  console.log('  - All cart items and wishlists')
  console.log('  - All addresses')
  console.log('')

  const confirmed = await askConfirmation('Are you absolutely sure you want to delete ALL data?')

  if (!confirmed) {
    colorLog('blue', '❌ Operation cancelled.')
    return
  }

  try {
    colorLog('yellow', '🧹 Starting complete database cleanup...')

    // Delete in correct order to avoid foreign key constraints
    await prisma.payment.deleteMany()
    colorLog('green', '✅ Cleared payments')

    await prisma.orderItem.deleteMany()
    colorLog('green', '✅ Cleared order items')

    await prisma.order.deleteMany()
    colorLog('green', '✅ Cleared orders')

    await prisma.cartItem.deleteMany()
    colorLog('green', '✅ Cleared cart items')

    await prisma.wishlist.deleteMany()
    colorLog('green', '✅ Cleared wishlist items')

    await prisma.productVariant.deleteMany()
    colorLog('green', '✅ Cleared product variants')

    await prisma.product.deleteMany()
    colorLog('green', '✅ Cleared products')

    await prisma.address.deleteMany()
    colorLog('green', '✅ Cleared addresses')

    await prisma.session.deleteMany()
    colorLog('green', '✅ Cleared sessions')

    await prisma.account.deleteMany()
    colorLog('green', '✅ Cleared accounts')

    await prisma.verificationToken.deleteMany()
    colorLog('green', '✅ Cleared verification tokens')

    await prisma.user.deleteMany()
    colorLog('green', '✅ Cleared users')

    colorLog('bright', '🎉 Database completely cleared!')

  } catch (error) {
    colorLog('red', `❌ Error clearing database: ${error}`)
    throw error
  }
}

// Clear only user-related data
async function clearUserData() {
  colorLog('yellow', '🧹 Clearing user-related data...')
  colorLog('cyan', 'This will delete:')
  console.log('  - All user accounts and sessions')
  console.log('  - All cart items and wishlists')
  console.log('  - All addresses')
  console.log('  - All orders and payments')
  console.log('')

  const confirmed = await askConfirmation('Do you want to clear all user data?')

  if (!confirmed) {
    colorLog('blue', '❌ Operation cancelled.')
    return
  }

  try {
    await prisma.payment.deleteMany()
    await prisma.orderItem.deleteMany()
    await prisma.order.deleteMany()
    await prisma.cartItem.deleteMany()
    await prisma.wishlist.deleteMany()
    await prisma.address.deleteMany()
    await prisma.session.deleteMany()
    await prisma.account.deleteMany()
    await prisma.verificationToken.deleteMany()
    await prisma.user.deleteMany()

    colorLog('green', '✅ User data cleared successfully!')

  } catch (error) {
    colorLog('red', `❌ Error clearing user data: ${error}`)
    throw error
  }
}

// Clear only product data
async function clearProductData() {
  colorLog('yellow', '🧹 Clearing product data...')
  colorLog('cyan', 'This will delete:')
  console.log('  - All products and variants')
  console.log('  - Associated cart items, wishlist items, and order items')
  console.log('')

  const confirmed = await askConfirmation('Do you want to clear all product data?')

  if (!confirmed) {
    colorLog('blue', '❌ Operation cancelled.')
    return
  }

  try {
    await prisma.cartItem.deleteMany()
    await prisma.wishlist.deleteMany()
    await prisma.orderItem.deleteMany()
    await prisma.productVariant.deleteMany()
    await prisma.product.deleteMany()

    colorLog('green', '✅ Product data cleared successfully!')

  } catch (error) {
    colorLog('red', `❌ Error clearing product data: ${error}`)
    throw error
  }
}

// Clear only order data
async function clearOrderData() {
  colorLog('yellow', '🧹 Clearing order data...')
  colorLog('cyan', 'This will delete:')
  console.log('  - All orders and order items')
  console.log('  - All payments')
  console.log('  - Cart items will be preserved')
  console.log('')

  const confirmed = await askConfirmation('Do you want to clear all order data?')

  if (!confirmed) {
    colorLog('blue', '❌ Operation cancelled.')
    return
  }

  try {
    await prisma.payment.deleteMany()
    await prisma.orderItem.deleteMany()
    await prisma.order.deleteMany()

    colorLog('green', '✅ Order data cleared successfully!')

  } catch (error) {
    colorLog('red', `❌ Error clearing order data: ${error}`)
    throw error
  }
}

// Clear test/development data (preserve admin users)
async function clearTestData() {
  colorLog('yellow', '🧹 Clearing test/development data...')
  colorLog('cyan', 'This will delete:')
  console.log('  - Test user accounts (preserving admin users)')
  console.log('  - All cart items and temporary data')
  console.log('  - Test orders and payments')
  console.log('  - Sessions and verification tokens')
  console.log('')

  const confirmed = await askConfirmation('Do you want to clear test data?')

  if (!confirmed) {
    colorLog('blue', '❌ Operation cancelled.')
    return
  }

  try {
    // Clear temporary data
    await prisma.payment.deleteMany()
    await prisma.cartItem.deleteMany()
    await prisma.session.deleteMany()
    await prisma.verificationToken.deleteMany()

    // Clear test orders (keep only delivered orders if needed)
    await prisma.orderItem.deleteMany({
      where: {
        order: {
          status: {
            in: ['PENDING', 'CONFIRMED', 'PROCESSING', 'CANCELLED']
          }
        }
      }
    })

    await prisma.order.deleteMany({
      where: {
        status: {
          in: ['PENDING', 'CONFIRMED', 'PROCESSING', 'CANCELLED']
        }
      }
    })

    // Clear test users (preserve admin accounts)
    await prisma.user.deleteMany({
      where: {
        role: {
          not: 'ADMIN'
        },
        email: {
          not: {
            contains: 'admin'
          }
        }
      }
    })

    colorLog('green', '✅ Test data cleared successfully!')

  } catch (error) {
    colorLog('red', `❌ Error clearing test data: ${error}`)
    throw error
  }
}

// Clear sessions and temporary data only
async function clearSessions() {
  colorLog('yellow', '🧹 Clearing sessions and temporary data...')

  try {
    await prisma.session.deleteMany()
    await prisma.verificationToken.deleteMany()

    colorLog('green', '✅ Sessions and temporary data cleared!')

  } catch (error) {
    colorLog('red', `❌ Error clearing sessions: ${error}`)
    throw error
  }
}

// Show database statistics
async function showStats() {
  colorLog('cyan', '📊 Database Statistics:')

  try {
    const stats = {
      users: await prisma.user.count(),
      products: await prisma.product.count(),
      orders: await prisma.order.count(),
      cartItems: await prisma.cartItem.count(),
      sessions: await prisma.session.count(),
      addresses: await prisma.address.count(),
      wishlistItems: await prisma.wishlist.count(),
      payments: await prisma.payment.count()
    }

    console.log(`  Users: ${stats.users}`)
    console.log(`  Products: ${stats.products}`)
    console.log(`  Orders: ${stats.orders}`)
    console.log(`  Cart Items: ${stats.cartItems}`)
    console.log(`  Sessions: ${stats.sessions}`)
    console.log(`  Addresses: ${stats.addresses}`)
    console.log(`  Wishlist Items: ${stats.wishlistItems}`)
    console.log(`  Payments: ${stats.payments}`)
    console.log('')

  } catch (error) {
    colorLog('red', `❌ Error fetching stats: ${error}`)
  }
}

// Main function to handle command line arguments
async function main() {
  const args = process.argv.slice(2)
  const command = args[0]

  colorLog('magenta', '🗃️  Singlespine Database Cleanup Tool')
  colorLog('cyan', '=====================================')
  console.log('')

  // Show current stats first
  await showStats()

  switch (command) {
    case 'all':
      await clearAllData()
      break
    case 'users':
      await clearUserData()
      break
    case 'products':
      await clearProductData()
      break
    case 'orders':
      await clearOrderData()
      break
    case 'test':
      await clearTestData()
      break
    case 'sessions':
      await clearSessions()
      break
    case 'stats':
      // Already showed stats above
      break
    default:
      colorLog('yellow', 'Available commands:')
      console.log('  all       - Clear all data (complete reset)')
      console.log('  users     - Clear user-related data')
      console.log('  products  - Clear product data')
      console.log('  orders    - Clear order data')
      console.log('  test      - Clear test/development data')
      console.log('  sessions  - Clear sessions and temporary data')
      console.log('  stats     - Show database statistics')
      console.log('')
      colorLog('cyan', 'Usage: npm run db:clear [command]')
      console.log('')
      break
  }

  await prisma.$disconnect()
  colorLog('blue', '👋 Database connection closed.')
}

// Handle errors and cleanup
process.on('SIGINT', async () => {
  colorLog('yellow', '\n🛑 Operation interrupted by user.')
  await prisma.$disconnect()
  process.exit(0)
})

process.on('unhandledRejection', async (error) => {
  colorLog('red', `❌ Unhandled error: ${error}`)
  await prisma.$disconnect()
  process.exit(1)
})

// Run the script
if (require.main === module) {
  main().catch(async (error) => {
    colorLog('red', `❌ Script failed: ${error}`)
    await prisma.$disconnect()
    process.exit(1)
  })
}

export {
  clearAllData,
  clearUserData,
  clearProductData,
  clearOrderData,
  clearTestData,
  clearSessions,
  showStats
}
