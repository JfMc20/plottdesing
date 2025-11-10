import prisma from '@/lib/prisma'
import { createRefundNotification } from '@/lib/notifications'
import { NextResponse } from 'next/server'
import { validateAuth, isErrorResponse } from '@/lib/api/auth-helper'
import { handleApiError } from '@/lib/api/error-handler'
import { nanoid } from 'nanoid'

export async function POST(
   req: Request,
   { params }: { params: { orderId: string } }
) {
   try {
      const auth = validateAuth(req)
      if (isErrorResponse(auth)) return auth

      const body = await req.json()
      const { amount, reason } = body

      if (!amount || amount <= 0) {
         return new NextResponse('Amount must be greater than 0', { status: 400 })
      }

      if (!reason || reason.length < 10) {
         return new NextResponse('Reason must be at least 10 characters', { status: 400 })
      }

      // Check if order exists
      const order = await prisma.order.findUnique({
         where: { id: params.orderId },
         include: { Refund: true },
      })

      if (!order) {
         return new NextResponse('Order not found', { status: 404 })
      }

      // Check if refund already exists
      if (order.Refund) {
         return new NextResponse('Refund already exists for this order', { status: 400 })
      }

      // Validate refund amount doesn't exceed order payable
      if (amount > order.payable) {
         return new NextResponse(
            `Refund amount ($${amount}) cannot exceed order payable ($${order.payable})`,
            { status: 400 }
         )
      }

      // Create refund and update order status in a transaction
      const result = await prisma.$transaction([
         // Create refund
         prisma.refund.create({
            data: {
               id: nanoid(),
               amount,
               reason,
               orderId: params.orderId,
               updatedAt: new Date(),
            },
         }),
         // Update order status to RefundProcessing
         prisma.order.update({
            where: { id: params.orderId },
            data: {
               status: 'RefundProcessing',
            },
         }),
      ])

      const [refund, updatedOrder] = result

      // Create notification for the user
      await createRefundNotification(order.userId, order.number, amount)

      return NextResponse.json({
         refund,
         order: updatedOrder,
      })
   } catch (error) {
      return handleApiError(error, 'REFUND_POST')
   }
}
