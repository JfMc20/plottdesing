import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
   const brands = await prisma.brand.findMany({
      include: {
         products: true,
      },
   })

   console.log('\n=== BRANDS IN DATABASE ===\n')
   brands.forEach((brand) => {
      console.log(`${brand.title}`)
      console.log(`  ID: ${brand.id}`)
      console.log(`  Description: ${brand.description || 'N/A'}`)
      console.log(`  Logo: ${brand.logo || 'N/A'}`)
      console.log(`  Products: ${brand.products.length}`)
      console.log('---')
   })

   console.log(`\nTotal brands: ${brands.length}`)
}

main()
   .catch((e) => {
      console.error(e)
      process.exit(1)
   })
   .finally(async () => {
      await prisma.$disconnect()
   })
