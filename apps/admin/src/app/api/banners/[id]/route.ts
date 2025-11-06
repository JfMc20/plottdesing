import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function PATCH(
   req: Request,
   { params }: { params: { id: string } }
) {
   try {
      const body = await req.json()
      const { isArchived, label, image } = body

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
         },
      })

      return NextResponse.json(banner)
   } catch (error) {
      console.error('[BANNER_PATCH]', error)
      return new NextResponse('Internal error', { status: 500 })
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
