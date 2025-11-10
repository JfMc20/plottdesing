'use client'

import { GenericCellAction } from '@/components/ui/generic-cell-action'
import { OrderColumn } from './table'

interface CellActionProps {
   data: OrderColumn
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
   return (
      <GenericCellAction
         data={data}
         editRoute="/orders"
         apiEndpoint="/api/orders"
         entityName="Order"
         enableDelete={false}
      />
   )
}
