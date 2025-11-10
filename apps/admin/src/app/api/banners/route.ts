import { NextResponse } from 'next/server'
import { nanoid } from 'nanoid'
import prisma from '@/lib/prisma'
import { handleApiError } from '@/lib/api/error-handler'

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
      return handleApiError(error, 'BANNER_POST')
   }
}
