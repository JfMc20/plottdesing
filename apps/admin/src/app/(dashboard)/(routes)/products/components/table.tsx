'use client'

import { GenericBulkTable } from '@/components/ui/generic-bulk-table'
import { ColumnDef } from '@tanstack/react-table'
import { CheckIcon, XIcon } from 'lucide-react'
import { CellAction } from './cell-action'

export type ProductColumn = {
   id: string
   title: string
   price: string
   discount: string
   category: string
   sales: number
   isAvailable: boolean
}

interface ProductsTableProps {
   data: ProductColumn[]
   showArchived?: boolean
}

export const ProductsTable: React.FC<ProductsTableProps> = ({ data, showArchived }) => {
   const columns: ColumnDef<ProductColumn>[] = [
      {
         accessorKey: 'title',
         header: 'Title',
      },
      {
         accessorKey: 'price',
         header: 'Price',
      },
      {
         accessorKey: 'discount',
         header: 'Discount',
      },
      {
         accessorKey: 'category',
         header: 'Category',
      },
      {
         accessorKey: 'sales',
         header: 'Sales #',
      },
      {
         accessorKey: 'isAvailable',
         header: 'Availability',
         cell: (props) => (props.cell.getValue() ? <CheckIcon /> : <XIcon />),
      },
      {
         id: 'actions',
         cell: ({ row }) => <CellAction data={row.original} />,
      },
   ]

   return (
      <GenericBulkTable
         data={data}
         columns={columns}
         searchKey="title"
         apiEndpoint="/api/products"
         entityName="product"
         entityNamePlural="products"
         showArchived={showArchived}
         enableArchive={true}
      />
   )
}
