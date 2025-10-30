import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function PATCH(
   req: Request,
   { params }: { params: { orderId: string; productId: string } }
) {
   try {
      const userId = req.headers.get('X-USER-ID')

      if (!userId) {
         return new NextResponse('Unauthorized', { status: 401 })
      }

      const body = await req.json()
      const { count } = body

      if (!count || count < 1) {
         return new NextResponse('Count must be at least 1', { status: 400 })
      }

      // Update the order item count
      const orderItem = await prisma.orderItem.update({
         where: {
            UniqueOrderItem: {
               orderId: params.orderId,
               productId: params.productId,
            },
         },
         data: {
            count,
         },
         include: {
            product: true,
            order: true,
         },
      })

      return NextResponse.json(orderItem)
   } catch (error) {
      console.error('[ORDER_ITEM_PATCH]', error)
      return new NextResponse('Internal error', { status: 500 })
   }
}

export async function DELETE(
   req: Request,
   { params }: { params: { orderId: string; productId: string } }
) {
   try {
      const userId = req.headers.get('X-USER-ID')

      if (!userId) {
         return new NextResponse('Unauthorized', { status: 401 })
      }

      // Delete the order item
      const orderItem = await prisma.orderItem.delete({
         where: {
            UniqueOrderItem: {
               orderId: params.orderId,
               productId: params.productId,
            },
         },
      })

      return NextResponse.json(orderItem)
   } catch (error) {
      console.error('[ORDER_ITEM_DELETE]', error)
      return new NextResponse('Internal error', { status: 500 })
   }
}
