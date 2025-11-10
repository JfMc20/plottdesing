'use client'

import { useRouter } from 'next/navigation'
import { ShoppingBag } from 'lucide-react'
import { GenericCellAction } from '@/components/ui/generic-cell-action'
import { UserColumn } from './table'

interface CellActionProps {
   data: UserColumn
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
   const router = useRouter()

   return (
      <GenericCellAction
         data={data}
         editRoute="/users"
         apiEndpoint="/api/users"
         entityName="User"
         enableDelete={false}
         additionalActions={[
            {
               label: `View Orders (${data.orders})`,
               icon: ShoppingBag,
               onClick: (user) => router.push(`/orders?userId=${user.id}`),
            },
         ]}
      />
   )
}
