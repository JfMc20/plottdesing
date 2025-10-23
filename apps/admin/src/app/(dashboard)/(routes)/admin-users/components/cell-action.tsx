'use client'

import { AlertModal } from '@/components/modals/alert-modal'
import { Button } from '@/components/ui/button'
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuLabel,
   DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Trash } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'react-hot-toast'

import { AdminUserColumn } from './client'

interface CellActionProps {
   data: AdminUserColumn
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
   const router = useRouter()
   const [loading, setLoading] = useState(false)
   const [open, setOpen] = useState(false)

   const onDelete = async () => {
      try {
         setLoading(true)

         const response = await fetch(`/api/admin-users/${data.id}`, {
            method: 'DELETE',
         })

         const result = await response.json()

         if (!response.ok) {
            throw new Error(result.error || 'Failed to delete admin user')
         }

         toast.success('Admin user deleted')
         router.refresh()
         setOpen(false)
      } catch (error: any) {
         console.error('Error deleting admin:', error)
         toast.error(error.message || 'Failed to delete admin user')
      } finally {
         setLoading(false)
      }
   }

   return (
      <>
         <AlertModal
            isOpen={open}
            onClose={() => setOpen(false)}
            onConfirm={onDelete}
            loading={loading}
         />
         <DropdownMenu>
            <DropdownMenuTrigger asChild>
               <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
               </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
               <DropdownMenuLabel>Actions</DropdownMenuLabel>
               <DropdownMenuItem onClick={() => setOpen(true)}>
                  <Trash className="mr-2 h-4 w-4" /> Delete
               </DropdownMenuItem>
            </DropdownMenuContent>
         </DropdownMenu>
      </>
   )
}
