import { nanoid } from 'nanoid'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'
import { validateAuth, isErrorResponse } from '@/lib/api/auth-helper'
import { handleApiError } from '@/lib/api/error-handler'

export async function POST(req: Request) {
   try {
      const auth = validateAuth(req)
      if (isErrorResponse(auth)) return auth

      const body = await req.json()

      const { 
         title, 
         description,
         images, 
         price, 
         discount, 
         stock, 
         weight, 
         width, 
         height, 
         length, 
         categoryId, 
         brandId, 
         categoryItemId, 
         isFeatured, 
         isAvailable, 
         isCustomizable,
         isPrintOnDemand 
      } = body

      if (!title) {
         return new NextResponse('Title is required', { status: 400 })
      }

      if (!images || !images.length) {
         return new NextResponse('At least one image is required', { status: 400 })
      }

      if (!price) {
         return new NextResponse('Price is required', { status: 400 })
      }

      if (!categoryId) {
         return new NextResponse('Category ID is required', { status: 400 })
      }

      if (!brandId) {
         return new NextResponse('Brand ID is required', { status: 400 })
      }

      const product = await prisma.product.create({
         data: {
            id: nanoid(),
            title,
            description: description || null,
            images,
            price,
            discount: discount || 0,
            stock: stock || 0,
            weight: weight || null,
            width: width || null,
            height: height || null,
            length: length || null,
            categoryItemId: categoryItemId || null,
            isCustomizable: isCustomizable ?? false,
            isPrintOnDemand: isPrintOnDemand ?? false,
            brandId,
            isFeatured: isFeatured || false,
            isAvailable: isAvailable || false,
            updatedAt: new Date(),
            categories: {
               connect: {
                  id: categoryId,
               },
            },
         },
      })

      revalidatePath('/products')
      return NextResponse.json(product)
   } catch (error) {
      return handleApiError(error, 'PRODUCTS_POST')
   }
}

export async function GET(req: Request) {
   try {
      const auth = validateAuth(req)
      if (isErrorResponse(auth)) return auth

      const { searchParams } = new URL(req.url)
      const categoryId = searchParams.get('categoryId') || undefined
      const isFeatured = searchParams.get('isFeatured')

      const products = await prisma.product.findMany({
         where: {
            isArchived: false,
         },
      })

      return NextResponse.json(products)
   } catch (error) {
      return handleApiError(error, 'PRODUCTS_GET')
   }
}
