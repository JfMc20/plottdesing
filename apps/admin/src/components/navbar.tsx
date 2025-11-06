import { MainNav } from '@/components/main-nav'
import { ThemeToggle } from '@/components/theme-toggle'
import { UserNav } from '@/components/user-nav'
import { getCurrentOwner } from '@/lib/auth/get-owner'
import Link from 'next/link'

export default async function Navbar() {
   const owner = await getCurrentOwner()

   return (
      <div className="border-b flex justify-between h-16 items-center px-[1.4rem] md:px-[4rem] lg:px-[6rem] xl:px-[8rem] 2xl:px-[12rem]">
         <div className="flex gap-6 items-center">
            <Link href="/" className="font-bold tracking-wider">
               ADMIN
            </Link>
            <MainNav />
         </div>
         <div className="flex items-center gap-2">
            <ThemeToggle />
            {owner && <UserNav owner={owner} />}
         </div>
      </div>
   )
}
