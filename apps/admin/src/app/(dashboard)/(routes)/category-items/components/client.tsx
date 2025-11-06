'use client'

import { DataTable } from '@/components/ui/data-table'
import { Heading } from '@/components/ui/heading'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { CategoryItemColumn, columns } from './columns'

interface CategoryItemsClientProps {
   data: any[]
}

export const CategoryItemsClient: React.FC<CategoryItemsClientProps> = ({
   data,
}) => {
   const router = useRouter()

   const formattedData: CategoryItemColumn[] = data.map((item) => ({
      id: item.id,
      name: item.name,
      category: item.category.title,
      basePrice: item.basePrice,
      sizesCount: item.sizes.length,
      zonesCount: item.zones.length,
      attributesCount: item.attributes.length,
      createdAt: new Date(item.createdAt).toLocaleDateString(),
   }))

   return (
      <>
         <div className="flex items-center justify-between">
            <Heading
               title={`Category Items (${data.length})`}
               description="Manage category item configurations"
            />
            <Button onClick={() => router.push('/category-items/new')}>
               <Plus className="mr-2 h-4 w-4" /> Add New
            </Button>
         </div>
         <Separator />
         <DataTable searchKey="name" columns={columns} data={formattedData} />
      </>
   )
}
