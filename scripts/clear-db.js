#!/usr/bin/env node

/**
 * Simple Database Cleanup Script for Singlespine
 *
 * Usage:
 *   node scripts/clear-db.js all
 *   node scripts/clear-db.js users
 *   node scripts/clear-db.js products
 *   node scripts/clear-db.js orders
 *   node scripts/clear-db.js test
 *   node scripts/clear-db.js sessions
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

// Clear all data
async function clearAllData() {
  colorLog('red', '🚨 WARNING: This will delete ALL data from the database!')

  const confirmed = await askConfirmation('Are you absolutely sure?')
  if (!confirmed) {
    colorLog('blue', '❌ Operation cancelled.')
    return
  }

  try {
    colorLog('yellow', '🧹 Clearing all data...')

    await prisma.payment.deleteMany()
    await prisma.orderItem.deleteMany()
    await prisma.order.deleteMany()
    await prisma.cartItem.deleteMany()
    await prisma.wishlist.deleteMany()
    await prisma.productVariant.deleteMany()
    await prisma.product.deleteMany()
    await prisma.address.deleteMany()
    await prisma.session.deleteMany()
    await prisma.account.deleteMany()
    await prisma.verificationToken.deleteMany()
    await prisma.user.deleteMany()

    colorLog('green', '✅ All data cleared!')
  } catch (error) {
    colorLog('red', `❌ Error: ${error.message}`)
  }
}

// Clear user data
async function clearUserData() {
  const confirmed = await askConfirmation('Clear all user data?')
  if (!confirmed) return

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

    colorLog('green', '✅ User data cleared!')
  } catch (error) {
    colorLog('red', `❌ Error: ${error.message}`)
  }
}

// Clear product data
async function clearProductData() {
  const confirmed = await askConfirmation('Clear all product data?')
  if (!confirmed) return

  try {
    await prisma.cartItem.deleteMany()
    await prisma.wishlist.deleteMany()
    await prisma.orderItem.deleteMany()
    await prisma.productVariant.deleteMany()
    await prisma.product.deleteMany()

    colorLog('green', '✅ Product data cleared!')
  } catch (error) {
    colorLog('red', `❌ Error: ${error.message}`)
  }
}

// Clear order data
async function clearOrderData() {
  const confirmed = await askConfirmation('Clear all order data?')
  if (!confirmed) return

  try {
    await prisma.payment.deleteMany()
    await prisma.orderItem.deleteMany()
    await prisma.order.deleteMany()

    colorLog('green', '✅ Order data cleared!')
  } catch (error) {
    colorLog('red', `❌ Error: ${error.message}`)
  }
}

// Clear test data (preserve admin users)
async function clearTestData() {
  const confirmed = await askConfirmation('Clear test data (preserve admin users)?')
  if (!confirmed) return

  try {
    await prisma.payment.deleteMany()
    await prisma.cartItem.deleteMany()
    await prisma.session.deleteMany()
    await prisma.verificationToken.deleteMany()

    // Clear non-admin users
    await prisma.user.deleteMany({
      where: {
        role: { not: 'ADMIN' }
      }
    })

    colorLog('green', '✅ Test data cleared!')
  } catch (error) {
    colorLog('red', `❌ Error: ${error.message}`)
  }
}

// Clear sessions only
async function clearSessions() {
  try {
    await prisma.session.deleteMany()
    await prisma.verificationToken.deleteMany()
    colorLog('green', '✅ Sessions cleared!')
  } catch (error) {
    colorLog('red', `❌ Error: ${error.message}`)
  }
}

// Show stats
async function showStats() {
  try {
    const stats = {
      users: await prisma.user.count(),
      products: await prisma.product.count(),
      orders: await prisma.order.count(),
      cartItems: await prisma.cartItem.count(),
      sessions: await prisma.session.count(),
    }

    colorLog('cyan', '📊 Database Stats:')
    console.log(`  Users: ${stats.users}`)
    console.log(`  Products: ${stats.products}`)
    console.log(`  Orders: ${stats.orders}`)
    console.log(`  Cart Items: ${stats.cartItems}`)
    console.log(`  Sessions: ${stats.sessions}`)
  } catch (error) {
    colorLog('red', `❌ Error: ${error.message}`)
  }
}

async function main() {
  const command = process.argv[2]

  colorLog('magenta', '🗃️  Database Cleanup Tool')
  console.log('')

  await showStats()
  console.log('')

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
    default:
      colorLog('yellow', 'Usage: node scripts/clear-db.js [command]')
      console.log('Commands: all, users, products, orders, test, sessions')
      break
  }

  await prisma.$disconnect()
}

main().catch(async (error) => {
  colorLog('red', `❌ Error: ${error.message}`)
  await prisma.$disconnect()
  process.exit(1)
})
