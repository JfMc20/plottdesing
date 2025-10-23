'use client'

import { Button } from '@/components/ui/button'
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuGroup,
   DropdownMenuItem,
   DropdownMenuLabel,
   DropdownMenuSeparator,
   DropdownMenuShortcut,
   DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
   CreditCardIcon,
   HeartIcon,
   ListOrderedIcon,
   LogOutIcon,
   MapPinIcon,
   UserIcon,
} from 'lucide-react'
import { ShoppingBasketIcon } from 'lucide-react'
import Link from 'next/link'

export function UserNav() {
   async function onLogout() {
      try {
         const response = await fetch('/api/auth/logout', {
            cache: 'no-store',
         })

         if (typeof window !== 'undefined' && window.localStorage) {
            document.cookie =
               'logged-in=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
         }

         if (response.status === 200) window.location.reload()
      } catch (error) {
         console.error({ error })
      }
   }

   return (
      <DropdownMenu>
         <DropdownMenuTrigger asChild>
            <Button size="icon" variant="outline" className="h-9">
               <UserIcon className="h-4" />
            </Button>
         </DropdownMenuTrigger>
         <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuGroup>
               <DropdownMenuItem className="flex gap-2" asChild>
                  <Link href="/profile/addresses">
                     <MapPinIcon className="h-4" />
                     <span>Edit Addresses</span>
                  </Link>
               </DropdownMenuItem>
               <DropdownMenuItem className="flex gap-2" asChild>
                  <Link href="/profile/edit">
                     <UserIcon className="h-4" />
                     <span>Edit Profile</span>
                  </Link>
               </DropdownMenuItem>
               <DropdownMenuItem className="flex gap-2" asChild>
                  <Link href="/profile/orders">
                     <ListOrderedIcon className="h-4" />
                     <span>Orders</span>
                  </Link>
               </DropdownMenuItem>
               <DropdownMenuItem className="flex gap-2" asChild>
                  <Link href="/profile/payments">
                     <CreditCardIcon className="h-4" />
                     <span>Payments</span>
                  </Link>
               </DropdownMenuItem>
               <DropdownMenuSeparator />
               <DropdownMenuItem className="flex gap-2" asChild>
                  <Link href="/cart">
                     <ShoppingBasketIcon className="h-4" />
                     <span>Cart</span>
                  </Link>
               </DropdownMenuItem>
               <DropdownMenuItem className="flex gap-2" asChild>
                  <Link href="/wishlist">
                     <HeartIcon className="h-4" />
                     <span>Wishlist</span>
                  </Link>
               </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex gap-2" onClick={onLogout}>
               <LogOutIcon className="h-4" /> Logout
            </DropdownMenuItem>
         </DropdownMenuContent>
      </DropdownMenu>
   )
}
