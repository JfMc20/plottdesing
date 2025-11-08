import prisma from '@/lib/prisma'
import { CategoryItemsClient } from './components/client'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function CategoryItemsPage() {
   const categoryItems = await prisma.categoryItem.findMany({
      include: {
         Category: true,
         ProductSize: true,
         ProductZone: true,
         ProductAttribute: true,
      },
      orderBy: { createdAt: 'desc' },
   })

   const serializedData = categoryItems.map((item) => ({
      ...item,
      basePrice: Number(item.basePrice),
   }))

   return (
      <div className="flex-col">
         <div className="flex-1 space-y-4 p-8 pt-6">
            <CategoryItemsClient data={serializedData} />
         </div>
      </div>
   )
}
