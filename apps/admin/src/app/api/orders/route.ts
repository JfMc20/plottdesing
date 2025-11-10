import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { validateAuth, isErrorResponse } from '@/lib/api/auth-helper'
import { handleApiError } from '@/lib/api/error-handler'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
   try {
      const auth = validateAuth(req)
      if (isErrorResponse(auth)) return auth

      const { searchParams } = new URL(req.url)

      // Support filtering by userId, status, isPaid, isCompleted
      const filterUserId = searchParams.get('userId') || undefined
      const status = searchParams.get('status') || undefined
      const isPaid = searchParams.get('isPaid')
      const isCompleted = searchParams.get('isCompleted')

      const orders = await prisma.order.findMany({
         where: {
            ...(filterUserId && { userId: filterUserId }),
            ...(status && { status: status as any }),
            ...(isPaid !== null && isPaid !== undefined && { isPaid: isPaid === 'true' }),
            ...(isCompleted !== null && isCompleted !== undefined && { isCompleted: isCompleted === 'true' }),
         },
         include: {
            User: {
               select: {
                  id: true,
                  email: true,
                  phone: true,
                  name: true,
               },
            },
            Address: true,
            OrderItem: {
               include: {
                  Product: {
                     select: {
                        id: true,
                        title: true,
                        images: true,
                        price: true,
                        discount: true,
                     },
                  },
               },
            },
         },
         orderBy: {
            createdAt: 'desc',
         },
      })

      return NextResponse.json(orders)
   } catch (error) {
      return handleApiError(error, 'ORDERS_GET')
   }
}
