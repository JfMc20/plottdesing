'use client'

import { GenericBulkTable } from '@/components/ui/generic-bulk-table'
import { ColumnDef } from '@tanstack/react-table'
import { CellAction } from './cell-action'
import Image from 'next/image'

export type BannersColumn = {
   id: string
   label: string
   image: string
   categoryName: string
   createdAt: string
}

interface BannersClientProps {
   data: BannersColumn[]
   showArchived?: boolean
}

export const BannersClient: React.FC<BannersClientProps> = ({ 
   data,
   showArchived = false 
}) => {
   const columns: ColumnDef<BannersColumn>[] = [
      {
         accessorKey: 'image',
         header: 'Image',
         cell: ({ row }) => (
            <div className="relative w-16 h-16 rounded-md overflow-hidden">
               <Image
                  src={row.original.image}
                  alt={row.original.label}
                  fill
                  className="object-cover"
               />
            </div>
         ),
      },
      {
         accessorKey: 'label',
         header: 'Label',
      },
      {
         accessorKey: 'categoryName',
         header: 'Category',
      },
      {
         accessorKey: 'createdAt',
         header: 'Date',
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
         searchKey="label"
         apiEndpoint="/api/banners"
         entityName="banner"
         entityNamePlural="banners"
         showArchived={showArchived}
         enableArchive={true}
      />
   )
}
