import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'

export async function GET(
   req: Request,
   { params }: { params: { brandId: string } }
) {
   try {
      const userId = req.headers.get('X-USER-ID')

      if (!userId) {
         return new NextResponse('Unauthorized', { status: 401 })
      }

      if (!params.brandId) {
         return new NextResponse('Brand id is required', { status: 400 })
      }

      const brand = await prisma.brand.findUnique({
         where: {
            id: params.brandId,
         },
      })

      return NextResponse.json(brand)
   } catch (error) {
      console.error('[BRAND_GET]', error)
      return new NextResponse('Internal error', { status: 500 })
   }
}

export async function DELETE(
   req: Request,
   { params }: { params: { brandId: string } }
) {
   try {
      const userId = req.headers.get('X-USER-ID')

      if (!userId) {
         return new NextResponse('Unauthorized', { status: 401 })
      }

      if (!params.brandId) {
         return new NextResponse('Brand id is required', { status: 400 })
      }

      // Check if brand has products
      const brandWithProducts = await prisma.brand.findUnique({
         where: { id: params.brandId },
         include: { products: true },
      })

      if (!brandWithProducts) {
         return new NextResponse('Brand not found', { status: 404 })
      }

      if (brandWithProducts.products.length > 0) {
         return new NextResponse(
            'Cannot delete brand with existing products. Please delete or reassign products first.',
            { status: 400 }
         )
      }

      const brand = await prisma.brand.delete({
         where: {
            id: params.brandId,
         },
      })

      revalidatePath('/brands')
      return NextResponse.json(brand)
   } catch (error) {
      console.error('[BRAND_DELETE]', error)
      return new NextResponse('Internal error', { status: 500 })
   }
}

export async function PATCH(
   req: Request,
   { params }: { params: { brandId: string } }
) {
   try {
      const userId = req.headers.get('X-USER-ID')

      if (!userId) {
         return new NextResponse('Unauthorized', { status: 401 })
      }

      const body = await req.json()

      const { title, description, color } = body

      if (!title && !description && color === undefined) {
         return new NextResponse(
            'At least one field is required',
            { status: 400 }
         )
      }

      if (!params.brandId) {
         return new NextResponse('Brand id is required', { status: 400 })
      }

      const updatedBrand = await prisma.brand.update({
         where: {
            id: params.brandId,
         },
         data: {
            ...(title && { title }),
            ...(description !== undefined && { description }),
            ...(color !== undefined && { color }),
         },
      })

      revalidatePath('/brands')
      return NextResponse.json(updatedBrand)
   } catch (error) {
      console.error('[BRAND_PATCH]', error)
      return new NextResponse('Internal error', { status: 500 })
   }
}
