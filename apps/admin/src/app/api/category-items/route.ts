import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req: Request) {
   try {
      const userId = req.headers.get('X-USER-ID')

      if (!userId) {
         return new NextResponse('Unauthorized', { status: 401 })
      }

      const body = await req.json()
      const {
         categoryId,
         name,
         description,
         skuPattern,
         basePrice,
         sizes,
         zones,
         attributes,
      } = body

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

      const categoryItem = await prisma.categoryItem.create({
         data: {
            categoryId,
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
      console.error('[CATEGORY_ITEMS_POST]', error)
      return new NextResponse('Internal error', { status: 500 })
   }
}

export async function GET(req: Request) {
   try {
      const { searchParams } = new URL(req.url)
      const categoryId = searchParams.get('categoryId')

      const categoryItems = await prisma.categoryItem.findMany({
         where: categoryId ? { categoryId } : undefined,
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

      return NextResponse.json(categoryItems)
   } catch (error) {
      console.error('[CATEGORY_ITEMS_GET]', error)
      return new NextResponse('Internal error', { status: 500 })
   }
}
