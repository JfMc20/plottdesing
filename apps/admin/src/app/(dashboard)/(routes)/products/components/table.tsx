'use client'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTable } from '@/components/ui/data-table'
import { ColumnDef } from '@tanstack/react-table'
import { Archive, ArchiveRestoreIcon, CheckIcon, EditIcon, Trash, XIcon } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'react-hot-toast'

interface ProductsTableProps {
   data: ProductColumn[]
   showArchived?: boolean
}

export const ProductsTable: React.FC<ProductsTableProps> = ({ data, showArchived }) => {
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

   const handleBulkArchive = async () => {
      if (selected.length === 0) return
      
      try {
         setLoading(true)
         
         await Promise.all(
            selected.map(id => 
               fetch(`/api/products/${id}`, {
                  method: 'PATCH',
                  body: JSON.stringify({ isArchived: !showArchived }),
               })
            )
         )

         toast.success(`${showArchived ? 'Unarchived' : 'Archived'} ${selected.length} product(s)`)
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
         
         const results = await Promise.allSettled(
            selected.map(id => 
               fetch(`/api/products/${id}`, { method: 'DELETE' })
            )
         )

         const failed = results.filter(r => r.status === 'rejected').length
         const success = results.length - failed

         if (success > 0) {
            toast.success(`Deleted ${success} product(s)`)
            router.refresh()
            setSelected([])
         }
         
         if (failed > 0) {
            toast.error(`Failed to delete ${failed} product(s) (may have orders)`)
         }
      } catch (error) {
         toast.error('Something went wrong')
      } finally {
         setLoading(false)
      }
   }

   const handleUnarchive = async (productId: string) => {
      try {
         await fetch(`/api/products/${productId}`, {
            method: 'PATCH',
            body: JSON.stringify({ isArchived: false }),
         })
         toast.success('Product unarchived')
         router.refresh()
      } catch {
         toast.error('Failed to unarchive product')
      }
   }

   const columns: ColumnDef<ProductColumn>[] = [
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
         cell: ({ row }) => (
            <div className="flex gap-2">
               {showArchived && (
                  <Button 
                     size="icon" 
                     variant="outline"
                     onClick={() => handleUnarchive(row.original.id)}
                  >
                     <ArchiveRestoreIcon className="h-4" />
                  </Button>
               )}
               <Link href={`/products/${row.original.id}`}>
                  <Button size="icon" variant="outline">
                     <EditIcon className="h-4" />
                  </Button>
               </Link>
            </div>
         ),
      },
   ]

   return (
      <div className="space-y-4">
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
         <DataTable searchKey="title" columns={columns} data={data} />
      </div>
   )
}

export type ProductColumn = {
   id: string
   title: string
   price: string
   discount: string
   category: string
   sales: number
   isAvailable: boolean
}
