import { format } from 'date-fns'

import prisma from '@/lib/prisma'

import { BannersColumn } from './components/table'
import { BannersClient } from './components/table'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Heading } from '@/components/ui/heading'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'

export default async function BannersPage({
   searchParams,
}: {
   searchParams: { archived?: string }
}) {
   const showArchived = searchParams.archived === 'true'

   const banners = await prisma.banner.findMany({
      where: {
         isArchived: showArchived,
      },
      include: {
         categories: true,
      },
      orderBy: {
         createdAt: 'desc',
      },
   })

   const formattedBanners: BannersColumn[] = banners.map((item) => ({
      id: item.id,
      label: item.label,
      image: item.image,
      categoriesCount: item.categories.length,
      createdAt: format(item.createdAt, 'MMMM do, yyyy'),
   }))

   return (
      <div className="block space-y-4 my-6">
         <div className="flex items-center justify-between">
            <Heading
               title={`Banners (${banners.length})`}
               description="Manage banners for your store"
            />
            <div className="flex gap-2">
               <Link href={`/banners${showArchived ? '' : '?archived=true'}`}>
                  <Button variant="outline">
                     {showArchived ? 'Show Active' : 'Show Archived'}
                  </Button>
               </Link>
               <Link href="/banners/new">
                  <Button>
                     <Plus className="mr-2 h-4" /> Add New
                  </Button>
               </Link>
            </div>
         </div>
         <Separator />
         <BannersClient data={formattedBanners} showArchived={showArchived} />
      </div>
   )
}
