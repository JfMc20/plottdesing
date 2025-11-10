import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { validateAuth, isErrorResponse } from '@/lib/api/auth-helper'
import { handleApiError } from '@/lib/api/error-handler'

export async function GET(
   req: Request,
   { params }: { params: { id: string } }
) {
   try {
      const categoryItem = await prisma.categoryItem.findUnique({
         where: { id: params.id },
         include: {
            Category: true,
            ProductSize: { orderBy: { displayOrder: 'asc' } },
            ProductZone: {
               include: { ProductPrintSize: true },
               orderBy: { displayOrder: 'asc' },
            },
            ProductAttribute: true,
         },
      })

      if (!categoryItem) {
         return new NextResponse('Not found', { status: 404 })
      }

      return NextResponse.json(categoryItem)
   } catch (error) {
      return handleApiError(error, 'CATEGORY_ITEM_GET')
   }
}

export async function PATCH(
   req: Request,
   { params }: { params: { id: string } }
) {
   try {
      const auth = validateAuth(req)
      if (isErrorResponse(auth)) return auth

      const body = await req.json()
      const {
         name,
         description,
         skuPattern,
         basePrice,
         sizes,
         zones,
         attributes,
         isArchived,
      } = body

      // Si solo se está actualizando isArchived, hacer update simple
      if (isArchived !== undefined && Object.keys(body).length === 1) {
         const categoryItem = await prisma.categoryItem.update({
            where: { id: params.id },
            data: { isArchived },
         })
         return NextResponse.json(categoryItem)
      }

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
            ProductSize: cleanSizes ? { create: cleanSizes } : undefined,
            ProductZone: cleanZones ? { create: cleanZones } : undefined,
            ProductAttribute: cleanAttributes ? { create: cleanAttributes } : undefined,
         },
         include: {
            ProductSize: true,
            ProductZone: { include: { ProductPrintSize: true } },
            ProductAttribute: true,
         },
      })

      return NextResponse.json(categoryItem)
   } catch (error) {
      return handleApiError(error, 'CATEGORY_ITEM_PATCH')
   }
}

export async function DELETE(
   req: Request,
   { params }: { params: { id: string } }
) {
   try {
      const auth = validateAuth(req)
      if (isErrorResponse(auth)) return auth

      // Delete related records first to avoid foreign key constraint errors
      await prisma.$transaction([
         // Delete ProductPrintSize first (related to ProductZone)
         prisma.productPrintSize.deleteMany({
            where: {
               ProductZone: {
                  categoryItemId: params.id
               }
            }
         }),
         // Delete ProductZone
         prisma.productZone.deleteMany({
            where: { categoryItemId: params.id }
         }),
         // Delete ProductSize
         prisma.productSize.deleteMany({
            where: { categoryItemId: params.id }
         }),
         // Delete ProductAttribute
         prisma.productAttribute.deleteMany({
            where: { categoryItemId: params.id }
         }),
         // Finally delete CategoryItem
         prisma.categoryItem.delete({
            where: { id: params.id }
         })
      ])

      return NextResponse.json({ success: true })
   } catch (error) {
      return handleApiError(error, 'CATEGORY_ITEM_DELETE')
   }
}
