import prisma from '@/lib/prisma'
import { createOrderNotification, createPaymentNotification } from '@/lib/notifications'
import { OrderStatusEnum } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'

export async function GET(
   req: Request,
   { params }: { params: { orderId: string } }
) {
   try {
      const userId = req.headers.get('X-USER-ID')

      if (!userId) {
         return new NextResponse('Unauthorized', { status: 401 })
      }

      const order = await prisma.order.findUnique({
         where: {
            id: params.orderId,
         },
         include: {
            user: {
               select: {
                  id: true,
                  email: true,
                  phone: true,
                  name: true,
               },
            },
            address: true,
            orderItems: {
               include: {
                  product: {
                     select: {
                        id: true,
                        title: true,
                        description: true,
                        images: true,
                        price: true,
                        discount: true,
                        stock: true,
                     },
                  },
               },
            },
            payments: {
               include: {
                  provider: true,
               },
            },
            refund: true,
            discountCode: true,
         },
      })

      if (!order) {
         return new NextResponse('Order not found', { status: 404 })
      }

      return NextResponse.json(order)
   } catch (error) {
      console.error('[ORDER_GET]', error)
      return new NextResponse('Internal error', { status: 500 })
   }
}

export async function PATCH(
   req: Request,
   { params }: { params: { orderId: string } }
) {
   try {
      const userId = req.headers.get('X-USER-ID')

      if (!userId) {
         return new NextResponse('Unauthorized', { status: 401 })
      }

      const body = await req.json()

      // Extract allowed fields for update
      const {
         status,
         total,
         shipping,
         payable,
         tax,
         discount,
         isPaid,
         isCompleted,
         addressId,
         discountCodeId,
      } = body

      // Validate status if provided
      if (status && !Object.values(OrderStatusEnum).includes(status)) {
         return new NextResponse('Invalid order status', { status: 400 })
      }

      // Get current order to track changes
      const currentOrder = await prisma.order.findUnique({
         where: { id: params.orderId },
         select: {
            status: true,
            isPaid: true,
            userId: true,
            number: true,
            payable: true,
         },
      })

      if (!currentOrder) {
         return new NextResponse('Order not found', { status: 404 })
      }

      // Build update data object with only provided fields
      const updateData: any = {}

      if (status !== undefined) updateData.status = status
      if (total !== undefined) updateData.total = total
      if (shipping !== undefined) updateData.shipping = shipping
      if (payable !== undefined) updateData.payable = payable
      if (tax !== undefined) updateData.tax = tax
      if (discount !== undefined) updateData.discount = discount
      if (isPaid !== undefined) updateData.isPaid = isPaid
      if (isCompleted !== undefined) updateData.isCompleted = isCompleted
      if (addressId !== undefined) updateData.addressId = addressId
      if (discountCodeId !== undefined) updateData.discountCodeId = discountCodeId

      const order = await prisma.order.update({
         where: {
            id: params.orderId,
         },
         data: updateData,
         include: {
            user: {
               select: {
                  id: true,
                  email: true,
                  phone: true,
                  name: true,
               },
            },
            address: true,
            orderItems: {
               include: {
                  product: {
                     select: {
                        id: true,
                        title: true,
                        description: true,
                        images: true,
                        price: true,
                        discount: true,
                        stock: true,
                     },
                  },
               },
            },
            payments: {
               include: {
                  provider: true,
               },
            },
            refund: true,
            discountCode: true,
         },
      })

      // Create notifications for changes
      // Status change notification
      if (status && status !== currentOrder.status) {
         await createOrderNotification({
            userId: currentOrder.userId,
            orderId: params.orderId,
            orderNumber: currentOrder.number,
            oldStatus: currentOrder.status,
            newStatus: status,
         })
      }

      // Payment notification (when isPaid changes from false to true)
      if (isPaid === true && currentOrder.isPaid === false) {
         await createPaymentNotification(
            currentOrder.userId,
            currentOrder.number,
            currentOrder.payable
         )
      }

      return NextResponse.json(order)
   } catch (error) {
      console.error('[ORDER_PATCH]', error)
      return new NextResponse('Internal error', { status: 500 })
   }
}
