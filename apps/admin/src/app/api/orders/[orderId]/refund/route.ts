import prisma from '@/lib/prisma'
import { createRefundNotification } from '@/lib/notifications'
import { NextResponse } from 'next/server'

export async function POST(
   req: Request,
   { params }: { params: { orderId: string } }
) {
   try {
      const userId = req.headers.get('X-USER-ID')

      if (!userId) {
         return new NextResponse('Unauthorized', { status: 401 })
      }

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
         include: { refund: true },
      })

      if (!order) {
         return new NextResponse('Order not found', { status: 404 })
      }

      // Check if refund already exists
      if (order.refund) {
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
               amount,
               reason,
               orderId: params.orderId,
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
      console.error('[REFUND_POST]', error)
      return new NextResponse('Internal error', { status: 500 })
   }
}
