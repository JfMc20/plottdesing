'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuLabel,
   DropdownMenuSeparator,
   DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LogOut } from 'lucide-react'

interface UserNavProps {
   owner: {
      name?: string | null
      email?: string | null
      avatar?: string | null
   }
}

export function UserNav({ owner }: UserNavProps) {
   const initials = owner.name
      ? owner.name
           .split(' ')
           .map((n) => n[0])
           .join('')
           .toUpperCase()
           .slice(0, 2)
      : owner.email?.slice(0, 2).toUpperCase() || 'AD'

   return (
      <DropdownMenu>
         <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
               <Avatar className="h-8 w-8">
                  {owner.avatar && (
                     <AvatarImage src={owner.avatar} alt={owner.name || owner.email} />
                  )}
                  <AvatarFallback>{initials}</AvatarFallback>
               </Avatar>
            </Button>
         </DropdownMenuTrigger>
         <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
               <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                     {owner.name || 'Admin'}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                     {owner.email}
                  </p>
               </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => window.location.href = '/api/auth/logout'}>
               <LogOut className="mr-2 h-4 w-4" />
               <span>Log out</span>
            </DropdownMenuItem>
         </DropdownMenuContent>
      </DropdownMenu>
   )
}
