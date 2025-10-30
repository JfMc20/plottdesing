'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
import { useUser } from '@/hooks/useUser'
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
   const { user, isLoading } = useUser()
   async function onLogout() {
      try {
         const response = await fetch('/api/auth/logout', {
            method: 'POST',
            cache: 'no-store',
         })

         if (typeof window !== 'undefined' && window.localStorage) {
            document.cookie =
               'logged-in=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
         }

         if (response.ok) {
            window.location.href = '/login'
         }
      } catch (error) {
         console.error({ error })
      }
   }

   // Get initials for fallback
   const getInitials = (name: string | null | undefined) => {
      if (!name) return 'U'
      return name
         .split(' ')
         .map((n) => n[0])
         .join('')
         .toUpperCase()
         .slice(0, 2)
   }

   return (
      <DropdownMenu>
         <DropdownMenuTrigger asChild>
            <Button
               variant="outline"
               className="relative h-9 w-9 rounded-full"
               disabled={isLoading}
            >
               <Avatar className="h-8 w-8">
                  {isLoading ? (
                     <AvatarFallback className="text-xs">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                     </AvatarFallback>
                  ) : (
                     <>
                        <AvatarImage
                           src={user?.avatarUrl || undefined}
                           alt={user?.name || 'User'}
                        />
                        <AvatarFallback className="text-xs">
                           {getInitials(user?.name)}
                        </AvatarFallback>
                     </>
                  )}
               </Avatar>
            </Button>
         </DropdownMenuTrigger>
         <DropdownMenuContent className="w-56" align="end" forceMount>
            {user && (
               <>
                  <DropdownMenuLabel className="font-normal">
                     <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                           {user.name || 'User'}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                           {user.email}
                        </p>
                     </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
               </>
            )}
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
