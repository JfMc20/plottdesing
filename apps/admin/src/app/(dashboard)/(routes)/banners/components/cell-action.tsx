'use client'

import { GenericCellAction } from '@/components/ui/generic-cell-action'
import { BannersColumn } from './table'

interface CellActionProps {
   data: BannersColumn
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
   return (
      <GenericCellAction
         data={data}
         editRoute="/banners"
         apiEndpoint="/api/banners"
         entityName="Banner"
      />
   )
}
