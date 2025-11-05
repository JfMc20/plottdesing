import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
   const TEST_USER_EMAIL = 'sesto@post.com'
   
   const testUser = await prisma.user.findUnique({
      where: { email: TEST_USER_EMAIL },
   })

   if (!testUser) {
      console.log(`User ${TEST_USER_EMAIL} not found`)
      return
   }

   console.log(`\nFound test user: ${testUser.email} (ID: ${testUser.id})`)

   const orders = await prisma.order.findMany({
      where: { userId: testUser.id },
      include: { orderItems: true },
   })

   console.log(`\nOrders to delete: ${orders.length}`)
   orders.forEach((order) => {
      console.log(`  - Order #${order.number} (${order.orderItems.length} items)`)
   })

   console.log('\nDeleting...')
   
   const deletedItems = await prisma.orderItem.deleteMany({
      where: { order: { userId: testUser.id } },
   })
   console.log(`✓ Deleted ${deletedItems.count} order items`)

   const deletedPayments = await prisma.payment.deleteMany({
      where: { order: { userId: testUser.id } },
   })
   console.log(`✓ Deleted ${deletedPayments.count} payments`)

   const deletedRefunds = await prisma.refund.deleteMany({
      where: { order: { userId: testUser.id } },
   })
   console.log(`✓ Deleted ${deletedRefunds.count} refunds`)

   const deletedOrders = await prisma.order.deleteMany({
      where: { userId: testUser.id },
   })
   console.log(`✓ Deleted ${deletedOrders.count} orders`)

   console.log('\n✅ Test orders cleaned successfully!')
}

main()
   .catch((e) => {
      console.error(e)
      process.exit(1)
   })
   .finally(async () => {
      await prisma.$disconnect()
   })
