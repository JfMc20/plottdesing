import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { validateAuth, isErrorResponse } from '@/lib/api/auth-helper'
import { handleApiError } from '@/lib/api/error-handler'

export async function PATCH(
   req: Request,
   { params }: { params: { orderId: string; productId: string } }
) {
   try {
      const auth = validateAuth(req)
      if (isErrorResponse(auth)) return auth

      const body = await req.json()
      const { count } = body

      if (!count || count < 1) {
         return new NextResponse('Count must be at least 1', { status: 400 })
      }

      // Update the order item count
      const orderItem = await prisma.orderItem.update({
         where: {
            orderId_productId: {
               orderId: params.orderId,
               productId: params.productId,
            },
         },
         data: {
            count,
         },
         include: {
            Product: true,
            Order: true,
         },
      })

      return NextResponse.json(orderItem)
   } catch (error) {
      return handleApiError(error, 'ORDER_ITEM_PATCH')
   }
}

export async function DELETE(
   req: Request,
   { params }: { params: { orderId: string; productId: string } }
) {
   try {
      const auth = validateAuth(req)
      if (isErrorResponse(auth)) return auth

      // Delete the order item
      const orderItem = await prisma.orderItem.delete({
         where: {
            orderId_productId: {
               orderId: params.orderId,
               productId: params.productId,
            },
         },
      })

      return NextResponse.json(orderItem)
   } catch (error) {
      return handleApiError(error, 'ORDER_ITEM_DELETE')
   }
}
