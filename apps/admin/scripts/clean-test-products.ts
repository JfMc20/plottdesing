import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
   const products = await prisma.product.findMany({
      include: {
         brand: true,
         categories: true,
         orders: true,
      },
   })

   console.log('\n=== PRODUCTS IN DATABASE ===\n')
   products.forEach((product) => {
      console.log(`${product.title}`)
      console.log(`  ID: ${product.id}`)
      console.log(`  Archived: ${product.isArchived}`)
      console.log(`  Orders: ${product.orders.length}`)
      console.log('---')
   })

   console.log(`\nTotal products: ${products.length}`)
   
   // Delete ALL products with 0 orders (archived or not)
   const productsToDelete = products.filter(p => p.orders.length === 0)
   
   if (productsToDelete.length > 0) {
      console.log(`\n🗑️  Deleting ${productsToDelete.length} products with 0 orders...\n`)
      
      for (const product of productsToDelete) {
         await prisma.cartItem.deleteMany({ where: { productId: product.id } })
         await prisma.productReview.deleteMany({ where: { productId: product.id } })
         await prisma.product.update({
            where: { id: product.id },
            data: { categories: { set: [] }, wishlists: { set: [] } }
         })
         await prisma.product.delete({ where: { id: product.id } })
         console.log(`✓ Deleted: ${product.title}`)
      }
      
      console.log(`\n✅ Deleted ${productsToDelete.length} products`)
   } else {
      console.log('\n✅ No products to delete')
   }
}

main()
   .catch((e) => {
      console.error(e)
      process.exit(1)
   })
   .finally(async () => {
      await prisma.$disconnect()
   })
