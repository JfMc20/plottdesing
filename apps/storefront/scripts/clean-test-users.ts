/**
 * Script para limpiar usuarios de prueba
 *
 * Uso:
 * npx tsx scripts/clean-test-users.ts [email]
 *
 * Ejemplos:
 * npx tsx scripts/clean-test-users.ts test@test.com
 * npx tsx scripts/clean-test-users.ts --all-test  (borra todos los emails de prueba)
 */

import { PrismaClient } from '@prisma/client'
import { createClient } from '@supabase/supabase-js'

const prisma = new PrismaClient()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Necesitas agregar esto al .env
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

async function deleteUserFromSupabase(email: string) {
  try {
    // Buscar usuario por email en Supabase
    const { data: users, error: listError } = await supabase.auth.admin.listUsers()

    if (listError) {
      console.error('❌ Error listing Supabase users:', listError.message)
      return false
    }

    if (!users) {
      console.log(`ℹ️  No users data returned`)
      return false
    }

    const user = users.users.find(u => u.email === email)

    if (!user) {
      console.log(`ℹ️  User ${email} not found in Supabase`)
      return true
    }

    // Borrar de Supabase
    const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id)

    if (deleteError) {
      console.error(`❌ Error deleting ${email} from Supabase:`, deleteError.message)
      return false
    }

    console.log(`✅ Deleted ${email} from Supabase (ID: ${user.id})`)
    return true
  } catch (error) {
    console.error('❌ Error in Supabase operation:', error)
    return false
  }
}

async function deleteUserFromPrisma(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        cart: {
          include: {
            items: true,
          },
        },
        orders: true,
        addresses: true,
        notifications: true,
        productReviews: true,
      },
    })

    if (!user) {
      console.log(`ℹ️  User ${email} not found in Prisma`)
      return true
    }

    // Borrar cart items primero
    if (user.cart) {
      await prisma.cartItem.deleteMany({
        where: { cartId: user.cart.userId },
      })
      console.log(`   - Deleted ${user.cart.items.length} cart items`)

      await prisma.cart.delete({
        where: { userId: user.id },
      })
      console.log(`   - Deleted cart`)
    }

    // Borrar notificaciones
    if (user.notifications.length > 0) {
      await prisma.notification.deleteMany({
        where: { userId: user.id },
      })
      console.log(`   - Deleted ${user.notifications.length} notifications`)
    }

    // Borrar reviews
    if (user.productReviews.length > 0) {
      await prisma.productReview.deleteMany({
        where: { userId: user.id },
      })
      console.log(`   - Deleted ${user.productReviews.length} reviews`)
    }

    // Borrar addresses
    if (user.addresses.length > 0) {
      await prisma.address.deleteMany({
        where: { userId: user.id },
      })
      console.log(`   - Deleted ${user.addresses.length} addresses`)
    }

    // Borrar orders (cuidado: esto borra todo el historial)
    if (user.orders.length > 0) {
      // Primero borrar orderItems
      for (const order of user.orders) {
        await prisma.orderItem.deleteMany({
          where: { orderId: order.id },
        })
      }

      await prisma.order.deleteMany({
        where: { userId: user.id },
      })
      console.log(`   - Deleted ${user.orders.length} orders`)
    }

    // Finalmente borrar el usuario
    await prisma.user.delete({
      where: { id: user.id },
    })

    console.log(`✅ Deleted ${email} from Prisma (ID: ${user.id})`)
    return true
  } catch (error) {
    console.error('❌ Error in Prisma operation:', error)
    return false
  }
}

async function cleanUser(email: string) {
  console.log(`\n🧹 Cleaning user: ${email}`)
  console.log('─────────────────────────────────────────')

  // Primero Prisma, luego Supabase
  const prismaSuccess = await deleteUserFromPrisma(email)
  const supabaseSuccess = await deleteUserFromSupabase(email)

  if (prismaSuccess && supabaseSuccess) {
    console.log(`✨ User ${email} completely removed!\n`)
    return true
  } else {
    console.log(`⚠️  User ${email} partially removed (check errors above)\n`)
    return false
  }
}

async function cleanAllTestUsers() {
  console.log('\n🧹 Cleaning all test users...')
  console.log('═════════════════════════════════════════\n')

  // Patrones comunes de emails de prueba
  const testPatterns = [
    'test@',
    'demo@',
    'prueba@',
    '@test.com',
    '@example.com',
    '@mailinator.com',
    '@guerrillamail.com',
  ]

  // Buscar usuarios que coincidan
  const allUsers = await prisma.user.findMany({
    select: { email: true },
  })

  const testUsers = allUsers.filter(user => {
    if (!user.email) return false
    return testPatterns.some(pattern => user.email!.includes(pattern))
  })

  console.log(`Found ${testUsers.length} test users\n`)

  let successCount = 0
  for (const user of testUsers) {
    if (user.email) {
      const success = await cleanUser(user.email)
      if (success) successCount++
    }
  }

  console.log(`\n✨ Cleaned ${successCount}/${testUsers.length} test users`)
}

async function main() {
  const args = process.argv.slice(2)

  if (args.length === 0) {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║          Clean Test Users - Usage Instructions            ║
╚═══════════════════════════════════════════════════════════╝

Usage:
  npx tsx scripts/clean-test-users.ts [email|--all-test]

Examples:
  npx tsx scripts/clean-test-users.ts test@test.com
  npx tsx scripts/clean-test-users.ts josem.csegurity@gmail.com
  npx tsx scripts/clean-test-users.ts --all-test

Options:
  [email]      Delete specific user by email
  --all-test   Delete all test users (test@*, demo@*, @test.com, etc.)

⚠️  Important:
  - This will delete the user from BOTH Supabase and Prisma
  - This action cannot be undone
  - Make sure you have SUPABASE_SERVICE_ROLE_KEY in your .env
    `)
    process.exit(0)
  }

  const command = args[0]

  if (command === '--all-test') {
    const confirm = process.argv[3]
    if (confirm !== '--confirm') {
      console.log('\n⚠️  This will delete ALL test users!')
      console.log('To confirm, run:')
      console.log('npx tsx scripts/clean-test-users.ts --all-test --confirm\n')
      process.exit(0)
    }
    await cleanAllTestUsers()
  } else {
    // Email específico
    const email = command
    if (!email.includes('@')) {
      console.error('❌ Invalid email format')
      process.exit(1)
    }

    await cleanUser(email)
  }

  await prisma.$disconnect()
}

main().catch(error => {
  console.error('💥 Fatal error:', error)
  process.exit(1)
})
