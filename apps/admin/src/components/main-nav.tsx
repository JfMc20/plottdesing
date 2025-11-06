'use client'

import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

export function MainNav({
   className,
   ...props
}: React.HTMLAttributes<HTMLElement>) {
   const pathname = usePathname()

   const storeRoutes = [
      { href: `/banners`, label: 'Banners', active: pathname.includes(`/banners`) },
      { href: `/categories`, label: 'Categories', active: pathname.includes(`/categories`) || pathname.includes(`/category-items`) },
      { href: `/products`, label: 'Products', active: pathname.includes(`/products`) },
      { href: `/brands`, label: 'Brands', active: pathname.includes(`/brands`) },
   ]

   const salesRoutes = [
      { href: `/orders`, label: 'Orders', active: pathname.includes(`/orders`) },
      { href: `/payments`, label: 'Payments', active: pathname.includes(`/payments`) },
      { href: `/codes`, label: 'Discount Codes', active: pathname.includes(`/codes`) },
   ]

   const userRoutes = [
      { href: `/users`, label: 'Customers', active: pathname.includes(`/users`) && !pathname.includes(`/admin-users`) },
      { href: `/admin-users`, label: 'Administrators', active: pathname.includes(`/admin-users`) },
   ]

   const isGroupActive = (routes: typeof storeRoutes) => routes.some(r => r.active)

   return (
      <nav
         className={cn('flex items-center space-x-4 lg:space-x-6', className)}
         {...props}
      >
         {/* Store Group */}
         <DropdownMenu>
            <DropdownMenuTrigger asChild>
               <Button
                  variant="ghost"
                  className={cn(
                     'text-sm transition-colors hover:text-primary px-2',
                     isGroupActive(storeRoutes)
                        ? 'font-semibold'
                        : 'font-light text-muted-foreground'
                  )}
               >
                  Store
                  <ChevronDown className="ml-1 h-4 w-4" />
               </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
               {storeRoutes.map((route) => (
                  <DropdownMenuItem key={route.href} asChild>
                     <Link
                        href={route.href}
                        className={cn(
                           'w-full cursor-pointer',
                           route.active && 'font-semibold'
                        )}
                     >
                        {route.label}
                     </Link>
                  </DropdownMenuItem>
               ))}
            </DropdownMenuContent>
         </DropdownMenu>

         {/* Sales Group */}
         <DropdownMenu>
            <DropdownMenuTrigger asChild>
               <Button
                  variant="ghost"
                  className={cn(
                     'text-sm transition-colors hover:text-primary px-2',
                     isGroupActive(salesRoutes)
                        ? 'font-semibold'
                        : 'font-light text-muted-foreground'
                  )}
               >
                  Sales
                  <ChevronDown className="ml-1 h-4 w-4" />
               </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
               {salesRoutes.map((route) => (
                  <DropdownMenuItem key={route.href} asChild>
                     <Link
                        href={route.href}
                        className={cn(
                           'w-full cursor-pointer',
                           route.active && 'font-semibold'
                        )}
                     >
                        {route.label}
                     </Link>
                  </DropdownMenuItem>
               ))}
            </DropdownMenuContent>
         </DropdownMenu>

         {/* Users Group */}
         <DropdownMenu>
            <DropdownMenuTrigger asChild>
               <Button
                  variant="ghost"
                  className={cn(
                     'text-sm transition-colors hover:text-primary px-2',
                     isGroupActive(userRoutes)
                        ? 'font-semibold'
                        : 'font-light text-muted-foreground'
                  )}
               >
                  Users
                  <ChevronDown className="ml-1 h-4 w-4" />
               </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
               {userRoutes.map((route) => (
                  <DropdownMenuItem key={route.href} asChild>
                     <Link
                        href={route.href}
                        className={cn(
                           'w-full cursor-pointer',
                           route.active && 'font-semibold'
                        )}
                     >
                        {route.label}
                     </Link>
                  </DropdownMenuItem>
               ))}
            </DropdownMenuContent>
         </DropdownMenu>
      </nav>
   )
}
