'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CategoriesClient, CategoryColumn } from './table'
import { CategoryItemsClient } from '../../category-items/components/client'

interface CategoriesTabsProps {
   categoriesData: CategoryColumn[]
   categoryItemsData: any[]
   showArchived?: boolean
}

export const CategoriesTabs: React.FC<CategoriesTabsProps> = ({
   categoriesData,
   categoryItemsData,
   showArchived,
}) => {
   return (
      <Tabs defaultValue="categories" className="w-full">
         <TabsList>
            <TabsTrigger value="categories">
               Categories ({categoriesData.length})
            </TabsTrigger>
            <TabsTrigger value="items">
               Category Items ({categoryItemsData.length})
            </TabsTrigger>
         </TabsList>
         <TabsContent value="categories">
            <CategoriesClient data={categoriesData} showArchived={showArchived} />
         </TabsContent>
         <TabsContent value="items">
            <CategoryItemsClient data={categoryItemsData} hideHeader showArchived={showArchived} />
         </TabsContent>
      </Tabs>
   )
}
