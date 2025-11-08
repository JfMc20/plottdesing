'use client'

import { DataTable } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { ColumnDef } from '@tanstack/react-table'
import { Archive, ArchiveRestoreIcon, Plus, Trash } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'react-hot-toast'
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

interface CategoryItemsClientProps {
   data: any[]
   hideHeader?: boolean
   showArchived?: boolean
}

export const CategoryItemsClient: React.FC<CategoryItemsClientProps> = ({
   data,
   hideHeader = false,
   showArchived = false,
}) => {
   const router = useRouter()
   const [selected, setSelected] = useState<string[]>([])
   const [loading, setLoading] = useState(false)

   const formattedData: CategoryItemColumn[] = data.map((item) => ({
      id: item.id,
      name: item.name,
      category: item.Category.title,
      basePrice: item.basePrice,
      sizesCount: item.ProductSize.length,
      zonesCount: item.ProductZone.length,
      attributesCount: item.ProductAttribute.length,
      createdAt: new Date(item.createdAt).toLocaleDateString(),
   }))

   const handleSelectAll = (checked: boolean) => {
      setSelected(checked ? formattedData.map(item => item.id) : [])
   }

   const handleSelect = (id: string, checked: boolean) => {
      setSelected(prev => 
         checked ? [...prev, id] : prev.filter(item => item !== id)
      )
   }

   const handleBulkArchive = async () => {
      if (selected.length === 0) return
      
      try {
         setLoading(true)
         
         await Promise.all(
            selected.map(id => 
               fetch(`/api/category-items/${id}`, {
                  method: 'PATCH',
                  body: JSON.stringify({ isArchived: !showArchived }),
               })
            )
         )

         toast.success(`${showArchived ? 'Unarchived' : 'Archived'} ${selected.length} item(s)`)
         router.refresh()
         setSelected([])
      } catch (error) {
         toast.error('Something went wrong')
      } finally {
         setLoading(false)
      }
   }

   const handleBulkDelete = async () => {
      if (selected.length === 0) return
      
      try {
         setLoading(true)
         
         await Promise.all(
            selected.map(id => 
               fetch(`/api/category-items/${id}`, { method: 'DELETE' })
            )
         )

         toast.success(`Deleted ${selected.length} item(s)`)
         router.refresh()
         setSelected([])
      } catch (error) {
         toast.error('Something went wrong')
      } finally {
         setLoading(false)
      }
   }

   const columns: ColumnDef<CategoryItemColumn>[] = [
      {
         id: 'select',
         header: ({ table }) => (
            <Checkbox
               checked={selected.length === formattedData.length && formattedData.length > 0}
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

   return (
      <div className="space-y-4">
         {!hideHeader && (
            <div className="flex items-center justify-end">
               <Button onClick={() => router.push('/category-items/new')}>
                  <Plus className="mr-2 h-4 w-4" /> Add New
               </Button>
            </div>
         )}
         {selected.length > 0 && (
            <div className="flex items-center gap-2">
               <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkArchive}
                  disabled={loading}
               >
                  {showArchived ? (
                     <>
                        <ArchiveRestoreIcon className="h-4 w-4 mr-2" />
                        Unarchive {selected.length} selected
                     </>
                  ) : (
                     <>
                        <Archive className="h-4 w-4 mr-2" />
                        Archive {selected.length} selected
                     </>
                  )}
               </Button>
               {!showArchived && (
                  <Button
                     variant="destructive"
                     size="sm"
                     onClick={handleBulkDelete}
                     disabled={loading}
                  >
                     <Trash className="h-4 w-4 mr-2" />
                     Delete {selected.length} selected
                  </Button>
               )}
            </div>
         )}
         <DataTable searchKey="name" columns={columns} data={formattedData} />
      </div>
   )
}
