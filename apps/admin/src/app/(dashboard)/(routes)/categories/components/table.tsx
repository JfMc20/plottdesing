'use client'

import { GenericBulkTable } from '@/components/ui/generic-bulk-table'
import { ColumnDef } from '@tanstack/react-table'
import { CellAction } from './cell-action'

export type CategoryColumn = {
   id: string
   title: string
   products: number
}

interface CategoriesClientProps {
   data: CategoryColumn[]
   showArchived?: boolean
}

export const CategoriesClient: React.FC<CategoriesClientProps> = ({ data, showArchived }) => {
   const columns: ColumnDef<CategoryColumn>[] = [
      {
         accessorKey: 'title',
         header: 'Title',
      },
      {
         accessorKey: 'products',
         header: 'Products #',
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
         apiEndpoint="/api/categories"
         entityName="category"
         entityNamePlural="categories"
         showArchived={showArchived}
         enableArchive={true}
      />
   )
}
