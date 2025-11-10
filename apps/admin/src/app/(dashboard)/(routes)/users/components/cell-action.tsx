'use client'

import { useRouter } from 'next/navigation'
import { Copy, Edit, MoreHorizontal, ShoppingBag } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuLabel,
   DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { UserColumn } from './table'

interface CellActionProps {
   data: UserColumn
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
   const router = useRouter()

   const onCopy = (id: string) => {
      navigator.clipboard.writeText(id)
      toast.success('ID copied to clipboard.')
   }

   return (
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
               onClick={() => router.push(`/users/${data.id}`)}
            >
               <Edit className="mr-2 h-4 w-4" /> View Details
            </DropdownMenuItem>
            <DropdownMenuItem
               onClick={() => router.push(`/orders?userId=${data.id}`)}
            >
               <ShoppingBag className="mr-2 h-4 w-4" /> View Orders ({data.orders})
            </DropdownMenuItem>
         </DropdownMenuContent>
      </DropdownMenu>
   )
}
