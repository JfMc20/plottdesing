import prisma from '@/lib/prisma'

import { ProductForm } from './components/product-form'

export default async function ProductPage({
   params,
}: {
   params: { productId: string }
}) {
   const product = await prisma.product.findUnique({
      where: {
         id: params.productId,
      },
      include: {
         categories: true,
         brand: true,
         orders: true,
      },
   })

   const categories = await prisma.category.findMany()
   const brands = await prisma.brand.findMany()

   return (
      <div className="flex-col">
         <div className="flex-1 space-y-4 pt-6 pb-12">
            <ProductForm
               categories={categories}
               brands={brands}
               initialData={product}
            />
         </div>
      </div>
   )
}
