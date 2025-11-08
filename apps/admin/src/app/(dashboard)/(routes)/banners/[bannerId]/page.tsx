import prisma from '@/lib/prisma'

import { BannerForm } from './components/banner-form'

const Page = async ({ params }: { params: { bannerId: string } }) => {
   const banner = await prisma.banner.findUnique({
      where: {
         id: params.bannerId,
      },
   })

   const categories = await prisma.category.findMany({
      where: { isArchived: false },
      select: { id: true, title: true },
      orderBy: { title: 'asc' },
   })

   return (
      <div className="flex-col">
         <div className="flex-1 space-y-4 pt-6">
            <BannerForm initialData={banner} categories={categories} />
         </div>
      </div>
   )
}

export default Page
