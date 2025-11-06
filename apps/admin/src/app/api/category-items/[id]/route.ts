import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(
   req: Request,
   { params }: { params: { id: string } }
) {
   try {
      const categoryItem = await prisma.categoryItem.findUnique({
         where: { id: params.id },
         include: {
            category: true,
            sizes: { orderBy: { displayOrder: 'asc' } },
            zones: {
               include: { printSizes: true },
               orderBy: { displayOrder: 'asc' },
            },
            attributes: true,
         },
      })

      if (!categoryItem) {
         return new NextResponse('Not found', { status: 404 })
      }

      return NextResponse.json(categoryItem)
   } catch (error) {
      console.error('[CATEGORY_ITEM_GET]', error)
      return new NextResponse('Internal error', { status: 500 })
   }
}

export async function PATCH(
   req: Request,
   { params }: { params: { id: string } }
) {
   try {
      const userId = req.headers.get('X-USER-ID')

      if (!userId) {
         return new NextResponse('Unauthorized', { status: 401 })
      }

      const body = await req.json()
      const {
         name,
         description,
         skuPattern,
         basePrice,
         sizes,
         zones,
         attributes,
      } = body

      // Eliminar en orden correcto (hijos primero)
      await prisma.$transaction(async (tx) => {
         if (zones) {
            // Primero eliminar printSizes
            const existingZones = await tx.productZone.findMany({
               where: { categoryItemId: params.id },
               select: { id: true }
            })
            for (const zone of existingZones) {
               await tx.productPrintSize.deleteMany({
                  where: { productZoneId: zone.id }
               })
            }
            // Luego eliminar zones
            await tx.productZone.deleteMany({
               where: { categoryItemId: params.id },
            })
         }
         if (sizes) {
            await tx.productSize.deleteMany({
               where: { categoryItemId: params.id },
            })
         }
         if (attributes) {
            await tx.productAttribute.deleteMany({
               where: { categoryItemId: params.id },
            })
         }
      })

      // Limpiar y convertir tipos
      const cleanSizes = sizes?.map(({ id, categoryItemId, createdAt, updatedAt, ...rest }: any) => rest)
      const cleanZones = zones?.map(({ id, categoryItemId, createdAt, updatedAt, printSizes, ...rest }: any) => ({
         ...rest,
         printSizes: printSizes ? {
            create: printSizes.map(({ id, productZoneId, createdAt, updatedAt, width, height, area, ...ps }: any) => ({
               ...ps,
               width: parseFloat(width) || 0,
               height: parseFloat(height) || 0,
               area: parseFloat(area) || 0,
            }))
         } : undefined
      }))
      const cleanAttributes = attributes?.map(({ id, categoryItemId, createdAt, updatedAt, ...rest }: any) => rest)

      const categoryItem = await prisma.categoryItem.update({
         where: { id: params.id },
         data: {
            name,
            description,
            skuPattern,
            basePrice,
            sizes: cleanSizes ? { create: cleanSizes } : undefined,
            zones: cleanZones ? { create: cleanZones } : undefined,
            attributes: cleanAttributes ? { create: cleanAttributes } : undefined,
         },
         include: {
            sizes: true,
            zones: { include: { printSizes: true } },
            attributes: true,
         },
      })

      return NextResponse.json(categoryItem)
   } catch (error) {
      console.error('[CATEGORY_ITEM_PATCH]', error)
      return new NextResponse('Internal error', { status: 500 })
   }
}

export async function DELETE(
   req: Request,
   { params }: { params: { id: string } }
) {
   try {
      const userId = req.headers.get('X-USER-ID')

      if (!userId) {
         return new NextResponse('Unauthorized', { status: 401 })
      }

      await prisma.categoryItem.delete({
         where: { id: params.id },
      })

      return NextResponse.json({ success: true })
   } catch (error) {
      console.error('[CATEGORY_ITEM_DELETE]', error)
      return new NextResponse('Internal error', { status: 500 })
   }
}
