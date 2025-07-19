import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testDatabaseConnection() {
  try {
    console.log('🔍 Testing database connection...')

    // Test basic connection
    await prisma.$connect()
    console.log('✅ Database connected successfully!')

    // Test user count
    const userCount = await prisma.user.count()
    console.log(`👥 Total users: ${userCount}`)

    // Test product count
    const productCount = await prisma.product.count()
    console.log(`📦 Total products: ${productCount}`)

    // Test creating a simple user (will be cleaned up)
    const testUser = await prisma.user.create({
      data: {
        name: 'Test User',
        email: `test-${Date.now()}@example.com`,
        role: 'USER'
      }
    })
    console.log(`✅ Test user created with ID: ${testUser.id}`)

    // Clean up test user
    await prisma.user.delete({
      where: { id: testUser.id }
    })
    console.log('🧹 Test user cleaned up')

    console.log('🎉 All database tests passed!')

  } catch (error) {
    console.error('❌ Database connection test failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
    console.log('🔌 Database disconnected')
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testDatabaseConnection()
    .then(() => {
      console.log('✨ Database test completed successfully!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Database test failed:', error)
      process.exit(1)
    })
}

export { testDatabaseConnection }
