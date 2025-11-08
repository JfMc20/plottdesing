import { NextResponse } from 'next/server'
import { nanoid } from 'nanoid'
import prisma from '@/lib/prisma'

export async function POST(req: Request) {
   try {
      const body = await req.json()
      const { label, image, categoryId } = body

      const banner = await prisma.banner.create({
         data: {
            id: nanoid(),
            label,
            image,
            categoryId: categoryId || null,
            updatedAt: new Date(),
         },
      })

      return NextResponse.json(banner)
   } catch (error) {
      console.error('[BANNER_POST]', error)
      return new NextResponse('Internal error', { status: 500 })
   }
}
