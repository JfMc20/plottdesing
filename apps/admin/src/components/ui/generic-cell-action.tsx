'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Copy, Edit, MoreHorizontal, Trash } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuLabel,
   DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { AlertModal } from '@/components/modals/alert-modal'

interface GenericCellActionProps<T extends { id: string }> {
   data: T
   editRoute: string
   apiEndpoint: string
   entityName: string
   enableDelete?: boolean
   additionalActions?: Array<{
      label: string
      icon: React.ComponentType<{ className?: string }>
      onClick: (data: T) => void
   }>
}

export function GenericCellAction<T extends { id: string }>({
   data,
   editRoute,
   apiEndpoint,
   entityName,
   enableDelete = true,
   additionalActions = [],
}: GenericCellActionProps<T>) {
   const router = useRouter()
   const [loading, setLoading] = useState(false)
   const [open, setOpen] = useState(false)

   const onCopy = (id: string) => {
      navigator.clipboard.writeText(id)
      toast.success('ID copied to clipboard.')
   }

   const onDelete = async () => {
      try {
         setLoading(true)
         await fetch(`${apiEndpoint}/${data.id}`, {
            method: 'DELETE',
            cache: 'no-store',
         })
         router.refresh()
         toast.success(`${entityName} deleted.`)
      } catch (error) {
         toast.error('Something went wrong.')
      } finally {
         setLoading(false)
         setOpen(false)
      }
   }

   return (
      <>
         {enableDelete && (
            <AlertModal
               isOpen={open}
               onClose={() => setOpen(false)}
               onConfirm={onDelete}
               loading={loading}
            />
         )}
         <DropdownMenu>
            <DropdownMenuTrigger asChild>
               <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
               </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
               <DropdownMenuLabel>Actions</DropdownMenuLabel>
               <DropdownMenuItem onClick={() => onCopy(data.id)}>
                  <Copy className="mr-2 h-4 w-4" /> Copy ID
               </DropdownMenuItem>
               <DropdownMenuItem
                  onClick={() => router.push(`${editRoute}/${data.id}`)}
               >
                  <Edit className="mr-2 h-4 w-4" /> Update
               </DropdownMenuItem>
               {additionalActions.map((action, index) => (
                  <DropdownMenuItem
                     key={index}
                     onClick={() => action.onClick(data)}
                  >
                     <action.icon className="mr-2 h-4 w-4" /> {action.label}
                  </DropdownMenuItem>
               ))}
               {enableDelete && (
                  <DropdownMenuItem onClick={() => setOpen(true)}>
                     <Trash className="mr-2 h-4 w-4" /> Delete
                  </DropdownMenuItem>
               )}
            </DropdownMenuContent>
         </DropdownMenu>
      </>
   )
}
