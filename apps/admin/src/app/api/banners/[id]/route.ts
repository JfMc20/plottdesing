import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { handleApiError } from '@/lib/api/error-handler'

export async function PATCH(
   req: Request,
   { params }: { params: { id: string } }
) {
   try {
      const body = await req.json()
      const { isArchived, label, image, categoryId } = body

      // Si solo se está actualizando isArchived, hacer update simple
      if (isArchived !== undefined && Object.keys(body).length === 1) {
         const banner = await prisma.banner.update({
            where: { id: params.id },
            data: { isArchived },
         })
         return NextResponse.json(banner)
      }

      // Update completo
      const banner = await prisma.banner.update({
         where: { id: params.id },
         data: {
            label,
            image,
            categoryId: categoryId || null,
         },
      })

      return NextResponse.json(banner)
   } catch (error) {
      return handleApiError(error, 'BANNER_PATCH')
   }
}

export async function DELETE(
   req: Request,
   { params }: { params: { id: string } }
) {
   try {
      await prisma.banner.delete({
         where: { id: params.id },
      })

      return NextResponse.json({ success: true })
   } catch (error) {
      console.error('[BANNER_DELETE]', error)
      return new NextResponse('Make sure you removed all categories using this banner first.', { status: 500 })
   }
}
