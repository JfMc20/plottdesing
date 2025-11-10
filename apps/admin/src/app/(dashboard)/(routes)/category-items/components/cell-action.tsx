'use client'

import { GenericCellAction } from '@/components/ui/generic-cell-action'
import { CategoryItemColumn } from './columns'

interface CellActionProps {
   data: CategoryItemColumn
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
   return (
      <GenericCellAction
         data={data}
         editRoute="/category-items"
         apiEndpoint="/api/category-items"
         entityName="Category Item"
      />
   )
}
