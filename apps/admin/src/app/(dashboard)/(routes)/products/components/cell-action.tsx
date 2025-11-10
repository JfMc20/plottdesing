'use client'

import { GenericCellAction } from '@/components/ui/generic-cell-action'
import { ProductColumn } from './table'

interface CellActionProps {
   data: ProductColumn
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
   return (
      <GenericCellAction
         data={data}
         editRoute="/products"
         apiEndpoint="/api/products"
         entityName="Product"
      />
   )
}
