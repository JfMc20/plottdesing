import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
   try {
      const userId = req.headers.get('X-USER-ID')

      if (!userId) {
         return new NextResponse('Unauthorized', { status: 401 })
      }

      const body = await req.json()

      const { title, images, price, discount, stock, weight, width, height, length, categoryId, brandId, isFeatured, isAvailable } = body

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
            title,
            images,
            price,
            discount: discount || 0,
            stock: stock || 0,
            weight: weight || null,
            width: width || null,
            height: height || null,
            length: length || null,
            brand: {
               connect: {
                  id: brandId,
               },
            },
            categories: {
               connect: {
                  id: categoryId,
               },
            },
            isFeatured: isFeatured || false,
            isAvailable: isAvailable || false,
         },
      })

      revalidatePath('/products')
      return NextResponse.json(product)
   } catch (error) {
      console.error('[PRODUCTS_POST]', error)
      return new NextResponse('Internal error', { status: 500 })
   }
}

export async function GET(req: Request) {
   try {
      const userId = req.headers.get('X-USER-ID')

      if (!userId) {
         return new NextResponse('Unauthorized', { status: 401 })
      }

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
      console.error('[PRODUCTS_GET]', error)
      return new NextResponse('Internal error', { status: 500 })
   }
}
