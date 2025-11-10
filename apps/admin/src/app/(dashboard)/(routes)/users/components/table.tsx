'use client'

import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/ui/data-table'
import { ColumnDef } from '@tanstack/react-table'
import { LinkIcon } from 'lucide-react'
import Link from 'next/link'
import { CellAction } from './cell-action'

export type UserColumn = {
   id: string
   name: string
   email: string
   phone: string
   orders: number
}

interface UsersTableProps {
   data: UserColumn[]
}

export const UsersTable: React.FC<UsersTableProps> = ({ data }) => {
   const columns: ColumnDef<UserColumn>[] = [
      {
         accessorKey: 'name',
         header: 'Name',
      },
      {
         accessorKey: 'email',
         header: 'Email',
      },
      {
         accessorKey: 'phone',
         header: 'Phone',
      },
      {
         accessorKey: 'orders',
         header: 'Order #',
         cell: ({ row, cell }) => (
            <Link href={`/orders?userId=${row.original.id}`}>
               <Badge className="items-center flex gap-1 w-min">
                  <LinkIcon className="h-3" />
                  <p className="shrink-0">{cell.getValue().toString()} Orders</p>
               </Badge>
            </Link>
         ),
      },
      {
         id: 'actions',
         cell: ({ row }) => <CellAction data={row.original} />,
      },
   ]

   return <DataTable searchKey="name" columns={columns} data={data} />
}
