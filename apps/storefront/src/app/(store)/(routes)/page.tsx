import Carousel from '@/components/native/Carousel'
import { ProductGrid, ProductSkeletonGrid } from '@/components/native/Product'
import { Heading } from '@/components/native/heading'
import { Separator } from '@/components/native/separator'
import prisma from '@/lib/prisma'
import { isVariableValid } from '@/lib/utils'

export default async function Index() {
   const products = await prisma.product.findMany({
      where: {
         isArchived: false,
         isAvailable: true,
         isCustomizable: false,
      },
      take: 12,
      orderBy: {
         createdAt: 'desc',
      },
      include: {
         brand: true,
         categories: true,
      },
   })

   const customizableProducts = await prisma.product.findMany({
      where: {
         isArchived: false,
         isAvailable: true,
         isCustomizable: true,
      },
      take: 12,
      orderBy: {
         createdAt: 'desc',
      },
      include: {
         brand: true,
         categories: true,
      },
   })

   const banners = await prisma.banner.findMany({
      where: { isArchived: false },
      select: {
         id: true,
         image: true,
         categoryId: true,
      },
   })

   return (
      <div className="flex flex-col border-neutral-200 dark:border-neutral-700">
         <Carousel banners={banners} />
         
         <Separator className="my-8" />
         <Heading
            title="Products"
            description="Below is a list of products we have available for you."
         />
         {isVariableValid(products) ? (
            <ProductGrid products={products} />
         ) : (
            <ProductSkeletonGrid />
         )}
         
         {isVariableValid(customizableProducts) && customizableProducts.length > 0 && (
            <>
               <Separator className="my-8" />
               <Heading
                  title="Customizable Products"
                  description="Design your own unique products with our customization options."
               />
               <ProductGrid products={customizableProducts} />
            </>
         )}
      </div>
   )
}
