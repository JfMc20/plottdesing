import prisma from '@/lib/prisma'
import { CategoryItemForm } from './components/category-item-form'

export default async function CategoryItemPage({
   params,
}: {
   params: { id: string }
}) {
   const categoryItem =
      params.id !== 'new'
         ? await prisma.categoryItem.findUnique({
              where: { id: params.id },
              include: {
                 ProductSize: { orderBy: { displayOrder: 'asc' } },
                 ProductZone: {
                    include: { ProductPrintSize: true },
                    orderBy: { displayOrder: 'asc' },
                 },
                 ProductAttribute: true,
              },
           })
         : null

   const serializedItem = categoryItem
      ? {
           ...categoryItem,
           basePrice: Number(categoryItem.basePrice),
           zones: categoryItem.ProductZone.map((zone) => ({
              ...zone,
              printSizes: zone.ProductPrintSize.map((ps) => ({
                 ...ps,
                 width: Number(ps.width),
                 height: Number(ps.height),
                 area: Number(ps.area),
              })),
           })),
        }
      : null

   const categories = await prisma.category.findMany({
      orderBy: { title: 'asc' },
   })

   return (
      <div className="flex-col">
         <div className="flex-1 space-y-4 p-8 pt-6">
            <CategoryItemForm
               initialData={serializedItem}
               categories={categories}
            />
         </div>
      </div>
   )
}
