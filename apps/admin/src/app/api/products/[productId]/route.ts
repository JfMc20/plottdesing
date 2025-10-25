import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(
   req: Request,
   { params }: { params: { productId: string } }
) {
   try {
      const userId = req.headers.get('X-USER-ID')

      if (!userId) {
         return new NextResponse('Unauthorized', { status: 401 })
      }

      if (!params.productId) {
         return new NextResponse('Product id is required', { status: 400 })
      }

      const product = await prisma.product.findUniqueOrThrow({
         where: {
            id: params.productId,
         },
      })

      return NextResponse.json(product)
   } catch (error) {
      console.error('[PRODUCT_GET]', error)
      return new NextResponse('Internal error', { status: 500 })
   }
}

export async function DELETE(
   req: Request,
   { params }: { params: { productId: string } }
) {
   try {
      const userId = req.headers.get('X-USER-ID')

      if (!userId) {
         return new NextResponse('Unauthorized', { status: 401 })
      }

      // Check if product has related orders
      const productWithOrders = await prisma.product.findUnique({
         where: { id: params.productId },
         include: {
            orders: true,
            cartItems: true,
            productReviews: true,
         },
      })

      if (!productWithOrders) {
         return new NextResponse('Product not found', { status: 404 })
      }

      if (productWithOrders.orders.length > 0) {
         // Archive instead of delete if has orders
         const archivedProduct = await prisma.product.update({
            where: { id: params.productId },
            data: {
               isArchived: true,
               isAvailable: false,
            },
         })
         return NextResponse.json({
            ...archivedProduct,
            archived: true,
            message: 'Product archived due to existing orders',
         })
      }

      // Delete related cart items and reviews first
      await prisma.cartItem.deleteMany({
         where: { productId: params.productId },
      })

      await prisma.productReview.deleteMany({
         where: { productId: params.productId },
      })

      // Disconnect many-to-many relationships
      await prisma.product.update({
         where: { id: params.productId },
         data: {
            categories: { set: [] },
            wishlists: { set: [] },
         },
      })

      // Now delete the product
      const product = await prisma.product.delete({
         where: {
            id: params.productId},
      })

      return NextResponse.json(product)
   } catch (error) {
      console.error('[PRODUCT_DELETE]', error)
      return new NextResponse('Internal error', { status: 500 })
   }
}

export async function PATCH(
   req: Request,
   { params }: { params: { productId: string } }
) {
   try {
      if (!params.productId) {
         return new NextResponse('Product Id is required', { status: 400 })
      }

      const userId = req.headers.get('X-USER-ID')

      if (!userId) {
         return new NextResponse('Unauthorized', { status: 401 })
      }

      const body = await req.json()
      const { title, images, price, discount, stock, weight, width, height, length, categoryId, brandId, isFeatured, isAvailable } = body

      const updateData: any = {
         title,
         price,
         discount,
         stock,
         isFeatured,
         isAvailable,
      }

      // Update images if provided
      if (images !== undefined) {
         updateData.images = images
      }

      // Update weight and dimensions if provided
      if (weight !== undefined) {
         updateData.weight = weight || null
      }
      if (width !== undefined) {
         updateData.width = width || null
      }
      if (height !== undefined) {
         updateData.height = height || null
      }
      if (length !== undefined) {
         updateData.length = length || null
      }

      // Update category if provided
      if (categoryId) {
         updateData.categories = {
            set: [],
            connect: { id: categoryId },
         }
      }

      // Update brand if provided
      if (brandId) {
         updateData.brand = {
            connect: { id: brandId },
         }
      }

      const product = await prisma.product.update({
         where: {
            id: params.productId,
         },
         data: updateData,
      })

      return NextResponse.json(product)
   } catch (error) {
      console.error('[PRODUCT_PATCH]', error)
      return new NextResponse('Internal error', { status: 500 })
   }
}
