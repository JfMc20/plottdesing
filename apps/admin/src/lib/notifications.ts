import prisma from '@/lib/prisma'
import { OrderStatusEnum } from '@prisma/client'
import { nanoid } from 'nanoid'

interface CreateOrderNotificationParams {
   userId: string
   orderId: string
   orderNumber: number
   oldStatus?: OrderStatusEnum
   newStatus: OrderStatusEnum
}

/**
 * Get notification message based on order status change
 */
function getStatusChangeMessage(
   orderNumber: number,
   oldStatus: OrderStatusEnum | undefined,
   newStatus: OrderStatusEnum
): string {
   const orderRef = `Order #${orderNumber}`

   // If no old status, this is a new order
   if (!oldStatus) {
      return `${orderRef} has been created and is being processed.`
   }

   // Status-specific messages
   const messages: Record<OrderStatusEnum, string> = {
      Processing: `${orderRef} is now being processed.`,
      Shipped: `${orderRef} has been shipped! It's on its way to you.`,
      Delivered: `${orderRef} has been delivered. Enjoy your purchase!`,
      ReturnProcessing: `${orderRef} return is being processed.`,
      ReturnCompleted: `${orderRef} return has been completed.`,
      Cancelled: `${orderRef} has been cancelled.`,
      RefundProcessing: `${orderRef} refund is being processed.`,
      RefundCompleted: `${orderRef} refund has been completed.`,
      Denied: `${orderRef} has been denied.`,
   }

   return messages[newStatus] || `${orderRef} status updated to ${newStatus}.`
}

/**
 * Create a notification for order status change
 */
export async function createOrderNotification(
   params: CreateOrderNotificationParams
): Promise<void> {
   const { userId, orderId, orderNumber, oldStatus, newStatus } = params

   try {
      const message = getStatusChangeMessage(orderNumber, oldStatus, newStatus)

      await prisma.notification.create({
         data: {
            id: nanoid(),
            userId,
            content: message,
            isRead: false,
            updatedAt: new Date(),
         },
      })

      console.log(
         `[NOTIFICATION] Created for user ${userId}: ${message}`
      )
   } catch (error) {
      console.error('[NOTIFICATION_ERROR]', error)
      // Don't throw - notification failure shouldn't break order update
   }
}

/**
 * Create notification for refund
 */
export async function createRefundNotification(
   userId: string,
   orderNumber: number,
   amount: number
): Promise<void> {
   try {
      const message = `A refund of $${amount.toFixed(2)} has been initiated for Order #${orderNumber}.`

      await prisma.notification.create({
         data: {
            id: nanoid(),
            userId,
            content: message,
            isRead: false,
            updatedAt: new Date(),
         },
      })

      console.log(
         `[NOTIFICATION] Refund notification created for user ${userId}`
      )
   } catch (error) {
      console.error('[REFUND_NOTIFICATION_ERROR]', error)
   }
}

/**
 * Create notification for payment received
 */
export async function createPaymentNotification(
   userId: string,
   orderNumber: number,
   amount: number
): Promise<void> {
   try {
      const message = `Payment of $${amount.toFixed(2)} received for Order #${orderNumber}. Thank you!`

      await prisma.notification.create({
         data: {
            id: nanoid(),
            userId,
            content: message,
            isRead: false,
            updatedAt: new Date(),
         },
      })

      console.log(
         `[NOTIFICATION] Payment notification created for user ${userId}`
      )
   } catch (error) {
      console.error('[PAYMENT_NOTIFICATION_ERROR]', error)
   }
}
