'use client'

import { GenericCellAction } from '@/components/ui/generic-cell-action'
import { BrandColumn } from './table'

interface CellActionProps {
   data: BrandColumn
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
   return (
      <GenericCellAction
         data={data}
         editRoute="/brands"
         apiEndpoint="/api/brands"
         entityName="Brand"
      />
   )
}
