'use client'

import { DataTable } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { ColumnDef } from '@tanstack/react-table'
import { Archive, ArchiveRestoreIcon, Trash } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'react-hot-toast'
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
               fetch(`/api/banners/${id}`, {
                  method: 'PATCH',
                  body: JSON.stringify({ isArchived: !showArchived }),
               })
            )
         )

         toast.success(`${showArchived ? 'Unarchived' : 'Archived'} ${selected.length} banner(s)`)
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
            selected.map(async id => {
               const response = await fetch(`/api/banners/${id}`, { method: 'DELETE' })
               if (!response.ok) {
                  const text = await response.text()
                  throw new Error(text)
               }
               return response
            })
         )

         const failed = results.filter(r => r.status === 'rejected').length
         const success = results.length - failed

         if (success > 0) {
            toast.success(`Deleted ${success} banner(s)`)
            router.refresh()
            setSelected([])
         }
         
         if (failed > 0) {
            toast.error(`Failed to delete ${failed} banner(s) - they are being used by categories`)
         }
      } catch (error) {
         toast.error('Something went wrong')
      } finally {
         setLoading(false)
      }
   }

   const columns: ColumnDef<BannersColumn>[] = [
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
         <DataTable searchKey="label" columns={columns} data={data} />
      </div>
   )
}
