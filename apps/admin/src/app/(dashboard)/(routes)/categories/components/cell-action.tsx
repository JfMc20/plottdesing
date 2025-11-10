'use client'

import { GenericCellAction } from '@/components/ui/generic-cell-action'
import { CategoryColumn } from './table'

interface CellActionProps {
   data: CategoryColumn
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
   return (
      <GenericCellAction
         data={data}
         editRoute="/categories"
         apiEndpoint="/api/categories"
         entityName="Category"
      />
   )
}
