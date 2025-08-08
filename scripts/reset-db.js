#!/usr/bin/env node

/**
 * Database Reset Script for Singlespine
 *
 * This script will:
 * 1. Clear all existing data
 * 2. Reset the database schema
 * 3. Optionally seed with sample data
 *
 * Usage:
 *   npm run db:reset          # Reset and seed
 *   npm run db:reset:clean    # Reset without seeding
 */

const { PrismaClient } = require('@prisma/client')
const { spawn } = require('child_process')
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

// Run shell command
const runCommand = (command, args = []) => {
  return new Promise((resolve, reject) => {
    const process = spawn(command, args, {
      stdio: 'inherit',
      shell: true
    })

    process.on('close', (code) => {
      if (code === 0) {
        resolve()
      } else {
        reject(new Error(`Command failed with exit code ${code}`))
      }
    })

    process.on('error', (error) => {
      reject(error)
    })
  })
}

// Clear all data from database
async function clearDatabase() {
  colorLog('yellow', '🧹 Clearing database...')

  try {
    // Clear in correct order to avoid foreign key constraints
    await prisma.payment.deleteMany()
    colorLog('blue', '  ✓ Cleared payments')

    await prisma.orderItem.deleteMany()
    colorLog('blue', '  ✓ Cleared order items')

    await prisma.order.deleteMany()
    colorLog('blue', '  ✓ Cleared orders')

    await prisma.cartItem.deleteMany()
    colorLog('blue', '  ✓ Cleared cart items')

    await prisma.wishlist.deleteMany()
    colorLog('blue', '  ✓ Cleared wishlist items')

    await prisma.productVariant.deleteMany()
    colorLog('blue', '  ✓ Cleared product variants')

    await prisma.product.deleteMany()
    colorLog('blue', '  ✓ Cleared products')

    await prisma.address.deleteMany()
    colorLog('blue', '  ✓ Cleared addresses')

    await prisma.session.deleteMany()
    colorLog('blue', '  ✓ Cleared sessions')

    await prisma.account.deleteMany()
    colorLog('blue', '  ✓ Cleared accounts')

    await prisma.verificationToken.deleteMany()
    colorLog('blue', '  ✓ Cleared verification tokens')

    await prisma.user.deleteMany()
    colorLog('blue', '  ✓ Cleared users')

    colorLog('green', '✅ Database cleared successfully!')

  } catch (error) {
    colorLog('red', `❌ Error clearing database: ${error.message}`)
    throw error
  }
}

// Reset database schema
async function resetSchema() {
  colorLog('yellow', '🔄 Resetting database schema...')

  try {
    await runCommand('npx', ['prisma', 'db', 'push', '--force-reset'])
    colorLog('green', '✅ Schema reset successfully!')
  } catch (error) {
    colorLog('red', `❌ Error resetting schema: ${error.message}`)
    throw error
  }
}

// Seed database with sample data
async function seedDatabase() {
  colorLog('yellow', '🌱 Seeding database with sample data...')

  try {
    await runCommand('npm', ['run', 'db:seed'])
    colorLog('green', '✅ Database seeded successfully!')
  } catch (error) {
    colorLog('yellow', '⚠️  Seeding failed or no seed script found')
    colorLog('blue', 'You can manually seed the database later with: npm run db:seed')
  }
}

// Create admin user
async function createAdminUser() {
  colorLog('yellow', '👤 Creating admin user...')

  try {
    const bcrypt = require('bcryptjs')
    const hashedPassword = await bcrypt.hash('admin123', 12)

    await prisma.user.create({
      data: {
        name: 'Admin User',
        email: 'admin@singlespine.com',
        password: hashedPassword,
        role: 'ADMIN',
        emailVerified: new Date(),
      }
    })

    colorLog('green', '✅ Admin user created!')
    colorLog('cyan', '   Email: admin@singlespine.com')
    colorLog('cyan', '   Password: admin123')
    colorLog('yellow', '   ⚠️  Please change the password after first login!')

  } catch (error) {
    if (error.code === 'P2002') {
      colorLog('blue', '👤 Admin user already exists, skipping...')
    } else {
      colorLog('red', `❌ Error creating admin user: ${error.message}`)
    }
  }
}

// Show final statistics
async function showFinalStats() {
  try {
    const stats = {
      users: await prisma.user.count(),
      products: await prisma.product.count(),
      orders: await prisma.order.count(),
    }

    colorLog('cyan', '📊 Final Database Stats:')
    console.log(`  Users: ${stats.users}`)
    console.log(`  Products: ${stats.products}`)
    console.log(`  Orders: ${stats.orders}`)

  } catch (error) {
    colorLog('red', `❌ Error fetching stats: ${error.message}`)
  }
}

// Main reset function
async function resetDatabase(withSeeding = true) {
  colorLog('magenta', '🗃️  Singlespine Database Reset Tool')
  colorLog('cyan', '===================================')
  console.log('')

  colorLog('red', '⚠️  WARNING: This will completely reset your database!')
  colorLog('yellow', 'This will:')
  console.log('  • Delete ALL existing data')
  console.log('  • Reset the database schema')
  if (withSeeding) {
    console.log('  • Create sample data')
    console.log('  • Create an admin user')
  }
  console.log('')

  const confirmed = await askConfirmation('Do you want to proceed with the database reset?')

  if (!confirmed) {
    colorLog('blue', '❌ Database reset cancelled.')
    return
  }

  try {
    console.log('')
    colorLog('bright', '🚀 Starting database reset...')
    console.log('')

    // Step 1: Clear existing data
    await clearDatabase()
    console.log('')

    // Step 2: Reset schema
    await resetSchema()
    console.log('')

    if (withSeeding) {
      // Step 3: Create admin user
      await createAdminUser()
      console.log('')

      // Step 4: Seed with sample data
      await seedDatabase()
      console.log('')
    }

    // Step 5: Show final stats
    await showFinalStats()
    console.log('')

    colorLog('bright', '🎉 Database reset completed successfully!')

    if (withSeeding) {
      console.log('')
      colorLog('green', '🔑 You can now log in with:')
      colorLog('cyan', '   Email: admin@singlespine.com')
      colorLog('cyan', '   Password: admin123')
    }

  } catch (error) {
    colorLog('red', `❌ Database reset failed: ${error.message}`)
    process.exit(1)
  }
}

// Handle command line arguments
async function main() {
  const args = process.argv.slice(2)
  const command = args[0]

  switch (command) {
    case 'clean':
      await resetDatabase(false)
      break
    case 'help':
    case '--help':
    case '-h':
      colorLog('yellow', 'Database Reset Tool Usage:')
      console.log('')
      console.log('  npm run db:reset         # Full reset with seeding')
      console.log('  npm run db:reset:clean   # Reset without seeding')
      console.log('')
      colorLog('cyan', 'What each option does:')
      console.log('  Full reset: Clears data → Resets schema → Creates admin → Seeds data')
      console.log('  Clean reset: Clears data → Resets schema only')
      console.log('')
      break
    default:
      await resetDatabase(true)
      break
  }

  await prisma.$disconnect()
}

// Handle cleanup on exit
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
    colorLog('red', `❌ Script failed: ${error.message}`)
    await prisma.$disconnect()
    process.exit(1)
  })
}

module.exports = { resetDatabase, clearDatabase, createAdminUser }
