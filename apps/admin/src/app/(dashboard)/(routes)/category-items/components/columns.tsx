'use client'

import { ColumnDef } from '@tanstack/react-table'
import { CellAction } from './cell-action'

export type CategoryItemColumn = {
   id: string
   name: string
   category: string
   basePrice: number
   sizesCount: number
   zonesCount: number
   attributesCount: number
   createdAt: string
}

export const columns: ColumnDef<CategoryItemColumn>[] = [
   {
      accessorKey: 'name',
      header: 'Name',
   },
   {
      accessorKey: 'category',
      header: 'Category',
   },
   {
      accessorKey: 'basePrice',
      header: 'Base Price',
      cell: ({ row }) => `$${row.original.basePrice.toFixed(2)}`,
   },
   {
      accessorKey: 'sizesCount',
      header: 'Sizes',
   },
   {
      accessorKey: 'zonesCount',
      header: 'Zones',
   },
   {
      accessorKey: 'attributesCount',
      header: 'Attributes',
   },
   {
      accessorKey: 'createdAt',
      header: 'Created',
   },
   {
      id: 'actions',
      cell: ({ row }) => <CellAction data={row.original} />,
   },
]
