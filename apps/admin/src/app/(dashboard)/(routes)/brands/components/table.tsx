'use client'

import { GenericBulkTable } from '@/components/ui/generic-bulk-table'
import { ColumnDef } from '@tanstack/react-table'
import { CellAction } from './cell-action'

export type BrandColumn = {
   id: string
   title: string
   products: number
   color: string
}

interface BrandsClientProps {
   data: BrandColumn[]
}

export const BrandsClient: React.FC<BrandsClientProps> = ({ data }) => {
   const columns: ColumnDef<BrandColumn>[] = [
      {
         accessorKey: 'title',
         header: 'Title',
      },
      {
         accessorKey: 'products',
         header: 'Products #',
      },
      {
         accessorKey: 'color',
         header: 'Brand Color',
         cell: ({ row }) => (
            <div className="flex items-center gap-2">
               <div 
                  className="w-6 h-6 rounded border border-gray-300"
                  style={{ backgroundColor: row.original.color }}
               />
               <span className="text-xs text-muted-foreground font-mono">
                  {row.original.color}
               </span>
            </div>
         ),
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
         apiEndpoint="/api/brands"
         entityName="brand"
         entityNamePlural="brands"
         enableArchive={false}
      />
   )
}
