'use client'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTable } from '@/components/ui/data-table'
import { ColumnDef } from '@tanstack/react-table'
import { EditIcon, Trash } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'react-hot-toast'

export type BrandColumn = {
   id: string
   title: string
   products: number
}

interface BrandsClientProps {
   data: BrandColumn[]
}

export const BrandsClient: React.FC<BrandsClientProps> = ({ data }) => {
   const router = useRouter()
   const [selected, setSelected] = useState<string[]>([])
   const [loading, setLoading] = useState(false)

   const handleSelectAll = (checked: boolean) => {
      setSelected(checked ? data.map(item => item.id) : [])
   }

   const handleSelect = (id: string, checked: boolean) => {
      setSelected(prev => 
         checked ? [...prev, id] : prev.filter(item => item !== id)
      )
   }

   const handleBulkDelete = async () => {
      if (selected.length === 0) return
      
      try {
         setLoading(true)
         
         const results = await Promise.allSettled(
            selected.map(id => 
               fetch(`/api/brands/${id}`, { method: 'DELETE' })
            )
         )

         const failed = results.filter(r => r.status === 'rejected').length
         const success = results.length - failed

         if (success > 0) {
            toast.success(`Deleted ${success} brand(s)`)
            router.refresh()
            setSelected([])
         }
         
         if (failed > 0) {
            toast.error(`Failed to delete ${failed} brand(s) (may have products)`)
         }
      } catch (error) {
         toast.error('Something went wrong')
      } finally {
         setLoading(false)
      }
   }

   const columns: ColumnDef<BrandColumn>[] = [
      {
         id: 'select',
         header: ({ table }) => (
            <Checkbox
               checked={selected.length === data.length && data.length > 0}
               onCheckedChange={handleSelectAll}
            />
         ),
         cell: ({ row }) => (
            <Checkbox
               checked={selected.includes(row.original.id)}
               onCheckedChange={(checked) => handleSelect(row.original.id, !!checked)}
            />
         ),
      },
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
         cell: ({ row }) => (
            <Link href={`/brands/${row.original.id}`}>
               <Button size="icon" variant="outline">
                  <EditIcon className="h-4" />
               </Button>
            </Link>
         ),
      },
   ]

   return (
      <div className="space-y-4">
         {selected.length > 0 && (
            <div className="flex items-center gap-2">
               <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDelete}
                  disabled={loading}
               >
                  <Trash className="h-4 w-4 mr-2" />
                  Delete {selected.length} selected
               </Button>
            </div>
         )}
         <DataTable searchKey="title" columns={columns} data={data} />
      </div>
   )
}
