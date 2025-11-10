import { NextResponse } from 'next/server'
import { nanoid } from 'nanoid'
import prisma from '@/lib/prisma'
import { validateAuth, isErrorResponse } from '@/lib/api/auth-helper'
import { handleApiError } from '@/lib/api/error-handler'

export async function POST(req: Request) {
   try {
      const auth = validateAuth(req)
      if (isErrorResponse(auth)) return auth

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

      // Validate required fields
      if (!categoryId || !name) {
         return NextResponse.json(
            { error: 'Missing required fields: categoryId and name' },
            { status: 400 }
         )
      }

      // Limpiar y convertir tipos
      const cleanSizes = sizes?.map(({ id, categoryItemId, createdAt, updatedAt, ...rest }: any) => ({
         id: nanoid(),
         ...rest,
         updatedAt: new Date(),
      })) || []
      const cleanZones = zones?.map(({ id, categoryItemId, createdAt, updatedAt, printSizes, ...rest }: any) => ({
         id: nanoid(),
         ...rest,
         updatedAt: new Date(),
         ProductPrintSize: printSizes ? {
            create: printSizes.map(({ id, productZoneId, createdAt, updatedAt, ...ps }: any) => ({
               id: nanoid(),
               name: ps.name || '',
               width: parseInt(ps.width) || 0,
               height: parseInt(ps.height) || 0,
               reference: ps.reference || '',
               area: parseFloat(ps.area) || 0,
               costPerMeter: ps.costPerMeter ? parseFloat(ps.costPerMeter) : 0,
               printingCost: ps.printingCost ? parseFloat(ps.printingCost) : 0,
               updatedAt: new Date(),
            }))
         } : undefined
      })) || []
      const cleanAttributes = attributes?.map(({ id, categoryItemId, createdAt, updatedAt, ...rest }: any) => ({
         id: nanoid(),
         ...rest,
         updatedAt: new Date(),
      })) || []

      const categoryItem = await prisma.categoryItem.create({
         data: {
            id: nanoid(),
            categoryId,
            name,
            description: description || null,
            skuPattern: skuPattern || null,
            basePrice: basePrice ? parseFloat(basePrice) : null,
            updatedAt: new Date(),
            ProductSize: cleanSizes.length > 0 ? { create: cleanSizes } : undefined,
            ProductZone: cleanZones.length > 0 ? { create: cleanZones } : undefined,
            ProductAttribute: cleanAttributes.length > 0 ? { create: cleanAttributes } : undefined,
         },
         include: {
            ProductSize: true,
            ProductZone: { include: { ProductPrintSize: true } },
            ProductAttribute: true,
         },
      })

      return NextResponse.json(categoryItem)
   } catch (error) {
      console.error('[CATEGORY_ITEMS_POST]', error)
      return NextResponse.json(
         { error: error instanceof Error ? error.message : 'Internal error' },
         { status: 500 }
      )
   }
}

export async function GET(req: Request) {
   try {
      const { searchParams } = new URL(req.url)
      const categoryId = searchParams.get('categoryId')

      const categoryItems = await prisma.categoryItem.findMany({
         where: categoryId ? { categoryId } : undefined,
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

      return NextResponse.json(categoryItems)
   } catch (error) {
      console.error('[CATEGORY_ITEMS_GET]', error)
      return NextResponse.json(
         { error: error instanceof Error ? error.message : 'Internal error' },
         { status: 500 }
      )
   }
}

