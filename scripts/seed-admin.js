const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function seedAdmin() {
    const email = 'admin@singlespine.com'
    const password = 'admin123'
    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.upsert({
        where: { email },
        update: { role: 'ADMIN', password: hashedPassword },
        create: {
            email,
            name: 'Singlespine Admin',
            password: hashedPassword,
            role: 'ADMIN',
        },
    })

    console.log(`✅ Admin user created/updated:`)
    console.log(`   Email: ${user.email}`)
    console.log(`   Role: ${user.role}`)
    console.log(`   ID: ${user.id}`)
}

seedAdmin()
    .catch(e => { console.error('❌ Error:', e); process.exit(1) })
    .finally(() => prisma.$disconnect())
