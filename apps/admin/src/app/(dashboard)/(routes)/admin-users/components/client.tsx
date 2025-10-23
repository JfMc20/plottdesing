'use client'

import { DataTable } from '@/components/ui/data-table'
import { ColumnDef } from '@tanstack/react-table'

import { CellAction } from './cell-action'

export type AdminUserColumn = {
   id: string
   email: string
   createdAt: string
   lastSignIn: string
}

export const columns: ColumnDef<AdminUserColumn>[] = [
   {
      accessorKey: 'email',
      header: 'Email',
   },
   {
      accessorKey: 'createdAt',
      header: 'Created At',
   },
   {
      accessorKey: 'lastSignIn',
      header: 'Last Sign In',
   },
   {
      id: 'actions',
      cell: ({ row }) => <CellAction data={row.original} />,
   },
]

interface AdminUsersClientProps {
   data: AdminUserColumn[]
}

export function AdminUsersClient({ data }: AdminUsersClientProps) {
   return <DataTable searchKey="email" columns={columns} data={data} />
}
