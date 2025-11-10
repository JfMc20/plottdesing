'use client'

import { DataTable } from '@/components/ui/data-table'
import { ColumnDef } from '@tanstack/react-table'
import { CheckIcon, XIcon } from 'lucide-react'
import { CellAction } from './cell-action'

interface OrderTableProps {
   data: OrderColumn[]
}

export const OrderTable: React.FC<OrderTableProps> = ({ data }) => {
   const columns: ColumnDef<OrderColumn>[] = [
      {
         accessorKey: 'number',
         header: 'Order Number',
      },
      {
         accessorKey: 'date',
         header: 'Date',
      },
      {
         accessorKey: 'payable',
         header: 'Payable',
      },
      {
         accessorKey: 'isPaid',
         header: 'Paid',
         cell: (props) => (props.cell.getValue() ? <CheckIcon /> : <XIcon />),
      },
      {
         id: 'actions',
         cell: ({ row }) => <CellAction data={row.original} />,
      },
   ]

   return <DataTable searchKey="products" columns={columns} data={data} />
}

export type OrderColumn = {
   id: string
   isPaid: boolean
   payable: string
   number: string
   createdAt: string
}
