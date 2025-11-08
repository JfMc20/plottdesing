import { Button } from '@/components/ui/button'
import { Heading } from '@/components/ui/heading'
import { Separator } from '@/components/ui/separator'
import prisma from '@/lib/prisma'
import { formatter } from '@/lib/utils'
import { Plus } from 'lucide-react'
import Link from 'next/link'

import { ProductsTable } from './components/table'
import { ProductColumn } from './components/table'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ProductsPage({ searchParams }) {
   const showArchived = searchParams?.archived === 'true'

   const products = await prisma.product.findMany({
      where: {
         isArchived: showArchived,
      },
      include: {
         orders: true,
         categories: true,
         brand: true,
      },
      orderBy: {
         createdAt: 'desc',
      },
   })

   const formattedProducts: ProductColumn[] = products.map((product) => ({
      id: product.id,
      title: product.title,
      price: formatter.format(product.price),
      discount: formatter.format(product.discount),
      category: product.categories[0].title,
      sales: product.orders.length,
      isAvailable: product.isAvailable,
   }))

   return (
      <div className="block space-y-4 my-6">
         <div className="flex items-center justify-between">
            <Heading
               title={`Products (${products.length})`}
               description="Manage products for your store"
            />
            <div className="flex gap-2">
               <Link href={showArchived ? '/products' : '/products?archived=true'}>
                  <Button variant="outline">
                     {showArchived ? 'Show Active' : 'Show Archived'}
                  </Button>
               </Link>
               <Link href="/products/new">
                  <Button>
                     <Plus className="mr-2 h-4" /> Add New
                  </Button>
               </Link>
            </div>
         </div>
         <Separator />
         <ProductsTable data={formattedProducts} showArchived={showArchived} />
      </div>
   )
}
