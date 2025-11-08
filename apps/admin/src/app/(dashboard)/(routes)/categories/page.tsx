import { Button } from '@/components/ui/button'
import { Heading } from '@/components/ui/heading'
import { Separator } from '@/components/ui/separator'
import prisma from '@/lib/prisma'
import { Plus } from 'lucide-react'
import Link from 'next/link'

import { CategoryColumn } from './components/table'
import { CategoriesTabs } from './components/categories-tabs'

export default async function CategoriesPage({
   searchParams,
}: {
   searchParams: { archived?: string }
}) {
   const showArchived = searchParams.archived === 'true'

   const categories = await prisma.category.findMany({
      where: {
         isArchived: showArchived,
      },
      include: {
         products: true,
      },
   })

   const categoryItems = await prisma.categoryItem.findMany({
      where: {
         isArchived: showArchived,
      },
      include: {
         Category: true,
         ProductSize: true,
         ProductZone: true,
         ProductAttribute: true,
      },
      orderBy: { createdAt: 'desc' },
   })

   const formattedCategories: CategoryColumn[] = categories.map((category) => ({
      id: category.id,
      title: category.title,
      products: category.products.length,
   }))

   const serializedCategoryItems = categoryItems.map((item) => ({
      ...item,
      basePrice: Number(item.basePrice),
   }))

   return (
      <div className="my-6 block space-y-4">
         <div className="flex items-center justify-between">
            <Heading
               title="Categories Management"
               description="Manage categories and category items"
            />
            <div className="flex gap-2">
               <Link href={`/categories${showArchived ? '' : '?archived=true'}`}>
                  <Button variant="outline">
                     {showArchived ? 'Show Active' : 'Show Archived'}
                  </Button>
               </Link>
               <Link href="/category-items/new">
                  <Button variant="outline">
                     <Plus className="mr-2 h-4" /> New Item
                  </Button>
               </Link>
               <Link href="/categories/new">
                  <Button>
                     <Plus className="mr-2 h-4" /> New Category
                  </Button>
               </Link>
            </div>
         </div>
         <Separator />
         <CategoriesTabs 
            categoriesData={formattedCategories} 
            categoryItemsData={serializedCategoryItems}
            showArchived={showArchived}
         />
      </div>
   )
}
